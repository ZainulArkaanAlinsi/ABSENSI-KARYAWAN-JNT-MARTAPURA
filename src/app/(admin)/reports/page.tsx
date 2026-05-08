'use client';

import { useReportManagement } from '@/hooks/useReportManagement';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  Filter, 
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportsPage() {
  const {
    loading,
    search,
    setSearch,
    month,
    setMonth,
    reports,
    filteredReports,
    handleExport,
    stats
  } = useReportManagement();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 size={40} className="animate-spin text-cyan-600" />
        <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-[0.3em]">Menyusun Laporan Berkala...</p>
      </div>
    );
  }

  // Pre-define summary cards with safe access
  const summaryCards = [
    { label: 'Tepat Waktu', value: `${stats?.onTimeRate ?? 0}%`, icon: CheckCircle2, color: 'var(--metric-green-text)', bg: 'var(--metric-green-bg)', sub: 'Kedisiplinan' },
    { label: 'Keterlambatan', value: stats?.lateCount ?? 0, icon: Clock, color: 'var(--metric-peach-text)', bg: 'var(--metric-peach-bg)', sub: 'Total Menit' },
    { label: 'Mangkir (Alfa)', value: stats?.absentCount ?? 0, icon: AlertTriangle, color: 'var(--jne-rose)', bg: 'rgba(227, 30, 36, 0.05)', sub: 'Tanpa Keterangan' },
    { label: 'Log Absensi', value: reports?.length ?? 0, icon: FileText, color: 'var(--metric-blue-text)', bg: 'var(--metric-blue-bg)', sub: 'Bulan Berjalan' }
  ];

  return (
    <div className="dash-root max-w-[1400px] mx-auto space-y-8">
      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {summaryCards.map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.05 }}
             className="bg-(--bg-card) p-8 rounded-4xl border border-(--border-primary) shadow-sm flex items-center gap-6 group hover:shadow-md transition-all"
           >
              <div 
                className="h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                 <stat.icon size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                 <h3 className="text-2xl font-black text-(--text-primary) tracking-tighter">{stat.value}</h3>
                 <p className="text-[8px] font-bold text-(--text-dim) uppercase tracking-widest mt-1">{stat.sub}</p>
              </div>
           </motion.div>
         ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-(--bg-card) p-6 rounded-4xl border border-(--border-primary) shadow-sm flex flex-col lg:flex-row gap-4 items-center">
         <div className="flex-1 relative w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-(--text-dim) group-focus-within:text-cyan-600 transition-colors" size={18} />
            <input 
               type="text" 
               placeholder="Cari nama karyawan atau unit..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-(--border-primary) outline-none focus:border-cyan-600/30 font-bold text-(--text-primary) transition-all shadow-sm"
            />
         </div>
         <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-56">
               <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-(--text-dim)" size={16} />
               <input 
                  type="month" 
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-(--border-primary) outline-none font-black uppercase text-[11px] text-(--text-primary)"
               />
            </div>
            <button 
               onClick={handleExport}
               className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all shadow-lg shadow-cyan-600/20 active:scale-95"
            >
               <Download size={18} /> Export Data
            </button>
         </div>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-(--bg-card) rounded-4xl border border-(--border-primary) shadow-sm overflow-hidden">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
               <thead>
                  <tr className="bg-white/2">
                     <th className="px-10 py-6 text-left text-[10px] font-black text-(--text-muted) uppercase tracking-widest">Karyawan</th>
                     <th className="px-6 py-6 text-left text-[10px] font-black text-(--text-muted) uppercase tracking-widest">Unit Kerja</th>
                     <th className="px-6 py-6 text-center text-[10px] font-black text-(--text-muted) uppercase tracking-widest">Hadir</th>
                     <th className="px-6 py-6 text-center text-[10px] font-black text-(--text-muted) uppercase tracking-widest">Telat</th>
                     <th className="px-6 py-6 text-center text-[10px] font-black text-(--text-muted) uppercase tracking-widest">Alfa</th>
                     <th className="px-10 py-6 text-right text-[10px] font-black text-(--text-muted) uppercase tracking-widest">Aksi</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-(--border-primary)">
               <AnimatePresence>
                  {filteredReports?.map((report, idx) => (
                     <motion.tr 
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-white/2 transition-colors group"
                     >
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-white/5 border border-(--border-primary) flex items-center justify-center text-xs font-black text-(--text-primary)">
                                 {report.userName?.charAt(0) ?? '—'}
                              </div>
                              <span className="font-bold text-(--text-primary)">{report.userName}</span>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                           <span className="px-4 py-1.5 rounded-xl bg-cyan-600/5 text-[10px] font-black uppercase tracking-widest text-cyan-600 border border-cyan-600/20">
                              {report.department}
                           </span>
                        </td>
                        <td className="px-6 py-6 text-center font-black text-emerald-600">{report.presentDays}</td>
                        <td className="px-6 py-6 text-center font-black text-amber-500">{report.lateDays}</td>
                        <td className="px-6 py-6 text-center font-black text-rose-600">{report.absentDays}</td>
                        <td className="px-10 py-6 text-right">
                           <button className="h-9 w-9 rounded-xl bg-white/5 text-(--text-dim) hover:bg-(--text-primary) hover:text-(--bg-card) flex items-center justify-center transition-all">
                              <FileText size={18} />
                           </button>
                        </td>
                     </motion.tr>
                  ))}
               </AnimatePresence>
            </tbody>
         </table>
         </div>
      </div>
    </div>
  );
}
