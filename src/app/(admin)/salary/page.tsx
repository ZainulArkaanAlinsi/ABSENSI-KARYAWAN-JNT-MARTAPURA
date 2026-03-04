'use client';

import { 
  Banknote, 
  Search, 
  Download, 
  ChevronRight, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Activity
} from 'lucide-react';

import AdminLayout from '@/components/layout/AdminLayout';
import { useSalaryManagement } from '@/hooks/useSalaryManagement';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function SalaryPage() {
  const { 
    salaryRecords, 
    summary, 
    loading, 
    month, 
    setMonth, 
    year, 
    setYear, 
    search, 
    setSearch,
    publishSalaries,
    exportSalaryReport,
    refreshManual
  } = useSalaryManagement();

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <AdminLayout 
      title="Manajemen Gaji" 
      subtitle={`Periode ${months[month - 1]} ${year}`}
    >
      {loading ? (
        <div className="flex justify-center py-24">
          <PageLoader />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/5 bg-white/3 p-5 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Banknote size={16} />
                </div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Payroll Cap</span>
              </div>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1">Total Pengeluaran</p>
              <p className="text-2xl font-black text-white">{formatIDR(summary.totalPayroll)}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-white/5 bg-white/3 p-5 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <TrendingUp size={16} />
                </div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Yield Bonus</span>
              </div>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1">Total Lembur</p>
              <p className="text-2xl font-black text-emerald-500">{formatIDR(summary.totalOvertime)}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-white/5 bg-white/3 p-5 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#E04B3A]/10 flex items-center justify-center text-[#E04B3A]">
                  <TrendingDown size={16} />
                </div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Penalty Leak</span>
              </div>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1">Total Potongan</p>
              <p className="text-2xl font-black text-[#E04B3A]">{formatIDR(summary.totalDeductions)}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl border border-white/5 bg-white/3 p-5 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Users size={16} />
                </div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Asset Count</span>
              </div>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1">Penerima Gaji</p>
              <p className="text-2xl font-black text-white">{summary.employeeCount} <span className="text-sm font-medium text-white/30">Orang</span></p>
            </motion.div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Cari Nama atau ID Karyawan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 bg-white/3 border border-white/5 rounded-2xl px-12 text-sm text-white focus:outline-none focus:border-primary/30 transition-all font-medium"
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            </div>

            <div className="flex gap-2">
              <select 
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="h-12 bg-white/3 border border-white/5 rounded-2xl px-4 text-sm text-white focus:outline-none focus:border-primary/30 font-bold uppercase tracking-wider"
              >
                {months.map((m, i) => (
                  <option key={m} value={i + 1} className="bg-[#0D1B35]">{m}</option>
                ))}
              </select>

              <select 
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="h-12 bg-white/3 border border-white/5 rounded-2xl px-4 text-sm text-white focus:outline-none focus:border-primary/30 font-bold uppercase tracking-wider"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y} className="bg-[#0D1B35]">{y}</option>
                ))}
              </select>

              <button 
                onClick={refreshManual}
                className="h-12 w-12 bg-white/3 border border-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all"
                title="Refresh Matrix"
              >
                <Activity size={18} />
              </button>

              <button 
                onClick={publishSalaries}
                className="h-12 px-6 bg-[#E04B3A] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
              >
                <CheckCircle2 size={16} /> Publish All
              </button>
            </div>
          </div>

          {/* Main Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/5 bg-white/3 overflow-hidden backdrop-blur-sm shadow-2xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/5">
                    <th className="px-6 py-5">Personnel Info</th>
                    <th className="px-6 py-5">Base Salary</th>
                    <th className="px-6 py-5">Allowances</th>
                    <th className="px-6 py-5">Deductions</th>
                    <th className="px-6 py-5">Net Remuneration</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {salaryRecords.map((record, idx) => (
                      <motion.tr 
                        key={record.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-white/1 transition-all group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary/20 to-transparent border border-white/10 flex items-center justify-center font-black text-white group-hover:border-primary/40 transition-all">
                              {record.employeeName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-white leading-none mb-1 group-hover:text-primary transition-colors">{record.employeeName}</p>
                              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{record.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-bold text-white/80">{formatIDR(record.baseSalary)}</p>
                        </td>
                        <td className="px-6 py-5 text-[10px] font-bold">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-white/40">OT:</span>
                              <span className="text-emerald-500">{formatIDR(record.overtimePay)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              <span className="text-white/40">Meal/T:</span>
                              <span className="text-blue-500">{formatIDR(record.allowance)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-[10px] font-bold">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E04B3A]" />
                              <span className="text-white/40">Late:</span>
                              <span className="text-[#E04B3A]">{formatIDR(record.deductions.late)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span className="text-white/40">Absent:</span>
                              <span className="text-amber-500">{formatIDR(record.deductions.absent)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-black text-primary bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-xl inline-block">
                            {formatIDR(record.netSalary)}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="w-9 h-9 rounded-xl border border-white/5 bg-white/3 flex items-center justify-center text-white/40 hover:bg-white/5 hover:text-white transition-all">
                              <Printer size={16} />
                            </button>
                            <button className="w-9 h-9 rounded-xl border border-white/5 bg-white/3 flex items-center justify-center text-white/40 hover:bg-white/5 hover:text-white transition-all">
                              <Download size={16} />
                            </button>
                            <button className="h-9 px-4 rounded-xl border border-white/5 bg-[#1B2A4A] flex items-center justify-center text-[10px] font-black text-white uppercase tracking-widest hover:brightness-125 transition-all">
                              View Slip
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-white/5 bg-white/1 flex items-center justify-between">
              <div className="flex gap-4">
                <button 
                  onClick={exportSalaryReport}
                  className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] hover:text-primary transition-colors"
                >
                  <FileSpreadsheet size={16} /> Combined Excel
                </button>
                <div className="w-px h-4 bg-white/5" />
                <button className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] hover:text-primary transition-colors">
                  <Printer size={16} /> Batch Print
                </button>
              </div>
              <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">Payload Matrix v2.0</p>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
