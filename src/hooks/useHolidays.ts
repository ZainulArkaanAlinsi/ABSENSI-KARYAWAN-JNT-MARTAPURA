// hooks/useHolidays.ts
import { useState, useEffect } from 'react';

export function useHolidays(year: number) {
  const [holidaysMap, setHolidaysMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://libur.deno.dev/api?year=${year}`);
        if (!response.ok) throw new Error('Gagal mengambil data libur');
        const data = await response.json(); // data: [{ date, name }]
        const map: Record<string, string[]> = {};
        data.forEach((item: { date: string; name: string }) => {
          if (!map[item.date]) map[item.date] = [];
          map[item.date].push(item.name);
        });
        setHolidaysMap(map);
      } catch (error) {
        console.error('Error fetching holidays:', error);
        setHolidaysMap({});
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [year]);

  return { holidaysMap, loading };
}