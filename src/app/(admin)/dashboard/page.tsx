'use client';

import {
  Users, UserCheck, UserX, FileText, BarChart3,
  AlertCircle, RefreshCw, CalendarDays, ChevronRight,
  CheckCircle2, AlertTriangle, UserMinus, Clock,
  ArrowUpRight, Activity, Zap, Target
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

// ─── Stat Card (Bento Style) ─────────────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon: Icon, className, delay = 0, onClick }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -6, scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`dash-stat-card glass-card glass-highlight ${className} group relative overflow-hidden`}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    {/* Decorative inner glow */}
    <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    
    <div className="relative z-10 w-full">
      <div className="flex items-start justify-between mb-5">
        <div className="dash-stat-icon group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-black/5 border-white/40">
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/40 border border-white/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
          <span className="text-[9px] font-black text-gray-900 tracking-tighter uppercase">Query</span>
          <ArrowUpRight size={10} className="text-gray-900" />
        </div>
      </div>
      <div>
        <p className="dash-stat-label font-black text-gray-400 uppercase tracking-[0.2em] mb-1 group-hover:text-gray-500 transition-colors">{title}</p>
        <div className="flex items-baseline gap-2.5 mt-1.5">
          <p className="dash-stat-value text-4xl font-black text-gray-900 tracking-tighter leading-none">{value}</p>
          {subtitle && (
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50/80 border border-emerald-100/50 px-2 py-0.5 rounded-full uppercase tracking-widest">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="dash-tooltip border-stone-100 shadow-2xl">
        <p className="dash-tooltip-label border-stone-50 text-stone-400">{label}</p>
        <div className="space-y-2">
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{p.name}</span>
              </div>
              <span className="text-[13px] font-black text-stone-900">{p.value}</span>
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

  // Attendance status palette - Modern Emerald
  const ATT = {
    present:  '#10B981', // Emerald 500
    late:     '#F59E0B', // Amber 500
    overtime: '#06B6D4', // Cyan 500
    leave:    '#3B82F6', // Blue 500
    absent:   '#EF4444', // Red 500
    grid:     '#F5F5F4', // Stone 100
    tick:     '#A8A29E', // Stone 400
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

  if (error) {
    return (
      <AdminLayout title="Dashboard" subtitle="Ringkasan Operasional">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle size={48} className="text-red-500" />
          <p className="text-stone-600 font-bold">{error}</p>
          <button onClick={() => window.location.reload()} className="dash-btn-primary">
            <RefreshCw size={16} /> REKONEKSI SISTEM
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" subtitle="Unit Operasional">
      <div className="dash-root max-w-[1400px]">
        
        {/* ── BENTO HEADER ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-8">
          
          {/* Main Hero Card (Personnel Pulse) - 8 Cols */}
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 glass-card bg-stone-900 border-stone-800 p-8 flex flex-col justify-between min-h-[380px] relative overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.2)]"
          >
            {/* Background Decorative Patterns */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-emerald-500/20 transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/5 rounded-full blur-[100px] -ml-40 -mb-40" />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Operational Status / Live</span>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2.5 backdrop-blur-md">
                   <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Node: MTP-01</span>
                </div>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-5 uppercase italic leading-[0.9]">
                Personnel <br /><span className="text-emerald-500">Pulse.</span>
              </h1>
              <p className="text-stone-400 text-[15px] max-w-lg font-medium leading-relaxed mb-8 opacity-80">
                Advanced monitoring of real-time presence, attendance trajectory, and operational integrity across the JNE Martapura logistics network.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-end justify-between gap-8 pt-8 border-t border-white/5">
              <div className="flex gap-16">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring' }}>
                  <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] mb-3">Live Presence</p>
                  <p className="text-5xl font-black text-white tracking-tighter flex items-baseline gap-2">
                    {loading ? '—' : data?.presentToday || 0}
                    <span className="text-sm font-black text-emerald-500 uppercase tracking-widest opacity-60">Units</span>
                  </p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring' }}>
                  <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] mb-3">Core Efficiency</p>
                  <p className="text-5xl font-black text-white tracking-tighter">
                    {loading ? '—' : attendanceRate}<span className="text-2xl opacity-40">%</span>
                  </p>
                </motion.div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/employees')}
                className="px-10 py-5 rounded-2xl bg-white text-stone-900 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all shadow-2xl shadow-black/20"
              >
                Access Workforce
              </motion.button>
            </div>
          </motion.div>

          {/* Side Context Card (Live Context) - 4 Cols */}
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            whileHover={{ scale: 1.01 }}
            className="lg:col-span-4 glass-card border-none bg-emerald-600 p-8 text-white flex flex-col justify-between shadow-[0_40px_100px_rgba(5,150,105,0.2)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20"
                >
                  <Activity size={28} />
                </motion.div>
                <Zap size={22} className="text-white/40 animate-pulse" />
              </div>
              <p className="text-[11px] font-black text-emerald-100 uppercase tracking-[0.4em] mb-3">System Frequency</p>
              <h3 className="text-3xl font-black leading-[1.1] tracking-tight mb-5 uppercase italic">
                Operational <br />Window Open.
              </h3>
              <div className="flex items-center gap-3 py-2 px-4 rounded-xl bg-black/10 border border-white/10 w-fit">
                <CalendarDays size={14} className="text-emerald-200" />
                <p className="text-emerald-50 text-[12px] font-black uppercase tracking-widest">{today}</p>
              </div>
            </div>
            
            <div className="relative z-10 bg-black/20 p-5 rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="flex justify-between items-end mb-4">
                <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.3em]">Network Sync</p>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">OK · 85%</p>
              </div>
              <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div 
                  className="h-full bg-linear-to-r from-emerald-400 to-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 2, delay: 0.5, ease: 'circOut' }}
                />
              </div>
            </div>
          </motion.div>

        </section>

        {/* ── STATS ROW ── */}
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Hadir"
            value={loading ? '—' : (data?.presentToday || 0) - (data?.lateToday || 0)}
            subtitle="Stable"
            icon={UserCheck}
            className="stat-emerald"
            delay={0.2}
            onClick={() => router.push('/reports')}
          />
          <StatCard
            title="Terlambat"
            value={loading ? '—' : (data?.lateToday || 0)}
            subtitle="-2 Trend"
            icon={Clock}
            className="stat-amber"
            delay={0.25}
            onClick={() => router.push('/reports')}
          />
          <StatCard
            title="Lembur"
            value={loading ? '—' : (data?.overtimeThisMonth || 0)}
            subtitle="Total Units"
            icon={Target}
            className="stat-cyan"
            delay={0.3}
            onClick={() => router.push('/reports')}
          />
          <StatCard
            title="Izin"
            value={loading ? '—' : (data?.onLeaveToday || 0)}
            subtitle="Registered"
            icon={FileText}
            className="stat-blue"
            delay={0.35}
            onClick={() => router.push('/leaves')}
          />
          <StatCard
            title="Absen"
            value={loading ? '—' : Math.max(0, data?.absentToday || 0)}
            subtitle="Alert"
            icon={UserX}
            className="stat-coral"
            delay={0.4}
            onClick={() => router.push('/reports')}
          />
          <StatCard
            title="Karyawan"
            value={loading ? '—' : (data?.totalEmployees || 0)}
            subtitle="Directory"
            icon={Users}
            className="stat-slate"
            delay={0.45}
            onClick={() => router.push('/employees')}
          />
        </section>

        {/* ── BENTO ANALYTICS ── */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Chart Section - 8 Cols */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="xl:col-span-8 dash-card p-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <div>
                <h3 className="text-2xl font-black text-stone-900 tracking-tighter uppercase">Weekly Trajectory</h3>
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-1">7-Day Attendance Flow</p>
              </div>
              <div className="flex items-center gap-6 border-l border-stone-100 pl-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-stone-600 uppercase tracking-tighter">On-Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-black text-stone-600 uppercase tracking-tighter">Tardy</span>
                </div>
              </div>
            </div>

            <div style={{ height: 320, width: '100%' }}>
              {loading ? (
                <div className="dash-skeleton w-full h-full rounded-2xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={ATT.present} stopOpacity={0.15}/>
                        <stop offset="95%" stopColor={ATT.present} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke={ATT.grid} />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: ATT.tick, fontSize: 10, fontWeight: 900 }} 
                      dy={15}
                    />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="present" 
                      stroke={ATT.present} 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorPresent)" 
                      activeDot={{ r: 8, stroke: '#fff', strokeWidth: 3, fill: ATT.present }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="late" 
                      stroke={ATT.late} 
                      strokeWidth={3} 
                      strokeDasharray="8 8"
                      fill="none" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-12 pt-8 border-t border-stone-100">
              {[
                { label: 'Avg Presence', value: '94%',   icon: UserCheck, color: 'text-emerald-600' },
                { label: 'Tardy Rate',   value: '2.4%',  icon: Clock,     color: 'text-amber-600' },
                { label: 'Integrity',    value: '99.1%', icon: Target,    color: 'text-cyan-600' },
                { label: 'System HP',    value: 'Stable', icon: Activity,  color: 'text-stone-900' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">{item.label}</p>
                  <div className="flex items-center gap-2">
                    <item.icon size={14} className={item.color} />
                    <span className="text-xl font-black text-stone-900 tracking-tighter">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Distribution Section - 4 Cols */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="xl:col-span-4 dash-card p-8 flex flex-col"
          >
            <div className="mb-10">
              <h3 className="text-lg font-black text-stone-900 tracking-tighter uppercase">Distribution</h3>
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-1">Cross-Personnel Allocation</p>
            </div>

            <div className="flex-1 flex flex-col justify-center min-h-[260px] relative">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={donutData.length > 0 ? donutData : [{ value: 1, color: '#F5F5F4' }]}
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ display: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-4xl font-black text-stone-900 tracking-tighter">{attendanceRate}%</p>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Global Presence</p>
              </div>
            </div>

            <div className="space-y-3 mt-8">
              {[
                { label: 'On-Time',  value: (data?.presentToday || 0) - (data?.lateToday || 0), color: ATT.present },
                { label: 'Late',     value: data?.lateToday || 0, color: ATT.late },
                { label: 'Absence',  value: Math.max(0, data?.absentToday || 0), color: ATT.absent },
              ].map(item => (
                <div key={item.label} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between group hover:bg-white transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-4 rounded-full" style={{ background: item.color }} />
                    <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">{item.label}</span>
                  </div>
                  <span className="text-sm font-black text-stone-900 group-hover:scale-110 transition-transform">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </section>

      </div>
    </AdminLayout>
  );
}