'use client';

import {
  Users, UserCheck, UserX, FileText, BarChart3,
  AlertCircle, RefreshCw, CalendarDays, ChevronRight,
  CheckCircle2, AlertTriangle, UserMinus, Clock
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRouter } from 'next/navigation';

// ─── Stat Card ─────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  gradient: string;
  delay?: number;
  onClick?: () => void;
}

const StatCard = ({ title, value, subtitle, icon: Icon, className, delay = 0, onClick }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -5, scale: 1.02 }}
    onClick={onClick}
    className={`dash-stat-card ${className}`}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <div className="relative z-10 w-full flex items-center justify-between">
      <div>
        <p className="dash-stat-label opacity-80 mb-0.5">{title}</p>
        <p className="dash-stat-value leading-none">{value}</p>
        {subtitle && <p className="dash-stat-sub font-bold mt-1.5 opacity-90">{subtitle}</p>}
      </div>
      <div className="dash-stat-icon border-white/5">
        <Icon size={22} strokeWidth={2.5} />
      </div>
    </div>
  </motion.div>
);

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="dash-tooltip">
        <p className="dash-tooltip-label">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center justify-between gap-6">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{p.name}</span>
              <span className="text-[12px] font-black" style={{ color: p.color }}>{p.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { data, weeklyData, loading, error } = useDashboardStats();

  const today = format(new Date(), 'EEEE, dd MMMM yyyy');

  // Attendance status palette - Refined for premium look
  const ATT = {
    present:  '#7C3AED', // Vibrant Purple
    late:     '#E04B3A', // JNE Red
    overtime: '#10B981', // Emerald
    leave:    '#3B82F6', // Blue
    absent:   '#F59E0B', // Amber
    total:    '#F1F5F9',
  };

  const donutData = [
    { name: 'Hadir', value: (data?.presentToday || 0) - (data?.lateToday || 0), color: ATT.present },
    { name: 'Terlambat', value: data?.lateToday || 0, color: ATT.late },
    { name: 'Izin', value: data?.onLeaveToday || 0, color: ATT.leave },
    { name: 'Absen', value: Math.max(0, data?.absentToday || 0), color: ATT.absent },
  ].filter(d => d.value > 0);

  const attendanceRate = data && data.totalEmployees > 0
    ? Math.round((data.presentToday / data.totalEmployees) * 100)
    : 0;

  const faceIntegrity = data && data.totalEmployees > 0
    ? Math.round((data.faceRegisteredCount / data.totalEmployees) * 100)
    : 0;

  const recentActivities = [
    { time: 'Hari Ini', icon: CheckCircle2, color: ATT.present, label: 'Absensi Masuk', sub: `${data?.presentToday || 0} karyawan hadir` },
    { time: 'Hari Ini', icon: AlertTriangle, color: ATT.late,    label: 'Terlambat',     sub: `${data?.lateToday || 0} karyawan terlambat` },
    { time: 'Menunggu', icon: FileText,     color: ATT.leave,   label: 'Permohonan Izin', sub: `${data?.pendingLeaves || 0} permohonan pending` },
    { time: 'Status',   icon: UserMinus,   color: ATT.absent,  label: 'Tidak Hadir',   sub: `${Math.max(0, data?.absentToday || 0)} karyawan absen` },
  ];

  if (error) {
    return (
      <AdminLayout title="Dashboard" subtitle="Ringkasan Operasional">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle size={48} className="text-red-500" />
          <p className="text-gray-600 text-center">{error}</p>
          <button onClick={() => window.location.reload()} className="dash-btn-primary flex items-center gap-2">
            <RefreshCw size={16} /> Coba Lagi
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" subtitle="Ringkasan Operasional">
      <div className="dash-root">

        {/* ── Header Row ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="dash-header-row mb-2"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-jne-red animate-pulse" />
              <span className="text-[10px] font-black text-jne-red uppercase tracking-[0.3em]">Live Matrix</span>
            </div>
            <h2 className="dash-page-title leading-none">Command Center</h2>
            <p className="dash-page-sub mt-2">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/reports')} className="dash-btn-secondary">
              Review Analytics
            </button>
            <button onClick={() => router.push('/employees')} className="dash-btn-primary">
              Personnel Directory
            </button>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="dash-stats-grid">
          <StatCard
            title="HADIR"
            value={loading ? '—' : ((data?.presentToday || 0) - (data?.lateToday || 0))}
            subtitle={data ? `+${Math.round(attendanceRate/10)}% dari kemarin` : 'Loading...'}
            icon={UserCheck}
            className="stat-violet"
            delay={0.05}
            onClick={() => router.push('/reports')}
          />
          <StatCard
            title="TERLAMBAT"
            value={loading ? '—' : (data?.lateToday || 0)}
            subtitle="-3 dari kemarin"
            icon={Clock}
            className="stat-amber"
            delay={0.1}
            onClick={() => router.push('/reports')}
          />
          <StatCard
            title="LEMBUR"
            value={loading ? '—' : (data?.overtimeThisMonth || 0)}
            subtitle="+8 jam bulan ini"
            icon={BarChart3}
            className="stat-cyan"
            delay={0.15}
            onClick={() => router.push('/reports')}
          />
          <StatCard
            title="IZIN/CUTI"
            value={loading ? '—' : (data?.onLeaveToday || 0)}
            subtitle={`${data?.pendingLeaves || 0} permohonan`}
            icon={FileText}
            className="stat-blue"
            delay={0.2}
            onClick={() => router.push('/leaves')}
          />
          <StatCard
            title="ALPHA"
            value={loading ? '—' : Math.max(0, data?.absentToday || 0)}
            subtitle="+2 kasus baru"
            icon={UserX}
            className="stat-coral"
            delay={0.25}
            onClick={() => router.push('/reports')}
          />
          <StatCard
            title="TOTAL KARYAWAN"
            value={loading ? '—' : (data?.totalEmployees || 0)}
            subtitle="4 dept aktif"
            icon={Users}
            className="stat-slate"
            delay={0.3}
            onClick={() => router.push('/employees')}
          />
        </div>

        {/* ── Main Content: Chart + Donut ── */}
        <div className="dash-main-grid">

          {/* Left: Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="dash-card dash-chart-card"
          >
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">Weekly Flux</h3>
                <p className="dash-card-sub">7-Day Attendance Trajectory</p>
              </div>
              <div className="flex items-center gap-5 flex-wrap">
                {[
                  { label: 'Present', color: ATT.present },
                  { label: 'Tardy', color: ATT.late },
                ].map(l => (
                  <div key={l.label} className="dash-legend-item">
                    <span className="dash-legend-dot" style={{ background: l.color, boxShadow: `0 0 10px ${l.color}80` }} />
                    <span>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-chart-numbers">
              <div>
                <p className="dash-big-number">{(data?.presentToday ?? 0) - (data?.lateToday ?? 0)}</p>
                <p className="dash-big-label">Nominal Present</p>
              </div>
              <div className="w-px h-10 bg-white/5 self-center" />
              <div>
                <p className="dash-big-number" style={{ color: ATT.present }}>{attendanceRate}%</p>
                <p className="dash-big-label">Duty Ratio</p>
              </div>
            </div>

            <div style={{ height: 260, width: '100%', padding: '0 1rem' }}>
              {loading ? (
                <div className="dash-skeleton w-full h-full rounded-2xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={ATT.present} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={ATT.present} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gLate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={ATT.late} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={ATT.late} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800 }} 
                      dy={15} 
                    />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="present" 
                      name="Active" 
                      stroke={ATT.present} 
                      strokeWidth={3} 
                      fill="url(#gPresent)" 
                      dot={false} 
                      activeDot={{ r: 6, fill: ATT.present, stroke: '#fff', strokeWidth: 2 }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="late" 
                      name="Tardy" 
                      stroke={ATT.late} 
                      strokeWidth={3} 
                      fill="url(#gLate)" 
                      dot={false} 
                      activeDot={{ r: 6, fill: ATT.late, stroke: '#fff', strokeWidth: 2 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="dash-mini-stats">
              {[
                { label: 'Present',   value: data?.presentToday  || 0,       color: ATT.present  },
                { label: 'Tardy',     value: data?.lateToday     || 0,       color: ATT.late     },
                { label: 'On Leave',  value: data?.onLeaveToday  || 0,       color: ATT.leave    },
                { label: 'Absent',    value: Math.max(0, data?.absentToday || 0), color: ATT.absent   },
              ].map(item => (
                <div key={item.label} className="dash-mini-stat">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                  <div>
                    <p className="dash-mini-value">{item.value}</p>
                    <p className="dash-mini-label">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Donut Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="dash-card"
          >
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">Duty Roster</h3>
                <p className="dash-card-sub">Daily Distribution</p>
              </div>
            </div>

            <div className="dash-donut-wrapper">
              {loading ? (
                <div className="dash-skeleton" style={{ width: 180, height: 180, borderRadius: '50%' }} />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={donutData.length > 0 ? donutData : [{ name: 'Belum ada data', value: 1, color: '#E2E8F0' }]}
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {(donutData.length > 0 ? donutData : [{ name: 'Belum ada data', value: 1, color: '#E2E8F0' }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ display: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="dash-donut-center">
                <p className="dash-donut-pct">{attendanceRate}%</p>
                <p className="dash-donut-pct-label">Kehadiran</p>
              </div>
            </div>

            <div className="dash-donut-legend">
              {[
                { label: 'Hadir',      value: (data?.presentToday || 0) - (data?.lateToday || 0), color: ATT.present  },
                { label: 'Terlambat', value: data?.lateToday     || 0,                            color: ATT.late     },
                { label: 'Izin',      value: data?.onLeaveToday  || 0,                            color: ATT.leave    },
                { label: 'Absen',     value: Math.max(0, data?.absentToday || 0),                 color: ATT.absent   },
              ].map(item => (
                <div key={item.label} className="dash-legend-row">
                  <div className="flex items-center gap-2">
                    <span className="dash-legend-dot" style={{ background: item.color }} />
                    <span className="dash-legend-name">{item.label}</span>
                  </div>
                  <span className="dash-legend-val">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Face integrity */}
            <div className="dash-integrity-box">
              <div className="flex justify-between items-center mb-2">
                <span className="dash-integrity-label">Wajah Terdaftar</span>
                <span className="dash-integrity-pct">{faceIntegrity}%</span>
              </div>
              <div className="dash-progress-track">
                <motion.div
                  className="dash-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${faceIntegrity}%` }}
                  transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                >
                  <div className="dash-progress-glow" />
                </motion.div>
              </div>
              <p className="dash-integrity-sub">
                {data?.faceRegisteredCount || 0} dari {data?.totalEmployees || 0} karyawan
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── Bottom: Recent Activities + Attendance Status ── */}
        <div className="dash-bottom-grid">

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="dash-card"
          >
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">Live Signals</h3>
                <p className="dash-card-sub">Recent System Events</p>
              </div>
            </div>

            <div className="dash-activity-list scrollbar-hide overflow-y-auto max-h-[400px]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="dash-activity-item">
                    <div className="dash-skeleton w-11 h-11 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="dash-skeleton h-3 w-[60%]" />
                      <div className="dash-skeleton h-2.5 w-[40%]" />
                    </div>
                  </div>
                ))
              ) : (
                recentActivities.map((act, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                    className="dash-activity-item"
                  >
                    <div className="dash-activity-icon" style={{ background: act.color + '15', border: `1px solid ${act.color}25` }}>
                      <act.icon size={18} style={{ color: act.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="dash-activity-title">{act.label}</p>
                      <p className="dash-activity-sub">{act.sub}</p>
                    </div>
                    <span className="dash-activity-time">{act.time}</span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Attendance Summary Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="dash-card"
          >
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">Audit Matrix</h3>
                <p className="dash-card-sub">Internal Status Log</p>
              </div>
              <button onClick={() => router.push('/reports')} className="dash-view-all">
                Audit All <ChevronRight size={13} strokeWidth={3} />
              </button>
            </div>

            <div className="dash-att-table flex-1">
              <div className="dash-att-head">
                <span>Domain</span>
                <span className="text-center">Units</span>
                <span className="text-right pr-4">Quota</span>
              </div>
              {[
                { label: 'Active Duty',  val: (data?.presentToday ?? 0) - (data?.lateToday ?? 0), color: ATT.present  },
                { label: 'Arrival Tardy', val: data?.lateToday     || 0,                   color: ATT.late     },
                { label: 'Monthly OT',   val: data?.overtimeThisMonth || 0,                color: ATT.overtime },
                { label: 'Leave Units',  val: data?.onLeaveToday  || 0,                color: ATT.leave    },
                { label: 'Zero Duty',    val: Math.max(0, data?.absentToday || 0),         color: ATT.absent   },
              ].map((row, i) => {
                const pct = data?.totalEmployees ? Math.round((row.val / data.totalEmployees) * 100) : 0;
                return (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                    className="dash-att-row"
                  >
                    <span className="dash-att-label">{row.label}</span>
                    <span className="dash-att-val">{loading ? <div className="dash-skeleton h-4 w-8 mx-auto" /> : row.val}</span>
                    <div className="dash-att-pct-col">
                      <div className="dash-mini-track">
                        <motion.div
                          className="dash-mini-fill"
                          style={{ background: row.color, boxShadow: `0 0 8px ${row.color}40` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.9 + i * 0.05 }}
                        />
                      </div>
                      <span className="dash-att-pct-lbl">{pct}%</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="dash-summary-bar">
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-jne-red" />
                <span className="dash-summary-text">Operational Sync</span>
              </div>
              <span className="dash-summary-value text-white font-black">
                {(data?.presentToday || 0) + (data?.onLeaveToday || 0)} <span className="text-white/20">/</span> {data?.totalEmployees || 0}
              </span>
            </div>
          </motion.div>
        </div>

      </div>
    </AdminLayout>
  );
}