'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building, Briefcase, Clock, Smartphone, Calendar, RotateCcw, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getEmployee, updateEmployee, getShifts } from '@/lib/firestore';
import type { Employee, Shift } from '@/types';
import { FaceBadge, ContractBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    Promise.all([getEmployee(id), getShifts()]).then(([emp, sh]) => {
      setEmployee(emp);
      setShifts(sh);
      setLoading(false);
    });
  }, [id]);

  const handleResetFace = async () => {
    if (!employee || !confirm('Reset data wajah karyawan ini? Karyawan harus mendaftar ulang wajah.')) return;
    setResetting(true);
    await updateEmployee(id, { faceRegistered: false, deviceId: undefined, deviceModel: undefined });
    setEmployee(prev => prev ? { ...prev, faceRegistered: false } : null);
    setResetting(false);
  };

  const shiftName = shifts.find(s => s.id === employee?.shiftId)?.name || '-';
  const shift = shifts.find(s => s.id === employee?.shiftId);

  if (loading) return <AdminLayout title="Detail Karyawan"><PageLoader /></AdminLayout>;
  if (!employee) return (
    <AdminLayout title="Karyawan Tidak Ditemukan">
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-400">Karyawan tidak ditemukan.</p>
        <button onClick={() => router.back()} className="btn btn-secondary mt-4"><ArrowLeft size={14} /> Kembali</button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title={employee.name} subtitle={`${employee.position} — ${employee.department}`}>
      <div className="mb-4">
        <button onClick={() => router.back()} className="btn btn-ghost text-sm">
          <ArrowLeft size={14} /> Kembali ke Daftar
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card p-6 flex flex-col items-center text-center">
          <div
            className="flex items-center justify-center rounded-2xl text-white font-bold text-3xl mb-4"
            style={{ width: 80, height: 80, background: '#E31E24' }}
          >
            {employee.name?.charAt(0)?.toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-slate-800">{employee.name}</h2>
          <p className="text-slate-500 text-sm">{employee.position}</p>
          <p className="text-slate-400 text-xs mt-1">{employee.department}</p>

          <div className="flex gap-2 mt-4">
            <FaceBadge registered={employee.faceRegistered} />
            <ContractBadge type={employee.contractType} />
          </div>

          <div className="w-full mt-6 space-y-3 text-left">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail size={14} color="#94A3B8" />
              <span className="truncate">{employee.email}</span>
            </div>
            {employee.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} color="#94A3B8" />
                <span>{employee.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building size={14} color="#94A3B8" />
              <span>{employee.department}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Briefcase size={14} color="#94A3B8" />
              <span>{employee.position}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock size={14} color="#94A3B8" />
              <span>{shiftName}</span>
            </div>
            {employee.joinDate && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={14} color="#94A3B8" />
                <span>{format(new Date(employee.joinDate), 'd MMMM yyyy', { locale: localeId })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Device Info */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Smartphone size={16} color="#E31E24" /> Informasi Perangkat
            </h3>
            {employee.deviceModel ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl" style={{ background: '#F8FAFC' }}>
                  <p className="text-xs text-slate-400 mb-1">Model Perangkat</p>
                  <p className="font-semibold text-slate-700 text-sm">{employee.deviceModel}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: '#F8FAFC' }}>
                  <p className="text-xs text-slate-400 mb-1">Device ID</p>
                  <p className="font-mono text-slate-700 text-xs break-all">{employee.deviceId || '-'}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Belum ada perangkat terdaftar.</p>
            )}
          </div>

          {/* Shift Info */}
          {shift && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={16} color="#E31E24" /> Informasi Shift
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-xl text-center" style={{ background: '#F8FAFC' }}>
                  <p className="text-xs text-slate-400 mb-1">Shift</p>
                  <p className="font-bold text-slate-700">{shift.name}</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background: '#F8FAFC' }}>
                  <p className="text-xs text-slate-400 mb-1">Jam Masuk</p>
                  <p className="font-bold text-slate-700">{shift.checkInTime}</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background: '#F8FAFC' }}>
                  <p className="text-xs text-slate-400 mb-1">Jam Pulang</p>
                  <p className="font-bold text-slate-700">{shift.checkOutTime}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Toleransi keterlambatan: <strong>{shift.toleranceMinutes} menit</strong>
              </p>
            </div>
          )}

          {/* Management Actions */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-4">Aksi Manajemen</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleResetFace}
                disabled={resetting || !employee.faceRegistered}
                className="btn btn-secondary"
              >
                <RotateCcw size={14} />
                {resetting ? 'Mereset...' : 'Reset Data Wajah'}
              </button>
              <button
                className="btn"
                style={{ background: '#FEF3C7', color: '#D97706' }}
                onClick={() => alert('Fitur reset password akan mengirim email ke karyawan.')}
              >
                <Mail size={14} />
                Kirim Reset Password
              </button>
              <button
                className="btn btn-danger"
                onClick={() => alert('Konfirmasi penghapusan karyawan.')}
              >
                <Trash2 size={14} />
                Nonaktifkan Karyawan
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
