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
    <header className="flex items-center justify-between h-20 px-8 bg-(--bg-card)/80 backdrop-blur-xl border border-(--border-color) rounded-[24px] shadow-sm transition-all duration-300">
      {/* ── SEARCH BAR ── */}
      <div className="flex-1 max-w-md relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-(--text-secondary) group-focus-within:text-(--jne-rose) transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Cari data personil..." 
          className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-3 pl-14 pr-6 text-sm font-bold text-(--text-primary) placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-(--jne-rose) transition-all"
        />
      </div>

      {/* ── ACTIONS ── */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-(--bg-main) border border-(--border-color) text-(--text-primary) hover:text-(--jne-rose) transition-all"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-(--bg-main) border border-(--border-color) text-(--text-secondary) hover:text-(--jne-rose) transition-all group">
          <Bell size={18} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-(--jne-rose) rounded-full" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-4 pl-4 border-l border-(--border-color)">
          <div className="text-right hidden lg:block">
            <p className="text-[11px] font-black text-(--text-primary) leading-tight italic uppercase tracking-tighter">
              {user?.name.split(' ')[0] || 'ADMIN'}
            </p>
            <p className="text-[8px] font-black text-(--jne-rose) uppercase tracking-widest mt-1">
              {user?.role || 'SYSTEM'}
            </p>
          </div>
          <div className="w-11 h-11 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center text-white text-xs font-black italic shadow-lg">
             {user?.name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}