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
  onQuickAction: (type: 'notif' | 'chat' | 'global' | 'maps') => void;
};

export default function EventListPanel({
  selectedDayDetails,
  searchQuery,
  filterCategory,
  onSearchChange,
  onFilterChange,
  onEditEvent,
  onDeleteEvent,
  onQuickAction,
}: EventListPanelProps) {
  return (
    <div className="w-full lg:w-[320px] flex flex-col gap-4">
      <div className="bg-(--bg-card) border border-(--border-color) rounded-2xl p-4 flex-1 flex flex-col shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-(--accent-info)/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-(--accent-info)/10 transition-all duration-1000" />

        <div className="flex items-center justify-between mb-4 relative">
          <div>
            <h3 className="text-sm font-black italic uppercase tracking-widest text-(--text-primary)">Detail Hari</h3>
            <p className="text-[10px] text-(--text-secondary) mt-1 font-bold italic opacity-60 uppercase tracking-widest">
              {selectedDayDetails ? format(parseISO(selectedDayDetails.date), 'eeee, dd MMM') : ''}
            </p>
          </div>
        </div>

        {/* Filter & Pencarian */}
        <div className="mb-4 space-y-2 relative">
          <div className="flex items-center gap-3 bg-(--bg-main) border border-(--border-color) rounded-xl px-4 py-3 focus-within:border-(--accent-info)/50 transition-all">
            <Search size={14} className="text-(--text-secondary) opacity-40" />
            <input
              type="text"
              placeholder="Cari acara..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent border-none text-[11px] font-black text-(--text-primary) flex-1 outline-none uppercase tracking-widest placeholder:opacity-30"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full bg-(--bg-main) border border-(--border-color) rounded-xl px-4 py-3 text-[11px] font-black text-(--text-primary) uppercase tracking-widest outline-none focus:border-(--accent-info)/50 transition-all appearance-none cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            <option value="work">Pekerjaan</option>
            <option value="personal">Pribadi</option>
            <option value="reminder">Pengingat</option>
          </select>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar relative max-h-[400px]">
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
                    className="bg-(--bg-main) border border-(--border-color) rounded-xl p-4 border-l-4"
                    style={{ borderLeftColor: 'var(--accent-info)' }}
                  >
                    <h4 className="font-black text-(--text-primary) text-[11px] uppercase tracking-widest italic">{evt}</h4>
                    <p className="text-[9px] text-(--accent-info) mt-1 uppercase tracking-widest font-black opacity-70">
                      Libur Nasional
                    </p>
                  </motion.div>
                ))}

                {/* User Events */}
                {selectedDayDetails.userEvents.map((event: any, idx: number) => (
                  <motion.div
                    key={`user-${event.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group/item relative bg-(--bg-main) hover:bg-(--bg-card) border border-(--border-color) rounded-xl p-4 transition-all duration-300 border-l-4"
                    style={{ borderLeftColor: event.color || '#8B5CF6' }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-(--text-primary) text-[11px] uppercase tracking-widest italic line-clamp-1">{event.title}</h4>
                        <div className="flex items-center gap-2 text-[9px] text-(--text-secondary) mt-1.5 font-bold uppercase tracking-widest">
                          <Clock size={12} className="text-(--accent-info)" />
                          {event.startDate && format(parseISO(event.startDate), 'HH:mm')}
                          {event.endDate && `-${format(parseISO(event.endDate), 'HH:mm')}`}
                        </div>
                        {event.description && (
                          <p className="text-[10px] text-(--text-secondary) mt-2 line-clamp-2 leading-relaxed opacity-60">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditEvent(event)}
                          className="p-1.5 hover:bg-(--bg-main) rounded-lg text-(--text-secondary) transition-all"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 transition-all"
                        >
                          <Trash2 size={12} />
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
                className="flex flex-col items-center justify-center py-12 text-center opacity-40"
              >
                <div className="w-16 h-16 rounded-full bg-(--bg-main) flex items-center justify-center mb-4 border border-(--border-color)">
                   <CalendarIcon size={24} className="text-(--text-secondary)" />
                </div>
                <p className="text-[11px] font-black text-(--text-primary) uppercase tracking-widest">Tidak ada acara</p>
                <p className="text-[9px] text-(--text-secondary) mt-2 uppercase tracking-widest opacity-60">Pilih tanggal lain</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-(--border-color) grid grid-cols-4 gap-2 px-1">
          {[
            { icon: Bell, label: 'NOTIF', type: 'notif' },
            { icon: MessageSquare, label: 'CHAT', type: 'chat' },
            { icon: Globe, label: 'GLOBAL', type: 'global' },
            { icon: MapPin, label: 'MAPS', type: 'maps' },
          ].map((action, i) => (
            <button 
              key={i} 
              onClick={() => onQuickAction(action.type as any)}
              className="flex flex-col items-center gap-2 group/action transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-(--bg-main) border border-(--border-color) flex items-center justify-center text-(--text-secondary) transition-all group-hover/action:bg-(--accent-info) group-hover/action:text-white group-hover/action:scale-110 group-hover/action:rotate-3 shadow-sm">
                <action.icon size={16} />
              </div>
              <span className="text-[8px] font-black text-(--text-secondary) uppercase tracking-tighter opacity-40 group-hover/action:opacity-100">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}