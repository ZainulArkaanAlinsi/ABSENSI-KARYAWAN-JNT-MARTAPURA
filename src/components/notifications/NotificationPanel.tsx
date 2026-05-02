'use client';

import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  FileText,
  UserCheck,
  AlertTriangle,
  UserPlus,
  Bell,
  X,
  CheckCheck,
  Zap
} from 'lucide-react';
import type { NotificationType } from '@/types';
import { useNotificationPanelLogic } from '@/hooks/useNotificationPanelLogic';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  leave_request:      { icon: FileText,      color: '#D97706' },
  face_enrolled:      { icon: UserCheck,     color: '#10B981' },
  face_failed:        { icon: AlertTriangle, color: '#EF4444' },
  new_employee:       { icon: UserPlus,      color: '#005596' },
  attendance_alert:   { icon: AlertTriangle, color: '#F59E0B' },
  meeting_reminder:   { icon: Bell,          color: '#8B5CF6' },
  system:             { icon: Zap,           color: '#64748B' },
};

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, markAllAsRead, handleMarkRead } = useNotificationPanelLogic();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="w-[380px] bg-(--bg-card) border border-(--border-primary) shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-(--border-primary) bg-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-(--text-primary) uppercase tracking-tight italic">Notifikasi</h3>
          <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mt-0.5">
            {unreadCount > 0 ? `${unreadCount} Belum dibaca` : 'Sistem Optimal'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="p-2 text-(--text-muted) hover:text-[#005596] transition-colors"
              title="Tandai semua dibaca"
            >
              <CheckCheck size={18} />
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-2 text-(--text-muted) hover:text-[#E31E24] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-10">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-(--text-dim)">
              <Bell size={24} />
            </div>
            <p className="text-xs font-black text-(--text-muted) uppercase tracking-widest">Tidak ada kabar baru</p>
          </div>
        ) : (
          <div className="divide-y divide-(--border-primary)">
            {notifications.map((notif) => {
              const config = iconMap[notif.type] || iconMap.system;
              const Icon = config.icon;

              return (
                <div 
                  key={notif.id}
                  onClick={() => handleMarkRead(notif)}
                  className={`p-5 flex gap-4 transition-all cursor-pointer group hover:bg-white/5 ${notif.isRead ? 'opacity-60' : 'bg-[#E31E24]/2'}`}
                >
                  <div 
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${config.color}15`, color: config.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-black text-(--text-primary) leading-tight group-hover:text-[#E31E24] transition-colors">
                        {notif.title}
                      </h4>
                      <span className="text-[9px] font-bold text-(--text-muted) whitespace-nowrap pt-0.5">
                        {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: localeId }) : 'Baru saja'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-(--text-secondary) line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E31E24] mt-2 shrink-0 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-white/5 border-t border-(--border-primary) text-center">
        <button 
          onClick={onClose}
          className="text-[10px] font-black text-(--text-muted) hover:text-(--text-primary) uppercase tracking-widest transition-colors"
        >
          Tutup Panel
        </button>
      </div>
    </motion.div>
  );
}