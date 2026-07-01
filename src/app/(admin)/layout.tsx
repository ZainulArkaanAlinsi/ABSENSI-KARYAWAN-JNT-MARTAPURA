'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { useAdminFCM } from '@/hooks/useAdminFCM';
import { useAdminPresence } from '@/hooks/useAdminPresence';
import AdminLayout from '@/components/layout/AdminLayout';
import { Loader2 } from 'lucide-react';

/** Komponen kecil yang memanggil hook FCM — harus berada di dalam NotificationProvider */
function AdminFCMInit() {
  useAdminFCM();
  return null;
}

/** Tulis presence admin di SEMUA halaman (buka website = online untuk karyawan). */
function AdminPresenceInit() {
  useAdminPresence();
  return null;
}

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
            <Loader2 size={24} className="animate-spin text-emerald-500" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-bold text-slate-700">Memuat sistem...</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Menghubungkan ke server</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full transition-colors duration-300 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={24} />
      </div>
    );
  }

  return (
    <NotificationProvider>
      <AdminFCMInit />
      <AdminPresenceInit />
      <AdminLayout>{children}</AdminLayout>
    </NotificationProvider>
  );
}
