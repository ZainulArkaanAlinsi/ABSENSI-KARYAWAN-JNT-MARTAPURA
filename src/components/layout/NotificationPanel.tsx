'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, AlertCircle, Clock } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const toDate = (val: unknown): Date => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === 'object' && val !== null) {
    const o = val as { seconds?: number; toDate?: () => Date };
    if ('seconds' in val) return new Date((o.seconds as number) * 1000);
    if ('toDate' in val && typeof o.toDate === 'function') return o.toDate();
  }
  const d = new Date(val as string | number);
  return isNaN(d.getTime()) ? new Date() : d;
};

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-100"
          />

          {/* PANEL */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="fixed top-6 right-24 bottom-6 w-96 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl z-101 flex flex-col border border-white/10 overflow-hidden"
          >
            {/* HEADER */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-600/20">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                    Notifications
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {unreadCount} UNREAD ALERTS
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    Loading Alerts...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50">
                  <Bell size={48} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl border transition-all ${
                        notif.isRead
                          ? 'bg-transparent border-slate-100 dark:border-white/5 opacity-60'
                          : 'bg-white dark:bg-white/5 border-cyan-600/20 shadow-sm'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div
                          className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            notif.type === 'attendance_alert'
                              ? 'bg-blue-500/10 text-blue-500'
                              : notif.type === 'leave_request'
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-rose-500/10 text-rose-500'
                          }`}
                        >
                          <AlertCircle size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Clock size={10} />
                              {formatDistanceToNow(toDate(notif.createdAt), {
                                addSuffix: true,
                                locale: id,
                              })}
                            </span>
                            {!notif.isRead && (
                              <button
                                onClick={() => markAsRead(notif.id)}
                                className="text-[9px] font-black text-rose-600 uppercase tracking-widest hover:underline"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex gap-3">
                <button
                  onClick={() => markAllAsRead()}
                  className="flex-1 h-10 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 transition-colors"
                >
                  <Check size={14} />
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
