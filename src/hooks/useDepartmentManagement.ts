import { useState, useEffect } from 'react';
import {
  subscribeToDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from '@/lib/firestore';
import type { DepartmentItem } from '@/types';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';

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
  const { confirm } = useConfirm();

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
    if (!form.name.trim()) return toast.error('Nama departemen wajib diisi');

    setSaving(true);
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, form);
        toast.success('Departemen berhasil diperbarui');
      } else {
        await addDepartment(form);
        toast.success('Departemen berhasil ditambahkan');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error('Gagal menyimpan departemen');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = await confirm({
      title: 'Hapus Departemen',
      message: `Yakin ingin menghapus departemen "${name}"? Karyawan yang terdaftar di departemen ini mungkin perlu diperbarui secara manual.`,
      variant: 'danger',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
    });

    if (!isConfirmed) return;

    try {
      await deleteDepartment(id);
      toast.success('Departemen berhasil dihapus');
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Gagal menghapus departemen');
    }
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(search.toLowerCase()) ||
      dept.description.toLowerCase().includes(search.toLowerCase()),
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
