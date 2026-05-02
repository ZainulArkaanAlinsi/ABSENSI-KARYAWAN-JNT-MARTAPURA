'use client';

import {
  Users, UserCheck, Clock, Activity, Zap,
  ArrowRight, Calendar, AlertCircle, RefreshCw,
  Search, MessageCircle
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { motion, Variants } from 'framer-motion';
import { format } from 'date-fns';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import Link from 'next/link';

// ─── Minimalist Variants ──────────────────────────────────────────────────────
const EASE_PREMIUM = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: EASE_PREMIUM } 
  }
};

// ─── Simple Stat Card ──────────────────────────────────────────────────────────
function SimpleStatCard({ title, value, icon: Icon, color, subtitle }: any) {
  return (
    <motion.div
      variants={itemVariants}
      className="p-5 md:p-8 bg-(--bg-card) rounded-3xl border border-(--border-primary) shadow-sm hover:shadow-2xl transition-all group"
    >
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center`} style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={20} className="md:w-6 md:h-6" />
        </div>
        <span className="text-[8px] md:text-[10px] font-black text-(--text-dim) uppercase tracking-wide">{subtitle}</span>
      </div>
      <h3 className="text-2xl md:text-4xl font-black text-(--text-primary) tracking-tighter mb-1 md:mb-2">{value}</h3>
      <p className="text-[9px] md:text-[11px] font-bold text-(--text-secondary) uppercase tracking-wide">{title}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data, loading, error } = useDashboardStats();
  const today = format(new Date(), 'EEEE, dd MMMM yyyy');

  if (error) {
    return (
      <AdminLayout title="Dashboard" subtitle="Error">
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <p className="text-sm font-bold text-(--text-secondary) mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-wide">Coba Lagi</button>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Memuat...">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 p-4 md:p-0">
          {[1,2,3,4].map(i => <div key={i} className="h-32 md:h-44 bg-(--bg-input) opacity-30 rounded-3xl animate-pulse" />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" subtitle={today}>
      <motion.div
        className="max-w-7xl mx-auto space-y-8 md:space-y-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Minimalist */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div>
            <p className="text-red-600 text-[9px] md:text-[10px] font-black uppercase tracking-wide mb-2 md:mb-3">System Overview</p>
            <h1 className="text-2xl md:text-5xl font-black text-(--text-primary) tracking-tight italic uppercase leading-tight">Ringkasan <span className="text-(--text-dim) font-normal">Hari Ini.</span></h1>
          </div>
          <div className="flex flex-row gap-3">
             <button className="flex-1 md:flex-none h-11 md:h-14 px-4 md:px-8 rounded-xl md:rounded-2xl bg-(--bg-card) border border-(--border-primary) text-[9px] md:text-[11px] font-black uppercase tracking-wide text-(--text-primary) hover:bg-(--bg-input) transition-all">Report</button>
             <Link href="/attendance" className="flex-1 md:flex-none h-11 md:h-14 px-6 md:px-10 rounded-xl md:rounded-2xl bg-red-600 text-white flex items-center justify-center gap-2 md:gap-3 text-[9px] md:text-[11px] font-black uppercase tracking-wide shadow-lg shadow-red-500/20 hover:scale-105 transition-all">Live <ArrowRight size={14} className="md:w-4 md:h-4" /></Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <SimpleStatCard 
            title="Hadir" 
            value={data?.presentToday || 0} 
            icon={UserCheck} 
            color="#CC0000" 
            subtitle="Live"
          />
          <SimpleStatCard 
            title="Terlambat" 
            value={data?.lateToday || 0} 
            icon={Clock} 
            color="#F59E0B" 
            subtitle="Alert"
          />
          <SimpleStatCard 
            title="Izin" 
            value={data?.onLeaveToday || 0} 
            icon={Calendar} 
            color="#005596" 
            subtitle="Permits"
          />
          <SimpleStatCard 
            title="Total" 
            value={data?.totalEmployees || 0} 
            icon={Users} 
            color="#64748B" 
            subtitle="Active"
          />
        </div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Recent Attendance */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-(--bg-card) rounded-3xl md:rounded-[2.5rem] border border-(--border-primary) p-6 md:p-10 shadow-sm">
             <div className="flex items-center justify-between mb-6 md:mb-10">
                <h3 className="text-lg md:text-xl font-black text-(--text-primary) tracking-tight italic uppercase">Aktivitas <span className="text-(--text-dim) font-normal">Terakhir.</span></h3>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-(--bg-input) flex items-center justify-center text-(--text-dim) cursor-pointer hover:text-red-600 transition-colors">
                   <Search size={14} className="md:w-5 md:h-5" />
                </div>
             </div>

             <div className="space-y-2 md:space-y-4">
                {(data?.recentActivities?.length ?? 0) > 0 ? (
                  data?.recentActivities.slice(0, 5).map((act, i) => (
                    <div key={i} className="group flex items-center justify-between p-3 md:p-6 rounded-2xl md:rounded-3xl hover:bg-(--bg-input) transition-all border border-transparent hover:border-(--border-primary)">
                      <div className="flex items-center gap-3 md:gap-6">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-white text-[10px] md:text-sm shadow-lg" style={{ background: act.color || '#64748B' }}>
                          {act.userName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-base font-black text-(--text-primary) uppercase tracking-tight truncate">{act.userName}</p>
                          <p className="text-[8px] md:text-[10px] font-bold text-(--text-dim) uppercase tracking-wide truncate">{act.department} Unit</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] md:text-sm font-black text-(--text-primary)">{act.checkIn}</p>
                        <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-wide ${act.status === 'late' ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {act.status === 'late' ? 'Late' : 'On Time'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 md:py-20 text-center opacity-20 italic font-black uppercase tracking-wide text-[10px] text-(--text-dim)">No Data Available</div>
                )}
             </div>
             
             <Link href="/attendance" className="flex items-center justify-center w-full mt-6 md:mt-10 py-4 md:py-6 border-t border-(--border-primary) text-[9px] md:text-[10px] font-black text-(--text-dim) uppercase tracking-wide hover:text-red-600 transition-colors">Lihat Semua Aktivitas</Link>
          </motion.div>

          {/* Quick Management Section */}
          <motion.div variants={itemVariants} className="space-y-6 md:space-y-8">
             <div className="p-6 md:p-10 bg-slate-900 rounded-3xl md:rounded-[2.5rem] text-white relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-red-600 opacity-20 rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000"></div>
                <Zap size={24} className="text-red-500 mb-4 md:mb-6 md:w-8 md:h-8" />
                <h3 className="text-lg md:text-xl font-black mb-2 md:mb-4 italic uppercase">Sistem <span className="text-white/40 font-normal">Aktif.</span></h3>
                <p className="text-[10px] md:text-xs text-white/60 leading-relaxed mb-6 md:mb-10">Seluruh node JNE Martapura tersinkronisasi secara real-time.</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-2 rounded-full bg-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-wide border border-white/10">
                   <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                   Stable
                </div>
             </div>

             <div className="p-6 md:p-10 bg-(--bg-card) rounded-3xl md:rounded-[2.5rem] border border-(--border-primary) shadow-sm">
                <h3 className="text-[10px] md:text-xs font-black text-(--text-primary) uppercase tracking-wide mb-6 md:mb-8">Navigasi Cepat</h3>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                   {[
                      { label: 'Staff', href: '/employees' },
                      { label: 'Reports', href: '/reports' },
                      { label: 'Config', href: '/settings' },
                      { label: 'Depart', href: '/departments' },
                   ].map((nav) => (
                      <Link key={nav.label} href={nav.href} className="p-3 md:p-5 rounded-xl md:rounded-2xl bg-(--bg-input) border border-(--border-primary) text-[8px] md:text-[10px] font-black uppercase tracking-wide text-(--text-secondary) hover:bg-red-600 hover:text-white hover:border-red-600 transition-all text-center">
                         {nav.label}
                      </Link>
                   ))}
                </div>
             </div>
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
