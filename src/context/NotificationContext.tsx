'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/firestore';
import type { AdminNotification } from '@/types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToNotifications(setNotifications);
    return unsubscribe;
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = async (id: string) => {
    await markNotificationRead(id);
  };

  const markAllRead = async () => {
    await markAllNotificationsRead();
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
