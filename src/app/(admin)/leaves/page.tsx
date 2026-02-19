'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, FileText, Loader2, Download, Eye } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { subscribeToLeaves, updateLeaveStatus } from '@/lib/firestore';
import type { LeaveRequest, LeaveStatus } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

const TABS: { key: LeaveStatus | 'all'; label: string }[] = [
  { key: 'pending', label: 'Menunggu' },
  { key: 'approved', label: 'Disetujui' },
  { key: 'rejected', label: 'Ditolak' },
  { key: 'all', label: 'Semua' },
];

const LEAVE_TYPE_LABELS: Record<string, string> = {
  sick: 'Sakit', annual: 'Cuti Tahunan', personal: 'Keperluan Pribadi',
  emergency: 'Darurat', other: 'Lainnya',
};

export default function LeavesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<LeaveStatus | 'all'>('pending');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToLeaves(activeTab, (data) => {
      setLeaves(data);
      setLoading(false);
    });
    return unsub;
  }, [activeTab]);

  const handleApprove = async (leave: LeaveRequest) => {
    if (!confirm(`Setujui izin ${leave.employeeName}?`)) return;
    setProcessing(leave.id);
    await updateLeaveStatus(leave.id, 'approved', user?.name || 'Admin');
    setProcessing(null);
  };

  const handleRejectSubmit = async () => {
    if (!selectedLeave || !rejectReason.trim()) return;
    setProcessing(selectedLeave.id);
    await updateLeaveStatus(selectedLeave.id, 'rejected', user?.name || 'Admin', rejectReason);
    setProcessing(null);
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedLeave(null);
  };

  const openReject = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  return (
    <AdminLayout title="Persetujuan Izin" subtitle="Kelola pengajuan izin karyawan">
      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'white', width: 'fit-content', border: '1px solid #E2E8F0' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="relative px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: activeTab === tab.key ? '#E31E24' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#64748B',
            }}
          >
            {tab.label}
            {tab.key === 'pending' && pendingCount > 0 && activeTab !== 'pending' && (
              <span
                className="absolute -top-1 -right-1 text-xs font-bold rounded-full text-white"
                style={{ minWidth: 16, height: 16, background: '#E31E24', fontSize: 10, padding: '0 3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Leave Cards */}
      {loading ? (
        <PageLoader />
      ) : leaves.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16">
          <FileText size={40} color="#CBD5E1" />
          <p className="text-slate-400 mt-3">Tidak ada pengajuan izin</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map(leave => (
            <div key={leave.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Employee Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="flex items-center justify-center rounded-full text-white font-bold text-sm shrink-0"
                    style={{ width: 44, height: 44, background: '#7C3AED' }}
                  >
                    {leave.employeeName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{leave.employeeName}</p>
                    <p className="text-slate-400 text-xs">{leave.department} • {leave.employeeId}</p>
                  </div>
                </div>

                {/* Leave Details */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Jenis Izin</p>
                    <p className="text-sm font-semibold text-slate-700">{LEAVE_TYPE_LABELS[leave.type] || leave.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Tanggal</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {leave.startDate ? format(new Date(leave.startDate), 'd MMM', { locale: localeId }) : '-'}
                      {leave.endDate && leave.endDate !== leave.startDate
                        ? ` - ${format(new Date(leave.endDate), 'd MMM yyyy', { locale: localeId })}`
                        : leave.startDate ? format(new Date(leave.startDate), ' yyyy', { locale: localeId }) : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Durasi</p>
                    <p className="text-sm font-semibold text-slate-700">{leave.totalDays} hari</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Status</p>
                    <StatusBadge status={leave.status} size="sm" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {leave.documentUrl && (
                    <a href={leave.documentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary p-2" title="Lihat Dokumen">
                      <Eye size={14} />
                    </a>
                  )}
                  {leave.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(leave)}
                        disabled={processing === leave.id}
                        className="btn btn-success text-sm"
                      >
                        {processing === leave.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        Setujui
                      </button>
                      <button
                        onClick={() => openReject(leave)}
                        disabled={processing === leave.id}
                        className="btn btn-danger text-sm"
                      >
                        <XCircle size={14} />
                        Tolak
                      </button>
                    </>
                  )}
                  {leave.status !== 'pending' && (
                    <div className="text-xs text-slate-400">
                      <p>Oleh: {leave.reviewedBy || '-'}</p>
                      {leave.rejectionReason && (
                        <p className="text-red-400 mt-0.5 max-w-xs truncate" title={leave.rejectionReason}>
                          Alasan: {leave.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400">Alasan: <span className="text-slate-600">{leave.reason}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Tolak Pengajuan Izin">
        {selectedLeave && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ background: '#FEF2F2' }}>
              <p className="text-sm font-semibold text-red-700">{selectedLeave.employeeName}</p>
              <p className="text-xs text-red-500">{LEAVE_TYPE_LABELS[selectedLeave.type]} • {selectedLeave.totalDays} hari</p>
            </div>
            <div>
              <label className="form-label">Alasan Penolakan *</label>
              <textarea
                className="form-input"
                style={{ minHeight: 100, resize: 'vertical' }}
                placeholder="Berikan alasan penolakan yang jelas..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">Alasan ini akan dikirimkan ke karyawan melalui notifikasi.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="btn btn-secondary flex-1">Batal</button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectReason.trim() || !!processing}
                className="btn btn-danger flex-1 justify-center"
              >
                {processing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Konfirmasi Penolakan
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
