'use client';

import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Package, Banknote,
  Download, Calendar, ChevronLeft, ChevronRight,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ─── Mock Monthly Data ────────────────────────────────────────────────────────
const MONTHLY_DATA = [
  { bulan: 'Jan', paket: 1820, pendapatan: 52_800_000, target: 55_000_000 },
  { bulan: 'Feb', paket: 1650, pendapatan: 48_200_000, target: 55_000_000 },
  { bulan: 'Mar', paket: 2100, pendapatan: 61_500_000, target: 60_000_000 },
  { bulan: 'Apr', paket: 1980, pendapatan: 57_300_000, target: 60_000_000 },
  { bulan: 'Mei', paket: 2340, pendapatan: 68_100_000, target: 65_000_000 },
  { bulan: 'Jun', paket: 2180, pendapatan: 63_400_000, target: 65_000_000 },
  { bulan: 'Jul', paket: 2560, pendapatan: 74_200_000, target: 70_000_000 },
  { bulan: 'Ags', paket: 2430, pendapatan: 70_800_000, target: 70_000_000 },
  { bulan: 'Sep', paket: 2710, pendapatan: 78_900_000, target: 75_000_000 },
  { bulan: 'Okt', paket: 2890, pendapatan: 84_100_000, target: 80_000_000 },
  { bulan: 'Nov', paket: 3120, pendapatan: 90_700_000, target: 85_000_000 },
  { bulan: 'Des', paket: 3450, pendapatan: 100_350_000, target: 90_000_000 },
];

const DAILY_DATA = [
  { hari: 'Sen', terkirim: 142, pending: 18, gagal: 4 },
  { hari: 'Sel', terkirim: 158, pending: 22, gagal: 3 },
  { hari: 'Rab', terkirim: 171, pending: 15, gagal: 6 },
  { hari: 'Kam', terkirim: 165, pending: 19, gagal: 2 },
  { hari: 'Jum', terkirim: 189, pending: 28, gagal: 5 },
  { hari: 'Sab', terkirim: 210, pending: 31, gagal: 3 },
  { hari: 'Min', terkirim: 96,  pending: 12, gagal: 1 },
];

