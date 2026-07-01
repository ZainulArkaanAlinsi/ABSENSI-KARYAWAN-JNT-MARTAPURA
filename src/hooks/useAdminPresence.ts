'use client';

import { useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Menulis presence admin ke `user_presence/{uid}` selama tab admin terbuka —
 * dipasang di LAYOUT (bukan hanya halaman chat), jadi karyawan (APK) melihat
 * admin "Online" selama admin membuka website apa pun, bukan cuma saat di chat.
 * Heartbeat tiap 30 detik + set offline saat tab ditutup/disembunyikan.
 */
export function useAdminPresence() {
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const ref = doc(db, 'user_presence', uid);
    const beat = (online: boolean) => {
      void setDoc(
        ref,
        {
          userId: uid,
          isOnline: online,
          lastSeen: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    };
    beat(true);
    const iv = setInterval(() => beat(document.visibilityState === 'visible'), 30000);
    const onVisibility = () => beat(document.visibilityState === 'visible');
    const goOffline = () => beat(false);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', goOffline);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', goOffline);
      goOffline();
    };
  }, []);
}
