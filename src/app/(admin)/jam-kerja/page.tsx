'use client';

import {
  Plus,
  Clock,
  Edit2,
  Trash2,
  Zap,
  Loader2,
  Calendar,
} from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import {
  useJamKerjaManagement,
  DAYS,
  JAM_KERJA_COLORS,
} from '@/hooks/useJamKerjaManagement';
import { motion, AnimatePresence } from 'framer-motion';

export default function JamKerjaPage() {
  const {
    jamKerjas,
    loading,
    showModal,
    setShowModal,
    editingJamKerja,
    form,
    setForm,
    saving,
    openAdd,
    openEdit,
    toggleDay,
    handleSave,
    handleDelete,
    calcDuration,
  } = useJamKerjaManagement();

  const activeCount = jamKerjas.filter((s) => s.isActive).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 size={40} className="animate-spin text-[#E31E24]" />
        <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-[0.3em]">Memvalidasi Jam Kerja...</p>
      </div>
    );
  }

  return (
    <div className="dash-root max-w-[1400px] mx-auto">
      {/* ── HEADER ── */}
      <div className="mb-10 bg-(--bg-card) p-10 rounded-4xl border border-(--border-primary) shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-red-600/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-8 relative z-10">
          <div className="h-20 w-20 rounded-3xl bg-[#E31E24] flex items-center justify-center text-white shadow-xl shadow-red-600/20">
            <Clock size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-(--text-primary)">Jam Kerja Karyawan</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-(--text-muted) font-bold uppercase tracking-widest text-[11px]">
                {activeCount} Aktif • {jamKerjas.length} Total Skema Terdaftar
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={openAdd}
          className="px-10 py-5 bg-[#005596] hover:bg-blue-800 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-600/20 relative z-10 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} /> Tambah Skema
        </button>
      </div>

      {/* ── CONTENT ── */}
      {jamKerjas.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-(--bg-card) rounded-4xl border-2 border-dashed border-(--border-primary) flex flex-col items-center gap-6 py-32 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 text-(--text-dim)">
            <Clock size={40} />
          </div>
          <div>
            <h4 className="text-lg font-black text-(--text-primary) uppercase italic mb-2">Belum Ada Jam Kerja</h4>
            <p className="text-(--text-muted) font-bold uppercase tracking-widest text-[10px] max-w-sm mx-auto leading-relaxed">
              Tambahkan jam kerja pertama untuk mulai mengatur jadwal operasional JNE Martapura.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="px-8 py-4 bg-[#E31E24] text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20"
          >
            Tambah Sekarang
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {jamKerjas.map((s, idx) => {
              const duration = calcDuration(s.checkInTime, s.checkOutTime);
              const accent = s.color || '#005596';

              return (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-(--bg-card) border border-(--border-primary) rounded-4xl p-8 hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1" style={{ background: accent }} />
                  
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-(--border-primary) transition-all group-hover:scale-110"
                        style={{ background: `${accent}15`, color: accent }}
                      >
                        <Clock size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black italic uppercase tracking-tight text-(--text-primary)">{s.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${s.isActive ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-(--text-dim)'}`} />
                          <p className="text-[9px] font-black text-(--text-muted) uppercase tracking-widest">
                            {s.isActive ? 'Status: Aktif' : 'Status: Nonaktif'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(s)} className="h-9 w-9 rounded-xl bg-white/5 text-(--text-dim) hover:bg-(--text-primary) hover:text-(--bg-card) flex items-center justify-center transition-all shadow-sm">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(s.id, s.name)} className="h-9 w-9 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-5 rounded-2xl bg-white/2 border border-(--border-primary) text-center">
                      <p className="text-[9px] font-black text-(--text-dim) uppercase tracking-widest mb-1">Masuk</p>
                      <p className="text-xl font-black text-(--text-primary) tracking-tighter tabular-nums">{s.checkInTime}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/2 border border-(--border-primary) text-center">
                      <p className="text-[9px] font-black text-(--text-dim) uppercase tracking-widest mb-1">Pulang</p>
                      <p className="text-xl font-black text-(--text-primary) tracking-tighter tabular-nums">{s.checkOutTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-(--border-primary) mb-8">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#E31E24]" />
                      <span className="text-[10px] font-black text-(--text-primary) uppercase tracking-tight">{duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-amber-500" />
                      <span className="text-[10px] font-black text-(--text-primary) uppercase tracking-tight">{s.toleranceMinutes}m Toleransi</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-(--text-dim) uppercase tracking-widest mb-3">Hari Operasional</p>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(({ key, label }) => {
                        const isWorking = s.workingDays.includes(key);
                        return (
                          <div
                            key={key}
                            className={`h-8 w-8 flex items-center justify-center rounded-lg text-[10px] font-black uppercase transition-all border ${
                              isWorking 
                                ? 'bg-[#005596] text-white border-[#005596] shadow-sm' 
                                : 'bg-white/5 text-(--text-dim) border-(--border-primary)'
                            }`}
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── MODAL ── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingJamKerja ? 'Edit Skema Waktu' : 'Tambah Skema Waktu'}
        maxWidth={580}
      >
        <form onSubmit={handleSave} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">Nama Skema</label>
            <input
              className="w-full px-6 py-4 rounded-xl bg-white/5 border border-(--border-primary) text-sm font-bold text-(--text-primary) outline-none focus:border-[#E31E24]/30"
              placeholder="Contoh: Operasional Pagi"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">Waktu Masuk</label>
              <input
                type="time"
                className="w-full px-6 py-4 rounded-xl bg-white/5 border border-(--border-primary) text-sm font-bold text-(--text-primary) outline-none focus:border-[#E31E24]/30"
                value={form.checkInTime}
                onChange={(e) => setForm((p) => ({ ...p, checkInTime: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">Waktu Pulang</label>
              <input
                type="time"
                className="w-full px-6 py-4 rounded-xl bg-white/5 border border-(--border-primary) text-sm font-bold text-(--text-primary) outline-none focus:border-[#E31E24]/30"
                value={form.checkOutTime}
                onChange={(e) => setForm((p) => ({ ...p, checkOutTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">Toleransi (Menit)</label>
            <input
              type="number"
              className="w-full px-6 py-4 rounded-xl bg-white/5 border border-(--border-primary) text-sm font-bold text-(--text-primary) outline-none focus:border-[#E31E24]/30"
              value={form.toleranceMinutes}
              onChange={(e) => setForm((p) => ({ ...p, toleranceMinutes: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">Hari Kerja</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(({ key, label }) => {
                const active = form.workingDays.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleDay(key)}
                    className={`h-10 w-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase transition-all border ${
                      active ? 'bg-[#E31E24] text-white border-[#E31E24] shadow-lg shadow-red-600/20' : 'bg-white/5 text-(--text-dim) border-(--border-primary)'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-8 py-4 rounded-2xl bg-white/5 text-(--text-muted) text-[11px] font-black uppercase tracking-widest hover:text-(--text-primary) transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-2 px-8 py-4 bg-[#E31E24] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 active:scale-95"
            >
              {saving ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Simpan Skema'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
