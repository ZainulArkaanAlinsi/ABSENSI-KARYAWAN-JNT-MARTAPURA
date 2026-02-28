'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar as CalendarIcon, Clock, Bell, MessageSquare, Globe, MapPin, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { CalendarEvent } from '@/types';

type EventListPanelProps = {
  selectedDayDetails: any | null;
  searchQuery: string;
  filterCategory: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
};

export default function EventListPanel({
  selectedDayDetails,
  searchQuery,
  filterCategory,
  onSearchChange,
  onFilterChange,
  onEditEvent,
  onDeleteEvent,
}: EventListPanelProps) {
  return (
    <div className="w-full lg:w-[280px] flex flex-col gap-3">
      <div className="bg-[#1A1C23]/60 backdrop-blur-xl border border-white/5 rounded-xl p-3 flex-1 flex flex-col shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-jne-red/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-jne-red/10 transition-all duration-1000" />

        <div className="flex items-center justify-between mb-2 relative">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Detail Hari</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium italic">
              {selectedDayDetails ? format(parseISO(selectedDayDetails.date), 'eeee, dd MMM') : ''}
            </p>
          </div>
        </div>

        {/* Filter & Pencarian */}
        <div className="mb-2 space-y-1">
          <div className="flex items-center gap-1 bg-white/5 rounded-md px-1.5 py-1">
            <Search size={10} className="text-slate-500" />
            <input
              type="text"
              placeholder="Cari acara..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent border-none text-xs text-white flex-1 outline-none"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-md px-1.5 py-1 text-xs text-white"
          >
            <option value="all">Semua</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="reminder">Reminder</option>
          </select>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5 custom-scrollbar relative max-h-[300px]">
          <AnimatePresence mode="popLayout">
            {selectedDayDetails &&
            (selectedDayDetails.systemEvents.length > 0 ||
              selectedDayDetails.userEvents.length > 0) ? (
              <>
                {/* System Events (Libur) */}
                {selectedDayDetails.systemEvents.map((evt: string, idx: number) => (
                  <motion.div
                    key={`sys-${idx}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/3 border border-white/5 rounded-lg p-2 border-l-4"
                    style={{ borderLeftColor: '#F97316' }}
                  >
                    <h4 className="font-bold text-white text-xs">{evt}</h4>
                    <p className="text-[8px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">
                      Libur
                    </p>
                  </motion.div>
                ))}

                {/* User Events */}
                {selectedDayDetails.userEvents.map((event: any, idx: number) => (
                  <motion.div
                    key={`user-${event.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group/item relative bg-white/3 hover:bg-white/5 border border-white/5 rounded-lg p-2 transition-all duration-300 border-l-4"
                    style={{ borderLeftColor: event.color || '#8B5CF6' }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-xs line-clamp-1">{event.title}</h4>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5 font-medium">
                          <Clock size={10} className="text-violet-400" />
                          {event.startDate && format(parseISO(event.startDate), 'HH:mm')}
                          {event.endDate && `-${format(parseISO(event.endDate), 'HH:mm')}`}
                        </div>
                        {event.description && (
                          <p className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-0.5 ml-1">
                        <button
                          onClick={() => onEditEvent(event)}
                          className="p-0.5 hover:bg-white/10 rounded text-slate-400"
                        >
                          <Edit size={10} />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="p-1 hover:bg-white/10 rounded text-red-400"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center opacity-40"
              >
                <CalendarIcon size={32} className="text-slate-600 mb-2 stroke-1" />
                <p className="text-xs font-medium text-slate-400">Tidak ada acara</p>
                <p className="text-[8px] text-slate-600 mt-1 uppercase tracking-widest">Pilih tanggal lain</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions - sangat kecil */}
        <div className="mt-3 pt-2 border-t border-white/5 grid grid-cols-4 gap-1 px-0.5">
          {[
            { icon: Bell, label: 'Notif' },
            { icon: MessageSquare, label: 'Chat' },
            { icon: Globe, label: 'Global' },
            { icon: MapPin, label: 'Maps' },
          ].map((action, i) => (
            <button key={i} className="flex flex-col items-center gap-1 group/action">
              <div className="w-6 h-6 rounded bg-white/3 flex items-center justify-center text-slate-500 transition-all group-hover/action:bg-white/10 group-hover/action:text-white group-hover/action:scale-110">
                <action.icon size={11} />
              </div>
              <span className="text-[7px] font-bold text-slate-600 uppercase tracking-tighter group-hover/action:text-slate-400">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}