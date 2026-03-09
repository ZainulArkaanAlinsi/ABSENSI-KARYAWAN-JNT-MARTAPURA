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
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import Link from 'next/link';
import { format } from 'date-fns';
import { useEmployeeManagement } from '@/hooks/useEmployeeManagement';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeesPage() {
  const {
    employees,
    jamKerjas,
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
    departmentItems,
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
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="dash-stat-card glass-card glass-highlight stagger-1 bg-white! border-slate-100 shadow-sm"
          >
            <div className="relative z-10 w-full flex items-center justify-between">
              <div>
                <p className="dash-stat-label font-black mb-0.5 text-slate-400">FORCE TOTAL</p>
                <p className="dash-stat-value leading-none tabular-nums text-slate-900">{loading ? '—' : employees.length}</p>
                <p className="dash-stat-sub font-black mt-1.5 opacity-100 uppercase text-[9px] tracking-wider text-slate-500">Personnel Count</p>
              </div>
              <div className="dash-stat-icon border-slate-100 bg-[#005596]/10 text-[#005596]">
                <Users size={20} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="dash-stat-card glass-card glass-highlight stagger-2 bg-white! border-slate-100 shadow-sm"
          >
            <div className="relative z-10 w-full flex items-center justify-between">
              <div>
                <p className="dash-stat-label font-black mb-0.5 text-slate-400">SECURE SCAN</p>
                <p className="dash-stat-value leading-none tabular-nums text-slate-900">{loading ? '—' : employees.filter((e) => e.faceRegistered).length}</p>
                <p className="dash-stat-sub font-black mt-1.5 opacity-100 uppercase text-[9px] tracking-wider text-slate-500">Biometric Verified</p>
              </div>
              <div className="dash-stat-icon border-slate-100 bg-emerald-50 text-emerald-600">
                <ShieldCheck size={20} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="dash-stat-card glass-card glass-highlight stagger-3 bg-white! border-slate-100 shadow-sm"
          >
            <div className="relative z-10 w-full flex items-center justify-between">
              <div>
                <p className="dash-stat-label font-black mb-0.5 text-slate-400">PENDING ENROLL</p>
                <p className="dash-stat-value leading-none tabular-nums text-slate-900">{loading ? '—' : employees.filter((e) => !e.faceRegistered).length}</p>
                <p className="dash-stat-sub font-black mt-1.5 opacity-100 uppercase text-[9px] tracking-wider text-slate-500">Action Required</p>
              </div>
              <div className="dash-stat-icon border-slate-100 bg-[#E31E24]/10 text-[#E31E24]">
                <AlertCircle size={20} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="dash-stat-card glass-card glass-highlight stagger-4 bg-white! border-slate-100 shadow-sm"
          >
            <div className="relative z-10 w-full flex items-center justify-between">
              <div>
                <p className="dash-stat-label font-black mb-0.5 text-slate-400">MATCH YIELD</p>
                <p className="dash-stat-value leading-none tabular-nums text-slate-900">{loading ? '—' : filteredEmployees.length}</p>
                <p className="dash-stat-sub font-black mt-1.5 opacity-100 uppercase text-[9px] tracking-wider text-slate-500">Filtered Result</p>
              </div>
              <div className="dash-stat-icon border-slate-100 bg-slate-50 text-slate-600">
                <Filter size={20} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Filter / Search Bar ── */}
        <motion.div
          className="dash-card p-4 transition-all border-white/5 bg-white/2 mb-6 stagger-1"
        >
          <div className="flex flex-col xl:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#E31E24]/30 focus:bg-white transition-all shadow-sm"
                placeholder="Search by name, biometric ID, or email hash..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <AnimatedButton 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 h-12 px-6 rounded-xl bg-[#E31E24] text-white text-xs font-black uppercase tracking-widest hover:bg-[#c4191f] transition-all shadow-md active:translate-y-0.5"
                animationType="pop"
              >
                <UserPlus size={16} strokeWidth={3} />
                Enlist Personnel
              </AnimatedButton>
              <select
                className="h-12 flex-1 xl:flex-none xl:w-48 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 outline-none focus:border-[#005596]/30 transition-all appearance-none cursor-pointer shadow-sm"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d} value={d} className="bg-white text-slate-900">
                    {d === 'all' ? 'All Units' : d}
                  </option>
                ))}
              </select>

              <select
                className="h-12 flex-1 xl:flex-none xl:w-48 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 outline-none focus:border-[#005596]/30 transition-all appearance-none cursor-pointer shadow-sm"
                value={filterFace}
                onChange={(e) => setFilterFace(e.target.value as any)}
              >
                <option value="all" className="bg-white">Biometric Status</option>
                <option value="registered" className="bg-white">Enrolled</option>
                <option value="unregistered" className="bg-white">Missing Scan</option>
              </select>

              <AnimatedButton
                onClick={() => {
                  setSearch('');
                  setFilterDept('all');
                  setFilterFace('all' as any);
                }}
                className="h-12 w-12 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-slate-400 hover:text-[#E31E24] shadow-sm"
                title="Reset Matrix"
                animationType="tilt"
              >
                <RefreshCw size={16} />
              </AnimatedButton>
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
          <div className="dash-card-header mb-0 bg-slate-50/50 -mx-px -mt-px px-6 py-5 border-b border-slate-100">
            <div>
              <h3 className="dash-card-title uppercase tracking-wider text-xs text-slate-900">Personnel Registry</h3>
              <p className="dash-card-sub text-slate-500 font-medium">Real-time force data across all sectors</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Verified: <span className="text-emerald-600">{employees.filter(e => e.faceRegistered).length}</span></span>
              <span className="w-px h-3 bg-slate-200" />
              <span>Yield: <span className="text-slate-900">{filteredEmployees.length} Units</span></span>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar max-h-[calc(100vh-480px)] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50/30">
                  <th className="px-6 py-5">Personnel Asset</th>
                  <th className="px-6 py-5">Deployment & Subsystem</th>
                  <th className="px-6 py-5">Designation</th>
                  <th className="px-6 py-5">Jadwal Kerja</th>
                  <th className="px-6 py-5">Security Level</th>
                  <th className="px-6 py-5 text-right">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 employee-list-body">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-5"><div className="h-12 w-full dash-skeleton rounded-xl" /></td>
                    </tr>
                  ))
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center">
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
                  filteredEmployees.map((emp, idx) => (
                    <motion.tr
                      key={emp.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.4 }}
                      className="hover:bg-slate-50/50 transition-all group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 flex items-center justify-center rounded-xl font-black text-sm border border-slate-100 bg-slate-50 text-slate-900 group-hover:border-[#005596]/40 group-hover:bg-[#005596]/5 transition-all shadow-sm">
                            {emp.name?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-black text-slate-900 group-hover:text-[#E31E24] transition-all tracking-tight leading-tight mb-1">{emp.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 tracking-wider truncate uppercase max-w-[180px]">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-[12px] font-black text-slate-800 uppercase tracking-tight leading-none mb-1">{emp.department}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {emp.employeeId || '???'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[12px] font-black text-slate-700 uppercase tracking-tight">{emp.position || 'Standard Unit'}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Phase: {(() => {
                            if (!emp.joinDate) return 'Pending';
                            try {
                              const d = new Date(emp.joinDate);
                              return isNaN(d.getTime()) ? 'Pending' : format(d, 'yyyy.MM');
                            } catch { return 'Pending'; }
                          })()}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <p className="text-[12px] font-black text-slate-700 leading-tight">
                            {jamKerjas?.find(jk => jk.id === emp.jamKerjaId)?.name || 'Default Shift'}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            {(() => {
                              const jk = jamKerjas?.find(j => j.id === emp.jamKerjaId);
                              return jk ? `${jk.checkInTime} - ${jk.checkOutTime}` : '08:00 - 17:00';
                            })()}
                          </p>
                        </div>
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-100 bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all hover:bg-slate-50 hover:text-[#E31E24] shadow-sm"
                        >
                          Details
                          <ChevronRight size={12} strokeWidth={3} />
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
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
        jamKerjas={jamKerjas}
        departmentItems={departmentItems}
      />

    </AdminLayout>
  );
}