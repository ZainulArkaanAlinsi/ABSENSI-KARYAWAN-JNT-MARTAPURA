'use client';

import { Download, BarChart3, Calendar, Filter, User, Briefcase, Activity, ShieldCheck, Zap } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import type { AttendanceStatus } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useReportManagement, STATUS_OPTIONS, minsToHours } from '@/hooks/useReportManagement';
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

  return (
    <AdminLayout title="Intelligence Core" subtitle="Deep-level analysis of personnel mobility and operational attendance.">
      <div className="relative pb-24 px-8 lg:px-12 max-w-[1600px] mx-auto">
        {/* Dynamic Analytics Field Blobs */}
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-jne-red/5 rounded-full blur-[160px] pointer-events-none animate-pulse -z-10" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none animate-[pulse_12s_infinite_2s] -z-10" />

        <div className="relative z-10 space-y-12">
        {/* Intelligence Filters Panel */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 rounded-4xl relative overflow-hidden"
        >
          {/* Panel Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-jne-red/40 via-purple-500/40 to-jne-red/40" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-jne-red/10 flex items-center justify-center text-jne-red border border-jne-red/20 shadow-xl">
                <Filter size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase">Intelligence Synthesis</h3>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-1.5">Sequence Parameters</p>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportCSV} 
              className="btn-primary py-5! px-12! rounded-2xl! group shadow-2xl shadow-jne-red/20"
            >
              <Download size={18} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
              <span>Extract Protocol</span>
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Commencement</label>
              <div className="relative group">
                <Calendar size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-jne-red group-focus-within:scale-110 transition-transform" />
                <input type="date" className="form-input pl-14" value={startDate}
                  onChange={e => setStartDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Termination</label>
              <div className="relative group">
                <Calendar size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-jne-red group-focus-within:scale-110 transition-transform" />
                <input type="date" className="form-input pl-14" value={endDate}
                  onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Personnel Matrix</label>
              <div className="relative group">
                <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-jne-red group-focus-within:scale-110 transition-transform" />
                <select className="form-input pl-14 appearance-none cursor-pointer" value={filterEmployee}
                  onChange={e => setFilterEmployee(e.target.value)}>
                  <option value="all" className="bg-[#0f172a]">All Identity Nodes</option>
                  {employees.map(e => <option key={e.id} value={e.id} className="bg-[#0f172a]">{e.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Sector Assignment</label>
              <div className="relative group">
                <Briefcase size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-jne-red group-focus-within:scale-110 transition-transform" />
                <select className="form-input pl-14 appearance-none cursor-pointer" value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}>
                  {departments.map(d => <option key={d} value={d} className="bg-[#0f172a]">{d === 'all' ? 'Universal Sectors' : d}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Protocol Status</label>
              <div className="relative group">
                <Activity size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-jne-red group-focus-within:scale-110 transition-transform" />
                <select className="form-input pl-14 appearance-none cursor-pointer" value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as AttendanceStatus | 'all')}>
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value} className="bg-[#0f172a] font-sans">{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Matrix Performance Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {[
            { label: 'Deployed', value: summary.present, color: 'text-jne-success', icon: ShieldCheck, glow: 'bg-jne-success/5' },
            { label: 'Delayed', value: summary.late, color: 'text-jne-warning', icon: Activity, glow: 'bg-jne-warning/5' },
            { label: 'Signal Lost', value: summary.absent, color: 'text-jne-danger', icon: User, glow: 'bg-jne-danger/5' },
            { label: 'Authorized', value: summary.leave, color: 'text-jne-info', icon: Calendar, glow: 'bg-jne-info/5' },
            { label: 'Overdriven', value: summary.overtime, color: 'text-jne-overtime', icon: Zap, glow: 'bg-jne-overtime/5' },
          ].map((s, idx) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="glass-card p-8 rounded-4xl relative overflow-hidden group"
            >
              <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${s.glow}`} />
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${s.color} mb-6 shadow-inner group-hover:rotate-12 transition-transform`}>
                   <s.icon size={24} />
                </div>
                <p className={`text-4xl font-black tracking-tighter ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-3 text-white/30">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Intelligence Ledger */}
        <div className="table-container">
          <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-white/3">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Intelligence Ledger</h3>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-2">
                <span className="text-jne-red">{filtered.length}</span> Active Record Identified
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 border border-white/5 shadow-inner">
              <BarChart3 size={28} />
            </div>
          </div>
          
          <div className="p-2">
            {loading ? (
              <div className="py-24 flex justify-center"><PageLoader /></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-48 px-12 text-center">
                <div className="w-24 h-24 rounded-3xl bg-white/5 mb-10 border border-white/10 flex items-center justify-center animate-pulse">
                  <Activity size={56} className="text-white opacity-10" />
                </div>
                <h3 className="text-3xl font-black text-white tracking-widest uppercase mb-4">No Matrix Data</h3>
                <p className="text-white/30 text-[12px] max-w-sm font-black uppercase tracking-[0.4em] leading-relaxed">Adjust sequence filters to retrieve deep-level mobility data.</p>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-hide">
                <table className="premium-table w-full">
                  <thead>
                    <tr>
                      <th className="pl-10 text-left">Temporal Log</th>
                      <th className="text-left">Personnel</th>
                      <th className="text-left">Sector</th>
                      <th className="text-center">Protocol Status</th>
                      <th className="text-center">Pulse Grid</th>
                      <th className="text-center">Net Duration</th>
                      <th className="text-center">Deviation</th>
                      <th className="pr-10 text-right">Bio-Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {filtered.map((record, idx) => (
                        <motion.tr 
                          key={record.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.01, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="group hover:bg-white/4 transition-all"
                        >
                          <td className="py-6 pl-10 border-b border-white/5 group-last:border-none">
                            <div className="flex flex-col">
                              <span className="text-[13px] font-black text-white uppercase tracking-tighter">
                                {record.date ? format(new Date(record.date), 'dd MMM yyyy') : '-'}
                              </span>
                              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-1">Sync Protocol</span>
                            </div>
                          </td>
                          <td className="py-6 border-b border-white/5 group-last:border-none">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-[10px] font-black text-white border border-white/5 shadow-inner group-hover:rotate-6 transition-transform ring-1 ring-white/5">
                                {record.employeeName?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-black text-white tracking-tight uppercase group-hover:text-jne-red transition-all">{record.employeeName}</p>
                                <p className="text-[9px] font-black text-white/20 tracking-[0.3em] uppercase mt-1">{record.employeeId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 border-b border-white/5 group-last:border-none">
                             <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 inline-block">
                               <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{record.department}</span>
                             </div>
                          </td>
                          <td className="py-6 border-b border-white/5 group-last:border-none text-center">
                            <StatusBadge status={record.status} size="sm" />
                          </td>
                          <td className="py-6 border-b border-white/5 group-last:border-none">
                            <div className="flex items-center justify-center gap-4">
                              <div className="flex flex-col items-end">
                                <span className="text-[11px] font-black text-jne-success tabular-nums">{record.checkIn?.time || '--:--'}</span>
                                <span className="text-[8px] font-black text-white/10 uppercase tracking-widest mt-0.5">IN</span>
                              </div>
                              <div className="w-px h-8 bg-white/5" />
                              <div className="flex flex-col items-start">
                                <span className="text-[11px] font-black text-jne-danger tabular-nums">{record.checkOut?.time || '--:--'}</span>
                                <span className="text-[8px] font-black text-white/10 uppercase tracking-widest mt-0.5">OUT</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 border-b border-white/5 group-last:border-none text-center">
                            <div className="flex flex-col">
                              <span className="text-[13px] font-black text-white tabular-nums tracking-tighter">{minsToHours(record.totalWorkMinutes)}</span>
                              <span className="text-[8px] font-black text-white/10 uppercase tracking-widest mt-0.5">Net Time</span>
                            </div>
                          </td>
                          <td className="py-6 border-b border-white/5 group-last:border-none">
                            <div className="flex flex-col gap-2 items-center">
                              {(record.lateMinutes || 0) > 0 && (
                                <motion.span 
                                  initial={{ scale: 0.9 }}
                                  animate={{ scale: 1 }}
                                  className="text-[9px] font-black text-jne-warning bg-jne-warning/10 px-3 py-1 rounded-lg border border-jne-warning/20 shadow-lg shadow-jne-warning/5 uppercase tracking-widest"
                                >
                                  LATE +{record.lateMinutes}M
                                </motion.span>
                              )}
                              {(record.overtimeMinutes || 0) > 0 && (
                                <motion.span 
                                  initial={{ scale: 0.9 }}
                                  animate={{ scale: 1 }}
                                  className="text-[9px] font-black text-jne-overtime bg-jne-overtime/10 px-3 py-1 rounded-lg border border-jne-overtime/20 shadow-lg shadow-jne-overtime/5 uppercase tracking-widest"
                                >
                                  OT +{record.overtimeMinutes}M
                                </motion.span>
                              )}
                              {!record.lateMinutes && !record.overtimeMinutes && <span className="text-white/5 text-[10px] font-black">—</span>}
                            </div>
                          </td>
                          <td className="py-6 pr-10 border-b border-white/5 group-last:border-none text-right">
                            {record.checkIn?.faceScore ? (
                              <div className="inline-flex flex-col items-end gap-1.5">
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                                  <span
                                    className="text-[12px] font-black tabular-nums tracking-tighter"
                                    style={{ color: record.checkIn.faceScore >= 80 ? 'var(--jne-success)' : 'var(--jne-danger)' }}
                                  >
                                    {record.checkIn.faceScore.toFixed(0)}%
                                  </span>
                                </div>
                                <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Bio Secure</span>
                              </div>
                            ) : <span className="text-white/5 text-[9px] font-black tracking-[0.3em] uppercase">Unsecured</span>}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}

