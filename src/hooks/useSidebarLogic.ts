import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  FileText, 
  Settings,
  Map,
  Layers,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  BarChart3,
  LogOut,
  Briefcase,
  History,
  ClipboardCheck,
  Building2
} from 'lucide-react';

export function useSidebarLogic() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const navItems = [
    { isHeader: true, label: 'Inti Sistem' },
    { label: 'Dashboard Utama', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analitik & Tren', href: '/analytics', icon: BarChart3 },

    { isHeader: true, label: 'Manajemen SDM' },
    { label: 'Data Karyawan', href: '/employees', icon: Users },
    { label: 'Struktur Organisasi', href: '/departments', icon: Layers },
    { label: 'Kepala Unit', href: '/head-units', icon: UserCheck },

    { isHeader: true, label: 'Operasional Absensi' },
    { label: 'Monitoring Absensi', href: '/attendance', icon: Clock },
    { label: 'Koreksi Data', href: '/attendance/requests', icon: History },
    { label: 'Izin & Cuti', href: '/leaves', icon: FileText },
    { label: 'Kalender Kerja', href: '/calendar', icon: Calendar },

    { isHeader: true, label: 'Pengaturan & Aturan' },
    { label: 'Master Jam Kerja', href: '/jam-kerja', icon: ClipboardCheck },
    { label: 'Manajemen Shift', href: '/shifts', icon: Briefcase },
    { label: 'Laporan Bulanan', href: '/reports', icon: ClipboardCheck },

    { isHeader: true, label: 'Konfigurasi' },
    { label: 'Pengaturan Sistem', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  const handleSignOut = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      await signOut();
      router.push('/login');
    }
  };

  return {
    navItems,
    isActive,
    signOut: handleSignOut,
    user,
  };
}
