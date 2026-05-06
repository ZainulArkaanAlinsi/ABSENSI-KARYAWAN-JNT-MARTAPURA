'use client';

import React from 'react';
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

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutGrid, path: '/dashboard' },
  { id: 'attendance', label: 'Attendance', icon: Clock, path: '/attendance' },
  { id: 'employees', label: 'Personnel', icon: Users, path: '/employees' },
  { id: 'chat', label: 'Messages', icon: MessageSquare, path: '/chat' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
  { id: 'face-enrollment', label: 'Face Scan', icon: ScanFace, path: '/face-enrollment' },
  { id: 'settings', label: 'System', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="w-[84px] h-screen bg-slate-950 flex flex-col items-center py-10 border-r border-white/5 relative z-50 transition-colors duration-500">
      {/* LOGO */}
      <div className="mb-12">
        <div className="w-12 h-12 bg-rose-600 dark:bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-600/30 dark:shadow-rose-500/20 transform -rotate-12 transition-all duration-500">
          <span className="text-white font-black italic text-xl tracking-tighter">J</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 w-full flex flex-col items-center gap-6">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <div key={item.id} className="relative group">
              <Link
                href={item.path}
                className={`nav-link-premium ${isActive ? 'active' : ''}`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </Link>

              {/* TOOLTIP */}
              <div className="absolute left-[calc(100%+15px)] top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap shadow-2xl border border-white/10 z-50">
                {item.label}
                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-white/10 rotate-45" />
              </div>

              {/* ACTIVE INDICATOR */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-rose-600 dark:bg-rose-500 rounded-r-full"
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="pt-8 border-t border-white/5 w-full flex flex-col items-center gap-6">
        <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all group relative">
          <Bell size={20} />
          <div className="absolute top-3.5 right-3.5 w-2 h-2 bg-rose-600 dark:bg-rose-500 rounded-full border-2 border-slate-950" />
        </button>
        <button
          onClick={() => signOut()}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-600/10 transition-all group"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}