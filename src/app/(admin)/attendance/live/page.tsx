'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Search, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  ChevronLeft,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { subscribeToTodayAttendance } from '@/lib/firestore';
import type { AttendanceRecord } from '@/types';
import { format } from 'date-fns';
import { useDebounce } from '@/hooks/useDebounce';
import { InteractiveButton, GlassCard } from '@/components/ui/Interactive';

export default function LiveAttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const unsub = subscribeToTodayAttendance(today, (data) => {
      setRecords(data);
      setLoading(false);
    });
    return () => unsub();
  }, [today]);

  const filtered = records.filter(r => 
    r.employeeName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    r.employeeId.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-20">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <InteractiveButton 
            onClick={() => router.back()}
            className="w-14 h-14 rounded-[20px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-500 hover:text-cyan-600 hover:border-cyan-600 transition-all shadow-xl"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </InteractiveButton>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter italic uppercase">Live <span className="text-cyan-600">Feed</span></h1>
              <div className="px-3 py-1 bg-cyan-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse shadow-lg shadow-cyan-600/20">Streaming</div>
            </div>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 ml-1">Real-Time Operational Monitoring Nexus</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex flex-col text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">System Status</p>
              <p className="text-xs font-black text-emerald-500 italic uppercase flex items-center gap-2 justify-end">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                Synchronized
              </p>
           </div>
           <GlassCard className="w-14 h-14 bg-emerald-500/5 text-emerald-500 rounded-[20px] flex items-center justify-center border-emerald-500/10 border">
              <RefreshCw size={24} className="animate-spin-slow" />
           </GlassCard>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Punctual', val: records.filter(r => r.status === 'present').length, color: 'text-emerald-500', bg: 'bg-emerald-500/5', icon: ShieldCheck },
            { label: 'Tardy / Late', val: records.filter(r => r.status === 'late').length, color: 'text-cyan-600', bg: 'bg-cyan-600/5', icon: Clock },
            { label: 'Authorized Leave', val: records.filter(r => r.status === 'leave').length, color: 'text-amber-500', bg: 'bg-amber-500/5', icon: AlertCircle },
            { label: 'Total Operations', val: records.length, color: 'text-white', bg: 'bg-slate-950', icon: Activity },
          ].map((s, i) => (
           <GlassCard key={i} className={`p-8 border-none flex items-center justify-between group ${s.bg}`}>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${s.color}`}>{s.label}</p>
                <h3 className={`text-3xl font-black mt-3 tracking-tighter italic ${s.color}`}>{s.val}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color} bg-white/10 group-hover:scale-110 transition-transform`}>
                <s.icon size={22} />
              </div>
           </GlassCard>
         ))}
      </div>

      {/* ── MAIN LOG FEED ── */}
      <GlassCard className="overflow-hidden p-0! border-none bg-white/50 dark:bg-slate-900/50">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-cyan-600/10 rounded-xl flex items-center justify-center text-cyan-600">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white">Active Logs Today</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
              </div>
            </div>
            <div className="relative w-full lg:w-96 group">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Filter by Name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-2xl pl-12 pr-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-cyan-600/5 focus:border-cyan-600/30 transition-all shadow-sm"
              />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 dark:bg-black/20 border-b border-slate-100 dark:border-white/5">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Operative</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Auth Method</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Geographic Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              <AnimatePresence mode="popLayout">
                {filtered.map((r, idx) => (
                  <motion.tr 
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                    className="group hover:bg-white dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-sm font-black text-white italic shadow-xl group-hover:rotate-3 transition-transform">
                          {r.employeeName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-base font-black text-slate-950 dark:text-white italic uppercase tracking-tighter leading-none">{r.employeeName}</p>
                          <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mt-1.5">{r.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-950 dark:text-white">
                          {(() => {
                            try {
                              return r.checkIn?.time ? format(new Date(r.checkIn.time), 'HH:mm:ss') : '--:--:--';
                            } catch (e) {
                              return '--:--:--';
                            }
                          })()}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Signal</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                        <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border-2 ${
                          r.status === 'present' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' :
                          r.status === 'late' ? 'bg-cyan-600/5 border-cyan-600/20 text-cyan-600' :
                          'bg-amber-500/5 border-amber-500/20 text-amber-500'
                       }`}>
                          <div className={`w-2 h-2 rounded-full ${r.status === 'present' ? 'bg-emerald-500' : r.status === 'late' ? 'bg-cyan-600' : 'bg-amber-500'} animate-pulse`} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{r.status}</span>
                       </div>
                    </td>
                    <td className="px-10 py-7">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-600 group-hover:bg-cyan-600/10 transition-all">
                             <ShieldCheck size={20} />
                          </div>
                          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">Biometric AI</span>
                       </div>
                    </td>
                     <td className="px-10 py-7 text-right">
                       <div className="flex flex-col items-end gap-2">
                          <InteractiveButton 
                            onClick={() => {
                              if (r.checkIn?.latitude) {
                                window.open(`https://www.google.com/maps?q=${r.checkIn.latitude},${r.checkIn.longitude}`, '_blank');
                              }
                            }}
                            className="flex items-center gap-2 text-slate-400 hover:text-cyan-600 transition-colors"
                          >
                             <MapPin size={14} />
                             <span className="text-[10px] font-black uppercase tracking-widest italic underline decoration-dotted underline-offset-4">
                               Pinpoint Location
                             </span>
                          </InteractiveButton>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${(r.checkIn?.distance ?? 0) > 100 ? 'bg-rose-500' : 'bg-emerald-500'} shadow-sm`} />
                            <p className={`text-[10px] font-black italic uppercase tracking-tighter ${(r.checkIn?.distance ?? 0) > 100 ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {(r.checkIn?.distance ?? 0) > 100 ? 'External Node' : 'Hub Proximity'}
                            </p>
                          </div>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filtered.length === 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 flex flex-col items-center text-center"
            >
               <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[24px] flex items-center justify-center text-slate-300 mb-6 border border-slate-100 dark:border-white/5">
                  <AlertCircle size={40} />
               </div>
               <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest italic">No Signal Detected</h3>
               <p className="text-xs font-bold text-slate-500 mt-3 uppercase tracking-widest opacity-60">Scanning for operative activity in Nexus...</p>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
