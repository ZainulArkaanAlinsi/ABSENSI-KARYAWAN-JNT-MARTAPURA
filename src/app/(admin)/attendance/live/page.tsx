'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Search,
  MapPin,
  Clock,
  Download,
  UserCheck,
  AlertCircle,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { subscribeToTodayAttendance } from '@/lib/firestore';
import { useDebounce } from '@/hooks/useDebounce';
import type { AttendanceRecord } from '@/types';

// ─── Status chip ─────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  present: { label: 'Hadir', dot: 'bg-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  late: { label: 'Telat', dot: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-700' },
  absent: { label: 'Absen', dot: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-600' },
  overtime: { label: 'Lembur', dot: 'bg-violet-400', bg: 'bg-violet-50', text: 'text-violet-700' },
};

function StatusChip({ status }: { status: string }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG.present;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Stat card ───────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  delay,
  accent = 'text-emerald-600',
  accentBg = 'bg-emerald-100',
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  delay: number;
  accent?: string;
  accentBg?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl px-5 py-4 border border-slate-100 flex items-center gap-4"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div className={`w-11 h-11 rounded-xl ${accentBg} flex items-center justify-center shrink-0`}>
        <Icon size={20} className={accent} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`text-[26px] font-black leading-none tabular-nums mt-0.5 ${accent}`}>
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────
const SkeletonRow = ({ i }: { i: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: i * 0.04 }}
    className="flex items-center gap-4 px-5 py-4 border-t border-slate-100"
  >
    <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-slate-100 rounded animate-pulse w-36" />
      <div className="h-2 bg-slate-100 rounded animate-pulse w-20" />
    </div>
    <div className="h-3 bg-slate-100 rounded animate-pulse w-24 hidden sm:block" />
    <div className="h-3 bg-slate-100 rounded animate-pulse w-16 hidden md:block" />
    <div className="h-6 bg-slate-100 rounded-full animate-pulse w-20" />
  </motion.div>
);

// ─── Page ────────────────────────────────────────────────────
type FilterType = 'all' | 'present' | 'late' | 'absent' | 'overtime';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'present', label: 'Hadir' },
  { value: 'late', label: 'Telat' },
  { value: 'absent', label: 'Absen' },
  { value: 'overtime', label: 'Lembur' },
];

export default function LiveAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const unsub = subscribeToTodayAttendance(
      format(new Date(), 'yyyy-MM-dd'),
      (data: AttendanceRecord[]) => {
        setAttendance(data);
        setLastUpdate(new Date());
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return attendance.filter((r) => {
      const matchSearch =
        !q || r.employeeName?.toLowerCase().includes(q) || r.employeeId?.toLowerCase().includes(q);
      const matchFilter = filter === 'all' || r.status === filter;
      return matchSearch && matchFilter;
    });
  }, [attendance, debouncedSearch, filter]);

  const stats = useMemo(
    () => ({
      total: attendance.length,
      present: attendance.filter((r) => ['present', 'late', 'overtime'].includes(r.status)).length,
      late: attendance.filter((r) => r.status === 'late').length,
      sos: attendance.filter((r) => r.isSos).length,
    }),
    [attendance],
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
          <h1 className="editorial-heading text-[22px] font-black text-slate-800 tracking-tight leading-none">
            Live <span className="text-[#E31E24]">Monitor</span>
          </h1>
          <p className="text-[12px] text-slate-400 mt-1 font-medium">
            Sinkronisasi real-time data absensi biometrik — diperbarui{' '}
            <span className="text-slate-600 font-semibold tabular-nums">
              {format(lastUpdate, 'HH:mm:ss')}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 h-9 px-4 bg-white border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-600 transition-all"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <Download size={14} />
            Export
          </motion.button>
        </div>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          delay={0.06}
          label="Total Records"
          value={stats.total}
          icon={Activity}
          accent="text-slate-700"
          accentBg="bg-slate-100"
        />
        <StatCard
          delay={0.1}
          label="Hadir Hari Ini"
          value={stats.present}
          icon={UserCheck}
          accent="text-emerald-600"
          accentBg="bg-emerald-100"
        />
        <StatCard
          delay={0.14}
          label="Telat Masuk"
          value={stats.late}
          icon={Clock}
          accent="text-amber-600"
          accentBg="bg-amber-100"
        />
        <StatCard
          delay={0.18}
          label="Alert SOS"
          value={stats.sos}
          icon={AlertCircle}
          accent="text-red-500"
          accentBg="bg-red-100"
        />
      </div>

      {/* ── FILTER BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-3"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Cari nama atau ID karyawan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:bg-white transition-all"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(opt.value)}
              className={`relative h-10 px-4 rounded-xl text-[12px] font-bold transition-all ${
                filter === opt.value
                  ? 'text-white'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {filter === opt.value && (
                <motion.div
                  layoutId="live-filter-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── LIVE FEED TABLE ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        {/* Table header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <p className="text-[13px] font-bold text-slate-700">
            Activity Stream
            <span className="ml-2 text-[11px] text-slate-400 font-medium">
              ({filtered.length} record)
            </span>
          </p>
          {!loading && (
            <RefreshCw
              size={13}
              className="text-slate-300 animate-spin"
              style={{ animationDuration: '3s' }}
            />
          )}
        </div>

        {/* Skeleton while loading */}
        {loading && (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} i={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 flex flex-col items-center text-center"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3"
            >
              <Inbox size={20} className="text-slate-300" />
            </motion.div>
            <p className="text-[13px] font-bold text-slate-700">Tidak ada aktivitas</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {search ? 'Coba kata kunci lain' : 'Belum ada data absensi hari ini'}
            </p>
          </motion.div>
        )}

        {/* Table rows */}
        {!loading && filtered.length > 0 && (
          <>
            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[1fr_140px_100px_90px] px-5 py-2.5 bg-slate-50 border-b border-slate-100">
              {['Karyawan', 'Departemen', 'Check-in', 'Status'].map((h) => (
                <p
                  key={h}
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </p>
              ))}
            </div>

            <div className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filtered.map((r, i) => (
                  <motion.div
                    key={r.id ?? i}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_140px_100px_90px] items-center px-5 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-[13px] font-bold shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        {r.employeeName?.charAt(0) ?? '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-desc font-bold text-slate-800 truncate leading-tight">
                          {r.employeeName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin size={9} className="text-slate-400 shrink-0" />
                          <p className="text-[10px] text-slate-400 font-medium truncate">
                            {r.employeeId}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Department */}
                    <p className="hidden sm:block text-[12px] font-medium text-slate-500 truncate pr-2">
                      {r.department ?? '—'}
                    </p>

                    {/* Check-in time */}
                    <p className="hidden sm:block text-[12px] font-semibold text-slate-600 tabular-nums">
                      {typeof r.checkIn?.time === 'string' ? r.checkIn.time.slice(0, 5) : '—'}
                    </p>

                    {/* Status */}
                    <div>
                      <StatusChip status={r.status} />
                      {r.isSos && (
                        <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-red-500 text-white uppercase tracking-wider">
                          SOS
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
