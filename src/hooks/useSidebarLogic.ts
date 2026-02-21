import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  BarChart3,
  Settings,
} from 'lucide-react';

export const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employees', label: 'Karyawan', icon: Users },
  { href: '/shifts', label: 'Shift Kerja', icon: Clock },
  { href: '/leaves', label: 'Persetujuan Izin', icon: FileText },
  { href: '/reports', label: 'Laporan Absensi', icon: BarChart3 },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
];

export function useSidebarLogic() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return {
    pathname,
    signOut,
    isActive,
    navItems,
  };
}
