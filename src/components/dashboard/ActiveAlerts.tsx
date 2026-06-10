'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MapPin, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

function toDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === 'object') {
    const v = val as Record<string, unknown>;
    if (typeof v.seconds === 'number') return new Date(v.seconds * 1000);
    if (typeof v.toDate === 'function') {
      const res = (v.toDate as () => unknown)();
      if (res instanceof Date) return res;
    }
  }

  const d = new Date(val as string | number);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function isSosNotification(type: string | undefined, title: string, message: string) {
  const lowerTitle = title.toLowerCase();
  const lowerMessage = message.toLowerCase();

  return (
    type === 'sos_alert' ||
    type === 'attendance_alert' ||
    lowerTitle.includes('sos') ||
    lowerMessage.includes('sos') ||
    lowerMessage.includes('darurat')
  );
}

function extractMapQuery(message: string) {
  const match = message.match(/\(?(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)\)?/);
  if (match) return `${match[1]},${match[2]}`;

  const lastPart = message.split('Last: ')[1];
  return lastPart?.trim() ?? '';
}

export default function ActiveAlerts() {
  const { notifications } = useNotifications();

  const sosAlerts = notifications.filter((n) => {
    if (n.isRead) return false;
    return isSosNotification(n.type, n.title, n.message);
  });

  if (sosAlerts.length === 0) return null;

  return (
    <div className="col-span-12 mb-2">
      <AnimatePresence>
        {sosAlerts.map((alert, i) => {
          const mapQuery = extractMapQuery(alert.message);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden group mb-4"
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-600" />

              <div className="relative flex flex-col gap-4 rounded-2xl border border-red-200 bg-white p-5 shadow-[0_12px_30px_rgba(220,38,38,0.12)] md:flex-row md:items-center md:justify-between md:p-6 dark:border-red-500/20 dark:bg-slate-950">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
                    <AlertCircle size={24} />
                  </div>

                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-red-600">
                        Sinyal Darurat Aktif
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        {alert.createdAt
                          ? formatDistanceToNow(toDate(alert.createdAt), {
                              addSuffix: true,
                              locale: localeId,
                            })
                          : 'Baru saja'}
                      </span>
                    </div>

                    <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white md:text-xl">
                      {alert.title}
                    </h3>

                    <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="flex w-full items-center gap-2 md:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const url = mapQuery
                        ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}`
                        : 'https://www.google.com/maps';
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-red-700 md:w-auto"
                  >
                    <MapPin size={14} />
                    Buka Peta
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
