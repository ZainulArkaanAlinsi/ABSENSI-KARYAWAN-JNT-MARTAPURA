'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Clock, 
  UserCheck, 
  UserMinus, 
  MapPin,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardStats } from '@/hooks/useDashboardStats';

// ── COMPACT SUB-COMPONENTS ──

function CompactStat({ label, value, icon: Icon, colorClass, iconColor }: any) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value || 0}</h3>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    present:  { label: 'Hadir',      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-400/10' },
    late:     { label: 'Terlambat',  color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-400/10' },
    absent:   { label: 'Alpa',       color: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-50 dark:bg-rose-400/10' },
    leave:    { label: 'Izin',       color: 'text-blue-600 dark:text-blue-400',  bg: 'bg-blue-50 dark:bg-blue-400/10' },
  };
  const s = map[status] || map.absent;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${s.bg} ${s.color} border border-transparent`}>
      {s.label}
    </span>
  );
}

export default function AttendanceControlTower() {
  const router = useRouter();
  const { data: stats, loading } = useDashboardStats();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPersonnel = useMemo(() => {
    if (!stats?.recentActivities) return [];
    return stats.recentActivities.filter((p: any) => 
      p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stats, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-10">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Control Tower / Live</span>
          </div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">
            Monitoring <span className="text-blue-600 dark:text-blue-400">Absensi</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push('/attendance/live')}
            className="h-10 px-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
          >
             <MapPin size={14} />
             Tactical Map
          </button>
          <button 
            onClick={() => router.push('/attendance/history')}
            className="h-10 px-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
             <History size={14} />
             Archive
          </button>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CompactStat label="Total Hadir" value={stats?.presentToday} icon={UserCheck} colorClass="bg-emerald-500" iconColor="text-emerald-600 dark:text-emerald-400" />
        <CompactStat label="Terlambat" value={stats?.lateToday} icon={Clock} colorClass="bg-amber-500" iconColor="text-amber-600 dark:text-amber-400" />
        <CompactStat label="Belum Absen" value={stats?.absentToday} icon={UserMinus} colorClass="bg-rose-500" iconColor="text-rose-600 dark:text-rose-400" />
        <CompactStat label="Izin / Sakit" value={stats?.onLeaveToday} icon={Activity} colorClass="bg-blue-500" iconColor="text-blue-600 dark:text-blue-400" />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT: MONITOR TABLE */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400" />
                    <h3 className="font-black text-xs text-slate-950 dark:text-white uppercase tracking-widest">Personnel Registry</h3>
                 </div>
                 
                 <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                       type="text" 
                       placeholder="Cari..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full md:w-56 h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-950 dark:text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-[0.15em]">
                          <th className="px-6 py-4">Personnel</th>
                          <th className="px-6 py-4">Unit</th>
                          <th className="px-6 py-4">Waktu</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Opt</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {filteredPersonnel.map((person: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-400 uppercase border border-slate-200 dark:border-slate-800">
                                      {person.userName.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-slate-950 dark:text-white tracking-tight leading-none mb-1 uppercase italic">{person.userName}</p>
                                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{person.department}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">{person.department}</span>
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                   <Clock size={12} className="text-blue-600 dark:text-blue-400" />
                                   <span className="text-[11px] font-black tracking-widest">{person.checkIn}</span>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <StatusChip status={person.status || 'present'} />
                             </td>
                             <td className="px-6 py-4 text-right">
                                <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                   <ArrowUpRight size={18} />
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* RIGHT: FEED */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <div className="bg-slate-950 dark:bg-black rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col h-full min-h-[500px]">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                 <Activity size={100} />
              </div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Live Stream</h3>
                 <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-bold uppercase animate-pulse">Scanning</span>
              </div>

              <div className="flex-1 space-y-3 relative z-10 overflow-y-auto pr-2 custom-scrollbar">
                 {stats?.recentActivities.slice(0, 10).map((act: any, i: number) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                       <div className="w-9 h-9 shrink-0 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-white transition-colors uppercase italic">
                          {act.userName.charAt(0)}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                             <p className="text-xs font-black tracking-tight truncate uppercase italic">{act.userName}</p>
                             <span className="text-[9px] text-slate-600 font-bold">{act.checkIn}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 italic font-medium">&ldquo;{act.actionLabel}&rdquo;</p>
                       </div>
                    </div>
                 ))}
              </div>

              <button 
                 onClick={() => router.push('/attendance/live')}
                 className="mt-6 w-full py-4 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5"
              >
                 Open Tactical Map
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
