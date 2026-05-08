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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import NotificationPanel from './NotificationPanel';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
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
      <aside className="w-[72px] h-screen bg-(--sidebar-bg) flex flex-col items-center py-6 border-r border-black/5 relative z-50 transition-colors duration-500">
        {/* LOGO */}
        <div className="mb-8">
          <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg shadow-black/10 transition-all duration-500">
            <span className="text-white font-black italic text-lg tracking-tighter">J</span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 w-full flex flex-col items-center gap-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <div key={item.id} className="relative group">
                <Link
                  href={item.path}
                  className={`nav-link-premium ${isActive ? 'active' : ''}`}
                >
                  <item.icon 
                    size={20} 
                    strokeWidth={isActive ? 3 : 2} 
                    className={isActive ? 'text-(--sidebar-bg) dark:text-slate-950' : 'text-(--sidebar-text)/60'} 
                  />
                </Link>

                {/* TOOLTIP */}
                <div className="absolute left-[calc(100%+15px)] top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap shadow-2xl z-50">
                  {item.label}
                  <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-50 rotate-45" />
                </div>

                {/* ACTIVE INDICATOR */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-(--sidebar-text) rounded-r-full"
                  />
                )}
              </div>
            );
          })}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="pt-6 border-t border-black/10 w-full flex flex-col items-center gap-4">
          <button 
            onClick={() => setShowNotifications(true)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all group relative ${
              showNotifications ? 'bg-white text-(--sidebar-bg)' : 'text-(--sidebar-text)/60 hover:text-(--sidebar-text) hover:bg-black/5'
            }`}
          >
            < Bell size={18} />
            {unreadCount > 0 && (
              <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-orange-600 rounded-full border-2 border-(--sidebar-bg) flex items-center justify-center overflow-hidden">
                <span className="text-[8px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
              </div>
            )}
          </button>
          <button
            onClick={() => signOut()}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-(--sidebar-text)/60 hover:text-(--sidebar-text) hover:bg-black/5 transition-all group"
          >
            <LogOut size={18} />
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