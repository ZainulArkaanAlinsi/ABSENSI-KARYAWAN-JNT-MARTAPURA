'use client';

import { 
  Bell, 
  Search, 
  User,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-(--bg-card)/60 backdrop-blur-md border border-(--border-color) rounded-2xl shadow-sm transition-all duration-300">
      {/* ── SEARCH BAR ── */}
      <div className="flex-1 max-w-md relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
        <input 
          type="text" 
          placeholder="Quick search personnel..." 
          className="w-full bg-(--bg-main)/50 border border-(--border-color) rounded-xl py-2 pl-11 pr-4 text-[11px] font-bold text-(--text-primary) placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all"
        />
      </div>

      {/* ── ACTIONS ── */}
      <div className="flex items-center gap-3">
        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-(--border-color)">
          <div className="text-right hidden md:block">
            <p className="text-[11px] font-black text-(--text-primary) leading-tight tracking-tighter uppercase italic">
              {user?.name || 'ADMIN PERSONNEL'}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <p className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
                {user?.role || 'SYSTEM ADMIN'}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 bg-slate-950 dark:bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center text-white text-xs font-black italic shadow-xl shadow-black/20 group-hover:scale-105 transition-transform">
             {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}