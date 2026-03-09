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
  
  // Map internal status to JNE badge class
  const badgeClassMap: Record<string, string> = {
    present: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    late: 'bg-amber-50 text-amber-700 border border-amber-100',
    absent: 'bg-red-50 text-[#E31E24] border border-red-100',
    leave: 'bg-blue-50 text-[#005596] border border-blue-100',
    overtime: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    pending: 'bg-amber-50 text-amber-700 border border-amber-100',
    approved: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    rejected: 'bg-red-50 text-[#E31E24] border border-red-100',
  };

  const badgeClass = badgeClassMap[status] || 'bg-white/5 text-white/40 border border-white/10';

  return (
    <span className={`inline-flex items-center gap-1.5 ${badgeClass} ${sizeClass} rounded-lg font-bold uppercase tracking-wider`}>
      {label}
    </span>
  );
}

export function FaceBadge({ registered }: { registered: boolean }) {
  const badgeClass = registered ? 'bg-blue-50 text-[#005596] border border-blue-100' : 'bg-red-50 text-[#E31E24] border border-red-100';

  return (
    <span className={`inline-flex items-center gap-1.5 ${badgeClass} px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider`}>
      {registered ? <ShieldCheck size={11} strokeWidth={3} /> : <ShieldAlert size={11} strokeWidth={3} />}
      {registered ? 'TERDAFTAR' : 'BELUM DAFTAR'}
    </span>
  );
}

export function ContractBadge({ type }: { type: string }) {
  const configMap: Record<string, { label: string; class: string; icon: any }> = {
    permanent: { label: 'TETAP', class: 'bg-emerald-50 text-emerald-700 border border-emerald-100', icon: UserCheck },
    contract: { label: 'KONTRAK', class: 'bg-blue-50 text-[#005596] border border-blue-100', icon: Clock },
    intern: { label: 'MAGANG', class: 'bg-indigo-50 text-indigo-700 border border-indigo-100', icon: Zap },
  };

  const config = configMap[type] || { label: type, class: 'bg-white/5 text-white/40', icon: null };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 ${config.class} px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider`}>
      {Icon && <Icon size={11} strokeWidth={3} />}
      {config.label}
    </span>
  );
}