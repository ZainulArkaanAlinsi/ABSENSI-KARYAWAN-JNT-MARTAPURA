import { useState, useEffect } from 'react';
import { subscribeToOvertimes, updateOvertimeStatus, deleteOvertime } from '@/lib/firestore';
import type { OvertimeRequest, OvertimeStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';

export const OVERTIME_TABS: { key: OvertimeStatus | 'all'; label: string }[] = [
  { key: 'pending', label: 'Menunggu' },
  { key: 'approved', label: 'Disetujui' },
  { key: 'rejected', label: 'Ditolak' },
  { key: 'all', label: 'Semua' },
];

// Notifikasi push & mirror userNotifications ditangani server-side oleh
// Cloud Function onOvertimeStatusUpdate begitu doc overtime ter-update.
export function useOvertimeManagement() {
  const { user } = useAuth();
  const { confirm } = useConfirm();

  const [activeTab, setActiveTab] = useState<OvertimeStatus | 'all'>('pending');
  const [overtimes, setOvertimes] = useState<OvertimeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOvertime, setSelectedOvertime] = useState<OvertimeRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToOvertimes(activeTab, (data) => {
      setOvertimes(data);
      setLoading(false);
    });
    return unsub;
  }, [activeTab]);

  const handleApprove = async (ot: OvertimeRequest) => {
    const ok = await confirm({
      title: 'Setujui Lembur',
      message: `Setujui pengajuan lembur ${ot.overtimeHours} jam dari ${ot.employeeName}?`,
      variant: 'info',
      confirmLabel: 'Setujui',
      cancelLabel: 'Batal',
    });
    if (!ok) return;

    setProcessing(ot.id);
    try {
      await updateOvertimeStatus(ot.id, 'approved', user?.name || 'Admin');
      toast.success('Pengajuan lembur disetujui');
    } catch (e) {
      console.error('Approve overtime failed:', e);
      toast.error('Gagal menyetujui pengajuan.');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedOvertime || !rejectReason.trim()) return;
    setProcessing(selectedOvertime.id);
    try {
      await updateOvertimeStatus(
        selectedOvertime.id,
        'rejected',
        user?.name || 'Admin',
        rejectReason,
      );
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedOvertime(null);
      toast.success('Pengajuan lembur ditolak');
    } catch (e) {
      console.error('Reject overtime failed:', e);
      toast.error('Gagal menolak pengajuan.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (ot: OvertimeRequest) => {
    const ok = await confirm({
      title: 'Hapus Pengajuan Lembur',
      message: `Yakin hapus pengajuan lembur ${ot.employeeName}? Tindakan ini permanen.`,
      variant: 'danger',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
    });
    if (!ok) return;

    setProcessing(ot.id);
    try {
      await deleteOvertime(ot.id);
      toast.success('Pengajuan lembur dihapus');
    } catch (e) {
      console.error('Delete overtime failed:', e);
      toast.error('Gagal menghapus pengajuan.');
    } finally {
      setProcessing(null);
    }
  };

  const openReject = (ot: OvertimeRequest) => {
    setSelectedOvertime(ot);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const pendingCount = overtimes.filter((o) => o.status === 'pending').length;

  return {
    user,
    activeTab,
    setActiveTab,
    overtimes,
    loading,
    selectedOvertime,
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
