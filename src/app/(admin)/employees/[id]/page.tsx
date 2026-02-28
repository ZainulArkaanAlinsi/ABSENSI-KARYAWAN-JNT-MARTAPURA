'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Smartphone,
  Calendar,
  RotateCcw,
  Trash2,
  Shield,
  Clock,
  Briefcase,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getEmployee, updateEmployee, getShifts } from '@/lib/firestore';
import type { Employee, Shift } from '@/types';
import { FaceBadge, ContractBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

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
    if (
      !employee ||
      !confirm('Reset data wajah karyawan ini? Karyawan harus mendaftar ulang wajah.')
    )
      return;
    setResetting(true);
    await updateEmployee(id, {
      faceRegistered: false,
      deviceId: undefined,
      deviceModel: undefined,
    });
    setEmployee((prev) =>
      prev
        ? {
            ...prev,
            faceRegistered: false,
            deviceId: undefined,
            deviceModel: undefined,
          }
        : null
    );
    setResetting(false);
  };

  const shift = shifts.find((s) => s.id === employee?.shiftId);

  if (loading)
    return (
      <AdminLayout title="Detail Karyawan">
        <div className="flex justify-center py-20">
          <PageLoader />
        </div>
      </AdminLayout>
    );

  if (!employee)
    return (
      <AdminLayout title="Karyawan Tidak Ditemukan">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p style={{ color: '#9BA4B4' }}>Karyawan tidak ditemukan.</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <ArrowLeft size={14} /> Kembali
          </button>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout
      title="Detail Karyawan"
      subtitle={`Profil lengkap untuk ${employee.name}`}
    >
      {/* Back Navigation */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-4"
      >
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 text-xs font-medium transition-colors"
          style={{ color: '#9BA4B4' }}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <ArrowLeft size={15} />
          </span>
          <span>Kembali ke daftar karyawan</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4 xl:col-span-4"
        >
          {/* Identity card */}
          <div
            className="rounded-2xl border p-6 text-center backdrop-blur-xl"
            style={{ backgroundColor: '#1B2A4A', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="relative mb-4 inline-block">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-xl"
                style={{ backgroundColor: '#0D1B35' }}
              >
                {employee.name?.charAt(0)?.toUpperCase()}
              </div>
              <div
                className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg border-2 backdrop-blur-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <Shield size={14} style={{ color: '#E04B3A' }} />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white">{employee.name}</h3>
            <p className="mt-1 text-sm" style={{ color: '#9BA4B4' }}>
              {employee.position || '—'} • {employee.department || '—'}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <FaceBadge registered={employee.faceRegistered} />
              <ContractBadge type={employee.contractType} />
            </div>

            <div className="mt-6 space-y-4 border-t pt-6 text-left" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              {[
                { icon: Mail, label: 'Email', value: employee.email },
                ...(employee.phone
                  ? [{ icon: Phone, label: 'Telepon', value: employee.phone }]
                  : []),
                {
                  icon: Calendar,
                  label: 'Tanggal bergabung',
                  value: employee.joinDate
                    ? format(new Date(employee.joinDate), 'dd MMMM yyyy')
                    : '—',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <item.icon size={14} style={{ color: '#3863C3' }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium" style={{ color: '#9BA4B4' }}>{item.label}</p>
                    <p className="text-sm font-medium text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account actions */}
          <div
            className="rounded-2xl border p-5 backdrop-blur-xl"
            style={{ backgroundColor: '#1B2A4A', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <h4 className="mb-3 text-sm font-semibold text-white">Manajemen Akun</h4>
            <div className="space-y-2">
              <button
                onClick={handleResetFace}
                disabled={resetting || !employee.faceRegistered}
                className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-colors disabled:opacity-40"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#9BA4B4' }}
              >
                <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
                {resetting ? 'Mereset...' : 'Reset Data Wajah'}
              </button>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#9BA4B4' }}
                onClick={() => alert('Fitur segera hadir!')}
              >
                <Mail size={14} />
                Kirim Reset Password
              </button>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-colors"
                style={{ backgroundColor: 'rgba(192,57,43,0.1)', borderColor: 'rgba(192,57,43,0.2)', color: '#C0392B' }}
                onClick={() => alert('Konfirmasi nonaktifkan karyawan.')}
              >
                <Trash2 size={14} />
                Nonaktifkan Akun
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 xl:col-span-8"
        >
          {/* Device info */}
          <div
            className="rounded-2xl border p-5 backdrop-blur-xl"
            style={{ backgroundColor: '#1B2A4A', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: '#0D1B35' }}
              >
                <Smartphone size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Perangkat Terdaftar</h4>
                <p className="text-xs" style={{ color: '#9BA4B4' }}>Perangkat untuk presensi wajah</p>
              </div>
            </div>

            {employee.deviceModel ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border p-3" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-[10px] font-medium" style={{ color: '#9BA4B4' }}>Model Perangkat</p>
                  <p className="mt-1 text-sm text-white">{employee.deviceModel}</p>
                </div>
                <div className="rounded-xl border p-3" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-[10px] font-medium" style={{ color: '#9BA4B4' }}>Device ID</p>
                  <p className="mt-1 break-all font-mono text-xs text-white">
                    {employee.deviceId || '—'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <Smartphone size={32} style={{ color: '#9BA4B4', opacity: 0.5 }} />
                <p className="text-sm font-medium" style={{ color: '#9BA4B4' }}>Belum ada perangkat terdaftar</p>
                <p className="text-xs" style={{ color: '#9BA4B4', opacity: 0.7 }}>
                  Perangkat akan muncul setelah karyawan melakukan presensi pertama.
                </p>
              </div>
            )}
          </div>

          {/* Shift info */}
          {shift && (
            <div
              className="rounded-2xl border p-5 backdrop-blur-xl"
              style={{ backgroundColor: '#1B2A4A', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: '#3863C3' }}
                >
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Jadwal Shift</h4>
                  <p className="text-xs" style={{ color: '#9BA4B4' }}>Detail jadwal kerja dan toleransi</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border p-3 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-[10px] font-medium" style={{ color: '#9BA4B4' }}>Nama Shift</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: '#3863C3' }}>{shift.name}</p>
                </div>
                <div className="rounded-xl border p-3 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-[10px] font-medium" style={{ color: '#9BA4B4' }}>Jam Masuk</p>
                  <p className="mt-1 text-sm text-white">{shift.checkInTime}</p>
                </div>
                <div className="rounded-xl border p-3 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-[10px] font-medium" style={{ color: '#9BA4B4' }}>Jam Pulang</p>
                  <p className="mt-1 text-sm text-white">{shift.checkOutTime}</p>
                </div>
              </div>

              <div
                className="mt-4 flex items-center justify-between rounded-xl px-4 py-3"
                style={{ backgroundColor: 'rgba(56,99,195,0.1)', border: '1px solid rgba(56,99,195,0.2)' }}
              >
                <span className="text-xs font-medium" style={{ color: '#3863C3' }}>Toleransi Keterlambatan</span>
                <span className="text-sm font-semibold text-white">{shift.toleranceMinutes} menit</span>
              </div>
            </div>
          )}

          {/* Future section */}
          <div
            className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center backdrop-blur-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <Briefcase size={36} style={{ color: '#9BA4B4', opacity: 0.5 }} />
            <p className="text-sm font-medium" style={{ color: '#9BA4B4' }}>Riwayat Absensi</p>
            <p className="max-w-sm text-xs" style={{ color: '#9BA4B4', opacity: 0.7 }}>
              Fitur riwayat absensi detail akan segera hadir.
            </p>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}