'use client';

import { useState, useEffect } from 'react';
import { getEmployees } from '@/lib/firestore';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Search, ScanFace, CheckCircle2, XCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FaceEnrollmentPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Failed to load employees for biometrics', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) || 
    (emp.department && emp.department.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <PageLoader />
        <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-[0.3em]">Memuat Data Biometrik...</p>
      </div>
    );
  }

  // Statistik Ringkas
  const enrolledCount = employees.filter(e => e.faceData).length;
  const pendingCount = employees.length - enrolledCount;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-(--bg-card) p-8 rounded-4xl border border-(--border-primary) shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-[#005596]/10 text-[#005596]">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest leading-none mb-1.5">Total Personel</p>
            <h3 className="text-2xl font-black text-(--text-primary) tracking-tighter">{employees.length}</h3>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-(--bg-card) p-8 rounded-4xl border border-(--border-primary) shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest leading-none mb-1.5">Wajah Terdaftar</p>
            <h3 className="text-2xl font-black text-(--text-primary) tracking-tighter">{enrolledCount}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-(--bg-card) p-8 rounded-4xl border border-(--border-primary) shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-amber-500/10 text-amber-500">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest leading-none mb-1.5">Belum Terdaftar</p>
            <h3 className="text-2xl font-black text-(--text-primary) tracking-tighter">{pendingCount}</h3>
          </div>
        </motion.div>
      </div>

      {/* ── Action Bar ── */}
      <div className="bg-(--bg-card) p-6 rounded-4xl border border-(--border-primary) shadow-sm flex flex-col md:flex-row gap-4 items-center">
         <div className="flex-1 relative w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-(--text-dim) group-focus-within:text-[#E31E24] transition-colors" size={18} />
            <input 
               type="text" 
               placeholder="Cari berdasarkan nama atau divisi..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-(--border-primary) outline-none focus:border-[#E31E24]/30 font-bold text-(--text-primary) transition-all shadow-sm"
            />
         </div>
      </div>

      {/* ── Employee Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredEmployees.map((emp, idx) => (
            <motion.div 
              key={emp.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-(--bg-card) p-6 rounded-3xl border border-(--border-primary) shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:border-[#E31E24]/30 transition-all"
            >
              {emp.faceData ? (
                <div className="absolute top-4 right-4 text-emerald-500">
                  <CheckCircle2 size={18} />
                </div>
              ) : (
                <div className="absolute top-4 right-4 text-amber-500">
                  <AlertTriangle size={18} />
                </div>
              )}

              <div className="h-20 w-20 rounded-full bg-black/20 border-4 border-white/5 flex items-center justify-center mb-4 relative overflow-hidden group-hover:border-[#E31E24]/20 transition-all">
                {emp.photoUrl ? (
                  <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-(--text-muted)">{emp.name.charAt(0)}</span>
                )}
                {/* Scanner animation effect */}
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#E31E24]/20 to-transparent -translate-y-full group-hover:animate-[scan_2s_ease-in-out_infinite]" />
              </div>

              <h4 className="font-bold text-(--text-primary) mb-1 truncate w-full">{emp.name}</h4>
              <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-(--text-dim) mb-6">
                {emp.department || 'Staff'}
              </span>

              <button className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                emp.faceData 
                  ? 'bg-white/5 text-(--text-primary) hover:bg-white/10 border border-white/5' 
                  : 'bg-[#E31E24]/10 text-[#E31E24] hover:bg-[#E31E24]/20 border border-[#E31E24]/20'
              }`}>
                <ScanFace size={16} />
                {emp.faceData ? 'Perbarui Data Wajah' : 'Daftarkan Wajah'}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
      `}</style>
    </div>
  );
}
