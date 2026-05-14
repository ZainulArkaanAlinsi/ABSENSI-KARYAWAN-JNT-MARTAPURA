'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid, Users, Calendar, MessageSquare,
  Settings, LogOut, Clock, ScanFace, Inbox,
  X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';

const NAV_ITEMS = [
  { id: 'dashboard',       label: 'Beranda',     icon: LayoutGrid,    path: '/dashboard' },
  { id: 'requests',        label: 'Kotak Masuk', icon: Inbox,         path: '/requests' },
  { id: 'attendance',      label: 'Kehadiran',   icon: Clock,         path: '/attendance' },
  { id: 'employees',       label: 'Karyawan',    icon: Users,         path: '/employees' },
  { id: 'chat',            label: 'Pesan',        icon: MessageSquare, path: '/chat' },
  { id: 'calendar',        label: 'Kalender',    icon: Calendar,      path: '/calendar' },
  { id: 'face-enrollment', label: 'Wajah',        icon: ScanFace,      path: '/face-enrollment' },
  { id: 'settings',        label: 'Pengaturan',  icon: Settings,      path: '/settings' },
];

// Sidebar colors — clean corporate, no neon
const C = {
  bg:           '#0D1117',
  border:       'rgba(255,255,255,0.07)',
  activeBg:     'rgba(227,30,36,0.10)',
  activeBorder: '#E31E24',
  hoverBg:      'rgba(255,255,255,0.04)',
  iconActive:   '#FFFFFF',
  iconInactive: 'rgba(255,255,255,0.35)',
  labelActive:  '#FFFFFF',
  labelInactive:'rgba(255,255,255,0.45)',
  accent:       '#E31E24',
};

interface SidebarProps {
  onClose?:   () => void;
  collapsed?: boolean;
  onToggle?:  () => void;
}

function getDisplayName(name: string) {
  if (!name) return 'Administrator';
  if (name.includes('@')) {
    const part = name.split('@')[0];
    return part.charAt(0).toUpperCase() + part.slice(1);
  }
  return name;
}

function getInitials(name: string) {
  const d = getDisplayName(name);
  return d.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'AD';
}

function NavLink({
  item, isActive, collapsed, onClose, badge,
}: {
  item: { id: string; label: string; icon: React.ElementType; path: string };
  isActive: boolean;
  collapsed?: boolean;
  onClose?: () => void;
  badge?: number;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.path}
      onClick={onClose}
      title={collapsed ? item.label : undefined}
      className={`relative flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-2.5 py-2 rounded-xl group transition-all`}
      style={{
        background: isActive ? C.activeBg : 'transparent',
        borderLeft: isActive ? `3px solid ${C.activeBorder}` : '3px solid transparent',
      }}
    >
      {/* Hover bg */}
      {!isActive && (
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: C.hoverBg }}
        />
      )}

      <div className={`relative z-10 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors`}>
        <Icon
          size={15}
          strokeWidth={isActive ? 2.2 : 1.8}
          style={{ color: isActive ? C.iconActive : C.iconInactive }}
          className="group-hover:brightness-125 transition-all"
        />
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 text-[13px] font-medium whitespace-nowrap overflow-hidden flex-1 transition-colors"
            style={{ color: isActive ? C.labelActive : C.labelInactive }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {badge !== undefined && badge > 0 && !collapsed && (
        <span
          className="relative z-10 min-w-[18px] h-[18px] px-1.5 rounded-full text-[9px] font-bold flex items-center justify-center"
          style={{ background: '#E31E24', color: '#fff' }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar({ onClose, collapsed = false, onToggle }: SidebarProps) {
  const pathname          = usePathname();
  const { signOut, user } = useAuth();
  const { unreadNotifCount, unreadChatCount } = useNotifications();

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ background: C.bg }}
    >
      {/* ── TOP BAR ── */}
      <div
        className={`px-4 pt-5 pb-4 flex items-center shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: C.accent }}
          >
            <span className="text-white font-black text-sm select-none">J</span>
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <p className="text-[13px] font-bold leading-none whitespace-nowrap text-white">JNE Martapura</p>
                <p className="text-[10px] font-medium mt-0.5 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Sistem Absensi
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {onClose && !onToggle && (
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <X size={14} />
          </button>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            title={collapsed ? 'Perluas' : 'Ciutkan'}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center transition-all"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* ── PROFILE ── */}
      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.div
            key="profile-full"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden shrink-0"
          >
            <div className="px-4 py-4 flex items-center gap-3">
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-desc font-bold"
                  style={{ background: C.accent }}
                >
                  {getInitials(user?.name || 'Admin')}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2"
                  style={{ borderColor: C.bg }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">
                  {getDisplayName(user?.name || '')}
                </p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {user?.email || 'JNE Martapura'}
                </p>
              </div>
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0"
                style={{ background: 'rgba(227,30,36,0.15)', color: '#F87171' }}
              >
                {user?.role === 'superadmin' ? 'Super' : 'Admin'}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="profile-collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-4 shrink-0"
          >
            <div className="relative">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                style={{ background: C.accent }}
              >
                {getInitials(user?.name || 'Admin')}
              </div>
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2"
                style={{ borderColor: C.bg }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DIVIDER ── */}
      <div className="mx-4 h-px shrink-0" style={{ background: C.border }} />

      {/* ── NAVIGATION ── */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5 custom-scrollbar">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[9px] font-bold uppercase tracking-[0.25em] px-2 pt-1 pb-2"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              Menu Utama
            </motion.p>
          )}
        </AnimatePresence>

        {NAV_ITEMS.map((item) => {
          // Per-menu badge: requests = admin notifications, chat = chat unread.
          let badge: number | undefined;
          if (item.id === 'requests') badge = unreadNotifCount;
          else if (item.id === 'chat') badge = unreadChatCount;
          return (
            <NavLink
              key={item.id}
              item={item}
              isActive={pathname.startsWith(item.path)}
              collapsed={collapsed}
              onClose={onClose}
              badge={badge}
            />
          );
        })}
      </nav>

      {/* ── LOGOUT ── */}
      <div className="p-3 shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => signOut()}
          title={collapsed ? 'Keluar' : undefined}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-2.5 py-2 rounded-xl transition-all group`}
          style={{ background: 'transparent' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(227,30,36,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
            <LogOut
              size={14}
              strokeWidth={1.8}
              style={{ color: 'rgba(255,255,255,0.3)' }}
              className="group-hover:text-red-400 transition-colors"
            />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-colors group-hover:text-red-400"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Keluar
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
