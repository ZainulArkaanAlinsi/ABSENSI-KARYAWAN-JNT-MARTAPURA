'use client';

import { BarChart3 } from 'lucide-react';
import ComingSoon from '@/components/ui/ComingSoon';

export default function SalesPage() {
  return (
    <ComingSoon
      title="Penjualan & Pendapatan"
      description="Dashboard penjualan bulanan, target, dan rincian per layanan. Akan terhubung ke sistem operasional JNE."
      icon={BarChart3}
      features={[
        'Grafik pendapatan bulanan vs target tahunan.',
        'Rincian paket per layanan (REG, OKE, YES, SPS).',
        'Tren harian: terkirim, pending, dan gagal.',
      ]}
    />
  );
}
