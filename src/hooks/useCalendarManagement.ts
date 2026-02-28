// hooks/useCalendarManagement.ts
import { useState, useEffect } from 'react';
import { subscribeToEvents, addEvent, updateEvent, deleteEvent } from '@/lib/firestore';
import type { CalendarEvent } from '@/types';

export function useCalendarManagement() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    return unsub;
  }, []);



  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}