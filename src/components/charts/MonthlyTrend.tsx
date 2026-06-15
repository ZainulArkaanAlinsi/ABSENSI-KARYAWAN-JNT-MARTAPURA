'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export interface TrendPoint {
  day: string;
  value: number;
}

/**
 * Grafik tren harian dalam satu bulan (area chart). Dipakai di halaman
 * Input Paket & Input Penjualan.
 */
export default function MonthlyTrend({
  data,
  color = '#E31E24',
  gradientId = 'trendFill',
  valueFormatter,
}: {
  data: TrendPoint[];
  color?: string;
  gradientId?: string;
  valueFormatter?: (n: number) => string;
}) {
  const fmt = valueFormatter ?? ((n: number) => n.toLocaleString('id-ID'));
  return (
    <ResponsiveContainer width="100%" height={210}>
      <AreaChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={46}
          tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }}
          tickFormatter={(v: number) => fmt(v)}
        />
        <Tooltip
          formatter={(value) => fmt(Number(value))}
          labelFormatter={(l) => `Tanggal ${l}`}
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            fontSize: 12,
            fontWeight: 600,
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          name="Total"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
