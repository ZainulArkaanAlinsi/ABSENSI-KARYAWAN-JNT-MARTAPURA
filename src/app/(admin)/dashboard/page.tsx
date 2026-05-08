'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Clock,
  UserCheck,
  TrendingUp,
  FileText,
  Clock8,
  ChevronRight,
  Activity,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const AttendanceChart = dynamic(() => import('@/components/dashboard/AttendanceChart'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-50 dark:bg-slate-900/50 animate-pulse rounded-2xl" />
});

function CompactStat({ title, value, sub, icon: Icon, colorClass, iconColor }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10 dark:bg-opacity-20 transition-colors group-hover:bg-opacity-30`}>
          <Icon size={18} className={iconColor} />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-400/20">
          <TrendingUp size={10} />
          <span>+2.4%</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">{value || 0}</h3>
        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest italic">{sub}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: stats, loading } = useDashboardStats();

  const weeklyData = useMemo(() => {
    return stats?.weeklyTrends || [];
  }, [stats]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-10">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_#f97316]" />
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Enterprise Nexus / Online</span>
          </div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">
            Dashboard <span className="text-orange-600 font-light">Overview</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={() => router.push('/broadcast')}
             className="h-10 px-5 bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-orange-600/20"
           >
              <Zap size={14} />
              Broadcast
           </button>
        </div>
      </div>

      {/* ── SOS ALERT ── */}
      {stats?.pendingRequests.some((r: any) => r.type === 'SOS') && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600 p-4 rounded-2xl flex items-center justify-between text-white shadow-xl shadow-red-600/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight italic">Emergency SOS Active</h2>
              <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">Immediate Dispatch Required</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/requests')}
            className="px-6 h-10 bg-white text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm relative z-10"
          >
            Take Action
          </button>
        </motion.div>
      )}

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CompactStat title="Personel" value={stats?.totalEmployees} sub={`${stats?.onlineNowCount || 0} Aktif saat ini`} icon={Users} colorClass="bg-blue-600" iconColor="text-blue-600 dark:text-blue-400" />
        <CompactStat title="Hadir" value={stats?.presentToday} sub={`${stats?.absentToday} Belum absen`} icon={UserCheck} colorClass="bg-emerald-600" iconColor="text-emerald-600 dark:text-emerald-400" />
        <CompactStat title="On-Time Rate" value={`${stats?.punctualityRate}%`} sub="Daily Performance" icon={Clock} colorClass="bg-indigo-600" iconColor="text-indigo-600 dark:text-indigo-400" />
        <CompactStat title="Pending" value={stats?.pendingLeaves} sub="Approval needed" icon={FileText} colorClass="bg-amber-600" iconColor="text-amber-600 dark:text-amber-400" />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                   <Activity size={18} className="text-blue-600 dark:text-blue-400" />
                   <h3 className="font-black text-xs text-slate-950 dark:text-white uppercase tracking-widest italic">Attendance Vector</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Weekly Trend</span>
                </div>
             </div>
             <div className="h-[320px] w-full">
                <AttendanceChart data={weeklyData} />
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Clock8 size={18} className="text-slate-400" />
                   <h3 className="font-black text-xs text-slate-950 dark:text-white uppercase tracking-widest italic">Recent Registry</h3>
                </div>
                <button className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] hover:underline" onClick={() => router.push('/attendance')}>Monitor All</button>
             </div>
             <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {(stats?.recentActivities || []).slice(0, 5).map((act: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                               <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase italic">
                                  {act.userName.charAt(0)}
                               </div>
                               <p className="text-xs font-black text-slate-950 dark:text-white tracking-tight uppercase italic">{act.userName}</p>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <p className="text-[10px] font-medium text-slate-500 italic truncate">&ldquo;{act.actionLabel}&rdquo;</p>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                               <ArrowUpRight size={16} />
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4">
           <div className="bg-slate-950 dark:bg-black rounded-2xl p-6 text-white shadow-xl h-full min-h-[450px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Zap size={120} />
              </div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Queue Notifications</h3>
                 <span className="px-2 py-0.5 bg-orange-600 text-white rounded text-[8px] font-bold uppercase">{stats?.pendingRequests.length}</span>
              </div>
              
              <div className="flex-1 space-y-3 relative z-10 overflow-y-auto pr-2 custom-scrollbar">
                 {(stats?.pendingRequests || []).slice(0, 6).map((req: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                       <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-black tracking-tight uppercase italic">{req.employeeName}</p>
                          <span className="text-[9px] font-black text-orange-500 uppercase italic">{req.type}</span>
                       </div>
                       <p className="text-[10px] text-slate-500 line-clamp-1 mb-3 italic font-medium">Registry request pending approval...</p>
                       <button 
                          onClick={() => router.push('/requests')}
                          className="w-full py-2.5 bg-white text-slate-950 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-lg"
                       >
                          Review Now
                       </button>
                    </div>
                 ))}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}