'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/ui/Badge';
import { 
  Users, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  ArrowRight, 
  Calendar,
  Layers,
  FileText,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useTheme } from '@/context/ThemeContext';

// ── Minimalist Components ──

const StatCard = ({ label, value, icon: Icon, loading }: { label: string; value: string | number; icon: any; loading: boolean }) => (
  <div className="bg-(--bg-card) p-6 rounded-2xl border border-(--border-primary) shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500">
        <Icon size={20} />
      </div>
      <span className="text-sm font-medium text-slate-500">{label}</span>
    </div>
    <div className="text-3xl font-bold text-(--text-primary)">
      {loading ? '...' : value}
    </div>
  </div>
);

const AttendanceChart = ({ stats, loading }: { stats: any; loading: boolean }) => {
  const chartData = [
    { name: 'Hadir', value: stats?.presentToday ?? 0, color: '#10B981' },
    { name: 'Terlambat', value: stats?.lateToday ?? 0, color: '#F59E0B' },
    { name: 'Alfa', value: stats?.absentToday ?? 0, color: '#E31E24' },
  ];

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="relative h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-(--text-primary)">{stats?.engagementIndex ?? 0}%</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Attendance</span>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2">
        {chartData.map((item, i) => (
          <div key={i} className="text-center">
            <div className="text-xs font-medium text-slate-500 mb-1">{item.name}</div>
            <div className="text-sm font-bold" style={{ color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { data, loading } = useDashboardStats();
  const { theme } = useTheme();

  const trendData = data?.weeklyTrends.map(t => ({
    name: t.day,
    hadir: t.present,
    late: t.late,
    absent: t.absent
  })) ?? [];

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-slate-800 border border-(--border-primary) rounded-xl text-sm font-medium flex items-center gap-2">
             <Calendar size={16} className="text-slate-400" />
             Hari Ini
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Karyawan" value={data?.totalEmployees ?? 0} icon={Users} loading={loading} />
        <StatCard label="Hadir Hari Ini" value={data?.presentToday ?? 0} icon={UserCheck} loading={loading} />
        <StatCard label="Terlambat" value={data?.lateToday ?? 0} icon={Clock} loading={loading} />
        <StatCard label="Permohonan Cuti" value={data?.pendingLeaves ?? 0} icon={FileText} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Trend Chart */}
        <div className="lg:col-span-8 bg-(--bg-card) p-8 rounded-2xl border border-(--border-primary) shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-(--text-primary)">Tren Kehadiran Mingguan</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500">Hadir</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs text-slate-500">Late</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip />
                <Area type="monotone" dataKey="hadir" stroke="#10B981" fillOpacity={1} fill="url(#colorHadir)" strokeWidth={2} />
                <Area type="monotone" dataKey="late" stroke="#F59E0B" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-4 bg-(--bg-card) p-8 rounded-2xl border border-(--border-primary) shadow-sm">
          <h2 className="text-lg font-bold text-(--text-primary) mb-8">Distribusi Kehadiran</h2>
          <AttendanceChart stats={data} loading={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-12 bg-(--bg-card) rounded-2xl border border-(--border-primary) shadow-sm overflow-hidden">
          <div className="p-6 border-b border-(--border-primary)">
            <h2 className="text-lg font-bold text-(--text-primary)">Log Aktivitas Terakhir</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Karyawan</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Unit/Departemen</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-primary)">
                {data?.recentActivities.map((act, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                          {act.userName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-(--text-primary)">{act.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{act.department}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={act.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 text-right">{act.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
