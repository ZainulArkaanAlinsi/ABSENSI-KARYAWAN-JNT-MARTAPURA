'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { DEPARTMENT_RULES } from '@/lib/departmentRules';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Target,
  Moon,
  Home,
  ChevronRight,
  Info,
  ShieldCheck,
} from 'lucide-react';

// Department icon mapping
function DeptIcon({ rule }: { rule: typeof DEPARTMENT_RULES[0] }) {
  if (rule.checkOutNextDay) return <Moon size={22} />;
  if (rule.trackFromHome)   return <Home size={22} />;
  if (rule.targetBased)     return <Target size={22} />;
  return <Clock size={22} />;
}

function RuleBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-black/10 px-3 py-2 transition-all hover:bg-black/20 group/badge">
      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 leading-none group-hover/badge:text-white/50 transition-colors">
        {label}
      </span>
      <span className="text-[11px] font-black text-white/90 leading-tight tracking-tight">{value}</span>
    </div>
  );
}

export default function AttendancePage() {
  const router = useRouter();

  return (
    <AdminLayout title="Attendance Control" subtitle="Rule Deployment & Ops">
      <div className="dash-root">
        {/* ── Info Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-xl border border-[#E31E24]/20 bg-red-50 p-6 backdrop-blur-3xl mb-8 group"
        >
          <div className="absolute inset-0 bg-linear-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="flex items-start gap-5 relative z-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E31E24]/10 border border-[#E31E24]/20 shadow-sm">
              <ShieldCheck size={22} className="text-[#E31E24]" />
            </div>
            <div>
              <p className="text-[15px] font-black text-slate-900 uppercase tracking-widest italic leading-none mb-1.5">Dynamic Rule Engine Active</p>
              <p className="text-[13px] leading-relaxed text-slate-600 font-medium max-w-2xl">
                Precision-engineered schedules for logistics and field operations. Each department 
                is governed by unique entry thresholds, late-tolerances, and geofencing paradigms.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Department Grid ── */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-12">
          {DEPARTMENT_RULES.map((rule, idx) => (
            <motion.button
              key={rule.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/head-units/${rule.id}`)}
              className={`group glass-card glass-highlight p-0 overflow-hidden text-left transition-all relative ${
                `stagger-${(idx % 6) + 1}`
              }`}
              style={{ 
                borderRadius: '0.75rem',
                background: `linear-gradient(135deg, ${rule.color}15 0%, ${rule.color}05 100%)`, 
                borderColor: `${rule.color}20`,
                boxShadow: `0 8px 30px -10px ${rule.color}10`
              }}
            >
              {/* Decorative Glow */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 transition-opacity group-hover:opacity-40" 
                style={{ background: rule.color }}
              />
              
              <div className="p-6 flex flex-col h-full relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-sm border border-slate-100 bg-white"
                  >
                    <span style={{ color: rule.color }} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                      <DeptIcon rule={rule} />
                    </span>
                  </div>
                  <div 
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-white/10 backdrop-blur-md border border-white/10"
                    style={{ color: rule.color }}
                  >
                    <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: rule.color }} />
                    Active Node
                  </div>
                </div>

                <div className="mb-6 flex-1">
                  <h3 className="text-[18px] font-black text-slate-900 leading-tight uppercase tracking-tighter italic mb-2 group-hover:translate-x-1 transition-transform">{rule.name}</h3>
                  <p className="text-[12px] leading-relaxed text-slate-500 font-bold line-clamp-2">
                    {rule.description}
                  </p>
                </div>

                {/* Rule Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <RuleBadge label="Shift Start" value={rule.checkInTime} />
                  <RuleBadge
                    label="End Window"
                    value={rule.checkOutNextDay ? `${rule.checkOutTime} (+1)` : rule.checkOutTime}
                  />
                  <RuleBadge label="Grace Period" value={`${rule.toleranceMinutes}m`} />
                  <RuleBadge
                    label="Environment"
                    value={rule.checkOutNextDay ? 'NIGHT' : rule.trackFromHome ? 'REMOTE' : rule.targetBased ? 'TARGET' : 'STATION'}
                  />
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-auto">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Ops Deployment</span>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 group-hover:text-[#E31E24] transition-all">
                    LOGS <ChevronRight size={14} strokeWidth={3} className="group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
