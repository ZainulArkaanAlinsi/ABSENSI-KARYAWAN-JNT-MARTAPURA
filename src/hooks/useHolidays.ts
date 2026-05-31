// hooks/useHolidays.ts
import { useState, useEffect } from 'react';

export function useHolidays(year: number) {
  const [holidaysMap, setHolidaysMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setHolidaysMap({
      [`${year}-01-01`]: ['Tahun Baru Masehi'],
      [`${year}-05-01`]: ['Hari Buruh Internasional'],
      [`${year}-06-01`]: ['Hari Lahir Pancasila'],
      [`${year}-08-17`]: ['Hari Kemerdekaan Republik Indonesia'],
      [`${year}-12-25`]: ['Hari Raya Natal'],
    });
    setLoading(false);
  }, [year]);

  return { holidaysMap, loading };
}