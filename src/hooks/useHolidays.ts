// hooks/useHolidays.ts
import { useMemo } from 'react';

export function useHolidays(year: number) {
  // Derived directly from `year` — no async fetch, so useMemo avoids the
  // set-state-in-effect pattern while keeping the same return shape.
  const holidaysMap = useMemo<Record<string, string[]>>(
    () => ({
      [`${year}-01-01`]: ['Tahun Baru Masehi'],
      [`${year}-05-01`]: ['Hari Buruh Internasional'],
      [`${year}-06-01`]: ['Hari Lahir Pancasila'],
      [`${year}-08-17`]: ['Hari Kemerdekaan Republik Indonesia'],
      [`${year}-12-25`]: ['Hari Raya Natal'],
    }),
    [year],
  );

  return { holidaysMap, loading: false };
}
