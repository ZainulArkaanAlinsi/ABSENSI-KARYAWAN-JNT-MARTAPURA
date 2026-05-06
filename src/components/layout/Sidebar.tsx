'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  FileText, 
  PieChart, 
  ClipboardCheck,
  Clock,
  LogOut,
  ScanFace,
  Briefcase,
  Settings,
  HelpCircle,
  Package,
  ShieldCheck
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Personel', href: '/employees' },
  { icon: Briefcase, label: 'Kepala Unit', href: '/head-units' },
  { icon: Layers, label: 'Departemen/Hub', href: '/departments' },
  { icon: ScanFace, label: 'Verifikasi Wajah', href: '/face-enrollment' },
  { icon: ClipboardCheck, label: 'Izin & Cuti', href: '/leaves' },
  { icon: FileText, label: 'Koreksi Absen', href: '/attendance/requests' },
  { icon: Clock, label: 'Jam Operasional', href: '/jam-kerja' },
  { icon: PieChart, label: 'Laporan Hub', href: '/reports' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <div className="sidebar-enterprise h-full pt-10 pb-6">
      {/* ── JNE BRANDING ── */}
      <div className="px-8 mb-12">
        <Link href="/dashboard" className="flex items-center gap-4 group">
          <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-lg transition-transform group-hover:rotate-12">
            {/* JNE Logo simulation with Red/Blue */}
            <div className="flex flex-col items-center">
               <span className="text-[14px] font-black text-[#E31E24] leading-none">JNE</span>
               <div className="h-1 w-full bg-[#005596] mt-0.5 rounded-full" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[16px] font-black text-white leading-none tracking-tight">MARTAPURA</h1>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1.5">Hub Attendance</span>
          </div>
        </Link>
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : 'text-slate-400'}`}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span className="tracking-wide text-[13px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── SYSTEM STATUS (Workplace Feel) ── */}
      <div className="mx-6 p-5 rounded-2xl bg-white/5 border border-white/5 mb-6">
        <div className="flex items-center gap-3 mb-4">
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Server Hub Live</span>
        </div>
        <div className="flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-500">Last Sync</p>
           <p className="text-[10px] font-black text-white">Just Now</p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="mt-auto px-6 space-y-2">
        <Link href="/settings" className="sidebar-link mx-0! bg-transparent! hover:bg-white/5! text-slate-400">
          <Settings size={18} />
          <span className="text-[13px]">Pengaturan</span>
        </Link>
        <button 
          onClick={() => signOut()}
          className="sidebar-link mx-0! w-full text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
        >
          <LogOut size={18} />
          <span className="text-[13px]">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
