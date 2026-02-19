'use client';

import Sidebar from './Sidebar';
import Header from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      <Sidebar />
      <Header title={title} subtitle={subtitle} />
      <main
        style={{
          marginLeft: 'var(--sidebar-width)',
          paddingTop: 'var(--header-height)',
          minHeight: '100vh',
        }}
      >
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
