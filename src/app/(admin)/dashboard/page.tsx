'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Clock, Calendar, ChevronRight, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, CheckCircle2, MoreHorizontal, Plus,
  ShieldCheck, Zap, UserX,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ── DESIGN TOKENS ─────────────────────────────────────────
// bg-main    : #1A0B10
// bg-card    : #2C1419
// bg-hover   : #351C22
// accent     : #E5374A
// accent-lt  : #FF6B6B
// border     : rgba(255,255,255,0.06)
// ──────────────────────────────────────────────────────────

// ── TYPES ──

interface Metric {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

// ── SKELETON ──

const DashboardSkeleton = () => (
  <div className="min-h-[calc(100vh-5rem)] bg-[#1A0B10] -m-8 lg:-m-12 p-8 lg:p-12 animate-pulse">
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-white/5 rounded-full" />
          <div className="h-8 w-52 bg-white/5 rounded-xl" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-white/5 rounded-xl" />
          <div className="h-10 w-10 bg-white/5 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 h-48 bg-white/5 rounded-3xl" />
        <div className="col-span-4 space-y-3">
          <div className="h-[58px] bg-white/5 rounded-2xl" />
          <div className="h-[58px] bg-white/5 rounded-2xl" />
          <div className="h-[58px] bg-white/5 rounded-2xl" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-7 h-72 bg-white/5 rounded-3xl" />
        <div className="col-span-5 h-72 bg-white/5 rounded-3xl" />
      </div>
    </div>
  </div>
);

// ── METRIC CARD ──

const MetricCard = ({ metric, index }: { metric: Metric; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 + index * 0.06 }}
    className="bg-[#2C1419] border border-white/6 rounded-2xl p-5 hover:bg-[#351C22] transition-colors"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metric.iconBg}`}>
        <metric.icon size={18} className={metric.iconColor} strokeWidth={2} />
      </div>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold leading-none ${
        metric.trend === 'up'    ? 'bg-emerald-500/15 text-emerald-400' :
        metric.trend === 'down'  ? 'bg-rose-500/15 text-rose-400' :
                                   'bg-white/8 text-white/40'
      }`}>
        {metric.trend === 'up'   && <TrendingUp size={9} />}
        {metric.trend === 'down' && <TrendingDown size={9} />}
        {metric.change}
      </span>
    </div>
    <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-1.5">{metric.label}</p>
    <h3 className="text-h1 font-extrabold text-white tracking-tight leading-none tabular-nums">{metric.value}</h3>
  </motion.div>
);

// ── REQUEST ITEM ──

const RequestItem = ({ req, isLast }: { req: any; isLast: boolean }) => {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push('/attendance/leaves')}
      className={`flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group ${
        !isLast ? 'border-b border-white/4' : ''
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-[#E5374A] text-white flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-[#FF4D5F] transition-colors">
          {req.employeeName?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0">
          <h4 className="text-[13px] font-bold text-white/85 leading-tight truncate">{req.employeeName}</h4>
          <p className="text-[11px] font-medium text-white/35 uppercase tracking-wider mt-0.5">
            {req.type} · {req.totalDays ?? 1} Day{(req.totalDays ?? 1) > 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <div className="hidden sm:block text-right">
          <p className="text-[12px] font-bold text-white/75 tabular-nums">
            {req.startDate ? format(new Date(req.startDate), 'dd MMM') : 'Today'}
          </p>
          <p className="text-[10px] font-medium text-white/25 uppercase tracking-wider">Start</p>
        </div>
        <div className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-white/25 group-hover:border-[#E5374A]/40 group-hover:text-[#E5374A] group-hover:bg-[#E5374A]/10 transition-all">
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};

// ── ACTIVITY ITEM ──

const ActivityItem = ({ act, isLast }: { act: any; isLast: boolean }) => (
  <div className="flex gap-3.5 relative">
    {!isLast && (
      <div
        className="absolute left-[17px] top-9 w-px bg-white/[0.07]"
        style={{ height: 'calc(100% - 4px)' }}
      />
    )}
    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
      act.status === 'present'
        ? 'border-emerald-500/30 bg-emerald-500/10'
        : 'border-rose-500/30 bg-rose-500/10'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        act.status === 'present' ? 'bg-emerald-400' : 'bg-rose-400'
      }`} />
    </div>
    <div className="pb-5 flex-1 min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-[13px] font-bold text-white/85 truncate">{act.actionLabel}</h4>
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider shrink-0">
          {act.checkIn ?? 'Just now'}
        </span>
      </div>
      <p className="text-[12px] text-white/35 mt-0.5 truncate">
        <span className="text-white/65 font-semibold">{act.userName}</span> data synced
      </p>
    </div>
  </div>
);

