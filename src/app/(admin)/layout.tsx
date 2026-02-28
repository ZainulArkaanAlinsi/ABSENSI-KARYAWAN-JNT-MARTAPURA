'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--pg-app-bg, #020617)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex items-center justify-center rounded-2xl shadow-lg"
            style={{
              width: 56,
              height: 56,
              background: '#E31E24',
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
                  background: '#E31E24',
                  animation: `pulse-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
                }}
              />
            ))}
          </div>
          <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-400">
            Menyiapkan dashboard admin...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <NotificationProvider>{children}</NotificationProvider>;
}
