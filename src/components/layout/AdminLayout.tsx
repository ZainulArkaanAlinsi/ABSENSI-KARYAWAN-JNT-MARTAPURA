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
      <Header title={title} subtitle={subtitle} />
      <main
        style={{
          marginLeft: 'var(--sidebar-width)',
          paddingTop: 'var(--header-height)',
          minHeight: 'calc(100vh - var(--header-height))',
        }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="p-4 sm:p-6 lg:p-8 pb-24 overflow-x-hidden mx-auto max-w-(--breakpoint-2xl)"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
