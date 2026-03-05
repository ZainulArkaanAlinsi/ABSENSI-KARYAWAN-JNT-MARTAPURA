import { useState, useEffect } from 'react';
import {
  subscribeToDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from '@/lib/firestore';
import type { DepartmentItem } from '@/types';

export const DEPARTMENT_COLORS = [
  '#E31E24', // JNE Red
  '#CC0000', // Dark JNE Red
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#64748B', // Slate
];

export function useDepartmentManagement() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Omit<DepartmentItem, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    color: DEPARTMENT_COLORS[0],
    isActive: true,
  });

  useEffect(() => {
    const unsub = subscribeToDepartments((data) => {
      setDepartments(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const openAdd = () => {
    setEditingDepartment(null);
    setForm({
      name: '',
      description: '',
      color: DEPARTMENT_COLORS[0],
      isActive: true,
    });
    setShowModal(true);
  };

  const openEdit = (dept: DepartmentItem) => {
    setEditingDepartment(dept);
    setForm({
      name: dept.name,
      description: dept.description,
      color: dept.color,
      isActive: dept.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Nama departemen wajib diisi');

    setSaving(true);
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, form);
        alert('Departemen berhasil diperbarui');
      } else {
        await addDepartment(form);
        alert('Departemen berhasil ditambahkan');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving department:', error);
      alert('Gagal menyimpan departemen');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus departemen "${name}"?\nKaryawan yang terdaftar di departemen ini mungkin perlu diperbarui secara manual.`)) {
      return;
    }

    try {
      await deleteDepartment(id);
      alert('Departemen berhasil dihapus');
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Gagal menghapus departemen');
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(search.toLowerCase()) ||
    dept.description.toLowerCase().includes(search.toLowerCase())
  );

  return {
    departments,
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
  };
}
