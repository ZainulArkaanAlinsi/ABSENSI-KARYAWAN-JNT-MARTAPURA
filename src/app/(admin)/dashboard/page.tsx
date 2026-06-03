'use client';

import React, { useState, useEffect } from 'react';
import {
  UserX, Calendar, CheckCircle2,
  ArrowUpRight, Clock, TrendingUp,
  Wifi, ScanFace, Timer, Target,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { motion, animate, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import Link from 'next/link';

// ─── Count-up ──────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 0.8, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const ctrl = animate(0, target, {
        duration,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: v => setCount(Math.round(v)),
      });
      return () => ctrl.stop();
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [target]);
  return count;
}

// ─── Section Divider (newspaper style) ────────────────────────────────────────
function SectionDivider({ label, index = 0 }: { label: string; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="flex items-center gap-3 py-1"
    >
      <span
        className="w-2 h-2 rounded-sm shrink-0"
        style={{ background: '#E31E24' }}
      />
      <span
        className="text-[9px] font-black uppercase tracking-[0.3em] shrink-0"
        style={{ color: '#E31E24' }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 shrink-0">
        JNE MTP
      </span>
    </motion.div>
  );
}

// ─── Hero Stat Card (big card) ─────────────────────────────────────────────────
function HeroCard({ present, total, pct, delay }: {
  present: number; total: number; pct: number; delay: number;
}) {
  const n = useCountUp(present, 1.0, delay);
  const p = useCountUp(pct, 1.0, delay + 0.1);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ y: -3 }}
      className="relative rounded-2xl p-6 overflow-hidden flex flex-col justify-between gap-4"
      style={{
        background: 'linear-gradient(135deg, #E31E24 0%, #A8151A 100%)',
        boxShadow: '0 8px 32px rgba(227,30,36,0.25)',
        minHeight: 180,
      }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      />
      {/* Big number watermark */}
      <div
        className="absolute -right-4 -bottom-6 text-[110px] font-black leading-none select-none pointer-events-none tabular-nums"
        style={{ color: 'rgba(255,255,255,0.08)' }}
      >
        {p}%
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-200 mb-1">
          Hadir Hari Ini
        </p>
        <div className="flex items-end gap-2">
          <span className="text-[52px] font-black leading-none tabular-nums text-white">{n}</span>
          <span className="text-[16px] font-bold text-red-200 mb-2">/{total}</span>
        </div>
        <p className="text-[11px] font-medium text-red-100 mt-1">orang hadir hari ini</p>
      </div>

      <div className="relative z-10">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <motion.div
            className="h-full rounded-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: delay + 0.3 }}
          />
        </div>
        <p className="text-[10px] font-bold text-red-100 mt-1.5">{p}% tingkat kehadiran</p>
      </div>
    </motion.div>
  );
}

// ─── Small Stat Card ───────────────────────────────────────────────────────────
function SmallCard({ label, value, icon: Icon, color, bg, sub, delay, tag }: {
  label: string; value: number; icon: React.ElementType;
  color: string; bg: string; sub: string; delay: number; tag?: string;
}) {
  const n = useCountUp(value, 0.8, delay);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ y: -2 }}
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: 'var(--surface-card)',
        border: '1.5px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
          <Icon size={16} style={{ color }} strokeWidth={2} />
        </div>
        {tag && (
          <span
            className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: bg, color }}
          >
            {tag}
          </span>
        )}
      </div>
      <div>
        <span className="text-[32px] font-black leading-none tabular-nums" style={{ color: 'var(--text-primary)' }}>
          {n}
        </span>
        <span className="text-[11px] text-slate-400 ml-1 font-medium">{sub}</span>
      </div>
      <p className="text-[11px] font-semibold text-slate-500 -mt-1">{label}</p>
    </motion.div>
  );
}

