'use client';

import { Bell, Search, LogOut, Sun, Moon, Cpu, ChevronRight, Terminal, X } from 'lucide-react';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import { useHeaderLogic } from '@/hooks/useHeaderLogic';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { animate } from 'animejs';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
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
  const cpuRef = useRef<HTMLDivElement>(null);

  // Search Bar Focus Animation
  useEffect(() => {
    const target = searchRef.current;
    if (!target) return;

    if (searchFocused) {
      animate(target, {
        scale: 1.02,
        boxShadow: '0 0 20px rgba(124, 58, 237, 0.1)',
        duration: 400,
        easing: 'easeOutElastic(1, .8)'
      });
    } else {
      animate(target, {
        scale: 1,
        boxShadow: '0 0 0px rgba(124, 58, 237, 0)',
        duration: 300,
        easing: 'easeOutQuad'
      });
    }
  }, [searchFocused]);

  // Periodic CPU Icon Rotation/Pulse
  useEffect(() => {
    const target = cpuRef.current;
    if (!target) return;

    const animation = animate(target, {
      rotate: '+=15',
      duration: 3000,
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutQuad'
    });
    return () => {
      animation.pause();
    };
  }, []);

  // Bell Shake when unreadCount changes
  useEffect(() => {
    const target = bellRef.current;
    if (target && unreadCount > 0) {
      animate(target, {
        translateX: [0, -3, 3, -3, 3, 0],
        duration: 500,
        easing: 'easeInOutSine',
        loop: 3
      });
    }
  }, [unreadCount]);

  return (
    <header
      className="fixed top-0 right-0 z-40 flex items-center justify-between border-b transition-all duration-500 backdrop-blur-3xl"
      style={{
        left: 'var(--sidebar-width)',
        height: 'var(--header-height)',
        background: 'var(--glass-bg, rgba(255, 255, 255, 0.8))',
        borderColor: 'var(--glass-border, rgba(0, 0, 0, 0.05))',
      }}
    >
      {/* ── Ambient Glow Background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[150%] -right-[20%] w-[600px] h-[600px] rounded-full blur-[120px]" 
          style={{ background: 'radial-gradient(circle, rgba(227, 30, 36, 0.08) 0%, transparent 70%)' }} />
      </div>

      {/* ── LEFT: Page Title Block ── */}
      <div className="flex items-center gap-5 px-8 min-w-0 flex-1 relative z-10">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          ref={cpuRef}
          className="relative shrink-0 w-11 h-11 rounded-2xl bg-white border border-stone-100 flex items-center justify-center shadow-xl shadow-red-500/5 group"
        >
          <Cpu size={20} className="text-red-600 group-hover:animate-pulse" />
          <div className="absolute inset-0 rounded-2xl bg-red-600/5 transition-opacity opacity-0 group-hover:opacity-100" />
        </motion.div>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em] opacity-60">Control Center</span>
            <div className="w-1.5 h-1.5 rounded-full bg-red-600/20" />
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50/50 border border-red-100/50">
               <span className="text-[9px] font-black text-red-600 uppercase tracking-widest leading-none">JNE Cloud</span>
            </div>
          </div>
          <h1 className="text-[18px] font-black text-gray-900 tracking-tighter uppercase leading-none truncate italic">
            {title}
          </h1>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 justify-center px-4 max-w-xl mx-auto relative z-10">
        <div
          ref={searchRef}
          className="relative w-full group"
        >
          <Search
            size={14}
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-500 ${
              searchFocused ? 'text-red-600' : 'text-gray-400'
            }`}
          />
          <input
            type="text"
            placeholder="Cari data, laporan..."
            value={searchValue}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onChange={e => setSearchValue(e.target.value)}
            className="w-full bg-white/40 border border-stone-100/50 rounded-2xl py-3 pl-10 pr-10 text-[13px] font-bold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-red-600/30 focus:bg-white focus:ring-8 focus:ring-red-600/5 transition-all duration-500 shadow-sm group-hover:border-stone-200"
          />
          <AnimatePresence>
            {searchValue && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchValue('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors"
              >
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── RIGHT: Action Cluster ── */}
      <div className="flex items-center gap-5 px-8 flex-1 justify-end relative z-10">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="relative w-10 h-10 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-gray-500 hover:text-red-600 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-500"
        >
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Moon size={16} strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Sun size={16} className="text-orange-500" strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            ref={bellRef}
            onClick={toggleNotifications}
            className={`relative w-10 h-10 rounded-2xl border flex items-center justify-center transition-all duration-500 shadow-sm ${
              showNotifications
                ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-200'
                : 'bg-white border-stone-100 text-gray-400 hover:text-red-600 hover:shadow-xl hover:shadow-red-500/5'
            }`}
          >
            <Bell size={16} strokeWidth={2.5} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border-2 border-white shadow-sm" />
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-full mt-4"
              >
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative" ref={userRef}>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleUserMenu}
            className="flex items-center gap-4 py-2 px-4 rounded-[1.25rem] bg-white border border-stone-100 hover:border-red-100/50 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 shadow-sm group"
          >
            {/* Text info */}
            <div className="hidden lg:flex flex-col items-end">
              <p className="text-[13px] font-black text-gray-900 leading-none uppercase tracking-tighter group-hover:text-red-600 transition-colors">
                {user?.name || 'CENTRAL'}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
                  {user?.role || 'SYSTEM'}
                </p>
              </div>
            </div>

            {/* Avatar */}
            <div className="relative w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-xl shadow-red-600/30 overflow-hidden shrink-0 group-hover:rotate-6 transition-transform">
              <span className="text-[13px] relative z-10 leading-none">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
              <div className="absolute inset-0 bg-linear-to-tr from-black/20 to-transparent" />
            </div>
          </motion.button>

          {/* User Menu Dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-full mt-4 w-72 bg-white/90 backdrop-blur-3xl rounded-3xl overflow-hidden border border-stone-100 shadow-[0_40px_100px_rgba(0,0,0,0.1)]"
              >
                {/* Profile Header */}
                <div className="px-6 py-7 bg-stone-50/50 border-b border-stone-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-red-600/30 group-hover:rotate-3 transition-transform">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-black text-gray-900 uppercase tracking-tight truncate italic">
                        {user?.name || 'CENTRAL ADMIN'}
                      </p>
                      <p className="text-[11px] text-gray-500 font-bold truncate mt-1">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Status List */}
                <div className="px-6 py-4 flex flex-col gap-3 border-b border-stone-50 bg-white/50">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm" />
                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest leading-none">Status</span>
                     </div>
                     <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-full">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">System Role</span>
                     <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{user?.role?.toUpperCase()}</span>
                  </div>
                </div>

                {/* Sign Out */}
                <div className="p-3">
                  <button
                    onClick={signOut}
                    className="w-full text-left px-5 py-4 rounded-2xl text-[12px] text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all font-black uppercase tracking-widest flex items-center gap-4 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-stone-50 flex items-center justify-center group-hover:bg-red-100 group-hover:text-red-600 transition-colors border border-stone-100">
                      <LogOut size={16} />
                    </div>
                    LOGOUT SYSTEM
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