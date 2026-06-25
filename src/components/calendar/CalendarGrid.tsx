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
    // "Tanggal merah" = libur nasional ATAU hari Minggu (konvensi kalender ID).
    const isSunday = parseISO(day.date).getDay() === 0;
    const isRedDate = sysEvents.length > 0 || isSunday;
    const uiCategory = sysEvents.length > 0 ? 'holiday' : 'normal';

    // Heatmap presensi (rasio kehadiran nyata / total karyawan). Warna lembut,
    // konsisten: hijau = ramai, kuning = sedang, merah-muda = sepi.
    const presentCount = attendanceHeatmap[day.date] || 0;
    const attendanceRate = totalEmployees > 0 ? presentCount / totalEmployees : 0;
    let heatColor = 'transparent';
    if (presentCount > 0) {
      if (attendanceRate >= 0.8) heatColor = 'rgba(16, 185, 129, 0.12)';
      else if (attendanceRate <= 0.4) heatColor = 'rgba(244, 63, 94, 0.10)';
      else heatColor = 'rgba(245, 158, 11, 0.10)';
    }

    return {
      ...day,
      systemEvents: sysEvents,
      userEvents: userEvts,
      uiCategory,
      isSunday,
      isRedDate,
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
              <span
                className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                  day === 'Sunday'
                    ? 'text-rose-500 opacity-90'
                    : 'text-(--text-secondary) opacity-60'
                }`}
              >
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
                    className="calendar-day-cell border-r border-b border-(--border-color) bg-(--bg-main)/40 opacity-40"
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

        {/* Legenda */}
        <div className="p-3 border-t border-(--border-color) bg-(--bg-main)/30">
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-(--text-secondary) flex items-center gap-1.5">
              <Info size={13} /> Kehadiran:
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500/40" />
              <span className="text-[11px] text-(--text-secondary)">Ramai (≥80%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-amber-500/40" />
              <span className="text-[11px] text-(--text-secondary)">Sedang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-rose-500/40" />
              <span className="text-[11px] text-(--text-secondary)">Sepi (≤40%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[11px] text-(--text-secondary)">Tanggal merah / libur</span>
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
  isSunday: boolean;
  isRedDate: boolean;
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

  // Warna angka tanggal: biru untuk hari ini/terpilih (interaktif), merah lembut
  // untuk tanggal merah (libur/Minggu), netral untuk hari biasa.
  let dateBadgeCls: string;
  if (isTodayActive) {
    dateBadgeCls = 'bg-(--accent-info) text-white shadow-md shadow-(--accent-info)/25';
  } else if (isSelected) {
    dateBadgeCls = 'bg-(--accent-info) text-white scale-105 shadow-md shadow-(--accent-info)/20';
  } else if (details.isRedDate) {
    dateBadgeCls = 'text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/10';
  } else {
    dateBadgeCls =
      'text-(--text-primary) opacity-50 group-hover:opacity-100 group-hover:bg-(--bg-main)';
  }

  return (
    <div
      ref={elementRef}
      onClick={() => {
        onSelectDate(day.date);
        play();
      }}
      className={`calendar-day-cell relative min-h-[90px] p-2.5 border-r border-b border-(--border-color) cursor-pointer transition-colors duration-200 group
        ${isSelected ? 'z-10 ring-1 ring-inset ring-(--accent-info)/40' : ''}
      `}
      style={{
        backgroundColor: isSelected ? 'color-mix(in srgb, var(--accent-info) 7%, transparent)' : details.heatColor,
      }}
    >
      <div className="flex justify-between items-start">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${dateBadgeCls}`}
        >
          {day.date.split('-')[2]}
        </div>

        {details.systemEvents.length > 0 && (
          <span className="mt-1 mr-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
        )}
      </div>

      <div className="space-y-1 mt-1.5">
        {details.systemEvents.slice(0, 2).map((evt: string, i: number) => (
          <div
            key={i}
            className="text-[10px] leading-tight font-semibold truncate px-1.5 py-0.5 rounded border-l-2 border-rose-400 bg-rose-500/10 text-rose-700 dark:text-rose-300"
            title={evt}
          >
            {evt}
          </div>
        ))}
        {details.systemEvents.length > 2 && (
          <div className="text-[10px] text-(--text-secondary) font-bold">
            +{details.systemEvents.length - 2} lainnya
          </div>
        )}
        {details.userEvents.length > 0 && (
          <div className="flex gap-1 flex-wrap items-center pt-0.5">
            {details.userEvents.slice(0, 6).map((evt, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: evt.color || 'var(--accent-info)' }}
                title={evt.title}
              />
            ))}
            {details.userEvents.length > 6 && (
              <span className="text-[9px] text-(--text-secondary) font-bold">
                +{details.userEvents.length - 6}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
