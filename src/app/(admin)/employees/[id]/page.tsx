// File ini "dinetralkan" agar tidak menghambat proses build.
// Tetap sangat disarankan untuk MENGHAPUS folder ini: admin/src/app/(admin)/employees/[id]

export function generateStaticParams() {
  // Kita kasih dummy ID supaya Next.js tidak error saat 'npm run build'
  return [{ id: 'dummy-static-path' }];
}

export default function NeutralPage() {
  return null;
}