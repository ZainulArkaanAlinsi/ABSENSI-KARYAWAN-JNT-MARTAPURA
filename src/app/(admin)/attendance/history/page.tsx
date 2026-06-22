'use client';

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { getAttendanceByRange, deleteAttendance, updateAttendance } from '@/lib/firestore';
import type { AttendanceRecord } from '@/types';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { safeFormatDate, safeFormatTime } from '@/utils/dateFormatters';
import {
  Search,
  Calendar,
  Filter,
  ArrowLeft,
  Building2,
  ChevronLeft,
  ChevronRight,
  History,
  Clock3,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  type LucideIcon,
  AlertCircle,
  Clock,
  Camera,
  Trash2,
  Loader2,
  Pencil,
  X,
  Save,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';

// ─── Status Chip ──────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string; bg: string; text: string }> = {
    present: {
      label: 'Hadir',
      dot: 'bg-emerald-400',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
    late: { label: 'Telat', dot: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-700' },
    absent: { label: 'Absen', dot: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-600' },
    leave: { label: 'Izin', dot: 'bg-blue-400', bg: 'bg-blue-50', text: 'text-blue-700' },
    overtime: {
      label: 'Lembur',
      dot: 'bg-violet-400',
      bg: 'bg-violet-50',
      text: 'text-violet-700',
    },
  };
  const s = map[status] ?? map.absent;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Summary Card ─────────────────────────────────────────────
const SummaryCard = ({
  label,
  value,
  icon: Icon,
  color,
  bg,
  delay,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  color: string;
  bg: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
    className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3.5"
    style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
      <Icon size={18} className={color} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-[22px] font-black text-slate-800 leading-none tabular-nums">{value}</p>
    </div>
  </motion.div>
);

// ─── Skeleton Row ─────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    {[140, 100, 120, 80, 80, 36, 60, 32].map((w, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3.5 bg-slate-100 rounded-full animate-pulse" style={{ width: w }} />
      </td>
    ))}
  </tr>
);

const PAGE_SIZE = 15;

