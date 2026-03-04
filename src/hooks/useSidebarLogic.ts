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
  { href: '/jam-kerja',  label: 'Jam Kerja',    icon: Clock },
  { href: '/leaves',     label: 'Izin & Cuti',  icon: FileText },
  {
    label: 'HEAD UNITS',
    isHeader: true,
  },
  { href: '/head-units/rider_delivery', label: 'Rider Delivery', icon: Users },
  { href: '/head-units/driver_delivery', label: 'Driver Delivery', icon: Users },
  { href: '/head-units/inbound_outbound', label: 'Inbound & Outbound', icon: Users },
  { href: '/head-units/pick_up', label: 'Pick Up', icon: Users },
  { href: '/head-units/admin_support', label: 'Admin Support', icon: Users },
  { href: '/head-units/accounting', label: 'Accounting', icon: Users },
  { href: '/head-units/sales_sco', label: 'Sales SCO', icon: Users },
  {
    label: 'REKAP & ANALISIS',
    isHeader: true,
  },
  { href: '/reports',    label: 'Laporan',      icon: BarChart3 },
  { href: '/analytics',  label: 'Analisis',     icon: BarChart3 },
  { href: '/salary',     label: 'Slip Gaji',    icon: FileText },
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
