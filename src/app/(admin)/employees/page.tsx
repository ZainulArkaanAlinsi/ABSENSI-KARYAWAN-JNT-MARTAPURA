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
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-(--text-primary) tracking-tighter italic">
            Arsip <span className="text-cyan-600 dark:text-cyan-400">Personel</span>
          </h1>
          <p className="text-(--text-secondary) font-bold text-[10px] uppercase tracking-[0.3em] mt-1 ml-1">Manajemen Sumber Daya Manusia JNE</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="h-10 px-6 bg-cyan-600 dark:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 shadow-lg shadow-cyan-600/10 hover:scale-105 active:scale-95 transition-all"
          >
             <UserPlus size={16} />
             Tambah Karyawan
          </button>
        </div>
      </div>

      {/* ── METRICS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Personel', val: employees.length, icon: Users, color: 'text-(--metric-blue-text)', bg: 'bg-(--metric-blue-bg)' },
          { label: 'Wajah Terdaftar', val: employees.filter(e => e.faceRegistered).length, icon: ShieldCheck, color: 'text-(--metric-green-text)', bg: 'bg-(--metric-green-bg)' },
          { label: 'Butuh Tindakan', val: employees.filter(e => !e.faceRegistered).length, icon: AlertCircle, color: 'text-(--metric-peach-text)', bg: 'bg-(--metric-peach-bg)' },
          { label: 'Hasil Filter', val: filteredEmployees.length, icon: Filter, color: 'text-(--metric-teal-text)', bg: 'bg-(--metric-teal-bg)' },
        ].map((m, i) => (
          <div key={i} className={`bento-card p-4 flex items-center justify-between group ${m.bg}`}>
            <div className="space-y-0.5">
              <p className={`${m.color} opacity-70 text-[8px] font-black uppercase tracking-widest`}>{m.label}</p>
              <h3 className={`text-xl font-black ${m.color} tracking-tight`}>{loading ? '...' : m.val}</h3>
            </div>
            <div className={`w-10 h-10 bg-white/20 dark:bg-black/20 rounded-xl flex items-center justify-center ${m.color} shadow-sm`}>
              <m.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTER & SEARCH ── */}
      <div className="bento-card p-4 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Cari nama, ID, atau departemen..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-(--bg-main) border border-(--border-color) rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-bold text-(--text-primary) outline-none focus:ring-1 focus:ring-cyan-600/30"
          />
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <select 
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="flex-1 lg:w-40 bg-(--bg-main) border border-(--border-color) rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-(--text-primary) outline-none"
          >
            <option value="all">Semua Unit</option>
            {departmentItems.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
          <select 
            value={filterFace}
            onChange={(e) => setFilterFace(e.target.value as any)}
            className="flex-1 lg:w-40 bg-(--bg-main) border border-(--border-color) rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-(--text-primary) outline-none"
          >
            <option value="all">Status Wajah</option>
            <option value="registered">Terverifikasi</option>
            <option value="unregistered">Belum Terdaftar</option>
          </select>
        </div>
      </div>

      {/* ── EMPLOYEE GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <div className="flex items-start justify-between mb-6">
                <div className="relative">
                  <div className="h-14 w-14 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-xl font-black text-white italic shadow-lg shadow-black/20 uppercase">
                    {emp.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-white dark:bg-slate-900 border border-(--border-color) shadow-sm flex items-center justify-center">
                    <ShieldCheck size={12} className={emp.faceRegistered ? 'text-emerald-500' : 'text-slate-300'} />
                  </div>
                </div>
                <div className="text-right">
                  <FaceBadge registered={emp.faceRegistered} />
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Kontrak: {emp.contractType || 'Tetap'}</p>
                </div>
              </div>

              <div className="flex-1 space-y-1.5 mb-6">
                <h3 className="text-lg font-black text-(--text-primary) uppercase tracking-tighter italic leading-none group-hover:text-cyan-600 transition-colors">
                  {emp.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{emp.employeeId}</p>
                  <div className="w-1 h-1 rounded-full bg-cyan-600" />
                  <p className="text-[8px] font-black text-cyan-600 uppercase tracking-widest italic">{emp.position || 'Courier'}</p>
                </div>
                <p className="text-[9px] font-medium text-slate-500 truncate mt-3">{emp.email}</p>
              </div>

              <div className="pt-4 border-t border-(--border-color) flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Departemen / Unit</p>
                  <div className="px-2.5 py-1 bg-slate-950 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">
                    {emp.department}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => {
                      if(confirm(`Hapus data ${emp.name} secara permanen? Tindakan ini tidak dapat dibatalkan.`)) {
                        deleteEmployee(emp.id);
                      }
                    }}
                    className="w-9 h-9 rounded-lg bg-slate-400/10 text-slate-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all active:scale-90"
                    title="Hapus Karyawan"
                  >
                    <Trash2 size={14} />
                  </button>
                  <Link 
                    href={`/employees/detail?id=${emp.id}`}
                    className="w-9 h-9 rounded-lg bg-slate-950 text-white flex items-center justify-center hover:bg-cyan-600 transition-all active:scale-90 shadow-lg"
                  >
                    <ChevronRight size={16} />
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