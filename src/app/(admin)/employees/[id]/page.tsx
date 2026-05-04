import EmployeeDetailClient from './EmployeeDetailClient';

// Wajib diset false untuk static export pada rute dinamis
export const dynamicParams = false;

// Pastikan fungsi ini async untuk standar Next.js terbaru
export async function generateStaticParams() {
  // Kita return array kosong karena data akan ditarik di sisi klien (browser)
  // Ini trik agar build sukses tanpa harus mendaftarkan semua ID karyawan
  return [];
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <EmployeeDetailClient params={params} />;
}