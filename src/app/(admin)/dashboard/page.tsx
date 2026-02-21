'use client';

import {
  Users, Calendar as CalendarIcon, ChevronDown, Download, ShoppingBag, UserPlus, TrendingUp, Activity, ShieldCheck, Zap, Inbox, Search, Filter, AlertCircle
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useTheme } from '@/context/ThemeContext';
import { StatusBadge } from '@/components/ui/Badge';
import { StatCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { useRouter } from 'next/navigation';

interface PremiumStatCardProps {
  title: string;
  value: string | number;
  gradient?: string;
  icon: any;
  delay?: number;
  onClick?: () => void;
  trend?: string;
}

const PremiumStatCard = ({ title, value, gradient, icon: Icon, delay = 0, onClick, trend }: PremiumStatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -8, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="relative overflow-hidden p-6 rounded-4xl group cursor-pointer border border-white/5 shadow-2xl transition-all duration-500 bg-white/3 backdrop-blur-3xl hover:bg-white/8 hover:border-white/10"
    onClick={onClick}
  >
    {/* Dynamic Background Glow */}
    <div className="absolute -inset-1 bg-linear-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur" />
    
    {/* Vector Signature Overlay */}
    <div className="absolute -top-6 -right-6 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-1000 ease-out text-jne-red pointer-events-none rotate-12">
      <Icon size={160} strokeWidth={0.5} />
    </div>
    
    <div className="relative z-10 space-y-6">
      <div className="flex items-center justify-between">
        <motion.div 
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-2xl shadow-inner shadow-white/5 group-hover:border-jne-red/30"
        >
          <Icon size={24} className="text-jne-red drop-shadow-[0_0_8px_rgba(255,51,102,0.4)]" />
        </motion.div>
        {trend && (
          <div className="px-3.5 py-1.5 rounded-xl bg-jne-red/10 text-[9px] font-black text-jne-red uppercase tracking-[0.2em] border border-jne-red/20 shadow-lg group-hover:bg-jne-red group-hover:text-white transition-all duration-500">
            {trend}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-black tracking-tighter text-white drop-shadow-xl">
            {value}
          </p>
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-jne-red shadow-[0_0_10px_rgba(255,51,102,0.8)]" 
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/30">
          <span>System Load</span>
          <span className="text-jne-red">Protocol Active</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '82%' }}
            transition={{ duration: 2, delay: delay + 0.3, ease: 'easeOut' }}
            className="h-full bg-linear-to-r from-jne-red to-[#ff4d79] rounded-full shadow-[0_0_12px_rgba(255,51,102,0.4)]"
          />
        </div>
      </div>
    </div>
  </motion.div>
);

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { data, weeklyData, loading, error } = useDashboardStats();

  const navigateTo = (path: string) => router.push(path);

  // Derived data for charts
  const pieData = [
    { name: 'Present', value: data?.presentToday || 0 },
    { name: 'Late', value: data?.lateToday || 0 },
    { name: 'On Leave', value: data?.onLeaveToday || 0 },
    { name: 'Absent', value: data?.absentToday || 0 },
  ].filter(item => item.value > 0);

  const calculateEfficiency = () => {
    if (!data || (data.presentToday + data.lateToday) === 0) return 0;
    return Math.round((data.presentToday / (data.presentToday + data.lateToday)) * 100);
  };

  const calculateIntegrity = () => {
    if (!data || data.totalEmployees === 0) return 0;
    return Math.round((data.faceRegisteredCount / data.totalEmployees) * 100);
  };

  const efficiency = calculateEfficiency();
  const integrity = calculateIntegrity();

  if (error) {
    return (
      <AdminLayout key="layout-error" title="Critical Failure" subtitle="Data Sync Protocol Terminated">
        <div key="error-container" className="min-h-[70vh] flex flex-col items-center justify-center p-8">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            className="w-32 h-32 rounded-4xl bg-jne-danger/10 flex items-center justify-center text-jne-danger backdrop-blur-3xl shadow-2xl border border-jne-danger/20 mb-10"
          >
            <AlertCircle size={64} className="drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          </motion.div>
          <div className="text-center space-y-4 max-w-xl mb-12">
            <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">System Link Broken</h3>
            <p className="text-sm font-bold text-white/40 uppercase tracking-[0.4em] leading-relaxed">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary px-12"
          >
            Re-initiate Protocol
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout key="layout-active" title="Command Analytics" subtitle="Unified Operations Command Center">
      <div className="relative pb-24 px-6 lg:px-12 max-w-[1600px] mx-auto">
        {/* Advanced Ambient Architecture */}
        <div className="absolute -top-40 -left-20 w-[800px] h-[800px] bg-jne-red/5 rounded-full blur-[180px] pointer-events-none -z-10 animate-pulse" />
        <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none -z-10 animate-[pulse_8s_infinite]" />

        <div className="relative z-10 space-y-16">
          {/* Dashboard Intelligence Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/5 pb-12"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-orange-500' : 'bg-jne-success'} shadow-[0_0_12px_currentColor] animate-pulse`} />
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
                  {loading ? 'Decrypting Matrix Data...' : 'System Status: Optimal'}
                </span>
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-white">
                Intelligence Core<span className="text-jne-red italic">_</span>
              </h2>
              <p className="text-sm text-white/40 font-bold uppercase tracking-wider max-w-2xl">Visualizing cross-deployment mobility and real-time security synchronization.</p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('/reports')}
                className="btn-secondary flex-1 sm:flex-initial"
              >
                <Download size={18} />
                Export Ledger
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('/reports')}
                className="btn-primary flex-1 sm:flex-initial"
              >
                Tactical Insights
                <Activity size={18} />
              </motion.button>
            </div>
          </motion.div>

          {/* Premium High-Impact Stats Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={`skeleton-${i}`} />)
            ) : (
              <>
                <PremiumStatCard 
                  key="stat-personnel"
                  title="Total Personnel" 
                  value={data?.totalEmployees || 0} 
                  gradient="linear-gradient(135deg, #ff3366 0%, #ff1a53 100%)"
                  icon={Users} 
                  trend={`${data?.faceRegisteredCount} SECURED`}
                  delay={0.1}
                  onClick={() => navigateTo('/employees')}
                />
                <PremiumStatCard 
                  key="stat-deployments"
                  title="Active Signal" 
                  value={data?.presentToday || 0} 
                  gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                  icon={ShieldCheck} 
                  trend={`${data?.lateToday} DELAYS`}
                  delay={0.2}
                  onClick={() => navigateTo('/reports')}
                />
                <PremiumStatCard 
                  key="stat-pending"
                  title="Protocol Queue" 
                  value={data?.pendingLeaves || 0} 
                  gradient="linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)"
                  icon={Inbox} 
                  trend="ACTION REQUIRED"
                  delay={0.3}
                  onClick={() => navigateTo('/leaves')}
                />
                <PremiumStatCard 
                  key="stat-offline"
                  title="Zero Signal" 
                  value={data?.absentToday || 0} 
                  gradient="linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)"
                  icon={Zap} 
                  trend="LOST LINK"
                  delay={0.4}
                  onClick={() => navigateTo('/reports')}
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            {/* Mobility Waveform Visualization */}
            <div className="xl:col-span-2 space-y-12">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-8 rounded-4xl border border-white/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp size={120} />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Mobility Waveform</h3>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">7-Day Operational Velocity</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {['Personnel', 'Deployments'].map((label, i) => (
                      <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-jne-red' : 'bg-indigo-400'}`} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-[360px] w-full">
                  {loading ? (
                    <ChartSkeleton />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyData}>
                        <defs>
                          <linearGradient id="waveRed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff3366" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ff3366" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="waveIndigo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis 
                          dataKey="day" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }} 
                          dy={15}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(2, 6, 23, 0.9)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '24px', 
                            boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
                            padding: '16px 24px',
                            backdropFilter: 'blur(32px)'
                          }} 
                          itemStyle={{ color: 'white', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="present" 
                          stroke="#ff3366" 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill="url(#waveRed)" 
                          animationDuration={2000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.6 }}
                   className="glass-card p-8 rounded-5xl border border-white/5 group"
                 >
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-jne-red">
                        <TrendingUp size={20} />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Efficiency Index</h4>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <span className="text-4xl font-black text-white">{efficiency}%</span>
                        <span className="text-[10px] font-black text-jne-success uppercase tracking-widest">+2.4% vs Last Week</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-jne-success"
                          initial={{ width: 0 }}
                          animate={{ width: `${efficiency}%` }}
                          transition={{ duration: 1.5, delay: 0.8 }}
                        />
                      </div>
                    </div>
                 </motion.div>

                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.7 }}
                   className="glass-card p-8 rounded-5xl border border-white/5 group"
                 >
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-indigo-400">
                        <Activity size={20} />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Data Integrity</h4>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <span className="text-4xl font-black text-white">{integrity}%</span>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Protocol Synchronized</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-indigo-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${integrity}%` }}
                          transition={{ duration: 1.5, delay: 0.9 }}
                        />
                      </div>
                    </div>
                 </motion.div>
              </div>
            </div>

            {/* Tactical Intelligence Column */}
            <div className="space-y-8">
              {loading ? (
                <StatCardSkeleton />
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="glass-card p-8 rounded-4xl border border-white/5 shadow-2xl sticky top-24"
                >
                  <div className="flex items-center gap-5 mb-12">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                      <Zap size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tighter uppercase">Sync Matrix</h3>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Real-time Status Array</p>
                    </div>
                  </div>
                  
                  <div className="h-[300px] w-full relative mb-12">
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            innerRadius={90}
                            outerRadius={120}
                            paddingAngle={10}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={[ '#ff3366', '#d97706', '#6366f1', '#ef4444'][index % 4]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ display: 'none' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">No Active Data Sync</p>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none text-center">
                      <motion.span 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl font-black text-white -tracking-widest drop-shadow-2xl mb-1"
                      >
                        {data?.presentToday ? Math.round((data.presentToday / data.totalEmployees) * 100) : 0}
                      </motion.span>
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Sync Score</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'Personnel', val: data?.presentToday, color: '#ff3366' },
                      { name: 'Late Sync', val: data?.lateToday, color: '#d97706' },
                      { name: 'Protocol Break', val: data?.onLeaveToday, color: '#6366f1' },
                      { name: 'Offline', val: data?.absentToday, color: '#ef4444' }
                    ].map((item, index) => (
                      <motion.div 
                        key={item.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-3xl bg-white/3 border border-white/5 hover:bg-white/8 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ color: item.color, backgroundColor: item.color }} />
                          <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">{item.name}</span>
                        </div>
                        <span className="text-sm font-black text-white">{item.val || 0}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

