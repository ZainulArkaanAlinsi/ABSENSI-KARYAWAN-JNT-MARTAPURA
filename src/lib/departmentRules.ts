import type { DepartmentRule } from '@/types';

// ============================================================
//  Department Rules Configuration
//  Single source of truth for all scheduling/calculation logic
// ============================================================

export const DEPARTMENT_RULES: DepartmentRule[] = [
  {
    name: 'Sales Coordinator (SCO)',
    checkInTime: '09:00',
    checkOutTime: '16:00',
    toleranceMinutes: 10,
    color: '#43237F',
    description:
      'Jam masuk 09:00 — Jam pulang 16:00. Keterlambatan lebih dari toleransi akan mengurangi jam kerja efektif hari itu.',
  },
  {
    name: 'Driver',
    checkInTime: '09:00',
    checkOutTime: '16:00',
    toleranceMinutes: 10,
    color: '#3B82F6',
    description:
      'Jam masuk 09:00 — Jam pulang 16:00. Keterlambatan lebih dari toleransi akan mengurangi jam kerja efektif hari itu.',
  },
  {
    name: 'Admin Support',
    checkInTime: '10:00',
    checkOutTime: '17:00',
    toleranceMinutes: 10,
    color: '#0D9488',
    description:
      'Jam masuk 10:00 — Jam pulang 17:00. Keterlambatan lebih dari toleransi akan mengurangi jam kerja efektif hari itu.',
  },
  {
    name: 'Kurir / Lapangan',
    checkInTime: '09:00',
    checkOutTime: '16:00',
    toleranceMinutes: 10,
    targetBased: true,
    dailyTarget: 100,
    color: '#D97706',
    description:
      'Target 100 paket/hari. Boleh pulang sebelum 16:00 jika semua paket selesai. Harus tetap bertugas sampai semua paket terkirim meski melewati 16:00.',
  },
  {
    name: 'Pick-Up Operations',
    checkInTime: '16:00',
    checkOutTime: '23:59',
    toleranceMinutes: 15,
    trackFromHome: true,
    color: '#22C55E',
    description:
      'Jam mulai 16:00. Absensi dicatat sejak berangkat dari rumah — bukan saat tiba di kantor — karena proses pick-up dimulai dari titik keberangkatan.',
  },
  {
    name: 'Inbound Operations',
    checkInTime: '21:00',
    checkOutTime: '05:00',
    checkOutNextDay: true,
    toleranceMinutes: 15,
    color: '#6366F1',
    description:
      'Shift malam 21:00 — 05:00 (keesokan hari). Durasi kerja lintas tengah malam dihitung otomatis tanpa menghasilkan nilai minus.',
  },
  {
    name: 'Outbound Operations',
    checkInTime: '21:00',
    checkOutTime: '05:00',
    checkOutNextDay: true,
    toleranceMinutes: 15,
    color: '#BE123C',
    description:
      'Shift malam 21:00 — 05:00 (keesokan hari). Durasi kerja lintas tengah malam dihitung otomatis tanpa menghasilkan nilai minus.',
  },
];

// Lookup by name
export function getRuleByDept(name: string): DepartmentRule | undefined {
  return DEPARTMENT_RULES.find((r) => r.name === name);
}

// ============================================================
//  Core calculation utilities
// ============================================================

/**
 * Calculate effective work minutes, accounting for:
 *  - next-day checkouts (night shift)
 *  - tardiness deducted from effective hours (NOT counted as overtime)
 */
export function calcEffectiveMinutes(
  checkInISO: string,
  checkOutISO: string,
  rule: DepartmentRule,
): {
  totalMinutes: number;
  lateMinutes: number;
  effectiveMinutes: number;
} {
  const checkIn = new Date(checkInISO);
  const checkOut = new Date(checkOutISO);

  // Scheduled check-in on the same date as actual check-in
  const [h, m] = rule.checkInTime.split(':').map(Number);
  const scheduled = new Date(checkIn);
  scheduled.setHours(h, m, 0, 0);

  // Late = diff in minutes (0 if on time or early)
  const rawLate = Math.floor((checkIn.getTime() - scheduled.getTime()) / 60000);
  const lateMinutes = Math.max(0, rawLate - rule.toleranceMinutes);

  // Total actual minutes worked (handles cross-midnight automatically)
  const totalMinutes = Math.max(0, Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000));

  // Effective = total - late deduction
  const effectiveMinutes = Math.max(0, totalMinutes - lateMinutes);

  return { totalMinutes, lateMinutes, effectiveMinutes };
}

/**
 * Format minutes as "Xj Ym" (hours + minutes) or "—" if zero
 */
export function fmtMinutes(minutes: number): string {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}j`;
  return `${h}j ${m}m`;
}
