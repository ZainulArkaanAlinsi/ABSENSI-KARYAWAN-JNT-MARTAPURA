'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart, Activity, ArrowUpRight } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="dash-root">
      {/* ── HEADER ── */}
      <div className="mb-10 bg-white p-10 rounded-4xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="h-20 w-20 rounded-3xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-900/20">
          <BarChart3 size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-900">Analitik & Tren SDM</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-2">Visualisasi data performa dan kedisiplinan personel secara mendalam.</p>
        </div>
      </div>

      {/* ── GRIDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-slate-900 uppercase italic tracking-tight">Persentase Kehadiran</h3>
              <TrendingUp className="text-emerald-500" size={20} />
           </div>
           <div className="h-64 bg-slate-50 rounded-3xl flex items-center justify-center border border-dashed border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Engine Loading...</p>
           </div>
        </div>
        <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-slate-900 uppercase italic tracking-tight">Sebaran Unit Kerja</h3>
              <PieChart className="text-indigo-500" size={20} />
           </div>
           <div className="h-64 bg-slate-50 rounded-3xl flex items-center justify-center border border-dashed border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Matrix Analysis Active</p>
           </div>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Efisiensi Shift', val: '94.2%', color: 'text-emerald-600' },
           { label: 'Rerata Keterlambatan', val: '4.8m', color: 'text-amber-600' },
           { label: 'Skor Kedisiplinan', val: 'A+', color: 'text-indigo-600' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                 <h4 className={`text-3xl font-black ${stat.color} tracking-tighter`}>{stat.val}</h4>
                 <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                    <ArrowUpRight size={14} />
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
