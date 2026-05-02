'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Mapping judul berdasarkan pathname secara komprehensif (Attendance Focused)
  const getPageInfo = () => {
    const path = pathname.split('/').filter(Boolean).pop() || 'dashboard';
    
    switch (path) {
      case 'dashboard': return { title: 'Dashboard', sub: 'Monitoring Utama' };
      case 'employees': return { title: 'Karyawan', sub: 'Manajemen Personel' };
      case 'departments': return { title: 'Departemen', sub: 'Struktur Organisasi' };
      case 'leaves': return { title: 'Izin & Cuti', sub: 'Otorisasi Kehadiran' };
      case 'requests': return { title: 'Koreksi', sub: 'Pengajuan Perubahan' };
      case 'reports': return { title: 'Laporan', sub: 'Rekapitulasi Data' };
      case 'calendar': return { title: 'Kalender', sub: 'Agenda & Jadwal' };
      case 'head-units': return { title: 'Kepala Unit', sub: 'Manajemen Pimpinan' };
      case 'jam-kerja': return { title: 'Jam Kerja', sub: 'Pengaturan Waktu' };
      case 'shifts': return { title: 'Shift Kerja', sub: 'Penjadwalan Regu' };
      case 'settings': return { title: 'Pengaturan', sub: 'Konfigurasi Sistem' };
      case 'face-enrollment': return { title: 'Biometrik', sub: 'Pendaftaran Wajah' };
      default: return { title: path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' '), sub: 'Panel Admin' };
    }
  };

  const { title, sub } = getPageInfo();

  return (
    <div className="h-screen flex bg-(--bg-main) transition-colors duration-300 overflow-hidden font-sans">
      {/* SIDEBAR DRAWER */}
      <aside 
        className={`fixed inset-y-0 left-0 z-60 w-[260px] transition-transform duration-300 transform 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 border-r border-(--border-primary)`}
      >
        <Sidebar />
      </aside>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 md:hidden cursor-pointer"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col md:pl-[260px] min-w-0 h-full overflow-hidden">
        {/* Header - Fixed & Solid */}
        <div className="sticky top-0 z-50 shadow-sm">
          <Header 
            title={title} 
            subtitle={sub} 
            onMenuClick={() => setIsSidebarOpen(true)} 
          />
        </div>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-12 md:pt-14 relative z-10 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
