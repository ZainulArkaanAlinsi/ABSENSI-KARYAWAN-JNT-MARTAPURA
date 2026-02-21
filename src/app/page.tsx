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
    <div className="flex items-center justify-center min-h-screen bg-(--bg-main)">
      <div className="flex flex-col items-center gap-4">
        <div
          className="rounded-2xl flex items-center justify-center bg-jne-red shadow-2xl shadow-jne-red/20"
          style={{ width: 64, height: 64 }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-(--text-primary) font-black text-xl tracking-tighter">
          JNE MTP<span className="text-jne-red">.</span>
        </p>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-jne-red/40"
              style={{
                animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
      <style jsx global>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
