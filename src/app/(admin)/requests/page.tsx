'use client';

import { useState, useEffect } from 'react';
import {
  subscribeToLeaves,
  subscribeToOvertimes,
  updateLeaveStatus,
  updateOvertimeStatus,
  approveLeave,
  refundLeaveBalance,
} from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  CheckCircle,
  XCircle,
  Inbox,
  Loader2,
  Search,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  Building2,
  Trash2,
  Download,
  type LucideIcon,
} from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';

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

interface RequestItem {
  id?: string;
  source?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  reason?: string;
  notes?: string;
  department?: string;
  employeeName?: string;
  employeeId?: string;
  overtimeHours?: number;
  [key: string]: unknown;
}

// ── Types & Constants ─────────────────────────────────────────

const TABS = [
  {
    key: 'pending',
    label: 'Menunggu',
    activeText: 'text-amber-600 dark:text-amber-400',
    activeBg: 'bg-amber-50 dark:bg-amber-500/10',
    activeBorder: 'border-amber-200 dark:border-amber-500/25',
    dot: 'bg-amber-500',
  },
  {
    key: 'approved',
    label: 'Disetujui',
    activeText: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    activeBorder: 'border-emerald-200 dark:border-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  {
    key: 'rejected',
    label: 'Ditolak',
    activeText: 'text-red-500 dark:text-red-400',
    activeBg: 'bg-red-50 dark:bg-red-500/10',
    activeBorder: 'border-red-200 dark:border-red-500/25',
    dot: 'bg-red-500',
  },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const TYPE_LABELS: Record<string, string> = {
  sick: 'Sakit',
  annual: 'Cuti Tahunan',
  permission: 'Izin Mendadak',
  personal: 'Keperluan Pribadi',
};

const TYPE_COLORS: Record<string, string> = {
  sick: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
  annual: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  permission: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  personal: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
};

function getLabel(req: RequestItem | null): string {
  if (!req) return 'Permintaan';
  if (req.source === 'leave') return TYPE_LABELS[req.type ?? ''] ?? 'Izin';
  return 'Lembur';
}

function getTypeCls(req: RequestItem): string {
  if (req.source === 'overtime')
    return 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400';
  return (
    TYPE_COLORS[req.type ?? ''] ??
    'bg-slate-100 text-slate-500 dark:bg-slate-500/15 dark:text-slate-400'
  );
}

function getInitial(name?: string) {
  return name?.charAt(0)?.toUpperCase() ?? '?';
}

// ── Sub-components ────────────────────────────────────────────

function Avatar({ name, isSOS }: { name?: string; isSOS: boolean }) {
  if (isSOS) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
        <AlertTriangle size={20} className="text-red-500 dark:text-red-400" />
      </div>
    );
  }
  return (
    <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center font-black text-[15px] shrink-0 text-emerald-700 dark:text-emerald-400">
      {getInitial(name)}
    </div>
  );
}

