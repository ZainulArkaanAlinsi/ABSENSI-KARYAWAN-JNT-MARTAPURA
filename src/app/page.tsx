'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#0F172A' }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="rounded-2xl flex items-center justify-center"
          style={{ width: 64, height: 64, background: '#E31E24' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-white font-semibold text-lg">JNE MTP</p>
        <div className="flex gap-1.5">
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
