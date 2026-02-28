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
    <div className="flex flex-col gap-0.5 rounded-lg border border-white/5 bg-white/2 px-2.5 py-1.5 transition-colors hover:bg-white/4">
      <span className="text-[8px] font-black uppercase tracking-widest text-white/30 leading-none">
        {label}
      </span>
      <span className="text-[10px] font-bold text-white/80 leading-tight">{value}</span>
    </div>
  );
}

export default function AttendancePage() {
  const router = useRouter();

  return (
    <AdminLayout title="Attendance" subtitle="Operations">
      <div className="dash-root">
        {/* ── Info Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-4 backdrop-blur-xl mb-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 shadow-glow">
              <ShieldCheck size={18} className="text-primary/70" />
            </div>
            <div>
              <p className="text-[13px] font-black text-white uppercase tracking-wider">Dynamic Rule Engine Active</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-slate-400">
                Precision-engineered schedules for logistics and field operations. Each department 
                is governed by unique entry thresholds and geofencing rules.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Department Grid ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DEPARTMENT_RULES.map((rule, idx) => (
            <motion.button
              key={rule.name}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                router.push(
                  `/attendance/${encodeURIComponent(rule.name.toLowerCase().replace(/[\s/()]+/g, '-'))}`,
                )
              }
              className="group dash-card p-0 overflow-hidden text-left transition-all border-white/5 active:scale-95"
              style={{ 
                borderRadius: '1.25rem',
                background: `${rule.color}08`,
                border: `0.5px solid ${rule.color}15`
              }}
            >

              
              <div className="p-4 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{ 
                      background: `${rule.color}10`, 
                      border: `0.5px solid ${rule.color}25`,
                      boxShadow: `0 4px 12px ${rule.color}08` 
                    }}
                  >
                    <span style={{ color: rule.color }}>
                      <DeptIcon rule={rule} />
                    </span>
                  </div>
                  <div 
                    className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider h-fit"
                    style={{ background: `${rule.color}10`, color: rule.color, border: `0.5px solid ${rule.color}20` }}
                  >
                    Active Pool
                  </div>
                </div>

                {/* Body */}
                <div className="mb-4 flex-1">
                  <h3 className="text-[15px] font-black text-white leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">{rule.name}</h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 font-medium line-clamp-2">
                    {rule.description}
                  </p>
                </div>

                {/* Rule Grid */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <RuleBadge label="Shift Entry" value={rule.checkInTime} />
                  <RuleBadge
                    label="End Threshold"
                    value={rule.checkOutNextDay ? `${rule.checkOutTime} (+1)` : rule.checkOutTime}
                  />
                  <RuleBadge label="Tolerance" value={`${rule.toleranceMinutes}m`} />
                  <RuleBadge
                    label="Paradigm"
                    value={rule.checkOutNextDay ? 'Night' : rule.trackFromHome ? 'Home' : rule.targetBased ? 'Target' : 'Office'}
                  />
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                  <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.2em]">Deployment System</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-white group-hover:text-primary transition-all">
                    LOG DATA <ChevronRight size={12} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
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
