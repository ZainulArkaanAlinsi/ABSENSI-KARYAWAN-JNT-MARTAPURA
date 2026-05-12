'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-slate-50 selection:bg-indigo-500/10 selection:text-indigo-600 overflow-x-hidden">
      
      {/* ── CENTRAL HUB WRAPPER (1440px Constrained) ── */}
      <div className="w-full max-w-[1600px] mx-auto flex min-h-screen bg-white shadow-[0_0_100px_rgba(15,23,42,0.06)] border-x border-slate-100 relative">
        
        {/* ── SIDEBAR SECTOR (Operational Hub) ── */}
        <div className="hidden lg:block w-[280px] h-screen sticky top-0 bg-primary z-60 shrink-0 overflow-hidden">
          <Sidebar />
        </div>

        {/* ── CONTENT SECTOR ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
          
          {/* ── HEADER (Telemetry Nav) ── */}
          <div className="w-full h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100/60 z-50 shrink-0 sticky top-0">
             <Header onMenuClick={() => {}} />
          </div>

          {/* ── SCROLLABLE WORKSPACE ── */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div className="p-8 lg:p-12 w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}