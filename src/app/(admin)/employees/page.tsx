'use client';

import { useState, useEffect } from 'react';
import { FaceBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import AddEmployeeModal from '@/components/employees/AddEmployeeModal';
import { useEmployeeManagement } from '@/hooks/useEmployeeManagement';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Pagination } from '@/components/ui/Pagination';
import {
  Trash2,
  ChevronRight,
  UserPlus,
  Search,
  Users,
  ShieldCheck,
  AlertCircle,
  Building2,
  CheckCircle2,
  Filter,
  MoreVertical,
  Mail
} from 'lucide-react';
import { BentoCard } from '@/components/ui/BentoCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

// ── COMPONENTS ──

const StatCard = ({ label, val, icon: Icon, color, index }: any) => (
  <BentoCard 
    index={index}
    className="p-10 flex flex-col justify-between"
  >
    <div className="flex items-center justify-between mb-8">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
    </div>
    <div>
      <p className="text-desc font-medium text-slate-400 mb-2 uppercase tracking-widest">{label}</p>
      <h3 className="text-stats font-extrabold text-slate-900 tracking-tight leading-none tabular-nums">
        {val}
      </h3>
    </div>
  </BentoCard>
);

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
    currentPage * itemsPerPage,
  );

  return (
    <div className="flex flex-col gap-10 w-full pb-20 max-w-[1440px] mx-auto">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <span className="flex items-center gap-2 px-3 py-1.5 bg-mustard bg-opacity-10 text-mustard rounded-full text-[10px] font-bold uppercase tracking-wider border border-mustard border-opacity-10">
               <Users size={12} />
               Personnel Directory
             </span>
          </div>
          <h1 className="text-h1 font-extrabold text-slate-900 tracking-tight leading-none">
            Employee <span className="text-mustard">Database</span>
          </h1>
          <p className="text-desc font-medium text-slate-400 mt-4 max-w-xl">
            Central repository for JNE Martapura personnel. Currently managing {employees.length} active records.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <AnimatedButton
            onClick={() => setShowAddModal(true)}
            className="h-14 px-8 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-lg hover:bg-mustard transition-all flex items-center gap-3"
          >
            <UserPlus size={18} />
            Onboard Personnel
          </AnimatedButton>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard index={0} label="Total Records" val={employees.length} icon={Users} color="bg-indigo-600" />
        <StatCard index={1} label="Verified Units" val={employees.filter((e) => e.faceRegistered).length} icon={ShieldCheck} color="bg-emerald-600" />
        <StatCard index={2} label="Pending Sync" val={employees.filter((e) => !e.faceRegistered).length} icon={AlertCircle} color="bg-amber-600" />
        <StatCard index={3} label="Live Status" val={employees.filter(e => e.isOnline).length} icon={CheckCircle2} color="bg-cyan-600" />
      </div>

      {/* ── FILTERS ── */}
      <BentoCard className="p-4" hoverEffect={false}>
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-mustard transition-colors" />
            <input
              type="text"
              placeholder="Search by name, ID, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 bg-slate-50 border border-transparent rounded-xl pl-16 pr-8 text-desc font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-mustard focus:border-opacity-20 transition-all"
            />
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-56">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full h-14 bg-white border border-slate-100 rounded-xl px-6 pr-12 text-[11px] font-bold text-slate-600 uppercase tracking-widest outline-none cursor-pointer hover:border-mustard transition-all appearance-none"
              >
                <option value="all">ALL DEPARTMENTS</option>
                {departmentItems.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <Filter size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
            </div>
            <div className="relative flex-1 lg:w-56">
              <select
                value={filterFace}
                onChange={(e) => setFilterFace(e.target.value as any)}
                className="w-full h-14 bg-white border border-slate-100 rounded-xl px-6 pr-12 text-[11px] font-bold text-slate-600 uppercase tracking-widest outline-none cursor-pointer hover:border-mustard transition-all appearance-none"
              >
                <option value="all">VERIFICATION STATUS</option>
                <option value="registered">VERIFIED</option>
                <option value="unregistered">UNVERIFIED</option>
              </select>
              <ShieldCheck size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
            </div>
          </div>
        </div>
      </BentoCard>

      {/* ── DIRECTORY GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="col-span-full py-40 flex flex-col items-center gap-6">
              <PageLoader />
              <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400">
                Synchronizing Database...
              </p>
            </div>
          ) : paginatedEmployees.map((emp, idx) => (
            <BentoCard
              key={emp.id}
              index={idx}
              className="p-10 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-[20px] font-black group-hover:bg-mustard transition-colors shadow-sm">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-[18px] font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-mustard transition-colors">
                        {emp.name}
                      </h3>
                      <p className="text-[12px] font-medium text-slate-400 uppercase tracking-widest mt-1">{emp.employeeId}</p>
                    </div>
                  </div>
                  <button className="text-slate-200 hover:text-slate-400 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-mustard group-hover:border-opacity-10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</p>
                        <p className="text-[13px] font-bold text-slate-900">{emp.department || 'Operations'}</p>
                      </div>
                    </div>
                    <FaceBadge registered={emp.faceRegistered} />
                  </div>

                  <div className="flex items-center gap-3 px-1">
                    <Mail size={14} className="text-slate-300" />
                    <p className="text-[12px] font-medium text-slate-500 truncate">{emp.email || 'no-email@jne.com'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-10 flex items-center gap-3 mt-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Archive record for ${emp.name}?`)) {
                      deleteEmployeeOptimistic(emp.id);
                    }
                  }}
                  className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center"
                >
                  <Trash2 size={20} />
                </button>
                
                <Link href={`/employees/detail?id=${emp.uid}`} className="flex-1">
                  <button
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-mustard transition-all shadow-sm"
                  >
                    View Full Profile
                    <ChevronRight size={18} />
                  </button>
                </Link>
              </div>
            </BentoCard>
          ))}
        </AnimatePresence>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-10">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        jamKerjas={jamKerjas}
        departmentItems={departmentItems}
      />
    </div>
  );
}