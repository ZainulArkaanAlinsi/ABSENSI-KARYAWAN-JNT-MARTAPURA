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
} from 'lucide-react';
import { FaceBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import AddEmployeeModal from '@/components/employees/AddEmployeeModal';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { deleteEmployee } from '@/lib/firestore';
import Link from 'next/link';
import { useEmployeeManagement } from '@/hooks/useEmployeeManagement';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <>
      <div className="dash-root max-w-[1400px] mx-auto">
        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'FORCE TOTAL', value: employees.length, icon: Users, color: '#005596', sub: 'Personnel Count' },
            { label: 'SECURE SCAN', value: employees.filter(e => e.faceRegistered).length, icon: ShieldCheck, color: '#10B981', sub: 'Biometric Verified' },
            { label: 'PENDING ENROLL', value: employees.filter(e => !e.faceRegistered).length, icon: AlertCircle, color: '#E31E24', sub: 'Action Required' },
            { label: 'MATCH YIELD', value: filteredEmployees.length, icon: Filter, color: '#64748B', sub: 'Filtered Result' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-(--bg-card) border border-(--border-primary) shadow-sm p-8 rounded-4xl group transition-all"
            >
              <div className="relative z-10 w-full flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-(--text-dim) uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-(--text-primary) tracking-tighter leading-none">{loading ? '—' : stat.value}</p>
                  <p className="text-[9px] font-bold text-(--text-muted) uppercase tracking-widest mt-2">{stat.sub}</p>
                </div>
                <div 
                  className="h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  <stat.icon size={20} strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Filter / Search Bar ── */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-(--bg-card) p-6 border border-(--border-primary) rounded-4xl mb-10 shadow-sm"
        >
          <div className="flex flex-col xl:flex-row items-center gap-6">
            <div className="relative flex-1 w-full group">
              <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-(--text-dim) group-focus-within:text-[#005596] transition-colors" />
              <input
                type="text"
                className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white/5 border border-(--border-primary) text-sm font-bold text-(--text-primary) outline-none focus:border-[#005596]/30 transition-all shadow-sm"
                placeholder="Cari nama, email, atau departemen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <select 
                className="px-6 py-4 rounded-2xl bg-white/5 border border-(--border-primary) text-xs font-black uppercase tracking-widest text-(--text-secondary) outline-none"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <option value="all">Semua Unit</option>
                {departmentItems.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>

              <select 
                className="px-6 py-4 rounded-2xl bg-white/5 border border-(--border-primary) text-xs font-black uppercase tracking-widest text-(--text-secondary) outline-none"
                value={filterFace}
                onChange={(e) => setFilterFace(e.target.value as 'all' | 'registered' | 'unregistered')}
              >
                <option value="all">Status Scan</option>
                <option value="registered">Terverifikasi</option>
                <option value="unregistered">Belum Scan</option>
              </select>

              <AnimatedButton 
                onClick={() => setShowAddModal(true)}
                className="bg-[#E31E24]! text-white! rounded-2xl! px-8! py-4! hover:bg-red-700! transition-all shadow-lg shadow-red-600/20"
                animationType="pop"
              >
                <div className="flex items-center gap-3">
                  <UserPlus size={18} strokeWidth={3} />
                  <span className="font-black uppercase tracking-widest text-[11px]">Tambah</span>
                </div>
              </AnimatedButton>
            </div>
          </div>
        </motion.div>

        {/* ── Employee Table / Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {loading ? (
              <div className="col-span-full py-20 flex justify-center"><PageLoader /></div>
            ) : filteredEmployees.map((emp, idx) => (
              <motion.div
                key={emp.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.02, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -5 }}
                className="bg-(--bg-card) border border-(--border-primary) rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-[#005596]/10 transition-all group relative overflow-hidden"
              >
                {/* Decorative Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-[#005596]/5 to-transparent pointer-events-none" />
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-3xl bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-3xl font-black text-(--text-primary) border border-(--border-primary) group-hover:border-[#005596]/30 transition-all shadow-inner">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-white dark:bg-slate-900 border border-(--border-primary) shadow-sm flex items-center justify-center">
                       <ShieldCheck size={14} className={emp.faceRegistered ? 'text-emerald-500' : 'text-(--text-dim)'} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <FaceBadge registered={emp.faceRegistered} />
                    <span className="text-[9px] font-black text-(--text-muted) uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-(--border-primary)">
                      {emp.contractType || 'Permanent'}
                    </span>
                  </div>
                </div>
                
                <div className="mb-8 relative z-10">
                  <h3 className="text-2xl font-black text-(--text-primary) tracking-tighter uppercase leading-tight mb-1 truncate group-hover:text-[#005596] transition-colors">
                    {emp.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.2em]">{emp.employeeId}</p>
                    <div className="w-1 h-1 rounded-full bg-(--text-dim)" />
                    <p className="text-[10px] font-black text-[#E31E24] uppercase tracking-widest">{emp.position || 'Staff'}</p>
                  </div>
                  <p className="mt-5 text-xs font-bold text-(--text-muted) flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {emp.email}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-(--border-primary) relative z-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-(--text-dim) uppercase tracking-widest">Department Unit</span>
                    <div className="px-4 py-2 rounded-xl bg-[#005596]/10 text-[#005596] text-[10px] font-black uppercase tracking-widest border border-[#005596]/20">
                      {emp.department}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => deleteEmployee(emp.id)}
                      className="h-11 w-11 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                    <Link 
                      href={`/employees/detail?id=${emp.id}`}
                      className="h-11 w-11 rounded-2xl bg-[#005596] text-white hover:bg-[#003d6b] flex items-center justify-center transition-all shadow-lg shadow-[#005596]/30 active:scale-90"
                    >
                      <ChevronRight size={22} strokeWidth={3} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AddEmployeeModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        jamKerjas={jamKerjas}
        departmentItems={departmentItems}
      />
    </>
  );
}