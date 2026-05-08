'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CalendarDays, 
  Users, 
  Bell, 
  Search,
  Check,
  Calendar,
  BookOpen,
  Clock,
  PartyPopper,
  Pin,
  MapPin,
  AlignLeft,
  ChevronDown
} from 'lucide-react';
import { format, parseISO, startOfDay } from 'date-fns';
import type { CalendarEvent } from '@/types';

type EventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: CalendarEvent | null;
  selectedDate?: string;
  employees?: any[];
};

const CATEGORY_OPTIONS = [
  { value: 'meeting',  label: 'Rapat / Meeting', icon: Calendar },
  { value: 'training', label: 'Training',         icon: BookOpen },
  { value: 'deadline', label: 'Deadline',         icon: Clock },
  { value: 'social',   label: 'Acara Sosial',     icon: PartyPopper },
  { value: 'other',    label: 'Lainnya',          icon: Pin },
];

const EVENT_COLORS = [
  '#F26B8A', '#3863C3', '#0E7490', '#10B981',
  '#F59E0B', '#C0392B', '#5FA89B', '#6366F1',
];

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  selectedDate,
  employees = [],
}: EventModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    category: 'meeting' as string,
    color: '#059669',
    departments: [] as string[],
    attendees: [] as string[],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title:       initialData.title || '',
        description: initialData.description || '',
        location:    initialData.location || '',
        startDate:   initialData.startDate
          ? format(parseISO(initialData.startDate), "yyyy-MM-dd'T'HH:mm")
          : '',
        endDate: initialData.endDate
          ? format(parseISO(initialData.endDate), "yyyy-MM-dd'T'HH:mm")
          : '',
        category:    initialData.category || 'meeting',
        color:       initialData.color || '#059669',
        departments: initialData.departments || [],
        attendees:   initialData.attendees || [],
      });
    } else if (selectedDate) {
      const base = startOfDay(parseISO(selectedDate));
      setForm((prev) => ({
        ...prev,
        title: '',
        description: '',
        location: '',
        departments: [],
        attendees: [],
        category: 'meeting',
        color: '#059669',
        startDate: format(base, "yyyy-MM-dd'T'09:00"),
        endDate:   format(base, "yyyy-MM-dd'T'10:00"),
      }));
    }
  }, [initialData, selectedDate, isOpen]);

  const toggleDept = (dept: string) => {
    setForm((prev) => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter((d) => d !== dept)
        : [...prev.departments, dept],
    }));
  };

  const toggleEmployee = (empId: string) => {
    setForm((prev) => ({
      ...prev,
      attendees: prev.attendees.includes(empId)
        ? prev.attendees.filter((id) => id !== empId)
        : [...prev.attendees, empId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      startDate: new Date(form.startDate).toISOString(),
      endDate:   new Date(form.endDate).toISOString(),
      organizerId: 'admin',
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-6 sm:p-12 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="w-full max-w-2xl overflow-hidden rounded-[3rem] border border-(--border-color) shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] z-10 relative"
          style={{ background: 'var(--bg-card)', maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-(--border-color) px-10 py-8 bg-(--bg-card)/80 backdrop-blur-md">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--accent-primary) text-white shadow-xl shadow-(--accent-primary)/20">
                <CalendarDays size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-(--text-primary)">
                  {initialData ? 'Edit Agenda' : 'Buat Agenda Baru'}
                </h3>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-(--text-secondary) opacity-50">
                  {form.category === 'meeting' && (form.departments.length > 0 || form.attendees.length > 0)
                    ? `Notifikasi otomatis aktif`
                    : 'Detail acara & notifikasi'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-(--border-color) bg-(--bg-main) text-(--text-primary) transition-all hover:bg-rose-500 hover:text-white hover:border-rose-500 active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-10 p-10">
            {/* Title */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-(--text-primary) opacity-40 ml-2">
                JUDUL AGENDA *
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-(--text-secondary) opacity-40 group-focus-within:text-(--accent-primary) group-focus-within:opacity-100 transition-all">
                  <AlignLeft size={20} />
                </div>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Rapat Koordinasi Bulanan..."
                  className="w-full rounded-2xl border border-(--border-color) bg-(--bg-main) py-6 pl-16 pr-8 text-base font-bold text-(--text-primary) transition-all focus:ring-4 focus:ring-(--accent-primary)/10 outline-none placeholder:opacity-20 uppercase"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-(--text-primary) opacity-40 ml-2">
                KATEGORI
              </label>
              <div className="flex flex-wrap gap-4">
                {CATEGORY_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const isActive = form.category === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, category: value }))}
                      className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                        isActive 
                          ? 'border-(--accent-primary) bg-(--accent-primary)/10 text-(--accent-primary) shadow-lg shadow-(--accent-primary)/10' 
                          : 'border-(--border-color) bg-(--bg-main) text-(--text-secondary) opacity-40 hover:opacity-100'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Departments — only for meeting */}
            {form.category === 'meeting' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-(--text-primary) opacity-40 ml-2">
                      TARGET UNIT / DEPARTEMEN
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {['Rider Martapura', 'Inbound', 'Outbound', 'Office'].map((dept) => {
                        const active = form.departments.includes(dept);
                        return (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => toggleDept(dept)}
                            className={`flex items-center gap-4 rounded-2xl border-2 px-6 py-4 text-left transition-all duration-300 ${
                              active
                                ? 'border-(--accent-primary) bg-(--accent-primary)/10 text-(--text-primary) shadow-lg shadow-(--accent-primary)/10'
                                : 'border-(--border-color) bg-(--bg-main) text-(--text-secondary) opacity-40 hover:opacity-100'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 transition-all ${active ? 'bg-(--accent-primary) border-(--accent-primary)' : 'border-(--border-color)'}`}>
                              {active && <Check size={10} className="text-white mx-auto" />}
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest truncate">{dept}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 ml-2">
                      <Users size={16} className="text-(--accent-primary)" />
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-(--text-primary) opacity-40">
                        UNDANG KARYAWAN SPESIFIK
                      </label>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-(--text-secondary) opacity-40 group-focus-within:text-(--accent-primary) group-focus-within:opacity-100 transition-all">
                        <Search size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder="Cari nama karyawan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-2xl border border-(--border-color) bg-(--bg-main) py-5 pl-14 pr-8 text-sm font-bold text-(--text-primary) outline-none focus:ring-4 focus:ring-(--accent-primary)/10 transition-all placeholder:opacity-20 uppercase"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {employees
                        .filter((emp) => emp.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((emp) => {
                          const active = form.attendees.includes(emp.id);
                          return (
                            <button
                              key={emp.id}
                              type="button"
                              onClick={() => toggleEmployee(emp.id)}
                              className={`w-full flex items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-300 ${
                                active
                                  ? 'border-(--accent-primary) bg-(--accent-primary)/10 text-(--text-primary)'
                                  : 'border-(--border-color) bg-(--bg-main) text-(--text-secondary) hover:bg-(--bg-card)'
                              }`}
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <div className={`w-4 h-4 rounded-md border-2 transition-all flex items-center justify-center ${active ? 'bg-(--accent-primary) border-(--accent-primary)' : 'border-(--border-color)'}`}>
                                  {active && <Check size={10} className="text-white" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-black uppercase truncate tracking-tight">{emp.name}</p>
                                  <p className="text-[9px] font-bold uppercase opacity-40 tracking-widest">{emp.department}</p>
                                </div>
                              </div>
                              {active && <div className="text-[10px] font-black text-(--accent-primary)">TERPILIH</div>}
                            </button>
                          );
                        })}
                    </div>
                  </div>

                {(form.departments.length > 0 || form.attendees.length > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-start gap-5 rounded-3xl border-2 p-6 bg-(--accent-primary)/10 border-(--accent-primary)/20 shadow-xl shadow-(--accent-primary)/5"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-3xl bg-(--accent-primary) flex items-center justify-center text-white shadow-lg shadow-(--accent-primary)/20">
                      <Bell size={18} />
                    </div>
                    <p className="text-[11px] font-bold italic leading-relaxed text-(--text-primary) opacity-80 uppercase">
                      <span className="text-(--accent-primary) font-black uppercase not-italic">Push Notifikasi Otomatis:</span><br/>
                      Akan dikirim ke {form.departments.length} unit dan {form.attendees.length} kurir terpilih pada <span className="text-(--accent-primary)">-24 jam</span> & <span className="text-(--accent-primary)">-30 menit</span> sebelum agenda.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Date range */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-(--text-primary) opacity-40 ml-2">
                  WAKTU MULAI *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full rounded-2xl border border-(--border-color) bg-(--bg-main) py-5 px-8 text-sm font-bold text-(--text-primary) outline-none focus:ring-4 focus:ring-(--accent-primary)/10 transition-all appearance-none"
                    required
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-(--text-secondary) opacity-40 pointer-events-none">
                    <Calendar size={18} />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-(--text-primary) opacity-40 ml-2">
                  WAKTU SELESAI *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full rounded-2xl border border-(--border-color) bg-(--bg-main) py-5 px-8 text-sm font-bold text-(--text-primary) outline-none focus:ring-4 focus:ring-(--accent-primary)/10 transition-all appearance-none"
                    required
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-(--text-secondary) opacity-40 pointer-events-none">
                    <Clock size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-(--text-primary) opacity-40 ml-2">
                DESKRIPSI AGENDA
              </label>
              <div className="relative">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detail agenda rapat, catatan penting, dsb..."
                  className="w-full rounded-2xl border border-(--border-color) bg-(--bg-main) p-8 text-sm font-bold text-(--text-primary) outline-none focus:ring-4 focus:ring-(--accent-primary)/10 transition-all resize-none leading-relaxed placeholder:opacity-20 uppercase"
                  rows={4}
                />
                <div className="absolute right-6 bottom-6 text-(--text-secondary) opacity-40">
                  <AlignLeft size={18} />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-(--text-primary) opacity-40 ml-2">
                LOKASI / LINK MEETING
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-(--text-secondary) opacity-40 group-focus-within:text-(--accent-primary) group-focus-within:opacity-100 transition-all">
                  <MapPin size={20} />
                </div>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Nama ruangan, link Google Meet, dsb..."
                  className="w-full rounded-2xl border border-(--border-color) bg-(--bg-main) py-6 pl-16 pr-8 text-sm font-bold text-(--text-primary) outline-none focus:ring-4 focus:ring-(--accent-primary)/10 transition-all placeholder:opacity-20 uppercase"
                />
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-(--text-primary) opacity-40 ml-2">
                WARNA LABEL AGENDA
              </label>
              <div className="flex flex-wrap gap-5">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, color: c }))}
                    className="h-12 w-12 rounded-2xl transition-all duration-300 relative group"
                    style={{
                      background: c,
                      transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: form.color === c ? `0 10px 25px -5px ${c}60` : 'none'
                    }}
                  >
                    {form.color === c && (
                      <motion.div layoutId="color-check" className="absolute inset-0 flex items-center justify-center text-white">
                        <Check size={24} strokeWidth={3} />
                      </motion.div>
                    )}
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-6 pt-8">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border-2 border-(--border-color) bg-(--bg-main) py-6 text-xs font-black uppercase tracking-[0.2em] text-(--text-primary) opacity-40 transition-all hover:opacity-100 hover:bg-(--bg-card) active:scale-95"
              >
                Batalkan
              </button>
              <button
                type="submit"
                className="flex-2 rounded-2xl bg-(--accent-primary) py-6 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-(--accent-primary)/40 transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-4"
              >
                <Check size={18} />
                {initialData ? 'SIMPAN PERUBAHAN' : 'BUAT AGENDA SEKARANG'}
              </button>
            </div>
          </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
