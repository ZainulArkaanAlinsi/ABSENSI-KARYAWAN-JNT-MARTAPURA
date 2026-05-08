'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAttendanceByRange } from '@/lib/firestore';
import type { AttendanceRecord } from '@/types';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { 
  Search, 
  Calendar, 
  Filter, 
  ArrowLeft, 
  Building2,
  ChevronLeft,
  ChevronRight,
  History,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    present:  { label: 'Hadir',      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-400/10' },
    late:     { label: 'Terlambat',  color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-400/10' },
    absent:   { label: 'Alpa',       color: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-50 dark:bg-rose-400/10' },
    leave:    { label: 'Izin',       color: 'text-blue-600 dark:text-blue-400',  bg: 'bg-blue-50 dark:bg-blue-400/10' },
    overtime: { label: 'Lembur',     color: 'text-cyan-600 dark:text-cyan-400',    bg: 'bg-cyan-50 dark:bg-cyan-400/10' },
  };
  const s = map[status] || map.absent;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${s.bg} ${s.color} border border-transparent`}>
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
    link.download = `History_Absensi_${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-10">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 hover:text-slate-950 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Kembali
          </button>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">
            Registry <span className="text-blue-600 dark:text-blue-400">Archive</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
              <input 
                type="month" 
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-transparent border-none text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none w-32 cursor-pointer uppercase tracking-widest"
              />
           </div>
           <button 
             onClick={handleExport}
             className="h-10 px-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
           >
              <FileSpreadsheet size={14} />
              Export
           </button>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="flex flex-col md:flex-row gap-3">
         <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-950 dark:text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
            />
         </div>
         <div className="flex items-center gap-2 px-4 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <Building2 size={14} className="text-blue-600 dark:text-blue-400" />
            <select 
               value={deptFilter}
               onChange={(e) => setDeptFilter(e.target.value)}
               className="bg-transparent text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 outline-none appearance-none cursor-pointer pr-8 min-w-[140px] tracking-widest"
            >
               <option value="all" className="bg-white dark:bg-slate-950">Semua Unit</option>
               <option value="Rider Martapura" className="bg-white dark:bg-slate-950">Rider Martapura</option>
               <option value="Inbound" className="bg-white dark:bg-slate-950">Inbound</option>
               <option value="Outbound" className="bg-white dark:bg-slate-950">Outbound</option>
               <option value="Office" className="bg-white dark:bg-slate-950">Office</option>
            </select>
            <Filter size={12} className="text-slate-400 -ml-6 pointer-events-none" />
         </div>
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest">
                     <th className="px-6 py-4">Personnel</th>
                     <th className="px-6 py-4">Unit</th>
                     <th className="px-6 py-4">Waktu Absen</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-right">Opsi</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}><td colSpan={5} className="px-6 py-5"><div className="h-3 w-full bg-slate-50 dark:bg-slate-800 animate-pulse rounded" /></td></tr>
                    ))
                  ) : filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                         <div className="flex flex-col items-center gap-3 opacity-20 text-slate-900 dark:text-white">
                            <History size={48} />
                            <p className="text-xs font-black uppercase tracking-widest">Arsip Kosong</p>
                         </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase border border-slate-200 dark:border-slate-800">
                                  {rec.employeeName.charAt(0)}
                               </div>
                               <div>
                                  <p className="text-xs font-black text-slate-950 dark:text-white tracking-tight leading-none mb-1 uppercase italic">{rec.employeeName}</p>
                                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{rec.employeeId}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">{rec.department}</span>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 italic uppercase">
                                  {format(parseISO(rec.date), 'dd MMM yyyy', { locale: localeId })}
                               </p>
                               <div className="flex items-center gap-1.5 mt-0.5 opacity-60">
                                  <Clock3 size={10} className="text-blue-600 dark:text-blue-400" />
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                     {rec.checkIn?.time ? format(new Date(rec.checkIn.time), 'HH:mm:ss') : '—'}
                                  </span>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <StatusChip status={rec.status} />
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                               <Search size={16} />
                            </button>
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>

         {/* ── PAGINATION ── */}
         <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
               Total <span className="text-slate-950 dark:text-white">{filteredAttendance.length}</span> registry records
            </p>
            <div className="flex items-center gap-2">
               <button className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all" disabled>
                  <ChevronLeft size={18} />
               </button>
               <button className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-blue-600 transition-all">
                  <ChevronRight size={18} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
