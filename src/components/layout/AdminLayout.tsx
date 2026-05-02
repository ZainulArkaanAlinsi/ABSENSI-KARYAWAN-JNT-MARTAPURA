'use client';

import Sidebar from './Sidebar';
import Header from './Header';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar automatically when navigating on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen selection:bg-red-600 selection:text-white" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      
      {/* 🌑 Mobile Overlay (Hanya muncul pas menu diklik) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* 🚪 Sidebar (Ngumpet di kiri kalau di HP, muncul di samping kalau di Laptop) */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-[280px] transition-all duration-500 ease-in-out transform 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:z-30`}
      >
        <Sidebar />
      </div>
      
      {/* 📋 Main Content Area (Geser otomatis kalau di Laptop) */}
      <div className="flex flex-col min-w-0 min-h-screen transition-all duration-500 lg:pl-[280px]">
         <Header 
            title={title} 
            subtitle={subtitle} 
            onMenuClick={() => setIsSidebarOpen(true)} 
         />
         
         <main className="flex-1 p-4 sm:p-6 md:p-10 pb-24 flex flex-col items-center">
           <motion.div 
             className="w-full max-w-7xl mx-auto"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
           >
             {children}
           </motion.div>
         </main>
      </div>
    </div>
  );
}
