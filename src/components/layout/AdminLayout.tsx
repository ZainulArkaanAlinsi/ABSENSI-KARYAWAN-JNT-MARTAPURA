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
    <div className="min-h-screen selection:bg-jne-red selection:text-white" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Sidebar />
      <Header title={title} subtitle={subtitle} />
      <main
        style={{
          marginLeft: 'var(--sidebar-width)',
          paddingTop: 'var(--header-height)',
          minHeight: '100vh',
        }}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="p-4 sm:p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
