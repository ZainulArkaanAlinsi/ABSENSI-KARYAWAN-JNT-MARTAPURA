'use client';

import { useState, useEffect, useRef } from 'react';
import { FaceBadge } from '@/components/ui/Badge';
import AddEmployeeModal from '@/components/employees/AddEmployeeModal';
import { useEmployeeManagement } from '@/hooks/useEmployeeManagement';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import Link from 'next/link';
import { Pagination } from '@/components/ui/Pagination';
import {
  Trash2, ChevronRight, UserPlus, Search,
  Users, ShieldCheck, AlertCircle, Building2,
  Mail, Loader2, LayoutGrid, List, Wifi, X,
} from 'lucide-react';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';

// ── Animated counter ──────────────────────────────────────────
function AnimCount({ to }: { to: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, v => Math.round(v));
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const unsub = rounded.on('change', v => setDisplay(v));
    const ctrl  = animate(count, to, { duration: 0.8, ease: 'easeOut' });
    return () => { ctrl.stop(); unsub(); };
  }, [to]);
  return <span className="tabular-nums">{display}</span>;
}

// ── Stat card ──────────────────────────────────────────────────
function StatCard({ label, val, icon: Icon, color, delay }: {
  label: string; val: number; icon: React.ElementType;
  color: { bar: string; icon: string; num: string }; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center gap-4 cursor-default overflow-hidden relative"
      style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${color.bar}`} />
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color.icon}`}>
        <Icon size={20} strokeWidth={2} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
        <p className={`text-[28px] font-black leading-tight mt-1 ${color.num}`}>
          <AnimCount to={val} />
        </p>
      </div>
    </motion.div>
  );
}

