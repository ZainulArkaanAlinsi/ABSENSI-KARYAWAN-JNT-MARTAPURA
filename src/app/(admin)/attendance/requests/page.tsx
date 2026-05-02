'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { EditRequest } from '@/types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, User, FileText, AlertCircle } from 'lucide-react';

export default function EditRequestsPage() {
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await updateDoc(doc(db, 'edit_requests', requestId), {
        status,
        updatedAt: new Date().toISOString()
      });
      // Logic to actually apply changes to attendance record would go here in a real app
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  return (
    <AdminLayout title="Koreksi Absensi" subtitle="Persetujuan Perubahan Data">
      <div className="dash-root">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900">Permintaan Koreksi</h2>
          <p className="text-slate-500">Daftar pengajuan perubahan data absensi dari karyawan.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jne-red"></div></div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-20 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 mb-4">
              <FileText size={32} />
            </div>
            <p className="text-slate-500 font-bold">Tidak ada permintaan koreksi saat ini.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 font-black border border-slate-100">
                        {req.userName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 leading-none mb-1">{req.userName}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Karyawan ID: {req.userId.slice(0, 8)}</p>
                      </div>
                      <div className={`ml-auto md:ml-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        req.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {req.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <AlertCircle size={10} /> Alasan Koreksi
                        </p>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed italic">"{req.reason}"</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Clock size={10} /> Diajukan Pada
                        </p>
                        <p className="text-xs text-slate-700 font-bold">{format(new Date(req.createdAt), 'dd MMMM yyyy HH:mm', { locale: undefined })}</p>
                      </div>
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex md:flex-col justify-end gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(req.id, 'approved')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                      >
                        <Check size={16} /> SETUJUI
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'rejected')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition-all"
                      >
                        <X size={16} /> TOLAK
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
