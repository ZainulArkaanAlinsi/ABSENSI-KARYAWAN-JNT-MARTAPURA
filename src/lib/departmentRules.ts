import type { DepartmentRule } from '@/types';

// ============================================================
//  Department Rules Configuration
//  Single source of truth for all scheduling/calculation logic
// ============================================================

export const DEPARTMENT_RULES: DepartmentRule[] = [
  {
    id: 'rider_delivery',
    name: 'Rider Delivery',
    checkInTime: '09:00',
    checkOutTime: '17:00',
    toleranceMinutes: 15,
    gpsRequired: false,
    targetBased: true,
    dailyTarget: 100,
    target: '100 Paket Sukses Terkirim / Hari',
    color: '#D97706',
    description: 'Unit pengiriman roda dua. Fokus pada kecepatan dan ketepatan drop-off paket ke pelanggan.',
  },
  {
    id: 'driver_delivery',
    name: 'Driver Delivery',
    checkInTime: '09:00',
    checkOutTime: '17:00',
    toleranceMinutes: 15,
    gpsRequired: true,
    radiusMeters: 200,
    target: 'Zero Accident & 98% On-Time Delivery',
    color: '#3B82F6',
    description: 'Unit pengiriman roda empat/lebih. Menangani paket besar dan rute antar kota/kabupaten.',
  },
  {
    id: 'inbound_outbound',
    name: 'Inbound & Outbound',
    checkInTime: '21:00',
    checkOutTime: '05:00',
    checkOutNextDay: true,
    toleranceMinutes: 15,
    gpsRequired: true,
    radiusMeters: 100,
    target: 'Proses Sortir < 4 Jam Sejak Kedatangan',
    color: '#6366F1',
    description: 'Unit operasional gudang malam. Bertanggung jawab atas sortir, loading, dan unloading armada.',
  },
  {
    id: 'pick_up',
    name: 'Pick Up',
    checkInTime: '16:00',
    checkOutTime: '23:59',
    toleranceMinutes: 15,
    gpsRequired: false,
    trackFromHome: true,
    target: 'Jemput Paket < 60 Menit Sejak Request',
    color: '#22C55E',
    description: 'Unit jemput kiriman dari mitra dan pelanggan besar. Mobilitas tinggi dan fleksibel.',
  },
  {
    id: 'admin_support',
    name: 'Admin Support',
    checkInTime: '10:00',
    checkOutTime: '18:00',
    toleranceMinutes: 15,
    gpsRequired: true,
    radiusMeters: 100,
    color: '#0D9488',
    description: 'Unit pendukung administrasi operasional. Memastikan kelengkapan data dan manifest.',
  },
  {
    id: 'accounting',
    name: 'Accounting',
    checkInTime: '08:00',
    checkOutTime: '16:00',
    toleranceMinutes: 15,
    gpsRequired: true,
    radiusMeters: 100,
    color: '#BE123C',
    description: 'Unit keuangan dan pembukuan. Verifikasi setoran tunai dan administrasi keuangan kantor.',
  },
  {
    id: 'sales_sco',
    name: 'Sales Counter Officer',
    checkInTime: '09:00',
    checkOutTime: '17:00',
    toleranceMinutes: 15,
    gpsRequired: true,
    radiusMeters: 100,
    target: 'Upselling Asuransi & Packing Kayu > 30%',
    color: '#43237F',
    description: 'Garda terdepan pelayanan pelanggan di gerai. Fokus pada ramah tamah dan upselling layanan.',
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
