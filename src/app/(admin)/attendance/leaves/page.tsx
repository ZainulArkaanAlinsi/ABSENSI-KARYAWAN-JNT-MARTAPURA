'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, doc, updateDoc, where, addDoc } from 'firebase/firestore';
import { listen } from '@/lib/firestoreListener';
import { LeaveRequest } from '@/types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  FileText,
  Inbox,
  RefreshCw,
  ChevronLeft,
  Search,
  Clock3,
  Download,
  Filter,
  ShieldCheck,
} from 'lucide-react';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; dot: string; bg: string; text: string }> = {
    pending: { label: 'Menunggu', dot: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-700' },
    approved: {
      label: 'Disetujui',
      dot: 'bg-emerald-400',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
    rejected: { label: 'Ditolak', dot: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-600' },
  };
  const s = cfg[status] ?? cfg.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
const CardSkeleton = () => (
  <div
    className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse space-y-4"
    style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-slate-100 rounded-full w-32" />
        <div className="h-3 bg-slate-100 rounded-full w-20" />
      </div>
    </div>
    <div className="h-16 bg-slate-100 rounded-xl" />
    <div className="grid grid-cols-2 gap-3">
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
    </div>
    <div className="h-10 bg-slate-100 rounded-xl" />
  </div>
);

const toDate = (val: unknown): Date => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === 'object' && 'seconds' in val)
    return new Date((val as { seconds: number }).seconds * 1000);
  const d = new Date(val as string | number);
  return isNaN(d.getTime()) ? new Date() : d;
};

// ─── Main ─────────────────────────────────────────────────────
export default function LeaveRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { confirm } = useConfirm();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let q = query(collection(db, 'leaves'), orderBy('createdAt', 'desc'));
    if (filter !== 'all')
      q = query(
        collection(db, 'leaves'),
        where('status', '==', filter),
        orderBy('createdAt', 'desc'),
      );

    const unsub = listen(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LeaveRequest));
      setLoading(false);
    });
    return () => unsub();
  }, [filter]);

  const handleAction = async (requestId: string, status: 'approved' | 'rejected') => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    const isConfirmed = await confirm({
      title: status === 'approved' ? 'Setujui Pengajuan' : 'Tolak Pengajuan',
      message: `Konfirmasi untuk ${status === 'approved' ? 'menyetujui' : 'menolak'} pengajuan ${request.type} dari ${request.employeeName}?`,
      variant: status === 'approved' ? 'info' : 'danger',
      confirmLabel: status === 'approved' ? 'Setujui' : 'Tolak',
      cancelLabel: 'Batalkan',
    });

    if (!isConfirmed) return;

    setProcessing(requestId);
    try {
      await updateDoc(doc(db, 'leaves', requestId), {
        status,
        updatedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
      });

      if (status === 'approved') {
        const start = toDate(request.startDate);
        const end = toDate(request.endDate);
        const dayCount = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
        const ref = collection(db, 'attendance');
        for (let i = 0; i < dayCount; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          await addDoc(ref, {
            userId: request.userId,
            employeeName: request.employeeName,
            employeeId: request.employeeId,
            department: request.department,
            date: format(d, 'yyyy-MM-dd'),
            status: 'leave',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: 'system_leave',
          });
        }
      }
      toast.success(`Berhasil ${status === 'approved' ? 'menyetujui' : 'menolak'} pengajuan`);
    } catch (e) {
      console.error(e);
      toast.error('Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = useMemo(
    () =>
      requests.filter(
        (r) =>
          (r.employeeName?.toLowerCase() || '').includes(search.toLowerCase()) ||
          (r.employeeId?.toLowerCase() || '').includes(search.toLowerCase()),
      ),
    [requests, search],
  );

  const counts = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    }),
    [requests],
  );

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
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-emerald-600 transition-colors mb-2 group"
          >
            <ChevronLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Kembali
          </button>
          <h1 className="editorial-heading text-[22px] font-black text-slate-800 tracking-tight leading-none">
            Pengajuan <span className="text-[#E31E24]">Izin & Cuti</span>
          </h1>
          <p className="text-[12px] text-slate-400 mt-1 font-medium">
            Review dan otorisasi permohonan cuti karyawan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 h-9 px-4 bg-white border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
          >
            <Download size={14} /> Export
          </motion.button>
        </div>
      </motion.div>

      {/* ── SUMMARY STRIP ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total',
            val: counts.total,
            clr: 'text-blue-600',
            bg: 'bg-blue-50',
            dot: 'bg-blue-400',
          },
          {
            label: 'Menunggu',
            val: counts.pending,
            clr: 'text-amber-600',
            bg: 'bg-amber-50',
            dot: 'bg-amber-400',
          },
          {
            label: 'Disetujui',
            val: counts.approved,
            clr: 'text-emerald-600',
            bg: 'bg-emerald-50',
            dot: 'bg-emerald-400',
          },
          {
            label: 'Ditolak',
            val: counts.rejected,
            clr: 'text-red-600',
            bg: 'bg-red-50',
            dot: 'bg-red-400',
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.06 }}
            className="bg-white rounded-2xl px-4 py-3.5 border border-slate-100 flex items-center gap-3"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {s.label}
              </p>
              <p className={`text-[22px] font-black leading-none tabular-nums ${s.clr}`}>{s.val}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama atau ID karyawan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 bg-white border border-slate-200 rounded-xl pl-10 pr-4 text-[13px] font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/15 transition-all shadow-sm"
          />
        </div>
        <div className="relative flex items-center gap-2 h-10 px-3.5 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[200px]">
          <Filter size={13} className="text-slate-400 shrink-0" />
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')
            }
            className="bg-transparent text-[12px] font-semibold text-slate-700 outline-none appearance-none cursor-pointer flex-1"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      {/* ── CARDS GRID ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
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
          <p className="text-[13px] font-bold text-slate-600">Tidak ada pengajuan</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {filter === 'all'
              ? 'Belum ada pengajuan izin masuk.'
              : `Tidak ada pengajuan dengan status "${filter}".`}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((req, i) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2, transition: { duration: 0.18 } }}
                className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-4 group"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                {/* Top: avatar + name + badge */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-[16px] font-bold shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    {req.employeeName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-desc font-bold text-slate-800 truncate leading-tight">
                      {req.employeeName}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{req.employeeId}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                {/* Reason */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText size={11} className="text-emerald-500" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Alasan
                    </p>
                  </div>
                  <p className="text-[12px] font-medium text-slate-600 italic leading-relaxed line-clamp-2">
                    &quot;{req.reason}&quot;
                  </p>
                </div>

                {/* Date + Type grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Durasi
                    </p>
                    <p className="text-[13px] font-black text-slate-800">{req.totalDays} Hari</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Tipe
                    </p>
                    <p className="text-[12px] font-bold text-emerald-600 capitalize">{req.type}</p>
                  </div>
                </div>

                {/* Date range */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <Clock3 size={12} className="text-slate-400 shrink-0" />
                  <span className="tabular-nums">
                    {format(toDate(req.startDate), 'dd MMM', { locale: idLocale })} —{' '}
                    {format(toDate(req.endDate), 'dd MMM yyyy', { locale: idLocale })}
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-1">
                  {req.status === 'pending' ? (
                    <div className="flex gap-2.5">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleAction(req.id, 'rejected')}
                        disabled={!!processing}
                        className="w-11 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center disabled:opacity-50"
                      >
                        {processing === req.id ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <X size={16} />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAction(req.id, 'approved')}
                        disabled={!!processing}
                        className="flex-1 h-10 rounded-xl text-white text-[12px] font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                        style={{
                          background: 'linear-gradient(135deg,#10B981,#059669)',
                          boxShadow: '0 4px 14px -4px rgba(16,185,129,0.4)',
                        }}
                      >
                        {processing === req.id ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Check size={15} />
                        )}
                        Setujui
                      </motion.button>
                    </div>
                  ) : (
                    <div className="w-full h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center gap-2">
                      <ShieldCheck
                        size={14}
                        className={req.status === 'approved' ? 'text-emerald-400' : 'text-red-400'}
                      />
                      <span className="text-[11px] font-semibold text-slate-500">
                        {req.status === 'approved' ? 'Sudah disetujui' : 'Sudah ditolak'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
