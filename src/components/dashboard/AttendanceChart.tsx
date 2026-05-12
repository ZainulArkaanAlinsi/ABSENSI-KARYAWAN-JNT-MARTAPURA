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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary border border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</p>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#4F46E5] shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
          <p className="text-sm font-black text-white">
            {payload[0].value} <span className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Personnel</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const AttendanceChart = ({ data }: AttendanceChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="4 4"
          vertical={false}
          stroke="#F1F5F9"
        />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fontWeight: 900, fill: '#94A3B8' }}
          dy={15}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fontWeight: 900, fill: '#94A3B8' }}
        />
        <Tooltip 
          content={<CustomTooltip />} 
          cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '6 6' }} 
        />
        <Area
          type="monotone"
          dataKey="present"
          stroke="#4F46E5"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorPresent)"
          animationDuration={2500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default React.memo(AttendanceChart);
