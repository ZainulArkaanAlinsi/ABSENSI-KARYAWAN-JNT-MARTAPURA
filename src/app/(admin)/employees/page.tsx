'use client';

import { FaceBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import AddEmployeeModal from '@/components/employees/AddEmployeeModal';
import { useEmployeeManagement } from '@/hooks/useEmployeeManagement';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { InteractiveButton, GlassCard } from '@/components/ui/Interactive';
import { Pagination } from '@/components/ui/Pagination';
import { Trash2, ChevronRight, UserPlus, Search, Users, ShieldCheck, AlertCircle, Filter } from 'lucide-react';

export default function EmployeesPage() {
  const {
    employees,
    loading,
    search,
    setSearch,
    filterDept,
    setFilterDept,
    filterFace,
    setFilterFace,
    showAddModal,
    setShowAddModal,
    departmentItems,
    jamKerjas,
    filteredEmployees,
    deleteEmployeeOptimistic,
  } = useEmployeeManagement();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredEmployees]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter italic uppercase">
            Personnel <span className="text-cyan-600">Archive</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 ml-1">Manajemen Sumber Daya Manusia JNE Martapura</p>
        </div>
        <div className="flex items-center gap-3">
          <InteractiveButton 
            onClick={() => setShowAddModal(true)}
            className="h-14 px-10 bg-slate-950 dark:bg-cyan-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-2xl hover:bg-cyan-600 dark:hover:bg-cyan-500"
          >
             <UserPlus size={18} />
             Add Operative
          </InteractiveButton>
        </div>
      </div>

      {/* ── METRICS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Personnel', val: employees.length, icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-600/5' },
          { label: 'Face Verified', val: employees.filter(e => e.faceRegistered).length, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Action Required', val: employees.filter(e => !e.faceRegistered).length, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/5' },
          { label: 'Filtered Result', val: filteredEmployees.length, icon: Filter, color: 'text-slate-950 dark:text-white', bg: 'bg-slate-950 text-white!' },
        ].map((m, i) => (
          <GlassCard key={i} className={`p-6 flex items-center justify-between group border-none ${m.bg}`}>
            <div className="space-y-1">
              <p className={`${m.color} opacity-60 text-[9px] font-black uppercase tracking-widest leading-none`}>{m.label}</p>
              <h3 className={`text-2xl font-black ${m.color} tracking-tighter italic`}>{loading ? '...' : m.val}</h3>
            </div>
            <div className={`w-12 h-12 bg-white/20 dark:bg-black/20 rounded-2xl flex items-center justify-center ${m.color} shadow-sm group-hover:scale-110 transition-transform`}>
              <m.icon size={22} />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* ── FILTER & SEARCH ── */}
      <GlassCard className="p-4 flex flex-col lg:flex-row items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search by name, ID, or unit..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 bg-white dark:bg-slate-950 border border-(--border-color) rounded-2xl py-2.5 pl-12 pr-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-cyan-600/5 focus:border-cyan-600/30 transition-all"
          />
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <select 
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="h-14 flex-1 lg:w-48 bg-white dark:bg-slate-950 border border-(--border-color) rounded-2xl px-5 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:border-cyan-600/30 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Units</option>
            {departmentItems.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
          <select 
            value={filterFace}
            onChange={(e) => setFilterFace(e.target.value as any)}
            className="h-14 flex-1 lg:w-48 bg-white dark:bg-slate-950 border border-(--border-color) rounded-2xl px-5 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:border-cyan-600/30 transition-all appearance-none cursor-pointer"
          >
            <option value="all">Verification Status</option>
            <option value="registered">Verified</option>
            <option value="unregistered">Unregistered</option>
          </select>
        </div>
      </GlassCard>

      {/* ── EMPLOYEE GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="col-span-full py-40 flex flex-col items-center gap-6">
              <PageLoader />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Scanning Bio-Matrix...</p>
            </div>
          ) : paginatedEmployees.map((emp, idx) => (
            <motion.div
              key={emp.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
              transition={{ 
                type: 'spring', 
                damping: 20, 
                stiffness: 300,
                layout: { duration: 0.4 }
              }}
              className="bento-card group flex flex-col bg-white dark:bg-slate-900 overflow-hidden"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="relative">
                  <div className="h-16 w-16 rounded-[24px] bg-slate-950 border border-white/10 flex items-center justify-center text-2xl font-black text-white italic shadow-2xl group-hover:rotate-6 transition-transform uppercase">
                    {emp.name.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 h-7 w-7 rounded-xl border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center ${emp.faceRegistered ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-800'}`}>
                    <ShieldCheck size={14} className="text-white" />
                  </div>
                  {emp.isOnline && (
                    <div className="absolute -top-1 -left-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  )}
                </div>
                <div className="text-right">
                  <FaceBadge registered={emp.faceRegistered} />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Class: {emp.contractType || 'Permanent'}</p>
                </div>
              </div>

              <div className="flex-1 space-y-2 mb-8">
                <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tighter italic leading-none group-hover:text-cyan-600 transition-colors">
                  {emp.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{emp.employeeId}</p>
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-pulse" />
                  <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest italic">{emp.position || 'Operative'}</p>
                </div>
                <p className="text-[10px] font-bold text-slate-500 truncate mt-4 opacity-0 group-hover:opacity-100 transition-opacity">{emp.email}</p>
              </div>

              <div className="pt-6 border-t border-(--border-color) flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Node / Unit</p>
                  <div className="px-3 py-1.5 bg-slate-950 dark:bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest rounded-xl">
                    {emp.department}
                  </div>
                </div>
                <div className="flex gap-2">
                  <InteractiveButton 
                    stopPropagation
                    onClick={() => {
                      if(confirm(`TERMINATE: Are you sure you want to remove ${emp.name} from the system?`)) {
                        deleteEmployeeOptimistic(emp.id);
                      }
                    }}
                    className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center"
                    title="Terminate Access"
                  >
                    <Trash2 size={18} />
                  </InteractiveButton>
                  <Link href={`/employees/detail?id=${emp.id}`}>
                    <InteractiveButton 
                      className="w-11 h-11 rounded-xl bg-slate-950 dark:bg-cyan-600 text-white flex items-center justify-center shadow-lg"
                    >
                      <ChevronRight size={20} />
                    </InteractiveButton>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-center pt-10">
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <AddEmployeeModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        jamKerjas={jamKerjas}
        departmentItems={departmentItems}
      />
    </div>
  );
}