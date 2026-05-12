'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Truck, CheckCircle2, XCircle,
  Phone, MapPin, Package, Star, Pencil, Trash2, Eye,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
type CourierStatus = 'active' | 'off_duty' | 'on_leave';

interface Courier {
  id: string;
  name: string;
  phone: string;
  area: string;
  status: CourierStatus;
  packagesToday: number;
  deliveredToday: number;
  rating: number;
  vehicle: string;
  joinDate: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_COURIERS: Courier[] = [
  { id: '1',  name: 'Andi Wijaya',      phone: '0812-3456-7890', area: 'Kec. Martapura Kota',  status: 'active',   packagesToday: 18, deliveredToday: 15, rating: 4.8, vehicle: 'Motor',  joinDate: '2024-01-15' },
  { id: '2',  name: 'Budi Hartono',     phone: '0813-2345-6789', area: 'Kec. Martapura Timur', status: 'active',   packagesToday: 14, deliveredToday: 12, rating: 4.6, vehicle: 'Motor',  joinDate: '2024-03-22' },
  { id: '3',  name: 'Cecep Nugraha',    phone: '0821-3456-7891', area: 'Kec. Martapura Barat', status: 'off_duty', packagesToday: 0,  deliveredToday: 0,  rating: 4.5, vehicle: 'Motor',  joinDate: '2023-11-08' },
  { id: '4',  name: 'Deni Saputra',     phone: '0822-4567-8901', area: 'Kec. Sungai Tabuk',    status: 'active',   packagesToday: 22, deliveredToday: 20, rating: 4.9, vehicle: 'Pickup', joinDate: '2023-06-10' },
  { id: '5',  name: 'Eko Firmansyah',   phone: '0815-5678-9012', area: 'Kec. Karang Intan',    status: 'active',   packagesToday: 11, deliveredToday: 9,  rating: 4.4, vehicle: 'Motor',  joinDate: '2024-07-01' },
  { id: '6',  name: 'Farid Maulana',    phone: '0816-6789-0123', area: 'Kec. Astambul',        status: 'on_leave', packagesToday: 0,  deliveredToday: 0,  rating: 4.7, vehicle: 'Motor',  joinDate: '2023-09-14' },
  { id: '7',  name: 'Galih Purnomo',    phone: '0817-7890-1234', area: 'Kec. Martapura Kota',  status: 'active',   packagesToday: 16, deliveredToday: 14, rating: 4.6, vehicle: 'Motor',  joinDate: '2024-02-28' },
  { id: '8',  name: 'Hendra Setiawan',  phone: '0818-8901-2345', area: 'Kec. Sungai Tabuk',    status: 'active',   packagesToday: 9,  deliveredToday: 8,  rating: 4.3, vehicle: 'Motor',  joinDate: '2025-01-10' },
];

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<CourierStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  active:   { label: 'Aktif Bertugas', color: '#059669', bg: '#D1FAE5', icon: CheckCircle2 },
  off_duty: { label: 'Tidak Bertugas', color: '#6B7280', bg: '#F3F4F6', icon: XCircle },
  on_leave: { label: 'Cuti',           color: '#D97706', bg: '#FEF3C7', icon: XCircle },
};

// ─── Star Rating ──────────────────────────────────────────────────────────────
function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={12} fill="#FBBF24" className="text-amber-400" />
      <span className="text-[12px] font-semibold text-slate-700">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: pct >= 90 ? '#059669' : pct >= 60 ? '#E31E24' : '#D97706' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-[11px] text-slate-500 font-medium shrink-0">{value}/{total}</span>
    </div>
  );
}

// ─── Courier Card (mobile) ────────────────────────────────────────────────────
function CourierCard({ courier }: { courier: Courier }) {
  const cfg  = STATUS_CFG[courier.status];
  const Icon = cfg.icon;
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-[13px]"
            style={{ background: '#E31E24' }}>
            {courier.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-desc">{courier.name}</p>
            <div className="flex items-center gap-1 mt-0.5 text-slate-500">
              <Phone size={11} />
              <span className="text-[11px]">{courier.phone}</span>
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ color: cfg.color, background: cfg.bg }}>
          <Icon size={10} strokeWidth={2.5} />
          {cfg.label}
        </span>
      </div>

      <div className="flex items-center gap-1 text-slate-500">
        <MapPin size={12} />
        <span className="text-[12px]">{courier.area}</span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
        <div className="flex items-center gap-1">
          <Package size={12} className="text-jne-red" />
          <span className="text-[12px] font-medium text-slate-600">{courier.packagesToday} paket hari ini</span>
        </div>
        <RatingStars rating={courier.rating} />
      </div>

      <ProgressBar value={courier.deliveredToday} total={courier.packagesToday} />
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

