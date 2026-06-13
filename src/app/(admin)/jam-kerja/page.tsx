'use client';

import { Plus, Clock, Edit2, Trash2, Zap, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import {
  useJamKerjaManagement, DAYS, JAM_KERJA_COLORS,
} from '@/hooks/useJamKerjaManagement';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Pagination } from '@/components/ui/Pagination';

export default function JamKerjaPage() {
  const {
    jamKerjas, loading, showModal, setShowModal,
    editingJamKerja, form, setForm, saving,
    openAdd, openEdit, toggleDay, handleSave, handleDelete, calcDuration,
  } = useJamKerjaManagement();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const totalPages       = Math.ceil(jamKerjas.length / itemsPerPage);
  const paginatedJamKerja = jamKerjas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const activeCount       = jamKerjas.filter(s => s.isActive).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 size={28} className="animate-spin text-emerald-500" />
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Memuat jam kerja...</p>
      </div>
    );
  }

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
            Jam <span className="text-[#E31E24]">Kerja</span>
          </h1>
          <p className="text-[12px] text-slate-400 mt-1 font-medium">
            {activeCount} aktif · {jamKerjas.length} total skema terdaftar
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-[12px] font-bold text-white shrink-0"
          style={{ background: '#10B981', boxShadow: 'none' }}
        >
          <Plus size={15} />
          Tambah Skema
        </motion.button>
      </motion.div>

      {/* ── EMPTY STATE ── */}
      {jamKerjas.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white border border-dashed border-slate-200 rounded-2xl p-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Clock size={24} className="text-slate-300" />
          </div>
          <p className="text-[13px] font-bold text-slate-700">Belum Ada Jam Kerja</p>
          <p className="text-[11px] text-slate-400 mt-1 mb-5">Tambahkan skema pertama untuk mengatur jadwal operasional.</p>
          <button
            onClick={openAdd}
            className="h-9 px-5 rounded-xl text-[12px] font-bold text-white"
            style={{ background: '#10B981' }}
          >
            Tambah Sekarang
          </button>
        </motion.div>
      ) : (
        <>
          {/* ── GRID ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {paginatedJamKerja.map((s, idx) => {
                const duration = calcDuration(s.checkInTime, s.checkOutTime);
                const accent   = s.color || '#10B981';

                return (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all group relative overflow-hidden"
                    style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                  >
                    {/* Accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: accent }} />

                    <div className="flex items-start justify-between mb-4 mt-1">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${accent}18`, color: accent }}
                        >
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-desc font-black text-slate-800 leading-tight">{s.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {s.isActive ? 'Aktif' : 'Nonaktif'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(s)}
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(s.id, s.name)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Time grid */}
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      {[
                        { label: 'Masuk',  val: s.checkInTime  },
                        { label: 'Pulang', val: s.checkOutTime },
                      ].map(item => (
                        <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                          <p className="text-[18px] font-black tabular-nums text-slate-800">{item.val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Duration + tolerance */}
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} style={{ color: accent }} />
                        <span className="text-[11px] font-bold text-slate-700">{duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap size={12} className="text-amber-500" />
                        <span className="text-[11px] font-bold text-slate-700">{s.toleranceMinutes}m Toleransi</span>
                      </div>
                    </div>

                    {/* Working days */}
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hari Operasional</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {DAYS.map(({ key, label }) => {
                          const isWorking = s.workingDays.includes(key);
                          return (
                            <div
                              key={key}
                              className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-all border ${
                                isWorking
                                  ? 'text-white border-transparent'
                                  : 'bg-slate-50 text-slate-300 border-slate-200'
                              }`}
                              style={isWorking ? { backgroundColor: accent, borderColor: accent } : undefined}
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

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}

      {/* ── MODAL ── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingJamKerja ? 'Edit Skema Waktu' : 'Tambah Skema Waktu'}
        maxWidth={560}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Skema</label>
            <input
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] font-medium text-slate-800 outline-none focus:border-emerald-400 focus:bg-white transition-all"
              placeholder="Contoh: Operasional Pagi"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Waktu Masuk',  key: 'checkInTime'  as const },
              { label: 'Waktu Pulang', key: 'checkOutTime' as const },
            ].map(item => (
              <div key={item.key} className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</label>
                <input
                  type="time"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] font-medium text-slate-800 outline-none focus:border-emerald-400 transition-all"
                  value={form[item.key]}
                  onChange={e => setForm(p => ({ ...p, [item.key]: e.target.value }))}
                  required
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toleransi (Menit)</label>
            <input
              type="number"
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] font-medium text-slate-800 outline-none focus:border-emerald-400 transition-all"
              value={form.toleranceMinutes}
              onChange={e => setForm(p => ({ ...p, toleranceMinutes: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hari Kerja</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(({ key, label }) => {
                const active = form.workingDays.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleDay(key)}
                    className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all border ${
                      active
                        ? 'text-white border-transparent'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-emerald-300'
                    }`}
                    style={active ? { background: '#10B981' } : undefined}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 h-10 rounded-xl bg-slate-100 text-slate-600 text-[12px] font-bold hover:bg-slate-200 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-10 rounded-xl text-[12px] font-bold text-white disabled:opacity-60"
              style={{ background: '#10B981' }}
            >
              {saving ? <Loader2 size={15} className="animate-spin mx-auto" /> : 'Simpan Skema'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
