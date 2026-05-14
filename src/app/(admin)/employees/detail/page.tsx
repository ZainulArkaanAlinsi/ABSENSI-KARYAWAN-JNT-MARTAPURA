'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, limit, orderBy } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/firestore';
import {
  ArrowLeft, Mail, Phone, Briefcase, Building2, ShieldCheck,
  Calendar, Clock, AlertCircle, Download, Fingerprint, Pencil,
  CheckCircle2, XCircle, MapPin, Loader2, Camera, ImageOff, X, LogIn, LogOut,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as dateFnsId } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { FaceBadge } from '@/components/ui/Badge';
import { safeFormatTime } from '@/utils/dateFormatters';
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
  overtime: { label: 'Lembur', dot: 'bg-violet-400',  bg: 'bg-violet-50',  text: 'text-violet-700'  },
  leave:    { label: 'Izin',   dot: 'bg-slate-400',   bg: 'bg-slate-100',  text: 'text-slate-600'   },
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

// ─── Info item ────────────────────────────────────────────────
function InfoItem({ icon: Icon, label, value, highlight = false }: {
  icon: React.ElementType; label: string; value?: string | null; highlight?: boolean;
}) {
  return (
    <div className={`p-3.5 rounded-xl border transition-all ${
      highlight ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'
    }`}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={13} className={highlight ? 'text-emerald-500' : 'text-slate-400'} />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-desc font-bold text-slate-800">{value || '—'}</p>
    </div>
  );
}