// ── EMPTY STATE ──

const EmptyState = ({ icon: Icon, message }: { icon: React.ElementType; message: string }) => (
  <div className="py-12 flex flex-col items-center gap-3">
    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/[0.06] flex items-center justify-center">
      <Icon size={20} className="text-white/20" />
    </div>
    <p className="text-[11px] font-bold text-white/25 uppercase tracking-widest">{message}</p>
  </div>
);

// ── MAIN PAGE ──

export default function AdminDashboard() {
  const { data: stats, loading } = useDashboardStats();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const metrics: Metric[] = [
    {
      label: 'Total Personnel', value: stats?.totalEmployees ?? 0,
      change: '+4%', trend: 'up',
      icon: Users, iconBg: 'bg-indigo-500/15', iconColor: 'text-indigo-400',
    },
    {
      label: 'On-Duty Today', value: stats?.presentToday ?? 0,
      change: `${stats?.punctualityRate ?? 100}%`, trend: 'up',
      icon: Clock, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400',
    },
    {
      label: 'Pending Requests', value: stats?.pendingLeaves ?? 0,
      change: '-12%', trend: 'down',
      icon: Calendar, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400',
    },
    {
      label: 'Face Registered', value: stats?.faceRegisteredCount ?? 0,
      change: 'Normal', trend: 'neutral',
      icon: ShieldCheck, iconBg: 'bg-violet-500/15', iconColor: 'text-violet-400',
    },
  ];

  const quickStats = [
    {
      label: 'Late Arrivals',
      value: stats?.lateToday ?? 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Absent Today',
      value: (stats?.totalEmployees ?? 0) - (stats?.presentToday ?? 0),
      icon: UserX,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      label: 'On Leave',
      value: stats?.pendingLeaves ?? 0,
      icon: Calendar,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
  ];

  const presentRate = stats?.totalEmployees
    ? Math.round(((stats.presentToday ?? 0) / stats.totalEmployees) * 100)
    : 0;

  const pendingRequests  = stats?.pendingRequests ?? [];
  const recentActivities = stats?.recentActivities ?? [];
  const displayedRequests    = pendingRequests.slice(0, 5);
  const displayedActivities  = recentActivities.slice(0, 4);

  if (loading) return <DashboardSkeleton />;

  return (
    // Full-bleed dark background — negates AdminLayout's p-8 lg:p-12
    <div className="min-h-[calc(100vh-5rem)] bg-[#1A0B10] -m-8 lg:-m-12 p-8 lg:p-12 pb-16">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E5374A]/15 text-[#FF7A87] rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#E5374A]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5374A] animate-pulse" />
                Live
              </span>
              <span className="text-[11px] font-medium text-white/30 tabular-nums">
                {format(currentTime, 'EEE, dd MMM yyyy')} · {format(currentTime, 'HH:mm:ss')}
              </span>
            </div>
            <h1 className="text-[26px] font-extrabold text-white tracking-tight leading-none">
              Admin <span className="text-[#E5374A]">Overview</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/employees">
              <button className="inline-flex items-center gap-2 h-10 px-5 bg-white/5 border border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white/50 hover:border-[#E5374A]/40 hover:text-[#FF7A87] hover:bg-[#E5374A]/10 transition-all">
                <Users size={15} />
                Personnel
              </button>
            </Link>
            <Link href="/employees/new">
              <button className="w-10 h-10 bg-[#E5374A] text-white rounded-xl flex items-center justify-center hover:bg-[#FF4D5F] transition-colors shadow-lg shadow-[#E5374A]/25 group">
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </Link>
          </div>
        </motion.div>

        {/* ── HERO ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Hero Banner — Today's Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-[#2C1419] border border-white/6 p-7 min-h-[188px]"
          >
            {/* Ambient glow orbs */}
            <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full bg-[#E5374A]/15 blur-3xl pointer-events-none" />
            <div className="absolute right-40 -bottom-8 w-48 h-48 rounded-full bg-[#FF9500]/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between h-full gap-5">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E5374A] text-white rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                    <Zap size={10} fill="currentColor" />
                    Today's Report
                  </span>
                  <h2 className="text-[40px] font-extrabold text-white tracking-tight leading-none">
                    {stats?.presentToday ?? 0}
                    <span className="text-white/25 text-[22px] font-bold ml-2.5">
                      / {stats?.totalEmployees ?? 0}
                    </span>
                  </h2>
                  <p className="text-[13px] text-white/45 font-medium mt-2">
                    Personnel on duty — {format(currentTime, 'EEEE, dd MMMM yyyy')}
                  </p>
                </div>

                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Punctuality Rate</p>
                  <p className="text-stats font-extrabold text-[#E5374A] tabular-nums leading-none">
                    {stats?.punctualityRate ?? 0}%
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Attendance Rate</p>
                  <p className="text-[10px] font-bold text-white/40">
                    {stats?.presentToday ?? 0} of {stats?.totalEmployees ?? 0} present
                  </p>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${presentRate}%` }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                    className="h-full bg-linear-to-r from-[#E5374A] to-[#FF8A8A] rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats List */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {quickStats.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.07 }}
                className="flex items-center justify-between px-5 py-4 bg-[#2C1419] border border-white/6 rounded-2xl hover:bg-[#351C22] transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                    <item.icon size={17} className={item.color} />
                  </div>
                  <span className="text-[13px] font-semibold text-white/60">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[20px] font-extrabold text-white tabular-nums">{item.value}</span>
                  <ChevronRight size={14} className="text-white/15 group-hover:text-white/40 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── METRICS GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <MetricCard key={m.label} metric={m} index={i} />
          ))}
        </div>

        {/* ── CONTENT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* APPROVAL QUEUE */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            className="lg:col-span-7 bg-[#2C1419] border border-white/6 rounded-3xl p-6"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-[15px] font-extrabold text-white tracking-tight">Approval Queue</h3>
                <p className="text-[12px] font-medium text-white/30 mt-0.5">
                  Leave and permit requests awaiting review.
                </p>
              </div>
              <Link href="/attendance/leaves">
                <button className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#E5374A] uppercase tracking-widest hover:gap-2.5 transition-all shrink-0 mt-0.5">
                  View All <ArrowUpRight size={13} />
                </button>
              </Link>
            </div>

            <div>
              {displayedRequests.length > 0 ? (
                displayedRequests.map((req: any, i: number) => (
                  <RequestItem key={req.id} req={req} isLast={i === displayedRequests.length - 1} />
                ))
              ) : (
                <EmptyState icon={CheckCircle2} message="Queue is clear" />
              )}
            </div>
          </motion.div>

          {/* LIVE FEED */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.42 }}
            className="lg:col-span-5 bg-[#2C1419] border border-white/6 rounded-3xl p-6 flex flex-col"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-[15px] font-extrabold text-white tracking-tight">Live Feed</h3>
                <p className="text-[12px] font-medium text-white/30 mt-0.5">
                  Real-time attendance & biometric syncs.
                </p>
              </div>
              <button className="w-8 h-8 rounded-lg bg-white/5 text-white/30 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0">
                <MoreHorizontal size={16} />
              </button>
            </div>

            <div className="flex-1">
              {displayedActivities.length > 0 ? (
                displayedActivities.map((act: any, i: number) => (
                  <ActivityItem key={i} act={act} isLast={i === displayedActivities.length - 1} />
                ))
              ) : (
                <EmptyState icon={Activity} message="No activity yet" />
              )}
            </div>

            <Link href="/attendance/live" className="block mt-4">
              <button className="w-full h-11 bg-[#E5374A]/10 border border-[#E5374A]/20 text-[#FF7A87] rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#E5374A] hover:text-white hover:border-[#E5374A] hover:shadow-lg hover:shadow-[#E5374A]/20 transition-all">
                Open Live Monitor
              </button>
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
