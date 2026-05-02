'use client';

import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useTheme } from '@/context/ThemeContext';
import { 
  Users, 
  Clock, 
  UserCheck, 
  UserX, 
  Calendar as CalendarIcon,
  FileText,
  Settings,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export default function DashboardPage() {
  const { data, loading } = useDashboardStats();
  const { theme } = useTheme();

  const stats = {
    totalEmployees: data?.totalEmployees ?? 0,
    todayPresent: data?.presentToday ?? 0,
    todayLate: data?.lateToday ?? 0,
    todayAbsent: data?.absentToday ?? 0,
  };

  const chartData = data?.weeklyTrends.map(t => ({
    name: t.day,
    hadir: t.present,
    alfa: t.absent
  })) ?? [];

  const recentAttendance = data?.recentActivities.map(r => ({
    userName: r.userName,
    department: r.department,
    checkInTime: typeof r.checkIn === 'string' ? r.checkIn : '—',
    status: r.status,
  })) ?? [];

  const statCards = [
    { label: 'Total Personel', value: stats.totalEmployees, icon: Users, color: '#005596', trend: 'Karyawan Aktif' },
    { label: 'Hadir Hari Ini', value: stats.todayPresent, icon: UserCheck, color: '#10B981', trend: 'Absensi Masuk' },
    { label: 'Terlambat', value: stats.todayLate, icon: Clock, color: '#F59E0B', trend: 'Perlu Evaluasi' },
    { label: 'Tanpa Keterangan', value: stats.todayAbsent, icon: UserX, color: '#E31E24', trend: 'Belum Scan' },
  ];

  const quickNav = [
    { label: 'Staff', sub: 'Manajemen Karyawan', icon: Users, href: '/employees', color: '#005596' },
    { label: 'Reports', sub: 'Laporan Berkala', icon: FileText, href: '/reports', color: '#E31E24' },
    { label: 'Config', sub: 'Parameter Sistem', icon: Settings, href: '/settings', color: '#64748B' },
    { label: 'Depart', sub: 'Struktur Unit', icon: Layers, href: '/departments', color: '#005596' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative bg-(--bg-card) p-6 rounded-4xl border border-(--border-primary) shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div 
                className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                <stat.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="text-[9px] font-black text-(--text-dim) uppercase tracking-widest">Status Terkini</div>
            </div>

            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-(--text-primary) tracking-tighter">{loading ? '...' : stat.value}</h3>
            </div>

            <div className="mt-4 pt-4 border-t border-(--border-primary)">
              <p className="text-[9px] font-bold text-(--text-muted) uppercase tracking-wide flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {stat.trend}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── QUICK NAVIGATION (Zen Remake) ── */}
      <div className="bg-(--bg-card) p-10 rounded-4xl border border-(--border-primary) shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-red-600/5 to-transparent pointer-events-none" />
        
        <div className="mb-8 px-2 flex items-center justify-between">
           <div>
              <h2 className="text-xl font-black text-(--text-primary) italic uppercase tracking-tighter">Navigasi Cepat</h2>
              <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest mt-1">Akses Langsung ke Fitur Utama</p>
           </div>
           <div className="h-px flex-1 mx-8 bg-(--border-primary)" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {quickNav.map((nav, idx) => (
            <Link key={nav.label} href={nav.href}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (idx * 0.05) }}
                whileHover={{ y: -5 }}
                className="bg-white/2 border border-(--border-primary) p-6 rounded-3xl hover:bg-(--bg-main) hover:border-(--text-dim) transition-all group cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div 
                    className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                    style={{ backgroundColor: nav.color }}
                  >
                    <nav.icon size={22} />
                  </div>
                  <ArrowUpRight size={16} className="text-(--text-dim) group-hover:text-(--text-primary) transition-colors" />
                </div>
                
                <h3 className="text-lg font-black text-(--text-primary) uppercase italic tracking-tighter leading-none mb-2">{nav.label}</h3>
                <p className="text-[9px] font-bold text-(--text-muted) uppercase tracking-widest">{nav.sub}</p>
                
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-linear-to-tl from-white/5 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── CHARTS SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-(--bg-card) p-6 md:p-8 rounded-4xl border border-(--border-primary) shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-(--text-primary) uppercase italic tracking-tight">Tren Absensi Mingguan</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[9px] font-black text-(--text-muted) uppercase"><div className="w-2 h-2 rounded-full bg-[#005596]" /> Hadir</div>
              <div className="flex items-center gap-2 text-[9px] font-black text-(--text-muted) uppercase"><div className="w-2 h-2 rounded-full bg-[#E31E24]" /> Alfa</div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005596" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#005596" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1E293B' : '#F1F5F9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#64748B' : '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#64748B' : '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  labelFormatter={(label) => `Hari: ${label}`}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                    color: theme === 'dark' ? '#F8FAFC' : '#0F172A'
                  }} 
                />
                <Area type="monotone" dataKey="hadir" name="Hadir" stroke="#005596" strokeWidth={3} fillOpacity={1} fill="url(#colorHadir)" />
                <Area type="monotone" dataKey="alfa" name="Alfa" stroke="#E31E24" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-(--bg-card) p-6 md:p-8 rounded-4xl border border-(--border-primary) shadow-sm">
          <h2 className="text-lg font-black text-(--text-primary) uppercase italic tracking-tight mb-6">Aktivitas Terbaru</h2>

          <div className="space-y-5">
            {recentAttendance.length > 0 ? recentAttendance.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center font-black text-[10px] text-(--text-muted) border border-(--border-primary)">
                  {item.userName?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black text-(--text-primary) truncate leading-tight">{item.userName}</p>
                  <p className="text-[8px] font-bold text-(--text-dim) uppercase tracking-widest mt-1">{item.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-(--text-primary)">{item.checkInTime}</p>
                  <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${item.status === 'late' ? 'text-orange-500' : 'text-green-500'}`}>
                    {item.status === 'late' ? 'Terlambat' : 'Hadir'}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-(--text-dim) font-bold uppercase text-[9px] tracking-widest">
                Belum ada aktivitas
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
