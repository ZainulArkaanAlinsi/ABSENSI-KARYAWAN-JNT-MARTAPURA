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
} from 'lucide-react';
import type { NotificationType } from '@/types';
import { useNotificationPanelLogic } from '@/hooks/useNotificationPanelLogic';
import { motion, AnimatePresence } from 'framer-motion';

// Mapping icon dan warna sesuai palet baru
const iconMap: Record<NotificationType, { icon: React.ElementType; bgColor: string; iconColor: string }> = {
  leave_request:      { icon: FileText,      bgColor: 'rgba(217,119,6,0.15)',   iconColor: '#D97706' },
  face_enrolled:      { icon: UserCheck,     bgColor: 'rgba(22,163,74,0.15)',   iconColor: '#16A34A' },
  face_failed:        { icon: AlertTriangle, bgColor: 'rgba(192,57,43,0.15)',   iconColor: '#C0392B' },
  new_employee:       { icon: UserPlus,      bgColor: 'rgba(56,99,195,0.15)',   iconColor: '#3863C3' },
  attendance_alert:   { icon: AlertTriangle, bgColor: 'rgba(217,119,6,0.15)',   iconColor: '#D97706' },
  meeting_reminder:   { icon: Bell,          bgColor: 'rgba(67,35,127,0.15)',   iconColor: '#43237F' },
  system:             { icon: Bell,          bgColor: 'rgba(61,82,128,0.15)',   iconColor: '#3D5280' },
};

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, markAllAsRead, handleMarkRead } = useNotificationPanelLogic();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute right-0 top-full mt-3 z-50 flex flex-col border border-white/10 shadow-2xl overflow-hidden rounded-3xl"
      style={{
        width: '380px',
        maxHeight: '520px',
        background: 'rgba(5, 8, 28, 0.92)',
        backdropFilter: 'blur(30px) saturate(160%)',
        WebkitBackdropFilter: 'blur(30px) saturate(160%)',
      }}
    >
      {/* Ambient glow line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-jne-red/40 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/2">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-[14px] font-black text-white uppercase tracking-tight">
              Notifications
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest">
                Pulse Monitor
              </span>
              {unreadCount > 0 && (
                <>
                  <div className="w-1 h-1 rounded-full bg-jne-red/40" />
                  <span className="text-[8px] text-jne-red font-black uppercase tracking-widest">
                    {unreadCount} UNREAD
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[10px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg border border-white/5"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-jne-red/20 hover:border-jne-red/40 transition-all"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white/1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="w-16 h-16 rounded-4xl bg-linear-to-br from-white/5 to-transparent border border-white/10 flex items-center justify-center mb-5 group relative overflow-hidden">
              <div className="absolute inset-0 bg-jne-success/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Bell size={24} className="text-white/10 group-hover:text-jne-success transition-all duration-500 group-hover:scale-110" />
            </div>
            <p className="text-[12px] font-black text-white/40 uppercase tracking-widest">
              Zero Alerts
            </p>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-tight mt-2 leading-relaxed max-w-[200px]">
              System is operating at nominal capacity. No pending signals.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/4">
            <AnimatePresence mode="popLayout">
              {notifications.map((notif, idx) => {
                const config = iconMap[notif.type] || iconMap.system;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => handleMarkRead(notif)}
                    className={`relative group p-5 transition-all cursor-pointer ${
                      notif.isRead ? 'bg-transparent' : 'bg-white/4'
                    } hover:bg-white/8`}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-jne-red shadow-[0_0_12px_rgba(255,51,102,0.6)]" />
                    )}

                    <div className="flex gap-4">
                      {/* Icon Badge */}
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${config.iconColor}25, ${config.iconColor}05)`,
                          border: `1px solid ${config.iconColor}20`,
                        }}
                      >
                        <Icon size={18} style={{ color: config.iconColor }} />
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className={`text-[12px] font-black tracking-tight leading-tight ${
                            notif.isRead ? 'text-white/60' : 'text-white'
                          }`}>
                            {notif.title}
                          </h4>
                          <span className="text-[8px] font-mono text-white/20 whitespace-nowrap pt-0.5">
                            {formatDistanceToNow(new Date(notif.createdAt), {
                              addSuffix: true,
                              locale: localeId,
                            })}
                          </span>
                        </div>
                        <p className={`mt-1 text-[11px] font-medium leading-relaxed line-clamp-2 ${
                          notif.isRead ? 'text-white/30' : 'text-white/50'
                        }`}>
                          {notif.message}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <span
                            className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border"
                            style={{
                              borderColor: `${config.iconColor}25`,
                              color: config.iconColor,
                              background: `${config.iconColor}10`,
                            }}
                          >
                            {notif.type.replace('_', ' ')}
                          </span>

                          <div className="h-4 w-4 flex items-center justify-center">
                            {!notif.isRead && (
                              <div className="w-1.5 h-1.5 rounded-full bg-jne-red animate-pulse shadow-[0_0_8px_rgba(255,51,102,0.8)]" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-white/3 border-t border-white/5">
        <button
          onClick={onClose}
          className="group w-full py-3 rounded-2xl bg-white/4 border border-white/5 text-[10px] font-black text-white/30 hover:text-white hover:bg-white/8 hover:border-white/10 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2"
        >
          <X size={12} className="group-hover:rotate-90 transition-transform duration-500" />
          Dismiss Interface
        </button>
      </div>
    </motion.div>
  );
}