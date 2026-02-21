import { useState, useEffect } from 'react';
import { subscribeToLeaves, updateLeaveStatus } from '@/lib/firestore';
import type { LeaveRequest, LeaveStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';

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

export function useLeaveManagement() {
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
