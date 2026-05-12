import { useState, useEffect } from 'react';
import { subscribeToLeaves, updateLeaveStatus } from '@/lib/firestore';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { LeaveRequest, LeaveStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';

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

async function sendNotification(userId: string, status: LeaveStatus, reviewedBy: string) {
  const title = status === 'approved' ? '✅ Izin Disetujui' : '❌ Izin Ditolak';
  const body = `Pengajuan izin Anda telah ${status === 'approved' ? 'disetujui' : 'ditolak'} oleh ${reviewedBy}.`;
  
  try {
    await fetch('/api/notify-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title,
        body,
        data: { type: 'leave_status', status },
      }),
    });
  } catch (e) {
    console.warn('Failed to send notification:', e);
  }
}

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
      await sendNotification(leave.userId, 'approved', user?.name || 'Admin');
      
      // Create in-app notification
      await addDoc(collection(db, 'userNotifications'), {
        userId: leave.userId,
        type: 'leave_request',
        title: 'Izin Disetujui',
        message: `Pengajuan izin ${leave.type} telah disetujui oleh ${user?.name || 'Admin'}.`,
        isRead: false,
        createdAt: serverTimestamp(),
      });
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
      await sendNotification(selectedLeave.userId, 'rejected', user?.name || 'Admin');
      
      // Create in-app notification
      await addDoc(collection(db, 'userNotifications'), {
        userId: selectedLeave.userId,
        type: 'leave_request',
        title: 'Izin Ditolak',
        message: `Pengajuan izin ${selectedLeave.type} telah ditolak oleh ${user?.name || 'Admin'}. Alasan: ${rejectReason}`,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      
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
    openReject,
    pendingCount,
  };
}
