'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { getEmployee, getAttendanceByRange } from '@/lib/firestore';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { format, subDays } from 'date-fns';
import { id as dateFnsId } from 'date-fns/locale';
import { safeFormatTime } from '@/utils/dateFormatters';
import {
  ArrowLeft, Mail, Briefcase, Calendar, AlertTriangle,
  XCircle, Clock, MapPin, Building, Smartphone,
  ExternalLink, ShieldCheck, Fingerprint,
  Camera, ImageOff, X, LogIn, LogOut,
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
  const [preview,    setPreview]    = useState<{ url: string; label: string; date: string } | null>(null);

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

      {/* ── PHOTO GALLERY — captured faces per day ── */}
      <AttendancePhotoGallery
        records={attendance}
        onPreview={(p) => setPreview(p)}
      />

      {/* ── FULL-SIZE PREVIEW MODAL ── */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{preview.label}</p>
                  <p className="text-[14px] font-black text-slate-800 mt-0.5">{preview.date}</p>
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.url}
                  alt={preview.label}
                  className="w-full max-h-[70vh] object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Photo Gallery ───────────────────────────────────────────────
interface PreviewState { url: string; label: string; date: string; }

function pickPhotoUrl(side: { photoUrl?: string | null } | null | undefined, fallback?: string | null): string | null {
  return side?.photoUrl ?? fallback ?? null;
}

function AttendancePhotoGallery({
  records,
  onPreview,
}: {
  records: AttendanceRecord[];
  onPreview: (p: PreviewState) => void;
}) {
  const withPhotos = records
    .filter((r) => {
      const ci = pickPhotoUrl(r.checkIn, (r as any).checkInPhotoUrl);
      const co = pickPhotoUrl(r.checkOut, (r as any).checkOutPhotoUrl);
      return ci || co;
    })
    .slice(0, 12);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #E31E24, #A8151A)' }}
          >
            <Camera size={16} />
          </div>
          <div>
            <p className="text-desc font-bold text-slate-800">Galeri Foto Absensi</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Foto wajah saat absen masuk &amp; keluar (klik untuk perbesar)
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-500">
          {withPhotos.length} hari
        </span>
      </div>

      {withPhotos.length === 0 ? (
        <div className="px-5 py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <ImageOff size={22} className="text-slate-300" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-500">Belum ada foto absensi</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Foto akan muncul di sini setiap kali karyawan melakukan absen masuk atau keluar.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
          {withPhotos.map((r) => {
            const ci = pickPhotoUrl(r.checkIn, (r as any).checkInPhotoUrl);
            const co = pickPhotoUrl(r.checkOut, (r as any).checkOutPhotoUrl);
            const dateLabel = format(toDate(r.date), 'EEEE, dd MMM yyyy', { locale: dateFnsId });
            const shortDate = format(toDate(r.date), 'dd MMM yyyy', { locale: dateFnsId });

            return (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden flex flex-col"
              >
                <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[12px] font-black text-slate-800 truncate">
                      {format(toDate(r.date), 'EEEE', { locale: dateFnsId })}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400">
                      {format(toDate(r.date), 'dd MMM yyyy', { locale: dateFnsId })}
                    </p>
                  </div>
                  <StatusChip status={r.status} />
                </div>

                <div className="grid grid-cols-2 gap-px bg-slate-200 mt-1">
                  <PhotoTile
                    side="in"
                    url={ci}
                    time={safeFormatTime(r.checkIn?.time)}
                    onClick={ci ? () => onPreview({ url: ci, label: 'Absen Masuk', date: dateLabel }) : undefined}
                  />
                  <PhotoTile
                    side="out"
                    url={co}
                    time={safeFormatTime(r.checkOut?.time)}
                    onClick={co ? () => onPreview({ url: co, label: 'Absen Keluar', date: dateLabel }) : undefined}
                  />
                </div>

                {r.checkIn && (
                  <div className="px-4 py-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 border-t border-slate-100 bg-white">
                    <MapPin size={11} className="shrink-0" />
                    <span>{(r.checkIn.distance ?? 0).toFixed(0)}m dari kantor</span>
                    <span className="mx-1.5 text-slate-200">•</span>
                    <span className="truncate">{shortDate}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function PhotoTile({
  side,
  url,
  time,
  onClick,
}: {
  side: 'in' | 'out';
  url: string | null;
  time: string;
  onClick?: () => void;
}) {
  const isIn = side === 'in';
  const Icon = isIn ? LogIn : LogOut;
  const label = isIn ? 'MASUK' : 'KELUAR';
  const accent = isIn ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!url}
      className="relative aspect-square bg-white group disabled:cursor-default"
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`Foto ${label}`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-active:scale-100"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-50">
          <ImageOff size={20} className="text-slate-300" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            Tidak ada foto
          </span>
        </div>
      )}

      {/* gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

      {/* badge */}
      <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md backdrop-blur-md ${accent}`}>
        <Icon size={9} strokeWidth={3} />
        <span className="text-[8px] font-black tracking-widest">{label}</span>
      </div>

      {/* time */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white">
        <span className="text-[11px] font-black tabular-nums drop-shadow">{time || '—'}</span>
        {url && (
          <span className="text-[8px] font-bold uppercase tracking-wider opacity-80 drop-shadow">
            Klik perbesar
          </span>
        )}
      </div>
    </button>
  );
}
