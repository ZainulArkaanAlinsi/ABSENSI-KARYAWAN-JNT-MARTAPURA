'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { listen } from '@/lib/firestoreListener';
import { LeaveRequest } from '@/types';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { useConfirm } from '@/context/ConfirmContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const TABS = [
  { key: 'pending', label: 'Menunggu' },
  { key: 'approved', label: 'Disetujui' },
  { key: 'rejected', label: 'Ditolak' },
  { key: 'balances', label: 'Kelola Saldo' },
];

const LEAVE_TYPES: Record<string, string> = {
  sick: 'Sakit',
  annual: 'Cuti Tahunan',
  permission: 'Izin Keperluan',
  personal: 'Keperluan Pribadi',
  urgent: 'Keperluan Keluarga',
};

interface EmployeeRow {
  uid: string;
  name?: string;
  employeeId?: string;
}

interface LeaveBalance {
  userId: string;
  annualQuota: number;
  usedAnnual: number;
  usedSick: number;
  usedPermission: number;
}

export default function LeavesPage() {
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  // Filter periode (history): 'all' = semua waktu, atau 'yyyy-MM'.
  const [monthFilter, setMonthFilter] = useState('all');
  const [processing, setProcessing] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { confirm } = useConfirm();
  const { user } = useAuth();
  const itemsPerPage = 10;
  const reviewerName = user?.name || user?.email || 'Admin';

  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<EmployeeRow | null>(null);
  const [editBalance, setEditBalance] = useState({
    annualQuota: 12,
    usedAnnual: 0,
    usedSick: 0,
    usedPermission: 0,
  });

  useEffect(() => {
    const q = query(collection(db, 'leaves'), orderBy('createdAt', 'desc'));
    const unsubLeaves = listen(q, (snap) => {
      setAllLeaves(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LeaveRequest));
      setLoading(false);
    });

    const unsubEmployees = listen(collection(db, 'users'), (snap) => {
      setEmployees(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });

    const unsubBalances = listen(collection(db, 'leave_balances'), (snap) => {
      setBalances(snap.docs.map((d) => ({ userId: d.id, ...d.data() })) as LeaveBalance[]);
    });

    return () => {
      unsubLeaves();
      unsubEmployees();
      unsubBalances();
    };
  }, []);

  // Data ter-scope periode (history). startDate → 'yyyy-MM'.
  const scoped = useMemo(
    () =>
      monthFilter === 'all'
        ? allLeaves
        : allLeaves.filter((l) => safeFormatDate(l.startDate, 'yyyy-MM') === monthFilter),
    [allLeaves, monthFilter],
  );

  useEffect(() => {
    setLeaves(scoped.filter((l) => l.status === activeTab));
    setCurrentPage(1);
  }, [activeTab, scoped]);

  const totalPages = Math.ceil(leaves.length / itemsPerPage);
  const paginatedLeaves = leaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  // Badge header: pending all-time (selalu actionable, tak ikut filter).
  const pendingCount = allLeaves.filter((l) => l.status === 'pending').length;

  // ── Recap periode terpilih ──
  const recap = useMemo(() => {
    const approved = scoped.filter((l) => l.status === 'approved');
    return {
      total: scoped.length,
      pending: scoped.filter((l) => l.status === 'pending').length,
      approved: approved.length,
      rejected: scoped.filter((l) => l.status === 'rejected').length,
      approvedDays: approved.reduce((s, l) => s + (l.totalDays || 0), 0),
    };
  }, [scoped]);

  const handleApprove = async (leave: LeaveRequest) => {
    const isConfirmed = await confirm({
      title: 'Setujui Cuti',
      message: `Setujui pengajuan ${leave.type} dari ${leave.employeeName}?`,
      variant: 'info',
      confirmLabel: 'Setujui',
      cancelLabel: 'Batal',
    });

    if (!isConfirmed) return;

    setProcessing(leave.id);
    try {
      await updateDoc(doc(db, 'leaves', leave.id), {
        status: 'approved',
        reviewedAt: serverTimestamp(),
        reviewedBy: reviewerName,
        updatedAt: serverTimestamp(),
      });
      // Notify user via userNotifications collection
      await addDoc(collection(db, 'userNotifications'), {
        userId: leave.userId,
        title: 'Pengajuan Disetujui ✅',
        message: `Pengajuan ${LEAVE_TYPES[leave.type] ?? leave.type} Anda telah disetujui oleh ${reviewerName}.`,
        type: 'leave_request',
        relatedId: leave.id,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      toast.success('Pengajuan cuti disetujui');
    } catch (err) {
      console.error('Approve failed:', err);
      toast.error('Gagal menyetujui pengajuan.');
    } finally {
      setProcessing(null);
    }
  };

  const openReject = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedLeave || !rejectReason.trim()) return;
    setProcessing(selectedLeave.id);
    try {
      await updateDoc(doc(db, 'leaves', selectedLeave.id), {
        status: 'rejected',
        rejectionReason: rejectReason,
        adminReason: rejectReason,
        reviewedAt: serverTimestamp(),
        reviewedBy: reviewerName,
        updatedAt: serverTimestamp(),
      });
      // Notify user with rejection reason
      await addDoc(collection(db, 'userNotifications'), {
        userId: selectedLeave.userId,
        title: 'Pengajuan Ditolak ❌',
        message: `Pengajuan ${LEAVE_TYPES[selectedLeave.type] ?? selectedLeave.type} Anda ditolak oleh ${reviewerName}. Alasan: ${rejectReason}`,
        type: 'leave_request',
        relatedId: selectedLeave.id,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      toast.success('Pengajuan cuti ditolak');
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      console.error('Reject failed:', err);
      toast.error('Gagal menolak pengajuan.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (leave: LeaveRequest) => {
    const isConfirmed = await confirm({
      title: 'Hapus Pengajuan Izin',
      message: `Yakin hapus pengajuan ${LEAVE_TYPES[leave.type] ?? leave.type} dari ${leave.employeeName}? Tindakan ini permanen dan tidak bisa dibatalkan.`,
      variant: 'danger',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
    });
    if (!isConfirmed) return;

    setProcessing(leave.id);
    try {
      await deleteDoc(doc(db, 'leaves', leave.id));
      toast.success('Pengajuan izin dihapus');
    } catch (err) {
      console.error('Delete leave failed:', err);
      toast.error('Gagal menghapus pengajuan.');
    } finally {
      setProcessing(null);
    }
  };

  const openBalanceModal = (emp: EmployeeRow) => {
    const bal = balances.find((b) => b.userId === emp.uid) || {
      annualQuota: 12,
      usedAnnual: 0,
      usedSick: 0,
      usedPermission: 0,
    };
    setSelectedBalance({ ...emp, ...bal });
    setEditBalance({
      annualQuota: bal.annualQuota,
      usedAnnual: bal.usedAnnual,
      usedSick: bal.usedSick,
      usedPermission: bal.usedPermission,
    });
    setShowBalanceModal(true);
  };

  const handleUpdateBalance = async () => {
    if (!selectedBalance) return;
    setProcessing(selectedBalance.uid);
    try {
      await updateDoc(doc(db, 'leave_balances', selectedBalance.uid), {
        ...editBalance,
        updatedAt: serverTimestamp(),
        updatedBy: reviewerName,
      });
      toast.success(`Saldo cuti ${selectedBalance.name} diperbarui`);
      setShowBalanceModal(false);
    } catch (err) {
      console.error('Update balance failed:', err);
      // If doc doesn't exist, try setDoc (not imported yet, so I'll just use a try-catch for updateDoc failure then setDoc)
      // Actually updateDoc might fail if it doesn't exist.
      try {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'leave_balances', selectedBalance.uid), {
          ...editBalance,
          updatedAt: serverTimestamp(),
          updatedBy: reviewerName,
        });
        toast.success(`Saldo cuti ${selectedBalance.name} dibuat`);
        setShowBalanceModal(false);
      } catch {
        toast.error('Gagal memperbarui saldo.');
      }
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 size={28} className="animate-spin text-emerald-500" />
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          Memuat data cuti...
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
            Cuti <span style={{ color: '#E31E24' }}>& Izin</span>
          </h1>
          <p className="text-[12px] text-slate-400 mt-1 font-medium">
            Kelola pengajuan ketidakhadiran karyawan JNE Martapura
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Filter periode (history) */}
          <div className="flex items-center gap-2 h-10 px-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Calendar size={14} className="text-emerald-500 shrink-0" />
            <input
              type="month"
              value={monthFilter === 'all' ? '' : monthFilter}
              onChange={(e) => setMonthFilter(e.target.value || 'all')}
              className="bg-transparent border-none text-[12px] font-semibold text-slate-700 outline-none cursor-pointer w-28"
            />
          </div>
          {monthFilter !== 'all' && (
            <button
              onClick={() => setMonthFilter('all')}
              className="h-10 px-3 rounded-xl bg-slate-100 text-slate-500 text-[11px] font-bold hover:bg-slate-200 transition-all"
            >
              Semua
            </button>
          )}
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-[12px] font-bold text-amber-700">{pendingCount} menunggu</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── RECAP STRIP (ikut filter periode) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Menunggu',
            val: recap.pending,
            dot: 'bg-amber-400',
            text: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Disetujui',
            val: recap.approved,
            dot: 'bg-emerald-400',
            text: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Ditolak',
            val: recap.rejected,
            dot: 'bg-red-400',
            text: 'text-red-500',
            bg: 'bg-red-50',
          },
          {
            label: 'Total Hari Cuti',
            val: recap.approvedDays,
            dot: 'bg-sky-400',
            text: 'text-sky-600',
            bg: 'bg-sky-50',
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
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex-1 h-10 px-4 rounded-xl text-[12px] font-bold transition-all ${
              activeTab === tab.key ? 'text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="leaves-tab-pill"
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

      {/* ── LEAVE CARDS ── */}
      {activeTab !== 'balances' && leaves.length === 0 ? (
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
          <p className="text-[13px] font-bold text-slate-700">Tidak ada pengajuan</p>
          <p className="text-[11px] text-slate-400 mt-1">Tidak ada data dalam kategori ini</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeTab === 'balances' ? (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider">
                      Karyawan
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider">
                      Quota Tahunan
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider">
                      Terpakai (Cuti/Sakit)
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => {
                    const bal = balances.find((b) => b.userId === emp.uid) || {
                      annualQuota: 12,
                      usedAnnual: 0,
                      usedSick: 0,
                    };
                    return (
                      <tr key={emp.uid} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                              {emp.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{emp.name}</p>
                              <p className="text-[10px] text-slate-400">{emp.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {bal.annualQuota} Hari
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-emerald-600 font-bold">{bal.usedAnnual}</span> /{' '}
                          <span className="text-red-500 font-bold">{bal.usedSick}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openBalanceModal(emp)}
                            className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                          >
                            Atur Saldo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {paginatedLeaves.map((leave, i) => (
                <motion.div
                  key={leave.id}
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
                          {leave.employeeName?.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <p className="text-desc font-bold text-slate-800 leading-tight">
                        {leave.employeeName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {leave.employeeId}
                      </p>
                    </div>

                    {/* Right: Leave details */}
                    <div className="flex-1 p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Jenis Pengajuan
                          </p>
                          <span className="inline-flex px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[12px] font-bold border border-emerald-200">
                            {LEAVE_TYPES[leave.type] ?? leave.type}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Durasi
                          </p>
                          <div className="flex items-center gap-2">
                            <Calendar size={13} className="text-slate-400" />
                            <p className="text-[13px] font-bold text-slate-800">
                              {safeFormatDate(leave.startDate, 'dd MMM')}{' '}
                              <span className="text-slate-400">→</span>{' '}
                              {safeFormatDate(leave.endDate, 'dd MMM yyyy')}
                              {leave.totalDays ? (
                                <span className="ml-1 text-emerald-600">({leave.totalDays}h)</span>
                              ) : null}
                            </p>
                          </div>
                        </div>
                      </div>

                      {leave.reason && (
                        <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 mb-4">
                          <div className="flex items-start gap-2">
                            <FileText size={12} className="text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-[12px] text-slate-600 italic">
                              &quot;{leave.reason}&quot;
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between flex-wrap gap-3">
                        {leave.status === 'approved' && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <UserCheck size={12} />
                            Disetujui oleh{' '}
                            <span className="font-bold text-slate-600">
                              {leave.reviewedBy || 'Admin'}
                            </span>
                          </div>
                        )}
                        {leave.status === 'rejected' && leave.rejectionReason && (
                          <p className="text-[11px] text-red-500 italic">
                            Ditolak: {leave.rejectionReason}
                          </p>
                        )}
                        {leave.status !== 'pending' && <span />}

                        <div className="flex items-center gap-2 ml-auto">
                          {leave.status === 'pending' ? (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => openReject(leave)}
                                disabled={!!processing}
                                className="flex items-center gap-1.5 h-9 px-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-[12px] font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
                              >
                                <XCircle size={14} /> Tolak
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleApprove(leave)}
                                disabled={!!processing}
                                className="flex items-center gap-1.5 h-9 px-4 text-white rounded-xl text-[12px] font-bold disabled:opacity-50"
                                style={{ background: '#10B981', boxShadow: 'none' }}
                              >
                                {processing === leave.id ? (
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
                              onClick={() => handleDelete(leave)}
                              disabled={!!processing}
                              className="flex items-center gap-1.5 h-9 px-3 bg-white border border-slate-200 text-slate-400 rounded-xl text-[11px] font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
                              title="Hapus pengajuan ini"
                            >
                              {processing === leave.id ? (
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
          )}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* ── BALANCE MODAL ── */}
      <Modal
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        title="Pengaturan Saldo Karyawan"
        maxWidth={480}
      >
        <div className="flex flex-col gap-5 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-desc font-bold text-slate-800">{selectedBalance?.name}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest">
              {selectedBalance?.employeeId}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Quota Tahunan
              </label>
              <input
                type="number"
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-emerald-400 transition-all"
                value={editBalance.annualQuota}
                onChange={(e) =>
                  setEditBalance({ ...editBalance, annualQuota: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Cuti Terpakai
              </label>
              <input
                type="number"
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-emerald-400 transition-all"
                value={editBalance.usedAnnual}
                onChange={(e) =>
                  setEditBalance({ ...editBalance, usedAnnual: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Sakit Terpakai
              </label>
              <input
                type="number"
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-emerald-400 transition-all"
                value={editBalance.usedSick}
                onChange={(e) =>
                  setEditBalance({ ...editBalance, usedSick: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Izin Terpakai
              </label>
              <input
                type="number"
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-emerald-400 transition-all"
                value={editBalance.usedPermission}
                onChange={(e) =>
                  setEditBalance({ ...editBalance, usedPermission: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => setShowBalanceModal(false)}
              className="flex-1 h-11 rounded-xl bg-slate-100 text-slate-600 text-[12px] font-bold"
            >
              Batal
            </button>
            <button
              onClick={handleUpdateBalance}
              disabled={!!processing}
              className="flex-1 h-11 rounded-xl text-white text-[12px] font-bold disabled:opacity-50"
              style={{ background: '#10B981' }}
            >
              {processing === selectedBalance?.uid ? (
                <Loader2 size={16} className="animate-spin mx-auto" />
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── REJECT MODAL ── */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Alasan Penolakan"
        maxWidth={480}
      >
        <div className="flex flex-col gap-4 pt-2">
          <p className="text-[12px] text-slate-500">
            Berikan alasan mengapa pengajuan{' '}
            <span className="font-bold text-slate-800">{selectedLeave?.employeeName}</span> ditolak.
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
