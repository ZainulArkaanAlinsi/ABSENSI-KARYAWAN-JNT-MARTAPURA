import { useState, useEffect } from 'react';
import { subscribeToJamKerjas, addJamKerja, updateJamKerja, deleteJamKerja } from '@/lib/firestore';
import type { JamKerja, WorkDay } from '@/types';

export const DAYS: { key: WorkDay; label: string }[] = [

  { key: 'monday', label: 'Sen' },
  { key: 'tuesday', label: 'Sel' },
  { key: 'wednesday', label: 'Rab' },
  { key: 'thursday', label: 'Kam' },
  { key: 'friday', label: 'Jum' },
  { key: 'saturday', label: 'Sab' },
  { key: 'sunday', label: 'Min' },
];

export const JAM_KERJA_COLORS = [
  '#E31E24', // JNE Red
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
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as WorkDay[],
  color: '#E31E24',
  isActive: true,
};

export function useJamKerjaManagement() {
  const [jamKerjas, setJamKerjas] = useState<JamKerja[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJamKerja, setEditingJamKerja] = useState<JamKerja | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToJamKerjas((data) => {
      setJamKerjas(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const openAdd = () => {
    setEditingJamKerja(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (s: JamKerja) => {
    setEditingJamKerja(s);
    setForm({
      name: s.name,
      checkInTime: s.checkInTime,
      checkOutTime: s.checkOutTime,
      toleranceMinutes: s.toleranceMinutes,
      workingDays: s.workingDays,
      color: s.color,
      isActive: s.isActive,
    });
    setShowModal(true);
  };

  const toggleDay = (day: WorkDay) => {
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
      if (editingJamKerja) {
        await updateJamKerja(editingJamKerja.id, form);
      } else {
        await addJamKerja(form);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus jam kerja "${name}"? Karyawan yang menggunakan jam kerja ini perlu diperbarui.`)) return;
    await deleteJamKerja(id);
  };

  const calcDuration = (checkIn: string, checkOut: string) => {
    const [h1, m1] = checkIn.split(':').map(Number);
    const [h2, m2] = checkOut.split(':').map(Number);
    let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (mins < 0) mins += 24 * 60; // Handle cross-day shifts
    if (mins <= 0) return '-';
    return `${Math.floor(mins / 60)} jam ${mins % 60} menit`;
  };

  return {
    jamKerjas,
    loading,
    showModal,
    setShowModal,
    editingJamKerja,
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
