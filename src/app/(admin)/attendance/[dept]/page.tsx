'use client';

import { useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { DEPARTMENT_RULES, fmtMinutes, calcEffectiveMinutes } from '@/lib/departmentRules';
import { subscribeToTodayAttendance } from '@/lib/firestore';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Target,
  Home,
  Moon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ArrowLeft,
  User,
  History,
  Activity,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { AttendanceRecord } from '@/types';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    present:  { label: 'Present',  color: 'var(--att-present)', bg: 'rgba(67, 56, 202, 0.12)' },
    late:     { label: 'Late',     color: 'var(--att-late)',    bg: 'rgba(217, 119, 6, 0.12)' },
    absent:   { label: 'Absent',   color: 'var(--att-absent)',  bg: 'rgba(190, 18, 60, 0.12)' },
    leave:    { label: 'Leave',    color: 'var(--att-leave)',   bg: 'rgba(71, 82, 105, 0.12)' },
    overtime: { label: 'Overtime', color: 'var(--att-overtime)',bg: 'rgba(13, 148, 136, 0.12)' },
    holiday:  { label: 'Holiday',  color: 'var(--text-dim)',    bg: 'rgba(148, 163, 184, 0.12)' },
  };
  const s = map[status] || map.absent;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border border-white/5"
      style={{ background: s.bg, color: s.color, borderColor: `${s.color}20` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

export default function DepartmentAttendancePage() {
  const params = useParams<{ dept: string }>();
  const router = useRouter();
  const deptSlug = params?.dept ?? '';

  // Find rule
  const rule = DEPARTMENT_RULES.find((r) =>
    r.name.toLowerCase().replace(/[\s/()]+/g, '-') === deptSlug,
  );

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rule) return;
    setLoading(true);
    const unsub = subscribeToTodayAttendance(todayStr, (all) => {
      const filtered = all.filter((r) => r.department === rule.name);
      setRecords(filtered);
      setLoading(false);
    });
    return () => unsub();
  }, [rule, todayStr]);

  if (!rule) {
    return (
      <AdminLayout title="System" subtitle="Error">
        <div className="flex flex-col items-center gap-6 py-32 text-center">
          <div className="h-20 w-20 rounded-3xl bg-jne-red/10 border border-jne-red/20 flex items-center justify-center">
            <XCircle size={40} className="text-jne-red" />
          </div>
          <div>
            <p className="text-xl font-black text-white uppercase tracking-tighter">Sector Not Found</p>
            <p className="text-slate-500 text-sm mt-3">The requested operational domain does not exist in the matrix.</p>
          </div>
          <button
            onClick={() => router.push('/attendance')}
            className="dash-btn-primary"
          >
            Return to Hub
          </button>
        </div>
      </AdminLayout>
    );
  }

  const totalPresent  = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  const totalLate     = records.filter((r) => r.status === 'late').length;
  const totalAbsent   = records.filter((r) => r.status === 'absent').length;
  const totalLeave    = records.filter((r) => r.status === 'leave').length;

  return (
    <AdminLayout title={rule.name} subtitle="Attendance Domain">
      <div className="dash-root px-1 sm:px-2">
        {/* ── Breadcrumb & Navigation ── */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => router.push('/attendance')}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <span>Matrix</span>
            <span className="text-white/20">/</span>
            <span className="text-primary">{rule.name}</span>
          </div>
        </div>

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Operational Scan</span>
            </div>
            <h2 className="dash-page-title leading-none">{rule.name} Domain</h2>
            <p className="dash-page-sub mt-2">{format(new Date(), 'EEEE, dd MMMM yyyy', { locale: localeId })}</p>
          </motion.div>

          <div className="flex items-center gap-3">
            <button className="dash-btn-secondary">Export Logs</button>
            <button className="dash-btn-primary">Real-time Sync</button>
          </div>
        </div>

        {/* ── Rule Manifest ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/2 p-6 backdrop-blur-xl mb-8"
        >
          <div className="flex flex-col xl:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <ShieldCheck size={20} className="text-primary/60" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Department Policy Manifest</h4>
                  <p className="text-[11px] text-slate-500 font-medium tracking-wide">Operational boundaries for this unit</p>
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-400 font-medium max-w-2xl">
                {rule.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {[
                { icon: Clock, label: 'Entry Window', val: rule.checkInTime, color: 'var(--att-present)' },
                { icon: Clock, label: 'Exit Guard', val: rule.checkOutNextDay ? `${rule.checkOutTime} (+1d)` : rule.checkOutTime, color: 'var(--att-leave)' },
                { icon: AlertTriangle, label: 'Leeway', val: `${rule.toleranceMinutes}m`, color: 'var(--att-absent)' },
              ].map(item => (
                <div key={item.label} className="p-3 px-4 rounded-xl border border-white/5 bg-white/2 flex items-center gap-3 shadow-sm">
                  <item.icon size={16} style={{ color: item.color }} />
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                    <p className="text-[13px] font-black text-white leading-none">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div 
            className="absolute -right-20 -top-20 h-40 w-40 rounded-full blur-[80px]" 
            style={{ background: `${rule.color}20` }}
          />
        </motion.div>

        {/* ── Status Metrics ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Personnel', value: totalPresent, color: 'var(--att-present)', icon: CheckCircle2 },
            { label: 'Tardy Arrival',    value: totalLate,    color: 'var(--att-late)',    icon: AlertTriangle },
            { label: 'Authorized Leave', value: totalLeave,   color: 'var(--att-leave)',   icon: History },
            { label: 'Missing Unit',     value: totalAbsent,  color: 'var(--att-absent)',  icon: Activity },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="dash-card p-5 relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 text-slate-500">
                  <s.icon size={16} />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Matrix v4</span>
                </div>
                <p className="text-3xl font-black text-white mb-1">
                  {loading ? '—' : s.value}
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                  {s.label}
                </p>
              </div>
              <div 
                className="absolute inset-x-0 bottom-0 h-[2.5px]" 
                style={{ background: `linear-gradient(90deg, ${s.color} 0%, transparent 100%)` }} 
              />
              <div 
                className="absolute -right-4 -bottom-4 opacity-5 transition-transform group-hover:scale-125 group-hover:opacity-10" 
                style={{ color: s.color }}
              >
                <s.icon size={80} strokeWidth={3} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Audit Log ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dash-card overflow-hidden"
        >
          <div className="dash-card-header mb-0 bg-white/2 -mx-px -mt-px px-6 py-5 border-b border-white/5">
            <div>
              <h3 className="dash-card-title uppercase tracking-wider text-xs">Live Transaction Log</h3>
              <p className="dash-card-sub">Individual Attendance Resolution</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-jne-red animate-pulse" />
                LOGGING ACTIVE
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                  <th className="px-6 py-4">Personnel Asset</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Entry</th>
                  <th className="px-6 py-4">Exit</th>
                  <th className="px-6 py-4">Delta</th>
                  <th className="px-6 py-4 text-right">Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4"><div className="h-10 w-full dash-skeleton rounded-xl" /></td>
                    </tr>
                  ))
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <Activity size={32} className="text-slate-800" />
                        </div>
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">Zero signals detected today</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {records.map((rec, idx) => {
                      let lateDisplay = '—';
                      let yieldDisplay = '—';

                      if (rec.checkIn && rec.checkOut) {
                        const calc = calcEffectiveMinutes(rec.checkIn.time, rec.checkOut.time, rule);
                        if (calc.lateMinutes > 0) lateDisplay = fmtMinutes(calc.lateMinutes);
                        yieldDisplay = fmtMinutes(calc.effectiveMinutes);
                      } else if (rec.lateMinutes) {
                        lateDisplay = fmtMinutes(rec.lateMinutes);
                      }
                      if (rec.totalWorkMinutes) {
                        yieldDisplay = fmtMinutes(rec.totalWorkMinutes);
                      }

                      return (
                        <motion.tr
                          key={rec.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-white/2 transition-colors group cursor-default text-sm"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 flex items-center justify-center rounded-xl font-black text-xs border border-white/10 group-hover:border-primary/30 transition-colors shadow-sm" style={{ background: `${rule.color}18`, color: rule.color }}>
                                {rec.employeeName?.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[14px] font-black text-white group-hover:text-primary transition-all tracking-tight leading-none mb-1 truncate">{rec.employeeName}</p>
                                <p className="text-[10px] font-bold text-slate-600 tracking-wider uppercase truncate"> {rec.employeeId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-middle"><StatusBadge status={rec.status} /></td>
                          <td className="px-6 py-5 align-middle">
                            {rec.checkIn?.time ? (
                              <div className="text-[12px] font-black font-mono text-white/90">
                                {format(new Date(rec.checkIn.time), 'HH:mm:ss')}
                              </div>
                            ) : <span className="text-slate-800">—</span>}
                          </td>
                          <td className="px-6 py-5 align-middle">
                            {rec.checkOut?.time ? (
                              <div className="text-[12px] font-black font-mono text-white/90">
                                {format(new Date(rec.checkOut.time), 'HH:mm:ss')}
                              </div>
                            ) : <span className="text-slate-800">—</span>}
                          </td>
                          <td className="px-6 py-5 align-middle text-right">
                            <span className={`text-[12px] font-bold font-mono ${lateDisplay !== '—' ? 'text-att-absent' : 'text-slate-700'}`}>
                              {lateDisplay}
                            </span>
                          </td>
                          <td className="px-6 py-5 align-middle text-right">
                            <span className="text-[13px] font-black text-white/80 tabular-nums">
                              {yieldDisplay}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── Technical Clause ── */}
        <div className="mt-8 flex items-start gap-4 p-5 rounded-2xl border border-primary/10 bg-primary/5 relative overflow-hidden group">
          <div className="bg-primary/20 p-2 rounded-xl">
            <Info size={16} className="text-primary/60 shrink-0" />
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 font-medium relative z-10">
            <span className="font-black text-white uppercase tracking-wider block mb-1">Operational Deduction Formula</span>
            Tardiness exceeding the <span className="text-primary font-black">{rule.toleranceMinutes}m threshold</span> will trigger a linear subtraction 
            from effective work minutes. This mechanism ensures yield integrity for {rule.name} shifts. 
            Overflow (Overtime) is not commutative with tardiness penalties.
          </p>
          <div className="absolute right-0 top-0 h-full w-24 bg-linear-to-l from-primary/5 to-transparent pointer-events-none" />
        </div>
      </div>
    </AdminLayout>
  );
}
