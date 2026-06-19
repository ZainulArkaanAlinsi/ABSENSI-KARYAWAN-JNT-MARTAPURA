'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Info } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { useRef, useEffect } from 'react';
import type { CalendarEvent } from '@/types';
import { CalendarDay } from '@/utils/calendarHelpers';
import { usePopAnimation, useStaggerEntrance } from '@/hooks/useAnime';

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
  attendanceHeatmap?: Record<string, number>;
  totalEmployees?: number;
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
  attendanceHeatmap = {},
  totalEmployees = 1,
}: CalendarGridProps) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const gridRef = useRef<HTMLDivElement>(null);

  // AnimeJS Staggered Entrance
  const { animateEntrance } = useStaggerEntrance('.calendar-day-cell', gridRef);

  // Trigger entrance animation when month changes
  useEffect(() => {
    animateEntrance();
  }, [currentYear, currentMonthIndex, animateEntrance]);

  const getDayDetails = (day: CalendarDay | null) => {
    if (!day) return null;
    const userEvts = filteredEvents.filter(
      (event) => event.startDate && event.startDate.split('T')[0] === day.date,
    );
    const sysEvents = holidaysMap[day.date] || [];
    const uiCategory = sysEvents.length > 0 ? 'holiday' : 'normal';
    const uiColorHint =
      sysEvents.length > 0
        ? { bg: 'var(--accent-info)', text: '#FFFFFF', accent: 'var(--accent-info)' }
        : { bg: 'transparent', text: 'var(--text-primary)', accent: 'var(--border-color)' };

    // Heatmap Logic
    const presentCount = attendanceHeatmap[day.date] || 0;
    const attendanceRate = presentCount / totalEmployees;
    let heatColor = 'transparent';

    if (presentCount > 0) {
      if (attendanceRate >= 0.8) heatColor = 'rgba(16, 185, 129, 0.15)';
      else if (attendanceRate <= 0.4) heatColor = 'rgba(244, 63, 94, 0.15)';
      else heatColor = 'rgba(234, 179, 8, 0.15)';
    }

    return {
      ...day,
      systemEvents: sysEvents,
      userEvents: userEvts,
      uiCategory,
      uiColorHint,
      heatColor,
      presentCount,
    };
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
        <h2 className="text-xl font-black italic tracking-tighter text-(--text-primary) flex items-center gap-4 uppercase">
          {format(new Date(currentYear, currentMonthIndex - 1, 1), 'MMMM yyyy')}
          <button
            onClick={onToday}
            className="text-[10px] font-black uppercase tracking-widest bg-(--bg-card) hover:bg-(--accent-info) hover:text-white px-4 py-2 rounded-xl text-(--text-secondary) transition-all border border-(--border-color)"
          >
            Hari Ini
          </button>
        </h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-(--bg-card) rounded-xl p-1 border border-(--border-color)">
            <button
              onClick={onPrevMonth}
              className="p-2 hover:bg-(--bg-main) rounded-lg text-(--text-primary) transition-all"
              disabled={currentYear <= 2000}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="w-px h-4 bg-(--border-color) mx-1" />
            <button
              onClick={onNextMonth}
              className="p-2 hover:bg-(--bg-main) rounded-lg text-(--text-primary) transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddEvent}
            className="bg-(--accent-info) text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-(--accent-info)/20"
          >
            <Plus size={14} />
            <span>Acara Baru</span>
          </motion.button>
        </div>
      </div>

      {/* Tabel Kalender */}
      <div className="bg-(--bg-card) border border-(--border-color) rounded-2xl overflow-hidden flex-1 flex flex-col shadow-2xl">
        {/* Header Hari */}
        <div className="grid grid-cols-7 border-b border-(--border-color) bg-(--bg-main)/30">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-4 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary) opacity-60">
                {day.substring(0, 3)}
              </span>
            </div>
          ))}
        </div>

        {/* Grid Hari */}
        <div ref={gridRef} className="grid grid-cols-7 flex-1 min-h-[420px]">
          {monthWeeks.map((week, wIdx) =>
            week.map((day, dIdx) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${wIdx}-${dIdx}`}
                    className="calendar-day-cell bg-black/10 border-r border-b border-white/5 opacity-50"
                  />
                );
              }

              const details = getDayDetails(day)!;
              const isSelected = day.date === selectedDateStr;
              const isTodayActive = isToday(parseISO(day.date));

              return (
                <CalendarCell
                  key={day.date}
                  day={day}
                  details={details}
                  isSelected={isSelected}
                  isTodayActive={isTodayActive}
                  onSelectDate={onSelectDate}
                />
              );
            }),
          )}
        </div>

        {/* Legenda - diperbesar */}
        <div className="p-3 border-t border-white/5 bg-white/2">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Info size={14} /> Heatmap Presensi:
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500/30" />
              <span className="text-xs text-slate-400">Padat (&gt;80%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-yellow-500/30" />
              <span className="text-xs text-slate-400">Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-rose-500/30" />
              <span className="text-xs text-slate-400">Sepi (&lt;40%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type DayDetails = CalendarDay & {
  systemEvents: string[];
  userEvents: CalendarEvent[];
  uiCategory: string;
  uiColorHint: { bg: string; text: string; accent: string };
  heatColor: string;
  presentCount: number;
};

type CalendarCellProps = {
  day: CalendarDay;
  details: DayDetails;
  isSelected: boolean;
  isTodayActive: boolean;
  onSelectDate: (date: string) => void;
};

function CalendarCell({
  day,
  details,
  isSelected,
  isTodayActive,
  onSelectDate,
}: CalendarCellProps) {
  const { elementRef, play } = usePopAnimation<HTMLDivElement>();

  return (
    <div
      ref={elementRef}
      onClick={() => {
        onSelectDate(day.date);
        play();
      }}
      className={`calendar-day-cell relative min-h-[90px] p-3 border-r border-b border-(--border-color) cursor-pointer transition-all duration-500 group
        ${isSelected ? 'z-10 bg-(--accent-info)/5 ring-1 ring-inset ring-(--accent-info)/30 shadow-2xl shadow-(--accent-info)/10' : ''}
      `}
      style={{
        backgroundColor: isSelected ? undefined : details.heatColor,
      }}
    >
      <div className="flex justify-between items-start">
        <div
          className={`
            w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all
            ${isTodayActive ? 'bg-(--accent-info) text-white shadow-xl shadow-(--accent-info)/30 rotate-3' : ''}
            ${!isTodayActive && details.uiCategory !== 'normal' ? 'bg-(--accent-info)/10 text-(--accent-info) ring-1 ring-(--accent-info)/20' : ''}
            ${!isTodayActive && details.uiCategory === 'normal' ? 'text-(--text-primary) opacity-40 group-hover:opacity-100 group-hover:bg-(--bg-main) group-hover:scale-110' : ''}
            ${isSelected && !isTodayActive ? 'bg-(--accent-info) text-white scale-110 rotate-6 shadow-xl shadow-(--accent-info)/20' : ''}
          `}
        >
          {day.date.split('-')[2]}
        </div>

        {details.systemEvents.length > 0 && (
          <div className="absolute top-1 right-1">
            <div
              className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"
              style={{ backgroundColor: details.uiColorHint.bg }}
            />
          </div>
        )}
      </div>

      {/* Enhanced Data Markers */}
      <div className="mt-1 flex flex-col gap-1 min-h-[16px] relative">
        {details.userEvents.some((e) => e.category === 'meeting') && (
          <div className="absolute -top-7 -left-1 w-10 h-10 rounded-full border border-jne-red/20 animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.1)] pointer-events-none" />
        )}
      </div>

      <div className="space-y-1 mt-1">
        {details.systemEvents.slice(0, 2).map((evt: string, i: number) => (
          <div
            key={i}
            className="text-[11px] leading-tight text-white/90 font-medium truncate bg-white/5 px-1.5 py-1 rounded border-l-2"
            style={{ borderColor: details.uiColorHint.bg }}
          >
            {evt}
          </div>
        ))}
        {details.systemEvents.length > 2 && (
          <div className="text-[10px] text-slate-500 font-bold">
            +{details.systemEvents.length - 2}
          </div>
        )}
        {details.userEvents.length > 0 && (
          <div className="flex gap-0.5 flex-wrap">
            {details.userEvents.map((evt, i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: evt.color || '#8B5CF6' }}
              />
            ))}
          </div>
        )}
      </div>

      {isSelected && <div className="absolute inset-0 bg-jne-red/20 pointer-events-none" />}

      {isTodayActive && (
        <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-jne-red animate-ping" />
      )}
    </div>
  );
}
