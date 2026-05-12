'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { subscribeToNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/firestore';
import type { AdminNotification } from '@/types';
import { useAuth } from './AuthContext';

/** Suara "Ding!" ala typewriter bell — pakai Web Audio API, tanpa file MP3 */
function playAdminDing() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const frequencies = [880, 1108.73]; // A5 + C#6 → nada nyaring
    const duration = 0.7;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startAt = ctx.currentTime + i * 0.05;
      gain.gain.setValueAtTime(0.25, startAt);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

      osc.start(startAt);
      osc.stop(startAt + duration);
    });
  } catch {
    // Browser block AudioContext sebelum interaksi user — diabaikan saja
  }
}

interface NotificationContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Track unread count sebelumnya untuk deteksi notif baru
  const prevUnreadRef = useRef<number>(-1);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      prevUnreadRef.current = -1;
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToNotifications((newNotifications) => {
      const currentUnread = newNotifications.filter((n) => !n.isRead).length;

      // Putar suara hanya kalau ada notif baru (bukan saat pertama kali load)
      if (prevUnreadRef.current !== -1 && currentUnread > prevUnreadRef.current) {
        playAdminDing();
      }
      prevUnreadRef.current = currentUnread;

      setNotifications(newNotifications);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Gagal menandai notifikasi dibaca:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsRead(); // ← tanpa argumen
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Gagal menandai semua notifikasi dibaca:', error);
    }
  }, []);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
  }), [notifications, unreadCount, markAsRead, markAllAsRead, isLoading]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}