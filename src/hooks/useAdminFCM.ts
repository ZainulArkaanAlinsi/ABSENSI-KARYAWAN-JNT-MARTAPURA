'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { messaging as getMessaging } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

// VAPID key dari Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';

/**
 * Daftarkan Service Worker + simpan FCM token admin ke Firestore.
 * Dipanggil di dalam (admin)/layout.tsx setelah user login.
 */
export function useAdminFCM() {
  const { user } = useAuth();
  const currentTokenRef = useRef<string | null>(null);

  const saveToken = useCallback(async (token: string, userId: string) => {
    await setDoc(
      doc(db, 'admin_fcm_tokens', token),
      { userId, token, updatedAt: serverTimestamp() },
      { merge: true },
    );
    currentTokenRef.current = token;
  }, []);

  const removeToken = useCallback(async () => {
    if (currentTokenRef.current) {
      await deleteDoc(doc(db, 'admin_fcm_tokens', currentTokenRef.current)).catch(() => null);
      currentTokenRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    let unsubOnMessage: (() => void) | null = null;

    const init = async () => {
      // 1. Daftar Service Worker
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/',
          });
        } catch (err) {
          console.warn('[AdminFCM] Service worker gagal terdaftar:', err);
        }
      }

      // 2. Ambil instance messaging
      const messagingInstance = await getMessaging();
      if (!messagingInstance) return;

      // 3. Minta izin notifikasi
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('[AdminFCM] Izin notifikasi ditolak');
        return;
      }

      // 4. Dapatkan token FCM browser ini
      try {
        const token = await getToken(messagingInstance, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: await navigator.serviceWorker.ready,
        });

        if (token) {
          await saveToken(token, user.uid);
          console.log('[AdminFCM] Token tersimpan:', token.slice(0, 20) + '...');
        }
      } catch (err) {
        console.warn('[AdminFCM] Gagal dapatkan token:', err);
      }

      // 5. Handle pesan saat tab admin sedang aktif (foreground)
      // Sound diputar di NotificationContext saat data Firestore berubah
      unsubOnMessage = onMessage(messagingInstance, (payload) => {
        console.log('[AdminFCM] Pesan foreground diterima:', payload.notification?.title);
      });
    };

    init();

    return () => {
      unsubOnMessage?.();
    };
  }, [user, saveToken]);

  // Hapus token saat user logout
  useEffect(() => {
    if (!user) removeToken();
  }, [user, removeToken]);
}
