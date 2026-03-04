'use client';

import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Activity, 
  Target, 
  Zap, 
  ShieldCheck, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Cpu,
  Fingerprint,
  Globe,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

// --- Utility Components for "Cool" UI ---

const CountUp = ({ value, duration = 1.5 }: { value: number; duration?: number }) => {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration }}
    >
      {value}
    </motion.span>
  );
};

const NeuralLine = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
    <div className="absolute top-0 left-1/4 w-px h-full bg-linear-to-b from-transparent via-primary/50 to-transparent blur-[1px] animate-pulse" />
    <div className="absolute top-0 right-1/3 w-px h-full bg-linear-to-b from-transparent via-primary/30 to-transparent blur-[1px] animate-pulse delay-700" />
  </div>
);

export default function AnalyticsPage() {
  const { data, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <AdminLayout title="Intelligence Matrix" subtitle="Calibrating Neural Sync...">
        <div className="flex justify-center py-24">
          <PageLoader />
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout title="System Override" subtitle="Matrix Link Severed">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-6 rounded-4xl bg-red-500/10 border border-red-500/20 mb-6 relative group overflow-hidden">
            <div className="absolute inset-0 bg-red-500/5 blur-xl group-hover:bg-red-500/20 transition-all" />
            <Activity size={64} className="text-red-500 relative animate-pulse" />
          </div>
          <p className="text-white/40 font-black uppercase tracking-[0.3em] text-sm">Synchronized matrix failed</p>
          <p className="text-[#E04B3A] text-xs font-bold mt-2 uppercase tracking-widest">{error || 'Unknown Protocol Error'}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Intelligence Hub" 
      subtitle="JNE System Version 3.0 Operational Matrix"
    >
      <div className="space-y-8 relative pb-12">
        <NeuralLine />

        {/* --- Top Global Indicators --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Biometric Integrity', value: `${data.faceRegisteredCount}`, sub: `OF ${data.totalEmployees} PERSONNEL`, icon: Fingerprint, color: 'text-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]' },
            { label: 'Aggregate Yield', value: `${data.overtimeThisMonth}`, sub: 'MONTHLY OVERTIME HOURS', icon: Zap, color: 'text-[#E04B3A]', glow: 'shadow-[0_0_20px_rgba(224,75,58,0.1)]' },
            { label: 'Strategic Engagement', value: `${data.engagementIndex}%`, sub: 'PERSONNEL RETENTION INDEX', icon: Globe, color: 'text-blue-500', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]' },
            { label: 'Neural Stability', value: 'NOMINAL', sub: 'MATRIX OPERATIONAL STATUS', icon: Cpu, color: 'text-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]' }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
              className={`relative rounded-4xl border border-white/5 bg-white/2 p-7 backdrop-blur-xl group hover:border-primary/20 transition-all cursor-crosshair overflow-hidden ${stat.glow}`}
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{stat.label}</span>
                <div className={`p-2 rounded-xl bg-white/3 border border-white/5 ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
              </div>
              <p className="text-4xl font-black text-white tracking-tighter mb-2">
                <CountUp value={parseInt(stat.value) || 0} />
                {stat.value.includes('%') && '%'}
                {stat.value === 'NOMINAL' && <span className="text-2xl">NOMINAL</span>}
              </p>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{stat.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Main Analytics Matrix --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Attendance Flow Flow Chart */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-2 rounded-[2.5rem] border border-white/5 bg-white/3 p-8 relative overflow-hidden backdrop-blur-md"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <TrendingUp size={120} className="text-primary" />
            </div>
            
            <div className="flex items-center justify-between mb-12 relative z-10">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-[0.2em]">Attendance Velocity</h3>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.4em] mt-2">Transactional Neural Flow • 7-Day Cycle</p>
              </div>
              <div className="flex gap-6 items-center bg-white/3 border border-white/5 px-4 py-2 rounded-2xl">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#E04B3A]" />
                   <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Active</span>
                 </div>
                 <div className="h-4 w-px bg-white/5" />
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-white/10" />
                   <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Inert</span>
                 </div>
              </div>
            </div>

            <div className="h-72 flex items-end justify-between gap-6 px-4 relative z-10">
              {data.weeklyTrends.map((d, i) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="w-full relative flex flex-col items-center h-full justify-end">
                    {/* Background Bar */}
                    <div className="w-full bg-white/2 rounded-full absolute bottom-0 h-full border border-white/2" />
                    
                    {/* Active Deployment Bar */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.present / (data.totalEmployees || 1)) * 100}%` }}
                      transition={{ delay: 0.6 + i * 0.08, type: 'spring', damping: 20 }}
                      className="w-full bg-linear-to-t from-primary/80 via-primary to-primary rounded-full shadow-[0_0_20px_rgba(224,75,58,0.15)] z-10 relative group-hover:brightness-125 transition-all"
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                      
                      {/* Floating Marker */}
                      <div className="absolute -top-1 w-full flex justify-center">
                         <div className="w-1.5 h-1.5 rounded-full bg-white shadow-white" />
                      </div>
                    </motion.div>
                    
                    {/* Enhanced Tooltip */}
                    <motion.div 
                      className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 bg-[#0D1B35] border border-primary/30 px-3 py-2 rounded-2xl text-[10px] font-black text-white z-50 whitespace-nowrap shadow-2xl backdrop-blur-xl"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Activity size={10} className="text-primary" />
                        <span>{d.present} SIGNALS</span>
                      </div>
                      <div className="text-white/40 uppercase tracking-widest text-[8px]">Efficiency: {Math.round((d.present / data.totalEmployees) * 100)}%</div>
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] group-hover:text-primary transition-colors">{d.day}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Strategic Metrics Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-6"
          >
            <div className="rounded-[2.5rem] border border-white/5 bg-white/3 p-8 flex-1 relative overflow-hidden backdrop-blur-md">
              <div className="absolute bottom-0 right-0 p-8 opacity-5">
                 <ShieldCheck size={140} className="text-white" />
              </div>
              
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                <Target size={16} className="text-primary" />
                Operational Index
              </h3>
              
              <div className="space-y-10 relative z-10">
                {[
                  { label: 'System Punctuality', percent: data.punctualityRate, color: 'bg-primary', glow: 'shadow-[0_0_15px_rgba(224,75,58,0.3)]', sub: 'Non-tardy resolution rate' },
                  { label: 'Neural Engagement', percent: data.engagementIndex, color: 'bg-blue-600', glow: 'shadow-[0_0_15px_rgba(37,99,235,0.3)]', sub: 'Unique personnel involvement' },
                  { label: 'Deployment Stability', percent: 94, color: 'bg-emerald-600', glow: 'shadow-[0_0_15px_rgba(5,150,105,0.3)]', sub: 'Calculated system uptime' },
                ].map((item, i) => (
                  <div key={item.label} className="group">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block">{item.label}</span>
                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">{item.sub}</span>
                      </div>
                      <div className="text-xl font-black text-white tabular-nums">{item.percent}%</div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-px">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percent}%` }}
                        transition={{ delay: 1 + i * 0.1, duration: 2, type: 'spring' }}
                        className={`h-full rounded-full ${item.color} ${item.glow} group-hover:brightness-125 transition-all`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-5 rounded-3xl bg-linear-to-br from-primary/10 to-transparent border border-primary/20 relative group hover:from-primary/15 transition-all">
                <div className="absolute top-3 right-3">
                   <AlertCircle size={14} className="text-primary animate-pulse" />
                </div>
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-2">Matrix Advisory</p>
                <p className="text-[11px] text-white/60 font-medium leading-relaxed italic">
                  "Integritas biometrik mencapai {(data.faceRegisteredCount / data.totalEmployees * 100).toFixed(1)}%. Stabilitas operasional unit Rider Delivery memerlukan sinkronisasi ulang jadwal."
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- Department Distribution Radar --- */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-[3rem] border border-white/5 bg-white/2 overflow-hidden backdrop-blur-xl relative"
        >
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="px-10 py-8 border-b border-white/5 bg-white/1 flex items-center justify-between">
            <div>
              <h3 className="text-md font-black text-white uppercase tracking-[0.2em] leading-none">Regional Deployment Hub</h3>
              <p className="text-[10px] text-white/30 mt-3 uppercase font-black tracking-[0.4em]">Integrated Intelligence Matrix • v4.2 Protocol</p>
            </div>
            <div className="flex gap-4">
               <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/3 border border-white/5 text-[10px] font-black text-white/60 uppercase tracking-widest hover:text-white hover:border-primary/30 transition-all group">
                 <PieChart size={16} className="group-hover:text-primary transition-colors" />
                 View Strategic Map
               </button>
            </div>
          </div>
          
          <div className="p-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-10">
            {data.departmentDistribution.map((dept, i) => (
              <div key={dept.name} className="flex flex-col items-center gap-6 group cursor-pointer">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Outer Ring */}
                  <div className="absolute inset-0 rounded-full border border-white/5 group-hover:border-primary/20 transition-all scale-110" />
                  
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="56" cy="56" r="48" 
                      fill="transparent" 
                      stroke="currentColor" 
                      strokeWidth="6"
                      className="text-white/5"
                    />
                    <motion.circle 
                      cx="56" cy="56" r="48" 
                      fill="transparent" 
                      stroke="currentColor" 
                      strokeWidth="6"
                      strokeDasharray={301.6}
                      initial={{ strokeDashoffset: 301.6 }}
                      animate={{ strokeDashoffset: 301.6 - (301.6 * (dept.attendance / 100)) }}
                      transition={{ delay: 1.2 + i * 0.1, duration: 2, type: 'spring' }}
                      className="text-primary group-hover:text-white transition-colors"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/0 group-hover:bg-primary/5 rounded-full transition-all">
                    <span className="text-xl font-black text-white tabular-nums">{dept.attendance}%</span>
                    <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">Ready</span>
                  </div>
                </div>
                <div className="text-center">
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-white transition-colors block mb-1">
                     {dept.name.replace(/_/g, ' ')}
                   </span>
                   <div className="w-4 h-px bg-white/10 group-hover:w-full group-hover:bg-primary transition-all mx-auto" />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Metrics */}
          <div className="px-10 py-6 border-t border-white/5 bg-white/2 flex justify-between items-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-1/4 h-full bg-linear-to-l from-primary/5 to-transparent blur-2xl" />
             
             <div className="flex items-center gap-10 relative z-10">
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-xl bg-white/3 flex items-center justify-center border border-white/5 text-white/40 group-hover:text-primary transition-colors">
                    <Users size={14} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] block mb-0.5">Active Entities</span>
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">{data.totalEmployees} PERSONNEL</span>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-white/5" />
                
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-xl bg-white/3 flex items-center justify-center border border-white/5 text-white/40 group-hover:text-amber-500 transition-colors">
                    <Clock size={14} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] block mb-0.5">Temporal Update</span>
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">{new Date().toLocaleTimeString()} LST</span>
                  </div>
                </div>
             </div>
             
             <div className="flex flex-col items-end relative z-10">
                <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em] mb-1">Integrated Intelligence v4.2</p>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Neural Link: SECURE • AES-256</span>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
