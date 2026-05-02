'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { EditRequest } from '@/types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, FileText, AlertCircle, Inbox, Loader2 } from 'lucide-react';

export default function EditRequestsPage() {
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'edit_requests'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EditRequest));
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAction = async (requestId: string, status: 'approved' | 'rejected') => {
    setProcessing(requestId);
    try {
      await updateDoc(doc(db, 'edit_requests', requestId), {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating request:", error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 size={40} className="animate-spin text-[#E31E24]" />
        <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-[0.3em]">Memuat Antrean Koreksi...</p>
      </div>
    );
  }

  return (
    <div className="dash-root max-w-[1400px] mx-auto">
      <div className="mb-10 bg-(--bg-card) p-10 rounded-4xl border border-(--border-primary) shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-amber-500/5 to-transparent pointer-events-none" />
        <div className="h-20 w-20 rounded-3xl bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20 relative z-10">
          <FileText size={40} />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-(--text-primary) italic uppercase tracking-tighter">Antrean Koreksi</h2>
          <p className="text-(--text-muted) font-bold uppercase tracking-widest text-[11px] mt-2">Daftar pengajuan perubahan data absensi dari karyawan JNE Martapura.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-(--bg-card) rounded-4xl border border-(--border-primary) p-24 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 text-(--text-dim) mb-6">
            <Inbox size={40} />
          </div>
          <h4 className="text-lg font-black text-(--text-primary) uppercase italic mb-2">Semua Beres</h4>
          <p className="text-(--text-muted) font-bold uppercase tracking-widest text-[10px]">Tidak ada permintaan koreksi saat ini.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {requests.map((req, idx) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-(--bg-card) rounded-4xl border border-(--border-primary) p-8 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-5 mb-8">
                      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-(--border-primary) flex items-center justify-center text-xl font-black text-(--text-primary) group-hover:border-[#E31E24]/30 transition-all">
                        {req.userName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-black text-(--text-primary) italic uppercase tracking-tight truncate leading-tight">{req.userName}</h3>
                        <p className="text-[10px] font-black text-(--text-dim) uppercase tracking-widest mt-1">ID: {req.userId.slice(0, 8)}</p>
                      </div>
                      <div className={`ml-auto px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        req.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {req.status === 'pending' ? 'Menunggu' : req.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-white/2 border border-(--border-primary)">
                        <p className="text-[9px] font-black text-(--text-muted) uppercase tracking-widest mb-3 flex items-center gap-2">
                          <AlertCircle size={14} className="text-[#E31E24]" /> Alasan Koreksi
                        </p>
                        <p className="text-xs text-(--text-secondary) font-medium italic leading-relaxed">"{req.reason}"</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-white/2 border border-(--border-primary)">
                        <p className="text-[9px] font-black text-(--text-muted) uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Clock size={14} className="text-[#005596]" /> Tanggal Pengajuan
                        </p>
                        <p className="text-xs text-(--text-primary) font-black">{format(new Date(req.createdAt), 'dd MMM yyyy HH:mm')}</p>
                        <p className="text-[9px] font-bold text-(--text-dim) uppercase tracking-widest mt-1">Waktu Server</p>
                      </div>
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex md:flex-col justify-center gap-3 md:min-w-[160px]">
                      <button
                        onClick={() => handleAction(req.id, 'approved')}
                        disabled={!!processing}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                      >
                        {processing === req.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                        Setujui
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'rejected')}
                        disabled={!!processing}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-(--border-primary) text-(--text-muted) rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all"
                      >
                        <X size={18} /> Abaikan
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
