'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronLeft,
  Download,
  Filter,
  ArrowUpRight,
  Zap,
  UserCheck,
  Terminal,
  AlertCircle,
  MoreHorizontal,
  Plus,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { subscribeToTodayAttendance, db } from '@/lib/firestore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { timeValueToISO } from '@/lib/departmentRules';
import { useDebounce } from '@/hooks/useDebounce';
import type { AttendanceRecord } from '@/types';
import { BentoCard } from '@/components/ui/BentoCard';
import { StatusBadge } from '@/components/ui/Badge';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

// ── SKELETONS ──

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-100 rounded-2xl ${className}`} />
);

// ── COMPONENTS ──

function LiveStatCard({ label, value, icon: Icon, color, index }: any) {
  return (
    <BentoCard 
      index={index}
      className="p-10 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} bg-opacity-10`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
      </div>
      <div>
        <p className="text-desc font-medium text-slate-400 mb-2 uppercase tracking-widest">{label}</p>
        <h3 className="text-stats font-extrabold text-slate-900 tracking-tight leading-none tabular-nums">
          {value}
        </h3>
      </div>
    </BentoCard>
  );
}

export default function LiveAttendancePage() {
  const router = useRouter();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'present' | 'late' | 'absent'>('all');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const unsub = subscribeToTodayAttendance(format(new Date(), 'yyyy-MM-dd'), (data: AttendanceRecord[]) => {
      setAttendance(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return attendance.filter((r) => {
      const matchSearch = r.employeeName?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                          r.employeeId?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchFilter = filter === 'all' || r.status === filter;
      return matchSearch && matchFilter;
    });
  }, [attendance, debouncedSearch, filter]);

  const stats = useMemo(() => ({
    total: attendance.length,
    present: attendance.filter(r => ['present', 'late', 'overtime'].includes(r.status)).length,
    late: attendance.filter(r => r.status === 'late').length,
    alerts: attendance.filter(r => r.isSos).length
  }), [attendance]);

  return (
    <div className="flex flex-col gap-10 w-full pb-20 max-w-[1440px] mx-auto">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-6">
        <div className="space-y-6">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-mustard transition-colors group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-h1 font-extrabold text-slate-900 tracking-tight leading-none mb-3">
              Live <span className="text-mustard">Monitor</span>
            </h1>
            <p className="text-desc font-medium text-slate-400 max-w-xl">
              Real-time synchronization of biometric attendance data for the Martapura Hub.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <AnimatedButton className="h-14 px-8 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-600 shadow-sm hover:border-mustard transition-all flex items-center gap-3">
            <Download size={18} />
            Export Feed
          </AnimatedButton>
          <AnimatedButton className="h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-mustard transition-all group">
            <RefreshCw size={24} className="group-active:rotate-180 transition-transform duration-500" />
          </AnimatedButton>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <LiveStatCard index={0} label="Total Records" value={stats.total} icon={Activity} color="bg-indigo-600" />
        <LiveStatCard index={1} label="On-Duty" value={stats.present} icon={UserCheck} color="bg-emerald-600" />
        <LiveStatCard index={2} label="Late Entry" value={stats.late} icon={Clock} color="bg-amber-600" />
        <LiveStatCard index={3} label="Alerts" value={stats.alerts} icon={AlertCircle} color="bg-rose-600" />
      </div>

      {/* ── FILTERS ── */}
      <BentoCard className="p-4" hoverEffect={false}>
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-mustard transition-colors" />
            <input
              type="text"
              placeholder="Filter by name, ID, or position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 bg-slate-50 border border-transparent rounded-xl pl-16 pr-8 text-desc font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-mustard focus:border-opacity-20 transition-all"
            />
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-56">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full h-14 bg-white border border-slate-100 rounded-xl px-6 pr-12 text-[11px] font-bold text-slate-600 uppercase tracking-widest outline-none cursor-pointer hover:border-mustard transition-all appearance-none"
              >
                <option value="all">ALL ACTIVITY</option>
                <option value="present">PRESENT</option>
                <option value="late">LATE</option>
                <option value="absent">ABSENT</option>
              </select>
              <Filter size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
            </div>
          </div>
        </div>
      </BentoCard>

      {/* ── LIVE FEED ── */}
      <BentoCard className="p-10">
        <div className="flex items-center justify-between mb-10">
           <div>
              <h3 className="text-[20px] font-extrabold text-slate-900 tracking-tight mb-1">Activity Stream</h3>
              <p className="text-[13px] font-medium text-slate-400">Continuous feed of personnel biometric sync events.</p>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-bold border border-emerald-100 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
           </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Personnel</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((r, i) => (
                  <motion.tr 
                    key={r.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-sm group-hover:bg-mustard transition-colors">
                          {r.employeeName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-desc font-bold text-slate-900">{r.employeeName}</p>
                          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">{r.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold text-slate-600">
                      {r.department}
                    </td>
                    <td className="px-8 py-5 text-[13px] font-medium text-slate-500 tabular-nums">
                      {typeof r.checkIn === 'string' ? r.checkIn : format(new Date(), 'HH:mm')}
                    </td>
                    <td className="px-8 py-5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-8 py-5 text-[12px] font-medium text-slate-400">
                       <div className="flex items-center gap-2">
                          <MapPin size={12} className="group-hover:text-mustard transition-colors" />
                          Hub Martapura
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
             <div className="py-20 text-center flex flex-col items-center">
               <AlertCircle size={32} className="text-slate-200 mb-4" />
               <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">No activity detected for this filter</p>
             </div>
          )}
        </div>
      </BentoCard>
    </div>
  );
}