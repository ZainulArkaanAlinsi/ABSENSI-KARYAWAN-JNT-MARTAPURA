'use client';

import { Bell, Search, LogOut, Sun, Moon, Cpu, ChevronRight, Terminal, X } from 'lucide-react';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import { useHeaderLogic } from '@/hooks/useHeaderLogic';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import * as animePkg from 'animejs';
const safeAnimate = (animePkg as any).animate || (animePkg as any).default || animePkg;

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
      safeAnimate(target, {
        scale: 1.02,
        boxShadow: '0 0 20px rgba(124, 58, 237, 0.1)',
        duration: 400,
        easing: 'easeOutElastic(1, .8)'
      });
    } else {
      safeAnimate(target, {
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

    const animation = safeAnimate(target, {
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
      safeAnimate(target, {
        translateX: [0, -3, 3, -3, 3, 0],
        duration: 500,
        easing: 'easeInOutSine',
        loop: 3
      });
    }
  }, [unreadCount]);

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between border-b transition-all duration-500 shadow-xs"
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-header)',
        borderColor: 'var(--border-primary)',
      }}
    >

      {/* ── LEFT: Breadcrumb ── */}
      <div className="flex items-center gap-4 px-6 min-w-0 flex-1 relative z-10">
        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <span className="text-[12px] font-medium tracking-tight">Dashboard</span>
          <ChevronRight size={14} className="opacity-40" />
          <h1 className="text-[14px] font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h1>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 justify-center px-4 max-w-sm mx-auto relative z-10">
        <div
          ref={searchRef}
          className="relative w-full group"
        >
          <Search
            size={14}
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-500 z-10 ${
              searchFocused ? 'text-[#E31E24]' : 'text-gray-400'
            }`}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onChange={e => setSearchValue(e.target.value)}
            className="w-full rounded-2xl py-2.5 pl-10 pr-10 text-[12px] font-bold transition-all focus:outline-none"
            style={{ 
              background: 'var(--bg-input)', 
              color: 'var(--text-primary)',
              border: 'none',
              boxShadow: searchFocused 
                ? 'inset 0 4px 6px rgba(0,0,0,0.1), 0 0 0 2px var(--jne-red)' 
                : 'inset 0 3px 6px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8)'
            }}
          />
          <AnimatePresence>
            {searchValue && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchValue('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors z-10"
              >
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── RIGHT: Action Cluster ── */}
      <div className="flex items-center gap-4 px-6 flex-1 justify-end relative z-10">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ y: 2, boxShadow: '0 0px 0 var(--border-primary), 0 2px 4px rgba(0,0,0,0.1)' }}
          onClick={toggleTheme}
          className="relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 border-none"
          style={{ 
            background: 'var(--bg-card)', 
            color: 'var(--text-muted)',
            boxShadow: '0 4px 0 var(--border-primary), 0 6px 15px rgba(0,0,0,0.05), inset 0 2px 0 rgba(255,255,255,0.6)',
            marginBottom: '4px'
          }}
        >
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}
              >
                <Moon size={18} strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' }}
              >
                <Sun size={18} className="text-orange-500" strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 2, boxShadow: '0 0px 0 var(--border-primary), 0 2px 4px rgba(0,0,0,0.1)' }}
            ref={bellRef}
            onClick={toggleNotifications}
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all border-none"
            style={{ 
              background: 'var(--bg-card)', 
              color: 'var(--text-muted)',
              boxShadow: '0 4px 0 var(--border-primary), 0 6px 15px rgba(0,0,0,0.05), inset 0 2px 0 rgba(255,255,255,0.6)',
              marginBottom: '4px'
            }}
          >
            <Bell size={18} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' }} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#E31E24] shadow-sm border border-white/20" style={{ boxShadow: '0 2px 4px rgba(227,30,36,0.5)' }} />
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
            whileHover={{ y: -2 }}
            whileTap={{ y: 2, boxShadow: '0 0px 0 #b31217, 0 2px 4px rgba(227,30,36,0.3)' }}
            onClick={toggleUserMenu}
            aria-label="User menu"
            className="relative w-10 h-10 rounded-2xl bg-[#E31E24] text-white flex items-center justify-center font-black overflow-hidden shrink-0 border-none transition-all duration-300"
            style={{ 
              boxShadow: '0 4px 0 #b31217, 0 6px 15px rgba(227,30,36,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
              marginBottom: '4px'
            }}
          >
            <span className="text-[14px] relative z-10 leading-none" style={{ textShadow: '0 2px 2px rgba(0,0,0,0.3)' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </motion.button>

          {/* User Menu Dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-full mt-4 w-72 rounded-3xl overflow-hidden border shadow-[0_40px_100px_rgba(0,0,0,0.1)]"
                style={{ 
                  background: 'var(--glass-bg)', 
                  borderColor: 'var(--border-primary)'
                }}
              >
                {/* Profile Header */}
                <div className="px-6 py-7 bg-stone-50/50 border-b border-stone-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#E31E24] flex items-center justify-center text-white font-black text-lg shadow-xl shadow-red-600/30 group-hover:rotate-3 transition-transform">
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