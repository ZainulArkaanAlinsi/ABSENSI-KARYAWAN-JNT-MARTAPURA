'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, where, addDoc } from 'firebase/firestore';
import { LeaveRequest } from '@/types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  Calendar, 
  FileText, 
  AlertCircle, 
  Inbox, 
  Loader2, 
  ChevronLeft,
  Search,
  Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LeaveRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let q = query(collection(db, 'leaves'), orderBy('createdAt', 'desc'));
    if (filter !== 'all') {
      q = query(collection(db, 'leaves'), where('status', '==', filter), orderBy('createdAt', 'desc'));
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest));
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, [filter]);

  const handleAction = async (requestId: string, status: 'approved' | 'rejected') => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    if (!confirm(`Apakah Anda yakin ingin ${status === 'approved' ? 'menyetujui' : 'menolak'} pengajuan ini?`)) return;
    
    setProcessing(requestId);
    try {
      // 1. Update Leave Status
      await updateDoc(doc(db, 'leaves', requestId), {
        status,
        updatedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString()
      });

      // 2. If approved, create attendance records for the range
      if (status === 'approved') {
        const start = new Date(request.startDate);
        const end = new Date(request.endDate);
        const dayCount = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const attendanceRef = collection(db, 'attendance');
        
        for (let i = 0; i < dayCount; i++) {
          const currentDate = new Date(start);
          currentDate.setDate(start.getDate() + i);
          const dateStr = format(currentDate, 'yyyy-MM-dd');

          // Check if record already exists to avoid duplicates
          await addDoc(attendanceRef, {
            userId: request.userId,
            employeeName: request.employeeName,
            employeeId: request.employeeId,
            department: request.department,
            date: dateStr,
            status: 'leave',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: 'system_leave'
          });
        }
      }
    } catch (error) {
      console.error("Error updating leave request:", error);
      alert("Gagal memproses permintaan. Silakan coba lagi.");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = requests.filter(r => 
    (r.employeeName?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (r.employeeId?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-(--border-color) flex items-center justify-center text-slate-500 hover:text-cyan-600 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter italic uppercase">Personnel <span className="text-cyan-600">Permissions</span></h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 ml-1">Manajemen Cuti, Sakit, & Izin JNE Martapura</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group hidden md:block">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search personnel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 h-12 bg-white dark:bg-slate-900 border border-(--border-color) rounded-2xl pl-12 pr-4 text-xs font-bold outline-none focus:ring-4 focus:ring-cyan-600/5 focus:border-cyan-600/30 transition-all"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="h-12 px-5 bg-cyan-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-xl shadow-cyan-600/10"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-32 flex flex-col items-center gap-4">
           <Loader2 size={40} className="animate-spin text-cyan-600" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Permission Logs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bento-card py-24 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-900 text-slate-300 mb-6 border border-(--border-color)">
            <Inbox size={40} />
          </div>
          <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase italic mb-2 tracking-tighter">Nexus Clear</h4>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tidak ada pengajuan izin yang perlu diproses saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((req, idx) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="bento-card group flex flex-col"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-cyan-600 flex items-center justify-center text-xl font-black text-white italic shadow-xl group-hover:bg-cyan-500 transition-colors">
                      {req.employeeName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-950 dark:text-white italic uppercase tracking-tighter leading-tight group-hover:text-cyan-600 transition-colors">{req.employeeName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{req.employeeId}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest italic">{req.department}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                    req.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    'bg-cyan-600/10 text-cyan-600 border-cyan-600/20'
                  }`}>
                    {req.status}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-(--border-color) mb-8 flex-1">
                   <div className="flex items-center gap-2 mb-4">
                      <FileText size={14} className="text-[#FFAE92]" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Reason / Notes</span>
                   </div>
                   <p className="text-xs font-medium text-slate-600 dark:text-slate-400 italic leading-relaxed">"{req.reason}"</p>
                   
                   <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-(--border-color)">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                          <Calendar size={12} /> Duration
                        </p>
                        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                           {req.totalDays} Hari <span className="text-slate-400 ml-1">({format(new Date(req.startDate), 'dd MMM')} - {format(new Date(req.endDate), 'dd MMM')})</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                          <AlertCircle size={12} /> Permission Type
                        </p>
                        <p className="text-[11px] font-black text-cyan-600 uppercase tracking-widest italic">{req.type}</p>
                      </div>
                   </div>
                </div>

                {req.status === 'pending' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAction(req.id, 'rejected')}
                      disabled={!!processing}
                      className="flex-1 h-14 bg-white dark:bg-slate-900 border border-(--border-color) text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      {processing === req.id ? <Loader2 size={16} className="animate-spin" /> : <X size={18} />}
                      Decline
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'approved')}
                      disabled={!!processing}
                      className="flex-1 h-14 bg-cyan-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-700 shadow-xl shadow-cyan-600/10 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      {processing === req.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                      Approve
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
