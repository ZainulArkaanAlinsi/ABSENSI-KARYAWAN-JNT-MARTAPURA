'use client';

import { useState, useEffect, useRef } from 'react';
import { getEmployees } from '@/lib/firestore';
import { Search, ScanFace, CheckCircle2, AlertTriangle, UserCheck, Loader2, Inbox, Smartphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FaceEnrollmentPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [toast,     setToast]     = useState<{ msg: string; emp: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(emp: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg: 'Pendaftaran wajah dilakukan melalui aplikasi mobile JNE Attendance.', emp });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (err) {
        console.error('Failed to load employees for biometrics', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(search.toLowerCase())),
  );

  const enrolledCount = employees.filter(e => e.faceRegistered).length;
  const pendingCount  = employees.length - enrolledCount;

  return (
    <div className="flex flex-col gap-5 pb-6 relative">

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-start gap-3 bg-white border rounded-xl px-4 py-3.5 shadow-xl"
            style={{ borderColor: '#005596', minWidth: 300, maxWidth: 420 }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#EEF4FF' }}>
              <Smartphone size={15} style={{ color: '#005596' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold" style={{ color: '#005596' }}>Gunakan Aplikasi Mobile</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{toast.msg}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-1">{toast.emp}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-slate-300 hover:text-slate-500 transition-colors shrink-0 mt-0.5">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-[22px] font-black text-slate-800 tracking-tight leading-none">
          Face <span className="text-emerald-500">Enrollment</span>
        </h1>
        <p className="text-[12px] text-slate-400 mt-1 font-medium">
          Manajemen identitas biometrik untuk {employees.length} personel
        </p>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',      val: employees.length, icon: UserCheck,    accent: 'text-slate-600',   bg: 'bg-slate-100'   },
          { label: 'Terdaftar',  val: enrolledCount,    icon: CheckCircle2, accent: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Pending',    val: pendingCount,     icon: AlertTriangle,accent: 'text-amber-600',   bg: 'bg-amber-100'   },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + i * 0.07 }}
            className="bg-white rounded-2xl px-4 py-3.5 border border-slate-100 flex items-center gap-3"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          >
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={16} className={s.accent} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <p className={`text-[22px] font-black leading-none tabular-nums ${s.accent}`}>{s.val}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── SEARCH ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="relative max-w-sm"
      >
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari nama atau departemen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-400 transition-all"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        />
      </motion.div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={28} className="animate-spin text-emerald-500" />
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Memuat data biometrik...</p>
        </div>
      )}

      {/* ── EMPTY ── */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white border border-slate-100 rounded-2xl p-16 text-center"
          style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3"
          >
            <Inbox size={20} className="text-slate-300" />
          </motion.div>
          <p className="text-[13px] font-bold text-slate-700">Tidak ada karyawan ditemukan</p>
          <p className="text-[11px] text-slate-400 mt-1">Coba kata kunci lain</p>
        </motion.div>
      )}

      {/* ── GRID ── */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((emp, idx) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-all relative group"
                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
              >
                {/* Status badge top-right */}
                <div className="absolute top-4 right-4">
                  {emp.faceRegistered
                    ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200"><CheckCircle2 size={10} /> Terdaftar</span>
                    : <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200"><AlertTriangle size={10} /> Pending</span>
                  }
                </div>

                {/* Avatar */}
                <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center overflow-hidden group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  {emp.photoUrl
                    ? <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                    : <span className="text-[20px] font-black">{emp.name.charAt(0)}</span>
                  }
                </div>

                {/* Name + dept */}
                <div>
                  <p className="text-desc font-bold text-slate-800 truncate leading-tight">{emp.name}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {emp.department || 'Staff'}
                  </span>
                </div>

                {/* Action button */}
                <button
                  onClick={() => showToast(emp.name)}
                  className={`w-full h-9 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition-all ${
                    emp.faceRegistered
                      ? 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100'
                      : 'text-white'
                  }`}
                  style={!emp.faceRegistered ? { background: '#10B981' } : undefined}
                >
                  <ScanFace size={13} />
                  {emp.faceRegistered ? 'Lihat Data' : 'Daftarkan'}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
