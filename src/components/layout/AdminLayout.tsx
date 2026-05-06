'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <div className="h-screen flex bg-(--bg-main) transition-colors duration-300 overflow-hidden font-sans">
      {/* SIDEBAR (Enterprise Slate Style) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-60 w-[var(--sidebar-width)] transition-transform duration-300 transform 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0`}
      >
        <Sidebar />
      </aside>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-55 md:hidden cursor-pointer"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col md:pl-[var(--sidebar-width)] min-w-0 h-full overflow-hidden">
        <div className="flex h-full">
          {/* MIDDLE COLUMN: Operational Core */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header onMenuClick={() => setIsSidebarOpen(true)} />
            <main className="flex-1 px-6 lg:px-8 pb-8 relative z-10 overflow-y-auto custom-scrollbar">
              <div className="max-w-[1400px] mx-auto">
                {children}
              </div>
            </main>
          </div>

          {/* RIGHT COLUMN: Operational Analytics Panel */}
          {isDashboard && (
            <aside className="hidden xl:block w-[var(--right-panel-width)] h-full bg-white dark:bg-[#0f172a] border-l border-(--border-primary) overflow-y-auto custom-scrollbar">
              <div id="enterprise-right-panel" className="p-8 space-y-10">
                {/* Real-time operational widgets will be injected here */}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
