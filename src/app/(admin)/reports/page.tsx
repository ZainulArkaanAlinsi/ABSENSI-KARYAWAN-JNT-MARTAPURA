'use client';

import {
  Download,
  BarChart3,
  Calendar,
  Filter,
  User,
  Briefcase,
  Activity,
  ShieldCheck,
  Zap,
  ChevronRight,
  Database,
  Cpu,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import type { AttendanceStatus } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import {
  useReportManagement,
  STATUS_OPTIONS,
  minsToHours,
} from '@/hooks/useReportManagement';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportsPage() {
  const {
    attendance,
    employees,
    loading,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filterEmployee,
    setFilterEmployee,
    filterStatus,
    setFilterStatus,
    filterDept,
    setFilterDept,
    departments,
    filtered,
    summary,
    exportCSV,
  } = useReportManagement();

  const summaryCards = [
    {
      key: 'present',
      label: 'Optimal',
      value: summary.present,
      color: '#10B981',
      icon: ShieldCheck,
    },
    {
      key: 'late',
      label: 'Deviation',
      value: summary.late,
      color: '#E04B3A',
      icon: Activity,
    },
    {
      key: 'absent',
      label: 'Offline',
      value: summary.absent,
      color: '#F59E0B',
      icon: User,
    },
    {
      key: 'leave',
      label: 'Authorized',
      value: summary.leave,
      color: '#3B82F6',
      icon: Calendar,
    },
    {
      key: 'overtime',
      label: 'Overflow',
      value: summary.overtime,
      color: '#8B5CF6',
      icon: Zap,
    },
  ];

  const periodLabel =
    startDate && endDate
      ? `${format(new Date(startDate), 'yyyy.MM.dd')} — ${format(
          new Date(endDate),
          'yyyy.MM.dd',
        )}`
      : 'Infinite Period';

  return (
    <AdminLayout title="Intelligence" subtitle="Reports Hub">
      <div className="dash-root">
        {/* ── Header Row ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="dash-header-row mb-6 items-end"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED] shadow-[0_0_8px_#7C3AED]" />
              <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-[0.3em]">Data Aggregator</span>
            </div>
            <h2 className="dash-page-title leading-none">Intelligence Hub</h2>
            <p className="dash-page-sub mt-2 text-slate-500">Multidimensional attendance analytics & audit logs</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={exportCSV}
              className="dash-btn-secondary flex items-center gap-2"
            >
              <Download size={16} />
              Export Records
            </button>
          </div>
        </motion.div>

        {/* ── Filter Engine ── */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="dash-card p-6 border-white/5 bg-white/2 mb-8"
        >
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1.5">
                <Calendar size={10} /> Beginning
              </label>
              <input
                type="date"
                className="w-full h-11 rounded-xl border border-white/5 bg-white/3 px-4 text-[12px] font-black text-white outline-none focus:border-[#7C3AED]/30 transition-all cursor-pointer"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1.5">
                <Calendar size={10} /> Termination
              </label>
              <input
                type="date"
                className="w-full h-11 rounded-xl border border-white/5 bg-white/3 px-4 text-[12px] font-black text-white outline-none focus:border-[#7C3AED]/30 transition-all cursor-pointer"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1.5">
                <User size={10} /> Personnel
              </label>
              <select
                className="w-full h-11 rounded-xl border border-white/5 bg-white/3 px-4 text-[12px] font-black text-white outline-none focus:border-[#7C3AED]/30 transition-all cursor-pointer"
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
              >
                <option value="all" className="bg-[#0F172A]">Cross-Personnel</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id} className="bg-[#0F172A]">
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1.5">
                <Briefcase size={10} /> Unit
              </label>
              <select
                className="w-full h-11 rounded-xl border border-white/5 bg-white/3 px-4 text-[12px] font-black text-white outline-none focus:border-[#7C3AED]/30 transition-all cursor-pointer"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d} value={d} className="bg-[#0F172A]">
                    {d === 'all' ? 'Cross-Unit' : d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1.5">
                <Activity size={10} /> Status
              </label>
              <select
                className="w-full h-11 rounded-xl border border-white/5 bg-white/3 px-4 text-[12px] font-black text-white outline-none focus:border-[#7C3AED]/30 transition-all cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as AttendanceStatus | 'all')}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#0F172A]">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* ── Metrics Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
           {summaryCards.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="dash-card p-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <s.icon size={14} className="text-slate-500" />
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Aggregate</span>
              </div>
              <p className="text-2xl font-black text-white tabular-nums mb-0.5">{loading ? '—' : s.value}</p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{s.label}</p>
              <div className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${s.color} 0%, transparent 100%)`, opacity: 0.4 }} />
            </motion.div>
           ))}
        </div>

        {/* ── Result Matrix ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dash-card overflow-hidden"
        >
          <div className="dash-card-header mb-0 bg-white/1 -mx-px -mt-px px-6 py-5 border-b border-white/5">
            <div>
              <h3 className="dash-card-title uppercase tracking-wider text-xs">Transactional Matrix</h3>
              <p className="dash-card-sub">{periodLabel}</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-slate-400">
                <BarChart3 size={14} className="text-[#7C3AED]" />
                <span className="text-white">{filtered.length}</span> SIGNALS DETECTED
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                  <th className="px-6 py-5">Temporal Index</th>
                  <th className="px-6 py-5">Personnel asset</th>
                  <th className="px-6 py-5 text-center">Resolution</th>
                  <th className="px-6 py-5 text-center">Entry/Exit</th>
                  <th className="px-6 py-5 text-center">Yield</th>
                  <th className="px-6 py-5 text-center">Deltas</th>
                  <th className="px-6 py-5 text-right">Biometric</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/2">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-5"><div className="h-10 w-full dash-skeleton rounded-xl" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-5">
                        <div className="p-5 rounded-2xl bg-white/2 border border-white/5">
                          <Database size={32} className="text-slate-800" />
                        </div>
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">Matrix produced zero matching signals</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filtered.map((record, idx) => (
                      <motion.tr
                        key={record.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.015 }}
                        className="hover:bg-white/1.5 transition-all group"
                      >
                        <td className="px-6 py-5">
                           <p className="text-[12px] font-black text-white/90 font-mono tracking-tight leading-none mb-1">
                             {record.date ? format(new Date(record.date), 'yyyy.MM.dd') : '????.??.??'}
                           </p>
                           <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Temporal Log</p>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-3">
                              <div className="h-9 w-9 flex items-center justify-center rounded-xl font-black text-xs border border-white/10 bg-white/3 text-white">
                                {record.employeeName?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-[13px] font-black text-white group-hover:text-[#7C3AED] transition-all tracking-tight leading-none mb-1">{record.employeeName}</p>
                                <p className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">{record.employeeId}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-center align-middle">
                          <StatusBadge status={record.status} />
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center justify-center gap-4">
                              <div className="text-center">
                                <p className="text-[11px] font-black font-mono text-emerald-500 tabular-nums leading-none mb-1">{record.checkIn?.time || '--:--'}</p>
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Entry</p>
                              </div>
                              <span className="w-px h-6 bg-white/5" />
                              <div className="text-center">
                                <p className="text-[11px] font-black font-mono text-jne-red tabular-nums leading-none mb-1">{record.checkOut?.time || '--:--'}</p>
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Exit</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <p className="text-[13px] font-black text-white/80 font-mono tabular-nums leading-none">
                             {minsToHours(record.totalWorkMinutes)}
                           </p>
                           <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1.5">Hours</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <div className="flex flex-col items-center gap-1.5">
                              {(record.lateMinutes || 0) > 0 && (
                                <span className="px-2 py-0.5 rounded-md border border-[#E04B3A]/20 bg-[#E04B3A]/10 text-[9px] font-black text-[#E04B3A] uppercase tracking-wider">
                                  Tardy +{record.lateMinutes}m
                                </span>
                              )}
                              {(record.overtimeMinutes || 0) > 0 && (
                                <span className="px-2 py-0.5 rounded-md border border-[#7C3AED]/20 bg-[#7C3AED]/10 text-[9px] font-black text-[#7C3AED] uppercase tracking-wider">
                                  Overflow +{record.overtimeMinutes}m
                                </span>
                              )}
                              {!record.lateMinutes && !record.overtimeMinutes && (
                                <span className="text-slate-800 text-[10px]">—</span>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                           {record.checkIn?.faceScore ? (
                             <div className="flex flex-col items-end">
                               <p className="text-[13px] font-black font-mono tabular-nums leading-none mb-1" style={{ color: record.checkIn.faceScore >= 80 ? '#10B981' : '#E04B3A' }}>
                                 {record.checkIn.faceScore.toFixed(0)}%
                               </p>
                               <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Certainty</p>
                             </div>
                           ) : <span className="text-slate-800 text-[10px]">—</span>}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-white/5 bg-white/1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-1.5">
                  <Database size={10} />
                  INDEX READY
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu size={10} />
                  CYCLES: 1.2M
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                ANALYTICS ENGINE v1.4
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
