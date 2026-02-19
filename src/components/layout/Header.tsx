'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center justify-between px-8"
      style={{
        left: 'var(--sidebar-width)',
        height: 'var(--header-height)',
        background: 'rgba(10, 10, 11, 0.8)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Left: Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search here..." 
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 focus:bg-zinc-900/80 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <div className="relative group" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className={`relative flex items-center justify-center rounded-xl p-2.5 transition-all ${showNotifications ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 flex items-center justify-center text-white text-[10px] font-bold rounded-full w-4 h-4"
                style={{ background: '#E31E24' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2">
              <NotificationPanel onClose={() => setShowNotifications(false)} />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center gap-3 py-1.5 px-2 rounded-2xl hover:bg-zinc-900 transition-all text-left"
          >
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-zinc-100 leading-tight">{user?.name || 'John Doe'}</p>
              <p className="text-[11px] text-zinc-500">{user?.email || 'admin@jnemtp.com'}</p>
            </div>
            <div
              className="relative w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden"
            >
              <div className="w-full h-full flex items-center justify-center text-zinc-300 font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'J'}
              </div>
            </div>
            <ChevronDown size={14} className={`text-zinc-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 top-full mt-2 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-50 overflow-hidden w-48"
            >
              <button
                onClick={signOut}
                className="w-full text-left px-5 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium flex items-center gap-2"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
