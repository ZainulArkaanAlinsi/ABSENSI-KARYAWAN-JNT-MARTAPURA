'use client';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  Bell, 
  Sun, 
  Moon, 
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  ArrowLeft
} from 'lucide-react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationPanel from '@/components/notifications/NotificationPanel';

export default function Header({ title, subtitle, onMenuClick }: any) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const isDashboard = pathname === '/dashboard';

  return (
    <header className="h-20 bg-(--bg-header) backdrop-blur-md border-b border-(--border-primary) px-8 sticky top-0 z-50 flex items-center justify-between transition-all duration-300">
      {/* ── LEFT: TITLE SECTION ── */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-3 bg-white/5 border border-(--border-primary) rounded-xl text-(--text-primary) hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          type="button"
        >
          <Menu size={20} />
        </button>

        {!isDashboard && (
          <button 
            onClick={() => router.back()}
            className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white hover:bg-[#E31E24] hover:border-transparent transition-all cursor-pointer group shadow-md active:scale-90"
            title="Kembali"
          >
            <ArrowLeft size={18} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}
        
        <div>
          <h1 className="text-xl font-black text-(--text-primary) italic uppercase tracking-tight flex items-center gap-2">
            {title || 'Admin'}
            <span className="h-1 w-1 rounded-full bg-[#E31E24] block" />
            <span className="text-(--text-dim) not-italic font-bold text-[10px] tracking-widest ml-1 uppercase">Control</span>
          </h1>
          <p className="text-[9px] font-bold text-(--text-muted) uppercase tracking-[0.2em] mt-0.5">
            {subtitle || 'JNE Martapura Hub'}
          </p>
        </div>
      </div>

      {/* ── RIGHT: TOOLS & PROFILE ── */}
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-3 border-r border-(--border-primary) pr-6">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-3 text-(--text-muted) hover:text-[#005596] hover:bg-white/5 rounded-xl transition-all cursor-pointer active:scale-90 flex items-center justify-center"
            type="button"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {/* Notif Button */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsProfileOpen(false);
                setIsNotifOpen(!isNotifOpen);
              }}
              className={`p-3 rounded-xl transition-all cursor-pointer active:scale-90 relative flex items-center justify-center ${isNotifOpen ? 'bg-[#005596]/10 text-[#005596]' : 'text-(--text-muted) hover:bg-white/5'}`}
              type="button"
            >
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-[#E31E24] rounded-full border-2 border-(--bg-header)" />
            </button>
            <AnimatePresence>
              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-3 z-50">
                    <NotificationPanel onClose={() => setIsNotifOpen(false)} />
                  </div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsNotifOpen(false);
              setIsProfileOpen(!isProfileOpen);
            }}
            className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-(--border-primary) cursor-pointer active:scale-95"
            type="button"
          >
            <div className="h-9 w-9 rounded-xl bg-[#E31E24] flex items-center justify-center text-white font-black shadow-lg shadow-red-600/20">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-black text-(--text-primary) leading-none uppercase truncate max-w-[120px]">
                {user?.name || 'Admin'}
              </p>
              <p className="text-[9px] font-bold text-(--text-muted) uppercase tracking-widest mt-1">Super Admin</p>
            </div>
            <ChevronDown size={14} className={`text-(--text-dim) transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-64 bg-(--bg-card) rounded-2xl shadow-2xl border border-(--border-primary) overflow-hidden z-50"
                >
                  <div className="p-5 bg-white/2 border-b border-(--border-primary)">
                    <p className="text-[10px] font-black text-(--text-dim) uppercase tracking-[0.2em] mb-1">Status: Online</p>
                    <p className="text-xs font-bold text-(--text-primary) truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-(--text-secondary) hover:bg-white/5 hover:text-(--text-primary) transition-all text-xs font-bold cursor-pointer" type="button">
                      <User size={16} /> Profil Saya
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-(--text-secondary) hover:bg-white/5 hover:text-(--text-primary) transition-all text-xs font-bold cursor-pointer" type="button">
                      <Settings size={16} /> Pengaturan
                    </button>
                    <div className="h-px bg-(--border-primary) my-1 mx-2" />
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#E31E24] hover:bg-red-500/10 transition-all text-xs font-black cursor-pointer"
                      type="button"
                    >
                      <LogOut size={16} /> Keluar Sistem
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}