// ─── Mini Metric (compact summary) ─────────────────────────────────────────────
function MiniMetric({ label, value, suffix, icon: Icon, color, bg, delay }: {
  label: string; value: number; suffix?: string; icon: React.ElementType;
  color: string; bg: string; delay: number;
}) {
  const n = useCountUp(value, 0.8, delay);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ y: -2 }}
      className="rounded-2xl p-3.5 flex items-center gap-3"
      style={{
        background: 'var(--surface-card)',
        border: '1.5px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
        <Icon size={17} style={{ color }} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="text-[22px] font-black leading-none tabular-nums" style={{ color: 'var(--text-primary)' }}>{n}</span>
          {suffix && <span className="text-[11px] font-bold text-slate-400">{suffix}</span>}
        </div>
        <p className="text-[10.5px] font-semibold text-slate-500 truncate mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Pending Banner Card ───────────────────────────────────────────────────────
function PendingBannerCard({ pending, delay }: { pending: number; delay: number }) {
  const n = useCountUp(pending, 0.8, delay);
  return (
    <Link href="/leaves">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        whileHover={{ y: -2 }}
        className="rounded-2xl px-5 py-4 flex items-center justify-between cursor-pointer group"
        style={{
          background: 'var(--surface-card)',
          border: '1.5px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: '#E6EEF8' }}>
            <Calendar size={18} style={{ color: '#004080' }} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Antrian Izin</p>
            <p className="text-[13px] font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              <span className="text-[20px] font-black tabular-nums" style={{ color: '#004080' }}>{n}</span>
              {' '}pengajuan menunggu review
            </p>
          </div>
        </div>
        <motion.div
          whileHover={{ x: 3 }}
          className="flex items-center gap-1 text-[11px] font-bold"
          style={{ color: '#004080' }}
        >
          Lihat Semua <ArrowUpRight size={13} />
        </motion.div>
      </motion.div>
    </Link>
  );
}

// ─── Chart Tooltip ─────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 px-3 py-2.5 text-[11px]">
      <p className="font-bold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
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

// ─── Request Row ───────────────────────────────────────────────────────────────
function RequestRow({ req, i }: { req: any; i: number }) {
  const isSOS = req.type === 'SOS';
  return (
    <Link href={isSOS ? '/requests' : '/leaves'}>
      <motion.div
        initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, delay: 0.38 + i * 0.05 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-black shrink-0 ${
          isSOS ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {isSOS ? '!' : req.employeeName?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-slate-700 truncate">{req.employeeName}</p>
          <p className="text-[11px] text-slate-400 capitalize">{req.type} · {req.totalDays ?? 1} hari</p>
        </div>
        {isSOS && (
          <span className="text-[9px] font-black bg-red-100 text-red-500 px-1.5 py-0.5 rounded-md uppercase shrink-0">SOS</span>
        )}
        <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
          {(() => {
            const dateVal = req.startDate || req.createdAt || req.timestamp;
            if (!dateVal) return 'Hari ini';
            
            let d: Date | null = null;
            try {
              if (dateVal instanceof Date) {
                d = dateVal;
              } else if (typeof dateVal === 'object' && dateVal !== null && 'seconds' in dateVal) {
                d = new Date((dateVal as any).seconds * 1000);
              } else if (typeof dateVal === 'string' && dateVal.length > 0) {
                d = new Date(dateVal);
              }
            } catch (e) {
              console.error('Date parsing error:', e);
            }
            
            if (!d || isNaN(d.getTime())) return 'Hari ini';
            return format(d, 'dd MMM', { locale: idLocale });
          })()}
        </span>
      </motion.div>
    </Link>
  );
}

// ─── Empty ─────────────────────────────────────────────────────────────────────
const Empty = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="py-10 flex flex-col items-center gap-3">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
      <Icon size={20} className="text-slate-400" />
    </div>
    <p className="text-[12px] font-semibold text-slate-400">{text}</p>
  </div>
);

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="space-y-5 animate-pulse">
    <div className="h-8 w-56 bg-slate-200 rounded-xl" />
    <div className="h-4 w-32 bg-slate-100 rounded-lg" />
    <div className="grid grid-cols-3 gap-3">
      <div className="col-span-1 h-44 bg-slate-200 rounded-2xl" />
      <div className="h-44 bg-slate-200 rounded-2xl" />
      <div className="h-44 bg-slate-200 rounded-2xl" />
    </div>
    <div className="h-12 bg-slate-100 rounded-2xl" />
    <div className="h-4 w-40 bg-slate-100 rounded-lg" />
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-7 h-[280px] bg-slate-200 rounded-2xl" />
      <div className="col-span-12 lg:col-span-5 h-[280px] bg-slate-200 rounded-2xl" />
    </div>
  </div>
);

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: s, weeklyData, loading } = useDashboardStats();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (loading) return <Skeleton />;

  const total   = s?.totalEmployees ?? 0;
  const present = s?.presentToday   ?? 0;
  const late    = s?.lateToday      ?? 0;
  const absent  = s?.absentToday    ?? 0;
  const pending = s?.pendingLeaves  ?? 0;
  const pct     = total ? Math.round((present / total) * 100) : 0;
  const requests = (s?.pendingRequests ?? []).slice(0, 6);

  const online      = s?.onlineNowCount      ?? 0;
  const faceReg     = s?.faceRegisteredCount ?? 0;
  const overtimeH   = s?.overtimeThisMonth   ?? 0;
  const punctuality = s?.punctualityRate     ?? 0;

  return (
    <div className="flex flex-col gap-4 pb-4">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Live</span>
          </span>
          <p className="text-[11px] font-medium text-slate-400 tabular-nums">
            {format(now, 'EEEE, dd MMMM yyyy', { locale: idLocale })}
            {' · '}
            {format(now, 'HH:mm:ss')}
          </p>
        </div>
        <h1 className="editorial-heading text-[28px]" style={{ color: 'var(--text-primary)' }}>
          Dashboard{' '}
          <span style={{ color: '#E31E24' }}>Kehadiran</span>
        </h1>
        <p className="text-[12px] font-medium text-slate-400 mt-0.5">
          Monitor absensi &amp; kehadiran karyawan JNE Martapura secara real-time
        </p>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: STATISTIK HARI INI                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <SectionDivider label="Statistik Hari Ini" index={1} />

      {/* Big card + 2 small cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Big hero card (2 cols wide on lg, full on mobile) */}
        <div className="col-span-3 sm:col-span-1">
          <HeroCard present={present} total={total} pct={pct} delay={0.12} />
        </div>

        {/* Small cards stacked */}
        <div className="col-span-3 sm:col-span-2 grid grid-cols-2 gap-3">
          <SmallCard
            label="Telat Hari Ini" value={late} icon={Clock}
            color="#D97706" bg="#FEF3C7" sub="orang" delay={0.18} tag="Telat"
          />
          <SmallCard
            label="Tidak Hadir" value={absent} icon={UserX}
            color="#E31E24" bg="#FDECEA" sub="orang" delay={0.24} tag="Absen"
          />
          <SmallCard
            label="Total Karyawan" value={total} icon={TrendingUp}
            color="#7C3AED" bg="#EDE9FE" sub="orang" delay={0.30}
          />
          <SmallCard
            label="Hadir Hari Ini" value={present} icon={CheckCircle2}
            color="#059669" bg="#D1FAE5" sub="orang" delay={0.36}
          />
        </div>
      </div>

      {/* Pending Banner */}
      <PendingBannerCard pending={pending} delay={0.42} />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: RINGKASAN                                                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <SectionDivider label="Ringkasan" index={2} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniMetric label="Online sekarang"  value={online}      icon={Wifi}     color="#059669" bg="#D1FAE5" delay={0.44} />
        <MiniMetric label="Wajah terdaftar"  value={faceReg}     suffix={`/ ${total}`} icon={ScanFace} color="#7C3AED" bg="#EDE9FE" delay={0.48} />
        <MiniMetric label="Lembur bulan ini" value={overtimeH}   suffix="jam"    icon={Timer}    color="#D97706" bg="#FEF3C7" delay={0.52} />
        <MiniMetric label="Ketepatan waktu"  value={punctuality} suffix="%"      icon={Target}   color="#004080" bg="#E6EEF8" delay={0.56} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: TREN & LAPORAN                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <SectionDivider label="Tren & Laporan" index={3} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Weekly chart */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.46 }}
          className="lg:col-span-7 rounded-2xl overflow-hidden"
          style={{
            background: 'var(--surface-card)',
            border: '1.5px solid var(--border-default)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="px-5 pt-5 pb-3 flex items-start justify-between" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <div>
              <h3 className="editorial-heading text-[15px]" style={{ color: 'var(--text-primary)' }}>
                Tren Kehadiran Mingguan
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">7 hari terakhir · realtime</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400">
              {[
                { color: '#059669', label: 'Hadir' },
                { color: '#D97706', label: 'Telat' },
                { color: '#E31E24', label: 'Absen' },
              ].map(l => (
                <span key={l.label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
          <div className="px-3 py-5" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#059669" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gLate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#D97706" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#E31E24" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#E31E24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="present" stroke="#059669" strokeWidth={2.5}
                  fill="url(#gPresent)" dot={false} activeDot={{ r: 4, fill: '#059669' }} />
                <Area type="monotone" dataKey="late"    stroke="#D97706" strokeWidth={2}
                  fill="url(#gLate)"    dot={false} activeDot={{ r: 4, fill: '#D97706' }} />
                <Area type="monotone" dataKey="absent"  stroke="#E31E24" strokeWidth={1.5}
                  fill="url(#gAbsent)"  dot={false} strokeDasharray="4 3" activeDot={{ r: 4, fill: '#E31E24' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Approval queue */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.52 }}
          className="lg:col-span-5 rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'var(--surface-card)',
            border: '1.5px solid var(--border-default)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{ borderBottom: '1px solid var(--border-default)' }}
          >
            <div>
              <h3 className="editorial-heading text-[15px]" style={{ color: 'var(--text-primary)' }}>
                Antrian Approval
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Pengajuan izin menunggu review</p>
            </div>
            <Link href="/leaves">
              <motion.span
                whileHover={{ x: 2 }}
                className="text-[11px] font-bold flex items-center gap-0.5 cursor-pointer"
                style={{ color: '#004080' }}
              >
                Semua <ArrowUpRight size={12} />
              </motion.span>
            </Link>
          </div>
          <div className="p-2 flex-1 overflow-auto">
            <AnimatePresence>
              {requests.length > 0
                ? requests.map((r: any, i: number) => <RequestRow key={r.id} req={r} i={i} />)
                : <Empty icon={CheckCircle2} text="Antrian kosong" />}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
