'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  FileText, 
  BarChart3, 
  ClipboardCheck,
  Settings,
  Calendar,
  UserSquare,
  Clock,
  PieChart,
  Repeat,
  LogOut,
  ScanFace,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

const menuGroups = [
  {
    title: 'Utama',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: PieChart, label: 'Laporan Absensi', href: '/reports' },
      { icon: Calendar, label: 'Kalender Kerja', href: '/calendar' },
    ]
  },
  {
    title: 'Personel',
    items: [
      { icon: Users, label: 'Daftar Karyawan', href: '/employees' },
      { icon: UserSquare, label: 'Kepala Unit', href: '/head-units' },
      { icon: Layers, label: 'Unit & Departemen', href: '/departments' },
    ]
  },
  {
    title: 'Sistem Absensi',
    items: [
      { icon: ScanFace, label: 'Wajah (Biometrik)', href: '/face-enrollment' },
      { icon: ClipboardCheck, label: 'Izin & Cuti', href: '/leaves' },
      { icon: FileText, label: 'Koreksi Absen', href: '/attendance/requests' },
      { icon: Clock, label: 'Jam Operasional', href: '/jam-kerja' },
      { icon: Repeat, label: 'Penjadwalan Shift', href: '/shifts' },
      { icon: MapPin, label: 'Geofencing', href: '/settings' },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <div className="flex h-screen flex-col bg-(--bg-sidebar) text-slate-400 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-red-600/10 to-transparent pointer-events-none" />

      {/* ── FIXED TOP: BRAND ── */}
      <div className="pt-8 pb-6 px-8 relative z-10 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-[#E31E24] flex items-center justify-center shadow-lg shadow-red-600/20 group cursor-pointer overflow-hidden shrink-0">
            <img src="/logo-jne.svg" alt="JNE" className="w-7 h-7 brightness-0 invert group-hover:scale-110 transition-transform" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-[#E31E24] uppercase tracking-[0.3em] leading-none mb-1">Martapura</p>
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none truncate">Attendance</h2>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE MIDDLE: MENU ── */}
      <div className="flex-1 py-8 px-6 space-y-8 relative z-10 overflow-y-auto custom-scrollbar">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{group.title}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all relative overflow-hidden ${
                      isActive 
                        ? 'bg-[#E31E24] text-white shadow-xl shadow-red-600/20' 
                        : 'hover:bg-white/5 hover:text-white text-slate-400'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute inset-0 bg-linear-to-r from-white/10 to-transparent pointer-events-none"
                      />
                    )}
                    <item.icon size={18} strokeWidth={isActive ? 3 : 2} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
                    <span className="relative z-10 tracking-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── FIXED BOTTOM: FOOTER ── */}
      <div className="p-6 pt-4 border-t border-white/5 relative z-10 bg-(--bg-sidebar)">
        <Link 
          href="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold mb-2 transition-all ${
            pathname === '/settings' ? 'bg-white/10 text-white shadow-md' : 'hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings size={18} />
          <span>Konfigurasi Sistem</span>
        </Link>
        
        <button 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
          onClick={() => signOut()}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>

        <div className="mt-4 p-4 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Attendance Mode</p>
          </div>
          <div className="h-5 w-px bg-white/5" />
          <p className="text-[10px] font-black text-[#E31E24] uppercase tracking-widest">v4.2</p>
        </div>
      </div>
    </div>
  );
}
