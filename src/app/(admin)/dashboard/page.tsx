'use client';

import {
  Users, UserCheck, Clock, Activity, Zap,
  ArrowUpRight, BarChart3, Calendar,
  ChevronRight, FileText, Settings, TrendingUp,
  Coffee, Sun, Moon, Sunset, AlertCircle, RefreshCw
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { motion, useMotionValue, useTransform, animate as animateMotion } from 'framer-motion';
import { format } from 'date-fns';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ─── Framer Variants ──────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 }
  }
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: EASE }
  }
};

const slideLeftVariant = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.6, ease: EASE }
  }
};

const slideRightVariant = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.6, ease: EASE }
  }
};

const scaleInVariant = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.42, ease: EASE }
  }
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, v => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = rounded.on('change', v => setDisplay(v));
    const controls = animateMotion(count, target, { duration, ease: 'easeOut' });
    return () => {
      controls.stop();
      unsub();
    };
  }, [target, count, rounded, duration]);

  return <>{display}</>;
}

// ─── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return { text: 'Selamat Malam',  Icon: Moon,    color: '#7C3AED' };
  if (h < 12) return { text: 'Selamat Pagi',   Icon: Sun,     color: '#F59E0B' };
  if (h < 15) return { text: 'Selamat Siang',  Icon: Coffee,  color: '#D2145A' };
  if (h < 19) return { text: 'Selamat Sore',   Icon: Sunset,  color: '#F97316' };
  return               { text: 'Selamat Malam', Icon: Moon,    color: '#7C3AED' };
}

