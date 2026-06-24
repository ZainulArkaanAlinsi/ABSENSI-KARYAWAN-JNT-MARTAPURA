'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { listen } from '@/lib/firestoreListener';
import { EditRequest } from '@/types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';
import {
  Check,
  X,
  Clock,
  AlertCircle,
  Inbox,
  Loader2,
  XCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

const toDate = (val: unknown): Date => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === 'object' && val !== null) {
    const o = val as { seconds?: number; toDate?: () => Date };
    if ('seconds' in val) return new Date((o.seconds as number) * 1000);
    if ('toDate' in val && typeof o.toDate === 'function') return o.toDate();
  }
  const d = new Date(val as string | number);
  return isNaN(d.getTime()) ? new Date() : d;
};

export default function EditRequestsPage() {
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { confirm } = useConfirm();

  const handleDelete = async (req: EditRequest) => {
    const ok = await confirm({
      title: 'Hapus Request',
      message: `Hapus request edit absensi dari ${req.userName ?? 'karyawan'}? Tindakan ini permanen.`,
      variant: 'danger',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
    });
    if (!ok) return;
    setProcessing(req.id);
    const prev = requests;
    setRequests((p) => p.filter((r) => r.id !== req.id));
    try {
      await deleteDoc(doc(db, 'edit_requests', req.id));
      toast.success('Request dihapus');
    } catch (e) {
      console.error('Delete edit_request failed:', e);
      setRequests(prev);
      toast.error('Gagal menghapus. Coba lagi.');
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'edit_requests'), orderBy('createdAt', 'desc'));
    const unsub = listen(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as EditRequest));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      await updateDoc(doc(db, 'edit_requests', id), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  const pending = requests.filter((r) => r.status === 'pending').length;
  const approved = requests.filter((r) => r.status === 'approved').length;
  const rejected = requests.filter((r) => r.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          Memuat permintaan...
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
            Request <span className="text-[#E31E24]">Edit Absensi</span>
          </h1>
          <p className="text-[12px] text-slate-400 mt-1 font-medium">
            Permintaan koreksi data kehadiran dari karyawan
          </p>
        </div>
      </motion.div>

      {/* ── SUMMARY ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Menunggu',
            val: pending,
            clr: 'text-amber-600',
            bg: 'bg-amber-50',
            dot: 'bg-amber-400',
          },
          {
            label: 'Disetujui',
            val: approved,
            clr: 'text-emerald-600',
            bg: 'bg-emerald-50',
            dot: 'bg-emerald-400',
          },
          {
            label: 'Ditolak',
            val: rejected,
            clr: 'text-red-600',
            bg: 'bg-red-50',
            dot: 'bg-red-400',
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
              <p className={`text-[22px] font-black leading-none tabular-nums ${s.clr}`}>{s.val}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── LIST ── */}
      {requests.length === 0 ? (
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
          <p className="text-[13px] font-bold text-slate-700">Tidak ada permintaan</p>
          <p className="text-[11px] text-slate-400 mt-1">Semua request sudah ditangani</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {requests.map((req, i) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-sm transition-all"
                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
              >
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* ── Left info ── */}
                  <div className="flex-1 min-w-0">
                    {/* Top row: avatar + name + badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-desc font-bold shrink-0">
                        {req.userName?.charAt(0) ?? '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-desc font-bold text-slate-800 truncate leading-tight">
                          {req.userName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          ID: {req.userId?.slice(0, 10)}…
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                          req.status === 'pending'
                            ? 'bg-amber-50   text-amber-700'
                            : req.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50     text-red-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            req.status === 'pending'
                              ? 'bg-amber-400'
                              : req.status === 'approved'
                                ? 'bg-emerald-400'
                                : 'bg-red-400'
                          }`}
                        />
                        {req.status === 'pending'
                          ? 'Menunggu'
                          : req.status === 'approved'
                            ? 'Disetujui'
                            : 'Ditolak'}
                      </span>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AlertCircle size={11} className="text-amber-500" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Alasan
                          </p>
                        </div>
                        <p className="text-[13px] font-medium text-slate-700 italic">
                          &quot;{req.reason}&quot;
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Clock size={11} className="text-emerald-500" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Dikirim
                          </p>
                        </div>
                        <p className="text-[13px] font-bold text-slate-800">
                          {format(toDate(req.createdAt), 'dd MMM yyyy')}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                          {format(toDate(req.createdAt), 'HH:mm')} WIB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Actions ── */}
                  {req.status === 'pending' && (
                    <div className="flex lg:flex-col gap-2.5 lg:min-w-[140px] lg:justify-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAction(req.id, 'rejected')}
                        disabled={!!processing}
                        className="flex-1 flex items-center justify-center gap-2 h-10 px-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-[12px] font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
                      >
                        {processing === req.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <XCircle size={15} />
                        )}
                        Tolak
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAction(req.id, 'approved')}
                        disabled={!!processing}
                        className="flex-1 flex items-center justify-center gap-2 h-10 px-4 text-white rounded-xl text-[12px] font-bold disabled:opacity-50 shadow-md"
                        style={{ background: '#10B981', boxShadow: 'none' }}
                      >
                        {processing === req.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}
                        Setuju
                      </motion.button>
                      <button
                        onClick={() => handleDelete(req)}
                        disabled={!!processing}
                        title="Hapus request"
                        className="flex items-center justify-center gap-2 h-10 px-4 bg-white border border-slate-200 text-slate-400 rounded-xl text-[12px] font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  )}

                  {/* Non-pending badge + hapus */}
                  {req.status !== 'pending' && (
                    <div className="flex lg:flex-col items-center justify-center gap-3 lg:min-w-[120px]">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          req.status === 'approved' ? 'bg-emerald-100' : 'bg-red-100'
                        }`}
                      >
                        {req.status === 'approved' ? (
                          <Check size={22} className="text-emerald-600" />
                        ) : (
                          <X size={22} className="text-red-500" />
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(req)}
                        disabled={!!processing}
                        title="Hapus request"
                        className="flex items-center justify-center gap-1.5 h-9 px-3 bg-white border border-slate-200 text-slate-400 rounded-xl text-[11px] font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
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
