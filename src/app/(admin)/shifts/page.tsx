'use client';

import { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Users, 
  Calendar, 
  Settings2, 
  ChevronRight,
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SHIFT_TYPES = [
  { id: '1', name: 'Shift Pagi', time: '07:00 - 15:00', color: '#005596', count: 12 },
  { id: '2', name: 'Shift Sore', time: '15:00 - 23:00', color: '#E31E24', count: 8 },
  { id: '3', name: 'Shift Malam', time: '23:00 - 07:00', color: '#0F172A', count: 6 },
];

export default function ShiftsPage() {
  const [activeShift, setActiveShift] = useState(SHIFT_TYPES[0]);

  return (
    <div className="dash-root max-w-[1400px] mx-auto">
      {/* ── HEADER ── */}
      <div className="mb-10 bg-(--bg-card) p-10 rounded-4xl border border-(--border-primary) shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-red-600/5 to-transparent pointer-events-none" />
        <div className="h-20 w-20 rounded-3xl bg-[#005596] flex items-center justify-center text-white shadow-xl shadow-[#005596]/20 relative z-10">
          <Clock size={40} />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-(--text-primary)">Pengaturan Shift</h2>
          <p className="text-(--text-muted) font-bold uppercase tracking-widest text-[11px] mt-2">Kelola pembagian waktu kerja dan alokasi personel JNE Martapura.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── SHIFT LIST ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between mb-6 px-2">
             <h3 className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.2em]">Daftar Regu Kerja</h3>
             <button className="h-8 w-8 rounded-lg bg-[#E31E24] text-white flex items-center justify-center shadow-lg shadow-red-600/20">
                <Plus size={16} />
             </button>
          </div>
          
          {SHIFT_TYPES.map((shift) => (
            <button
              key={shift.id}
              onClick={() => setActiveShift(shift)}
              className={`w-full p-6 rounded-3xl border transition-all text-left relative overflow-hidden group ${
                activeShift.id === shift.id 
                  ? 'bg-(--bg-card) border-[#005596] shadow-xl' 
                  : 'bg-white/2 border-(--border-primary) hover:border-(--text-dim)'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${shift.color}15`, color: shift.color }}>
                  {shift.id === '1' ? <Sun size={20} /> : shift.id === '2' ? <Settings2 size={20} /> : <Moon size={20} />}
                </div>
                <ChevronRight size={16} className={`text-(--text-dim) transition-transform ${activeShift.id === shift.id ? 'rotate-90 text-[#005596]' : ''}`} />
              </div>
              <h4 className="text-lg font-black text-(--text-primary) italic uppercase tracking-tight">{shift.name}</h4>
              <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mt-1">{shift.time}</p>
              
              {activeShift.id === shift.id && (
                <div className="absolute top-0 right-0 w-1 h-full bg-[#005596]" />
              )}
            </button>
          ))}
        </div>

        {/* ── SHIFT DETAILS ── */}
        <div className="lg:col-span-8 bg-(--bg-card) rounded-4xl border border-(--border-primary) shadow-sm p-10">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-(--border-primary)">
             <div>
                <h3 className="text-xl font-black text-(--text-primary) uppercase italic tracking-tight">{activeShift.name}</h3>
                <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mt-1">Detail Operasional & Personel</p>
             </div>
             <div className="flex items-center gap-4">
                <div className="text-right">
                   <p className="text-[9px] font-black text-(--text-dim) uppercase tracking-widest">Kapasitas</p>
                   <p className="text-sm font-black text-(--text-primary)">{activeShift.count} Personel</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-white/5 border border-(--border-primary) flex items-center justify-center text-(--text-dim)">
                   <Users size={18} />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
             <div className="p-6 rounded-3xl bg-white/2 border border-(--border-primary)">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Calendar size={14} className="text-[#005596]" /> Jadwal Rutin
                </p>
                <p className="text-sm font-bold text-(--text-primary)">Senin - Sabtu (Aktif)</p>
                <p className="text-xs text-(--text-muted) mt-1">Minggu/Hari Libur (Opsional)</p>
             </div>
             <div className="p-6 rounded-3xl bg-white/2 border border-(--border-primary)">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <ShieldCheck size={14} className="text-emerald-500" /> Pengawasan Unit
                </p>
                <p className="text-sm font-bold text-(--text-primary)">Supervisor Level 2</p>
                <p className="text-xs text-(--text-muted) mt-1">Otorisasi Absensi FaceID Aktif</p>
             </div>
          </div>

          <div className="bg-white/2 rounded-3xl border border-(--border-primary) p-10 text-center">
             <p className="text-[11px] font-black text-(--text-dim) uppercase tracking-[0.2em] mb-4">Aktivitas Terkini</p>
             <p className="text-xs font-bold text-(--text-muted)">Belum ada data login untuk regu ini dalam 24 jam terakhir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
