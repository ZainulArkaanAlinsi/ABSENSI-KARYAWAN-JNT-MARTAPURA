'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Info } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import type { CalendarEvent } from '@/types';
import { CalendarDay } from '@/utils/calendarHelpers';

type CalendarGridProps = {
  currentYear: number;
  currentMonthIndex: number;
  monthWeeks: (CalendarDay | null)[][];
  holidaysMap: Record<string, string[]>;
  filteredEvents: CalendarEvent[];
  selectedDateStr: string;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onAddEvent: () => void;
};

export default function CalendarGrid({
  currentYear,
  currentMonthIndex,
  monthWeeks,
  holidaysMap,
  filteredEvents,
  selectedDateStr,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onAddEvent,
}: CalendarGridProps) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getDayDetails = (day: CalendarDay | null) => {
    if (!day) return null;
    const userEvts = filteredEvents.filter((event) =>
      event.startDate && event.startDate.split('T')[0] === day.date
    );
    const sysEvents = holidaysMap[day.date] || [];
    const uiCategory = sysEvents.length > 0 ? 'holiday' : 'normal';
    const uiColorHint = sysEvents.length > 0
      ? { bg: '#F97316', text: '#FFFFFF', accent: '#FDBA74' }
      : { bg: '#F8FAFC', text: '#1E293B', accent: '#CBD5E1' };

    return {
      ...day,
      systemEvents: sysEvents,
      userEvents: userEvts,
      uiCategory,
      uiColorHint,
    };
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header Controls - sangat kecil */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          {format(new Date(currentYear, currentMonthIndex - 1, 1), 'MMMM yyyy')}
          <button
            onClick={onToday}
            className="text-[11px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-slate-400 transition-colors"
          >
            Hari Ini
          </button>
        </h2>

        <div className="flex items-center gap-1">
          <div className="flex items-center bg-white/5 rounded-md p-0.5 border border-white/5">
            <button
              onClick={onPrevMonth}
              className="p-1 hover:bg-white/10 rounded text-slate-300 disabled:opacity-20"
              disabled={currentYear <= 2000}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="w-0.5 h-3 bg-white/5 mx-0.5" />
            <button
              onClick={onNextMonth}
              className="p-1 hover:bg-white/10 rounded text-slate-300"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddEvent}
            className="bg-jne-red hover:bg-red-500 text-white px-3 py-1.5 rounded-md text-[11px] font-semibold flex items-center gap-1 shadow-lg shadow-red-900/20"
          >
            <Plus size={12} />
            <span className="hidden sm:inline">Acara Baru</span>
          </motion.button>
        </div>
      </div>

      {/* Tabel Kalender - sangat kecil */}
      <div className="bg-[#1A1C23]/60 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden flex-1 flex flex-col shadow-2xl">
        {/* Header Hari */}
        <div className="grid grid-cols-7 border-b border-white/5 bg-white/2">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-1 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {day.substring(0, 3)}
              </span>
            </div>
          ))}
        </div>

        {/* Grid Hari */}
        <div className="grid grid-cols-7 flex-1 min-h-[420px]">
          {monthWeeks.map((week, wIdx) =>
            week.map((day, dIdx) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${wIdx}-${dIdx}`}
                    className="bg-black/10 border-r border-b border-white/5 opacity-50"
                  />
                );
              }

              const details = getDayDetails(day)!;
              const isSelected = day.date === selectedDateStr;
              const isTodayActive = isToday(parseISO(day.date));

              return (
                <motion.div
                  key={day.date}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  onClick={() => onSelectDate(day.date)}
                  className={`relative min-h-[70px] p-2 border-r border-b border-white/5 cursor-pointer transition-all duration-300 group
                    ${isSelected ? 'z-10 ring-1 ring-inset ring-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : ''}
                  `}
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.05)' : details.uiColorHint.bg + '11',
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div
                      className={`
                        w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                        ${isTodayActive ? 'bg-jne-red text-white shadow-lg shadow-jne-red/30' : ''}
                        ${!isTodayActive && details.uiCategory !== 'normal' ? 'bg-white/5 text-white ring-1 ring-white/10' : ''}
                        ${!isTodayActive && details.uiCategory === 'normal' ? 'text-slate-400 group-hover:text-white' : ''}
                        ${isSelected && !isTodayActive ? 'ring-2 ring-white/20 scale-110' : ''}
                      `}
                      style={{
                        backgroundColor: !isTodayActive && details.uiCategory !== 'normal' ? details.uiColorHint.bg : undefined,
                        color: !isTodayActive && details.uiCategory !== 'normal' ? details.uiColorHint.text : undefined,
                      }}
                    >
                      {day.date.split('-')[2]}
                    </div>

                    {details.systemEvents.length > 0 && (
                      <div className="absolute top-1 right-1">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" style={{ backgroundColor: details.uiColorHint.bg }} />
                      </div>
                    )}
                  </div>

                  {/* Enhanced Data Markers */}
                  <div className="mt-1 flex flex-col gap-0.5 min-h-[12px] relative">
                    {details.userEvents.some(e => e.category === 'meeting') && (
                      <div className="absolute -top-6 -left-1 w-8 h-8 rounded-full border border-jne-red/20 animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.1)] pointer-events-none" />
                    )}
                  </div>

                  <div className="space-y-0.5 mt-1">
                    {details.systemEvents.slice(0, 2).map((evt: string, i: number) => (
                      <div
                        key={i}
                        className="text-[9px] leading-tight text-white/90 font-medium truncate bg-white/5 px-1 py-0.5 rounded border-l-2"
                        style={{ borderColor: details.uiColorHint.bg }}
                      >
                        {evt}
                      </div>
                    ))}
                    {details.systemEvents.length > 2 && (
                      <div className="text-[8px] text-slate-500">+{details.systemEvents.length - 2}</div>
                    )}
                    {details.userEvents.length > 0 && (
                      <div className="flex gap-0.5 flex-wrap">
                        {details.userEvents.map((evt: any, i: number) => (
                          <div
                            key={i}
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: evt.color || '#8B5CF6' }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <div className="absolute inset-0 bg-linear-to-br from-jne-red/10 to-transparent pointer-events-none" />
                  )}
                  
                  {isTodayActive && (
                    <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-jne-red animate-ping" />
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Legenda - sangat kecil */}
        <div className="p-2 border-t border-white/5 bg-white/2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Info size={10} /> Legenda:
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#F97316]" />
              <span className="text-[9px] text-slate-400">Libur</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              <span className="text-[9px] text-slate-400">Kerja</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#A855F7]" />
              <span className="text-[9px] text-slate-400">Pribadi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#EAB308]" />
              <span className="text-[9px] text-slate-400">Ingat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}