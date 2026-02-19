'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employees', label: 'Karyawan', icon: Users },
  { href: '/shifts', label: 'Shift Kerja', icon: Clock },
  { href: '/leaves', label: 'Persetujuan Izin', icon: FileText },
  { href: '/reports', label: 'Laporan Absensi', icon: BarChart3 },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth(); // Removed user since we'll use a profile pic in Header or bottom

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-40"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid rgba(255,255,255,0.03)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-center py-8">
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{ width: 42, height: 42, background: 'linear-gradient(135deg, #e31e24 0%, #991b1b 100%)', boxShadow: '0 8px 16px rgba(227, 30, 36, 0.2)' }}
        >
          <Shield size={22} color="white" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link-premium ${isActive ? 'active' : ''}`}
              title={label}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 pb-8 flex justify-center">
        <button
          onClick={signOut}
          className="p-3 rounded-2xl text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
          title="Keluar"
        >
          <LogOut size={22} />
        </button>
      </div>
    </aside>
  );
}
