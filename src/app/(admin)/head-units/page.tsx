'use client';

import { motion } from 'framer-motion';
import { UserCheck, Search, Shield, ChevronRight, Mail, Phone, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function HeadUnitsPage() {
  const [search, setSearch] = useState('');

  // Data pimpinan yang terhubung ke departemen di DEPARTMENT_RULES
  const headUnits = [
    { id: '1', name: 'Budi Santoso', dept: 'Rider Delivery', slug: 'rider_delivery', email: 'budi@jne.mtp.com', status: 'Active' },
    { id: '2', name: 'Siti Aminah', dept: 'Admin Support', slug: 'admin_support', email: 'siti@jne.mtp.com', status: 'Active' },
    { id: '3', name: 'Agus Setiawan', dept: 'Inbound & Outbound', slug: 'inbound_outbound', email: 'agus@jne.mtp.com', status: 'Active' },
  ];

  return (
    <div className="dash-root max-w-[1400px] mx-auto">
      {/* ── INFO HEADER ── */}
      <div className="mb-10 bg-(--bg-card) p-10 rounded-4xl border border-(--border-primary) shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-[#005596]/5 to-transparent pointer-events-none" />
        <div className="h-20 w-20 rounded-3xl bg-[#005596] flex items-center justify-center text-white shadow-xl shadow-blue-900/20 relative z-10">
          <UserCheck size={40} />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-(--text-primary)">Manajemen Kepala Unit</h2>
          <p className="text-(--text-muted) font-bold uppercase tracking-widest text-[11px] mt-2">Otoritas persetujuan dan pengawasan operasional tiap departemen JNE Martapura.</p>
        </div>
      </div>

      {/* ── ACTION BAR ── */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-(--text-dim) group-focus-within:text-[#005596] transition-colors" size={20} />
          <input
            type="text"
            placeholder="Cari nama kepala unit atau departemen..."
            className="w-full pl-16 pr-8 py-5 rounded-2xl bg-(--bg-card) border border-(--border-primary) focus:border-[#005596]/50 focus:ring-4 focus:ring-[#005596]/5 outline-none transition-all font-bold text-(--text-secondary) shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="px-10 py-5 bg-[#E31E24] hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-600/20">
          <UserCheck size={18} /> Tambah Pimpinan
        </button>
      </div>

      {/* ── HEAD UNITS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {headUnits.map((head, idx) => (
          <motion.div
            key={head.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-(--bg-card) rounded-4xl border border-(--border-primary) p-8 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-(--border-primary)">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-(--border-primary) flex items-center justify-center text-(--text-primary) font-black group-hover:border-[#005596]/50 transition-all text-xl italic">
                {head.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-black text-(--text-primary) uppercase italic leading-none mb-2">{head.name}</h3>
                <span className="px-3 py-1 rounded-lg bg-[#005596]/10 text-[#005596] text-[9px] font-black uppercase tracking-widest border border-[#005596]/20">
                  {head.dept}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-(--text-muted) hover:text-[#005596] transition-colors cursor-pointer group/item">
                <Mail size={16} />
                <span className="text-xs font-bold">{head.email}</span>
              </div>
              <div className="flex items-center gap-3 text-(--text-muted)">
                <Shield size={16} className="text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Level: Authority</span>
              </div>
            </div>

            <Link 
              href={`/head-units/${head.slug}`}
              className="w-full py-4 rounded-2xl bg-white/5 text-(--text-muted) font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-(--text-primary) hover:text-(--bg-card) transition-all border border-transparent hover:border-(--border-primary)"
            >
              Detail Akses <ChevronRight size={14} />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
