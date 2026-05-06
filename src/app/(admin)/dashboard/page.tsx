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
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-[var(--radius-apple)]">
        <div className="w-12 h-12 border-4 border-rose-600/10 border-t-rose-600 dark:border-t-rose-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 bg-[var(--bg-main)] transition-colors duration-500">
      {/* ROW 1: CORE METRICS */}
      <div className="grid grid-cols-12 gap-4">
        {[
          { label: 'Total Personnel', value: stats?.totalEmployees, sub: 'Aktif di Martapura', icon: Users, color: 'rose' },
          { label: 'Present Today', value: stats?.presentToday, sub: `${stats?.absentToday} Belum Absen`, icon: UserCheck, color: 'emerald' },
          { label: 'Punctuality', value: `${stats?.punctualityRate}%`, sub: 'Tepat Waktu', icon: Clock, color: 'blue' },
          { label: 'Pending Requests', value: stats?.pendingLeaves, sub: 'Izin & Lembur', icon: FileText, color: 'amber' },
        ].map((card, i) => (
          <div key={i} className="col-span-3 bento-card !p-5 flex items-center gap-4">
            <div
              className={`
                w-12 h-12 rounded-2xl flex items-center justify-center
                bg-${card.color}-600/10 dark:bg-${card.color}-400/10
                text-${card.color}-600 dark:text-${card.color}-400
              `}
            >
              <card.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-tight leading-none mb-1">
                {card.label}
              </p>
              <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter italic">
                {card.value}
              </h3>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">
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
          <section className="bento-card flex flex-col flex-[3] min-h-0">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic">
                  Attendance Velocity
                </h3>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-tight mt-1">
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
                      <stop offset="5%" stopColor="#E11D48" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                    className="dark:stroke-slate-800"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      backgroundColor: '#0F172A',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#F1F5F9',
                    }}
                    itemStyle={{ color: '#F1F5F9' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stroke="#E11D48"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorPresent)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* LIVE OPERATIONAL BOARD */}
          <section className="bento-card flex flex-col flex-[2] min-h-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic">
                  Live Operational Board
                </h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase">
                    Live Roster
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => router.push('/attendance/live')}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-400 rounded-xl hover:text-rose-600 transition-all border border-[var(--border-color)]"
                >
                  <Filter size={16} />
                </button>
                <button 
                  onClick={() => alert('Feature: Generating enterprise report...')}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 dark:hover:bg-rose-400 transition-all"
                >
                  Export Report
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border-color)]">
                    <th className="pb-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                      Personnel Name
                    </th>
                    <th className="pb-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                      Timestamp
                    </th>
                    <th className="pb-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                      GPS Status
                    </th>
                    <th className="pb-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                      Performance
                    </th>
                    <th className="pb-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest text-right">
                      Verification
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {(stats?.recentActivities || []).slice(0, 3).map((act: any, i: number) => (
                    <tr
                      key={i}
                      className="group hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black italic text-slate-900 dark:text-slate-50">
                            {act.userName.charAt(0)}
                          </div>
                          <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight">
                            {act.userName}
                          </p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <Clock8 size={12} />
                          <span className="text-[10px] font-bold">{act.checkIn}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <MapPin size={12} />
                          <span className="text-[9px] font-black uppercase">Verified</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`text-[9px] font-black uppercase ${
                            act.status === 'late'
                              ? 'text-rose-600'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {act.status === 'late' ? 'Terlambat' : 'Tepat Waktu'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => router.push('/attendance/history')}
                          className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
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
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic">
              Action Queue
            </h3>
            <div className="px-3 py-1 bg-rose-600 dark:bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
              {stats?.pendingLeaves || 0} New
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
            {(!stats?.pendingRequests || stats.pendingRequests.length === 0) ? (
              <div className="py-20 flex flex-col items-center text-center px-6">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100 dark:border-white/5">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Nexus Is Clear</h3>
                <p className="text-[10px] font-medium text-slate-500 mt-2">Semua permohonan telah diproses. Tidak ada antrean tindakan.</p>
              </div>
            ) : stats.pendingRequests.map((req: any) => (
              <div
                key={req.id}
                className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-[var(--border-color)] hover:border-rose-600/20 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center shadow-sm text-[var(--text-primary)] font-black text-xs italic border border-[var(--border-color)]">
                      {req.employeeName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight">
                        {req.employeeName}
                      </p>
                      <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                        {req.department} • Hub MTP
                      </p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black text-rose-600 dark:text-rose-400 uppercase bg-rose-600/5 px-2 py-1 rounded-md border border-rose-600/10">
                    {req.type}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed mb-4 italic">
                  "{req.reason}"
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => router.push(`/attendance/leaves?id=${req.id}`)}
                    className="flex-1 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-all"
                  >
                    Review
                  </button>
                  <button 
                    onClick={() => router.push(`/attendance/leaves?id=${req.id}`)}
                    className="flex-1 py-3 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all"
                  >
                    Action
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => router.push('/attendance/leaves')}
            className="mt-4 w-full py-4 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Manage All Requests
          </button>
        </aside>
      </div>
    </div>
  );
}