'use client';

import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  FileText, UserCheck, AlertTriangle, UserPlus, Bell, CheckCheck, X
} from 'lucide-react';
import type { AdminNotification, NotificationType } from '@/types';

const iconMap: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  leave_request:    { icon: FileText,       color: '#D97706', bg: '#FEF3C7' },
  face_enrolled:    { icon: UserCheck,      color: '#16A34A', bg: '#DCFCE7' },
  face_failed:      { icon: AlertTriangle,  color: '#DC2626', bg: '#FEE2E2' },
  new_employee:     { icon: UserPlus,       color: '#2563EB', bg: '#DBEAFE' },
  attendance_alert: { icon: AlertTriangle,  color: '#D97706', bg: '#FEF3C7' },
  system:           { icon: Bell,           color: '#7C3AED', bg: '#EDE9FE' },
};

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const handleMarkRead = async (notif: AdminNotification) => {
    if (!notif.isRead) await markRead(notif.id);
  };

  return (
    <div
      className="absolute right-0 top-full mt-2 rounded-[24px] shadow-2xl border border-white/5 z-50 overflow-hidden glass animate-in fade-in slide-in-from-top-4 duration-300"
      style={{ width: 380, background: 'rgba(22, 22, 24, 0.95)', maxHeight: '80vh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-white text-base">Notifications</h3>
          {unreadCount > 0 && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: '#E31E24' }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/5 transition-colors">
            <X size={16} className="text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <Bell size={48} className="text-zinc-700 mb-4" />
            <p className="text-zinc-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notif) => {
              const { icon: Icon, color, bg } = iconMap[notif.type] || iconMap.system;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleMarkRead(notif)}
                  className="flex gap-4 px-6 py-5 cursor-pointer transition-all hover:bg-white/3"
                  style={{ background: notif.isRead ? 'transparent' : 'rgba(255, 255, 255, 0.01)' }}
                >
                  <div
                    className="flex items-center justify-center rounded-2xl shrink-0"
                    style={{ width: 44, height: 44, background: bg, opacity: 0.9 }}
                  >
                    <Icon size={20} color={color} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-sm font-bold leading-tight ${notif.isRead ? 'text-zinc-300' : 'text-white'}`}>{notif.title}</p>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full shrink-0 mt-1 shadow-[0_0_8px_rgba(227,30,36,0.6)]" style={{ background: '#E31E24' }} />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <p className="text-[10px] text-zinc-600 font-medium">
                        {notif.createdAt
                          ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: localeId })
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
