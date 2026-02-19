'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import AdminLayout from '@/components/layout/AdminLayout';

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
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F1F5F9' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="rounded-xl flex items-center justify-center"
            style={{ width: 56, height: 56, background: '#E31E24' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: 8, height: 8, background: '#E31E24',
                  animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}
