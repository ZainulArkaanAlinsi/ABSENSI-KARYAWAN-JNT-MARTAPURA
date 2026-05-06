'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, 
  Clock, 
  UserCheck, 
  Zap,
  MoreHorizontal,
  TrendingUp,
  Activity,
  Award,
  Search,
  UserPlus,
  ArrowUpRight,
  Package,
  MapPin,
  Calendar,
  ChevronRight,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuth } from '@/context/AuthContext';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function DashboardPage() {
  const { data, loading } = useDashboardStats();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const trendData = data?.weeklyTrends.map(t => ({
    name: t.day,
    hadir: t.present,
    late: t.late
  })) ?? [];

export default function DashboardPage() {
  const { data, loading } = useDashboardStats();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const trendData = data?.weeklyTrends.map(t => ({
    name: t.day,
    hadir: t.present,
    late: t.late
  })) ?? [];

  return (
    <div className="space-y-8 py-4">
      {/* ── OPERATIONAL HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-[#E31E24]/10 text-[#E31E24] text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-[#E31E24]/20">Martapura Hub</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-xs font-bold text-slate-400">ID: JNE-MTP-01</span>
           </div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard Operasional</h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Sesi Aktif</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{format(new Date(), 'EEEE, dd MMMM')}</p>
           </div>
           <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-400">
              <Calendar size={20} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* ── CORE METRICS ── */}
        {[
          { label: 'Karyawan Hadir', val: data?.presentToday ?? 0, icon: UserCheck, color: 'text-emerald-500', trend: 'Tepat Waktu' },
          { label: 'Absensi Terlambat', val: data?.lateToday ?? 0, icon: Clock, color: 'text-amber-500', trend: 'Menunggu Koreksi' },
          { label: 'Total Personel', val: data?.totalEmployees ?? 0, icon: Users, color: 'text-indigo-500', trend: 'Terdaftar di Hub' },
          { label: 'Izin Pending', val: data?.pendingLeaves ?? 0, icon: Zap, color: 'text-[#E31E24]', trend: 'Butuh Otorisasi' }
        ].map((item, i) => (
          <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-3">
             <motion.div 
               whileHover={{ y: -4 }}
               className="premium-card flex flex-col justify-between h-[160px] group"
             >
                <div className="flex justify-between items-start">
                   <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ${item.color} group-hover:scale-110 transition-transform`}>
                      <item.icon size={22} />
                   </div>
                   <ArrowUpRight className="text-slate-200 group-hover:text-indigo-500 transition-colors" size={18} />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{item.val}</h3>
                   <div className="flex flex-col">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-[9px] font-bold text-slate-500">{item.trend}</p>
                   </div>
                </div>
             </motion.div>
          </div>
        ))}

        {/* ── ANALYTICS CHART ── */}
        <div className="col-span-12">
          <div className="premium-card">
             <div className="flex items-center justify-between mb-10">
                <div>
                   <h3 className="text-lg font-black text-slate-900 dark:text-white">Tren Kehadiran Hub</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Rekapitulasi 7 Hari Terakhir</p>
                </div>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hadir</span>
                   </div>
                </div>
             </div>
             <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={trendData}>
                      <defs>
                         <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="hadir" stroke="#6366f1" fillOpacity={1} fill="url(#colorHadir)" strokeWidth={3} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
