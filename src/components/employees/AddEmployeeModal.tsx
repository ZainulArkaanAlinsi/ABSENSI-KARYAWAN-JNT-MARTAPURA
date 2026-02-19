'use client';

import { useState } from 'react';
import { Loader2, Mail, User, Building, Briefcase, Clock } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { addEmployee } from '@/lib/firestore';
import type { Shift } from '@/types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: Shift[];
}

const DEPARTMENTS = ['Operasional', 'Kurir', 'Admin', 'Gudang', 'IT', 'HR', 'Keuangan', 'Marketing'];

export default function AddEmployeeModal({ isOpen, onClose, shifts }: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    position: '',
    shiftId: '',
    contractType: 'permanent' as 'permanent' | 'contract' | 'intern',
    joinDate: new Date().toISOString().split('T')[0],
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addEmployee({
        ...form,
        uid: '',
        role: 'employee',
        faceRegistered: false,
        isActive: true,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm({ name: '', email: '', phone: '', employeeId: '', department: '', position: '', shiftId: '', contractType: 'permanent', joinDate: new Date().toISOString().split('T')[0] });
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Karyawan Baru" maxWidth={600}>
      {success ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div
            className="flex items-center justify-center rounded-full mb-4"
            style={{ width: 64, height: 64, background: '#DCFCE7' }}
          >
            <span style={{ fontSize: 28 }}>✓</span>
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Karyawan Berhasil Ditambahkan!</h3>
          <p className="text-slate-500 text-sm mt-1 text-center">
            Email sambutan dengan kredensial login akan dikirim otomatis ke <strong>{form.email}</strong>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-2"
            style={{ background: '#DBEAFE', color: '#1D4ED8' }}
          >
            <Mail size={14} />
            <span>Sistem akan otomatis mengirim email kredensial login ke karyawan baru.</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                <User size={12} className="inline mr-1" />Nama Lengkap *
              </label>
              <input className="form-input" placeholder="Budi Santoso" value={form.name}
                onChange={e => handleChange('name', e.target.value)} required />
            </div>
            <div>
              <label className="form-label">ID Karyawan *</label>
              <input className="form-input" placeholder="JNE-001" value={form.employeeId}
                onChange={e => handleChange('employeeId', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                <Mail size={12} className="inline mr-1" />Email *
              </label>
              <input type="email" className="form-input" placeholder="budi@jnemtp.com" value={form.email}
                onChange={e => handleChange('email', e.target.value)} required />
            </div>
            <div>
              <label className="form-label">No. Telepon</label>
              <input className="form-input" placeholder="08xxxxxxxxxx" value={form.phone}
                onChange={e => handleChange('phone', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                <Building size={12} className="inline mr-1" />Departemen *
              </label>
              <select className="form-input" value={form.department}
                onChange={e => handleChange('department', e.target.value)} required>
                <option value="">Pilih Departemen</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">
                <Briefcase size={12} className="inline mr-1" />Jabatan *
              </label>
              <input className="form-input" placeholder="Staff Operasional" value={form.position}
                onChange={e => handleChange('position', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                <Clock size={12} className="inline mr-1" />Shift Kerja *
              </label>
              <select className="form-input" value={form.shiftId}
                onChange={e => handleChange('shiftId', e.target.value)} required>
                <option value="">Pilih Shift</option>
                {shifts.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.checkInTime} - {s.checkOutTime})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Tipe Kontrak</label>
              <select className="form-input" value={form.contractType}
                onChange={e => handleChange('contractType', e.target.value)}>
                <option value="permanent">Karyawan Tetap</option>
                <option value="contract">Kontrak</option>
                <option value="intern">Magang</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Tanggal Bergabung</label>
            <input type="date" className="form-input" value={form.joinDate}
              onChange={e => handleChange('joinDate', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Batal
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1 justify-center">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : 'Tambah Karyawan'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
