'use client';

import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '@/context/ThemeContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-screen bg-(--bg-main) flex overflow-hidden transition-colors duration-500">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER AREA */}
        <div className="px-8 pt-6">
          <Header onMenuClick={() => {}} />
        </div>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-(--bg-main) p-8">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>

      {/* THEME TOGGLE */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border border-white/10"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  );
}