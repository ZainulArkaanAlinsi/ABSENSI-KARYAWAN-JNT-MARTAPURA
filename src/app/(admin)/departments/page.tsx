'use client';

import { useDepartmentManagement } from '@/hooks/useDepartmentManagement';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import DepartmentCard from '@/components/departments/DepartmentCard';
import DepartmentModal from '@/components/departments/DepartmentModal';
import { Pagination } from '@/components/ui/Pagination';
import { Plus, Search, Layers, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function DepartmentsPage() {
  const {
    departments,
    loading,
    search,
    setSearch,
    showModal,
    setShowModal,
    editingDepartment,
    form,
    setForm,
    saving,
    openAdd,
    openEdit,
    handleSave,
    handleDelete,
    filteredDepartments
  } = useDepartmentManagement();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="py-32 flex justify-center">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="dash-root max-w-[1400px] mx-auto">
      {/* ── Stats & Info ── */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-(--bg-card) p-10 rounded-4xl border border-(--border-primary) shadow-sm flex items-center gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-[#005596]/10 to-transparent pointer-events-none" />
          <div className="h-20 w-20 rounded-3xl bg-[#005596] flex items-center justify-center text-white shadow-xl shadow-[#005596]/20 relative z-10">
            <Layers size={40} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black italic uppercase tracking-tight text-(--text-primary)">Struktur Unit Kerja</h2>
            <p className="text-(--text-muted) font-bold uppercase tracking-widest text-[11px] mt-2">Kelola pembagian departemen dan parameter operasional JNE Martapura.</p>
          </div>
        </div>
        
        <div className="bg-(--bg-card) p-10 rounded-4xl border border-(--border-primary) shadow-sm flex flex-col justify-center text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <ShieldCheck size={18} className="text-green-500" />
            <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">Active Units</p>
          </div>
          <p className="text-5xl font-black text-(--text-primary) tracking-tighter">{departments.length}</p>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-(--text-dim) group-focus-within:text-[#005596] transition-colors" size={20} />
          <input
            type="text"
            placeholder="Cari unit atau departemen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-5 rounded-2xl bg-(--bg-card) border border-(--border-primary) focus:border-[#005596]/50 focus:ring-4 focus:ring-[#005596]/5 outline-none transition-all font-bold text-(--text-secondary) shadow-sm"
          />
        </div>
        <button
          onClick={openAdd}
          className="px-10 py-5 bg-[#E31E24] hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-600/20"
        >
          <Plus size={18} strokeWidth={3} /> Tambah Unit
        </button>
      </div>

      {/* ── Departments Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {paginatedDepartments.map((dept, idx) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <DepartmentCard 
              department={dept} 
              onEdit={openEdit}
              onDelete={handleDelete} 
              index={idx} 
            />
          </motion.div>
        ))}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* ── Modals ── */}
      <DepartmentModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        editingDepartment={editingDepartment}
        form={form}
        setForm={setForm}
        saving={saving}
      />
    </div>
  );
}
