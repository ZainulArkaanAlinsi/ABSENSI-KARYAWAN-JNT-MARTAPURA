'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { handleListenerError, isBenignListenerError } from '@/lib/firestoreListener';
import { AlertCircle, Clock3, Edit3, Filter, RefreshCw, Search, ShieldCheck, TriangleAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { db } from '@/lib/firebase';
import type { AttendanceStatus } from '@/types';

type EditRequestStatus = 'pending' | 'approved' | 'rejected';

interface EditRequestDoc {
  id: string;
  attendanceId: string;
  userId: string;
  userName: string;
  reason: string;
  status: EditRequestStatus;
  requestedChanges?: {
    checkIn?: string;
    checkOut?: string;
    status?: AttendanceStatus;
  };
  createdAt?: unknown;
  updatedAt?: unknown;
}

const STATUS_META: Record<EditRequestStatus, { label: string; className: string; dot: string }> = {
  pending: {
    label: 'Menunggu Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  approved: {
    label: 'Disetujui',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Ditolak',
    className: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
};

function toDate(value: unknown): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === 'object') {
    const v = value as { seconds?: number; toDate?: () => Date };
    if (typeof v.seconds === 'number') return new Date(v.seconds * 1000);
    if (typeof v.toDate === 'function') return v.toDate();
  }
  const parsed = new Date(value as string | number);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function getStatusFilterLabel(filter: string) {
  switch (filter) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Semua';
  }
}

export default function EditRequestsPage() {
  const [requests, setRequests] = useState<EditRequestDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | EditRequestStatus>('all');

  useEffect(() => {
    const q = query(collection(db, 'edit_requests'), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as EditRequestDoc));
        setRequests(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        handleListenerError(err, 'edit-requests');
        if (!isBenignListenerError(err)) {
          setError('Gagal memuat edit requests. Periksa koneksi atau aturan Firestore.');
        }
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchSearch =
        !q ||
        request.userName?.toLowerCase().includes(q) ||
        request.userId?.toLowerCase().includes(q) ||
        request.attendanceId?.toLowerCase().includes(q) ||
        request.reason?.toLowerCase().includes(q);

      const matchFilter = filter === 'all' || request.status === filter;
      return matchSearch && matchFilter;
    });
  }, [requests, search, filter]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    };
  }, [requests]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-red-600 dark:border-red-500/20 dark:bg-red-500/10">
              <Edit3 size={12} />
              Edit Request Inbox
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Koreksi Absensi
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Review permintaan perubahan data absensi yang dikirim oleh karyawan. Semua perubahan tetap mengikuti struktur Firestore yang sudah ada.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-950">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Update Terakhir</p>
              <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                {formatDistanceToNow(new Date(), { addSuffix: true, locale: localeId })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-red-600 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-red-700"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Request" value={stats.total} icon={Edit3} accent="text-slate-700" accentBg="bg-slate-100" />
        <StatCard label="Pending" value={stats.pending} icon={Clock3} accent="text-amber-600" accentBg="bg-amber-100" />
        <StatCard label="Approved" value={stats.approved} icon={ShieldCheck} accent="text-emerald-600" accentBg="bg-emerald-100" />
        <StatCard label="Rejected" value={stats.rejected} icon={TriangleAlert} accent="text-red-600" accentBg="bg-red-100" />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, NIK, atau alasan koreksi..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-red-400 focus:bg-white dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
              Semua
            </FilterPill>
            <FilterPill active={filter === 'pending'} onClick={() => setFilter('pending')}>
              Pending
            </FilterPill>
            <FilterPill active={filter === 'approved'} onClick={() => setFilter('approved')}>
              Approved
            </FilterPill>
            <FilterPill active={filter === 'rejected'} onClick={() => setFilter('rejected')}>
              Rejected
            </FilterPill>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">
            Queue {getStatusFilterLabel(filter)} <span className="ml-2 text-slate-400">({filtered.length})</span>
          </p>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5">
              <Edit3 size={22} />
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">Belum ada data yang cocok</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Coba ubah filter atau kata kunci pencarian. Jika koleksi masih kosong, artinya belum ada request edit yang dikirim dari mobile.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {filtered.map((request) => {
              const meta = STATUS_META[request.status];
              return (
                <article key={request.id} className="p-5 transition-colors hover:bg-slate-50/80 dark:hover:bg-white/5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-black text-slate-900 dark:text-white">
                          {request.userName}
                        </h3>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${meta.className}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                        <span><span className="font-bold text-slate-700 dark:text-slate-200">Attendance ID:</span> {request.attendanceId}</span>
                        <span><span className="font-bold text-slate-700 dark:text-slate-200">User ID:</span> {request.userId}</span>
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Alasan Koreksi</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                          {request.reason}
                        </p>
                      </div>
                    </div>

                    <div className="w-full lg:w-72">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Requested Changes</p>
                        <div className="mt-3 space-y-2 text-sm">
                          <ChangeRow label="Check In" value={request.requestedChanges?.checkIn} />
                          <ChangeRow label="Check Out" value={request.requestedChanges?.checkOut} />
                          <ChangeRow label="Status" value={request.requestedChanges?.status} />
                        </div>
                      </div>

                      <p className="mt-3 text-[11px] font-medium text-slate-400">
                        Dibuat {request.createdAt ? formatDistanceToNow(toDate(request.createdAt), { addSuffix: true, locale: localeId }) : 'baru saja'}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  accentBg,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
  accentBg: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentBg}`}>
          <Icon className={`h-5 w-5 ${accent}`} />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-black tracking-tight ${accent}`}>{value}</p>
    </div>
  );
}

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition-all ${
        active
          ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
          : 'border border-slate-200 bg-white text-slate-500 hover:border-red-300 hover:text-red-600 dark:border-white/10 dark:bg-slate-950'
      }`}
    >
      {children}
    </button>
  );
}

function ChangeRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <span className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">
        {value ?? '—'}
      </span>
    </div>
  );
}
