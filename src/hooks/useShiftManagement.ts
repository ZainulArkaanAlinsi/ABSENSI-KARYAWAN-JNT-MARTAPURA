import { useState, useEffect } from 'react';
import { subscribeToShifts, addShift, updateShift, deleteShift } from '@/lib/firestore';
import type { Shift, ShiftDay } from '@/types';

export const DAYS: { key: ShiftDay; label: string }[] = [
  { key: 'monday', label: 'Sen' },
  { key: 'tuesday', label: 'Sel' },
  { key: 'wednesday', label: 'Rab' },
  { key: 'thursday', label: 'Kam' },
  { key: 'friday', label: 'Jum' },
  { key: 'saturday', label: 'Sab' },
  { key: 'sunday', label: 'Min' },
];

// Attendance-aligned color options for shift cards
export const SHIFT_COLORS = [
  '#43237F', // Present (dark purple)
  '#16A34A', // Late / Green
  '#C0392B', // Overtime / Red
  '#3D5280', // Leave / Dark blue
  '#D97706', // Absent / Orange
  '#0891B2', // Cyan
  '#DB2777', // Pink
];

export const defaultForm = {
  name: '',
  checkInTime: '08:00',
  checkOutTime: '17:00',
  toleranceMinutes: 15,
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as ShiftDay[],
  color: '#E31E24',
  isActive: true,
};

export function useShiftManagement() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToShifts((data) => {
      setShifts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const openAdd = () => {
    setEditingShift(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (shift: Shift) => {
    setEditingShift(shift);
    setForm({
      name: shift.name,
      checkInTime: shift.checkInTime,
      checkOutTime: shift.checkOutTime,
      toleranceMinutes: shift.toleranceMinutes,
      workingDays: shift.workingDays,
      color: shift.color,
      isActive: shift.isActive,
    });
    setShowModal(true);
  };

  const toggleDay = (day: ShiftDay) => {
    setForm(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingShift) {
        await updateShift(editingShift.id, form);
      } else {
        await addShift(form);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus shift "${name}"? Karyawan yang menggunakan shift ini perlu diperbarui.`)) return;
    await deleteShift(id);
  };

  const calcDuration = (checkIn: string, checkOut: string) => {
    const [h1, m1] = checkIn.split(':').map(Number);
    const [h2, m2] = checkOut.split(':').map(Number);
    const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (mins <= 0) return '-';
    return `${Math.floor(mins / 60)} jam ${mins % 60} menit`;
  };

  return {
    shifts,
    loading,
    showModal,
    setShowModal,
    editingShift,
    form,
    setForm,
    saving,
    openAdd,
    openEdit,
    toggleDay,
    handleSave,
    handleDelete,
    calcDuration,
  };
}
