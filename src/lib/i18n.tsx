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
