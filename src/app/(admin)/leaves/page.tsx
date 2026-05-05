'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { LeaveRequest } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  User, 
  FileText, 
  Inbox, 
  Loader2,
  ChevronRight,
  Layers,
  UserCheck,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'leaves'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest));
      setLeaves(data.filter(l => l.status === activeTab));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [activeTab]);

  const handleApprove = async (leave: LeaveRequest) => {
    setProcessing(leave.id);
    try {
      await updateDoc(doc(db, 'leaves', leave.id), {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Admin'
      });
    } catch (err) {
      alert('Gagal menyetujui pengajuan.');
    } finally {
      setProcessing(null);
    }
  };

  const openReject = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedLeave || !rejectReason.trim()) return;
    setProcessing(selectedLeave.id);
    try {
      await updateDoc(doc(db, 'leaves', selectedLeave.id), {
        status: 'rejected',
        rejectReason,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Admin'
      });
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      alert('Gagal menolak pengajuan.');
    } finally {
      setProcessing(null);
    }
  };

  const getLeaveLabel = (type: string) => {
    switch (type) {
      case 'sick': return 'Sakit';
      case 'annual': return 'Cuti Tahunan';
      case 'permission': return 'Izin Keperluan';
      default: return type;
    }
  };

  const pendingCount = leaves.length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Loader2 size={40} className="animate-spin text-[#E31E24]" />
      <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-[0.3em]">Memuat Data Otorisasi...</p>
    </div>
  );

  return (
    <div className="dash-root max-w-[1400px] mx-auto">
      {/* ── HEADER SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 bg-(--bg-card) p-10 rounded-4xl border border-(--border-primary) shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-red-600/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-(--text-primary) italic uppercase tracking-tighter mb-2">Manajemen Cuti & Izin</h2>
            <p className="text-(--text-secondary) font-medium text-sm max-w-xl">
              Tinjau dan proses pengajuan ketidakhadiran karyawan JNE Martapura secara real-time.
            </p>
          </div>
        </div>
        
        <div className="bg-(--bg-card) p-10 rounded-4xl border border-(--border-primary) shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest mb-2">Total Pengajuan</p>
          <p className="text-5xl font-black text-(--text-primary) tracking-tighter">{leaves.length}</p>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-(--bg-card) p-3 rounded-4xl border border-(--border-primary) shadow-sm mb-8">
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
                  ${isActive ? 'bg-[#E31E24] text-white shadow-lg' : 'text-(--text-muted) hover:text-(--text-primary)'}`}
              >
                {tab.label === 'Pending' ? 'Menunggu' : 
                 tab.label === 'Approved' ? 'Disetujui' : 
                 tab.label === 'Rejected' ? 'Ditolak' : tab.label}
                {tab.key === 'pending' && pendingCount > 0 && (
                  <span className="ml-2 bg-white/20 text-white px-1.5 py-0.5 rounded-md text-[9px]">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="relative flex-1 max-w-md hidden md:block">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-dim)" />
           <input 
             type="text" 
             placeholder="Cari pengajuan..."
             className="w-full pl-12 pr-6 py-3 rounded-2xl bg-white/5 border border-(--border-primary) text-xs font-bold outline-none focus:border-[#005596]/30 transition-all"
           />
        </div>
      </div>

      {/* ── LEAVE CARDS LIST ── */}
      <div className="grid gap-6">
        {leaves.length === 0 ? (
          <div className="bg-(--bg-card) rounded-4xl border border-(--border-primary) p-24 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 text-(--text-dim) mb-6">
              <Inbox size={40} />
            </div>
            <h4 className="text-lg font-black text-(--text-primary) uppercase italic mb-2">Antrean Kosong</h4>
            <p className="text-(--text-muted) font-bold uppercase tracking-widest text-[10px]">Tidak ada data pengajuan dalam kategori ini.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {leaves.map((leave) => (
              <motion.div
                key={leave.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#020617] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl hover:shadow-[#005596]/10 transition-all group relative"
              >
                {/* Subtle Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#005596]/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-stretch">
                  {/* Bagian Karyawan */}
                  <div className="p-10 lg:w-72 flex flex-col items-center justify-center text-center bg-white/2 border-b lg:border-b-0 lg:border-r border-white/5">
                    <div className="relative mb-4">
                      <div className="h-20 w-20 rounded-3xl bg-linear-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-3xl font-black text-white shadow-inner transition-transform group-hover:scale-105">
                        {leave.employeeName?.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-emerald-500 border-4 border-[#020617] shadow-sm" />
                    </div>
                    <h3 className="text-lg font-black text-white leading-tight mb-1 truncate w-full">{leave.employeeName}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{leave.employeeId}</p>
                  </div>

                  {/* Konten Izin */}
                  <div className="flex-1 p-10 flex flex-col justify-between">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Jenis Pengajuan</p>
                        <div className="inline-flex px-5 py-2.5 rounded-2xl bg-[#005596]/10 text-[#005596] text-[11px] font-black uppercase tracking-widest border border-[#005596]/20">
                          {getLeaveLabel(leave.type)}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Timeline & Durasi</p>
                        <div className="flex items-center gap-6">
                           <div className="text-center">
                              <p className="text-2xl font-black text-white tracking-tighter leading-none">
                                {leave.startDate ? format(new Date(leave.startDate), 'dd') : '--'}
                              </p>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                {leave.startDate ? format(new Date(leave.startDate), 'MMM', { locale: id }) : '--'}
                              </p>
                           </div>
                           <div className="h-px w-6 bg-white/10" />
                           <div className="text-center">
                              <p className="text-2xl font-black text-white tracking-tighter leading-none">
                                {leave.endDate ? format(new Date(leave.endDate), 'dd') : '--'}
                              </p>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                {leave.endDate ? format(new Date(leave.endDate), 'MMM', { locale: id }) : '--'}
                              </p>
                           </div>
                           <div className="ml-4 pl-6 border-l border-white/5">
                              <p className="text-xs font-black text-white uppercase tracking-widest">{leave.totalDays} Hari</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Kerja</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                       <div className="flex items-start gap-4 flex-1">
                          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                             <FileText size={18} className="text-slate-500" />
                          </div>
                          <p className="text-xs font-medium text-slate-400 italic leading-relaxed">
                            &ldquo;{leave.reason}&rdquo;
                          </p>
                       </div>

                       <div className="shrink-0">
                          {leave.status === 'pending' ? (
                            <div className="flex gap-3">
                              <button
                                onClick={() => openReject(leave)}
                                disabled={!!processing}
                                className="px-8 h-12 rounded-2xl bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                              >
                                Tolak
                              </button>
                              <button
                                onClick={() => handleApprove(leave)}
                                disabled={!!processing}
                                className="px-10 h-12 rounded-2xl bg-[#005596] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#005596]/30 hover:bg-[#004480] transition-all flex items-center justify-center gap-3 active:scale-95"
                              >
                                {processing === leave.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} strokeWidth={3} />}
                                Setujui
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                               <div className="text-right">
                                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Ditinjau oleh</p>
                                  <p className="text-[11px] font-black text-white uppercase tracking-tight">{leave.reviewedBy || 'Sistem'}</p>
                               </div>
                               <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                  <UserCheck size={16} />
                               </div>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                </div>

                {leave.documentUrl && (
                  <div className="absolute top-6 right-6">
                    <a 
                      href={leave.documentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-sm"
                    >
                      <Search size={18} />
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* MODAL ALASAN PENOLAKAN */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Alasan Penolakan"
        maxWidth={500}
      >
        <div className="space-y-6 pt-2">
          <p className="text-xs text-(--text-muted) font-medium">Berikan alasan mengapa pengajuan <span className="font-bold text-(--text-primary)">{selectedLeave?.employeeName}</span> ditolak.</p>
          <textarea
            className="w-full h-32 rounded-2xl border border-(--border-primary) bg-white/5 p-4 text-sm text-(--text-primary) outline-none focus:border-red-500/50 transition-all resize-none font-medium"
            placeholder="Tuliskan alasan penolakan di sini..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-3">
            <button onClick={() => setShowRejectModal(false)} className="flex-1 h-12 rounded-xl bg-white/5 text-(--text-muted) text-xs font-black uppercase tracking-widest">Batal</button>
            <button 
              onClick={handleRejectSubmit} 
              disabled={!rejectReason.trim() || !!processing}
              className="flex-2 h-12 rounded-xl bg-[#E31E24] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-red-600/20"
            >
              Konfirmasi Penolakan
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
