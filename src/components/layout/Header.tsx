'use client';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  Bell, 
  Sun, 
  Moon, 
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  LayoutGrid
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationPanel from '@/components/notifications/NotificationPanel';

export default function Header({ onMenuClick }: any) {
  const { user, signOut, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Show skeleton during initial load to prevent flicker
  const showProfileSkeleton = loading && !user;
  const userInitial = showProfileSkeleton ? '...' : (user?.name?.charAt(0)?.toUpperCase() || 'A');
  const userName = showProfileSkeleton ? 'Loading...' : (user?.name || 'Admin');

  return (
    <header className="h-28 bg-transparent px-10 flex items-center justify-between z-50">
      {/* ── LEFT: SEARCH (Minimalist) ── */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-3 bg-white dark:bg-slate-800 border border-(--border-primary) rounded-2xl text-slate-600 shadow-sm"
        >
          <Menu size={20} />
        </button>
        

      </div>

      {/* ── RIGHT: TOOLS ── */}
      <div className="flex items-center gap-5">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-4 bg-white dark:bg-slate-800 border border-(--border-primary) text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-4 bg-white dark:bg-slate-800 border border-(--border-primary) rounded-2xl transition-all shadow-sm relative ${isNotifOpen ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Bell size={20} />
            <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
          </button>
          <AnimatePresence>
            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-4 z-50">
                <NotificationPanel onClose={() => setIsNotifOpen(false)} />
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-10 w-px bg-(--border-primary) mx-2" />

        {/* Profile (Clean Initial) */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pr-5 rounded-2xl bg-white dark:bg-slate-800 border border-(--border-primary) shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <div className="h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg overflow-hidden shadow-inner uppercase">
               {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-black text-indigo-950 dark:text-white uppercase leading-none mb-1.5 tracking-tight">{user?.name || 'Admin'}</p>
              <div className="flex items-center gap-1.5">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">System Root</p>
              </div>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-5 w-64 bg-white dark:bg-slate-800 rounded-4xl shadow-2xl border border-(--border-primary) overflow-hidden z-50 p-2.5"
              >
                <button className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-all text-xs font-bold">
                  <LayoutGrid size={18} /> Account Info
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-all text-xs font-bold">
                  <Settings size={18} /> System Config
                </button>
                <div className="h-px bg-(--border-primary) my-2 mx-2" />
                <button 
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-xs font-black uppercase tracking-widest"
                >
                  <LogOut size={18} /> Logout Session
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}