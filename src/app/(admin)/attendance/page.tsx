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
    <div 
      className="flex flex-col gap-1.5 rounded-2xl border px-4 py-3.5 transition-all group/badge"
      style={{ 
        background: 'var(--bg-input)', 
        borderColor: 'var(--border-primary)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
      }}
    >
      <span className="text-[10px] font-black uppercase tracking-widest leading-none" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className="text-[13px] font-black leading-tight tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</span>
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
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ y: 2, scale: 0.99 }}
              onClick={() => router.push(`/head-units/${rule.id}`)}
              className={`group p-0 overflow-hidden text-left transition-all relative border`}
              style={{ 
                borderRadius: '1.5rem',
                background: 'var(--bg-card)', 
                borderColor: 'var(--border-primary)',
                boxShadow: `0 15px 35px -10px ${rule.color}20, inset 0 2px 0 rgba(255, 255, 255, 0.4)`
              }}
            >
              {/* Decorative Glow */}
              <div 
                className="absolute top-0 right-0 w-40 h-40 blur-[70px] opacity-10 transition-opacity group-hover:opacity-20" 
                style={{ background: rule.color }}
              />
              
              <div className="p-7 flex flex-col h-full relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-md border"
                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
                  >
                    <span style={{ color: rule.color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                      <DeptIcon rule={rule} />
                    </span>
                  </div>
                  <div 
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border"
                    style={{ color: rule.color, background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: rule.color, boxShadow: `0 0 8px ${rule.color}` }} />
                    Active Node
                  </div>
                </div>

                <div className="mb-8 flex-1">
                  <h3 className="text-[20px] font-black leading-tight uppercase tracking-tighter italic mb-2 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--text-primary)' }}>{rule.name}</h3>
                  <p className="text-[13px] leading-relaxed font-bold line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {rule.description}
                  </p>
                </div>

                {/* Rule Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
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
                <div className="flex items-center justify-between pt-5 border-t mt-auto" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Ops Deployment</span>
                  <div className="flex items-center gap-2 text-[11px] font-black transition-all" style={{ color: 'var(--text-primary)' }}>
                    <span className="group-hover:text-[#E31E24] transition-colors">LOGS</span> 
                    <ChevronRight size={14} strokeWidth={3} className="group-hover:translate-x-1.5 group-hover:text-[#E31E24] transition-all" />
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
