'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Search, Filter, Plus, Package, Truck, CheckCircle2,
  XCircle, Clock, ChevronLeft, ChevronRight, Eye,
  Pencil, Trash2, Download, RefreshCw, ArrowUpDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JNECardLoader } from '@/components/jne/JNELoader';

// ─── Types ────────────────────────────────────────────────────────────────────
type PkgStatus = 'pending' | 'on_process' | 'delivered' | 'returned' | 'cancelled';

interface Package {
  id: string;
  resi: string;
  sender: string;
  receiver: string;
  destination: string;
  status: PkgStatus;
  date: string;
  weight: string;
  cost: number;
  service: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_PACKAGES: Package[] = [
  { id: '1',  resi: 'JNEMTP2605001', sender: 'Ahmad Fadli',    receiver: 'Budi Santoso',    destination: 'Banjarmasin', status: 'delivered',  date: '2026-05-10', weight: '2.5 kg',  cost: 45000,  service: 'REG' },
  { id: '2',  resi: 'JNEMTP2605002', sender: 'Siti Rahayu',   receiver: 'Dewi Lestari',    destination: 'Banjarbaru',  status: 'on_process', date: '2026-05-10', weight: '1.2 kg',  cost: 28000,  service: 'YES' },
  { id: '3',  resi: 'JNEMTP2605003', sender: 'Hendra Wijaya', receiver: 'Fitri Amalia',    destination: 'Banjarmasin', status: 'pending',    date: '2026-05-09', weight: '3.8 kg',  cost: 62000,  service: 'OKE' },
  { id: '4',  resi: 'JNEMTP2605004', sender: 'Rina Susanti',  receiver: 'Gunawan Purnama', destination: 'Pelaihari',   status: 'delivered',  date: '2026-05-09', weight: '0.8 kg',  cost: 22000,  service: 'REG' },
  { id: '5',  resi: 'JNEMTP2605005', sender: 'Dodi Prasetyo', receiver: 'Halimah Nur',     destination: 'Kandangan',   status: 'returned',   date: '2026-05-08', weight: '5.0 kg',  cost: 78000,  service: 'REG' },
  { id: '6',  resi: 'JNEMTP2605006', sender: 'Eka Putri',     receiver: 'Irwan Setiadi',   destination: 'Banjarmasin', status: 'on_process', date: '2026-05-08', weight: '2.1 kg',  cost: 35000,  service: 'YES' },
  { id: '7',  resi: 'JNEMTP2605007', sender: 'Farhan Malik',  receiver: 'Juliana Dewi',    destination: 'Amuntai',     status: 'delivered',  date: '2026-05-08', weight: '1.5 kg',  cost: 31000,  service: 'OKE' },
  { id: '8',  resi: 'JNEMTP2605008', sender: 'Grace Tan',     receiver: 'Kemal Aditya',    destination: 'Banjarbaru',  status: 'cancelled',  date: '2026-05-07', weight: '0.5 kg',  cost: 18000,  service: 'REG' },
  { id: '9',  resi: 'JNEMTP2605009', sender: 'Hadi Kurnia',   receiver: 'Linda Sari',      destination: 'Martapura',   status: 'pending',    date: '2026-05-07', weight: '4.2 kg',  cost: 55000,  service: 'YES' },
  { id: '10', resi: 'JNEMTP2605010', sender: 'Indra Saputra', receiver: 'Maya Wijaya',     destination: 'Banjarmasin', status: 'delivered',  date: '2026-05-07', weight: '1.9 kg',  cost: 33000,  service: 'REG' },
  { id: '11', resi: 'JNEMTP2605011', sender: 'Joko Susilo',   receiver: 'Nita Permata',    destination: 'Pelaihari',   status: 'on_process', date: '2026-05-06', weight: '3.0 kg',  cost: 47000,  service: 'OKE' },
  { id: '12', resi: 'JNEMTP2605012', sender: 'Kiki Alamsyah', receiver: 'Oscar Budi',      destination: 'Kandangan',   status: 'delivered',  date: '2026-05-06', weight: '2.3 kg',  cost: 41000,  service: 'REG' },
  { id: '13', resi: 'JNEMTP2605013', sender: 'Lina Hartati',  receiver: 'Putri Agustina',  destination: 'Banjarmasin', status: 'pending',    date: '2026-05-06', weight: '0.7 kg',  cost: 21000,  service: 'YES' },
  { id: '14', resi: 'JNEMTP2605014', sender: 'Mira Dewanti',  receiver: 'Reza Fauzan',     destination: 'Banjarbaru',  status: 'delivered',  date: '2026-05-05', weight: '6.5 kg',  cost: 89000,  service: 'REG' },
  { id: '15', resi: 'JNEMTP2605015', sender: 'Nanda Oktavia', receiver: 'Syahrul Rizal',   destination: 'Amuntai',     status: 'returned',   date: '2026-05-05', weight: '1.1 kg',  cost: 26000,  service: 'OKE' },
];

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<PkgStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:    { label: 'Menunggu',  color: '#D97706', bg: '#FEF3C7', icon: Clock },
  on_process: { label: 'Diproses', color: '#2563EB', bg: '#DBEAFE', icon: Truck },
  delivered:  { label: 'Terkirim', color: '#059669', bg: '#D1FAE5', icon: CheckCircle2 },
  returned:   { label: 'Dikembalikan', color: '#7C3AED', bg: '#EDE9FE', icon: RefreshCw },
  cancelled:  { label: 'Dibatalkan',  color: '#DC2626', bg: '#FEE2E2', icon: XCircle },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PkgStatus }) {
  const cfg  = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <Icon size={11} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
function StatsCard({ label, value, icon: Icon, color, bg }: {
  label: string; value: number; icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
        <Icon size={20} style={{ color }} strokeWidth={2} />
      </div>
      <div>
        <p className="text-[22px] font-extrabold text-slate-800 leading-none">{value.toLocaleString('id-ID')}</p>
        <p className="text-[12px] text-slate-500 mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Action Button ─────────────────────────────────────────────────────────────
function ActionBtn({ icon: Icon, label, onClick, variant = 'default' }: {
  icon: React.ElementType; label: string; onClick?: () => void;
  variant?: 'default' | 'danger' | 'primary';
}) {
  const styles = {
    default: 'text-slate-500 hover:text-jne-blue hover:bg-jne-blue-light',
    danger:  'text-slate-500 hover:text-red-600 hover:bg-red-50',
    primary: 'text-slate-500 hover:text-jne-red hover:bg-jne-red-light',
  };
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${styles[variant]}`}
    >
      <Icon size={14} strokeWidth={2} />
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
const FILTER_OPTIONS = [
  { value: 'all',        label: 'Semua Status' },
  { value: 'pending',    label: 'Menunggu' },
  { value: 'on_process', label: 'Diproses' },
  { value: 'delivered',  label: 'Terkirim' },
  { value: 'returned',   label: 'Dikembalikan' },
  { value: 'cancelled',  label: 'Dibatalkan' },
];

export default function PackagesPage() {
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('all');
  const [page,       setPage]       = useState(1);
  const [loading]                   = useState(false);
  const [sortDir,    setSortDir]    = useState<'asc' | 'desc'>('desc');
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let data = [...MOCK_PACKAGES];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        p.resi.toLowerCase().includes(q) ||
        p.sender.toLowerCase().includes(q) ||
        p.receiver.toLowerCase().includes(q) ||
        p.destination.toLowerCase().includes(q)
      );
    }
    if (filter !== 'all') data = data.filter(p => p.status === filter);
    data.sort((a, b) => sortDir === 'desc'
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date)
    );
    return data;
  }, [search, filter, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    total:      MOCK_PACKAGES.length,
    pending:    MOCK_PACKAGES.filter(p => p.status === 'pending').length,
    on_process: MOCK_PACKAGES.filter(p => p.status === 'on_process').length,
    delivered:  MOCK_PACKAGES.filter(p => p.status === 'delivered').length,
    returned:   MOCK_PACKAGES.filter(p => p.status === 'returned').length,
  }), []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleFilter = (v: string) => { setFilter(v); setPage(1); };

  if (loading) return <JNECardLoader message="Memuat data paket..." />;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#E31E24' }}>
              <Package size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-[22px] font-extrabold text-slate-800">Manajemen Paket</h1>
          </div>
          <p className="text-[13px] text-slate-500 ml-10">JNE Martapura · Kelola pengiriman paket masuk &amp; keluar</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold shadow-md transition-all"
          style={{ background: '#E31E24', boxShadow: 'none' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Tambah Paket
        </motion.button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatsCard label="Total Paket"   value={stats.total}      icon={Package}      color="#004080" bg="#E6EEF8" />
        <StatsCard label="Menunggu"      value={stats.pending}    icon={Clock}        color="#D97706" bg="#FEF3C7" />
        <StatsCard label="Diproses"      value={stats.on_process} icon={Truck}        color="#2563EB" bg="#DBEAFE" />
        <StatsCard label="Terkirim"      value={stats.delivered}  icon={CheckCircle2} color="#059669" bg="#D1FAE5" />
        <StatsCard label="Dikembalikan"  value={stats.returned}   icon={RefreshCw}    color="#7C3AED" bg="#EDE9FE" />
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 border-b border-slate-100">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              value={search}
              onChange={handleSearch}
              placeholder="Cari resi, pengirim, penerima..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] border border-slate-200 bg-slate-50 text-slate-700
                         focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ '--tw-ring-color': '#E31E24' } as React.CSSProperties}
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select
              value={filter}
              onChange={e => handleFilter(e.target.value)}
              className="text-[13px] border border-slate-200 bg-slate-50 text-slate-700 rounded-xl px-3 py-2
                         focus:outline-none focus:ring-2 transition-all cursor-pointer"
              style={{ '--tw-ring-color': '#E31E24' } as React.CSSProperties}
            >
              {FILTER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Sort toggle */}
            <button
              onClick={() => setSortDir(v => v === 'desc' ? 'asc' : 'desc')}
              title={sortDir === 'desc' ? 'Terbaru dulu' : 'Terlama dulu'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50
                         text-[13px] text-slate-600 hover:border-jne-red hover:text-jne-red transition-all"
            >
              <ArrowUpDown size={13} />
              <span>{sortDir === 'desc' ? 'Terbaru' : 'Terlama'}</span>
            </button>

            {/* Export */}
            <button
              title="Export ke Excel"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50
                         text-[13px] text-slate-600 hover:border-jne-blue hover:text-jne-blue transition-all"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">No</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">No. Resi</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Pengirim</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Penerima</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Tujuan</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Layanan</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Biaya</th>
                <th className="text-center px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-slate-400">
                      <Package size={36} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Tidak ada paket ditemukan</p>
                      <p className="text-[12px] mt-1">Coba ubah filter atau kata kunci pencarian</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((pkg, idx) => (
                    <motion.tr
                      key={pkg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-[12px]">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-semibold text-jne-blue">{pkg.resi}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">{pkg.sender}</td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">{pkg.receiver}</td>
                      <td className="px-5 py-3.5 text-slate-500">{pkg.destination}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold
                                         bg-jne-blue-light text-jne-blue">
                          {pkg.service}
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={pkg.status} /></td>
                      <td className="px-5 py-3.5 text-slate-700 font-semibold">
                        {pkg.cost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <ActionBtn icon={Eye}    label="Detail paket" variant="primary" />
                          <ActionBtn icon={Pencil} label="Edit paket"   variant="default" />
                          <ActionBtn icon={Trash2} label="Hapus paket"  variant="danger" />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/40">
          <p className="text-[12px] text-slate-500">
            Menampilkan <span className="font-semibold text-slate-700">
              {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}
            </span> dari <span className="font-semibold text-slate-700">{filtered.length}</span> paket
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed
                         hover:bg-jne-red-light hover:text-jne-red text-slate-500 border border-slate-200"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1
                : page <= 3 ? i + 1
                : page >= totalPages - 2 ? totalPages - 4 + i
                : page - 2 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-all border ${
                    p === page
                      ? 'text-white border-jne-red'
                      : 'text-slate-600 border-slate-200 hover:border-jne-red hover:text-jne-red'
                  }`}
                  style={p === page ? { background: '#E31E24' } : {}}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed
                         hover:bg-jne-red-light hover:text-jne-red text-slate-500 border border-slate-200"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
