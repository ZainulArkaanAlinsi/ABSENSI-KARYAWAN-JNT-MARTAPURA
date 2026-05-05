import { redirect } from 'next/navigation';

// Halaman ini dinonaktifkan karena menggunakan query parameter untuk static export.
// Redirect ke halaman detail yang baru.

export const dynamicParams = false;

export async function generateStaticParams() {
  // Return dummy agar build sukses
  return [{ id: 'redirect' }];
}

export default function EmployeeRedirectPage() {
  redirect('/employees');
  return null;
}