const SERVICE_DATA = [
  { service: 'REG',  paket: 4821, revenue: 120_525_000, pct: 54 },
  { service: 'OKE',  paket: 2340, revenue: 46_800_000,  pct: 26 },
  { service: 'YES',  paket: 1450, revenue: 65_250_000,  pct: 16 },
  { service: 'SPS',  paket:  389, revenue: 23_340_000,  pct:  4 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
const fmtShort = (n: number) => n >= 1_000_000 ? `Rp${(n / 1_000_000).toFixed(1)}jt` : `Rp${(n / 1_000).toFixed(0)}rb`;

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, trend, icon: Icon, color, bg }: {
  label: string; value: string; sub: string;
  trend: { value: number; positive: boolean };
  icon: React.ElementType; color: string; bg: string;
}) {
  const TrendIcon = trend.positive ? ArrowUpRight : ArrowDownRight;
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={20} style={{ color }} strokeWidth={2} />
        </div>
        <span className={`inline-flex items-center gap-0.5 text-[12px] font-semibold px-2 py-0.5 rounded-full ${
          trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        }`}>
          <TrendIcon size={12} strokeWidth={2.5} />
          {Math.abs(trend.value)}%
        </span>
      </div>
      <p className="text-[26px] font-extrabold text-slate-800 leading-none">{value}</p>
      <p className="text-[12px] text-slate-400 mt-1">{sub}</p>
      <p className="text-[11px] font-semibold text-slate-500 mt-3 pt-3 border-t border-slate-50">{label}</p>
    </motion.div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 text-[12px]">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="flex items-center gap-2" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <span className="font-bold ml-auto pl-3">
            {typeof p.value === 'number' && p.value > 10000 ? fmtShort(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const YEARS = ['2024', '2025', '2026'];

export default function SalesPage() {
  const [year,    setYear]    = useState('2026');
  const [chartTab, setChartTab] = useState<'monthly' | 'daily'>('monthly');

  const totalRevenue = MONTHLY_DATA.reduce((s, m) => s + m.pendapatan, 0);
  const totalPaket   = MONTHLY_DATA.reduce((s, m) => s + m.paket, 0);
  const avgPerPaket  = Math.round(totalRevenue / totalPaket);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#E31E24' }}>
              <BarChart3 size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-[22px] font-extrabold text-slate-800">Laporan Penjualan</h1>
          </div>
          <p className="text-[13px] text-slate-500 ml-10">JNE Martapura · Rekap pendapatan &amp; performa pengiriman</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Year picker */}
          <div className="flex border border-slate-200 rounded-xl overflow-hidden">
            {YEARS.map(y => (
              <button key={y} onClick={() => setYear(y)}
                className={`px-3 py-2 text-[13px] font-semibold transition-all ${
                  year === y ? 'text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
                style={year === y ? { background: '#E31E24' } : {}}>
                {y}
              </button>
            ))}
          </div>

          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600
                             text-[13px] font-medium hover:border-jne-blue hover:text-jne-blue transition-all">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Pendapatan"
          value={fmtShort(totalRevenue)}
          sub={fmt(totalRevenue)}
          trend={{ value: 12.4, positive: true }}
          icon={Banknote}
          color="#E31E24" bg="#FDECEA"
        />
        <KPICard
          label="Total Paket Terkirim"
          value={totalPaket.toLocaleString('id-ID')}
          sub="paket sepanjang tahun"
          trend={{ value: 18.7, positive: true }}
          icon={Package}
          color="#004080" bg="#E6EEF8"
        />
        <KPICard
          label="Rata-rata per Paket"
          value={fmtShort(avgPerPaket)}
          sub="pendapatan rata-rata"
          trend={{ value: 2.1, positive: false }}
          icon={TrendingUp}
          color="#059669" bg="#D1FAE5"
        />
        <KPICard
          label="Target Achievement"
          value="108%"
          sub="melampaui target tahunan"
          trend={{ value: 8.0, positive: true }}
          icon={TrendingDown}
          color="#7C3AED" bg="#EDE9FE"
        />
      </div>

      {/* ── Chart Section ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Main Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-800 text-[15px]">Tren Pengiriman &amp; Pendapatan</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">Performa bulanan tahun {year}</p>
            </div>
            <div className="flex border border-slate-200 rounded-xl overflow-hidden">
              {(['monthly', 'daily'] as const).map(t => (
                <button key={t} onClick={() => setChartTab(t)}
                  className={`px-3 py-1.5 text-[12px] font-medium transition-all ${
                    chartTab === t ? 'text-white' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                  style={chartTab === t ? { background: '#004080' } : {}}>
                  {t === 'monthly' ? 'Bulanan' : 'Mingguan'}
                </button>
              ))}
            </div>
          </div>

          {chartTab === 'monthly' ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={MONTHLY_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#E31E24" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#E31E24" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#004080" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#004080" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="paket" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={40} />
                <YAxis yAxisId="uang" orientation="right" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                       width={55} tickFormatter={v => fmtShort(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area yAxisId="paket" type="monotone" dataKey="paket" name="Paket" stroke="#004080" strokeWidth={2.5}
                      fill="url(#gradBlue)" dot={{ fill: '#004080', r: 3 }} />
                <Area yAxisId="uang" type="monotone" dataKey="pendapatan" name="Pendapatan" stroke="#E31E24" strokeWidth={2.5}
                      fill="url(#gradRed)" dot={{ fill: '#E31E24', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={DAILY_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="hari" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={35} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="terkirim" name="Terkirim" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending"  name="Pending"  fill="#D97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gagal"    name="Gagal"    fill="#E31E24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Service Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-bold text-slate-800 text-[15px] mb-1">Breakdown Layanan</h2>
          <p className="text-[12px] text-slate-400 mb-5">Distribusi per jenis layanan</p>

          <div className="space-y-4">
            {SERVICE_DATA.map((s, i) => {
              const colors = ['#E31E24', '#004080', '#059669', '#7C3AED'];
              const color  = colors[i % colors.length];
              return (
                <div key={s.service}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg text-white text-[10px] font-black flex items-center justify-center"
                        style={{ background: color }}>
                        {s.service.substring(0, 1)}
                      </span>
                      <span className="text-[13px] font-semibold text-slate-700">{s.service}</span>
                    </div>
                    <span className="text-[12px] font-bold text-slate-500">{s.pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{s.paket.toLocaleString('id-ID')} paket</span>
                    <span>{fmtShort(s.revenue)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-slate-700">Total</span>
              <span className="text-[15px] font-extrabold text-jne-red">{fmtShort(totalRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Monthly Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-[15px]">Rekap Bulanan {year}</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Rincian performa per bulan</p>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[12px]">
            <Calendar size={14} />
            <span>Tahun {year}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['Bulan', 'Jumlah Paket', 'Pendapatan', 'Target', 'Selisih', 'Achievement'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MONTHLY_DATA.map((row, idx) => {
                const diff     = row.pendapatan - row.target;
                const achieved = Math.round((row.pendapatan / row.target) * 100);
                const isPos    = diff >= 0;
                return (
                  <motion.tr
                    key={row.bulan}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{row.bulan} {year}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">{row.paket.toLocaleString('id-ID')}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{fmt(row.pendapatan)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{fmt(row.target)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[12px] font-semibold ${isPos ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isPos ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        {fmt(Math.abs(diff))}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(achieved, 100)}%`, background: achieved >= 100 ? '#059669' : achieved >= 80 ? '#D97706' : '#E31E24' }}
                          />
                        </div>
                        <span className={`text-[12px] font-bold ${achieved >= 100 ? 'text-emerald-600' : achieved >= 80 ? 'text-amber-600' : 'text-red-500'}`}>
                          {achieved}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
            {/* Footer total */}
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50/80">
                <td className="px-5 py-3.5 font-black text-slate-800">TOTAL</td>
                <td className="px-5 py-3.5 font-black text-slate-800">{totalPaket.toLocaleString('id-ID')}</td>
                <td className="px-5 py-3.5 font-black text-jne-red">{fmt(totalRevenue)}</td>
                <td className="px-5 py-3.5 font-bold text-slate-600">{fmt(MONTHLY_DATA.reduce((s, m) => s + m.target, 0))}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-600">
                    <ArrowUpRight size={13} />
                    {fmt(totalRevenue - MONTHLY_DATA.reduce((s, m) => s + m.target, 0))}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="font-black text-emerald-600">108%</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
