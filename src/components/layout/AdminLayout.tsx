'use client';

import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  return (
    <div className="min-h-screen selection:bg-red-600 selection:text-white" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Sidebar />
      
      <div 
        className="flex flex-col min-w-0 min-h-screen transition-all duration-500"
        style={{ marginLeft: 'var(--sidebar-width)' }}
      >
        <Header title={title} subtitle={subtitle} />
        
        <main className="flex-1 overflow-x-hidden p-4 lg:px-8 pb-12">
          <motion.div 
            initial={{ opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
