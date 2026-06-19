'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ArrowUpRight,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { PageLoader } from '@/components/ui/LoadingSpinner';

// ── Custom tooltip ────────────────────────────────────────────
const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; color: string; value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 px-3 py-2.5 text-[11px]">
      <p className="font-bold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-1.5 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">
            {p.dataKey === 'present' ? 'Hadir' : p.dataKey === 'late' ? 'Telat' : 'Absen'}:
          </span>
          <span className="font-bold text-slate-800 ml-auto pl-2">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1', '#3B82F6'];

export default function AnalyticsPage() {
  const { data, weeklyData, loading } = useDashboardStats();

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="editorial-heading text-[22px] font-black text-slate-800 tracking-tight leading-none">
          Analitik <span style={{ color: '#E31E24' }}>& Tren</span>
        </h1>
        <p className="text-[12px] text-slate-400 mt-1 font-medium">
          Visualisasi data performa dan kedisiplinan personel secara mendalam
        </p>
      </motion.div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Hadir Hari Ini',
            val: data.presentToday,
            icon: CheckCircle2,
            accent: 'text-emerald-600',
            bg: 'bg-emerald-100',
          },
          {
            label: 'Telat Hari Ini',
            val: data.lateToday,
            icon: Clock,
            accent: 'text-amber-600',
            bg: 'bg-amber-100',
          },
          {
            label: 'Absen Hari Ini',
            val: data.absentToday,
            icon: AlertCircle,
            accent: 'text-red-500',
            bg: 'bg-red-100',
          },
          {
            label: 'Total Karyawan',
            val: data.totalEmployees,
            icon: Users,
            accent: 'text-indigo-600',
            bg: 'bg-indigo-100',
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 + i * 0.06 }}
            className="bg-white rounded-2xl px-5 py-4 border border-slate-100 flex items-center gap-4"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div
              className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}
            >
              <s.icon size={20} className={s.accent} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {s.label}
              </p>
              <p className={`text-[26px] font-black leading-none tabular-nums mt-0.5 ${s.accent}`}>
                {s.val}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CHARTS ROW 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Trend Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-2xl border border-slate-100 p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-desc font-bold text-slate-800">Tren Mingguan</p>
              <p className="text-[11px] text-slate-400 mt-0.5">7 hari terakhir</p>
            </div>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradLate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="present"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#gradPresent)"
                dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="late"
                stroke="#F59E0B"
                strokeWidth={2}
                fill="url(#gradLate)"
                dot={{ fill: '#F59E0B', r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold text-slate-400">Hadir</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-[10px] font-semibold text-slate-400">Telat</span>
            </div>
          </div>
        </motion.div>

        {/* Department Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="bg-white rounded-2xl border border-slate-100 p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-desc font-bold text-slate-800">Kehadiran per Unit</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Persentase hari ini</p>
            </div>
            <PieChart size={18} className="text-indigo-500" />
          </div>
          {data.departmentDistribution.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <RePie>
                  <Pie
                    data={data.departmentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    dataKey="attendance"
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {data.departmentDistribution.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, 'Kehadiran']} />
                </RePie>
              </ResponsiveContainer>
              <div className="flex-1 flex flex-col gap-1.5">
                {data.departmentDistribution.slice(0, 5).map((dept, idx) => (
                  <div key={dept.name} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-[10px] text-slate-500 truncate flex-1">{dept.name}</span>
                    <span className="text-[11px] font-bold text-slate-700 tabular-nums">
                      {dept.attendance}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-[12px] text-slate-400">Tidak ada data departemen</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── CHARTS ROW 2 ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-100 p-5"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-desc font-bold text-slate-800">Perbandingan Kehadiran (7 Hari)</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Hadir vs Telat vs Absen</p>
          </div>
          <BarChart3 size={18} className="text-slate-400" />
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={weeklyData}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            barSize={14}
            barGap={3}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="present" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="late" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── STAT METRICS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Engagement Index',
            val: `${data.engagementIndex}%`,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
          },
          {
            label: 'Ketepatan Waktu',
            val: `${data.punctualityRate}%`,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
          },
          {
            label: 'Lembur Bulan Ini',
            val: `${data.overtimeThisMonth}j`,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 + i * 0.06 }}
            className="bg-white rounded-2xl px-5 py-4 border border-slate-100 flex items-center justify-between"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          >
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className={`text-[28px] font-black leading-none tabular-nums mt-1 ${stat.color}`}>
                {stat.val}
              </p>
            </div>
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <ArrowUpRight size={16} className={stat.color} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
