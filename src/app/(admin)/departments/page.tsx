'use client';

import { useDepartmentManagement } from '@/hooks/useDepartmentManagement';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import DepartmentCard from '@/components/departments/DepartmentCard';
import DepartmentModal from '@/components/departments/DepartmentModal';
import { Pagination } from '@/components/ui/Pagination';
import { Plus, Layers } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
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
    filteredDepartments,
  } = useDepartmentManagement();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="editorial-heading text-[22px] font-black text-slate-800 tracking-tight leading-none">
            Unit <span style={{ color: '#E31E24' }}>Kerja</span>
          </h1>
          <p className="text-[12px] text-slate-400 mt-1 font-medium">
            {departments.length} departemen aktif terdaftar
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-[12px] font-bold text-white shrink-0"
          style={{ background: '#10B981', boxShadow: 'none' }}
        >
          <Plus size={15} />
          Tambah Unit
        </motion.button>
      </motion.div>

      {/* ── SEARCH + STAT ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Cari unit atau departemen..."
          className="flex-1 max-w-sm"
        />
        <div
          className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-100"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <Layers size={15} className="text-emerald-500" />
          <p className="text-[12px] font-bold text-slate-700">{departments.length} unit aktif</p>
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {paginatedDepartments.map((dept, idx) => (
          <DepartmentCard
            key={dept.id}
            department={dept}
            onEdit={openEdit}
            onDelete={handleDelete}
            index={idx}
          />
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

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