export default function CouriersPage() {
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');
  const [page,    setPage]    = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const filtered = useMemo(() => {
    let data = [...MOCK_COURIERS];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(c => c.name.toLowerCase().includes(q) || c.area.toLowerCase().includes(q) || c.phone.includes(q));
    }
    if (filter !== 'all') data = data.filter(c => c.status === filter);
    return data;
  }, [search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total:    MOCK_COURIERS.length,
    active:   MOCK_COURIERS.filter(c => c.status === 'active').length,
    off:      MOCK_COURIERS.filter(c => c.status !== 'active').length,
    packages: MOCK_COURIERS.reduce((s, c) => s + c.packagesToday, 0),
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#004080' }}>
              <Truck size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-[22px] font-extrabold text-slate-800">Data Kurir</h1>
          </div>
          <p className="text-[13px] text-slate-500 ml-10">JNE Martapura · {stats.active} kurir aktif bertugas hari ini</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold"
          style={{ background: '#004080', boxShadow: 'none' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Tambah Kurir
        </motion.button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Kurir',      value: stats.total,    color: '#004080', bg: '#E6EEF8', icon: Truck },
          { label: 'Aktif Bertugas',   value: stats.active,   color: '#059669', bg: '#D1FAE5', icon: CheckCircle2 },
          { label: 'Tidak Bertugas',   value: stats.off,      color: '#6B7280', bg: '#F3F4F6', icon: XCircle },
          { label: 'Paket Hari Ini',   value: stats.packages, color: '#E31E24', bg: '#FDECEA', icon: Package },
        ].map(s => (
          <motion.div
            key={s.label}
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
            className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
              <s.icon size={20} style={{ color: s.color }} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-slate-800 leading-none">{s.value}</p>
              <p className="text-[12px] text-slate-500 mt-1">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari nama, area, telepon..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] border border-slate-200 bg-slate-50 text-slate-700
                         focus:outline-none focus:ring-2 transition-all"
              style={{ '--tw-ring-color': '#004080' } as React.CSSProperties}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={e => { setFilter(e.target.value); setPage(1); }}
              className="text-[13px] border border-slate-200 bg-slate-50 text-slate-700 rounded-xl px-3 py-2
                         focus:outline-none focus:ring-2 cursor-pointer transition-all"
              style={{ '--tw-ring-color': '#004080' } as React.CSSProperties}
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="off_duty">Tidak Bertugas</option>
              <option value="on_leave">Cuti</option>
            </select>

            {/* View toggle */}
            <div className="flex border border-slate-200 rounded-xl overflow-hidden">
              {(['table', 'card'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`px-3 py-2 text-[12px] font-medium transition-all ${
                    viewMode === m ? 'text-white' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                  style={viewMode === m ? { background: '#004080' } : {}}
                >
                  {m === 'table' ? 'Tabel' : 'Kartu'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'table' ? (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      {['Kurir', 'Area Tugas', 'Kendaraan', 'Status', 'Paket Hari Ini', 'Progress', 'Rating', 'Aksi'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((courier, idx) => {
                      const cfg  = STATUS_CFG[courier.status];
                      const Icon = cfg.icon;
                      return (
                        <motion.tr
                          key={courier.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-[11px] shrink-0"
                                style={{ background: '#E31E24' }}>
                                {courier.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{courier.name}</p>
                                <p className="text-[11px] text-slate-400">{courier.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <MapPin size={12} className="text-slate-400 shrink-0" />
                              {courier.area}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-jne-gray-mid text-jne-blue">
                              {courier.vehicle}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                                  style={{ color: cfg.color, background: cfg.bg }}>
                              <Icon size={10} strokeWidth={2.5} />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                              <Package size={13} className="text-jne-red" />
                              {courier.packagesToday} paket
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <ProgressBar value={courier.deliveredToday} total={courier.packagesToday} />
                          </td>
                          <td className="px-5 py-3.5"><RatingStars rating={courier.rating} /></td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1">
                              {[
                                { Icon: Eye,    label: 'Detail', hover: 'hover:text-jne-blue hover:bg-jne-blue-light' },
                                { Icon: Pencil, label: 'Edit',   hover: 'hover:text-amber-600 hover:bg-amber-50' },
                                { Icon: Trash2, label: 'Hapus',  hover: 'hover:text-red-600 hover:bg-red-50' },
                              ].map(({ Icon, label, hover }) => (
                                <button key={label} title={label}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-slate-400 ${hover}`}>
                                  <Icon size={14} strokeWidth={2} />
                                </button>
                              ))}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginated.map(c => <CourierCard key={c.id} courier={c} />)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        <div className="px-5 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/40">
          <p className="text-[12px] text-slate-500">
            {filtered.length} kurir ditemukan
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500
                         disabled:opacity-30 hover:bg-jne-blue-light hover:text-jne-blue transition-all">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-[13px] font-semibold border transition-all ${
                  p === page ? 'text-white border-jne-blue' : 'border-slate-200 text-slate-600 hover:border-jne-blue hover:text-jne-blue'
                }`}
                style={p === page ? { background: '#004080' } : {}}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500
                         disabled:opacity-30 hover:bg-jne-blue-light hover:text-jne-blue transition-all">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
