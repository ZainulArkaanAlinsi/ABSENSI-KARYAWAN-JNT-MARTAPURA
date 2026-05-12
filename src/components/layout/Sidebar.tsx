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
  Inbox
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
  { id: 'requests', label: 'Inbox', icon: Inbox, path: '/requests' },
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
  const { unreadCount } = useNotifications();

  return (
    <div className="w-full h-full flex flex-col bg-primary border-r border-white/5 overflow-hidden">
      
      {/* ── BRANDING SECTOR ── */}
      <div className="p-8 lg:p-10 pb-12">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_15px_30px_-10px_rgba(79,70,229,0.5)] shrink-0">
            <span className="text-white font-black italic text-2xl select-none">J</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white font-black text-base uppercase tracking-tighter truncate leading-none">Martapura</span>
            <span className="text-slate-500 font-bold text-[8px] uppercase tracking-[0.4em] mt-2 leading-none opacity-60">Tactical Hub</span>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION SECTOR ── */}
      <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="px-5 mb-8">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-700">Command Control</p>
        </div>
        
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-500 group relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)]'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/3'
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <item.icon 
                  size={18} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-200 transition-colors'} 
                />
                <span className={`text-[11px] font-black tracking-tight uppercase ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                  {item.label}
                </span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── OPERATIONAL FOOTER ── */}
      <div className="p-6 mt-auto border-t border-white/5 space-y-1">
        <button className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-slate-500 hover:text-slate-200 hover:bg-white/3 transition-all group">
          <div className="flex items-center gap-4">
            <Bell size={18} strokeWidth={2} />
            <span className="text-[11px] font-black uppercase tracking-tight">Telemetry</span>
          </div>
          {unreadCount > 0 && (
            <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-cyan-400 text-primary text-[9px] font-black flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/10 transition-all group"
        >
          <LogOut size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-tight italic">Terminate Session</span>
        </button>
      </div>
    </div>
  );
}