'use client';

import {
  Search,
  Users,
  ShieldCheck,
  AlertCircle,
  Filter,
  Trash2,
  ChevronRight,
  UserPlus,
  Command,
  LayoutGrid,
  MoreVertical
} from 'lucide-react';
import { FaceBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import AddEmployeeModal from '@/components/employees/AddEmployeeModal';
import { deleteEmployee } from '@/lib/firestore';
import Link from 'next/link';
import { useEmployeeManagement } from '@/hooks/useEmployeeManagement';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Pagination } from '@/components/ui/Pagination';

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
  } = useEmployeeManagement();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDept, filterFace]);

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
          <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter italic">
            Personnel <span className="text-rose-600">Archive</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] mt-2 ml-1">Manajemen Sumber Daya Manusia JNE</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="h-12 px-8 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all"
          >
             <UserPlus size={18} />
             Add Personnel
          </button>
        </div>
      </div>

      {/* ── METRICS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Force Total', val: employees.length, icon: Users, color: 'text-slate-500', bg: 'bg-slate-500/10' },
          { label: 'Secure Scan', val: employees.filter(e => e.faceRegistered).length, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Action Needed', val: employees.filter(e => !e.faceRegistered).length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-600/10' },
          { label: 'Filtered', val: filteredEmployees.length, icon: Filter, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((m, i) => (
          <div key={i} className="bento-card p-6! flex items-center justify-between group">
            <div className="space-y-0.5">
              <p className="text-(--text-secondary) text-[9px] font-black uppercase tracking-widest">{m.label}</p>
              <h3 className="text-2xl font-black text-(--text-primary) tracking-tight">{loading ? '...' : m.val}</h3>
            </div>
            <div className={`w-12 h-12 ${m.bg} rounded-xl flex items-center justify-center ${m.color}`}>
              <m.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTER & SEARCH ── */}
      <div className="bento-card p-6! flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name, ID, or department..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-(--text-primary) outline-none focus:ring-1 focus:ring-rose-600/30"
          />
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <select 
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="flex-1 lg:w-48 bg-(--bg-main) border border-(--border-color) rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-(--text-primary) outline-none"
          >
            <option value="all">All Units</option>
            {departmentItems.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
          <select 
            value={filterFace}
            onChange={(e) => setFilterFace(e.target.value as any)}
            className="flex-1 lg:w-48 bg-(--bg-main) border border-(--border-color) rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-(--text-primary) outline-none"
          >
            <option value="all">Face Scan Status</option>
            <option value="registered">Verified</option>
            <option value="unregistered">Not Enrolled</option>
          </select>
        </div>
      </div>

      {/* ── EMPLOYEE GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="col-span-full py-20 flex justify-center"><PageLoader /></div>
          ) : paginatedEmployees.map((emp, idx) => (
            <motion.div
              key={emp.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.02 }}
              className="bento-card group flex flex-col"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-2xl font-black text-white italic shadow-lg shadow-black/20 uppercase">
                    {emp.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-lg bg-white dark:bg-slate-900 border border-(--border-color) shadow-sm flex items-center justify-center">
                    <ShieldCheck size={14} className={emp.faceRegistered ? 'text-emerald-500' : 'text-slate-300'} />
                  </div>
                </div>
                <div className="text-right">
                  <FaceBadge registered={emp.faceRegistered} />
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Level: {emp.contractType || 'P-1'}</p>
                </div>
              </div>

              <div className="flex-1 space-y-2 mb-8">
                <h3 className="text-xl font-black text-(--text-primary) uppercase tracking-tighter italic leading-none group-hover:text-rose-600 transition-colors">
                  {emp.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{emp.employeeId}</p>
                  <div className="w-1 h-1 rounded-full bg-rose-600" />
                  <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest italic">{emp.position || 'Courier'}</p>
                </div>
                <p className="text-[10px] font-medium text-slate-500 truncate mt-4">{emp.email}</p>
              </div>

              <div className="pt-6 border-t border-(--border-color) flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Department</p>
                  <div className="px-3 py-1 bg-slate-950 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                    {emp.department}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => deleteEmployee(emp.id)}
                    className="w-10 h-10 rounded-xl bg-rose-600/10 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all active:scale-90"
                  >
                    <Trash2 size={16} />
                  </button>
                  <Link 
                    href={`/employees/detail?id=${emp.id}`}
                    className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center hover:bg-rose-600 transition-all active:scale-90 shadow-lg"
                  >
                    <ChevronRight size={18} />
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