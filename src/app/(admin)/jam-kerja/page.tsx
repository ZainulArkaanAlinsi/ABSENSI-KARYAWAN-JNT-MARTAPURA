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
import AdminLayout from '@/components/layout/AdminLayout';
import Modal from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
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

  return (
    <AdminLayout
      title="Jam Kerja Karyawan"
      subtitle={`${jamKerjas.length} jam kerja terdaftar dalam sistem`}
    >
      {/* Header actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium"
            style={{
              background: 'rgba(227,30,36,0.1)',
              border: '1px solid rgba(227,30,36,0.2)',
              color: '#E31E24',
            }}
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
            <span>
              {activeCount} aktif • {jamKerjas.length} total
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="pg-btn-primary inline-flex items-center gap-2 text-sm"
          style={{ backgroundColor: '#E31E24' }}
        >
          <Plus size={16} />
          Tambah jam kerja
        </motion.button>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24">
          <PageLoader />
        </div>
      ) : jamKerjas.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pg-card flex flex-col items-center gap-4 py-20 text-center"
          style={{ border: '2px dashed var(--pg-border)' }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(227,30,36,0.1)' }}
          >
            <Clock size={24} style={{ color: '#E31E24' }} />
          </div>
          <p className="pg-empty-title">Belum ada jam kerja</p>
          <p className="pg-empty-sub">
            Tambahkan jam kerja untuk mulai mengatur jadwal karyawan.
          </p>
          <button
            onClick={openAdd}
            className="pg-btn-primary mt-2 inline-flex items-center gap-2 text-sm"
            style={{ backgroundColor: '#E31E24' }}
          >
            <Plus size={15} />
            Tambah jam kerja pertama
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {jamKerjas.map((s, idx) => {
              const duration = calcDuration(
                s.checkInTime,
                s.checkOutTime,
              );
              const accent = s.color;

              return (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ y: -3 }}
                  className="pg-card relative flex flex-col gap-5 overflow-hidden p-6"
                >
                  {/* Accent bar */}
                  <div
                    className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
                    style={{ background: accent }}
                  />

                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl border"
                        style={{
                          background: `${accent}19`,
                          borderColor: `${accent}40`,
                        }}
                      >
                        <Clock size={20} style={{ color: accent }} />
                      </div>
                      <div>
                        <h3
                          className="text-sm font-semibold"
                          style={{ color: 'var(--pg-text-primary)' }}
                        >
                          {s.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              s.isActive
                                ? 'bg-emerald-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span
                            className="text-[11px]"
                            style={{ color: 'var(--pg-text-muted)' }}
                          >
                            {s.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border pg-border bg-slate-900/40 text-slate-400 transition-colors hover:border-red-500 hover:text-red-500"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border pg-border bg-slate-900/40 text-red-500 transition-colors hover:border-red-400 hover:bg-red-500/5"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Time grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="pg-info-box text-center">
                      <p className="pg-info-label">Jam masuk</p>
                      <p
                        className="tabular-nums text-xl font-bold"
                        style={{ color: 'var(--pg-text-primary)' }}
                      >
                        {s.checkInTime}
                      </p>
                    </div>
                    <div className="pg-info-box text-center">
                      <p className="pg-info-label">Jam keluar</p>
                      <p
                        className="tabular-nums text-xl font-bold"
                        style={{ color: 'var(--pg-text-primary)' }}
                      >
                        {s.checkOutTime}
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-red-500" />
                      <span
                        className="text-[11px]"
                        style={{ color: 'var(--pg-text-muted)' }}
                      >
                        Durasi
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--pg-text-primary)' }}
                      >
                        {duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-amber-500" />
                      <span
                        className="text-[11px]"
                        style={{ color: 'var(--pg-text-muted)' }}
                      >
                        Toleransi
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--pg-text-primary)' }}
                      >
                        {s.toleranceMinutes} menit
                      </span>
                    </div>
                  </div>

                  {/* Working days */}
                  <div>
                    <p
                      className="mb-2 text-[11px]"
                      style={{ color: 'var(--pg-text-muted)' }}
                    >
                      Hari kerja
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {DAYS.map(({ key, label }) => {
                        const isWorking = s.workingDays.includes(key);
                        return (
                          <div
                            key={key}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold"
                            style={
                              isWorking
                                ? {
                                    background: accent,
                                    color: '#fff',
                                  }
                                : {
                                    background: 'var(--pg-bg)',
                                    border: '1px solid var(--pg-border)',
                                    color: 'var(--pg-text-muted)',
                                  }
                            }
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

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingJamKerja ? 'Edit jam kerja' : 'Tambah jam kerja baru'}
        maxWidth={580}
      >
        <form onSubmit={handleSave} className="space-y-6 pt-1">
          <div className="space-y-1.5">
            <label className="pg-form-label">Nama jam kerja</label>
            <input
              className="pg-form-input"
              placeholder="Contoh: Jam Kerja Pagi, Jam Kerja Malam"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="pg-form-label">Jam masuk</label>
              <input
                type="time"
                className="pg-form-input cursor-pointer"
                value={form.checkInTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, checkInTime: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="pg-form-label">Jam keluar</label>
              <input
                type="time"
                className="pg-form-input cursor-pointer"
                value={form.checkOutTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, checkOutTime: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="pg-form-label">
              Toleransi keterlambatan (menit)
            </label>
            <input
              type="number"
              className="pg-form-input"
              min={0}
              max={60}
              value={form.toleranceMinutes}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  toleranceMinutes: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="space-y-2.5">
            <label className="pg-form-label">Hari kerja</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(({ key, label }) => {
                const active = form.workingDays.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleDay(key)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-all"
                    style={
                      active
                        ? {
                            background: '#E31E24',
                            color: '#fff',
                            border: '1.5px solid #E31E24',
                          }
                        : {
                            background: 'var(--pg-bg)',
                            border: '1.5px solid var(--pg-border)',
                            color: 'var(--pg-text-muted)',
                          }
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="pg-form-label">Warna jam kerja</label>
            <div className="flex flex-wrap gap-3">
              {JAM_KERJA_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, color: c }))}
                  className="relative h-9 w-9 rounded-xl transition-transform"
                  style={{
                    background: c,
                    transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                    outline:
                      form.color === c ? `3px solid ${c}` : 'transparent',
                    outlineOffset: 3,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="pg-btn-secondary flex-1 text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="pg-btn-primary flex flex-1 items-center justify-center gap-2 text-sm"
              style={{ backgroundColor: '#E31E24' }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Calendar size={16} />
                  Simpan jam kerja
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
