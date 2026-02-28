import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, format } from 'date-fns';

export type CalendarDay = {
  date: string;
  dayName: string;
};

export function getMonthWeeks(year: number, month: number): (CalendarDay | null)[][] {
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });

  const firstDayIndex = getDay(start); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Senin = 0, Minggu = 6

  const weeks: (CalendarDay | null)[][] = [];
  let currentWeek: (CalendarDay | null)[] = Array(startOffset).fill(null);

  days.forEach((day) => {
    currentWeek.push({
      date: format(day, 'yyyy-MM-dd'),
      dayName: format(day, 'EEEE'),
    });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}