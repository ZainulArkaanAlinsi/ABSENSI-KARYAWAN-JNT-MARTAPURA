'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { handleListenerError, isBenignListenerError } from '@/lib/firestoreListener';
import { AlertCircle, BellRing, Filter, Search, ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { db } from '@/lib/firebase';

type LoginIssueStatus = 'pending' | 'in_progress' | 'resolved';

interface LoginIssueDoc {
  id: string;
  name: string;
  emailOrEmployeeId: string;
  description: string;
  phone?: string;
  status: LoginIssueStatus;
  createdAt?: unknown;
}

const STATUS_META: Record<LoginIssueStatus, { label: string; className: string; dot: string; icon: React.ElementType }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: TriangleAlert,
  },
  in_progress: {
    label: 'Diproses',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    icon: ShieldAlert,
  },
  resolved: {
    label: 'Selesai',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: ShieldCheck,
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

export default function LoginIssuesPage() {
  const [issues, setIssues] = useState<LoginIssueDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | LoginIssueStatus>('all');

  useEffect(() => {
    const q = query(collection(db, 'login_issues'), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LoginIssueDoc));
        setIssues(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        handleListenerError(err, 'login-issues');
        if (!isBenignListenerError(err)) {
          setError('Gagal memuat login issues. Periksa koneksi atau rules Firestore.');
        }
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return issues.filter((issue) => {
      const matchSearch =
        !q ||
        issue.name?.toLowerCase().includes(q) ||
        issue.emailOrEmployeeId?.toLowerCase().includes(q) ||
        issue.description?.toLowerCase().includes(q) ||
        issue.phone?.toLowerCase().includes(q);

      const matchFilter = filter === 'all' || issue.status === filter;
      return matchSearch && matchFilter;
    });
  }, [issues, search, filter]);

  const stats = useMemo(() => {
    return {
      total: issues.length,
      pending: issues.filter((i) => i.status === 'pending').length,
      inProgress: issues.filter((i) => i.status === 'in_progress').length,
      resolved: issues.filter((i) => i.status === 'resolved').length,
    };
  }, [issues]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-red-600 dark:border-red-500/20 dark:bg-red-500/10">
              <BellRing size={12} />
              Login Issues Inbox
            </div>
            <h1 className="editorial-heading text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Inbox Kendala Login
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Semua laporan login dari layar mobile masuk ke sini. Fokus pada respons cepat dan status merah saat ada error.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-950">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Total Laporan</p>
            <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
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
        <StatCard label="Total" value={stats.total} icon={BellRing} accent="text-slate-700" accentBg="bg-slate-100" />
        <StatCard label="Pending" value={stats.pending} icon={TriangleAlert} accent="text-amber-600" accentBg="bg-amber-100" />
        <StatCard label="Diproses" value={stats.inProgress} icon={ShieldAlert} accent="text-blue-600" accentBg="bg-blue-100" />
        <StatCard label="Selesai" value={stats.resolved} icon={ShieldCheck} accent="text-emerald-600" accentBg="bg-emerald-100" />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, NIK, atau isi laporan..."
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
            <FilterPill active={filter === 'in_progress'} onClick={() => setFilter('in_progress')}>
              Diproses
            </FilterPill>
            <FilterPill active={filter === 'resolved'} onClick={() => setFilter('resolved')}>
              Selesai
            </FilterPill>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">
            Daftar Laporan <span className="ml-2 text-slate-400">({filtered.length})</span>
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
              <BellRing size={22} />
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">Belum ada laporan yang cocok</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Laporan login dari mobile akan muncul di sini. Jika kosong, memang belum ada user yang submit issue.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {filtered.map((issue) => {
              const meta = STATUS_META[issue.status];
              const StatusIcon = meta.icon;

              return (
                <article key={issue.id} className="p-5 transition-colors hover:bg-slate-50/80 dark:hover:bg-white/5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-black text-slate-900 dark:text-white">
                          {issue.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${meta.className}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          <StatusIcon size={10} />
                          {meta.label}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">Email / ID:</span>{' '}
                          {issue.emailOrEmployeeId}
                        </span>
                        {issue.phone && (
                          <span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">WA:</span>{' '}
                            {issue.phone}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Deskripsi Masalah</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                          {issue.description}
                        </p>
                      </div>
                    </div>

                    <div className="w-full lg:w-72">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tindakan Cepat</p>
                        <div className="mt-3 space-y-2 text-sm">
                          <ActionRow label="Status" value={meta.label} />
                          <ActionRow label="Follow up" value="Reset kredensial / cek akun" />
                          <ActionRow label="Kategori" value="Login Problem" />
                        </div>
                      </div>

                      <p className="mt-3 text-[11px] font-medium text-slate-400">
                        Dibuat{' '}
                        {issue.createdAt
                          ? formatDistanceToNow(toDate(issue.createdAt), {
                              addSuffix: true,
                              locale: localeId,
                            })
                          : 'baru saja'}
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

function ActionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <span className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}
