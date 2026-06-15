import type { AttendanceStatus, LeaveStatus, LeaveType } from '@/types';
import { ShieldCheck, ShieldAlert, Zap, Clock, UserCheck } from 'lucide-react';

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
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[8px]' : 'px-3 py-1.5 text-[9px]';

  const configMap: Record<string, { bg: string; text: string; dot: string }> = {
    present: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', dot: 'bg-emerald-600' },
    late: { bg: 'bg-amber-500/10', text: 'text-amber-700', dot: 'bg-amber-600' },
    absent: { bg: 'bg-red-500/10', text: 'text-red-700', dot: 'bg-red-700' },
    leave: { bg: 'bg-blue-500/10', text: 'text-blue-700', dot: 'bg-blue-700' },
    overtime: { bg: 'bg-indigo-500/10', text: 'text-indigo-700', dot: 'bg-indigo-700' },
    pending: { bg: 'bg-amber-500/10', text: 'text-amber-700', dot: 'bg-amber-600' },
    approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', dot: 'bg-emerald-600' },
    rejected: { bg: 'bg-red-500/10', text: 'text-red-700', dot: 'bg-red-700' },
  };

  const config = configMap[status] || {
    bg: 'bg-slate-500/10',
    text: 'text-slate-500',
    dot: 'bg-slate-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 ${config.bg} ${config.text} ${sizeClass} rounded-lg font-black uppercase tracking-widest border border-transparent shadow-xs transition-all hover:border-current/10`}
    >
      <div className={`w-1 h-1 rounded-full ${config.dot} shadow-[0_0_4px_currentColor]`} />
      {label}
    </span>
  );
}

export function FaceBadge({ registered }: { registered: boolean }) {
  const config = registered
    ? { bg: 'bg-blue-500/10', text: 'text-blue-700', dot: 'bg-blue-700', label: 'VERIFIED' }
    : { bg: 'bg-red-500/10', text: 'text-red-700', dot: 'bg-red-700', label: 'UNVERIFIED' };

  return (
    <span
      className={`inline-flex items-center gap-2 ${config.bg} ${config.text} px-3 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest border border-transparent hover:border-current/10 transition-all`}
    >
      {registered ? (
        <ShieldCheck size={12} strokeWidth={3} />
      ) : (
        <ShieldAlert size={12} strokeWidth={3} />
      )}
      {config.label}
    </span>
  );
}

export function ContractBadge({ type }: { type: string }) {
  const configMap: Record<string, { label: string; bg: string; text: string; icon: any }> = {
    permanent: {
      label: 'TETAP',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-700',
      icon: UserCheck,
    },
    contract: { label: 'KONTRAK', bg: 'bg-blue-500/10', text: 'text-blue-700', icon: Clock },
    intern: { label: 'MAGANG', bg: 'bg-indigo-500/10', text: 'text-indigo-700', icon: Zap },
  };

  const config = configMap[type] || {
    label: type.toUpperCase(),
    bg: 'bg-slate-500/10',
    text: 'text-slate-500',
    icon: null,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 ${config.bg} ${config.text} px-3 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest border border-transparent hover:border-current/10 transition-all`}
    >
      {Icon && <Icon size={12} strokeWidth={3} />}
      {config.label}
    </span>
  );
}
