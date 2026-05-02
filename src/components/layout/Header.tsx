'use client';

import { Bell, Search, LogOut, Sun, Moon, Cpu, ChevronRight, Terminal, X, Menu } from 'lucide-react';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import { useHeaderLogic } from '@/hooks/useHeaderLogic';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import * as animePkg from 'animejs';
const safeAnimate = (animePkg as any).animate || (animePkg as any).default || animePkg;

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export default function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const {
    user,
    unreadCount,
    showNotifications,
    setShowNotifications,
    showUserMenu,
    notifRef,
    userRef,
    toggleNotifications,
    toggleUserMenu,
    signOut,
    theme,
    toggleTheme
  } = useHeaderLogic();

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between border-b transition-all duration-500"
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-header)',
        borderColor: 'var(--border-primary)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* ── LEFT: Mobile Menu & Title ── */}
      <div className="flex items-center gap-3 px-4 md:px-6 min-w-0 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/20 active:scale-95 transition-all"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-2 overflow-hidden">
          <h1 className="text-[14px] md:text-[16px] font-black uppercase tracking-tight text-(--text-primary) truncate italic">
            {title}
          </h1>
          <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest text-(--text-dim)">· System</span>
        </div>
      </div>

      {/* ── RIGHT: Actions ── */}
      <div className="flex items-center gap-2 md:gap-4 px-4 md:px-6 shrink-0">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all hover:bg-(--bg-input) text-(--text-dim)"
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} className="text-orange-500" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotifications}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all hover:bg-(--bg-input) text-(--text-dim) relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600 border-2 border-(--bg-header)" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-full mt-2"
              >
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={userRef}>
          <button
            onClick={toggleUserMenu}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-red-600/20"
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden border border-(--border-primary) shadow-2xl"
                style={{ background: 'var(--bg-card)' }}
              >
                <div className="p-4 border-b border-(--border-primary)">
                  <p className="text-[11px] font-black text-(--text-primary) uppercase truncate italic">{user?.name || 'Admin'}</p>
                  <p className="text-[9px] text-(--text-dim) font-bold truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={signOut}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black text-(--text-secondary) hover:text-red-600 hover:bg-red-50 transition-all flex items-center gap-3 uppercase"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}