'use client';

import { useState, useMemo, useEffect } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { useCalendarManagement } from '@/hooks/useCalendarManagement';
import { getEmployees } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, query, where } from 'firebase/firestore';
import { listen } from '@/lib/firestoreListener';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import EventListPanel from '@/components/calendar/EventListPanel';
import EventModal, { type EventFormData } from '@/components/calendar/EventModal';
import { getMonthWeeks } from '@/utils/calendarHelpers';
import { scheduleMeetingNotifications } from '@/lib/firestore';
import type { CalendarEvent, Employee } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/context/ConfirmContext';

export default function CalendarPage() {
  const { events, loading, addEvent, updateEvent, deleteEvent } = useCalendarManagement();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth() + 1);
  const [selectedDateStr, setSelectedDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const router = useRouter();
  const { confirm } = useConfirm();

  // State untuk data libur dari API
  const [holidaysMap, setHolidaysMap] = useState<Record<string, string[]>>({});
  const [loadingHolidays, setLoadingHolidays] = useState(false);

  // Libur nasional Indonesia. Data asli dari Nager.Date (date.nager.at, CORS *,
  // jalan di static export) untuk tahun yang sedang dilihat — mencakup libur
  // Gregorian + Kristen yang dihitung (Wafat Isa, Paskah, Kenaikan). Kalau API
  // gagal, fallback ke 5 tanggal-tetap yang pasti benar. Catatan: libur Hijriah
  // (Idul Fitri/Adha, Maulid) & Saka/Imlek belum tersedia dari API gratis yang
  // andal → admin tambah manual sebagai acara, atau di-hardcode bila tanggal
  // resmi sudah dikonfirmasi (hindari tanggal salah karena dipakai isWorkday).
  useEffect(() => {
    let alive = true;
    const fixed: Record<string, string[]> = {
      [`${currentYear}-01-01`]: ['Tahun Baru Masehi'],
      [`${currentYear}-05-01`]: ['Hari Buruh Internasional'],
      [`${currentYear}-06-01`]: ['Hari Lahir Pancasila'],
      [`${currentYear}-08-17`]: ['Hari Kemerdekaan Republik Indonesia'],
      [`${currentYear}-12-25`]: ['Hari Raya Natal'],
    };
    // Tampilkan fallback dulu supaya kalender tak terblokir menunggu jaringan.
    setHolidaysMap(fixed);
    setLoadingHolidays(false);
    (async () => {
      try {
        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/ID`);
        if (!res.ok) throw new Error(String(res.status));
        const arr: { date: string; localName?: string; name?: string }[] = await res.json();
        const map: Record<string, string[]> = {};
        for (const h of arr) {
          if (!h.date) continue;
          const label = h.localName || h.name || 'Libur Nasional';
          (map[h.date] ??= []).push(label);
        }
        // Pastikan 5 tanggal-tetap selalu ada walau API tak mengembalikannya.
        for (const [d, names] of Object.entries(fixed)) {
          if (!map[d]) map[d] = names;
        }
        if (alive && Object.keys(map).length > 0) setHolidaysMap(map);
      } catch {
        // Diam — fallback sudah terpasang.
      }
    })();
    return () => {
      alive = false;
    };
  }, [currentYear]);

  // State for attendance heatmap
  const [attendanceHeatmap, setAttendanceHeatmap] = useState<Record<string, number>>({});
  const [totalEmployeesCount, setTotalEmployeesCount] = useState(0);

  // Daftar karyawan (sekali) untuk penyebut rasio heatmap.
  useEffect(() => {
    getEmployees().then((list) => {
      setEmployees(list);
      setTotalEmployeesCount(list.length);
    });
  }, []);

  // Heatmap presensi: di-bound ke tahun yang sedang dilihat (akurat + tak
  // memuat seluruh koleksi absensi). Hitung HANYA kehadiran nyata
  // (hadir/telat/lembur) — jangan ikutkan 'leave'/'absent' biar rasio benar.
  useEffect(() => {
    const lo = `${currentYear}-01-01`;
    const hi = `${currentYear}-12-31`;
    const attQuery = query(
      collection(db, 'attendance'),
      where('date', '>=', lo),
      where('date', '<=', hi),
    );
    const unsub = listen(attQuery, (snap) => {
      const map: Record<string, number> = {};
      snap.docs.forEach((doc) => {
        const data = doc.data();
        if (!['present', 'late', 'overtime'].includes(data.status)) return;
        const date = data.date;
        if (date) map[date] = (map[date] || 0) + 1;
      });
      setAttendanceHeatmap(map);
    });
    return () => unsub();
  }, [currentYear]);

  // Generate weeks for active month
  const monthWeeks = useMemo(() => {
    return getMonthWeeks(currentYear, currentMonthIndex);
  }, [currentYear, currentMonthIndex]);

  // Filter events dari Firestore
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filterCategory !== 'all' && event.category !== filterCategory) return false;
      if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      return true;
    });
  }, [events, filterCategory, searchQuery]);

  // Dapatkan detail hari yang dipilih
  const selectedDayDetails = useMemo(() => {
    for (const week of monthWeeks) {
      const day = week.find((d) => d?.date === selectedDateStr);
      if (day) {
        const userEvts = filteredEvents.filter(
          (event) => event.startDate && isSameDay(parseISO(event.startDate), parseISO(day.date)),
        );
        const sysEvents = holidaysMap[day.date] || [];
        const uiCategory = sysEvents.length > 0 ? 'holiday' : 'normal';
        const uiColorHint =
          sysEvents.length > 0
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

  const handleSaveEvent = async (formData: EventFormData) => {
    try {
      const eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        category: formData.category as CalendarEvent['category'],
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
    const isConfirmed = await confirm({
      title: 'Hapus Acara',
      message: 'Yakin ingin menghapus acara ini? Tindakan ini tidak dapat dibatalkan.',
      variant: 'danger',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
    });

    if (isConfirmed) {
      try {
        await deleteEvent(eventId);
        toast.success('Acara berhasil dihapus');
      } catch {
        toast.error('Gagal menghapus acara');
      }
    }
  };

  const handleQuickAction = (type: 'notif' | 'chat' | 'global' | 'maps') => {
    const dateLabel = selectedDayDetails ? format(parseISO(selectedDayDetails.date), 'dd MMM') : '';

    switch (type) {
      case 'notif':
        toast.info(`Membuka panel broadcast untuk ${dateLabel}`);
        router.push(`/broadcast?date=${selectedDateStr}`);
        break;
      case 'chat':
        toast.info(`Membuka chat grup agenda ${dateLabel}`);
        router.push(`/chat?ref=${selectedDateStr}`);
        break;
      case 'global':
        toast.info(`Menampilkan ringkasan kehadiran ${dateLabel}`);
        router.push('/analytics');
        break;
      case 'maps':
        toast.info(`Melacak lokasi personel untuk ${dateLabel}`);
        router.push('/attendance/live');
        break;
    }
  };

  if (loading || loadingHolidays)
    return (
      <div className="h-full flex items-center justify-center">
        <PageLoader />
      </div>
    );

  return (
    <>
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
          attendanceHeatmap={attendanceHeatmap}
          totalEmployees={totalEmployeesCount}
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
          onQuickAction={handleQuickAction}
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
    </>
  );
}
