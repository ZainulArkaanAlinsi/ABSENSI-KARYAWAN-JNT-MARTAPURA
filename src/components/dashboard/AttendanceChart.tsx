'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AttendanceChartProps {
  data: any[];
}

const AttendanceChart = ({ data }: AttendanceChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--sidebar-bg)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--sidebar-bg)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="currentColor"
          className="opacity-5"
        />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--text-secondary)' }}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            borderRadius: '16px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            fontSize: '10px',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
          }}
          itemStyle={{ color: 'var(--text-primary)' }}
        />
        <Area
          type="monotone"
          dataKey="present"
          stroke="var(--sidebar-bg)"
          strokeWidth={4}
          fillOpacity={1}
          fill="url(#colorPresent)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default React.memo(AttendanceChart);
