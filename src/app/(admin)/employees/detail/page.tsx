'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { getEmployee, updateEmployee, getJamKerjas } from '@/lib/firestore';
import type { Employee, JamKerja } from '@/types';

import { FaceBadge, ContractBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

function EmployeeDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [jamKerjas, setJamKerjas] = useState<JamKerja[]>([]);
  const [loading, setLoading] = useState(true);

  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    Promise.all([getEmployee(id), getJamKerjas()]).then(([emp, jk]) => {
      setEmployee(emp);
      setJamKerjas(jk);
      setLoading(false);
    });
  }, [id]);

  const handleResetFace = async () => {
    if (
      !id ||
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

  const jamKerja = jamKerjas.find((s) => s.id === employee?.jamKerjaId);

  if (loading)
    return (
      <AdminLayout title="Detail Karyawan">
        <div className="flex justify-center py-20">
          <PageLoader />
        </div>
      </AdminLayout>
    );

  if (!id || !employee)
    return (
      <AdminLayout title="Karyawan Tidak Ditemukan">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p style={{ color: '#9BA4B4' }}>Karyawan tidak ditemukan.</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 transition-colors"
            style={{ backgroundColor: 'white', borderColor: 'rgba(0,0,0,0.1)' }}
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
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors bg-white border-slate-200"
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
            className="rounded-xl border p-6 text-center bg-white border-slate-100 shadow-sm"
          >
            <div className="relative mb-4 inline-block">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-xl text-3xl font-bold text-white shadow-lg bg-[#005596]"
              >
                {employee.name?.charAt(0)?.toUpperCase()}
              </div>
              <div
                className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-white shadow-sm"
              >
                <Shield size={14} className="text-[#E31E24]" />
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-900">{employee.name}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {employee.position || '—'} • {employee.department || '—'}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <FaceBadge registered={employee.faceRegistered} />
              <ContractBadge type={employee.contractType} />
            </div>

            <div className="mt-6 space-y-4 border-t pt-6 text-left border-slate-100">
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
                    <item.icon size={14} className="text-[#005596]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-bold text-slate-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account actions */}
          <div
            className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <h4 className="mb-3 text-xs font-black text-slate-400 uppercase tracking-widest">Manajemen Akun</h4>
            <div className="space-y-2">
              <button
                onClick={handleResetFace}
                disabled={resetting || !employee.faceRegistered}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-[#E31E24]/5 hover:text-[#E31E24] disabled:opacity-40"
              >
                <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
                {resetting ? 'Mereset...' : 'Reset Data Wajah'}
              </button>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-[#005596]/5 hover:text-[#005596]"
                onClick={() => alert('Fitur segera hadir!')}
              >
                <Mail size={14} />
                Kirim Reset Password
              </button>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-bold text-[#E31E24] transition-all hover:bg-red-100"
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
            className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#005596]/10 text-[#005596]"
              >
                <Smartphone size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Perangkat Terdaftar</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perangkat untuk presensi wajah</p>
              </div>
            </div>

            {employee.deviceModel ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model Perangkat</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{employee.deviceModel}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Device ID</p>
                  <p className="mt-1 break-all font-mono text-[10px] font-bold text-slate-900">
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

          {/* Jam Kerja info */}
          {jamKerja && (
            <div
              className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E31E24]/10 text-[#E31E24]"
                >
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Jadwal Jam Kerja</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detail jadwal kerja dan toleransi</p>
                </div>
              </div>


              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit</p>
                  <p className="mt-1 text-sm font-black text-[#E31E24]">{jamKerja.name}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jam Masuk</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{jamKerja.checkInTime}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jam Pulang</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{jamKerja.checkOutTime}</p>
                </div>
              </div>


              <div
                className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 bg-[#E31E24]/5 border border-[#E31E24]/10"
              >
                <span className="text-xs font-black text-[#E31E24] uppercase tracking-tight">Toleransi Keterlambatan</span>
                <span className="text-sm font-black text-slate-900">{jamKerja.toleranceMinutes} menit</span>
              </div>

            </div>
          )}

          <div
            className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 p-10 text-center bg-slate-50/50"
          >
            <Briefcase size={36} className="text-slate-200" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Riwayat Absensi</p>
            <p className="max-w-sm text-xs" style={{ color: '#9BA4B4', opacity: 0.7 }}>
              Fitur riwayat absensi detail akan segera hadir.
            </p>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default function EmployeeDetailPage() {
  return (
    <Suspense fallback={
      <AdminLayout title="Detail Karyawan">
        <div className="flex justify-center py-20">
          <PageLoader />
        </div>
      </AdminLayout>
    }>
      <EmployeeDetailContent />
    </Suspense>
  );
}
