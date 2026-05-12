'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { getEmployee, getAttendanceByRange } from '@/lib/firestore';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { format, subDays, parseISO } from 'date-fns';
import { id as dateFnsId } from 'date-fns/locale';
import { safeFormatTime } from '@/utils/dateFormatters';
import {
  ArrowLeft, Mail, Briefcase, Calendar, AlertTriangle,
  XCircle, Clock, MapPin, Building, Smartphone,
  ExternalLink, ShieldCheck, Fingerprint,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { Employee, AttendanceRecord } from '@/types';

const toDate = (val: any): Date => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === 'object' && val !== null) {
    if ('seconds' in val) return new Date(val.seconds * 1000);
    if ('toDate' in val && typeof val.toDate === 'function') return val.toDate();
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};

// ─── Status chip ──────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  present:  { label: 'Hadir',  dot: 'bg-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  late:     { label: 'Telat',  dot: 'bg-amber-400',   bg: 'bg-amber-50',   text: 'text-amber-700'   },
  absent:   { label: 'Absen',  dot: 'bg-red-400',     bg: 'bg-red-50',     text: 'text-red-600'     },
  leave:    { label: 'Izin',   dot: 'bg-slate-400',   bg: 'bg-slate-100',  text: 'text-slate-600'   },
  overtime: { label: 'Lembur', dot: 'bg-violet-400',  bg: 'bg-violet-50',  text: 'text-violet-700'  },
};

