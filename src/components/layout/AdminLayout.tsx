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
    <div className="min-h-screen selection:bg-att-absent selection:text-white" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="p-3 sm:p-4 lg:p-6 pb-24 overflow-x-hidden"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
