'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  where,
  addDoc,
} from 'firebase/firestore';
import { LeaveRequest } from '@/types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Calendar,
  FileText,
  Inbox,
  RefreshCw,
  ChevronLeft,
  Search,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock3,
  Download,
  Filter,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';
import { BentoCard } from '@/components/ui/BentoCard';
import { StatusBadge } from '@/components/ui/Badge';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

// ── SKELETON LOADERS ──

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-100 rounded-2xl ${className}`} />
);

// ── COMPONENTS ──

function StatCard({ label, value, icon: Icon, color, index }: any) {
  return (
    <BentoCard 
      index={index}
      className="p-10 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} bg-opacity-10`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
      </div>
      <div>
        <p className="text-desc font-medium text-slate-400 mb-2 uppercase tracking-widest">{label}</p>
        <h3 className="text-stats font-extrabold text-slate-900 tracking-tight leading-none tabular-nums">
          {value}
        </h3>
      </div>
    </BentoCard>
  );
}

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
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LeaveRequest));
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, [filter]);

  const handleAction = async (requestId: string, status: 'approved' | 'rejected') => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    if (!confirm(`Are you sure you want to ${status} this request?`)) return;

    setProcessing(requestId);
    try {
      await updateDoc(doc(db, 'leaves', requestId), {
        status,
        updatedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
      });

      if (status === 'approved') {
        const start = new Date(request.startDate);
        const end = new Date(request.endDate);
        const dayCount = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const attendanceRef = collection(db, 'attendance');
        for (let i = 0; i < dayCount; i++) {
          const currentDate = new Date(start);
          currentDate.setDate(start.getDate() + i);
          const dateStr = format(currentDate, 'yyyy-MM-dd');

          await addDoc(attendanceRef, {
            userId: request.userId,
            employeeName: request.employeeName,
            employeeId: request.employeeId,
            department: request.department,
            date: dateStr,
            status: 'leave',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: 'system_leave',
          });
        }
      }
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setProcessing(null);
    }
  };

  const filtered = useMemo(() => {
    return requests.filter(
      (r) =>
        (r.employeeName?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (r.employeeId?.toLowerCase() || '').includes(search.toLowerCase()),
    );
  }, [requests, search]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }), [requests]);

  return (
    <div className="flex flex-col gap-10 w-full pb-20 max-w-[1440px] mx-auto">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-6">
        <div className="space-y-6">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-mustard transition-colors group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-h1 font-extrabold text-slate-900 tracking-tight leading-none mb-3">
              Leave <span className="text-mustard">Requests</span>
            </h1>
            <p className="text-desc font-medium text-slate-400 max-w-xl">
              Review and authorize employee leave applications and operational permissions.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <AnimatedButton className="h-14 px-8 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-600 shadow-sm hover:border-mustard transition-all flex items-center gap-3">
            <Download size={18} />
            Export Archive
          </AnimatedButton>
          <AnimatedButton className="h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-mustard transition-all group">
            <RefreshCw size={24} className="group-active:rotate-180 transition-transform duration-500" />
          </AnimatedButton>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard index={0} label="Total Records" value={stats.total} icon={FileText} color="bg-indigo-600" />
        <StatCard index={1} label="Awaiting Review" value={stats.pending} icon={Clock3} color="bg-amber-600" />
        <StatCard index={2} label="Authorized" value={stats.approved} icon={CheckCircle2} color="bg-emerald-600" />
        <StatCard index={3} label="Terminated" value={stats.rejected} icon={XCircle} color="bg-rose-600" />
      </div>

      {/* ── FILTERS ── */}
      <BentoCard className="p-4" hoverEffect={false}>
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-mustard transition-colors" />
            <input
              type="text"
              placeholder="Filter by name, ID, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 bg-slate-50 border border-transparent rounded-xl pl-16 pr-8 text-desc font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-mustard focus:border-opacity-20 transition-all"
            />
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-56">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full h-14 bg-white border border-slate-100 rounded-xl px-6 pr-12 text-[11px] font-bold text-slate-600 uppercase tracking-widest outline-none cursor-pointer hover:border-mustard transition-all appearance-none"
              >
                <option value="all">ALL CLASSIFICATIONS</option>
                <option value="pending">PENDING REVIEW</option>
                <option value="approved">AUTHORIZED</option>
                <option value="rejected">TERMINATED</option>
              </select>
              <Filter size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
            </div>
          </div>
        </div>
      </BentoCard>

      {/* ── CONTENT GRID ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-96 bg-white rounded-3xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <BentoCard className="p-40 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-8">
            <Inbox size={40} />
          </div>
          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Archive is empty</p>
        </BentoCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((req, idx) => (
              <BentoCard
                key={req.id}
                index={idx}
                className="p-10 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-10">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-[20px] font-black group-hover:bg-mustard transition-colors shadow-sm">
                        {req.employeeName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="text-[18px] font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-mustard transition-colors">
                          {req.employeeName}
                        </h3>
                        <p className="text-[12px] font-medium text-slate-400 uppercase tracking-widest mt-1">{req.employeeId}</p>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-mustard group-hover:border-opacity-10 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                         <FileText size={16} className="text-mustard" />
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statement</span>
                      </div>
                      <p className="text-desc font-medium text-slate-600 leading-relaxed italic">
                        "{req.reason}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-slate-50 rounded-2xl text-center">
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                           <p className="text-desc font-extrabold text-slate-900">{req.totalDays} Days</p>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-2xl text-center">
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Classification</p>
                           <p className="text-desc font-extrabold text-mustard uppercase tracking-tight">{req.type}</p>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 flex items-center gap-4 mt-auto">
                  {req.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleAction(req.id, 'rejected')}
                        disabled={!!processing}
                        className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center"
                      >
                        <X size={20} />
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'approved')}
                        disabled={!!processing}
                        className="flex-1 h-14 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-mustard transition-all shadow-sm"
                      >
                        {processing === req.id ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
                        Authorize
                      </button>
                    </>
                  ) : (
                    <div className="w-full py-5 bg-slate-50 rounded-2xl text-center border border-slate-100 flex items-center justify-center gap-3">
                       <ShieldCheck size={16} className="text-slate-300" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Record Finalized</span>
                    </div>
                  )}
                </div>
              </BentoCard>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}