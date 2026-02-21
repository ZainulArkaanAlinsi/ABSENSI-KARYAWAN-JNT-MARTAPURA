import type { AttendanceStatus, LeaveStatus, LeaveType } from '@/types';
import { ShieldCheck, ShieldAlert, Zap, Clock, UserCheck } from 'lucide-react';

interface BadgeProps {
  status: AttendanceStatus | LeaveStatus | LeaveType | string;
  size?: 'sm' | 'md';
}

const labelMap: Record<string, string> = {
  present: 'Verified',
  late: 'Delayed',
  absent: 'Missing',
  leave: 'Authorized',
  overtime: 'Overdrive',
  holiday: 'Rest Restricted',
  pending: 'Evaluating',
  approved: 'Cleared',
  rejected: 'Blocked',
  sick: 'Medical Leave',
  annual: 'Annual Trip',
  personal: 'Personal Matter',
  emergency: 'Critical Case',
  other: 'External',
};

const statusColors: Record<string, string> = {
  present: 'bg-jne-success/5 text-jne-success border-jne-success/20',
  late: 'bg-jne-danger/5 text-jne-danger border-jne-danger/20',
  absent: 'bg-jne-danger/5 text-jne-danger border-jne-danger/20',
  leave: 'bg-jne-warning/5 text-jne-warning border-jne-warning/20',
  overtime: 'bg-jne-overtime/5 text-jne-overtime border-jne-overtime/20',
  pending: 'bg-jne-warning/5 text-jne-warning border-jne-warning/20',
  approved: 'bg-jne-success/5 text-jne-success border-jne-success/20',
  rejected: 'bg-jne-danger/5 text-jne-danger border-jne-danger/20',
  default: 'bg-(--bg-input) text-(--text-dim) border-(--card-border)',
};

export function StatusBadge({ status, size = 'md' }: BadgeProps) {
  const label = labelMap[status] || status;
  const sizeClass = size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-3 py-1';
  const colorClass = statusColors[status] || statusColors.default;

  return (
    <span className={`inline-flex items-center font-bold rounded-xl border uppercase tracking-widest ${colorClass} ${sizeClass}`}>
      {label}
    </span>
  );
}

export function FaceBadge({ registered }: { registered: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border transition-all ${
        registered 
          ? 'bg-jne-success/5 text-jne-success border-jne-success/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
          : 'bg-jne-danger/5 text-jne-danger border-jne-danger/10 shadow-[0_0_10px_rgba(225,29,72,0.1)]'
      }`}
    >
      {registered ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
      {registered ? 'Verified' : 'Unverified'}
    </span>
  );
}

export function ContractBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    permanent: 'bg-jne-info/5 text-jne-info border-jne-info/10',
    contract:  'bg-jne-warning/5 text-jne-warning border-jne-warning/10',
    intern:    'bg-indigo-500/5 text-indigo-400 border-indigo-500/10',
  };
  const className = map[type] || 'bg-(--bg-input) text-(--text-dim) border-(--card-border)';
  
  const labelMap: Record<string, string> = {
    permanent: 'Agent',
    contract: 'Contractor',
    intern: 'Intern',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border ${className}`}
    >
      {type === 'permanent' && <UserCheck size={10} />}
      {type === 'contract' && <Clock size={10} />}
      {type === 'intern' && <Zap size={10} />}
      {labelMap[type] || type}
    </span>
  );
}
