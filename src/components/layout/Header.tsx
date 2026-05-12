'use client';

import { useAuth } from '@/context/AuthContext';
import { Search, Settings, Bell, User, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'AD';
  };

  return (
    <div className="w-full h-full flex items-center justify-between px-6 lg:px-10 bg-white border-b border-slate-100">
      
      {/* ── SEARCH (Balanced Minimal) ── */}
      <div className="flex-1 max-w-[400px]">
        <div className="relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search system..."
            className="w-full h-10 bg-slate-50 border border-slate-200/50 rounded-xl pl-11 pr-4 text-[13px] font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-600/5 transition-all"
          />
        </div>
      </div>

      {/* ── ACTIONS & PROFILE ── */}
      <div className="flex items-center gap-4 lg:gap-8 ml-6">
        
        <div className="flex items-center gap-1 text-slate-400">
           <button className="w-9 h-9 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center">
              <Bell size={18} />
           </button>
           <button className="w-9 h-9 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center">
              <Settings size={18} />
           </button>
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

        {/* PROFILE SECTOR */}
        <div className="flex items-center gap-3.5 group cursor-pointer">
          <div className="text-right hidden md:block">
            <p className="text-[13px] font-bold text-slate-900 leading-none">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[10px] font-medium text-slate-500 mt-1.5 uppercase tracking-wider">
              {user?.role || 'Admin'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-600 transition-all duration-300 overflow-hidden">
             <span className="text-[12px] font-black tracking-tight">
               {getInitials(user?.name || 'Admin')}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}