// ─── Main Page ────────────────────────────────────────────────
export default function AttendanceHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDept = searchParams.get('dept') || 'all';

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [deptFilter, setDeptFilter] = useState(initialDept);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { confirm } = useConfirm();

  // ── Edit (koreksi manual absensi) ──
  const [editRec, setEditRec] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState('present');
  const [editIn, setEditIn] = useState('');
  const [editOut, setEditOut] = useState('');
  const [saving, setSaving] = useState(false);

  // mapAttendance menormalkan time ke "HH:mm" string, tapi tipe-nya TimeValue
  // (union). Guard typeof string supaya type-safe untuk prefill <input type=time>.
  const toHHMM = (t: unknown): string =>
    typeof t === 'string' && /^\d{2}:\d{2}/.test(t) ? t.slice(0, 5) : '';

  const openEdit = (rec: AttendanceRecord) => {
    setEditRec(rec);
    setEditStatus(rec.status || 'present');
    setEditIn(toHHMM(rec.checkIn?.time));
    setEditOut(toHHMM(rec.checkOut?.time));
  };

  const handleSaveEdit = async () => {
    if (!editRec) return;
    setSaving(true);
    const mk = (hhmm: string): Date | null =>
      hhmm ? new Date(`${editRec.date}T${hhmm}:00`) : null;
    try {
      await updateAttendance(editRec.id, {
        status: editStatus,
        checkInTime: mk(editIn),
        checkOutTime: mk(editOut),
      });
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editRec.id
            ? ({
                ...r,
                status: editStatus as AttendanceRecord['status'],
                checkIn: editIn ? { ...r.checkIn, time: editIn } : undefined,
                checkOut: editOut ? { ...r.checkOut, time: editOut } : undefined,
              } as AttendanceRecord)
            : r,
        ),
      );
      toast.success('Absensi diperbarui');
      setEditRec(null);
    } catch (e) {
      console.error('Update attendance failed:', e);
      toast.error('Gagal menyimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rec: AttendanceRecord) => {
    const ok = await confirm({
      title: 'Hapus Catatan Absensi',
      message: `Hapus catatan absen ${rec.employeeName} tanggal ${safeFormatDate(rec.date, 'dd MMM yyyy')}? Tindakan ini permanen.`,
      variant: 'danger',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
    });
    if (!ok) return;
    setDeleting(rec.id);
    // Optimistic remove so the table reacts instantly even before Firestore
    // confirms (we re-add on failure).
    const snapshot = records;
    setRecords((prev) => prev.filter((r) => r.id !== rec.id));
    try {
      await deleteAttendance(rec.id);
      toast.success('Catatan absensi dihapus');
    } catch (e) {
      console.error('Delete attendance failed:', e);
      setRecords(snapshot);
      toast.error('Gagal menghapus. Coba lagi.');
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const fetchData = async () => {
      try {
        const d = parseISO(`${month}-01`);
        const start = format(startOfMonth(d), 'yyyy-MM-dd');
        const end = format(endOfMonth(d), 'yyyy-MM-dd');
        const data = await getAttendanceByRange(start, end);
        setRecords(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, deptFilter]);

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        const matchSearch =
          r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
          r.employeeId.toLowerCase().includes(search.toLowerCase());
        const matchDept = deptFilter === 'all' || r.department === deptFilter;
        return matchSearch && matchDept;
      }),
    [records, search, deptFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Computed summary from filtered records
  const summary = useMemo(
    () => ({
      total: filtered.length,
      present: filtered.filter((r) => ['present', 'overtime'].includes(r.status)).length,
      late: filtered.filter((r) => r.status === 'late').length,
      absent: filtered.filter((r) => r.status === 'absent').length,
    }),
    [filtered],
  );

  const depts = useMemo(() => {
    const set = new Set(records.map((r) => r.department).filter(Boolean));
    return Array.from(set);
  }, [records]);

  const handleExport = () => {
    const headers = ['Tanggal', 'Nama', 'ID', 'Unit', 'Status', 'Masuk', 'Keluar'];
    const rows = filtered.map((a) => [
      a.date,
      a.employeeName,
      a.employeeId,
      a.department,
      a.status,
      a.checkIn?.time ? safeFormatTime(a.checkIn.time) : '-',
      a.checkOut?.time ? safeFormatTime(a.checkOut.time) : '-',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Absensi_${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Kembali
          </button>
          <h1 className="editorial-heading text-[22px] font-black text-slate-800 tracking-tight leading-none">
            Riwayat <span className="text-[#E31E24]">Absensi</span>
          </h1>
          <p className="text-[12px] text-slate-400 mt-1 font-medium">
            Data kehadiran per bulan seluruh karyawan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Month picker */}
          <div className="flex items-center gap-2 h-9 px-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Calendar size={14} className="text-emerald-500 shrink-0" />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent border-none text-[12px] font-semibold text-slate-700 outline-none cursor-pointer w-28"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            className="inline-flex items-center gap-2 h-9 px-4 text-white rounded-xl text-[12px] font-bold shadow-md"
            style={{ background: '#10B981', boxShadow: 'none' }}
          >
            <FileSpreadsheet size={14} />
            Export CSV
          </motion.button>
        </div>
      </motion.div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="Total Record"
          value={summary.total}
          icon={Users}
          color="text-blue-500"
          bg="bg-blue-50"
          delay={0.06}
        />
        <SummaryCard
          label="Hadir"
          value={summary.present}
          icon={CheckCircle2}
          color="text-emerald-500"
          bg="bg-emerald-50"
          delay={0.1}
        />
        <SummaryCard
          label="Terlambat"
          value={summary.late}
          icon={Clock}
          color="text-amber-500"
          bg="bg-amber-50"
          delay={0.14}
        />
        <SummaryCard
          label="Tidak Hadir"
          value={summary.absent}
          icon={AlertCircle}
          color="text-red-500"
          bg="bg-red-50"
          delay={0.18}
        />
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
        <div className="relative flex items-center gap-2 h-10 px-3.5 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[180px]">
          <Building2 size={14} className="text-slate-400 shrink-0" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-transparent text-[12px] font-semibold text-slate-700 outline-none appearance-none cursor-pointer flex-1"
          >
            <option value="all">Semua Unit</option>
            {depts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <Filter size={12} className="text-slate-400 shrink-0" />
        </div>
      </div>

      {/* ── TABLE ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
        className="bg-white border border-slate-100 rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {[
                  'Karyawan',
                  'Tanggal',
                  'Unit / Dept',
                  'Jam Masuk',
                  'Jam Keluar',
                  'Foto',
                  'Status',
                  'Aksi',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <History size={24} className="text-slate-300" />
                      </div>
                      <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">
                        Tidak ada data ditemukan
                      </p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {paginated.map((rec, i) => (
                    <motion.tr
                      key={rec.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25, delay: i * 0.02 }}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Karyawan */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-[12px] font-bold shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            {rec.employeeName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-slate-800 leading-tight">
                              {rec.employeeName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {rec.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Tanggal */}
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-semibold text-slate-700">
                          {safeFormatDate(rec.date, 'dd MMM yyyy')}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {safeFormatDate(rec.date, 'EEEE')}
                        </p>
                      </td>

                      {/* Dept */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-semibold">
                          {rec.department || '-'}
                        </span>
                      </td>

                      {/* Jam Masuk */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Clock3 size={12} className="text-emerald-400" />
                          <span className="text-[13px] font-semibold text-slate-700 tabular-nums">
                            {safeFormatTime(rec.checkIn?.time)}
                          </span>
                        </div>
                      </td>

                      {/* Jam Keluar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Clock3 size={12} className="text-slate-300" />
                          <span className="text-[13px] font-semibold text-slate-500 tabular-nums">
                            {safeFormatTime(rec.checkOut?.time)}
                          </span>
                        </div>
                      </td>

                      {/* Foto check-in */}
                      <td className="px-5 py-3.5">
                        {rec.checkIn?.photoUrl ? (
                          <a
                            href={rec.checkIn.photoUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Lihat foto absen masuk"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element -- remote Firebase Storage photo in a static export; next/image optimization is disabled */}
                            <img
                              src={rec.checkIn.photoUrl}
                              alt="foto absen"
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 hover:border-emerald-400 hover:scale-110 transition-all shadow-sm cursor-zoom-in"
                            />
                          </a>
                        ) : (
                          <div
                            className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center"
                            title="Belum ada foto"
                          >
                            <Camera size={13} className="text-slate-300" />
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusChip status={rec.status} />
                      </td>

                      {/* Aksi — Edit & Delete */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(rec)}
                            title="Edit / koreksi absensi"
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(rec)}
                            disabled={deleting === rec.id}
                            title="Hapus catatan (reset agar bisa absen ulang)"
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
                          >
                            {deleting === rec.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
          <p className="text-[11px] text-slate-400 font-medium">
            Menampilkan{' '}
            <span className="font-bold text-slate-700">
              {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)}
            </span>{' '}
            dari <span className="font-bold text-slate-700">{filtered.length}</span> data
          </p>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-emerald-300 hover:text-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft size={15} />
            </motion.button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5 && page > 3) p = page - 2 + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all ${
                      page === p
                        ? 'text-white shadow-md'
                        : 'text-slate-500 bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                    }`}
                    style={page === p ? { background: '#10B981' } : {}}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-emerald-300 hover:text-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronRight size={15} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── EDIT / KOREKSI MODAL ── */}
      <AnimatePresence>
        {editRec && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !saving && setEditRec(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <h3 className="editorial-heading text-[16px] font-black text-slate-800">
                    Koreksi Absensi
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {editRec.employeeName} · {safeFormatDate(editRec.date, 'dd MMM yyyy')}
                  </p>
                </div>
                <button
                  onClick={() => !saving && setEditRec(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="mt-1.5 w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-[13px] font-semibold text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/15 transition-all cursor-pointer"
                  >
                    <option value="present">Hadir</option>
                    <option value="late">Telat</option>
                    <option value="absent">Absen</option>
                    <option value="leave">Izin</option>
                    <option value="overtime">Lembur</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Jam Masuk
                    </label>
                    <input
                      type="time"
                      value={editIn}
                      onChange={(e) => setEditIn(e.target.value)}
                      className="mt-1.5 w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-[13px] font-semibold text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Jam Keluar
                    </label>
                    <input
                      type="time"
                      value={editOut}
                      onChange={(e) => setEditOut(e.target.value)}
                      className="mt-1.5 w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-[13px] font-semibold text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/15 transition-all"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Kosongkan jam untuk menghapus check-in/out tsb. Untuk reset total agar
                  karyawan absen ulang dari awal, pakai tombol Hapus (ikon tong sampah).
                </p>
              </div>

              <div className="flex items-center gap-2.5 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => !saving && setEditRec(null)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 h-11 rounded-xl text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{ background: '#10B981' }}
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
