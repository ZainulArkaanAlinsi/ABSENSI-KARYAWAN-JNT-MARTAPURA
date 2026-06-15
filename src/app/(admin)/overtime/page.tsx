'use client';

import { useState } from 'react';
import { safeFormatDate } from '@/utils/dateFormatters';
import {
  CheckCircle,
  XCircle,
  FileText,
  Inbox,
  Loader2,
  UserCheck,
  Calendar,
  Trash2,
  Timer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { OVERTIME_TABS, useOvertimeManagement } from '@/hooks/useOvertimeManagement';
import type { OvertimeRequest } from '@/types';

const ITEMS_PER_PAGE = 10;

function formatDuration(minutes: number, hours: number): string {
  if (minutes <= 0) return `${hours} jam`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} mnt`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} mnt`;
}

export default function OvertimePage() {
  const {
    activeTab,
    setActiveTab,
    overtimes,
    loading,
    selectedOvertime,
    showRejectModal,
    setShowRejectModal,
    rejectReason,
    setRejectReason,
    processing,
    handleApprove,
    handleRejectSubmit,
    handleDelete,
    openReject,
    pendingCount,
  } = useOvertimeManagement();

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(overtimes.length / ITEMS_PER_PAGE));
  const paginated = overtimes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 size={28} className="animate-spin text-emerald-500" />
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          Memuat data lembur...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="editorial-heading text-[22px] font-black text-slate-800 tracking-tight leading-none">
            Pengajuan <span className="text-[#E31E24]">Lembur</span>
          </h1>
          <p className="text-[12px] text-slate-400 mt-1 font-medium">
            Kelola pengajuan kerja lembur karyawan JNE Martapura
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-[12px] font-bold text-amber-700">
              {pendingCount} menunggu persetujuan
            </p>
          </div>
        )}
      </motion.div>

      {/* ── SUMMARY STRIP ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Menunggu',
            val: overtimes.filter((o) => o.status === 'pending').length,
            dot: 'bg-amber-400',
            text: 'text-amber-600',
          },
          {
            label: 'Disetujui',
            val: overtimes.filter((o) => o.status === 'approved').length,
            dot: 'bg-emerald-400',
            text: 'text-emerald-600',
          },
          {
            label: 'Ditolak',
            val: overtimes.filter((o) => o.status === 'rejected').length,
            dot: 'bg-red-400',
            text: 'text-red-500',
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + i * 0.07 }}
            className="bg-white rounded-2xl px-4 py-3.5 border border-slate-100 flex items-center gap-3"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`} />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {s.label}
              </p>
              <p className={`text-[22px] font-black leading-none tabular-nums ${s.text}`}>
                {s.val}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── TAB BAR ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-2"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        {OVERTIME_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(1);
            }}
            className={`relative flex-1 h-10 px-4 rounded-xl text-[12px] font-bold transition-all ${
              activeTab === tab.key ? 'text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="overtime-tab-pill"
                className="absolute inset-0 rounded-xl"
                style={{ background: '#10B981' }}
                transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">
              {tab.label}
              {tab.key === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/30 text-[9px] font-black">
                  {pendingCount}
                </span>
              )}
            </span>
          </button>
        ))}
      </motion.div>

      {/* ── OVERTIME CARDS ── */}
      {overtimes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-slate-100 rounded-2xl p-16 text-center"
          style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"
          >
            <Inbox size={24} className="text-slate-300" />
          </motion.div>
          <p className="text-[13px] font-bold text-slate-700">Tidak ada pengajuan lembur</p>
          <p className="text-[11px] text-slate-400 mt-1">Tidak ada data dalam kategori ini</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {paginated.map((ot: OvertimeRequest, i: number) => (
              <motion.div
                key={ot.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Employee info */}
                  <div className="lg:w-56 p-5 flex flex-col items-center justify-center text-center bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100">
                    <div className="relative mb-3">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-[22px] font-black">
                        {ot.employeeName?.charAt(0) || '?'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                    <p className="text-desc font-bold text-slate-800 leading-tight">
                      {ot.employeeName}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      {ot.employeeId}
                    </p>
                  </div>

                  {/* Right: Overtime details */}
                  <div className="flex-1 p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Tanggal Lembur
                        </p>
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-slate-400" />
                          <p className="text-[13px] font-bold text-slate-800">
                            {ot.date ? safeFormatDate(ot.date, 'dd MMM yyyy') : '-'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Durasi
                        </p>
                        <div className="flex items-center gap-2">
                          <Timer size={13} className="text-emerald-500" />
                          <span className="inline-flex px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[12px] font-bold border border-emerald-200">
                            {formatDuration(ot.overtimeMinutes, ot.overtimeHours)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {ot.reason && (
                      <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 mb-4">
                        <div className="flex items-start gap-2">
                          <FileText size={12} className="text-slate-400 shrink-0 mt-0.5" />
                          <p className="text-[12px] text-slate-600 italic">
                            &ldquo;{ot.reason}&rdquo;
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      {ot.status === 'approved' && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <UserCheck size={12} />
                          Disetujui oleh{' '}
                          <span className="font-bold text-slate-600">
                            {ot.reviewedBy || 'Admin'}
                          </span>
                        </div>
                      )}
                      {ot.status === 'rejected' && (ot.rejectionReason || ot.adminReason) && (
                        <p className="text-[11px] text-red-500 italic">
                          Ditolak: {ot.rejectionReason || ot.adminReason}
                        </p>
                      )}
                      {ot.status === 'pending' && <span />}

                      <div className="flex items-center gap-2 ml-auto">
                        {ot.status === 'pending' ? (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => openReject(ot)}
                              disabled={!!processing}
                              className="flex items-center gap-1.5 h-9 px-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-[12px] font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
                            >
                              <XCircle size={14} /> Tolak
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleApprove(ot)}
                              disabled={!!processing}
                              className="flex items-center gap-1.5 h-9 px-4 text-white rounded-xl text-[12px] font-bold disabled:opacity-50"
                              style={{ background: '#10B981' }}
                            >
                              {processing === ot.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <CheckCircle size={14} />
                              )}
                              Setujui
                            </motion.button>
                          </>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleDelete(ot)}
                            disabled={!!processing}
                            className="flex items-center gap-1.5 h-9 px-3 bg-white border border-slate-200 text-slate-400 rounded-xl text-[11px] font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
                            title="Hapus pengajuan ini"
                          >
                            {processing === ot.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                            Hapus
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* ── REJECT MODAL ── */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Alasan Penolakan"
        maxWidth={480}
      >
        <div className="flex flex-col gap-4 pt-2">
          <p className="text-[12px] text-slate-500">
            Berikan alasan mengapa pengajuan lembur{' '}
            <span className="font-bold text-slate-800">{selectedOvertime?.employeeName}</span>{' '}
            ditolak.
          </p>
          <textarea
            className="w-full h-28 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-[13px] text-slate-800 outline-none focus:border-emerald-400 focus:bg-white transition-all resize-none"
            placeholder="Tuliskan alasan penolakan..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-2.5">
            <button
              onClick={() => setShowRejectModal(false)}
              className="flex-1 h-10 rounded-xl bg-slate-100 text-slate-600 text-[12px] font-bold"
            >
              Batal
            </button>
            <button
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim() || !!processing}
              className="flex-1 h-10 rounded-xl text-white text-[12px] font-bold disabled:opacity-50"
              style={{ background: '#EF4444' }}
            >
              {processing ? (
                <Loader2 size={14} className="animate-spin mx-auto" />
              ) : (
                'Konfirmasi Tolak'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
