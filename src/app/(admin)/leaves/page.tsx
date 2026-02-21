'use client';

import { CheckCircle, XCircle, FileText, Loader2, Eye, ShieldAlert, Clock, Inbox, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useLeaveManagement, TABS, LEAVE_TYPE_LABELS } from '@/hooks/useLeaveManagement';
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
    <AdminLayout title="Adjudication Matrix" subtitle="Manage and verify personnel leave authorization protocols.">
      <div className="relative pb-24 px-8 lg:px-12 max-w-[1600px] mx-auto">
        {/* Dynamic Field Ambient Effects */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none animate-pulse -z-10" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-jne-red/5 rounded-full blur-[120px] pointer-events-none animate-[pulse_8s_infinite_1s] -z-10" />

        <div className="relative z-10 space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-10"
          >
            <div className="glass-card p-2 rounded-2xl flex gap-2">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                    activeTab === tab.key 
                      ? 'text-white' 
                      : 'text-white/30 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  {activeTab === tab.key && (
                    <motion.div 
                      layoutId="activeTabUnderlay"
                      className="absolute inset-0 bg-linear-to-r from-jne-red to-jne-danger rounded-xl shadow-lg shadow-jne-red/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {tab.key === 'pending' && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-jne-red text-white text-[10px] font-black flex items-center justify-center rounded-full border-4 border-slate-950 shadow-2xl z-20">
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-jne-warning/5 border border-jne-warning/10 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-jne-warning animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                <span className="text-[10px] font-black text-jne-warning uppercase tracking-[0.3em]">Queue Live: {pendingCount}</span>
              </div>
            </div>
          </motion.div>

          {/* Requests Feed */}
          {loading ? (
            <div className="py-48 flex justify-center"><PageLoader /></div>
          ) : leaves.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card flex flex-col items-center justify-center py-56 rounded-4xl border border-dashed border-white/10"
            >
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-jne-red/5 blur-3xl rounded-full scale-150" />
                <div className="w-32 h-32 rounded-3xl bg-linear-to-br from-white/5 to-transparent border border-white/10 flex items-center justify-center text-white z-10 shadow-2xl">
                  <Inbox size={64} strokeWidth={1} className="opacity-20" />
                </div>
              </div>
              <h3 className="text-4xl font-black text-white tracking-widest uppercase mb-4">Queue Depleted</h3>
              <p className="text-[12px] font-black text-white/20 uppercase tracking-[0.5em] text-center max-w-sm leading-relaxed">
                Personnel deployment matrix is clear. Initializing system idle protocol.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {leaves.map((leave, idx) => (
                  <motion.div 
                    key={leave.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -4 }}
                    className="glass-card p-10 rounded-4xl group overflow-hidden"
                  >
                    {/* Status accent glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 blur-[120px] opacity-[0.03] pointer-events-none bg-indigo-500 group-hover:opacity-[0.08] transition-opacity" />

                    <div className="flex flex-col lg:flex-row lg:items-center gap-12">
                      {/* Identity Section */}
                      <div className="flex items-center gap-6 lg:w-80 shrink-0">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-2xl group-hover:rotate-6 transition-transform">
                            {leave.employeeName?.charAt(0)}
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center shadow-2xl">
                             <Clock size={16} className="text-white/40" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-white tracking-tight group-hover:text-jne-red transition-colors uppercase">{leave.employeeName}</h4>
                          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-1.5">
                             {leave.department} • {leave.employeeId}
                          </p>
                        </div>
                      </div>

                      {/* Details Matrix */}
                      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Protocol Type</p>
                          <p className="text-[11px] font-black text-white uppercase tracking-widest bg-white/5 py-1.5 px-3 rounded-lg border border-white/5 inline-block">{LEAVE_TYPE_LABELS[leave.type] || leave.type}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Term Duration</p>
                          <p className="text-sm font-black text-white flex items-center gap-2 tracking-tight">
                            {leave.startDate ? format(new Date(leave.startDate), 'dd MMM') : '-'}
                            <ChevronRight size={14} className="text-white/10" />
                            {leave.endDate ? format(new Date(leave.endDate), 'dd MMM') : '-'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Net Cycles</p>
                          <p className="text-sm font-black text-white tracking-tight">{leave.totalDays} WORKDAYS</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">System State</p>
                          <StatusBadge status={leave.status} size="md" />
                        </div>
                      </div>

                      {/* Command Interface */}
                      <div className="flex items-center justify-end gap-5 lg:w-64 shrink-0">
                        {leave.documentUrl && (
                          <motion.a 
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                            whileTap={{ scale: 0.9 }}
                            href={leave.documentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-14 h-14 rounded-2xl bg-white/2 text-white/40 hover:text-white transition-all border border-white/5 flex items-center justify-center shadow-inner"
                          >
                            <Eye size={22} />
                          </motion.a>
                        )}
                        
                        {leave.status === 'pending' ? (
                          <div className="flex gap-4">
                            <motion.button
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApprove(leave)}
                              disabled={!!processing}
                              className="px-8 py-5 rounded-2xl bg-linear-to-r from-jne-success to-emerald-500 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-jne-success/20 transition-all disabled:opacity-50 flex items-center gap-3"
                            >
                              {processing === leave.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                              Grant
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openReject(leave)}
                              disabled={!!processing}
                              className="w-14 h-14 rounded-2xl bg-jne-danger/5 text-jne-danger hover:bg-jne-danger/10 transition-all border border-jne-danger/20 flex items-center justify-center shadow-2xl"
                            >
                              <XCircle size={22} />
                            </motion.button>
                          </div>
                        ) : (
                          <div className="text-right glass-card px-6 py-3 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-1.5">Verified By</p>
                            <p className="text-[12px] font-black text-white uppercase tracking-widest">{leave.reviewedBy || 'System Protocol'}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-white/5 flex items-start gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/3 flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                        <FileText size={20} className="text-indigo-400 opacity-40" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">Justification Protocol</p>
                        <p className="text-sm font-medium text-white/80 leading-relaxed max-w-3xl font-sans">"{leave.reason}"</p>
                      </div>
                      {leave.rejectionReason && (
                        <div className="ml-auto pl-10 border-l border-jne-danger/20 max-w-sm">
                          <p className="text-[10px] font-black text-jne-danger uppercase tracking-[0.4em] mb-3">Rejection Log</p>
                          <p className="text-[12px] font-bold text-jne-danger/80 leading-relaxed italic font-sans">"{leave.rejectionReason}"</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Security Adjudication: Request Termination" maxWidth={600}>
        {selectedLeave && (
          <div className="space-y-12 py-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 rounded-4xl bg-jne-danger/5 border border-jne-danger/20 flex items-center gap-8 backdrop-blur-3xl shadow-2xl"
            >
              <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-jne-danger/20 to-transparent flex items-center justify-center text-jne-danger shrink-0 border border-jne-danger/30 shadow-xl">
                <ShieldAlert size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-black text-white tracking-tight uppercase">{selectedLeave.employeeName}</p>
                <p className="text-[12px] font-black text-jne-danger/60 uppercase tracking-[0.5em]">{LEAVE_TYPE_LABELS[selectedLeave.type]} Protocol • {selectedLeave.totalDays} WORKDAYS</p>
              </div>
            </motion.div>

            <div className="space-y-6">
              <label className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] text-center block">Rationale for Termination</label>
              <div className="relative group">
                <textarea
                  className="w-full bg-white/3 border border-white/5 rounded-3xl p-8 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-jne-danger/50 transition-all shadow-inner backdrop-blur-xl min-h-[180px] resize-none font-sans"
                  placeholder="Declare official grounds for deployment cancellation..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-jne-danger/40 font-black uppercase tracking-[0.3em] text-center italic">This log will be transmitted to personnel terminal via encrypted feed.</p>
            </div>

            <div className="flex gap-6">
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRejectModal(false)} 
                className="flex-1 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] text-white/30 border border-white/5 transition-all shadow-xl"
              >
                Abort Adjudication
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRejectSubmit}
                disabled={!rejectReason.trim() || !!processing}
                className="flex-1 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] bg-linear-to-r from-jne-danger to-red-600 text-white shadow-2xl shadow-jne-danger/40 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {processing ? <Loader2 size={20} className="animate-spin" /> : <XCircle size={20} />}
                Confirm Cancellation
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