// ─── Stat Card V2 ─────────────────────────────────────────────────────────────
function StatCardV2({ title, value, unit, icon: Icon, accentColor, progress, changeLabel, delay = 0 }: any) {
  return (
    <motion.div
      variants={scaleInVariant}
      whileHover={{ y: -4, boxShadow: `0 16px 32px ${accentColor}22` }}
      whileTap={{ scale: 0.98 }}
      className="stat-card-v2 p-4"
    >
      <div className="accent-bar" style={{ background: accentColor }} />
      <div className="pl-2">
        <div className="flex justify-between items-start">
          <p className="text-[11px] font-bold uppercase tracking-widest text-(--lector-text-muted)">{title}</p>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}18` }}>
            {Icon && <Icon size={16} style={{ color: accentColor }} />}
          </div>
        </div>
        <p className="text-xl font-black text-(--lector-text-main) mt-1 tracking-tight">
          <AnimatedCounter target={value || 0} />
          {unit && <span className="text-[10px] font-bold text-(--lector-text-muted) ml-1 uppercase">{unit}</span>}
        </p>
        {changeLabel && (
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight size={11} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500">{changeLabel}</span>
          </div>
        )}
        {progress !== undefined && (
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              style={{ background: accentColor }}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: delay + 0.3 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-(--lector-border) p-3 text-[11px] font-bold">
        <p className="text-(--lector-text-muted) mb-2 uppercase tracking-widest">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            <span className="text-(--lector-text-main)">{p.name}: {p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Status Badge helper ──────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  present:  { bg: '#DCFCE7', text: '#166534', dot: '#10B981', label: 'On-Time' },
  late:     { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Terlambat' },
  overtime: { bg: '#EDE9FE', text: '#5B21B6', dot: '#8B5CF6', label: 'Lembur' },
  leave:    { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'Cuti' },
  absent:   { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Absen' },
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { data, weeklyData, loading, error } = useDashboardStats();
  const today = format(new Date(), 'EEEE, dd MMMM yyyy');
  const greeting = getGreeting();

  const attendanceRate = data && data.totalEmployees > 0
    ? Math.round((data.presentToday / data.totalEmployees) * 100)
    : 0;

  const donutData = [
    { name: 'On-Time', value: Math.max(0, (data?.presentToday || 0) - (data?.lateToday || 0)), color: '#D2145A' },
    { name: 'Late',    value: data?.lateToday || 0,                                              color: '#F59E0B' },
    { name: 'Absent',  value: Math.max(0, data?.absentToday || 0),                               color: '#8B5CF6' },
  ].filter(d => d.value > 0);

  const deptData = (data?.departmentDistribution || [])
    .slice(0, 6)
    .sort((a, b) => b.attendance - a.attendance);

  const quickActions = [
    { label: 'Absensi',    icon: UserCheck,  href: '/attendance',  color: '#E31E24' },
    { label: 'Karyawan',   icon: Users,      href: '/employees',   color: '#005596' },
    { label: 'Laporan',    icon: FileText,   href: '/reports',     color: '#7C3AED' },
    { label: 'Pengaturan', icon: Settings,   href: '/settings',    color: '#64748B' },
  ];

  // ─── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <AdminLayout title="Dashboard" subtitle="Overview">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle size={48} className="text-red-500" />
          <p className="text-sm font-bold text-(--lector-text-muted)">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
          >
            <RefreshCw size={14} /> Coba Lagi
          </button>
        </div>
      </AdminLayout>
    );
  }

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Overview">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <div className="h-36 rounded-2xl bg-(--lector-border) animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-(--lector-border) animate-pulse" style={{ animationDelay: `${i*0.1}s` }} />
            ))}
          </div>
          <div className="h-80 rounded-2xl bg-(--lector-border) animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" subtitle="System Overview">
      {/* ── Lector V2 Root — Premium Depth BG ── */}
      <div className="min-h-screen bg-(--lector-bg) -m-6 p-4 lg:p-6 pb-12">
        <motion.div
           className="max-w-[1440px] mx-auto space-y-6"
           variants={containerVariants}
           initial="hidden"
           animate="visible"
        >
          {/* ═══════════════════════════════════════════════════════
              ROW 1 — Balanced 6-Card Command Grid (3x2)
          ═══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCardV2
              title="Hadir (Presence)"
              value={data?.presentToday || 0}
              icon={UserCheck}
              accentColor="var(--lector-card-purple)"
              progress={data ? (data.presentToday / Math.max(1, data.totalEmployees)) * 100 : 0}
              changeLabel="Live Today"
              delay={0}
            />
            <StatCardV2
              title="Terlambat (Late)"
              value={data?.lateToday || 0}
              icon={Clock}
              accentColor="var(--lector-card-yellow)"
              progress={data ? (data.lateToday / Math.max(1, data.totalEmployees)) * 100 : 0}
              changeLabel="Requires Attention"
              delay={0.05}
            />
            <StatCardV2
              title="Lembur (Overtime)"
              value={data?.overtimeHours || 0}
              unit="Jam"
              icon={Zap}
              accentColor="var(--lector-card-teal)"
              changeLabel="Accumulated Month"
              delay={0.1}
            />
            <StatCardV2
              title="Izin / Cuti (Leave)"
              value={data?.onLeaveToday || 0}
              icon={Calendar}
              accentColor="var(--jne-blue)"
              progress={data ? (data.onLeaveToday / Math.max(1, data.totalEmployees)) * 100 : 0}
              changeLabel="Active Permits"
              delay={0.15}
            />
            <StatCardV2
              title="Alpha (Absent)"
              value={data?.absentToday || 0}
              icon={AlertCircle}
              accentColor="var(--jne-red)"
              progress={data ? (data.absentToday / Math.max(1, data.totalEmployees)) * 100 : 0}
              changeLabel="Unaccounted"
              delay={0.2}
            />
            <StatCardV2
              title="Total Karyawan"
              value={data?.totalEmployees || 0}
              unit="Staff"
              icon={Users}
              accentColor="var(--lector-card-orange)"
              changeLabel="Active Matrix"
              delay={0.25}
            />
          </div>

          {/* ═══════════════════════════════════════════════════════
              ROW 2 — Main Performance Matrix (Parallel View)
          ═══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Trend Analysis Card */}
            <motion.div
              variants={slideLeftVariant}
              className="lg:col-span-8 lector-card p-6 flex flex-col justify-between lector-mesh-purple min-h-[420px]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <p className="lector-metric-title">Performance Index</p>
                  <h2 className="text-3xl font-black text-(--lector-text-main) tracking-tighter">
                    {attendanceRate}%
                    <span className="text-[9px] font-black text-emerald-600 ml-3 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 uppercase tracking-widest ">Verified Stability</span>
                  </h2>
                  <p className="text-[10px] font-bold text-(--lector-text-muted) opacity-60 uppercase tracking-widest mt-1 flex items-center gap-2">
                    <Activity size={10} /> Attendance Analytics — {format(new Date(), 'MMMM yyyy')}
                  </p>
                </div>
                {/* Refined Toggle */}
                <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 shadow-inner backdrop-blur-sm">
                  {['DAILY', 'WEEKLY', 'MONTHLY'].map(t => (
                    <button 
                      key={t}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${t === 'WEEKLY' ? 'bg-white text-[#E31E24] shadow-sm' : 'text-(--lector-text-muted) hover:text-(--lector-text-main)'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="gradTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="var(--lector-card-purple)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--lector-card-purple)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 800 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 800 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="present" name="Hadir" stroke="#E31E24" strokeWidth={4} fill="url(#gradTrend)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Distribution Pie (Parallel to Trend) */}
            <motion.div
              variants={slideRightVariant}
              className="lg:col-span-4 lector-card p-6 flex flex-col justify-between bg-zinc-900 text-white min-h-[420px]"
            >
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Status Mix</p>
                <h3 className="text-2xl font-black tracking-tight">Daily Distribution</h3>
              </div>

              <div className="relative flex items-center justify-center py-10">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={donutData.length > 0 ? donutData : [{ name: 'No Data', value: 1, color: '#333' }]}
                      innerRadius={85}
                      outerRadius={115}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {(donutData.length > 0 ? donutData : [{ color: '#333' }]).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-3xl font-black leading-none drop-shadow-lg">
                    {attendanceRate}%
                  </p>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1">Matrix OK</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Hadir',  color: '#E31E24', value: data?.presentToday || 0 },
                  { name: 'Lembur', color: '#0d9488', value: data?.overtimeHours || 0 },
                  { name: 'Alpha',  color: '#005596', value: data?.absentToday || 0 },
                ].map(d => (
                  <div key={d.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <span className="w-3.5 h-3.5 rounded-full shadow-lg" style={{ background: d.color, boxShadow: `0 0 12px ${d.color}66` }} />
                      <span className="text-xs font-black uppercase tracking-widest text-white/70">{d.name}</span>
                    </div>
                    <span className="text-lg font-black">{d.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              ROW 3 — Operational Logs & Insights (Parallel alignment)
          ═══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Activities — Styled as a Live Feed */}
            <motion.div variants={fadeUpVariant} className="lg:col-span-5 lector-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="lector-metric-title">Real-time Feed</p>
                  <h3 className="text-xl font-black text-(--lector-text-main) tracking-tight">System Signals</h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-inner">
                  <Zap size={18} className="text-(--lector-sidebar-brand)" />
                </div>
              </div>

              <div className="flex-1 space-y-5">
                {(data?.recentActivities?.length ?? 0) > 0 ? (
                   data?.recentActivities.slice(0, 4).map((act, i) => (
                    <div key={`${act.id}-${i}`} className="flex items-start gap-6 group">
                      <div className={`w-14 h-14 rounded-3xl flex items-center justify-center font-black text-white shadow-xl shrink-0 transition-transform group-hover:scale-110 duration-500`} style={{ background: act.color }}>
                        {act.userName.charAt(0).toUpperCase()}
                      </div>
                        <div className="min-w-0 flex-1 border-b border-slate-50 pb-5 last:border-0 group-hover:bg-slate-50/50 p-2 rounded-xl transition-all">
                        <div className="flex items-center justify-between">
                          <Link href={`/employees/${act.id || ''}`}>
                            <p className="text-[14px] font-black text-(--lector-text-main) truncate hover:text-[#E31E24] transition-colors cursor-pointer">{act.userName}</p>
                          </Link>
                          <span className="text-[10px] font-black text-(--lector-text-muted) px-2 py-1 bg-white rounded-lg shadow-sm border border-slate-100">{act.checkIn}</span>
                        </div>
                        <p className="text-[11px] font-bold text-(--lector-text-muted) opacity-70 mt-0.5">{act.actionLabel}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <div className="w-4 h-4 rounded-full bg-slate-200 border border-white" />
                            <div className="w-4 h-4 rounded-full bg-slate-300 border border-white" />
                          </div>
                          <span className="text-[9px] font-black text-(--lector-text-muted) uppercase tracking-widest">{act.department} Unit</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 opacity-20">
                    <Activity size={50} className="mx-auto mb-4" />
                    <p className="text-[12px] font-black uppercase tracking-[0.3em]">No Live Signals</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Operational Logs — Parallel Table */}
            <motion.div variants={fadeUpVariant} className="lg:col-span-7 lector-card p-0 flex flex-col">
              <div className="p-8 pb-4">
                <p className="lector-metric-title">Audit Matrix</p>
                <h3 className="text-2xl font-black text-(--lector-text-main) tracking-tight">Internal Status Log</h3>
              </div>

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 backdrop-blur-sm border-y border-slate-100">
                    <tr className="text-(--lector-text-muted) text-[9px] font-black uppercase tracking-[0.25em]">
                      <th className="px-6 py-4">Domain Status</th>
                      <th className="px-6 py-4 text-center">Units</th>
                      <th className="px-6 py-4 text-right">Progress/Quota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(data?.recentActivities?.length ?? 0) > 0 ? (
                      data?.recentActivities.slice(0, 5).map((row, i) => {
                        const statusColor = row.status === 'late' ? '#f59e0b' : row.status === 'absent' ? '#ef4444' : '#10b981';
                        const statusLabel = row.status === 'late' ? 'Delay Matrix' : row.status === 'absent' ? 'System Fail' : 'Operational Sync';
                        const progress = row.status === 'late' ? 65 : row.status === 'absent' ? 20 : 100;

                        return (
                          <tr key={i} className="group hover:bg-indigo-50/30 transition-all duration-500">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: statusColor }} />
                                <div>
                                  <p className="text-[13px] font-black text-(--lector-text-main)">{statusLabel}</p>
                                  <p className="text-[9px] font-bold text-(--lector-text-muted) opacity-50 uppercase tracking-widest">{row.department}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-xs font-black text-(--lector-text-main)">{row.status === 'present' ? '01' : '00'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-end gap-1.5">
                                <span className={`text-[9px] font-black uppercase tracking-widest`} style={{ color: statusColor }}>{progress}%</span>
                                <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <motion.div 
                                    className="h-full rounded-full" 
                                    style={{ background: statusColor }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.1 }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-8 py-24 text-center opacity-20 italic font-black uppercase tracking-widest">Null Dataset</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Sync Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Neural Link Online</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
