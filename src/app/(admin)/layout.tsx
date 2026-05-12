'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/layout/AdminLayout';
import { Loader2 } from 'lucide-react';

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

  // Loading State - Make it premium
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-black italic text-xs">J</span>
          </div>
        </div>
        <div className="mt-8 text-center">
          <h2 className="text-white font-black uppercase tracking-[0.4em] italic text-sm">System Initializing</h2>
          <p className="text-slate-500 text-[8px] font-bold uppercase tracking-[0.2em] mt-2">Connecting to Command Tower...</p>
        </div>
      </div>
    );
  }

  // Fallback for no user - avoid return null which makes screen blank
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-4" size={24} />
          <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Redirecting to Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <AdminLayout>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </AdminLayout>
    </NotificationProvider>
  );
}
