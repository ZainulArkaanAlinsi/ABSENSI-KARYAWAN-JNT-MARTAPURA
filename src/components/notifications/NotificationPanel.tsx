'use client';

import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  FileText, UserCheck, AlertTriangle, UserPlus, Bell, X
} from 'lucide-react';
import type { NotificationType } from '@/types';
import { useNotificationPanelLogic } from '@/hooks/useNotificationPanelLogic';

// ... imports

const iconMap: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  // Using strings for classes instead of hex for style props if possible, 
  // but the component uses them in style prop.
  // I will refactor component to use className for colors.
  leave_request:    { icon: FileText,       color: 'text-jne-warning', bg: 'bg-jne-warning/10' },
  face_enrolled:    { icon: UserCheck,      color: 'text-jne-success', bg: 'bg-jne-success/10' },
  face_failed:      { icon: AlertTriangle,  color: 'text-jne-danger', bg: 'bg-jne-danger/10' },
  new_employee:     { icon: UserPlus,       color: 'text-jne-info', bg: 'bg-jne-info/10' },
  attendance_alert: { icon: AlertTriangle,  color: 'text-jne-warning', bg: 'bg-jne-warning/10' },
  system:           { icon: Bell,           color: 'text-jne-overtime', bg: 'bg-jne-overtime/10' },
};

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, markAllRead, handleMarkRead } = useNotificationPanelLogic();

  return (
    <div
      className="absolute right-0 top-full mt-4 rounded-[28px] shadow-2xl border border-(--glass-border) z-50 overflow-hidden glass animate-in fade-in slide-in-from-top-4 duration-500 backdrop-blur-2xl"
      style={{ width: 400, background: 'var(--bg-card)', maxHeight: '80vh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-(--glass-border) bg-linear-to-b from-white/5 to-transparent">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-(--text-primary) text-base tracking-tight">Notifications</h3>
          {unreadCount > 0 && (
            <span
              className="text-[9px] font-black px-2.5 py-1 rounded-lg text-white bg-jne-red shadow-[0_0_12px_rgba(244,63,94,0.4)]"
            >
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-jne-subtext hover:text-(--text-secondary) transition-colors"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/5 transition-colors">
            <X size={16} className="text-jne-subtext" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <Bell size={48} className="text-jne-subtext/20 mb-4" />
            <p className="text-jne-subtext text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-(--card-border)">
            {notifications.map((notif) => {
              const { icon: Icon, color, bg } = iconMap[notif.type] || iconMap.system;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleMarkRead(notif)}
                  className={`flex gap-4 px-6 py-5 cursor-pointer transition-all hover:bg-(--bg-input) ${
                    !notif.isRead ? 'bg-(--bg-input)/50' : 'bg-transparent'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center rounded-2xl shrink-0 ${bg}`}
                    style={{ width: 44, height: 44 }}
                  >
                    <Icon size={20} className={color} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-sm font-bold leading-tight ${notif.isRead ? 'text-jne-subtext' : 'text-(--text-primary)'}`}>{notif.title}</p>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full shrink-0 mt-1 shadow-[0_0_8px_rgba(227,30,36,0.6)] bg-jne-red" />
                      )}
                    </div>
                    <p className="text-xs text-jne-subtext line-clamp-2 leading-relaxed opacity-80">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <p className="text-[10px] text-jne-subtext/60 font-medium">
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
