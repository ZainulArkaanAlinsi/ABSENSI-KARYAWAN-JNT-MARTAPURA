'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MapPin, User, ChevronRight, PhoneCall } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function ActiveAlerts() {
  const { notifications } = useNotifications();
  
  // Filter for SOS alerts (type: attendance_alert and contains SOS)
  const sosAlerts = notifications.filter(n => 
    !n.isRead && 
    (n.type === 'attendance_alert' && n.title.includes('SOS'))
  );

  if (sosAlerts.length === 0) return null;

  return (
    <div className="col-span-12 mb-2">
      <AnimatePresence>
        {sosAlerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden group mb-4"
          >
            {/* Industrial Border Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#D21F24]" />
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 p-5 md:p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-5">
                <div className="h-12 w-12 rounded-lg bg-[#D21F24] flex items-center justify-center text-white shrink-0">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-[#D21F24] uppercase tracking-[0.2em]">Sinyal Darurat Aktif</span>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: localeId }) : 'Baru saja'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    {alert.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-400 max-w-xl mt-1">
                    {alert.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button 
                  onClick={() => window.open(`https://www.google.com/maps?q=${alert.message.split('Last: ')[1] || ''}`, '_blank')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  <MapPin size={14} /> Buka Peta
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
