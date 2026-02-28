import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  BarChart3,
  Settings,
  Calendar,
  ClipboardCheck,
} from 'lucide-react';

export const navItems = [
  { href: '/dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/employees',  label: 'Karyawan',     icon: Users },
  { href: '/attendance', label: 'Absensi',      icon: ClipboardCheck },
  { href: '/calendar',   label: 'Kalender',     icon: Calendar },
  { href: '/shifts',     label: 'Shift Kerja',  icon: Clock },
  { href: '/leaves',     label: 'Persetujuan Izin', icon: FileText },
  { href: '/reports',    label: 'Laporan',      icon: BarChart3 },
  { href: '/settings',   label: 'Pengaturan',   icon: Settings },
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
