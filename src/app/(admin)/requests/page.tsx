'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Inbox, 
  Loader2,
  Search,
  MessageSquare,
  AlertCircle,
  Zap,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { GlassCard, InteractiveButton } from '@/components/ui/Interactive';

const TABS = [
  { key: 'pending', label: 'Antrean' },
  { key: 'approved', label: 'Disetujui' },
  { key: 'rejected', label: 'Ditolak' },
];

export default function RequestCenterPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');

  useEffect(() => {
    setLoading(true);
    // Unified listener for both leaves and overtime/attendance requests
    const qLeaves = query(collection(db, 'leaves'), orderBy('createdAt', 'desc'));
    const qAttendance = query(collection(db, 'attendance'), orderBy('createdAt', 'desc'));

    const unsubLeaves = onSnapshot(qLeaves, (snapshot) => {
      const leavesData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        source: 'leave' 
      }));
      
      const unsubAttendance = onSnapshot(qAttendance, (snapAtt) => {
        const attData = snapAtt.docs
          .map(doc => ({ id: doc.id, ...doc.data(), source: 'attendance' }))
          .filter((a: any) => a.status === 'overtime' || a.status === 'pending');

        const combined = [...leavesData, ...attData].sort((a: any, b: any) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateB - dateA;
        });

        setRequests(combined.filter((r: any) => r.status === activeTab || (activeTab === 'pending' && r.status === 'overtime')));
        setLoading(false);
      });
      
      return () => unsubAttendance();
    });

    return () => unsubLeaves();
  }, [activeTab]);

  const handleAction = async () => {
    if (!selectedReq || (actionType === 'reject' && !reason.trim())) return;
    
    // 🚀 OPTIMISTIC UI UPDATE
    const previousRequests = [...requests];
    const requestId = selectedReq.id;
    const status = actionType === 'approve' ? 'approved' : 'rejected';
    
    // Update local state immediately
    setRequests(prev => prev.filter(r => r.id !== requestId));
    setShowActionModal(false);
    
    try {
      const collectionName = selectedReq.source === 'leave' ? 'leaves' : 'attendance';
      
      await updateDoc(doc(db, collectionName, requestId), {
        status,
        adminReason: reason,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Admin Utama'
      });

      // Send automated notification back to user
      await addDoc(collection(db, 'notifications'), {
        userId: selectedReq.userId,
        title: actionType === 'approve' ? 'Permintaan Disetujui ✅' : 'Permintaan Ditolak ❌',
        message: `Permintaan ${selectedReq.type || 'Lembur'} Anda telah ${status} oleh Admin. ${reason ? 'Alasan: ' + reason : ''}`,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      setReason('');
    } catch (err) {
      console.error("Action failed, rolling back", err);
      // ROLLBACK on error
      setRequests(previousRequests);
      alert('Gagal memproses permintaan. Sinyal dikembalikan ke antrean.');
    } finally {
      setProcessing(null);
    }
  };

  const getLabel = (req: any) => {
    if (!req) return 'Request';
    if (req.source === 'leave') {
      switch (req.type) {
        case 'sick': return 'Sakit';
        case 'annual': return 'Cuti';
        case 'permission': return 'Izin';
        default: return 'Izin';
      }
    }
    return 'Lembur';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-48 gap-6 animate-pulse">
      <div className="w-16 h-16 border-4 border-t-cyan-600 border-slate-200 rounded-full animate-spin" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Sinkronisasi Antrean JNE...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* ── HEADER ── */}
      <GlassCard className="p-10 border-none bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 blur-[100px] -mr-40 -mt-40" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-cyan-400 shadow-2xl">
              <Inbox size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Request Center</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Pusat Otorisasi Terpadu JNE Martapura</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 px-8 py-4 rounded-2xl border border-white/5 text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Pending</p>
              <p className="text-2xl font-black text-cyan-400">{requests.filter(r => r.status === 'pending' || r.status === 'overtime').length}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── TABS & FILTER ── */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex p-1.5 bg-slate-200 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-white/5 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.key 
                ? 'bg-slate-950 text-white shadow-xl' 
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari Operatif atau ID..."
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-xs font-bold outline-none focus:ring-2 ring-cyan-600/20"
          />
        </div>
      </div>

      {/* ── LIST ── */}
      <div className="grid gap-6">
        {requests.length === 0 ? (
          <div className="py-32 flex flex-col items-center opacity-50">
            <AlertCircle size={64} className="text-slate-300 mb-6" />
            <p className="text-sm font-black uppercase tracking-widest italic text-slate-400">Tidak ada permintaan aktif</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {requests.map((req) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <GlassCard className="p-8 border-none flex flex-col lg:flex-row items-center gap-8 group hover:shadow-2xl transition-all">
                  <div className="flex items-center gap-6 flex-1 w-full">
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black italic text-xl shadow-xl group-hover:rotate-6 transition-transform">
                      {req.employeeName?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{req.employeeName}</h3>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          req.source === 'leave' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {getLabel(req)}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.employeeId} • {req.department}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-10 flex-2 w-full lg:w-auto">
                    <div className="text-center md:text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Periode / Waktu</p>
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-cyan-600" />
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                          {req.source === 'leave' 
                            ? `${format(new Date(req.startDate), 'dd MMM')} - ${format(new Date(req.endDate), 'dd MMM')}`
                            : `${req.attendanceDate} (${req.overtimeMinutes || 0} Menit)`
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5 italic">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        &ldquo;{req.reason || req.notes || 'Tanpa keterangan'}&rdquo;
                      </p>
                    </div>

                    <div className="flex gap-3 shrink-0">
                      {req.status === 'pending' || req.status === 'overtime' ? (
                        <>
                          <InteractiveButton
                            onClick={() => {
                              setSelectedReq(req);
                              setActionType('reject');
                              setShowActionModal(true);
                            }}
                            className="px-6 h-12 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all"
                          >
                            Tolak
                          </InteractiveButton>
                          <InteractiveButton
                            onClick={() => {
                              setSelectedReq(req);
                              setActionType('approve');
                              setShowActionModal(true);
                            }}
                            className="px-8 h-12 bg-cyan-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-600/30 hover:bg-cyan-500 transition-all flex items-center gap-2"
                          >
                            <CheckCircle size={14} strokeWidth={3} />
                            Setujui
                          </InteractiveButton>
                        </>
                      ) : (
                        <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border ${
                          req.status === 'approved' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-red-500/5 border-red-500/20 text-red-500'
                        }`}>
                          {req.status === 'approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{req.status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── ACTION MODAL ── */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={actionType === 'approve' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}
      >
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Permintaan dari</p>
            <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{selectedReq?.employeeName}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{getLabel(selectedReq)} • {selectedReq?.reason || selectedReq?.notes}</p>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">
              Alasan / Catatan Admin {actionType === 'reject' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              className="w-full h-32 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:ring-2 ring-cyan-600/20 resize-none transition-all"
              placeholder={actionType === 'approve' ? 'Tambahkan catatan opsional...' : 'Wajib memberikan alasan penolakan...'}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <InteractiveButton
              onClick={() => setShowActionModal(false)}
              className="flex-1 h-14 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest"
            >
              Batal
            </InteractiveButton>
            <InteractiveButton
              onClick={handleAction}
              disabled={processing === selectedReq?.id || (actionType === 'reject' && !reason.trim())}
              className={`flex-2 h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl transition-all ${
                actionType === 'approve' 
                ? 'bg-cyan-600 text-white shadow-cyan-600/20' 
                : 'bg-red-500 text-white shadow-red-500/20'
              }`}
            >
              {processing ? <Loader2 className="animate-spin mx-auto" size={20} /> : `Konfirmasi ${actionType === 'approve' ? 'Setuju' : 'Tolak'}`}
            </InteractiveButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
