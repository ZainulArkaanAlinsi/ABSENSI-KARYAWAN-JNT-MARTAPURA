'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Menentukan judul berdasarkan path
  const getPageTitle = () => {
    if (pathname.includes('/employees')) return 'Manajemen Karyawan';
    if (pathname === '/attendance') return 'Control Tower';
    if (pathname.includes('/attendance/history')) return 'Archive Registry';
    if (pathname.includes('/attendance/live')) return 'Tactical Map';
    if (pathname.includes('/leaves')) return 'Izin & Cuti';
    if (pathname.includes('/reports')) return 'Laporan Bulanan';
    return 'Dashboard';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    </div>
  );

  if (!user) return null;

  return (
    <NotificationProvider>
      <AdminLayout>
        <AnimatePresence initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </AdminLayout>
    </NotificationProvider>
  );
}
