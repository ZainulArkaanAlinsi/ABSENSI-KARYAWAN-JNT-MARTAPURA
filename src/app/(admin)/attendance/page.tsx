'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, UserCheck, Clock, UserMinus, Calendar,
  Search, ChevronRight, History, FileText,
  AlertCircle, ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import Link from 'next/link';

// ─── Status ───────────────────────────────────────────────────
const S: Record<string, { label: string; cls: string }> = {
  present:  { label: 'Hadir',  cls: 'bg-emerald-100 text-emerald-700' },
  late:     { label: 'Telat',  cls: 'bg-amber-100   text-amber-700'   },
  absent:   { label: 'Absen',  cls: 'bg-red-100     text-red-600'     },
  leave:    { label: 'Izin',   cls: 'bg-blue-100    text-blue-700'    },
  overtime: { label: 'Lembur', cls: 'bg-violet-100  text-violet-700'  },
};

function Badge({ status }: { status: string }) {
  const s = S[status] ?? S.absent;
  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─── Stat box ─────────────────────────────────────────────────
function Stat({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border"
         style={{ borderColor: 'var(--border-default)' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
           style={{ background: `${color}15` }}>
        <Icon size={17} style={{ color }} strokeWidth={2.2} />
      </div>
      <div>
        <p className="text-[22px] font-black leading-none tabular-nums"
           style={{ color: 'var(--text-primary)' }}>{value ?? 0}</p>
        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b" style={{ borderColor: 'var(--border-default)' }}>
      {[180, 90, 70, 80, 20].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3 bg-slate-100 rounded-full animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function AttendancePage() {
  const router = useRouter();
  const { data: stats, loading } = useDashboardStats();
  const [search,    setSearch]    = useState('');
  const [activeTab, setActiveTab] = useState('Semua');

  const tabs = useMemo(() => {
    const depts = stats?.departmentDistribution?.map((d: any) => d.name) ?? [];
    return ['Semua', ...depts];
  }, [stats]);

  const filtered = useMemo(() => {
    if (!stats?.recentActivities) return [];
    return stats.recentActivities.filter((p: any) => {
      const q = search.toLowerCase();
      return (
        (!q || p.userName.toLowerCase().includes(q) || (p.employeeId ?? '').toLowerCase().includes(q)) &&
        (activeTab === 'Semua' || p.department === activeTab)
      );
    });
  }, [stats, search, activeTab]);

  const presentRate = stats?.totalEmployees
    ? Math.round(((stats.presentToday ?? 0) / stats.totalEmployees) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4 pb-8 max-w-6xl mx-auto">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between pt-1"
      >
        <div>
          <h1 className="text-[20px] font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Absensi Karyawan
          </h1>
          <p className="text-[12px] text-slate-400 mt-0.5">Monitoring kehadiran hari ini</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/attendance/history">
            <button className="h-8 px-3.5 text-[12px] font-semibold rounded-lg border transition-colors hover:bg-slate-50 flex items-center gap-1.5"
                    style={{ borderColor: 'var(--border-default)', color: 'var(--text-dim)' }}>
              <History size={13} /> Riwayat
            </button>
          </Link>
          <Link href="/attendance/live">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="h-8 px-3.5 text-[12px] font-bold rounded-lg text-white flex items-center gap-1.5"
              style={{ background: '#E31E24' }}
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-white"
              />
              Live
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* ── STATS ROW ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <Stat label="Hadir Hari Ini" value={stats?.presentToday ?? 0} icon={UserCheck} color="#10B981" />
        <Stat label="Terlambat"      value={stats?.lateToday    ?? 0} icon={Clock}     color="#F59E0B" />
        <Stat label="Belum Absen"    value={stats?.absentToday  ?? 0} icon={UserMinus} color="#E31E24" />
        <Stat label="Izin / Cuti"    value={stats?.onLeaveToday ?? 0} icon={Calendar}  color="#005596" />
      </motion.div>

      {/* ── ATTENDANCE RATE BAR ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-xl border px-5 py-3.5 flex items-center gap-4"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500">Tingkat Kehadiran</span>
            <span className="text-[13px] font-black" style={{ color: presentRate >= 80 ? '#10B981' : presentRate >= 60 ? '#F59E0B' : '#E31E24' }}>
              {presentRate}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${presentRate}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="h-full rounded-full"
              style={{ background: presentRate >= 80 ? '#10B981' : presentRate >= 60 ? '#F59E0B' : '#E31E24' }}
            />
          </div>
        </div>
        <span className="text-[12px] text-slate-400 font-semibold shrink-0">
          {stats?.presentToday ?? 0} / {stats?.totalEmployees ?? 0} orang
        </span>
      </motion.div>

      {/* ── MAIN TABLE CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-white rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--border-default)' }}
      >
        {/* Toolbar */}
        <div className="px-4 py-3 border-b flex flex-col sm:flex-row gap-2.5"
             style={{ borderColor: 'var(--border-default)' }}>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-8 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 text-[12px] font-medium outline-none focus:border-slate-400 transition-colors"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          {/* Dept filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.slice(0, 6).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative shrink-0 h-8 px-3 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="dept-tab"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: '#E31E24' }}
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="sm:ml-auto flex items-center gap-1.5">
            <Link href="/attendance/leaves">
              <button className="h-8 px-3 text-[11px] font-semibold rounded-lg border transition-colors hover:bg-slate-50 flex items-center gap-1"
                      style={{ borderColor: 'var(--border-default)', color: 'var(--text-dim)' }}>
                <FileText size={12} /> Izin
              </button>
            </Link>
            <Link href="/attendance/requests">
              <button className="h-8 px-3 text-[11px] font-semibold rounded-lg border transition-colors hover:bg-slate-50 flex items-center gap-1"
                      style={{ borderColor: 'var(--border-default)', color: 'var(--text-dim)' }}>
                <AlertCircle size={12} /> Koreksi
              </button>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border-default)' }}>
                <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400 w-[200px]">Karyawan</th>
                <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Departemen</th>
                <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Jam Masuk</th>
                <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Jam Keluar</th>
                <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-4 py-2.5 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y" style={{ '--tw-divide-opacity': 1 } as any}>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Users size={18} className="text-slate-300" />
                      </div>
                      <p className="text-[11px] font-semibold text-slate-400">
                        {search ? `Tidak ditemukan "${search}"` : 'Belum ada data hari ini'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filtered.map((p: any, i: number) => (
                    <motion.tr
                      key={p.id ?? i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b group cursor-pointer transition-colors"
                      style={{ borderColor: 'var(--border-default)' }}
                      onClick={() => router.push('/attendance/history')}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      {/* Name + ID */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-black shrink-0">
                            {p.userName?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                              {p.userName}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{p.employeeId || '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Dept */}
                      <td className="px-4 py-3">
                        <span className="text-[12px] font-medium text-slate-500">{p.department || '—'}</span>
                      </td>

                      {/* Check-in */}
                      <td className="px-4 py-3">
                        <span className="text-[13px] font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                          {p.checkIn || '—'}
                        </span>
                      </td>

                      {/* Check-out */}
                      <td className="px-4 py-3">
                        <span className="text-[12px] tabular-nums text-slate-400">
                          {p.checkOut || '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge status={p.status} />
                      </td>

                      {/* Arrow */}
                      <td className="px-4 py-3">
                        <ChevronRight size={13} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t flex items-center justify-between"
             style={{ borderColor: 'var(--border-default)', background: 'var(--surface-hover)' }}>
          <p className="text-[11px] text-slate-400">
            Menampilkan <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{filtered.length}</span> karyawan
          </p>
          <Link href="/attendance/history">
            <span className="text-[11px] font-bold flex items-center gap-1 cursor-pointer" style={{ color: '#005596' }}>
              Lihat Semua Riwayat <ArrowUpRight size={11} />
            </span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
