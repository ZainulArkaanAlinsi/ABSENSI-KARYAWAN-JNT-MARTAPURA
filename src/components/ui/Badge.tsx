import type { AttendanceStatus, LeaveStatus, LeaveType } from '@/types';
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  Clock,
  UserCheck,
} from 'lucide-react';

interface BadgeProps {
  status: AttendanceStatus | LeaveStatus | LeaveType | string;
  size?: 'sm' | 'md';
}

const labelMap: Record<string, string> = {
  present: 'Hadir',
  late: 'Terlambat',
  absent: 'Alpha',
  leave: 'Izin',
  overtime: 'Lembur',
  holiday: 'Libur',
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  sick: 'Sakit',
  annual: 'Cuti Tahunan',
  personal: 'Pribadi',
  emergency: 'Darurat',
  other: 'Lainnya',
};

// Warna baru sesuai palet (Legacy - Keeping for potential reference but Badge now uses CSS classes)


export function StatusBadge({ status, size = 'md' }: BadgeProps) {
  const label = labelMap[status] || status;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-[10px]';
  
  // Map internal status to Kalcer badge class
  const badgeClassMap: Record<string, string> = {
    present: 'att-badge-present',
    late: 'att-badge-late',
    absent: 'att-badge-absent',
    leave: 'att-badge-leave',
    overtime: 'att-badge-overtime',
    pending: 'att-badge-late',
    approved: 'att-badge-present',
    rejected: 'att-badge-absent',
  };

  const badgeClass = badgeClassMap[status] || 'bg-white/5 text-white/40 border border-white/10';

  return (
    <span className={`att-badge ${badgeClass} ${sizeClass} font-black`}>
      {label}
    </span>
  );
}

export function FaceBadge({ registered }: { registered: boolean }) {
  const badgeClass = registered ? 'att-badge-overtime' : 'att-badge-absent';

  return (
    <span className={`att-badge ${badgeClass} px-3 py-1 text-[9px] font-black`}>
      {registered ? <ShieldCheck size={12} strokeWidth={3} /> : <ShieldAlert size={12} strokeWidth={3} />}
      {registered ? 'TERDAFTAR' : 'BELUM DAFTAR'}
    </span>
  );
}

export function ContractBadge({ type }: { type: string }) {
  const configMap: Record<string, { label: string; class: string; icon: any }> = {
    permanent: { label: 'TETAP', class: 'att-badge-present', icon: UserCheck },
    contract: { label: 'KONTRAK', class: 'att-badge-leave', icon: Clock },
    intern: { label: 'MAGANG', class: 'att-badge-overtime', icon: Zap },
  };

  const config = configMap[type] || { label: type, class: 'bg-white/5 text-white/40', icon: null };
  const Icon = config.icon;

  return (
    <span className={`att-badge ${config.class} px-3 py-1 text-[9px] font-black`}>
      {Icon && <Icon size={12} strokeWidth={3} />}
      {config.label}
    </span>
  );
}