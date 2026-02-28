'use client';

import {
  Search,
  Plus,
  RefreshCw,
  Users,
  ShieldCheck,
  AlertCircle,
  Filter,
  ChevronRight,
  Sparkles,
  Fingerprint,
  Cpu,
  Database,
  UserPlus,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { FaceBadge, ContractBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import AddEmployeeModal from '@/components/employees/AddEmployeeModal';
import Link from 'next/link';
import { format } from 'date-fns';
import { useEmployeeManagement } from '@/hooks/useEmployeeManagement';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeesPage() {
  const {
    employees,
    shifts,
    loading,
    search,
    setSearch,
    filterDept,
    setFilterDept,
    filterFace,
    setFilterFace,
    showAddModal,
    setShowAddModal,
    departments,
    filteredEmployees,
  } = useEmployeeManagement();

  const stats = [
    {
      label: 'Force Total',
      value: employees.length,
      icon: Users,
      color: 'var(--att-present)',
      sub: 'Personnel Count',
    },
    {
      label: 'Secure Scan',
      value: employees.filter((e) => e.faceRegistered).length,
      icon: ShieldCheck,
      color: 'var(--jne-success)',
      sub: 'Biometric Verified',
    },
    {
      label: 'Pending Enrollment',
      value: employees.filter((e) => !e.faceRegistered).length,
      icon: AlertCircle,
      color: 'var(--att-absent)',
      sub: 'Action Required',
    },
    {
      label: 'Match Yield',
      value: filteredEmployees.length,
      icon: Filter,
      color: 'var(--primary)',
      sub: 'Filtered Result',
    },
  ];

  return (
    <AdminLayout title="Daftar Personel Karyawan" subtitle="Registrasi Biometrik & Kesiapan Unit">
      <div className="dash-root">


        {/* ── Stats Row ── */}
        <div className="dash-stats-grid mb-8">
          <div className="dash-stat-card stat-violet">
            <div className="relative z-10 w-full flex items-center justify-between">
              <div>
                <p className="dash-stat-label opacity-70 mb-0.5">FORCE TOTAL</p>
                <p className="dash-stat-value leading-none tabular-nums text-white">{loading ? '—' : employees.length}</p>
                <p className="dash-stat-sub font-bold mt-1.5 opacity-60 uppercase text-[9px] tracking-wider">Personnel Count</p>
              </div>
              <div className="dash-stat-icon border-white/5">
                <Users size={20} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="dash-stat-card stat-cyan">
            <div className="relative z-10 w-full flex items-center justify-between">
              <div>
                <p className="dash-stat-label opacity-70 mb-0.5">SECURE SCAN</p>
                <p className="dash-stat-value leading-none tabular-nums text-white">{loading ? '—' : employees.filter((e) => e.faceRegistered).length}</p>
                <p className="dash-stat-sub font-bold mt-1.5 opacity-60 uppercase text-[9px] tracking-wider">Biometric Verified</p>
              </div>
              <div className="dash-stat-icon border-white/5">
                <ShieldCheck size={20} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="dash-stat-card stat-coral">
            <div className="relative z-10 w-full flex items-center justify-between">
              <div>
                <p className="dash-stat-label opacity-70 mb-0.5">PENDING ENROLL</p>
                <p className="dash-stat-value leading-none tabular-nums text-white">{loading ? '—' : employees.filter((e) => !e.faceRegistered).length}</p>
                <p className="dash-stat-sub font-bold mt-1.5 opacity-60 uppercase text-[9px] tracking-wider">Action Required</p>
              </div>
              <div className="dash-stat-icon border-white/5">
                <AlertCircle size={20} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="dash-stat-card stat-slate">
            <div className="relative z-10 w-full flex items-center justify-between">
              <div>
                <p className="dash-stat-label opacity-70 mb-0.5">MATCH YIELD</p>
                <p className="dash-stat-value leading-none tabular-nums text-white">{loading ? '—' : filteredEmployees.length}</p>
                <p className="dash-stat-sub font-bold mt-1.5 opacity-60 uppercase text-[9px] tracking-wider">Filtered Result</p>
              </div>
              <div className="dash-stat-icon border-white/5">
                <Filter size={20} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter / Search Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="dash-card p-4 transition-all border-white/5 bg-white/2 mb-6"
        >
          <div className="flex flex-col xl:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                className="w-full h-12 rounded-xl border border-white/5 bg-white/3 pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-primary/30 focus:bg-white/5 transition-all"
                placeholder="Search by name, biometric ID, or email hash..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <button 
                onClick={() => setShowAddModal(true)}
                className="dash-btn-primary flex items-center gap-2 h-12 px-5 min-w-[150px]"
              >
                <UserPlus size={16} strokeWidth={3} />
                Enlist Personnel
              </button>
              <select
                className="h-12 flex-1 xl:flex-none xl:w-48 rounded-xl border border-white/5 bg-white/3 px-4 text-[12px] font-bold text-white outline-none focus:border-[#7C3AED]/30 transition-all appearance-none cursor-pointer"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d} value={d} className="bg-[#0F172A] text-white">
                    {d === 'all' ? 'All Units' : d}
                  </option>
                ))}
              </select>

              <select
                className="h-12 flex-1 xl:flex-none xl:w-48 rounded-xl border border-white/5 bg-white/3 px-4 text-[12px] font-bold text-white outline-none focus:border-[#7C3AED]/30 transition-all appearance-none cursor-pointer"
                value={filterFace}
                onChange={(e) => setFilterFace(e.target.value as any)}
              >
                <option value="all" className="bg-[#0F172A]">Biometric Status</option>
                <option value="registered" className="bg-[#0F172A]">Enrolled</option>
                <option value="unregistered" className="bg-[#0F172A]">Missing Scan</option>
              </select>

              <button
                onClick={() => {
                  setSearch('');
                  setFilterDept('all');
                  setFilterFace('all' as any);
                }}
                className="h-12 w-12 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                title="Reset Matrix"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Main List ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dash-card overflow-hidden"
        >
          <div className="dash-card-header mb-0 bg-white/1 -mx-px -mt-px px-6 py-5 border-b border-white/5">
            <div>
              <h3 className="dash-card-title uppercase tracking-wider text-xs">Personnel Registry</h3>
              <p className="dash-card-sub">Real-time force data across all sectors</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>Verified: <span className="text-[#10B981]">{employees.filter(e => e.faceRegistered).length}</span></span>
              <span className="w-px h-3 bg-white/10" />
              <span>Yield: <span className="text-white">{filteredEmployees.length} Units</span></span>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar pb-4 -mb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                  <th className="px-6 py-5">Personnel Asset</th>
                  <th className="px-6 py-5">Deployment & Subsystem</th>
                  <th className="px-6 py-5">Designation</th>
                  <th className="px-6 py-5">Security Level</th>
                  <th className="px-6 py-5 text-right">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/2">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-5"><div className="h-12 w-full dash-skeleton rounded-xl" /></td>
                    </tr>
                  ))
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-5">
                        <div className="p-5 rounded-2xl bg-white/2 border border-white/5">
                          <Fingerprint size={32} className="text-slate-800" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-widest">No matching personnel recorded</p>
                          <p className="text-[11px] text-slate-600 font-bold mt-2 uppercase tracking-wide">Adjust matrix parameters or enlist new assets</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredEmployees.map((emp, idx) => (
                      <motion.tr
                        key={emp.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-white/1.5 transition-all group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 flex items-center justify-center rounded-2xl font-black text-sm border border-white/10 bg-white/3 text-white group-hover:border-[#7C3AED]/40 group-hover:bg-[#7C3AED]/5 transition-all shadow-sm">
                              {emp.name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[14px] font-black text-white group-hover:text-primary transition-all tracking-tight leading-tight mb-1">{emp.name}</p>
                              <p className="text-[10px] font-bold text-slate-600 tracking-wider truncate uppercase max-w-[180px]">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div>
                            <p className="text-[12px] font-black text-white/90 uppercase tracking-tight leading-none mb-1">{emp.department}</p>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ID: {emp.employeeId || '???'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-[12px] font-black text-white/70 uppercase tracking-tight">{emp.position || 'Standard Unit'}</p>
                          <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mt-1">
                            Phase: {emp.joinDate ? format(new Date(emp.joinDate), 'yyyy.MM') : 'Pending'}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <FaceBadge registered={emp.faceRegistered} />
                            <ContractBadge type={emp.contractType} />
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/employees/${emp.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/5 bg-white/2 text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all hover:bg-white/5 hover:text-white"
                          >
                            Details
                            <ChevronRight size={12} strokeWidth={3} />
                          </Link>
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
                  SYNC READY
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu size={10} />
                  LATENCY: 12ms
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                SYSTEM AGENT v4.2.0
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        shifts={shifts}
      />
    </AdminLayout>
  );
}