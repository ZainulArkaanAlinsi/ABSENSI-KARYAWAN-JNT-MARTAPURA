'use client';

import { useState, useMemo, useEffect } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import AdminLayout from '@/components/layout/AdminLayout';
import { useCalendarManagement } from '@/hooks/useCalendarManagement';
import { getEmployees } from '@/lib/firestore';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import EventListPanel from '@/components/calendar/EventListPanel';
import EventModal from '@/components/calendar/EventModal';
import { getMonthWeeks } from '@/utils/calendarHelpers';
import { scheduleMeetingNotifications } from '@/lib/firestore';
import type { CalendarEvent } from '@/types';

export default function CalendarPage() {
  const { events, loading, addEvent, updateEvent, deleteEvent } = useCalendarManagement();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth() + 1);
  const [selectedDateStr, setSelectedDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);

  // State untuk data libur dari API
  const [holidaysMap, setHolidaysMap] = useState<Record<string, string[]>>({});
  const [loadingHolidays, setLoadingHolidays] = useState(false);

  // Fetch libur nasional dari API
  useEffect(() => {
    const fetchHolidays = async () => {
      setLoadingHolidays(true);
      try {
        const response = await fetch(`https://libur.deno.dev/api?year=${currentYear}`);
        if (!response.ok) throw new Error('Gagal mengambil data libur');
        const data = await response.json();
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
        setLoadingHolidays(false);
      }
    };

    fetchHolidays();
  }, [currentYear]);

  // Fetch employees
  useEffect(() => {
    getEmployees().then(setEmployees);
  }, []);

  // Generate minggu untuk bulan aktif
  const monthWeeks = useMemo(() => {
    return getMonthWeeks(currentYear, currentMonthIndex);
  }, [currentYear, currentMonthIndex]);

  // Filter events dari Firestore
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filterCategory !== 'all' && event.category !== filterCategory) return false;
      if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [events, filterCategory, searchQuery]);

  // Dapatkan detail hari yang dipilih
  const selectedDayDetails = useMemo(() => {
    for (const week of monthWeeks) {
      const day = week.find((d) => d?.date === selectedDateStr);
      if (day) {
        const userEvts = filteredEvents.filter((event) =>
          event.startDate && isSameDay(parseISO(event.startDate), parseISO(day.date))
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
      }
    }
    return null;
  }, [monthWeeks, selectedDateStr, holidaysMap, filteredEvents]);

  // Handler
  const handlePrevMonth = () => {
    if (currentMonthIndex === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonthIndex(12);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonthIndex(1);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonthIndex(today.getMonth() + 1);
    setSelectedDateStr(format(today, 'yyyy-MM-dd'));
  };

  const handleSaveEvent = async (formData: any) => {
    try {
      const eventData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        organizerId: 'admin',
        attendees: formData.attendees || [],
        departments: formData.departments || [],
      };
      let savedId: string | undefined;
      if (editingEvent?.id) {
        await updateEvent(editingEvent.id, eventData);
        savedId = editingEvent.id;
      } else {
        savedId = await addEvent(eventData);
      }
      // Auto-schedule meeting notifications
      if (
        eventData.category === 'meeting' &&
        Array.isArray(eventData.departments) &&
        eventData.departments.length > 0 &&
        savedId
      ) {
        await scheduleMeetingNotifications(
          savedId,
          eventData.title,
          eventData.startDate,
          eventData.departments,
          eventData.attendees,
        );
      }
      setModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Gagal menyimpan event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Yakin ingin menghapus acara ini?')) {
      await deleteEvent(eventId);
    }
  };

  if (loading || loadingHolidays) return <AdminLayout title="Kalender"><PageLoader /></AdminLayout>;

  return (
    <AdminLayout title="Kalender" subtitle="Libur nasional & acara internal">
      <div className="flex flex-col lg:flex-row gap-3 h-full pb-3">
        <CalendarGrid
          currentYear={currentYear}
          currentMonthIndex={currentMonthIndex}
          monthWeeks={monthWeeks}
          holidaysMap={holidaysMap}
          filteredEvents={filteredEvents}
          selectedDateStr={selectedDateStr}
          onSelectDate={setSelectedDateStr}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          onAddEvent={() => {
            setEditingEvent(null);
            setModalOpen(true);
          }}
        />

        <EventListPanel
          selectedDayDetails={selectedDayDetails}
          searchQuery={searchQuery}
          filterCategory={filterCategory}
          onSearchChange={setSearchQuery}
          onFilterChange={setFilterCategory}
          onEditEvent={(event) => {
            setEditingEvent(event);
            setModalOpen(true);
          }}
          onDeleteEvent={handleDeleteEvent}
        />
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        initialData={editingEvent}
        selectedDate={selectedDateStr}
        employees={employees}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </AdminLayout>
  );
}