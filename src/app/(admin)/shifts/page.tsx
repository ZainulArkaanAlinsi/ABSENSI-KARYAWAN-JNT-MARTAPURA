'use client';

import { useState, useEffect } from 'react';
import { Clock, Plus, Users, Calendar, Moon, Sun, Settings2, Loader2, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

interface ShiftTemplate {
  id: string;
  name: string;
  checkIn: string;
  checkOut: string;
  workDays: string[];
  toleranceMinutes: number;
  employeeCount?: number;
}

const SHIFT_ICON_MAP: Record<string, any> = {
  pagi: Sun,
  sore: Settings2,
  malam: Moon,
};

const SHIFT_COLOR_MAP: Record<string, string> = {
  0: '#10B981',
  1: '#F59E0B',
  2: '#6366F1',
  3: '#EF4444',
  4: '#3B82F6',
};

const DAY_LABELS: Record<string, string> = {
  monday: 'Senin', tuesday: 'Selasa', wednesday: 'Rabu',
  thursday: 'Kamis', friday: 'Jumat', saturday: 'Sabtu', sunday: 'Minggu',
};

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<ShiftTemplate[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load shift templates from Firestore
    const unsubShifts = onSnapshot(collection(db, 'shifts'), async (snap) => {
      const templates: ShiftTemplate[] = snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name || 'Shift',
        checkIn: d.data().checkIn || d.data().startTime || '08:00',
        checkOut: d.data().checkOut || d.data().endTime || '17:00',
        workDays: d.data().workDays || [],
        toleranceMinutes: d.data().toleranceMinutes || 15,
      }));

      // Count employees per shift
      const withCounts = await Promise.all(
        templates.map(async (t) => {
          const empSnap = await import('firebase/firestore').then(({ getDocs, query: q, collection: col, where: w }) =>
            getDocs(q(col(db, 'users'), w('jamKerjaId', '==', t.id)))
          );
          return { ...t, employeeCount: empSnap.size };
        }),
      );

      setShifts(withCounts);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubShifts();
  }, []);

  const active = shifts[activeIdx];

  const getShiftIcon = (name: string, idx: number) => {
    const lower = name.toLowerCase();
    const key = Object.keys(SHIFT_ICON_MAP).find(k => lower.includes(k));
    return key ? SHIFT_ICON_MAP[key] : [Sun, Settings2, Moon][idx % 3];
  };

  const getShiftColor = (idx: number) => SHIFT_COLOR_MAP[String(idx % 5)];

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="editorial-heading text-[22px] font-black text-slate-800 tracking-tight leading-none">
            Pengaturan <span className="text-[#E31E24]">Shift</span>
          </h1>
          <p className="text-[12px] text-slate-400 mt-1 font-medium">
            Kelola pembagian waktu kerja dan alokasi personel
          </p>
        </div>
        <a
          href="/jam-kerja"
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-[12px] font-bold text-white shrink-0"
          style={{ background: '#10B981', boxShadow: 'none' }}
        >
          <Plus size={15} />
          Kelola Template
        </a>
      </motion.div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-[13px] font-medium">Memuat data shift...</span>
        </div>
      )}

      {/* ── EMPTY ── */}
      {!loading && shifts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Clock size={28} className="text-slate-400" />
          </div>
          <div>
            <p className="text-desc font-bold text-slate-600">Belum ada template shift</p>
            <p className="text-[12px] text-slate-400 mt-1">Tambahkan template shift melalui menu Jam Kerja</p>
          </div>
          <a href="/jam-kerja" className="px-4 py-2 bg-emerald-500 text-white text-[12px] font-bold rounded-xl hover:bg-emerald-600 transition-colors">
            Buka Jam Kerja
          </a>
        </div>
      )}

      {/* ── CONTENT ── */}
      {!loading && shifts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* ── SHIFT LIST ── */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Daftar Regu Kerja</p>
            {shifts.map((shift, idx) => {
              const isActive = activeIdx === idx;
              const color = getShiftColor(idx);
              const Icon = getShiftIcon(shift.name, idx);
              return (
                <motion.button
                  key={shift.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  onClick={() => setActiveIdx(idx)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isActive
                      ? 'bg-white border-emerald-300 shadow-md'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                  style={{ boxShadow: isActive ? '0 4px 14px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-emerald-500" />}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[13px] font-bold text-slate-800 truncate">{shift.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{shift.checkIn} – {shift.checkOut}</p>
                    </div>
                    <div className="ml-auto shrink-0 text-right">
                      <span className="text-[11px] font-bold text-slate-500">{shift.employeeCount ?? 0}</span>
                      <p className="text-[9px] text-slate-400">orang</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* ── SHIFT DETAIL ── */}
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${getShiftColor(activeIdx)}18`, color: getShiftColor(activeIdx) }}
                    >
                      {(() => { const Icon = getShiftIcon(active.name, activeIdx); return <Icon size={20} />; })()}
                    </div>
                    <div>
                      <p className="text-[15px] font-black text-slate-800">{active.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">Detail Operasional & Personel</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                    <Users size={14} className="text-slate-400" />
                    <p className="text-[12px] font-bold text-slate-700">{active.employeeCount ?? 0} Personel</p>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={13} className="text-emerald-500" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hari Kerja</p>
                    </div>
                    <p className="text-[13px] font-bold text-slate-800">
                      {active.workDays.length > 0
                        ? active.workDays.map(d => DAY_LABELS[d] ?? d).join(', ')
                        : 'Senin – Sabtu'}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={13} className="text-emerald-500" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toleransi Keterlambatan</p>
                    </div>
                    <p className="text-[13px] font-bold text-slate-800">{active.toleranceMinutes} menit</p>
                  </div>
                </div>

                {/* Waktu */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: 'Jam Masuk',  val: active.checkIn },
                    { label: 'Jam Keluar', val: active.checkOut },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1.5">
                        <Clock size={12} className="text-slate-400" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      </div>
                      <p
                        className="text-[24px] font-black tabular-nums leading-none"
                        style={{ color: getShiftColor(activeIdx) }}
                      >
                        {item.val}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Link to manage */}
                <div className="flex items-center justify-center gap-3 bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-400">Ubah jadwal melalui menu Jam Kerja</p>
                  <a
                    href="/jam-kerja"
                    className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:underline"
                  >
                    <Edit2 size={11} /> Kelola
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
