'use client';

import { motion } from 'framer-motion';
import { UserCheck, Search, Shield, ChevronRight, Mail, Building2, Loader2, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface HeadUnit {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  role: string;
}

export default function HeadUnitsPage() {
  const [search, setSearch] = useState('');
  const [headUnits, setHeadUnits] = useState<HeadUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('role', 'in', ['admin', 'moderator', 'supervisor', 'head_unit']),
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: HeadUnit[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          name: raw.name || raw.displayName || 'Tanpa Nama',
          email: raw.email || '',
          department: raw.department || 'Semua Departemen',
          position: raw.position || raw.role || 'Admin',
          role: raw.role || 'admin',
        };
      });
      setHeadUnits(data);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, []);

  const filtered = headUnits.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.department.toLowerCase().includes(search.toLowerCase()) ||
    h.email.toLowerCase().includes(search.toLowerCase()),
  );

  const getRoleBadge = (role: string) => {
    if (role === 'admin') return { label: 'Super Admin', color: 'bg-red-50 text-red-600 border-red-200' };
    if (role === 'moderator') return { label: 'Moderator', color: 'bg-blue-50 text-blue-600 border-blue-200' };
    if (role === 'supervisor') return { label: 'Supervisor', color: 'bg-purple-50 text-purple-600 border-purple-200' };
    return { label: 'Kepala Unit', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="editorial-heading text-[22px] font-black text-slate-800 tracking-tight leading-none">
            Kepala <span className="text-[#E31E24]">Unit</span>
          </h1>
          <p className="text-[12px] text-slate-400 mt-1 font-medium">
            Otoritas persetujuan dan pengawasan operasional tiap departemen
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <Users size={13} className="text-emerald-600" />
            <span className="text-[11px] font-bold text-emerald-700">{headUnits.length} Pimpinan</span>
          </div>
        </div>
      </motion.div>

      {/* ── SEARCH ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-sm"
      >
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari nama, departemen, atau email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-400 transition-all"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        />
      </motion.div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-[13px] font-medium">Memuat data pimpinan...</span>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-4 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <UserCheck size={28} className="text-slate-400" />
          </div>
          <div>
            <p className="text-desc font-bold text-slate-600">
              {search ? 'Tidak ada pimpinan yang cocok' : 'Belum ada data pimpinan'}
            </p>
            <p className="text-[12px] text-slate-400 mt-1">
              {search ? 'Coba kata kunci lain' : 'Tambahkan akun dengan role admin/supervisor di Firebase'}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── CARDS ── */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((head, idx) => {
            const badge = getRoleBadge(head.role);
            return (
              <motion.div
                key={head.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all group"
                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-[18px] font-black shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    {head.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-desc font-bold text-slate-800 truncate">{head.name}</p>
                    <span className={`inline-block mt-0.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2 text-[12px] text-slate-500">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{head.email || 'Email tidak tersedia'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-slate-500">
                    <Building2 size={13} className="text-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-600 truncate">{head.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-slate-500">
                    <Shield size={13} className="text-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-600">{head.position}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="w-full h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[12px] font-bold flex items-center justify-center gap-1.5">
                  <span className="text-emerald-600">{head.id.slice(0, 8)}...</span>
                  <ChevronRight size={13} className="text-slate-400" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
