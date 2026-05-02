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
                className="bg-(--bg-card) rounded-4xl border border-(--border-primary) overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center">
                  {/* Bagian Karyawan */}
                  <div className="p-8 lg:w-80 lg:border-r border-(--border-primary) bg-white/2">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-(--border-primary) flex items-center justify-center text-xl font-black text-(--text-primary) shadow-sm group-hover:border-[#E31E24]/50 transition-all">
                        {leave.employeeName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-black text-(--text-primary) leading-tight mb-1 truncate">{leave.employeeName}</h3>
                        <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">{leave.employeeId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Konten Izin */}
                  <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <p className="text-[9px] font-black text-(--text-muted) uppercase tracking-widest mb-3">Jenis Pengajuan</p>
                      <span className="px-4 py-1.5 rounded-xl bg-[#005596]/10 text-[#005596] text-[11px] font-black uppercase tracking-widest border border-[#005596]/20">
                        {getLeaveLabel(leave.type)}
                      </span>
                    </div>

                    <div>
                      <p className="text-[9px] font-black text-(--text-muted) uppercase tracking-widest mb-3">Timeline & Durasi</p>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-black text-(--text-primary)">
                          <Calendar size={14} className="text-(--text-dim)" />
                          {leave.startDate ? format(new Date(leave.startDate), 'dd MMM', { locale: id }) : '?'}
                          <span className="text-(--text-dim)">—</span>
                          {leave.endDate ? format(new Date(leave.endDate), 'dd MMM', { locale: id }) : '?'}
                        </div>
                        <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest ml-6">{leave.totalDays} Hari Kerja</p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center">
                       {leave.status === 'pending' ? (
                         <div className="flex gap-2">
                           <button
                             onClick={() => openReject(leave)}
                             disabled={!!processing}
                             className="flex-1 h-12 rounded-xl border border-(--border-primary) bg-white/5 text-(--text-muted) text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-600 transition-all"
                           >
                             Tolak
                           </button>
                           <button
                             onClick={() => handleApprove(leave)}
                             disabled={!!processing}
                             className="flex-1.5 h-12 rounded-xl bg-[#005596] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#005596]/20 hover:bg-[#004480] transition-all flex items-center justify-center gap-2"
                           >
                             {processing === leave.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={14} />}
                             Setujui
                           </button>
                         </div>
                       ) : (
                         <div className="flex items-center justify-end gap-3">
                            <div className="text-right">
                               <p className="text-[9px] font-black text-(--text-muted) uppercase tracking-widest mb-1">Ditinjau oleh</p>
                               <div className="flex items-center gap-2 justify-end">
                                  <UserCheck size={14} className="text-green-500" />
                                  <span className="text-xs font-black text-(--text-primary) uppercase">{leave.reviewedBy || 'Sistem'}</span>
                                </div>
                            </div>
                         </div>
                       )}
                    </div>
                  </div>
                </div>

                {/* Footer Keterangan */}
                <div className="px-8 py-5 bg-white/2 border-t border-(--border-primary) flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <FileText size={14} className="text-(--text-dim)" />
                    <p className="text-xs font-medium text-(--text-secondary) italic">
                      &ldquo;{leave.reason}&rdquo;
                    </p>
                  </div>
                  {leave.documentUrl && (
                    <a href={leave.documentUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-[#005596] uppercase tracking-widest hover:underline">
                      Lihat Bukti
                    </a>
                  )}
                </div>
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
