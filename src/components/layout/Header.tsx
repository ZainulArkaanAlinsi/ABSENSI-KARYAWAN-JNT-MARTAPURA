'use client';

import { Bell, Search, LogOut, Sun, Moon, Cpu, ChevronRight, Terminal, X } from 'lucide-react';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import { useHeaderLogic } from '@/hooks/useHeaderLogic';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

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

  return (
    <header
      className="fixed top-0 right-0 z-40 flex items-center justify-between border-b border-white/4"
      style={{
        left: 'var(--sidebar-width)',
        height: 'var(--header-height)',
        background: 'var(--bg-header)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      }}
    >
      {/* Ambient glow line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-jne-red/30 to-transparent pointer-events-none" />

      {/* ── LEFT: Page Title Block ── */}
      <div className="flex items-center gap-5 px-8 min-w-0 flex-1">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="relative shrink-0 w-11 h-11 rounded-2xl bg-linear-to-br from-jne-red/20 to-jne-red/5 border border-jne-red/20 flex items-center justify-center shadow-lg shadow-jne-red/10"
        >
          <Cpu size={20} className="text-jne-red" />
          <div className="absolute inset-0 rounded-2xl bg-jne-red/5 animate-pulse" />
        </motion.div>

        <div className="min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">SYSTEM</span>
            <ChevronRight size={10} className="text-white/15" />
            <span className="text-[9px] font-black text-jne-red/60 uppercase tracking-[0.3em]">MODULE</span>
          </div>
          {/* Title */}
          <h1 className="text-[16px] font-black text-white tracking-tight uppercase leading-none truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[9px] text-white/25 font-bold uppercase tracking-[0.25em] mt-0.5 truncate font-mono">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ── CENTER: Search Bar ── */}
      <div className="hidden lg:flex flex-1 justify-center px-4 max-w-xl mx-auto">
        <motion.div
          animate={searchFocused ? { scale: 1.02 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative w-full"
        >
          <Search
            size={14}
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
              searchFocused ? 'text-jne-red' : 'text-white/20'
            }`}
          />
          <input
            type="text"
            placeholder="Search Protocol..."
            value={searchValue}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onChange={e => setSearchValue(e.target.value)}
            className="w-full bg-white/4 border border-white/6 rounded-2xl py-2.5 pl-10 pr-10 text-[12px] font-semibold text-white placeholder:text-white/20 focus:outline-none focus:border-jne-red/40 focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(255,51,102,0.05)] transition-all duration-300 shadow-inner"
          />
          <AnimatePresence>
            {searchValue && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchValue('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                <X size={13} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── RIGHT: Action Cluster ── */}
      <div className="flex items-center gap-3 px-8 flex-1 justify-end">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggleTheme}
          className="relative w-9 h-9 rounded-xl bg-white/4 border border-white/6 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 hover:border-white/10 transition-all duration-300 shadow-inner overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div
                key="moon"
                initial={{ opacity: 0, y: 8, rotate: -30 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -8, rotate: 30 }}
                transition={{ duration: 0.2 }}
              >
                <Moon size={15} strokeWidth={2} />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ opacity: 0, y: 8, rotate: -30 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -8, rotate: 30 }}
                transition={{ duration: 0.2 }}
              >
                <Sun size={15} className="text-jne-warning" strokeWidth={2} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleNotifications}
            className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-inner ${
              showNotifications
                ? 'bg-jne-red/15 border-jne-red/30 text-jne-red'
                : 'bg-white/4 border-white/6 text-white/40 hover:text-white hover:bg-white/8 hover:border-white/10'
            }`}
          >
            <Bell size={15} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jne-red opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-jne-red shadow-[0_0_8px_rgba(255,51,102,0.8)]" />
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute right-0 top-full mt-3"
              >
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-white/8 mx-1" />

        {/* User Profile */}
        <div className="relative" ref={userRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleUserMenu}
            className="flex items-center gap-3 py-1.5 px-3 rounded-2xl bg-white/4 border border-white/6 hover:bg-white/8 hover:border-white/10 transition-all duration-300 shadow-inner group"
          >
            {/* Text info */}
            <div className="hidden lg:flex flex-col items-end">
              <p className="text-[11px] font-black text-white leading-none uppercase tracking-tight group-hover:text-jne-red transition-colors duration-300">
                {user?.name || 'CENTRAL ADMIN'}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jne-success opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-jne-success" />
                </span>
                <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em]">
                  {user?.role || 'ADMIN'}
                </p>
              </div>
            </div>

            {/* Avatar */}
            <div className="relative w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 via-purple-500 to-jne-red flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20 overflow-hidden shrink-0">
              <span className="text-[12px] relative z-10 leading-none">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 bg-linear-to-tr from-transparent via-white/25 to-transparent -skew-x-12"
                animate={{ x: ['-150%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
              />
            </div>
          </motion.button>

          {/* Dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute right-0 top-full mt-3 w-64 glass-card rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-black/40"
              >
                {/* Profile Header */}
                <div className="px-5 py-4 bg-linear-to-br from-jne-red/10 to-transparent border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 via-purple-500 to-jne-red flex items-center justify-center text-white font-black text-sm shadow-lg overflow-hidden relative">
                      <span className="relative z-10">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-black text-white uppercase tracking-tight truncate">
                        {user?.name || 'CENTRAL ADMIN'}
                      </p>
                      <p className="text-[9px] text-white/40 font-mono truncate mt-0.5">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Status Row */}
                <div className="px-5 py-3 flex items-center gap-2.5 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jne-success opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-jne-success" />
                    </span>
                    <span className="text-[9px] font-black text-jne-success uppercase tracking-widest">Auth Active</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Terminal size={10} className="text-white/20" />
                    <span className="text-[9px] text-white/20 font-mono uppercase">{user?.role?.toUpperCase()}</span>
                  </div>
                </div>

                {/* Sign Out */}
                <div className="p-2">
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={signOut}
                    className="w-full text-left px-4 py-3 rounded-xl text-[11px] text-white/60 hover:text-jne-red hover:bg-jne-red/10 transition-all font-black uppercase tracking-[0.15em] flex items-center gap-3 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-jne-red/8 border border-jne-red/15 flex items-center justify-center group-hover:bg-jne-red/15 transition-colors">
                      <LogOut size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    Terminate Session
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
