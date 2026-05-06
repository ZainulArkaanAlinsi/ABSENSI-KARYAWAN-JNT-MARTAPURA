'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAttendanceByRange, getEmployees } from '@/lib/firestore';
import type { AttendanceRecord, Employee } from '@/types';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { 
  Search, 
  Calendar, 
  Filter, 
  ArrowLeft, 
  Download, 
  Clock, 
  User, 
  Building2,
  ChevronLeft,
  ChevronRight,
  History,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    present:  { label: 'Hadir',      color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', icon: CheckCircle2 },
    late:     { label: 'Terlambat',  color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock3 },
    absent:   { label: 'Alpa',       color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', icon: XCircle },
    leave:    { label: 'Izin/Cuti',  color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)', icon: AlertCircle },
    overtime: { label: 'Lembur',     color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.1)', icon: History },
  };
  const s = map[status] || map.absent;
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-white/5"
      style={{ background: s.bg, color: s.color, borderColor: `${s.color}20` }}
    >
      <Icon size={12} />
      {s.label}
    </span>
  );
}

export default function AttendanceHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDept = searchParams.get('dept') || 'all';

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [deptFilter, setDeptFilter] = useState(initialDept);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const dateObj = parseISO(`${month}-01`);
        const start = startOfMonth(dateObj);
        const end = endOfMonth(dateObj);
        
        const data = await getAttendanceByRange(
          format(start, 'yyyy-MM-dd'),
          format(end, 'yyyy-MM-dd')
        );
        setAttendance(data);
      } catch (error) {
        console.error('Failed to fetch attendance history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [month]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter(item => {
      const matchSearch = 
        item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        item.employeeId.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === 'all' || item.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [attendance, search, deptFilter]);

  const handleExport = () => {
    const headers = ['Tanggal', 'Nama', 'ID Karyawan', 'Unit', 'Status', 'Masuk', 'Pulang'];
    const rows = filteredAttendance.map(a => [
      a.date,
      a.employeeName,
      a.employeeId,
      a.department,
      a.status,
      a.checkIn?.time ? format(new Date(a.checkIn.time), 'HH:mm:ss') : '-',
      a.checkOut?.time ? format(new Date(a.checkOut.time), 'HH:mm:ss') : '-'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `History_Absensi_${month}_${deptFilter}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="dash-root space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Header Area ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
               <button 
                onClick={() => router.back()}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
               >
                 <ArrowLeft size={16} className="text-slate-400 group-hover:text-white transition-colors" />
               </button>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">Archive Explorer</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Attendance <span className="text-rose-600">History</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Menampilkan data absensi berdasar rentang waktu & unit operasional
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={16} />
                <input 
                  type="month" 
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 text-xs font-black uppercase text-white outline-none focus:border-rose-600/50 transition-all w-full sm:w-48"
                />
             </div>
             <button 
               onClick={handleExport}
               className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-lg shadow-rose-600/20 active:scale-95"
             >
                <Download size={16} />
                Export CSV
             </button>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 p-4 rounded-3xl flex flex-col md:flex-row gap-4">
           <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Cari Nama atau ID Karyawan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/2 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-medium text-white outline-none focus:border-rose-600/30 focus:bg-white/5 transition-all"
              />
           </div>
           <div className="flex items-center gap-3">
              <div className="relative group min-w-[200px]">
                 <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={16} />
                 <select 
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="w-full bg-white/2 border border-white/5 rounded-2xl pl-12 pr-10 py-4 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-rose-600/30 appearance-none cursor-pointer"
                 >
                    <option value="all" className="bg-slate-900 text-white">Semua Unit</option>
                    <option value="Rider Martapura" className="bg-slate-900 text-white">Rider Martapura</option>
                    <option value="Inbound" className="bg-slate-900 text-white">Inbound</option>
                    <option value="Outbound" className="bg-slate-900 text-white">Outbound</option>
                    <option value="Office" className="bg-slate-900 text-white">Office</option>
                 </select>
                 <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Filter size={14} className="text-slate-600" />
                 </div>
              </div>
           </div>
        </div>

        {/* ── Results Table ── */}
        <div className="bg-slate-900/30 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-sm">
           <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                 <thead>
                    <tr className="bg-white/2 border-b border-white/5">
                       <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Karyawan</th>
                       <th className="px-6 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Unit</th>
                       <th className="px-6 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tanggal</th>
                       <th className="px-6 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                       <th className="px-6 py-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Masuk</th>
                       <th className="px-6 py-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Pulang</th>
                       <th className="px-8 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {loading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={7} className="px-8 py-4">
                            <div className="h-12 w-full bg-white/2 animate-pulse rounded-2xl" />
                          </td>
                        </tr>
                      ))
                    ) : filteredAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-8 py-32 text-center">
                           <div className="flex flex-col items-center gap-4 opacity-30 text-white">
                              <History size={64} strokeWidth={1} />
                              <p className="text-xs font-black uppercase tracking-[0.3em]">No archive records found</p>
                           </div>
                        </td>
                      </tr>
                    ) : (
                      <AnimatePresence>
                        {filteredAttendance.map((rec, idx) => (
                          <motion.tr 
                            key={rec.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="hover:bg-white/[0.03] transition-colors group"
                          >
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                   <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-rose-500 text-xs">
                                      {rec.employeeName.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-white leading-none mb-1">{rec.employeeName}</p>
                                      <p className="text-[10px] font-bold text-slate-500 tracking-wider">{rec.employeeId}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-5">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                   {rec.department}
                                </span>
                             </td>
                             <td className="px-6 py-5">
                                <p className="text-[12px] font-bold text-white leading-none mb-1">
                                   {format(parseISO(rec.date), 'dd MMM yyyy', { locale: localeId })}
                                </p>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
                                   {format(parseISO(rec.date), 'EEEE', { locale: localeId })}
                                </p>
                             </td>
                             <td className="px-6 py-5">
                                <StatusBadge status={rec.status} />
                             </td>
                             <td className="px-6 py-5 text-center font-mono text-xs font-bold text-slate-300">
                                {rec.checkIn?.time ? format(new Date(rec.checkIn.time), 'HH:mm:ss') : '—'}
                             </td>
                             <td className="px-6 py-5 text-center font-mono text-xs font-bold text-slate-300">
                                {rec.checkOut?.time ? format(new Date(rec.checkOut.time), 'HH:mm:ss') : '—'}
                             </td>
                             <td className="px-8 py-5 text-right">
                                <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-rose-600 transition-all">
                                   <Search size={16} />
                                </button>
                             </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* ── Pagination Footer (Mockup for Infinite Scroll/Pagination) ── */}
        <div className="flex items-center justify-between px-6">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Total <span className="text-white">{filteredAttendance.length}</span> Records Detected
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all disabled:opacity-20" disabled>
                 <ChevronLeft size={18} />
              </button>
              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all">
                 <ChevronRight size={18} />
              </button>
           </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </AdminLayout>
  );
}
