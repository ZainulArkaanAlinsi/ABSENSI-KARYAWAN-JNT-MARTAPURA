'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Clock,
  ScanFace,
  Inbox,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import NotificationPanel from './NotificationPanel';
import ThemeToggle from '../ui/ThemeToggle';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
  { id: 'requests', label: 'Inbox', icon: Inbox, path: '/requests' },
  { id: 'attendance', label: 'Absensi', icon: Clock, path: '/attendance' },
  { id: 'employees', label: 'Personel', icon: Users, path: '/employees' },
  { id: 'chat', label: 'Pesan', icon: MessageSquare, path: '/chat' },
  { id: 'calendar', label: 'Kalender', icon: Calendar, path: '/calendar' },
  { id: 'face-enrollment', label: 'Scan Wajah', icon: ScanFace, path: '/face-enrollment' },
  { id: 'settings', label: 'Sistem', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <aside className="w-[240px] h-screen bg-(--sidebar-bg) flex flex-col py-6 border-r border-black/5 relative z-50 transition-all duration-500 overflow-hidden">
        {/* LOGO AREA */}
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center shadow-2xl shadow-black/20 transition-all duration-500 group-hover:rotate-6">
              <span className="text-white font-black italic text-lg tracking-tighter">J</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-sm tracking-tighter uppercase italic leading-none">Martapura</span>
              <span className="text-cyan-600 font-bold text-[8px] uppercase tracking-[0.2em] mt-1">Control Tower</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
          <div className="px-4 mb-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 opacity-40">Main Systems</p>
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon 
                  size={18} 
                  strokeWidth={isActive ? 3 : 2} 
                  className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} 
                />
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'italic' : ''}`}>
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-rect"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-l-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="mt-auto px-4 pt-6 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
             <div className="flex items-center gap-3">
                <ThemeToggle />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Appearance</span>
             </div>
          </div>

          <button 
            onClick={() => setShowNotifications(true)}
            className={`w-full flex items-center justify-between px-5 py-3 rounded-xl transition-all group relative ${
              showNotifications ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Notifikasi</span>
            </div>
            {unreadCount > 0 && (
              <div className="w-4 h-4 bg-orange-600 rounded-md flex items-center justify-center">
                <span className="text-[8px] font-black text-white">{unreadCount}</span>
              </div>
            )}
          </button>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all font-black uppercase tracking-widest text-[10px]"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
}