function StatusChip({ status }: { status: string }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG.absent;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function EmployeeDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id: employeeId } = use(params);

  const [employee,   setEmployee]   = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!employeeId) return;
      setLoading(true);
      try {
        const emp = await getEmployee(employeeId);
        setEmployee(emp);
        if (emp) {
          const records = await getAttendanceByRange(
            format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            format(new Date(), 'yyyy-MM-dd'),
            emp.uid,
          );
          setAttendance(records);
        }
      } catch (err) {
        console.error('Gagal memuat detail karyawan', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <PageLoader />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-slate-700">Karyawan Tidak Ditemukan</p>
          <p className="text-[12px] text-slate-400 mt-1">ID tidak ditemukan dalam sistem JNE</p>
        </div>
        <Link href="/employees" className="flex items-center gap-2 h-9 px-4 bg-slate-100 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-200 transition-all">
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  const totalHadir      = attendance.filter(a => ['present', 'late'].includes(a.status)).length;
  const totalTelat      = attendance.filter(a => a.status === 'late').length;
  const totalAbsen      = attendance.filter(a => a.status === 'absent').length;
  const recentAttendance = attendance.slice(0, 10);

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/employees"
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-all shrink-0"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {employee.employeeId}
            </p>
            <h1 className="text-[22px] font-black text-slate-800 tracking-tight leading-none">
              {employee.name}
            </h1>
          </div>
        </div>

        <Link
          href={`/employees/${employee.id}/edit`}
          className="flex items-center gap-2 h-9 px-4 bg-white border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-600 transition-all shrink-0"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          Edit Profil
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── LEFT: Profile ── */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center text-center"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-2xl bg-emerald-100 overflow-hidden">
                {employee.photoUrl ? (
                  <Image src={employee.photoUrl} alt={employee.name} width={96} height={96} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-emerald-700 text-stats font-black">
                    {employee.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl border-2 border-white flex items-center justify-center ${employee.faceRegistered ? 'bg-emerald-500' : 'bg-red-400'}`}>
                {employee.faceRegistered
                  ? <ShieldCheck size={14} className="text-white" />
                  : <XCircle size={14} className="text-white" />
                }
              </div>
            </div>

            <h2 className="text-[18px] font-black text-slate-800 tracking-tight">{employee.name}</h2>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">{employee.position}</p>

            {/* Mini stats */}
            <div className="w-full grid grid-cols-3 gap-2 mt-5">
              {[
                { label: 'Hadir',  val: totalHadir, color: 'text-emerald-600' },
                { label: 'Telat',  val: totalTelat, color: 'text-amber-600'   },
                { label: 'Absen',  val: totalAbsen, color: 'text-red-500'     },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-xl py-2.5 text-center border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                  <p className={`text-[20px] font-black mt-0.5 ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl border border-slate-100 p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Informasi Detail</p>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: Building,    label: 'Departemen', value: employee.department  },
                { icon: Briefcase,   label: 'Jabatan',    value: employee.position    },
                { icon: Mail,        label: 'Email',      value: employee.email       },
                { icon: Calendar,    label: 'Bergabung',  value: employee.joinDate ? format(toDate(employee.joinDate), 'dd MMM yyyy') : '—' },
                { icon: Smartphone,  label: 'Perangkat',  value: (employee as any).deviceModel || 'Belum terhubung' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon size={13} className="text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-[12px] font-semibold text-slate-700 truncate">{item.value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Biometric card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 14px -4px rgba(16,185,129,0.4)' }}
          >
            <Fingerprint size={60} className="absolute -bottom-3 -right-3 opacity-20" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">Biometric Status</p>
                <span className="px-2 py-0.5 bg-white/20 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                  {employee.faceRegistered ? 'Aktif' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${employee.faceRegistered ? 'bg-white animate-pulse' : 'bg-red-300'}`} />
                <p className="text-[13px] font-bold">
                  {employee.faceRegistered ? 'Face ID Terdaftar' : 'Belum Mendaftar'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT: Attendance Log ── */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-desc font-bold text-slate-800">Log Kehadiran</p>
                <p className="text-[11px] text-slate-400 mt-0.5">10 catatan terakhir (30 hari)</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-500">
                <Clock size={12} />
                30 Hari
              </div>
            </div>

            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[1fr_90px_90px_110px_100px] px-5 py-2.5 bg-slate-50 border-b border-slate-100">
              {['Tanggal', 'Masuk', 'Keluar', 'Lokasi', 'Status'].map(h => (
                <p key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</p>
              ))}
            </div>

            <div className="divide-y divide-slate-100">
              <AnimatePresence>
                {recentAttendance.length === 0 ? (
                  <div className="py-12 flex flex-col items-center gap-2">
                    <Clock size={24} className="text-slate-200" />
                    <p className="text-[12px] font-bold text-slate-400">Belum ada riwayat absensi</p>
                  </div>
                ) : recentAttendance.map((record, i) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_90px_90px_110px_100px] items-center px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    {/* Date */}
                    <div>
                      <p className="text-desc font-bold text-slate-800">
                        {format(toDate(record.date), 'dd MMM yyyy', { locale: dateFnsId })}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {format(toDate(record.date), 'EEEE', { locale: dateFnsId })}
                      </p>
                    </div>

                    {/* Check-in */}
                    <p className="hidden sm:block text-[12px] font-semibold text-slate-600 tabular-nums">
                      {safeFormatTime(record.checkIn?.time)}
                    </p>

                    {/* Check-out */}
                    <p className="hidden sm:block text-[12px] font-medium text-slate-400 tabular-nums">
                      {safeFormatTime(record.checkOut?.time)}
                    </p>

                    {/* Location */}
                    <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 group/loc">
                      <MapPin size={10} className="shrink-0" />
                      <span className="truncate">
                        {record.checkIn ? `${record.checkIn.distance.toFixed(0)}m` : '—'}
                      </span>
                      {record.checkIn && (
                        <a
                          href={`https://www.google.com/maps?q=${record.checkIn.latitude},${record.checkIn.longitude}`}
                          target="_blank" rel="noopener noreferrer"
                          className="opacity-0 group/loc:opacity-100 transition-opacity"
                        >
                          <ExternalLink size={10} className="text-emerald-500" />
                        </a>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <StatusChip status={record.status} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