export default function EmployeeDetailPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const uid          = searchParams.get('id');

  const [employee,   setEmployee]   = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [preview,    setPreview]    = useState<{ url: string; label: string; date: string } | null>(null);

  useEffect(() => {
    if (!uid) return;

    // FIX: previously read from 'employees' (wrong collection that doesn't
    // exist). Real employee docs live in COLLECTIONS.USERS keyed by uid.
    const unsubEmp = onSnapshot(doc(db, COLLECTIONS.USERS, uid), snap => {
      if (snap.exists()) setEmployee({ id: snap.id, ...snap.data() } as Employee);
      setLoading(false);
    });

    const attQuery = query(
      collection(db, 'attendance'),
      where('userId', '==', uid),
      orderBy('date', 'desc'),
      limit(30),
    );
    const unsubAtt = onSnapshot(attQuery, snap => {
      setAttendance(snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord)));
    });

    return () => { unsubEmp(); unsubAtt(); };
  }, [uid]);

  const stats = useMemo(() => {
    if (!attendance.length) return { rate: 0, late: 0 };
    const present = attendance.filter(r => ['present', 'late', 'overtime'].includes(r.status)).length;
    const late    = attendance.filter(r => r.status === 'late').length;
    return { rate: Math.round((present / attendance.length) * 100), late };
  }, [attendance]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 size={28} className="animate-spin text-emerald-500" />
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Memuat profil...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <AlertCircle size={32} className="text-slate-300" />
        <p className="text-[13px] font-bold text-slate-600">Data karyawan tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-all shrink-0"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {employee.employeeId} · {employee.isOnline ? '🟢 Online' : 'Offline'}
            </p>
            <h1 className="text-[22px] font-black text-slate-800 tracking-tight leading-none">{employee.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/employees/edit?id=${uid}`}
            className="flex items-center gap-2 h-9 px-4 rounded-xl text-[12px] font-bold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              boxShadow: '0 4px 14px -4px rgba(16,185,129,0.4)',
            }}
          >
            <Pencil size={13} />
            Edit Profil
          </Link>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 h-9 px-4 bg-white border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-600 transition-all"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <Download size={14} />
            Export
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── LEFT: Profile ── */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-white rounded-2xl p-6 border border-slate-100 flex flex-col items-center text-center"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-stats font-black">
                {employee.name.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2">
                <FaceBadge registered={employee.faceRegistered} />
              </div>
            </div>
            <h3 className="text-[18px] font-black text-slate-800 tracking-tight">{employee.name}</h3>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">{employee.position}</p>

            <div className="w-full grid grid-cols-2 gap-3 mt-5">
              <div className="bg-slate-50 rounded-xl py-3 text-center border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kehadiran</p>
                <p className="text-[22px] font-black text-emerald-600 mt-0.5">{stats.rate}%</p>
              </div>
              <div className="bg-slate-50 rounded-xl py-3 text-center border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telat</p>
                <p className="text-[22px] font-black text-amber-600 mt-0.5">{stats.late}x</p>
              </div>
            </div>
          </motion.div>

          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl p-5 border border-slate-100"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Informasi Detail</p>
            <div className="flex flex-col gap-2.5">
              <InfoItem icon={Mail}      label="Email"      value={employee.email}      />
              <InfoItem icon={Phone}     label="Telepon"    value={employee.phone}      />
              <InfoItem icon={Building2} label="Departemen" value={employee.department} highlight />
              <InfoItem icon={Briefcase} label="Jabatan"    value={employee.position}   />
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT: Attendance + Biometric ── */}
        <div className="lg:col-span-8 flex flex-col gap-4">

          {/* Attendance history */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-desc font-bold text-slate-800">Riwayat Absensi</p>
                <p className="text-[11px] text-slate-400 mt-0.5">20 record terakhir</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-500">
                <Calendar size={12} />
                Last 20
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_100px_90px_100px] px-5 py-2.5 bg-slate-50 border-b border-slate-100">
              {['Tanggal', 'Check-in', 'Status', 'Lokasi'].map(h => (
                <p key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</p>
              ))}
            </div>

            <div className="divide-y divide-slate-100">
              {attendance.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-[1fr_100px_90px_100px] items-center px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                >
                  <p className="text-desc font-bold text-slate-800">
                    {format(toDate(log.date), 'dd MMM yyyy')}
                  </p>
                  <p className="text-[12px] font-semibold text-slate-500 tabular-nums">
                    {typeof log.checkIn?.time === 'string' ? log.checkIn.time.slice(0, 5) : '—'}
                  </p>
                  <StatusChip status={log.status} />
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MapPin size={10} className="shrink-0" />
                    Martapura
                  </div>
                </motion.div>
              ))}
            </div>

            {attendance.length === 0 && (
              <div className="py-12 flex flex-col items-center gap-2">
                <AlertCircle size={24} className="text-slate-200" />
                <p className="text-[12px] font-bold text-slate-400">Belum ada riwayat absensi</p>
              </div>
            )}
          </motion.div>

          {/* Biometric + Access row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="bg-white rounded-2xl p-5 border border-slate-100"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Fingerprint size={20} className="text-emerald-600" />
                </div>
                <p className="text-desc font-bold text-slate-800">Biometrik</p>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
                Status pendaftaran face recognition untuk personel ini.
              </p>
              <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between border border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className={employee.faceRegistered ? 'text-emerald-500' : 'text-slate-300'} />
                  <span className="text-[12px] font-bold text-slate-800">Face ID</span>
                </div>
                {employee.faceRegistered
                  ? <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600"><CheckCircle2 size={13} /> Terdaftar</span>
                  : <span className="flex items-center gap-1 text-[11px] font-bold text-red-500"><XCircle size={13} /> Belum</span>}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="bg-white rounded-2xl p-5 border border-slate-100"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                  <Clock size={20} className="text-sky-600" />
                </div>
                <p className="text-desc font-bold text-slate-800">Jam Kerja</p>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
                Skema jam kerja yang diterapkan untuk karyawan ini.
              </p>
              <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skema Aktif</p>
                <p className="text-desc font-bold text-slate-800 mt-1">{(employee as any).jamKerjaName ?? 'Reguler'}</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ── PHOTO GALLERY ── */}
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

  const dateLabelFull = (d: any) => {
    try {
      const dt = typeof d === 'string' ? new Date(d) : (d?.toDate?.() ?? new Date(d));
      return format(dt, 'EEEE, dd MMM yyyy', { locale: dateFnsId });
    } catch { return '—'; }
  };
  const dateLabelShort = (d: any) => {
    try {
      const dt = typeof d === 'string' ? new Date(d) : (d?.toDate?.() ?? new Date(d));
      return format(dt, 'dd MMM yyyy', { locale: dateFnsId });
    } catch { return '—'; }
  };
  const dayName = (d: any) => {
    try {
      const dt = typeof d === 'string' ? new Date(d) : (d?.toDate?.() ?? new Date(d));
      return format(dt, 'EEEE', { locale: dateFnsId });
    } catch { return '—'; }
  };

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
              Foto muncul di sini setiap kali karyawan absen masuk atau keluar.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
          {withPhotos.map((r) => {
            const ci = pickPhotoUrl(r.checkIn, (r as any).checkInPhotoUrl);
            const co = pickPhotoUrl(r.checkOut, (r as any).checkOutPhotoUrl);
            return (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden flex flex-col"
              >
                <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[12px] font-black text-slate-800 truncate">{dayName(r.date)}</p>
                    <p className="text-[10px] font-semibold text-slate-400">{dateLabelShort(r.date)}</p>
                  </div>
                  <StatusChip status={r.status} />
                </div>

                <div className="grid grid-cols-2 gap-px bg-slate-200 mt-1">
                  <PhotoTile
                    side="in"
                    url={ci}
                    time={safeFormatTime(r.checkIn?.time)}
                    onClick={ci ? () => onPreview({ url: ci, label: 'Absen Masuk', date: dateLabelFull(r.date) }) : undefined}
                  />
                  <PhotoTile
                    side="out"
                    url={co}
                    time={safeFormatTime(r.checkOut?.time)}
                    onClick={co ? () => onPreview({ url: co, label: 'Absen Keluar', date: dateLabelFull(r.date) }) : undefined}
                  />
                </div>

                {r.checkIn && (
                  <div className="px-4 py-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 border-t border-slate-100 bg-white">
                    <MapPin size={11} className="shrink-0" />
                    <span>{(r.checkIn.distance ?? 0).toFixed(0)}m dari kantor</span>
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
  side, url, time, onClick,
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
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tidak ada foto</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
      <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md backdrop-blur-md ${accent}`}>
        <Icon size={9} strokeWidth={3} />
        <span className="text-[8px] font-black tracking-widest">{label}</span>
      </div>
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
