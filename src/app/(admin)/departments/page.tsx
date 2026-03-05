'use client';

import {
  Plus,
  Layers,
  Edit2,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useDepartmentManagement } from '@/hooks/useDepartmentManagement';
import DepartmentModal from '@/components/departments/DepartmentModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function DepartmentsPage() {
  const {
    filteredDepartments,
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
  } = useDepartmentManagement();

  return (
    <AdminLayout
      title="Manajemen Unit / Departemen"
      subtitle="Atur struktur organisasi dan penugasan karyawan"
    >
      <div className="dash-root">
        
        {/* Header Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8"
        >
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm text-white focus:border-red-500/50 transition-all outline-none"
              placeholder="Cari unit atau deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <button
              onClick={() => setSearch('')}
              className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={openAdd}
              className="flex-1 md:flex-none h-12 px-6 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: '#E31E24' }}
            >
              <Plus size={18} />
              Tambah Unit Baru
            </button>
          </div>
        </motion.div>

        {/* List Content */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <PageLoader />
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="py-20 text-center bg-white/2 border border-dashed border-white/10 rounded-2xl">
            <div className="h-16 w-16 bg-red-600/10 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers size={32} />
            </div>
            <h3 className="text-white font-bold mb-2">Belum ada Unit terdaftar</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
              Daftarkan unit atau departemen untuk mulai mengelompokkan karyawan Anda.
            </p>
            <button
              onClick={openAdd}
              className="text-red-500 font-bold text-sm hover:underline"
            >
              Tambah Unit Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredDepartments.map((dept, idx) => (
                <motion.div
                  key={dept.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/3 border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group relative overflow-hidden"
                >
                  {/* Color bar */}
                  <div className="absolute top-0 left-0 w-full h-1" style={{ background: dept.color }} />
                  
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ background: `${dept.color}33`, color: dept.color, border: `1px solid ${dept.color}55` }}
                    >
                      <Layers size={20} />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(dept)}
                        className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id, dept.name)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-lg mb-2">{dept.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 min-h-[40px]">
                    {dept.description || 'Tidak ada deskripsi tersedia.'}
                  </p>

                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${dept.isActive ? 'bg-green-500' : 'bg-slate-500'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {dept.isActive ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

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
    </AdminLayout>
  );
}
