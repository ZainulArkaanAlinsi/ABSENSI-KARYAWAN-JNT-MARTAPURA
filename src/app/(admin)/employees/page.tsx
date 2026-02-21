'use client';

import { Search, Plus, RefreshCw, User, Briefcase, Calendar, ShieldCheck, Mail, Database, Zap, Binary } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { StatusBadge, FaceBadge, ContractBadge } from '@/components/ui/Badge';
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

  return (
    <AdminLayout title="Agent Intelligence" subtitle="Deep-level registry of personnel mobility and authentication codes.">
      <div className="relative pb-24 px-8 lg:px-12 max-w-[1600px] mx-auto">
        {/* Dynamic Personnel Ambiance */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-jne-red/5 rounded-full blur-[160px] pointer-events-none animate-pulse -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none -z-10 animate-[pulse_10s_infinite]" />

        <div className="relative z-10 space-y-12">
          {/* Tactical Control Array */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col xl:flex-row items-center justify-between gap-8"
          >
            <div className="flex items-center gap-4 w-full xl:w-auto">
              <div className="relative flex-1 xl:w-[450px] group">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-jne-red transition-all duration-300" />
                <input
                  type="text"
                  className="form-input pl-14"
                  placeholder="Identify agent by name or code..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="hidden md:flex btn-primary py-4!"
              >
                <Plus size={18} />
                <span>Initialize Agent</span> 
              </motion.button>
            </div>

            <div className="flex items-center gap-4 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
              <div className="glass-card p-1.5 rounded-2xl flex items-center gap-2">
                 <div className="flex items-center gap-2 px-4 py-2 text-white/30 border-r border-white/5">
                    <Zap size={14} className="text-jne-warning" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Matrix Filters</span>
                 </div>
                 <select
                  className="bg-transparent text-[11px] font-black text-white px-4 focus:outline-none uppercase tracking-widest cursor-pointer"
                  value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}
                >
                  {departments.map(d => (
                    <option key={d} value={d} className="bg-slate-950 font-sans">{d === 'all' ? 'All Sectors' : d}</option>
                  ))}
                </select>

                <select
                  className="bg-transparent text-[11px] font-black text-white px-4 border-l border-white/5 focus:outline-none uppercase tracking-widest cursor-pointer"
                  value={filterFace}
                  onChange={e => setFilterFace(e.target.value as any)}
                >
                  <option value="all" className="bg-slate-950 font-sans">Biometrics: All</option>
                  <option value="registered" className="bg-slate-950 font-sans">Verified Only</option>
                  <option value="unregistered" className="bg-slate-950 font-sans">Pending Auth</option>
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="md:hidden btn-primary p-4 rounded-2xl"
              >
                <Plus size={24} />
              </motion.button>
            </div>
          </motion.div>

          {/* Tactical Summary Matrix */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Total Registry', value: employees.length, icon: Database, color: 'text-white/40', glow: 'bg-white/5' },
              { label: 'Verified Auth', value: employees.filter(e => e.faceRegistered).length, icon: ShieldCheck, color: 'text-jne-success', glow: 'bg-jne-success/5' },
              { label: 'Pending Logic', value: employees.filter(e => !e.faceRegistered).length, icon: Binary, color: 'text-jne-warning', glow: 'bg-jne-warning/5' },
              { label: 'Active Filter', value: filteredEmployees.length, icon: Search, color: 'text-jne-info', glow: 'bg-jne-info/5' },
            ].map((stat, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                key={stat.label}
                className="glass-card p-8 rounded-4xl relative overflow-hidden group"
              >
                <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${stat.glow}`} />
                <div className="relative z-10 flex flex-col gap-6">
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${stat.color} shadow-inner group-hover:rotate-6 transition-transform`}>
                    <stat.icon size={26} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                    <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Intelligent Ledger */}
          <div className="table-container">
            {loading ? (
              <div className="py-48 flex justify-center bg-white/2">
                <PageLoader />
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-48 px-12 text-center bg-white/2">
                <div className="w-24 h-24 rounded-3xl bg-white/5 mb-10 border border-white/10 flex items-center justify-center animate-pulse">
                  <Database size={56} className="text-white opacity-10" />
                </div>
                <h3 className="text-3xl font-black text-white tracking-widest uppercase mb-4">Registry Empty</h3>
                <p className="text-white/30 text-[12px] max-w-sm font-black uppercase tracking-[0.4em] leading-relaxed">The secure identity database reported zero matches for the current protocol sequence.</p>
                {search && (
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearch('')} 
                    className="btn-secondary mt-12! px-12!"
                  >
                    <RefreshCw size={18} /> Protocol Refresh
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-hide">
                <table className="premium-table w-full">
                  <thead>
                    <tr>
                      <th className="pl-12 text-left">Agent Identity</th>
                      <th className="text-left">Sector / Identifier</th>
                      <th className="text-left">Function Profile</th>
                      <th className="text-left">Authentication Status</th>
                      <th className="pr-12 text-right">Operational Ledger</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {filteredEmployees.map((emp, idx) => (
                        <motion.tr 
                          key={emp.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="group hover:bg-white/4 transition-all"
                        >
                          <td className="py-6 pl-12">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center text-white font-black shadow-2xl group-hover:rotate-6 transition-all ring-1 ring-white/5">
                                <span className="text-lg">{emp.name?.charAt(0)?.toUpperCase()}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[15px] font-black text-white group-hover:text-jne-red transition-all uppercase tracking-tighter">{emp.name}</span>
                                <span className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                                  <Mail size={12} className="text-jne-red/40" /> {emp.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-6">
                            <div className="flex flex-col">
                               <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 inline-block w-fit mb-1.5">
                                 <span className="text-[10px] font-black text-white uppercase tracking-widest">{emp.employeeId || '??-UNIT'}</span>
                               </div>
                               <span className="text-[10px] text-jne-info font-black uppercase tracking-[0.2em]">{emp.department}</span>
                            </div>
                          </td>
                          <td className="py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-white/70 uppercase tracking-tighter leading-none mb-1.5">{emp.position || 'Field Agent'}</span>
                              <span className="text-[10px] text-white/20 flex items-center gap-2 font-black uppercase tracking-widest">
                                <Calendar size={12} /> {emp.joinDate ? format(new Date(emp.joinDate), 'MMM yyyy') : '--'}
                              </span>
                            </div>
                          </td>
                          <td className="py-6">
                            <div className="flex items-center gap-4">
                              <FaceBadge registered={emp.faceRegistered} />
                              <ContractBadge type={emp.contractType} />
                            </div>
                          </td>
                          <td className="py-6 pr-12 text-right">
                            <Link
                              href={`/employees/${emp.id}`}
                              className="btn-secondary px-6! py-2.5! text-[10px]! rounded-xl! opacity-40 group-hover:opacity-100 hover:bg-jne-red! hover:text-white! hover:border-jne-red! transition-all"
                            >
                              Command Profile
                            </Link>
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

      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        shifts={shifts}
      />
    </AdminLayout>
  );
}

