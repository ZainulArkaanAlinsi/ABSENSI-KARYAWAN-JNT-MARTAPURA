import { useState, useEffect } from 'react';
import { subscribeToLeaves, updateLeaveStatus, deleteLeave } from '@/lib/firestore';
import type { LeaveRequest, LeaveStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';

export const TABS: { key: LeaveStatus | 'all'; label: string }[] = [
  { key: 'pending', label: 'Menunggu' },
  { key: 'approved', label: 'Disetujui' },
  { key: 'rejected', label: 'Ditolak' },
  { key: 'all', label: 'Semua' },
];

export const LEAVE_TYPE_LABELS: Record<string, string> = {
  sick: 'Sakit', annual: 'Cuti Tahunan', personal: 'Keperluan Pribadi',
  emergency: 'Darurat', other: 'Lainnya',
};

// Notifications (push + userNotifications mirror) are produced server-side by
// the onLeaveStatusUpdate Cloud Function the moment the leave doc's status
// flips. The previous client-side fetch('/api/notify-user') was a no-op
// because /api routes are disabled by output: 'export' — and the duplicate
// userNotifications write created two bell entries per decision.

export function useLeaveManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LeaveStatus | 'all'>('pending');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToLeaves(activeTab, (data) => {
      setLeaves(data);
      setLoading(false);
    });
    return unsub;
  }, [activeTab]);

  const handleApprove = async (leave: LeaveRequest) => {
    const isConfirmed = await confirm({
      title: 'Setujui Izin',
      message: `Apakah Anda yakin ingin menyetujui pengajuan izin dari ${leave.employeeName}?`,
      variant: 'info',
      confirmLabel: 'Setujui',
      cancelLabel: 'Batal'
    });

    if (!isConfirmed) return;

    setProcessing(leave.id);
    try {
      await updateLeaveStatus(leave.id, 'approved', user?.name || 'Admin');
      toast.success('Pengajuan izin berhasil disetujui');
    } catch (e) {
      console.error('Approve failed:', e);
      toast.error('Gagal menyetujui. Coba lagi.');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedLeave || !rejectReason.trim()) return;
    setProcessing(selectedLeave.id);
    try {
      await updateLeaveStatus(selectedLeave.id, 'rejected', user?.name || 'Admin', rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedLeave(null);
      toast.success('Pengajuan izin telah ditolak');
    } catch (e) {
      console.error('Reject failed:', e);
      toast.error('Gagal menolak. Coba lagi.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (leave: LeaveRequest) => {
    const isConfirmed = await confirm({
      title: 'Hapus Pengajuan Izin',
      message: `Yakin hapus pengajuan izin ${leave.employeeName}? Tindakan ini tidak bisa dibatalkan.`,
      variant: 'danger',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
    });
    if (!isConfirmed) return;

    setProcessing(leave.id);
    try {
      await deleteLeave(leave.id);
      toast.success('Pengajuan izin dihapus');
    } catch (e) {
      console.error('Delete leave failed:', e);
      toast.error('Gagal menghapus. Coba lagi.');
    } finally {
      setProcessing(null);
    }
  };

  const openReject = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  return {
    user,
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
    handleDelete,
    openReject,
    pendingCount,
  };
}
