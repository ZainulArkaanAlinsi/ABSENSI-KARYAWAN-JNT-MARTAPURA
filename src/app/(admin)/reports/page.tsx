'use client';

import { useReportManagement } from '@/hooks/useReportManagement';
import {
  FileText, Download, Calendar as CalendarIcon,
  Search, CheckCircle2, Clock, AlertTriangle, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportsPage() {
  const {
    loading, search, setSearch, month, setMonth,
    reports, filteredReports, handleExport, stats,
  } = useReportManagement();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 size={28} className="animate-spin text-emerald-500" />
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Menyusun laporan...</p>
      </div>
    );
  }

  const summaryCards = [
    { label: 'Tepat Waktu',    value: `${stats?.onTimeRate ?? 0}%`, icon: CheckCircle2,  accent: 'text-emerald-600', bg: 'bg-emerald-100', sub: 'Kedisiplinan'       },
    { label: 'Keterlambatan',  value: stats?.lateCount   ?? 0,      icon: Clock,         accent: 'text-amber-600',   bg: 'bg-amber-100',   sub: 'Total kejadian'    },
    { label: 'Mangkir (Alfa)', value: stats?.absentCount ?? 0,      icon: AlertTriangle, accent: 'text-red-500',     bg: 'bg-red-100',     sub: 'Tanpa keterangan'  },
    { label: 'Log Absensi',    value: reports?.length    ?? 0,      icon: FileText,      accent: 'text-sky-600',     bg: 'bg-sky-100',     sub: 'Bulan berjalan'    },
  ];

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="editorial-heading text-[22px] font-black text-slate-800 tracking-tight leading-none">
            Laporan <span className="text-emerald-500">Absensi</span>
          </h1>
          <p className="text-[12px] text-slate-400 mt-1 font-medium">
            Rekap data kehadiran karyawan JNE Martapura
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleExport}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-[12px] font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 14px -4px rgba(16,185,129,0.4)' }}
        >
          <Download size={15} />
          Export Data
        </motion.button>
      </motion.div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + i * 0.07 }}
            className="bg-white rounded-2xl px-4 py-4 border border-slate-100 flex items-center gap-3"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={18} className={s.accent} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <p className={`text-[22px] font-black leading-none tabular-nums mt-0.5 ${s.accent}`}>{s.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-3"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama karyawan atau unit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:bg-white transition-all"
          />
        </div>
        <div className="relative sm:w-44">
          <CalendarIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-700 outline-none focus:border-emerald-400 transition-all"
          />
        </div>
      </motion.div>

      {/* ── TABLE ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Karyawan', 'Unit Kerja', 'Hadir', 'Telat', 'Alfa', 'Aksi'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap ${i >= 2 && i < 5 ? 'text-center' : ''} ${i === 5 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredReports?.map((report, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-[12px] font-bold shrink-0">
                          {report.userName?.charAt(0) ?? '—'}
                        </div>
                        <span className="text-desc font-bold text-slate-800">{report.userName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        {report.department}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-black text-emerald-600">{report.presentDays}</td>
                    <td className="px-5 py-4 text-center font-black text-amber-500">{report.lateDays}</td>
                    <td className="px-5 py-4 text-center font-black text-red-500">{report.absentDays}</td>
                    <td className="px-5 py-4 text-right">
                      <button className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600 flex items-center justify-center transition-all ml-auto">
                        <FileText size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {(!filteredReports || filteredReports.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[12px] font-semibold text-slate-400">
                    Tidak ada data laporan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
