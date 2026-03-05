'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

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

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center transition-colors duration-500"
        style={{ background: 'var(--bg-main, #fafaf9)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex items-center justify-center rounded-2xl shadow-xl shadow-red-100 animate-pulse"
            style={{
              width: 56,
              height: 56,
              background: '#CC0000',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full"
                style={{
                  background: '#CC0000',
                  animation: `pulse-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
                }}
              />
            ))}
          </div>
          <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-stone-400">
            CONNECTING HAPPINESS...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <NotificationProvider>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, scale: 0.985, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.985, y: -4 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </NotificationProvider>
  );
}