function TypeChip({ req }: { req: RequestItem }) {
  const label = req.type === 'SOS' ? 'SOS' : getLabel(req);
  const cls =
    req.type === 'SOS'
      ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
      : getTypeCls(req);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide ${cls}`}
    >
      <FileText size={9} />
      {label}
    </span>
  );
}

// ── Request Card ──────────────────────────────────────────────
function RequestCard({
  req,
  i,
  onApprove,
  onReject,
  onDelete,
}: {
  req: RequestItem;
  i: number;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  const isSOS = req.type === 'SOS';
  const isPending = req.status === 'pending';

  const periodText =
    req.source === 'leave'
      ? (() => {
          try {
            return `${format(toDate(req.startDate), 'dd MMM', { locale: idLocale })} – ${format(toDate(req.endDate), 'dd MMM yyyy', { locale: idLocale })}`;
          } catch {
            return req.startDate ?? '-';
          }
        })()
      : `${req.date ?? '-'} · ${req.overtimeHours ?? 0} jam lembur`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.28, delay: i * 0.04 }}
      className="relative overflow-hidden rounded-2xl border transition-all hover:shadow-md group"
      style={{
        background: 'var(--surface-card)',
        borderColor: 'var(--border-card)',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
      }}
    >
      {/* SOS top strip */}
      {isSOS && (
        <div className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-red-500 to-rose-400" />
      )}

      <div className="p-4 flex items-start gap-3.5">
        <Avatar name={req.employeeName} isSOS={isSOS} />

        <div className="flex-1 min-w-0">
          {/* Top row: name + type chip + actions */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span
                className="text-desc font-bold truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {req.employeeName ?? 'Karyawan'}
              </span>
              <TypeChip req={req} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {isPending ? (
                <>
                  <button
                    onClick={onReject}
                    className="h-8 px-3.5 rounded-xl text-[12px] font-bold transition-all
                               hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}
                  >
                    Tolak
                  </button>
                  <button
                    onClick={onApprove}
                    className="h-8 px-4 rounded-xl text-[12px] font-bold text-white transition-all
                               flex items-center gap-1.5 hover:opacity-90 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      boxShadow: '0 4px 12px -4px rgba(16,185,129,0.55)',
                    }}
                  >
                    <CheckCircle2 size={12} strokeWidth={2.5} />
                    Setujui
                  </button>
                </>
              ) : (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold ${
                    req.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                      : 'bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400'
                  }`}
                >
                  {req.status === 'approved' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {req.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                </div>
              )}
              <button
                onClick={onDelete}
                title="Hapus permintaan"
                className="h-8 w-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <span
              className="flex items-center gap-1.5 text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              <Calendar size={10} />
              {periodText}
            </span>
            {req.department && (
              <span
                className="flex items-center gap-1.5 text-[11px]"
                style={{ color: 'var(--text-muted)' }}
              >
                <Building2 size={10} />
                {req.department}
              </span>
            )}
          </div>

          {/* Reason */}
          {(req.reason || req.notes) && (
            <p
              className="text-[11px] italic mt-2 line-clamp-1 opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              &quot;{req.reason || req.notes}&quot;
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Empty State ───────────────────────────────────────────────
function EmptyState({ tab }: { tab: string }) {
  const map: Record<string, { icon: LucideIcon; text: string; sub: string }> = {
    pending: {
      icon: Inbox,
      text: 'Tidak ada permintaan menunggu',
      sub: 'Semua permintaan sudah diproses',
    },
    approved: {
      icon: CheckCircle2,
      text: 'Belum ada yang disetujui',
      sub: 'Permintaan yang disetujui akan muncul di sini',
    },
    rejected: {
      icon: XCircle,
      text: 'Tidak ada yang ditolak',
      sub: 'Permintaan yang ditolak akan muncul di sini',
    },
  };
  const { icon: Icon, text, sub } = map[tab] ?? { icon: Inbox, text: 'Tidak ada data', sub: '' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-20 flex flex-col items-center gap-4"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--surface-hover)' }}
      >
        <Icon size={24} className="text-slate-300 dark:text-slate-600" />
      </motion.div>
      <div className="text-center space-y-1">
        <p
          className="text-[12px] font-bold uppercase tracking-widest"
          style={{ color: 'var(--text-dim)' }}
        >
          {text}
        </p>
        <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {sub}
        </p>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function RequestCenterPage() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [allRequests, setAllRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState<RequestItem | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // ── Firestore listeners ──────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    let leavesData: RequestItem[] = [];
    let overtimeData: RequestItem[] = [];

    const timeOf = (v: unknown) => new Date((v ?? 0) as string | number).getTime();
    const merge = () => {
      const combined = [...leavesData, ...overtimeData].sort(
        (a, b) => timeOf(b.createdAt) - timeOf(a.createdAt),
      );
      setAllRequests(combined);
      setLoading(false);
    };

    // Cuti dari koleksi `leaves`, lembur dari koleksi `overtime` (BUKAN
    // `attendance` — itu bug lama). Keduanya client-sorted, tak butuh index.
    const unsubLeaves = subscribeToLeaves('all', (data) => {
      leavesData = data.map((l) => ({ ...l, source: 'leave' }));
      merge();
    });

    const unsubOvertime = subscribeToOvertimes('all', (data) => {
      overtimeData = data.map((o) => ({ ...o, source: 'overtime' }));
      merge();
    });

    return () => {
      unsubLeaves();
      unsubOvertime();
    };
  }, []);

  // ── Filtering ────────────────────────────────────────────────
  const filtered = allRequests.filter((r) => {
    const matchTab = r.status === activeTab;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      (r.employeeName ?? '').toLowerCase().includes(q) ||
      (r.employeeId ?? '').toLowerCase().includes(q) ||
      (r.department ?? '').toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const countFor = (key: TabKey) => allRequests.filter((r) => r.status === key).length;

  const pendingCount = countFor('pending');

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error('Tidak ada data untuk diekspor.');
      return;
    }
    exportToCsv(
      `Permintaan_${activeTab}`,
      ['Nama', 'Employee ID', 'Departemen', 'Jenis', 'Tipe', 'Periode', 'Status', 'Alasan'],
      filtered.map((r) => {
        const period =
          r.source === 'leave'
            ? `${r.startDate ?? ''}${r.endDate ? ' s/d ' + r.endDate : ''}`
            : `${r.date ?? ''}${r.overtimeHours ? ' (' + r.overtimeHours + ' jam)' : ''}`;
        return [
          r.employeeName ?? '',
          r.employeeId ?? '',
          r.department ?? '',
          r.source === 'leave' ? 'Cuti/Izin' : 'Lembur',
          getLabel(r),
          period,
          r.status ?? '',
          r.reason || r.notes || '',
        ];
      }),
    );
    toast.success(`${filtered.length} permintaan diekspor`);
  };

  // ── Actions ──────────────────────────────────────────────────
  const openAction = (req: RequestItem, type: 'approve' | 'reject') => {
    setSelectedReq(req);
    setActionType(type);
    setReason('');
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selectedReq || (actionType === 'reject' && !reason.trim())) return;
    const status = actionType === 'approve' ? 'approved' : 'rejected';
    const prev = [...allRequests];

    setAllRequests((p) => p.map((r) => (r.id === selectedReq.id ? { ...r, status } : r)));
    setShowModal(false);
    setProcessing(true);

    try {
      // Update doc di koleksi yang benar (leaves / overtime). Notifikasi ke
      // karyawan ditangani Cloud Function (onLeaveStatusUpdate /
      // onOvertimeStatusUpdate) — jadi tidak perlu tulis notifikasi manual.
      const reviewer = user?.name ?? 'Admin';
      if (selectedReq.source === 'leave') {
        if (status === 'approved') {
          // Approve cuti = potong saldo (cuti tahunan diblok kalau habis).
          const res = await approveLeave(
            {
              id: selectedReq.id!,
              userId: String(selectedReq.userId ?? ''),
              type: String(selectedReq.type ?? ''),
              totalDays: Number(selectedReq.totalDays ?? 1),
            },
            reviewer,
          );
          if (!res.ok) {
            setAllRequests(prev);
            toast.error(res.error || 'Tidak bisa menyetujui pengajuan ini.');
            return;
          }
        } else {
          await updateLeaveStatus(selectedReq.id!, status, reviewer, reason || undefined);
        }
      } else {
        await updateOvertimeStatus(selectedReq.id!, status, reviewer, reason || undefined);
      }
      toast.success(`Permintaan berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`);
    } catch (error) {
      console.error('Error handling request action:', error);
      setAllRequests(prev);
      toast.error('Gagal memproses permintaan. Silakan coba lagi.');
    } finally {
      setProcessing(false);
      setReason('');
    }
  };

  const handleDelete = async (req: RequestItem) => {
    const ok = await confirm({
      title: 'Hapus Permintaan',
      message: `Hapus permintaan ${getLabel(req)} dari ${req.employeeName ?? 'karyawan'}? Tindakan ini permanen.`,
      variant: 'danger',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
    });
    if (!ok || !req.id) return;
    const prev = [...allRequests];
    setAllRequests((p) => p.filter((r) => r.id !== req.id));
    try {
      // Kalau pengajuan cuti ini sempat memotong saldo, kembalikan dulu.
      if (req.source === 'leave') {
        await refundLeaveBalance({
          userId: String(req.userId ?? ''),
          balanceApplied: Boolean(req.balanceApplied),
          balanceDays: Number(req.balanceDays ?? 0) || undefined,
          balanceField: typeof req.balanceField === 'string' ? req.balanceField : undefined,
          type: typeof req.type === 'string' ? req.type : undefined,
          totalDays: Number(req.totalDays ?? 0) || undefined,
        });
      }
      await deleteDoc(doc(db, req.source === 'leave' ? 'leaves' : 'overtime', req.id));
      toast.success('Permintaan dihapus');
    } catch (e) {
      console.error('Delete request failed:', e);
      setAllRequests(prev);
      toast.error('Gagal menghapus. Coba lagi.');
    }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
              <Inbox size={12} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Kotak Masuk
            </span>
          </div>
          <h1
            className="editorial-heading text-[24px] font-black tracking-tight leading-none"
            style={{ color: 'var(--text-primary)' }}
          >
            Pusat <span className="text-[#E31E24]">Permintaan</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-bold hover:bg-emerald-100 transition-all dark:bg-emerald-500/10 dark:border-emerald-500/25 dark:text-emerald-400"
          >
            <Download size={14} className="shrink-0" />
            Export CSV
          </button>
          {pendingCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2.5 px-4 py-2 rounded-2xl border
                         bg-amber-50 dark:bg-amber-500/10
                         border-amber-200 dark:border-amber-500/20"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-[13px] font-bold text-amber-600 dark:text-amber-400">
                {pendingCount} menunggu
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── STAT TABS ── */}
      <div className="grid grid-cols-3 gap-3">
        {TABS.map((tab, i) => {
          const count = countFor(tab.key);
          const isActive = activeTab === tab.key;

          return (
            <motion.button
              key={tab.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setActiveTab(tab.key)}
              className={`relative text-left p-4 rounded-2xl border transition-all duration-300 ${
                isActive ? `${tab.activeBg} ${tab.activeBorder}` : 'hover:shadow-md'
              }`}
              style={
                !isActive
                  ? {
                      background: 'var(--surface-card)',
                      borderColor: 'var(--border-card)',
                      boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                    }
                  : undefined
              }
            >
              <p
                className={`text-h1 font-black leading-none tabular-nums ${isActive ? tab.activeText : ''}`}
                style={!isActive ? { color: 'var(--text-primary)' } : undefined}
              >
                {count}
              </p>
              <p
                className={`text-[11px] font-semibold mt-1 ${isActive ? tab.activeText : ''}`}
                style={!isActive ? { color: 'var(--text-dim)' } : undefined}
              >
                {tab.label}
              </p>

              {isActive && (
                <motion.div
                  layoutId="tab-bar"
                  className={`absolute bottom-0 inset-x-3 h-0.5 rounded-full ${tab.dot} opacity-40`}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── SEARCH ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.22 }}
        className="relative"
      >
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"
        />
        <input
          type="text"
          placeholder="Cari nama karyawan, ID, atau departemen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 rounded-xl pl-9 pr-4 text-[13px] outline-none transition-all
                     focus:ring-2 focus:ring-emerald-400/20 border"
          style={{
            background: 'var(--surface-card)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-default)',
          }}
        />
      </motion.div>

      {/* ── LIST ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-emerald-500" size={26} />
          <p
            className="text-[12px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-dim)' }}
          >
            Memuat data...
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((req, i) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  i={i}
                  onApprove={() => openAction(req, 'approve')}
                  onReject={() => openAction(req, 'reject')}
                  onDelete={() => handleDelete(req)}
                />
              ))
            ) : (
              <EmptyState key="empty" tab={activeTab} />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── CONFIRM MODAL ── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={actionType === 'approve' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}
      >
        <div className="space-y-5">
          {/* Employee info card */}
          <div
            className="p-4 rounded-2xl border"
            style={{ background: 'var(--surface-hover)', borderColor: 'var(--border-card)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400 dark:text-slate-500">
              Permintaan dari
            </p>
            <p className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>
              {selectedReq?.employeeName}
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {getLabel(selectedReq)} ·{' '}
              {selectedReq?.reason || selectedReq?.notes || 'Tanpa keterangan'}
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block text-slate-400 dark:text-slate-500">
              Catatan Admin {actionType === 'reject' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              className="w-full h-28 p-4 rounded-xl text-[13px] outline-none resize-none transition-all
                         focus:ring-2 focus:ring-emerald-400/20 border"
              style={{
                background: 'var(--surface-card)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-default)',
              }}
              placeholder={
                actionType === 'approve'
                  ? 'Tambahkan catatan (opsional)...'
                  : 'Wajib memberikan alasan penolakan...'
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 h-11 rounded-xl text-[13px] font-bold transition-all
                         hover:opacity-80"
              style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}
            >
              Batal
            </button>
            <button
              onClick={handleAction}
              disabled={processing || (actionType === 'reject' && !reason.trim())}
              className={`flex-1 h-11 rounded-xl text-[13px] font-bold text-white transition-all
                          flex items-center justify-center gap-2 disabled:opacity-50 ${
                            actionType === 'approve'
                              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25'
                              : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'
                          }`}
            >
              {processing ? (
                <Loader2 className="animate-spin" size={16} />
              ) : actionType === 'approve' ? (
                <>
                  <CheckCircle2 size={14} /> Setujui
                </>
              ) : (
                <>
                  <XCircle size={14} /> Tolak
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
