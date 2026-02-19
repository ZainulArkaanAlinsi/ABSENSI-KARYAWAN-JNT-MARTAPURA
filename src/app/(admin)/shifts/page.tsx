'use client';

import { useEffect, useState } from 'react';
import { Plus, Clock, Edit2, Trash2, Users } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { subscribeToShifts, addShift, updateShift, deleteShift } from '@/lib/firestore';
import type { Shift, ShiftDay } from '@/types';
import Modal from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';

const DAYS: { key: ShiftDay; label: string }[] = [
  { key: 'monday', label: 'Sen' },
  { key: 'tuesday', label: 'Sel' },
  { key: 'wednesday', label: 'Rab' },
  { key: 'thursday', label: 'Kam' },
  { key: 'friday', label: 'Jum' },
  { key: 'saturday', label: 'Sab' },
  { key: 'sunday', label: 'Min' },
];

const SHIFT_COLORS = ['#E31E24', '#2563EB', '#16A34A', '#D97706', '#7C3AED', '#0891B2', '#DB2777'];

const defaultForm = {
  name: '',
  checkInTime: '08:00',
  checkOutTime: '17:00',
  toleranceMinutes: 15,
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as ShiftDay[],
  color: '#E31E24',
  isActive: true,
};

export default function ShiftsPage() {
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

  return (
    <AdminLayout title="Pengaturan Shift Kerja" subtitle="Kelola jadwal shift karyawan">
      <div className="flex justify-between items-center mb-5">
        <div className="flex gap-3">
          <span className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
            Total Shift: <strong>{shifts.length}</strong>
          </span>
          <span className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
            Aktif: <strong className="text-green-600">{shifts.filter(s => s.isActive).length}</strong>
          </span>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <Plus size={16} /> Tambah Shift
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : shifts.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20">
          <Clock size={40} color="#CBD5E1" />
          <p className="text-slate-400 mt-3">Belum ada shift. Tambah shift pertama.</p>
          <button onClick={openAdd} className="btn btn-primary mt-4"><Plus size={14} /> Tambah Shift</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shifts.map(shift => (
            <div key={shift.id} className="card p-5 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-xl"
                    style={{ width: 44, height: 44, background: shift.color + '20' }}
                  >
                    <Clock size={20} color={shift.color} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{shift.name}</h3>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: shift.isActive ? '#DCFCE7' : '#F1F5F9', color: shift.isActive ? '#15803D' : '#94A3B8' }}
                    >
                      {shift.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(shift)} className="btn btn-ghost p-2">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(shift.id, shift.name)} className="btn btn-ghost p-2" style={{ color: '#DC2626' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl text-center" style={{ background: '#F8FAFC' }}>
                  <p className="text-xs text-slate-400">Masuk</p>
                  <p className="font-bold text-slate-700 text-lg">{shift.checkInTime}</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background: '#F8FAFC' }}>
                  <p className="text-xs text-slate-400">Pulang</p>
                  <p className="font-bold text-slate-700 text-lg">{shift.checkOutTime}</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-3">
                Durasi: <strong>{calcDuration(shift.checkInTime, shift.checkOutTime)}</strong> •
                Toleransi: <strong>{shift.toleranceMinutes} menit</strong>
              </p>

              {/* Working Days */}
              <div className="flex gap-1 flex-wrap">
                {DAYS.map(({ key, label }) => (
                  <span
                    key={key}
                    className="text-xs px-2 py-1 rounded-lg font-semibold"
                    style={{
                      background: shift.workingDays.includes(key) ? shift.color + '20' : '#F1F5F9',
                      color: shift.workingDays.includes(key) ? shift.color : '#CBD5E1',
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shift Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingShift ? 'Edit Shift' : 'Tambah Shift Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="form-label">Nama Shift *</label>
            <input className="form-input" placeholder="Shift Pagi" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Jam Masuk *</label>
              <input type="time" className="form-input" value={form.checkInTime}
                onChange={e => setForm(p => ({ ...p, checkInTime: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">Jam Pulang *</label>
              <input type="time" className="form-input" value={form.checkOutTime}
                onChange={e => setForm(p => ({ ...p, checkOutTime: e.target.value }))} required />
            </div>
          </div>

          <div>
            <label className="form-label">Toleransi Keterlambatan (menit)</label>
            <input type="number" className="form-input" min={0} max={60} value={form.toleranceMinutes}
              onChange={e => setForm(p => ({ ...p, toleranceMinutes: parseInt(e.target.value) || 0 }))} />
          </div>

          <div>
            <label className="form-label">Hari Kerja</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDay(key)}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                  style={{
                    background: form.workingDays.includes(key) ? form.color : '#F1F5F9',
                    color: form.workingDays.includes(key) ? 'white' : '#94A3B8',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Warna Shift</label>
            <div className="flex gap-2">
              {SHIFT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, color: c }))}
                  className="rounded-full transition-transform hover:scale-110"
                  style={{
                    width: 28, height: 28, background: c,
                    outline: form.color === c ? `3px solid ${c}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Batal</button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1 justify-center">
              {saving ? 'Menyimpan...' : editingShift ? 'Simpan Perubahan' : 'Tambah Shift'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
