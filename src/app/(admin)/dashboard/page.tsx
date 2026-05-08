'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  UserCheck,
  TrendingUp,
  FileText,
  Clock8,
  MapPin,
  Filter,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { data: stats, weeklyData, loading } = useDashboardStats();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    // respect layout, jangan full-screen lagi
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-(--radius-apple)">
        <div className="w-12 h-12 border-4 border-cyan-600/10 border-t-cyan-600 dark:border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 bg-(--bg-main) transition-colors duration-500">
      {/* ROW 1: CORE METRICS */}
      <div className="grid grid-cols-12 gap-4">
        {[
          { label: 'Total Personel', value: stats?.totalEmployees, sub: 'Aktif di Martapura', icon: Users, color: '--metric-blue' },
          { label: 'Hadir Hari Ini', value: stats?.presentToday, sub: `${stats?.absentToday} Belum Absen`, icon: UserCheck, color: '--metric-green' },
          { label: 'Ketepatan Waktu', value: `${stats?.punctualityRate}%`, sub: 'Tepat Waktu', icon: Clock, color: '--metric-teal' },
          { label: 'Permintaan Pending', value: stats?.pendingLeaves, sub: 'Izin & Lembur', icon: FileText, color: '--metric-peach' },
        ].map((card, i) => (
          <div 
            key={i} 
            className="col-span-3 bento-card p-5! flex items-center gap-4"
            style={{ backgroundColor: `var(${card.color}-bg)` }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/30 dark:bg-black/20"
              style={{ color: `var(${card.color}-text)` }}
            >
              <card.icon size={22} />
            </div>
            <div>
              <p 
                className="text-[10px] font-black opacity-70 uppercase tracking-tight leading-none mb-1"
                style={{ color: `var(${card.color}-text)` }}
              >
                {card.label}
              </p>
              <h3 
                className="text-2xl font-black tracking-tighter italic"
                style={{ color: `var(${card.color}-text)` }}
              >
                {card.value}
              </h3>
              <p 
                className="text-[9px] font-bold opacity-60 uppercase mt-0.5"
                style={{ color: `var(${card.color}-text)` }}
              >
                {card.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN SECTION: share height, scroll di dalam */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* LEFT COLUMN (Trend + Live Board) */}
        <div className="col-span-8 flex flex-col gap-4 min-h-0">
          {/* WEEKLY PERFORMANCE TREND */}
          <section className="bento-card flex flex-col flex-3 min-h-0">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black text-(--text-primary) uppercase tracking-tight italic">
                  Vektor Kehadiran
                </h3>
                <p className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-tight mt-1">
                  Tren kehadiran personil 7 hari terakhir
                </p>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl">
                <TrendingUp size={14} />
                <span className="text-[10px] font-bold uppercase">+12.4% Stability</span>
              </div>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--sidebar-bg)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--sidebar-bg)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="currentColor"
                    className="opacity-5"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--text-secondary)' }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'var(--text-primary)',
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stroke="var(--sidebar-bg)"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorPresent)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* LIVE OPERATIONAL BOARD */}
          <section className="bento-card flex flex-col flex-2 min-h-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-black text-(--text-primary) uppercase tracking-tight italic">
                  Papan Operasional Langsung
                </h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase">
                    Roster Langsung
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => router.push('/attendance/live')}
                  className="p-2.5 bg-(--bg-card) text-(--text-secondary) rounded-xl hover:text-cyan-600 transition-all border border-(--border-color)"
                >
                  <Filter size={16} />
                </button>
                <button 
                  onClick={() => alert('Feature: Generating enterprise report...')}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 dark:hover:bg-cyan-400 transition-all shadow-lg"
                >
                  Cetak Laporan
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-(--border-color)">
                    <th className="pb-4 text-[9px] font-black text-(--text-secondary) uppercase tracking-widest">
                      Nama Personel
                    </th>
                    <th className="pb-4 text-[9px] font-black text-(--text-secondary) uppercase tracking-widest">
                      Waktu Absen
                    </th>
                    <th className="pb-4 text-[9px] font-black text-(--text-secondary) uppercase tracking-widest">
                      Status GPS
                    </th>
                    <th className="pb-4 text-[9px] font-black text-(--text-secondary) uppercase tracking-widest">
                      Performa
                    </th>
                    <th className="pb-4 text-[9px] font-black text-(--text-secondary) uppercase tracking-widest text-right">
                      Verifikasi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-color)">
                  {(stats?.recentActivities || []).slice(0, 3).map((act: any, i: number) => (
                    <tr
                      key={i}
                      className="group hover:bg-(--bg-main) transition-all"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-(--border-color) flex items-center justify-center text-[10px] font-black italic text-(--text-primary)">
                            {act.userName.charAt(0)}
                          </div>
                          <p className="text-[11px] font-black text-(--text-primary) uppercase tracking-tight">
                            {act.userName}
                          </p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-(--text-secondary)">
                          <Clock8 size={12} />
                          <span className="text-[10px] font-bold">{act.checkIn}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <MapPin size={12} />
                          <span className="text-[9px] font-black uppercase">Terverifikasi</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`text-[9px] font-black uppercase ${
                            act.status === 'late'
                              ? 'text-cyan-600'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {act.status === 'late' ? 'Terlambat' : 'Tepat Waktu'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => router.push('/attendance/history')}
                          className="p-2 bg-(--bg-main) text-(--text-secondary) rounded-lg hover:text-cyan-600 transition-all border border-(--border-color)"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (Action Queue) */}
        <aside className="col-span-4 bento-card flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-(--text-primary) uppercase tracking-tight italic">
              Antrean Tindakan
            </h3>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-cyan-600 dark:bg-cyan-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                {stats?.pendingLeaves || 0} Baru
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
            {(!stats?.pendingRequests || stats.pendingRequests.length === 0) ? (
              <div className="py-20 flex flex-col items-center text-center px-6">
                <div className="w-16 h-16 bg-(--bg-main) rounded-full flex items-center justify-center text-(--text-secondary) mb-4 border border-(--border-color)">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xs font-black text-(--text-primary) uppercase tracking-widest">Nexus Bersih</h3>
                <p className="text-[10px] font-medium text-(--text-secondary) mt-2 italic leading-relaxed">Semua permohonan telah diproses. Tidak ada antrean tindakan.</p>
              </div>
            ) : stats.pendingRequests.map((req: any) => (
              <div
                key={req.id}
                className="p-5 bg-(--bg-main) rounded-3xl border border-(--border-color) hover:border-cyan-600/20 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-(--bg-card) flex items-center justify-center shadow-sm text-(--text-primary) font-black text-xs italic border border-(--border-color)">
                      {req.employeeName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-(--text-primary) uppercase tracking-tight">
                        {req.employeeName}
                      </p>
                      <p className="text-[8px] font-bold text-(--text-secondary) uppercase tracking-widest">
                        {req.department} • Hub MTP
                      </p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black text-cyan-600 dark:text-cyan-400 uppercase bg-cyan-600/5 px-2 py-1 rounded-md border border-cyan-600/10">
                    {req.type}
                  </span>
                </div>
                <p className="text-[10px] text-(--text-secondary) font-medium leading-relaxed mb-4 italic">
                  "{req.reason}"
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => router.push(`/attendance/leaves?id=${req.id}`)}
                    className="flex-1 py-3 bg-(--bg-card) border border-(--border-color) rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-cyan-600 transition-all"
                  >
                    Tinjau
                  </button>
                  <button 
                    onClick={() => router.push(`/attendance/leaves?id=${req.id}`)}
                    className="flex-1 py-3 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-cyan-600 transition-all"
                  >
                    Proses
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => router.push('/attendance/leaves')}
            className="mt-4 w-full py-4 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Kelola Semua Permohonan
          </button>
        </aside>
      </div>
    </div>
  );
}