// ── Avatar ─────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'from-red-500 to-rose-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600',
  'from-sky-500 to-cyan-600',
];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Grid card ──────────────────────────────────────────────────
function EmployeeCard({
  emp, idx, onDelete,
}: { emp: any; idx: number; onDelete: () => void }) {
  const { confirm } = useConfirm();
  const avatarGradient = getAvatarColor(emp.name);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col cursor-default"
      style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 32px rgba(227,30,36,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)')}
    >
      {/* Top strip */}
      <div className="h-1.5 w-full bg-linear-to-r from-[#E31E24] to-[#005596] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Avatar + name row */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <div className={`w-13 h-13 rounded-xl bg-linear-to-br ${avatarGradient} flex items-center justify-center text-[18px] font-black text-white`}
              style={{ width: 52, height: 52 }}>
              {emp.name.charAt(0).toUpperCase()}
            </div>
            {emp.isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-desc font-bold text-slate-800 truncate leading-tight group-hover:text-[#E31E24] transition-colors">
              {emp.name}
            </p>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5 tracking-wider uppercase">
              {emp.employeeId}
            </p>
          </div>
          {emp.isOnline && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg shrink-0">
              <Wifi size={10} className="text-emerald-500" />
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Online</span>
            </div>
          )}
        </div>

        {/* Dept + face badge */}
        <div className="bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 size={12} className="text-slate-400 shrink-0" />
            <p className="text-[12px] font-semibold text-slate-700 truncate">{emp.department || 'Operasional'}</p>
          </div>
          <FaceBadge registered={emp.faceRegistered} />
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 px-0.5">
          <Mail size={12} className="text-slate-300 shrink-0" />
          <p className="text-[12px] text-slate-400 truncate">{emp.email || '—'}</p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }}
            onClick={async (e) => { 
              e.stopPropagation(); 
              const isConfirmed = await confirm({
                title: 'Hapus Karyawan',
                message: `Yakin ingin menghapus data ${emp.name}? Semua riwayat absensi juga akan dihapus.`,
                variant: 'danger',
                confirmLabel: 'Hapus',
                cancelLabel: 'Batal'
              });
              if (isConfirmed) onDelete(); 
            }}
            className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-all shrink-0"
          >
            <Trash2 size={14} />
          </motion.button>

          <Link href={`/employees/detail?id=${emp.uid}`} className="flex-1">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full h-9 rounded-xl text-[12px] font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg,#E31E24,#b5161b)' }}
            >
              Lihat Profil <ChevronRight size={13} />
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ── List row ───────────────────────────────────────────────────
function EmployeeRow({ emp, idx, onDelete, selected, onSelectToggle }: {
  emp: any;
  idx: number;
  onDelete: () => void;
  selected: boolean;
  onSelectToggle: () => void;
}) {
  const { confirm } = useConfirm();
  const avatarGradient = getAvatarColor(emp.name);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ delay: idx * 0.03 }}
      whileHover={{ backgroundColor: '#fafafa' }}
      className={`flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0 group transition-colors ${selected ? 'bg-red-50/30' : ''}`}
    >
      {/* Bulk select checkbox */}
      <label className="shrink-0 cursor-pointer">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelectToggle}
          className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-2 focus:ring-red-200 cursor-pointer"
        />
      </label>

      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${avatarGradient} flex items-center justify-center text-desc font-black text-white`}>
          {emp.name.charAt(0).toUpperCase()}
        </div>
        {emp.isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />}
      </div>

      {/* Name + ID */}
      <div className="w-44 min-w-0 shrink-0">
        <p className="text-[13px] font-bold text-slate-800 truncate group-hover:text-[#E31E24] transition-colors">{emp.name}</p>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{emp.employeeId}</p>
      </div>

      {/* Dept */}
      <div className="flex-1 hidden sm:flex items-center gap-1.5 min-w-0">
        <Building2 size={11} className="text-slate-300 shrink-0" />
        <p className="text-[12px] text-slate-500 truncate">{emp.department || 'Operasional'}</p>
      </div>

      {/* Email */}
      <div className="flex-1 hidden md:flex items-center gap-1.5 min-w-0">
        <Mail size={11} className="text-slate-300 shrink-0" />
        <p className="text-[12px] text-slate-400 truncate">{emp.email || '—'}</p>
      </div>

      {/* Face badge */}
      <div className="shrink-0 hidden sm:block">
        <FaceBadge registered={emp.faceRegistered} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={async (e) => { 
            e.stopPropagation(); 
            const isConfirmed = await confirm({
              title: 'Hapus Karyawan',
              message: `Yakin ingin menghapus data ${emp.name}?`,
              variant: 'danger',
              confirmLabel: 'Hapus',
              cancelLabel: 'Batal'
            });
            if (isConfirmed) onDelete(); 
          }}
          className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={13} />
        </motion.button>
        <Link href={`/employees/detail?id=${emp.uid}`}>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            className="h-8 px-4 rounded-lg text-[11px] font-bold text-white flex items-center gap-1.5 transition-all"
            style={{ background: 'linear-gradient(135deg,#E31E24,#b5161b)' }}
          >
            Profil <ChevronRight size={11} />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

// ── Empty state ────────────────────────────────────────────────
function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full flex flex-col items-center justify-center py-24 gap-4"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(227,30,36,0.08)' }}
      >
        <Users size={28} style={{ color: '#E31E24' }} />
      </motion.div>
      <div className="text-center">
        <p className="text-desc font-bold text-slate-700">
          {hasFilter ? 'Tidak ditemukan' : 'Belum ada karyawan'}
        </p>
        <p className="text-[12px] text-slate-400 mt-1">
          {hasFilter ? 'Coba ubah filter atau kata kunci pencarian' : 'Tambah karyawan pertama untuk mulai'}
        </p>
      </div>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function EmployeesPage() {
  const {
    employees, loading, search, setSearch,
    filterDept, setFilterDept, filterFace, setFilterFace,
    showAddModal, setShowAddModal,
    departmentItems, jamKerjas,
    filteredEmployees, deleteEmployeeOptimistic,
  } = useEmployeeManagement();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('search');
    if (q) setSearch(q);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const itemsPerPage = viewMode === 'grid' ? 9 : 12;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { confirm } = useConfirm();

  useEffect(() => { setCurrentPage(1); }, [filteredEmployees]);

  // Clear selection when filter changes — selected ids may no longer be visible.
  useEffect(() => { setSelected(new Set()); }, [search, filterDept, filterFace]);

  const toggleOne = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const togglePage = () => {
    const visibleIds = paginatedEmployees.map(e => e.id);
    const allSelected = visibleIds.every(id => selected.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) visibleIds.forEach(id => next.delete(id));
      else visibleIds.forEach(id => next.add(id));
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    const ok = await confirm({
      title: `Hapus ${selected.size} Karyawan`,
      message: `Aksi ini akan menghapus ${selected.size} karyawan beserta SEMUA data absensi & izin terkait. Tindakan permanen.`,
      variant: 'danger',
      confirmLabel: `Ya, hapus ${selected.size}`,
      cancelLabel: 'Batal',
    });
    if (!ok) return;
    setBulkDeleting(true);
    const ids = Array.from(selected);
    let okCount = 0, failCount = 0;
    for (const id of ids) {
      try {
        await deleteEmployeeOptimistic(id);
        okCount++;
      } catch {
        failCount++;
      }
    }
    setSelected(new Set());
    setBulkDeleting(false);
    if (failCount === 0) toast.success(`${okCount} karyawan dihapus`);
    else toast.error(`${okCount} berhasil, ${failCount} gagal. Coba ulangi yang gagal.`);
  };

  const totalPages         = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const hasFilter = !!(search || filterDept !== 'all' || filterFace !== 'all');

  const FACE_OPTS = [
    { value: 'all',          label: 'Semua' },
    { value: 'registered',   label: 'Verified' },
    { value: 'unregistered', label: 'Belum Daftar' },
  ];

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          {/* Section label */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 rounded-full" style={{ background: '#E31E24' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Manajemen SDM</span>
          </div>
          <h1 className="editorial-heading text-[24px] font-black text-slate-900 tracking-tight leading-none">
            Data <span style={{ color: '#E31E24' }}>Karyawan</span>
          </h1>
          <p className="text-[12px] text-slate-400 mt-1.5 font-medium">
            {employees.length} personel aktif terdaftar di sistem
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
            {(['grid', 'list'] as const).map(mode => (
              <motion.button
                key={mode}
                onClick={() => setViewMode(mode)}
                whileTap={{ scale: 0.93 }}
                className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              >
                {viewMode === mode && (
                  <motion.div
                    layoutId="view-indicator"
                    className="absolute inset-0 rounded-lg bg-white"
                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                  />
                )}
                <span className={`relative z-10 transition-colors ${viewMode === mode ? 'text-slate-700' : 'text-slate-400'}`}>
                  {mode === 'grid' ? <LayoutGrid size={15} /> : <List size={15} />}
                </span>
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(227,30,36,0.30)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 h-10 px-5 rounded-xl text-[12px] font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#E31E24,#b5161b)', boxShadow: '0 2px 8px rgba(227,30,36,0.25)' }}
          >
            <UserPlus size={15} />
            Tambah Karyawan
          </motion.button>
        </div>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard delay={0.06} label="Total Karyawan" val={employees.length}
          icon={Users}
          color={{ bar: 'bg-slate-400', icon: 'bg-slate-600', num: 'text-slate-700' }} />
        <StatCard delay={0.10} label="Terverifikasi" val={employees.filter(e => e.faceRegistered).length}
          icon={ShieldCheck}
          color={{ bar: 'bg-[#005596]', icon: 'bg-[#005596]', num: 'text-[#005596]' }} />
        <StatCard delay={0.14} label="Belum Daftar" val={employees.filter(e => !e.faceRegistered).length}
          icon={AlertCircle}
          color={{ bar: 'bg-amber-500', icon: 'bg-amber-500', num: 'text-amber-600' }} />
        <StatCard delay={0.18} label="Sedang Online" val={employees.filter(e => e.isOnline).length}
          icon={Wifi}
          color={{ bar: 'bg-emerald-500', icon: 'bg-emerald-500', num: 'text-emerald-600' }} />
      </div>

      {/* ── FILTER BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
      >
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama, ID, atau departemen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 focus:bg-white transition-all"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Dept dropdown */}
        <div className="relative shrink-0 w-full sm:w-44">
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 text-[12px] font-semibold text-slate-600 outline-none appearance-none cursor-pointer focus:border-red-300 transition-all"
          >
            <option value="all">Semua Dept.</option>
            {departmentItems.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
          <Building2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Face status pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {FACE_OPTS.map(opt => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.94 }}
              onClick={() => setFilterFace(opt.value as any)}
              className={`relative h-10 px-4 rounded-xl text-[12px] font-bold transition-all ${
                filterFace === opt.value ? 'text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {filterFace === opt.value && (
                <motion.div
                  layoutId="face-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg,#E31E24,#b5161b)' }}
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.38 }}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── BULK ACTION BAR ── */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5 -mt-1"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center font-black text-[12px]">
                {selected.size}
              </div>
              <span className="text-[12px] font-bold text-red-700">
                karyawan terpilih
              </span>
              <button
                onClick={() => setSelected(new Set())}
                className="text-[11px] font-semibold text-red-500 hover:text-red-700 underline ml-2"
              >
                Batal
              </button>
            </div>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 h-9 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[12px] font-bold transition-all disabled:opacity-50"
            >
              <Trash2 size={13} />
              {bulkDeleting ? 'Menghapus...' : 'Hapus Terpilih'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter chips */}
      <AnimatePresence>
        {hasFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 flex-wrap overflow-hidden -mt-2"
          >
            <span className="text-[11px] text-slate-400 font-semibold">Filter aktif:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-100 rounded-full text-[11px] font-semibold text-red-600">
                Cari: "{search}"
                <button onClick={() => setSearch('')}><X size={10} /></button>
              </span>
            )}
            {filterDept !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[11px] font-semibold text-blue-600">
                Dept: {filterDept}
                <button onClick={() => setFilterDept('all')}><X size={10} /></button>
              </span>
            )}
            {filterFace !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-[11px] font-semibold text-amber-600">
                {filterFace === 'registered' ? 'Verified' : 'Belum Daftar'}
                <button onClick={() => setFilterFace('all')}><X size={10} /></button>
              </span>
            )}
            <button
              onClick={() => { setSearch(''); setFilterDept('all'); setFilterFace('all'); }}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 underline transition-colors"
            >
              Hapus semua
            </button>
            <span className="text-[11px] text-slate-400 ml-auto font-medium">
              {filteredEmployees.length} hasil
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTENT ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(227,30,36,0.08)' }}>
            <Loader2 size={22} className="animate-spin" style={{ color: '#E31E24' }} />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Memuat data...</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {paginatedEmployees.length === 0
              ? <EmptyState hasFilter={hasFilter} />
              : paginatedEmployees.map((emp, idx) => (
                  <EmployeeCard
                    key={emp.id} emp={emp} idx={idx}
                    onDelete={() => deleteEmployeeOptimistic(emp.id)}
                  />
                ))
            }
          </AnimatePresence>
        </div>
      ) : (
        /* List view */
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          {/* List header — checkbox + select-all + columns */}
          <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100">
            <label className="cursor-pointer shrink-0" title="Pilih semua di halaman ini">
              <input
                type="checkbox"
                checked={paginatedEmployees.length > 0 && paginatedEmployees.every(e => selected.has(e.id))}
                onChange={togglePage}
                className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-2 focus:ring-red-200 cursor-pointer"
              />
            </label>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {selected.size > 0 ? `${selected.size} terpilih` : 'Pilih untuk hapus massal'}
            </p>
          </div>
          <AnimatePresence mode="popLayout">
            {paginatedEmployees.length === 0
              ? <EmptyState hasFilter={hasFilter} />
              : paginatedEmployees.map((emp, idx) => (
                  <EmployeeRow
                    key={emp.id} emp={emp} idx={idx}
                    onDelete={() => deleteEmployeeOptimistic(emp.id)}
                    selected={selected.has(emp.id)}
                    onSelectToggle={() => toggleOne(emp.id)}
                  />
                ))
            }
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center pt-2"
        >
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </motion.div>
      )}

      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        jamKerjas={jamKerjas}
        departmentItems={departmentItems}
      />
    </div>
  );
}
