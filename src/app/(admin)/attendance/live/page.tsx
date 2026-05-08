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

export default function LiveAttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const unsub = subscribeToTodayAttendance(today, (data) => {
      setRecords(data);
      setLoading(false);
    });
    return () => unsub();
  }, [today]);

  const filtered = records.filter(r => 
    r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    r.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-(--border-color) flex items-center justify-center text-slate-500 hover:text-cyan-600 hover:border-cyan-600 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter italic uppercase">Live <span className="text-cyan-600">Feed</span></h1>
              <div className="px-2 py-0.5 bg-cyan-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">Live</div>
            </div>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 ml-1">Pemantauan Presensi Real-Time JNE Martapura</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden md:flex flex-col text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Update Status</p>
              <p className="text-xs font-black text-emerald-500 italic uppercase">System Online & Secure</p>
           </div>
           <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20">
              <RefreshCw size={20} className="animate-spin-slow" />
           </div>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Tepat Waktu', val: records.filter(r => r.status === 'present').length, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
            { label: 'Terlambat', val: records.filter(r => r.status === 'late').length, color: 'text-cyan-600', bg: 'bg-cyan-600/5' },
            { label: 'Izin/Sakit', val: records.filter(r => r.status === 'leave').length, color: 'text-amber-500', bg: 'bg-amber-500/5' },
            { label: 'Total Hari Ini', val: records.length, color: 'text-slate-900 dark:text-white', bg: 'bg-slate-950 text-white!' },
          ].map((s, i) => (
           <div key={i} className={`bento-card p-6! border-none ${s.bg}`}>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{s.label}</p>
              <h3 className={`text-2xl font-black mt-2 tracking-tight ${s.color}`}>{s.val}</h3>
           </div>
         ))}
      </div>

      {/* ── MAIN TABLE BENTO ── */}
      <div className="bento-card overflow-hidden p-0!">
        <div className="p-8 border-b border-(--border-color) flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <Activity className="text-cyan-600" size={20} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white">Active Logs Today</span>
            </div>
            <div className="relative w-full md:w-80 group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search activity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 bg-white dark:bg-slate-950 border border-(--border-color) rounded-xl pl-12 pr-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-cyan-600/5 focus:border-cyan-600/30 transition-all"
              />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-(--border-color)">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Personnel</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Log Time</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Verification</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color)">
              <AnimatePresence mode="popLayout">
                {filtered.map((r, idx) => (
                  <motion.tr 
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-xs font-black text-white italic shadow-lg">
                          {r.employeeName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">{r.employeeName}</p>
                          <p className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">{r.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{r.checkIn?.time ? format(new Date(r.checkIn.time), 'HH:mm') : '--:--'}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Entry Registered</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                          r.status === 'present' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                          r.status === 'late' ? 'bg-cyan-600/10 border-cyan-600/20 text-cyan-600' :
                          'bg-amber-500/10 border-amber-500/20 text-amber-500'
                       }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${r.status === 'present' ? 'bg-emerald-500' : r.status === 'late' ? 'bg-cyan-600' : 'bg-amber-500'}`} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{r.status}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-600 transition-colors">
                             <ShieldCheck size={16} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Biometric Match</span>
                       </div>
                    </td>
                     <td className="px-8 py-6 text-right">
                       <div className="flex flex-col items-end gap-1">
                          <a 
                            href={r.checkIn?.latitude ? `https://www.google.com/maps?q=${r.checkIn.latitude},${r.checkIn.longitude}` : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-slate-400 hover:text-cyan-600 transition-colors"
                          >
                             <MapPin size={12} />
                             <span className="text-[10px] font-bold uppercase tracking-widest italic">
                               {r.checkIn?.latitude ? r.checkIn.latitude.toFixed(4) : '0.0000'}, 
                               {r.checkIn?.longitude ? r.checkIn.longitude.toFixed(4) : '0.0000'}
                             </span>
                          </a>
                          <div className="flex items-center gap-1.5">
                            {(r.checkIn?.distance ?? 0) > 100 && (
                              <div className="w-2 h-2 rounded-full bg-cyan-600 shadow-[0_0_8px_rgba(8,145,178,0.5)]" />
                            )}
                            <p className={`text-[10px] font-black italic uppercase tracking-tighter ${(r.checkIn?.distance ?? 0) > 100 ? 'text-cyan-600' : 'text-slate-900 dark:text-white'}`}>
                              {(r.checkIn?.distance ?? 0) > 100 ? 'Remote Duty / Satellite' : 'JNE Martapura Hub'}
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
            <div className="py-20 flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100 dark:border-white/5">
                  <AlertCircle size={32} />
               </div>
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">No Activity Detected</h3>
               <p className="text-[11px] font-medium text-slate-500 mt-2">Belum ada data absensi masuk untuk kriteria pencarian ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
