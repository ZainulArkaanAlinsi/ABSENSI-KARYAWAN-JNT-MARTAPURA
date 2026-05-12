'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserCheck,
  Clock,
  UserMinus,
  Search,
  ChevronRight,
  Filter,
  Download,
  Calendar,
  MoreHorizontal,
  MapPin,
  ShieldCheck,
  Activity,
  AlertCircle,
  Inbox,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardStats } from '@/hooks/useDashboardStats';

// ── PRECISION SKELETONS ──

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-50 rounded-2xl ${className}`} />
);

// ── COMPONENTS ──

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    present: { label: 'Hadir', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    late: { label: 'Terlambat', color: 'text-amber-600', bg: 'bg-amber-50' },
    absent: { label: 'Alfa', color: 'text-rose-600', bg: 'bg-rose-50' },
    leave: { label: 'Izin', color: 'text-primary', bg: 'bg-primary/5' },
  };
  const s = map[status] || map.absent;
  return (
    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${s.bg} ${s.color} border border-transparent`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.color.replace('text-', 'bg-')} mr-2`} />
      {s.label}
    </span>
  );
}

function StatBento({ label, value, icon: Icon, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}
      className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm transition-all flex flex-col justify-between min-h-[160px]"
    >
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
          <Icon size={24} strokeWidth={1.5} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase tracking-tighter">
            <ArrowUpRight size={12} strokeWidth={3} />
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <h3 className="text-stats text-slate-900 tracking-tighter">{value || 0}</h3>
      </div>
    </motion.div>
  );
}

export default function AttendanceFinalPage() {
  const router = useRouter();
  const { data: stats, loading, error } = useDashboardStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredData = useMemo(() => {
    if (!stats?.recentActivities) return [];
    return stats.recentActivities.filter((p: any) => {
      const matchesSearch = p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (p.employeeId && p.employeeId.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTab = activeTab === 'All' || p.department === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [stats, searchQuery, activeTab]);

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in duration-700">
      
      {/* ── 1. HEADER (8pt Precision) ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
            <span>Registry</span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-primary italic">Operational Monitoring</span>
          </div>
          <h1 className="text-h1 text-slate-900 uppercase italic">
            Monitoring <span className="text-primary not-italic font-medium">Absensi</span>
          </h1>
          <p className="text-base text-slate-500 max-w-xl leading-relaxed">
            Sistem pengawasan personil real-time untuk optimalisasi logistik JNE Martapura. 
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="h-14 px-8 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
            <Download size={18} strokeWidth={2} />
            Export Log
          </button>
          <button 
            onClick={() => router.push('/attendance/live')}
            className="h-14 px-8 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <MapPin size={18} strokeWidth={2} />
            Tactical Map
          </button>
        </div>
      </div>

      {/* ── 2. STATS BENTO (cols-4 gap-6) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
               <Skeleton className="w-10 h-10 mb-6 rounded-xl" />
               <Skeleton className="w-24 h-4 mb-3" />
               <Skeleton className="w-16 h-10" />
            </div>
          ))
        ) : (
          <>
            <StatBento label="Hadir Hari Ini" value={stats?.presentToday} icon={UserCheck} trend="+12.5%" />
            <StatBento label="Terlambat" value={stats?.lateToday} icon={Clock} trend="+1.8%" />
            <StatBento label="Belum Absen" value={stats?.absentToday} icon={UserMinus} />
            <StatBento label="Izin / Cuti" value={stats?.onLeaveToday} icon={Calendar} />
          </>
        )}
      </div>

      {/* ── 3. SEARCH & FILTERS HUB ── */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Cari personil berdasarkan nama atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 bg-slate-50 border border-transparent rounded-2xl pl-16 pr-8 text-sm font-semibold text-slate-900 placeholder:text-slate-300 outline-none focus:bg-white focus:border-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          {['All', 'Delivery', 'Gudang', 'Admin'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-white text-primary shadow-sm border border-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-200 mx-2" />
          <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary transition-colors">
            <Filter size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── 4. MAIN OPERATIONAL GRID (cols-4 inside 9/12) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Table Module (75%) */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                <ShieldCheck size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Personnel Registry</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Tactical Feed</p>
              </div>
            </div>
            {!loading && (
              <span className="px-5 py-2 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100">
                {filteredData.length} active records
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100">
                  <th className="px-10 py-6">Personnel</th>
                  <th className="px-10 py-6">Sector</th>
                  <th className="px-10 py-6 text-center">Status</th>
                  <th className="px-10 py-6">Timeline</th>
                  <th className="px-10 py-6 text-right">Option</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                       <td className="px-10 py-8"><div className="flex gap-4"><Skeleton className="w-12 h-12 rounded-2xl" /><div className="space-y-2"><Skeleton className="w-32 h-4" /><Skeleton className="w-20 h-3" /></div></div></td>
                       <td className="px-10 py-8"><Skeleton className="w-24 h-6 rounded-full" /></td>
                       <td className="px-10 py-8"><Skeleton className="w-20 h-8 rounded-full" /></td>
                       <td className="px-10 py-8"><Skeleton className="w-24 h-4" /></td>
                       <td className="px-10 py-8 text-right"><Skeleton className="w-8 h-8 ml-auto rounded-full" /></td>
                    </tr>
                  ))
                ) : filteredData.length > 0 ? (
                  <AnimatePresence>
                    {filteredData.map((person: any, i: number) => (
                      <motion.tr 
                        key={person.id || i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-slate-50/40 transition-all group"
                      >
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                              {person.userName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 tracking-tight">{person.userName || 'Unknown'}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{person.employeeId || 'ID-TEMP'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-[9px] font-black text-slate-500 px-4 py-2 bg-slate-100/50 rounded-xl border border-slate-100 uppercase tracking-widest">{person.department || 'Sector A'}</span>
                        </td>
                        <td className="px-10 py-8 text-center">
                          <StatusChip status={person.status || 'present'} />
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3 text-slate-900">
                            <Clock size={16} strokeWidth={2.5} className="text-slate-300" />
                            <span className="text-sm font-bold tracking-tighter tabular-nums">{person.checkIn || '--:--'}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <button className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-300 hover:text-slate-900 transition-all flex items-center justify-center">
                            <MoreHorizontal size={20} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                ) : (
                  <tr>
                    <td colSpan={5} className="py-40 text-center">
                       <div className="flex flex-col items-center gap-6">
                         <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                           <Inbox size={48} strokeWidth={1} />
                         </div>
                         <div className="space-y-1">
                           <h4 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Nexus Link Inactive</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No telemetry data detected in this sector.</p>
                         </div>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Stream (25%) */}
        <div className="lg:col-span-1 h-full">
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm flex flex-col min-h-[600px] sticky top-28 overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Telemetry</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Live Link</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-inner">
                <Activity size={20} strokeWidth={1.5} />
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              {stats?.recentActivities?.slice(0, 10).map((act: any, i: number) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4 p-4 rounded-[24px] bg-slate-50/30 border border-transparent hover:border-[#E67E22]/20 hover:bg-white hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0 group-hover:bg-[#E67E22] group-hover:text-white transition-all shadow-sm">
                    {act.userName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold truncate uppercase tracking-tight text-slate-900">{act.userName || 'Personnel'}</p>
                      <span className="text-[8px] text-slate-400 font-bold tabular-nums">{act.checkIn || '00:00'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={10} className="text-slate-300" />
                       <p className="text-[9px] text-slate-500 font-medium line-clamp-1 uppercase tracking-widest">{act.actionLabel || 'Registered'}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <button 
              onClick={() => router.push('/attendance/live')}
              className="mt-10 w-full py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#E67E22] transition-all shadow-xl shadow-slate-900/10 active:scale-95 group flex items-center justify-center gap-2"
            >
              Launch Live Map
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}