'use client';

import { Truck } from 'lucide-react';
import ComingSoon from '@/components/ui/ComingSoon';

export default function CouriersPage() {
  return (
    <ComingSoon
      title="Manajemen Kurir"
      description="Pemantauan kurir aktif, paket harian, dan performa pengiriman. Data dasar kurir sudah tersedia di menu Karyawan."
      icon={Truck}
      features={[
        'Daftar kurir aktif & nonaktif dengan area kerja masing-masing.',
        'Jumlah paket yang dipegang per kurir per hari.',
        'Skor performa berdasarkan ketepatan & jumlah pengiriman.',
      ]}
    />
  );
}
