'use client';

import {
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  Eye,
  Clock,
  Inbox,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Layers,
  Activity,
  UserCheck,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import {
  useLeaveManagement,
  TABS,
  LEAVE_TYPE_LABELS,
} from '@/hooks/useLeaveManagement';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeavesPage() {
  const {
    activeTab,
    setActiveTab,
    leaves,
    loading,
    selectedLeave,
    showRejectModal,
    setShowRejectModal,
    rejectReason,
    setRejectReason,
    processing,
    handleApprove,
    handleRejectSubmit,
    openReject,
    pendingCount,
  } = useLeaveManagement();

  return (
    <AdminLayout title="Authorizations" subtitle="Leaves Matrix">
      <div className="dash-root">
        {/* ── Header Row ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="dash-header-row mb-6 items-end"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED] shadow-[0_0_8px_#7C3AED]" />
              <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-[0.3em]">Personnel Governance</span>
            </div>
            <h2 className="dash-page-title leading-none">Authorization Queue</h2>
            <p className="dash-page-sub mt-2 text-slate-500">Processing leave requests and operational status override</p>
          </div>

          <div className="flex items-center gap-2">
             <div
                className="flex items-center gap-2 rounded-xl bg-white/3 border border-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-400"
              >
                <Activity size={14} className={pendingCount > 0 ? "text-amber-500 animate-pulse" : "text-slate-600"} />
                <span>Queue: <span className={pendingCount > 0 ? "text-white" : "text-slate-600"}>{pendingCount} Pending</span></span>
              </div>
          </div>
        </motion.div>

        {/* ── Tab Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex bg-white/3 border border-white/5 p-1 rounded-2xl backdrop-blur-xl">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="relative rounded-xl px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all"
                  style={{
                    background: isActive ? '#7C3AED' : 'transparent',
                    color: isActive ? '#fff' : '#64748b',
                  }}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="tab-active"
                      className="absolute inset-0 bg-[#7C3AED] rounded-xl -z-10 shadow-[0_4px_12px_rgba(124,58,237,0.35)]"
                    />
                  )}
                  {tab.label}
                  {tab.key === 'pending' && pendingCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E04B3A] text-[9px] font-black text-white border-2 border-[#0F172A]">
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button className="dash-btn-secondary text-[10px] py-2 px-4 flex items-center gap-2">
            <Layers size={14} />
            Matrix View
          </button>
        </motion.div>

        {/* ── Requests List ── */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <PageLoader />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Accessing Data Stream...</p>
            </div>
          ) : leaves.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="dash-card flex flex-col items-center gap-6 py-24 text-center border-dashed border-white/10"
            >
              <div className="h-16 w-16 items-center justify-center rounded-2xl bg-white/2 border border-white/5 flex">
                <Inbox size={32} className="text-slate-800" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Operational Queue Empty</h4>
                <p className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">No personnel items requiring immediate authorization at this time.</p>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {leaves.map((leave, idx) => (
                <motion.div
                  key={leave.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: idx * 0.05 }}
                  className="dash-card p-0 overflow-hidden group hover:border-[#7C3AED]/20 transition-all"
                >
                  <div className="flex flex-col xl:flex-row xl:items-stretch">
                    {/* Personnel Identity Pillar */}
                    <div className="p-6 xl:w-72 bg-white/1 border-b xl:border-b-0 xl:border-r border-white/5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 flex items-center justify-center rounded-2xl font-black text-lg border border-[#7C3AED]/20 bg-[#7C3AED]/10 text-[#7C3AED] shadow-sm shadow-[#7C3AED]/10 group-hover:scale-105 transition-transform">
                          {leave.employeeName?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-black text-white group-hover:text-[#7C3AED] transition-colors leading-tight mb-0.5">{leave.employeeName}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{leave.employeeId}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <Layers size={10} className="text-[#7C3AED]" />
                          {leave.department}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          <Clock size={10} />
                          {leave.createdAt ? format(new Date(leave.createdAt), 'dd MMM, HH:mm') : 'Pending'}
                        </div>
                      </div>
                    </div>

                    {/* Operational Intent Details */}
                    <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-8">
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
                          <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Intent Protocol</p>
                            <span className="inline-flex rounded-lg border border-[#7C3AED]/20 bg-[#7C3AED]/10 px-3 py-1.5 text-[10px] font-black text-[#7C3AED] uppercase tracking-widest">
                              {LEAVE_TYPE_LABELS[leave.type] || leave.type}
                            </span>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Timeline</p>
                            <div className="flex items-center gap-2 text-[13px] font-black text-white tabular-nums">
                              <Calendar size={14} className="text-slate-500" />
                              {leave.startDate ? format(new Date(leave.startDate), 'MMM dd') : '?'}
                              <span className="text-white/20">—</span>
                              {leave.endDate ? format(new Date(leave.endDate), 'MMM dd') : '?'}
                            </div>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Yield Loss</p>
                            <p className="text-sm font-black text-white flex items-center gap-1.5">
                              {leave.totalDays} <span className="text-[10px] text-slate-500 uppercase">Production Cycles</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Matrix Status</p>
                            <StatusBadge status={leave.status} />
                          </div>
                       </div>

                       {/* Action Block */}
                       <div className="flex items-center justify-end gap-3 min-w-[200px]">
                          {leave.documentUrl && (
                            <a
                              href={leave.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/5 bg-white/3 text-slate-500 hover:text-[#7C3AED] hover:border-[#7C3AED]/40 transition-all hover:bg-[#7C3AED]/5"
                              title="Inspect Evidence"
                            >
                              <FileText size={18} />
                            </a>
                          )}

                          {leave.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => openReject(leave)}
                                disabled={!!processing}
                                className="h-10 px-4 rounded-xl border border-[#E04B3A]/20 bg-[#E04B3A]/5 text-[#E04B3A] text-[11px] font-black uppercase tracking-widest hover:bg-[#E04B3A]/10 transition-all disabled:opacity-30"
                              >
                                {processing === leave.id ? <Loader2 size={16} className="animate-spin" /> : 'Override'}
                              </button>
                              <button
                                onClick={() => handleApprove(leave)}
                                disabled={!!processing}
                                className="h-10 px-6 rounded-xl bg-[#7C3AED] text-white text-[11px] font-black uppercase tracking-widest shadow-[0_4px_12px_rgba(124,58,237,0.35)] hover:bg-[#6D28D9] transition-all disabled:opacity-30 flex items-center gap-2"
                              >
                                <CheckCircle size={14} strokeWidth={3} />
                                Authorize
                              </button>
                            </div>
                          ) : (
                            <div className="text-right flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Resolved by</p>
                                <p className="text-[12px] font-black text-white flex items-center justify-end gap-2 uppercase tracking-wide">
                                  <UserCheck size={12} className="text-[#10B981]" />
                                  {leave.reviewedBy || 'System Controller'}
                                </p>
                              </div>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>

                  {/* Supplemental Documentation Strip */}
                  <div className="bg-white/0.5 border-t border-white/5 p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-[#7C3AED]/5 border border-[#7C3AED]/10">
                         <FileText size={12} className="text-[#7C3AED]" />
                      </div>
                      <p className="text-[12px] font-medium text-slate-500 italic">
                        &ldquo;{leave.reason}&rdquo;
                      </p>
                    </div>
                    
                    {leave.rejectionReason && (
                      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#E04B3A]/5 border border-[#E04B3A]/10">
                        <ShieldAlert size={14} className="text-[#E04B3A]" />
                        <p className="text-[11px] font-bold text-[#E04B3A] uppercase tracking-wide italic">
                          Override Logic: &ldquo;{leave.rejectionReason}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Override Protocol Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Protocol Override"
        maxWidth={520}
      >
        {selectedLeave && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-4 rounded-2xl p-4 bg-[#E04B3A]/5 border border-[#E04B3A]/20">
               <div className="h-10 w-10 flex items-center justify-center rounded-xl font-black text-sm bg-[#E04B3A] text-white shadow-lg shadow-[#E04B3A]/20">
                  {selectedLeave.employeeName?.charAt(0)}
               </div>
               <div>
                  <p className="text-sm font-black text-white uppercase tracking-wider">{selectedLeave.employeeName}</p>
                  <p className="text-[11px] font-bold text-[#E04B3A] uppercase tracking-widest">
                    {LEAVE_TYPE_LABELS[selectedLeave.type]} Protocol • {selectedLeave.totalDays} Cycle Deduction
                  </p>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Override Logic Justification</label>
              <textarea
                className="w-full h-32 rounded-2xl border border-white/10 bg-white/3 p-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#E04B3A]/30 focus:bg-white/5 transition-all resize-none"
                placeholder="Declare the technical reason for this authorization override..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 h-12 rounded-xl border border-white/10 bg-white/5 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectReason.trim() || !!processing}
                className="flex-[1.5] h-12 flex items-center justify-center gap-2 rounded-xl bg-[#E04B3A] text-[11px] font-black text-white uppercase tracking-widest shadow-[0_4px_12px_rgba(224,75,58,0.35)] hover:bg-red-600 transition-all disabled:opacity-30"
              >
                {processing ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
                Confirm Override
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
