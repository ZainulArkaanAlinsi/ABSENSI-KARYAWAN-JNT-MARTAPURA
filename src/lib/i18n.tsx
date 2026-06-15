'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// i18n admin sederhana (tanpa paket eksternal). Tambah teks cukup di DICT.
// Pakai: const { t } = useT();  →  t('nav_dashboard')
// Bahasa disimpan di localStorage ('admin_lang'), default 'id'.
// ─────────────────────────────────────────────────────────────────────────

export type Lang = 'id' | 'en';

const DICT: Record<Lang, Record<string, string>> = {
  id: {
    // sidebar nav
    nav_dashboard: 'Beranda',
    nav_requests: 'Kotak Masuk',
    nav_attendance: 'Kehadiran',
    nav_leaves: 'Cuti & Izin',
    nav_overtime: 'Lembur',
    nav_employees: 'Karyawan',
    nav_chat: 'Pesan',
    nav_calendar: 'Kalender',
    nav_face: 'Wajah',
    nav_settings: 'Pengaturan',
    menu_main: 'Menu Utama',
    attendance_system: 'Sistem Absensi',
    logout: 'Keluar',
    expand: 'Perluas',
    collapse: 'Ciutkan',
    language: 'Bahasa',
    lang_id: 'Bahasa Indonesia',
    lang_en: 'English',
    // header
    greet_morning: 'Selamat pagi',
    greet_afternoon: 'Selamat siang',
    greet_evening: 'Selamat sore',
    greet_night: 'Selamat malam',
    search_placeholder: 'Cari karyawan, laporan...',
    notifications: 'Notifikasi',
    role_superadmin: 'Super Admin',
    role_admin: 'Administrator',
    // common
    see_all: 'Lihat Semua',
    all: 'Semua',
    people: 'orang',
    days_short: 'hari',
    today: 'Hari ini',
    hours: 'jam',
    present: 'Hadir',
    late: 'Telat',
    absent: 'Absen',
    // dashboard
    dashboard: 'Dashboard',
    live: 'Live',
    dash_subtitle: 'Monitor absensi & kehadiran karyawan JNE Martapura secara real-time',
    dash_sec_today: 'Statistik Hari Ini',
    dash_sec_summary: 'Ringkasan',
    dash_sec_trends: 'Tren & Laporan',
    present_today: 'Hadir Hari Ini',
    people_present_today: 'orang hadir hari ini',
    attendance_rate: 'tingkat kehadiran',
    late_today: 'Telat Hari Ini',
    not_present: 'Tidak Hadir',
    total_employees: 'Total Karyawan',
    leave_queue: 'Antrian Izin',
    requests_awaiting: 'pengajuan menunggu review',
    online_now: 'Online sekarang',
    face_registered: 'Wajah terdaftar',
    overtime_month: 'Lembur bulan ini',
    punctuality: 'Ketepatan waktu',
    weekly_trend: 'Tren Kehadiran Mingguan',
    last_7_days: '7 hari terakhir · realtime',
    approval_queue: 'Antrian Approval',
    leave_awaiting_review: 'Pengajuan izin menunggu review',
    queue_empty: 'Antrian kosong',
  },
  en: {
    nav_dashboard: 'Dashboard',
    nav_requests: 'Inbox',
    nav_attendance: 'Attendance',
    nav_leaves: 'Leave & Permits',
    nav_overtime: 'Overtime',
    nav_employees: 'Employees',
    nav_chat: 'Messages',
    nav_calendar: 'Calendar',
    nav_face: 'Face',
    nav_settings: 'Settings',
    menu_main: 'Main Menu',
    attendance_system: 'Attendance System',
    logout: 'Logout',
    expand: 'Expand',
    collapse: 'Collapse',
    language: 'Language',
    lang_id: 'Bahasa Indonesia',
    lang_en: 'English',
    // header
    greet_morning: 'Good morning',
    greet_afternoon: 'Good afternoon',
    greet_evening: 'Good evening',
    greet_night: 'Good night',
    search_placeholder: 'Search employees, reports...',
    notifications: 'Notifications',
    role_superadmin: 'Super Admin',
    role_admin: 'Administrator',
    // common
    see_all: 'See All',
    all: 'All',
    people: 'people',
    days_short: 'days',
    today: 'Today',
    hours: 'hrs',
    present: 'Present',
    late: 'Late',
    absent: 'Absent',
    // dashboard
    dashboard: 'Dashboard',
    live: 'Live',
    dash_subtitle: 'Monitor JNE Martapura employee attendance in real-time',
    dash_sec_today: "Today's Statistics",
    dash_sec_summary: 'Summary',
    dash_sec_trends: 'Trends & Reports',
    present_today: 'Present Today',
    people_present_today: 'people present today',
    attendance_rate: 'attendance rate',
    late_today: 'Late Today',
    not_present: 'Not Present',
    total_employees: 'Total Employees',
    leave_queue: 'Leave Queue',
    requests_awaiting: 'requests awaiting review',
    online_now: 'Online now',
    face_registered: 'Faces registered',
    overtime_month: 'Overtime this month',
    punctuality: 'Punctuality',
    weekly_trend: 'Weekly Attendance Trend',
    last_7_days: 'Last 7 days · realtime',
    approval_queue: 'Approval Queue',
    leave_awaiting_review: 'Leave requests awaiting review',
    queue_empty: 'Queue empty',
  },
};

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Context = createContext<LangCtx>({ lang: 'id', setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Baca preferensi tersimpan langsung (lazy init) — hindari setState di effect.
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'id';
    return window.localStorage.getItem('admin_lang') === 'en' ? 'en' : 'id';
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== 'undefined') window.localStorage.setItem('admin_lang', l);
  }, []);

  const t = useCallback((key: string) => DICT[lang][key] ?? DICT.id[key] ?? key, [lang]);

  return <Context.Provider value={{ lang, setLang, t }}>{children}</Context.Provider>;
}

export const useT = () => useContext(Context);
