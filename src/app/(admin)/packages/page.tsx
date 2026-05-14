'use client';

import { Package } from 'lucide-react';
import ComingSoon from '@/components/ui/ComingSoon';

export default function PackagesPage() {
  return (
    <ComingSoon
      title="Manajemen Paket"
      description="Modul tracking resi, status pengiriman, dan kalkulasi ongkos kirim. Akan terhubung langsung ke sistem operasional JNE."
      icon={Package}
      features={[
        'Tracking resi real-time dari pickup sampai delivered.',
        'Status pengiriman: menunggu, diproses, dikembalikan, terkirim.',
        'Rincian ongkos kirim per layanan (REG, YES, OKE).',
      ]}
    />
  );
}
