'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Search, Bell, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/context/NotificationContext';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import ThemeToggle from '../ui/ThemeToggle';

function getDisplayName(name: string) {
  if (!name) return 'Administrator';
  if (name.includes('@')) {
    const part = name.split('@')[0];
    return part.charAt(0).toUpperCase() + part.slice(1);
  }
  return name.split(' ')[0];
}

function getInitials(name: string) {
  const d = getDisplayName(name);
  return d.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'AD';
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const today = format(new Date(), 'EEEE, dd MMMM yyyy', { locale: idLocale });
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/employees?search=${encodeURIComponent(searchQuery.trim())}`);
      inputRef.current?.blur();
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-between px-4 lg:px-6 gap-4">

      {/* ── LEFT ── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors"
          style={{ background: 'var(--surface-hover)', borderColor: 'var(--border-default)', color: 'var(--text-dim)' }}
        >
          <Menu size={17} />
        </motion.button>

        {/* Greeting */}
        <div className="hidden sm:flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold" style={{ color: 'var(--text-dim)' }}>
              {getGreeting()},
            </span>
            <span
              className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(227,30,36,0.08)', color: '#E31E24' }}
            >
              {getDisplayName(user?.name || '')}
            </span>
          </div>
          <p className="text-[12px] font-bold leading-none truncate" style={{ color: 'var(--text-primary)' }}>
            {today}
          </p>
        </div>
      </div>

      {/* ── CENTER: search ── */}
      <div className="flex-1 max-w-[420px]">
        <div className="relative group">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: 'var(--text-dim)' }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari karyawan, laporan..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full h-[38px] rounded-2xl pl-10 pr-4 text-[13px] font-medium outline-none
                       transition-all border focus:ring-2 focus:ring-red-400/20 focus:border-red-300"
            style={{
              background: 'var(--surface-hover)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-default)',
            }}
          />
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="flex items-center gap-1.5 shrink-0">

        <ThemeToggle />

        {/* Bell */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center border transition-all"
          style={{ background: 'var(--surface-hover)', borderColor: 'var(--border-default)', color: 'var(--text-dim)' }}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center border-2"
              style={{ background: '#E31E24', borderColor: 'var(--surface-header)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>

        {/* Divider */}
        <div className="w-px h-6 mx-1" style={{ background: 'var(--border-default)' }} />

        {/* Profile chip */}
        <motion.div
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-2xl cursor-pointer border transition-all"
          style={{ background: 'var(--surface-hover)', borderColor: 'var(--border-default)' }}
        >
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[11px] font-black shrink-0"
            style={{
              background: '#E31E24',
              boxShadow: 'none',
            }}
          >
            {getInitials(user?.name || 'Admin')}
          </div>
          <div className="hidden md:block">
            <p className="text-[12px] font-bold leading-none" style={{ color: 'var(--text-primary)' }}>
              {getDisplayName(user?.name || '')}
            </p>
            <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--text-dim)' }}>
              {user?.role === 'superadmin' ? 'Super Admin' : 'Administrator'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
