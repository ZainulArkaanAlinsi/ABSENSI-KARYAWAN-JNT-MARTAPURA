'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  ArrowRight, 
  Calendar,
  Layers,
  ChevronRight,
  Zap,
  TrendingUp,
  LayoutDashboard,
  FileText,
  Settings,
  Bell,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useTheme } from '@/context/ThemeContext';

// ── Components ──

const AnimatedCounter = ({ value, duration = 1.5 }: { value: number; duration?: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: 'easeOut' });
    return controls.stop;
  }, [value, duration, count]);

  return <motion.span>{rounded}</motion.span>;
};

const WelcomeBanner = ({ stats, loading }: { stats: any; loading: boolean }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="dashboard-hero p-8 md:p-12 mb-8 flex flex-col md:flex-row justify-between items-center gap-8"
    >
      <div className="space-y-4 text-center md:text-left relative z-10">
        <div className="flex items-center justify-center md:justify-start gap-3">
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30"
          >
            <Zap size={20} className="text-white" />
          </motion.div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Operational Overview</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
          {greeting},<br/><span className="text-white/80">Admin JNE.</span>
        </h1>
        <p className="text-sm font-bold text-white/60 uppercase tracking-widest">
          {format(new Date(), 'EEEE, dd MMMM yyyy')}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 relative z-10">
        {[
          { label: 'Total Staff', value: stats?.totalEmployees ?? 0, icon: Users },
          { label: 'Punctuality', value: `${stats?.punctualityRate ?? 0}%`, icon: Clock },
          { label: 'Pending Izin', value: stats?.pendingLeaves ?? 0, icon: FileText },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-1">
              <item.icon size={14} className="text-white/40" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/50">{item.label}</span>
            </div>
            <span className="text-2xl font-black tracking-tighter">{loading ? '...' : item.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const StatCardV2 = ({ 
  label, 
  value, 
  trend, 
  accent, 
  progress, 
  loading,
  idx 
}: { 
  label: string; 
  value: number; 
  trend: string; 
  accent: string; 
  progress: number;
  loading: boolean;
  idx: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.2 + (idx * 0.1), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -2, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
    className="stat-card-v2 p-6 flex flex-col justify-between"
  >
    <div className="accent-bar" style={{ backgroundColor: accent }} />
    <div className="space-y-4">
      <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest leading-none">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-4xl font-black text-(--text-primary) tracking-tighter">
          {loading ? '...' : <AnimatedCounter value={value} />}
        </h3>
        <span className="text-[10px] font-bold text-(--text-dim) uppercase tracking-widest">{trend}</span>
      </div>
    </div>
    <div className="mt-6 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black text-(--text-dim) uppercase tracking-widest">Efficiency</span>
        <span className="text-[9px] font-black text-(--text-muted) uppercase tracking-widest">{progress}%</span>
      </div>
      <div className="w-full h-1 bg-(--border-primary) rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'circOut' }}
          className="h-full rounded-full" 
          style={{ backgroundColor: accent }}
        />
      </div>
    </div>
  </motion.div>
);

const AttendanceDonut = ({ stats, loading }: { stats: any; loading: boolean }) => {
  const { theme } = useTheme();
  const chartData = [
    { name: 'Hadir', value: stats?.presentToday ?? 0, color: '#10B981' },
    { name: 'Terlambat', value: stats?.lateToday ?? 0, color: '#F59E0B' },
    { name: 'Alfa', value: stats?.absentToday ?? 0, color: '#E31E24' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="relative h-[250px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={8}
              dataKey="value"
              animationBegin={500}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5, type: 'spring' }}
            className="text-4xl font-black text-(--text-primary) tracking-tighter"
          >
            {loading ? '...' : `${stats?.engagementIndex ?? 0}%`}
          </motion.span>
          <span className="text-[9px] font-black text-(--text-dim) uppercase tracking-widest">Presence Rate</span>
        </div>
      </div>
      <div className="mt-auto space-y-3">
        {chartData.map((item, i) => (
          <div key={i} className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest group-hover:text-(--text-primary) transition-colors">{item.name}</span>
            </div>
            <span className="text-xs font-black text-(--text-primary)">{loading ? '...' : item.value} pax</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { data, loading } = useDashboardStats();
  const { theme } = useTheme();

  const chartData = data?.weeklyTrends.map(t => ({
    name: t.day,
    hadir: t.present,
    late: t.late,
    absent: t.absent
  })) ?? [];

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-0 space-y-8">
      <WelcomeBanner stats={data} loading={loading} />

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardV2 
          idx={0} label="Hadir Hari Ini" 
          value={data?.presentToday ?? 0} trend="Live Scan" 
          accent="#10B981" progress={data?.engagementIndex ?? 0} 
          loading={loading}
        />
        <StatCardV2 
          idx={1} label="Terlambat" 
          value={data?.lateToday ?? 0} trend="Buffer Limit" 
          accent="#F59E0B" progress={Math.max(0, 100 - (data?.punctualityRate ?? 0))} 
          loading={loading}
        />
        <StatCardV2 
          idx={2} label="Total Jam Kerja" 
          value={data?.totalWorkingHours ?? 0} trend="Cumulated" 
          accent="#8B5CF6" progress={78} 
          loading={loading}
        />
        <StatCardV2 
          idx={3} label="Departemen Aktif" 
          value={data?.activeDepartmentsCount ?? 0} trend="Operational" 
          accent="#3B82F6" progress={100} 
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── MAIN TREND CHART ── */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-8 bg-(--bg-card) p-8 rounded-4xl border border-(--border-primary) shadow-sm"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-black text-(--text-primary) uppercase italic tracking-tighter">Matriks Kehadiran</h2>
              <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest mt-1">Daily Performance Tracking</p>
            </div>
            <div className="hidden md:flex gap-6">
              {[
                { label: 'Hadir', color: '#10B981' },
                { label: 'Late', color: '#F59E0B' },
                { label: 'Alfa', color: '#E31E24' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F1F5F9'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: '1px solid var(--border-primary)', 
                    boxShadow: 'var(--shadow-premium)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Area type="monotone" dataKey="hadir" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorPresent)" />
                <Area type="monotone" dataKey="late" stroke="#F59E0B" strokeWidth={4} fillOpacity={1} fill="url(#colorLate)" />
                <Area type="monotone" dataKey="absent" stroke="#E31E24" strokeWidth={4} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── DONUT DISTRIBUTION ── */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-4 bg-(--bg-card) p-8 rounded-4xl border border-(--border-primary) shadow-sm flex flex-col"
        >
          <div className="mb-6">
            <h2 className="text-xl font-black text-(--text-primary) uppercase italic tracking-tighter">Distribusi</h2>
            <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest mt-1">Attendance Spread</p>
          </div>
          <AttendanceDonut stats={data} loading={loading} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── ACTIVITIES TIMELINE ── */}
        <div className="lg:col-span-5 bg-(--bg-card) p-8 rounded-4xl border border-(--border-primary) shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-(--text-primary) uppercase italic tracking-tight">Timeline Aktivitas</h2>
            <Link href="/logs" className="text-[10px] font-black text-[#E31E24] uppercase tracking-widest hover:underline">View All</Link>
          </div>

          <div className="space-y-8 relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-(--border-primary)" />
            
            {data?.recentActivities.map((act, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (i * 0.1) }}
                className="flex gap-6 relative z-10"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px] shrink-0 shadow-lg"
                  style={{ backgroundColor: act.color }}
                >
                  {act.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-[13px] font-black text-(--text-primary) truncate">{act.userName}</h4>
                    <span className="text-[9px] font-bold text-(--text-dim) uppercase shrink-0">{act.checkIn}</span>
                  </div>
                  <p className="text-[11px] font-medium text-(--text-muted) leading-snug">{act.actionLabel}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── OPERATIONAL LOGS TABLE ── */}
        <div className="lg:col-span-7 bg-(--bg-card) rounded-4xl border border-(--border-primary) shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-(--border-primary) flex items-center justify-between">
             <h2 className="text-lg font-black text-(--text-primary) uppercase italic tracking-tight">Log Operasional</h2>
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">Live Updates</span>
             </div>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-(--bg-main) border-b border-(--border-primary)">
                  <th className="px-8 py-4 text-[9px] font-black text-(--text-dim) uppercase tracking-widest">Personnel</th>
                  <th className="px-8 py-4 text-[9px] font-black text-(--text-dim) uppercase tracking-widest">Department</th>
                  <th className="px-8 py-4 text-[9px] font-black text-(--text-dim) uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-primary)">
                {data?.recentActivities.map((act, i) => (
                  <motion.tr 
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + (i * 0.05) }}
                    className="hover:bg-(--bg-main)/50 transition-colors"
                  >
                    <td className="px-8 py-4">
                      <span className="text-[12px] font-black text-(--text-primary)">{act.userName}</span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">{act.department}</span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: act.color }} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: act.color }}>{act.status}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── DEPARTMENT PERFORMANCE ── */}
        <div className="lg:col-span-8 bg-(--bg-card) p-8 rounded-4xl border border-(--border-primary) shadow-sm">
          <div className="mb-8">
            <h2 className="text-xl font-black text-(--text-primary) uppercase italic tracking-tighter">Kinerja Unit</h2>
            <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest mt-1">Department Attendance Strength</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {data?.departmentDistribution.map((dept, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[11px] font-black text-(--text-primary) uppercase tracking-tight">{dept.name}</span>
                  <span className="text-[11px] font-black text-(--text-muted) uppercase tracking-widest">{dept.attendance}%</span>
                </div>
                <div className="dept-progress-bar">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dept.attendance}%` }}
                    transition={{ duration: 1, delay: 1 + (i * 0.1), ease: [0.16, 1, 0.3, 1] }}
                    className="dept-progress-fill"
                    style={{ backgroundColor: i % 2 === 0 ? '#10B981' : '#005596' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          {[
            { label: 'Lihat Absensi', icon: Calendar, href: '/attendance', delay: 1.2 },
            { label: 'Staff Hub', icon: Users, href: '/employees', delay: 1.3 },
            { label: 'Reporting', icon: FileText, href: '/reports', delay: 1.4 },
            { label: 'System Config', icon: Settings, href: '/settings', delay: 1.5 },
          ].map((action, i) => (
            <Link key={i} href={action.href} className="contents">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: action.delay }}
                whileHover={{ y: -4, borderColor: '#E31E24', backgroundColor: 'rgba(227, 30, 36, 0.02)' }}
                whileTap={{ scale: 0.98 }}
                className="quick-action-btn flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 bg-(--bg-main) rounded-2xl flex items-center justify-center text-(--text-muted) group-hover:text-[#E31E24] group-hover:bg-red-500/5 transition-all">
                  <action.icon size={22} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black text-(--text-primary) uppercase tracking-tighter text-center">{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
