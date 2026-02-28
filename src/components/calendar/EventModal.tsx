'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarDays, Users, Bell } from 'lucide-react';
import { format, parseISO, startOfDay } from 'date-fns';
import type { CalendarEvent } from '@/types';
import { DEPARTMENTS } from '@/types';

type EventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: CalendarEvent | null;
  selectedDate?: string;
  employees?: any[];
};

const CATEGORY_OPTIONS = [
  { value: 'meeting',  label: 'Rapat / Meeting', icon: '🗓️' },
  { value: 'training', label: 'Training',         icon: '📚' },
  { value: 'deadline', label: 'Deadline',         icon: '⏰' },
  { value: 'social',   label: 'Acara Sosial',     icon: '🎉' },
  { value: 'other',    label: 'Lainnya',          icon: '📌' },
];

const EVENT_COLORS = [
  '#43237F', '#3863C3', '#0891B2', '#16A34A',
  '#D97706', '#C0392B', '#7C3AED', '#0EA5E9',
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
    color: '#43237F',
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
        color:       initialData.color || '#43237F',
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
        color: '#43237F',
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10"
          style={{ background: '#0F172A', maxHeight: '92vh', overflowY: 'auto' }}
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 px-6 py-5"
            style={{ background: '#0F172A' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#43237F30' }}>
                <CalendarDays size={17} style={{ color: '#a87fd6' }} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {initialData ? 'Edit Acara' : 'Buat Acara Baru'}
                </h3>
                <p className="text-[10px]" style={{ color: '#9BA4B4' }}>
                  {form.category === 'meeting' && (form.departments.length > 0 || form.attendees.length > 0)
                    ? `Notifikasi otomatis → ${form.departments.length} dep, ${form.attendees.length} orang`
                    : 'Isi detail acara di bawah'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-white"
            >
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                Judul *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Rapat bulanan SCO"
                className="w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-[#43237F]/60 focus:ring-2 focus:ring-[#43237F]/20"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                Kategori
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: value }))}
                    className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all"
                    style={
                      form.category === value
                        ? { background: '#43237F', borderColor: '#43237F', color: '#fff' }
                        : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#9BA4B4' }
                    }
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Departments — only for meeting */}
            {form.category === 'meeting' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 mt-4">
                  <Users size={13} style={{ color: '#a87fd6' }} />
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                    Karyawan yang diundang (Opsional)
                  </label>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Cari nama karyawan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2 text-xs text-white placeholder-white/20 outline-none"
                  />
                  <div className="max-h-[120px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {employees
                      .filter((emp) => emp.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((emp) => {
                        const active = form.attendees.includes(emp.id);
                        return (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => toggleEmployee(emp.id)}
                            className="w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-[11px] font-medium transition-all"
                            style={
                              active
                                ? { background: 'rgba(67,35,127,0.2)', borderColor: 'rgba(67,35,127,0.5)', color: '#d4b8ff' }
                                : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: '#9BA4B4' }
                            }
                          >
                            <span className="truncate">{emp.name} ({emp.department})</span>
                            {active && <span className="text-[10px]">✓</span>}
                          </button>
                        );
                      })}
                  </div>
                </div>

                {(form.departments.length > 0 || form.attendees.length > 0) && (
                  <div className="flex items-start gap-2 rounded-xl border border-[#43237F]/20 bg-[#43237F]/8 p-3 mt-2">
                    <Bell size={12} className="mt-0.5 shrink-0" style={{ color: '#a87fd6' }} />
                    <p className="text-[11px] leading-relaxed" style={{ color: '#a87fd6' }}>
                      Notifikasi push otomatis akan dikirim ke {form.departments.length} departemen dan {form.attendees.length} karyawan —
                      <strong> 1 hari sebelum</strong> dan <strong>30 menit sebelum</strong> meeting dimulai.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                  Mulai *
                </label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-xs text-white outline-none focus:border-[#43237F]/60"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                  Selesai *
                </label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-xs text-white outline-none focus:border-[#43237F]/60"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                Deskripsi
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Agenda rapat, catatan penting, dsb."
                className="w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-[#43237F]/60"
                rows={3}
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                Lokasi
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Nama ruangan, link Google Meet, dsb."
                className="w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-[#43237F]/60"
              />
            </div>

            {/* Color picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                Warna acara
              </label>
              <div className="flex flex-wrap gap-2">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, color: c }))}
                    className="h-8 w-8 rounded-xl transition-transform"
                    style={{
                      background: c,
                      transform: form.color === c ? 'scale(1.25)' : 'scale(1)',
                      outline: form.color === c ? `3px solid ${c}` : 'transparent',
                      outlineOffset: 3,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 bg-white/4 py-2.5 text-sm font-semibold text-white/70 transition-all hover:bg-white/8"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #43237F 0%, #5a2fa8 100%)' }}
              >
                {initialData ? 'Simpan Perubahan' : 'Buat Acara'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
