import type { AttendanceStatus, LeaveStatus, LeaveType } from '@/types';

// ============================================================
// Status Badge
// ============================================================
interface BadgeProps {
  status: AttendanceStatus | LeaveStatus | LeaveType | string;
  size?: 'sm' | 'md';
}

const labelMap: Record<string, string> = {
  present: 'Hadir',
  late: 'Terlambat',
  absent: 'Tidak Hadir',
  leave: 'Izin',
  overtime: 'Lembur',
  holiday: 'Libur',
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  sick: 'Sakit',
  annual: 'Cuti Tahunan',
  personal: 'Keperluan Pribadi',
  emergency: 'Darurat',
  other: 'Lainnya',
};

export function StatusBadge({ status, size = 'md' }: BadgeProps) {
  const label = labelMap[status] || status;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center font-semibold rounded-full badge-${status} ${sizeClass}`}>
      {label}
    </span>
  );
}

// ============================================================
// Face Registration Badge
// ============================================================
export function FaceBadge({ registered }: { registered: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: registered ? '#DCFCE7' : '#FEE2E2',
        color: registered ? '#15803D' : '#B91C1C',
      }}
    >
      <span>{registered ? '✓' : '✗'}</span>
      {registered ? 'Terdaftar' : 'Belum Daftar'}
    </span>
  );
}

// ============================================================
// Contract Type Badge
// ============================================================
export function ContractBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    permanent: { label: 'Tetap', bg: '#DBEAFE', color: '#1D4ED8' },
    contract:  { label: 'Kontrak', bg: '#FEF3C7', color: '#D97706' },
    intern:    { label: 'Magang', bg: '#F3E8FF', color: '#7E22CE' },
  };
  const style = map[type] || { label: type, bg: '#F1F5F9', color: '#475569' };
  return (
    <span
      className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}
