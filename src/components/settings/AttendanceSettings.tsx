'use client';

import ToggleSwitch from './ToggleSwitch';
import type { Settings } from '@/types';
import { ShieldCheck, UserCheck, Zap, Lock, Eye, Clock } from 'lucide-react';

interface AttendanceSettingsProps {
  settings: Settings['attendance'];
  update: (section: 'attendance', field: string, value: any) => void;
}

export default function AttendanceSettings({ settings, update }: AttendanceSettingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-10">
        {/* Face Recognition Protocol */}
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-600/10 text-rose-600 flex items-center justify-center">
                 <UserCheck size={18} />
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Biometric Protocol</h4>
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Recognition Threshold</label>
                <div className="px-4 py-1.5 bg-rose-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-rose-600/20 italic">
                  {settings.faceSimilarityThreshold ?? 60}%
                </div>
              </div>
              <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
                <input
                  type="range"
                  min={60}
                  max={99}
                  step={1}
                  className="absolute inset-0 w-full h-2 rounded-full appearance-none cursor-pointer bg-transparent accent-rose-600 z-10"
                  value={settings.faceSimilarityThreshold ?? 60}
                  onChange={(e) => {
                    const val = e.target.value;
                    update('attendance', 'faceSimilarityThreshold', val === '' ? 60 : parseInt(val, 10));
                  }}
                />
                <div 
                  className="absolute top-0 left-0 h-full bg-rose-600 rounded-full shadow-[0_0_10px_rgba(225,29,72,0.3)]"
                  style={{ width: `${((settings.faceSimilarityThreshold ?? 60) - 60) / (99 - 60) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                <span>Fast Sync (60%)</span>
                <span>High Precision (99%)</span>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Security Retry Limit</label>
              <div className="relative group">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors" />
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-(--text-primary) outline-none focus:border-rose-600/50 transition-all shadow-sm"
                  value={settings.maxFaceAttempts ?? 1}
                  onChange={(e) => {
                    const val = e.target.value;
                    update('attendance', 'maxFaceAttempts', val === '' ? 1 : parseInt(val, 10));
                  }}
                />
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
                Device akan mengunci fitur absensi jika gagal melewati batas ini.
              </p>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center">
              <ShieldCheck size={18} />
           </div>
           <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Operational Logic</h4>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            {
              key: 'allowOfflineAttendance',
              label: 'Sync Archive Protocol',
              desc: 'Izinkan penyimpanan data lokal saat koneksi terputus.',
              icon: Zap
            },
            {
              key: 'courierBypassGeofence',
              label: 'Field Mobility Bypass',
              desc: 'Kurir tidak terikat radius GPS untuk efisiensi lapangan.',
              icon: Eye
            },
            {
              key: 'overtimeCalculation',
              label: 'Automated Overtime Sync',
              desc: 'Hitung lembur secara real-time berdasarkan jam pulang.',
              icon: Clock
            },
          ].map((item) => (
            <div key={item.key} className="p-5 rounded-[24px] border border-(--border-color) bg-(--bg-main) hover:border-rose-600/30 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-rose-600 transition-colors">
                    <item.icon size={20} />
                 </div>
                 <div className="flex-1">
                    <p className="text-[11px] font-black text-(--text-primary) uppercase tracking-widest">{item.label}</p>
                 </div>
              </div>
              <ToggleSwitch
                checked={Boolean((settings as any)[item.key])}
                onChange={() => update('attendance', item.key, !(settings as any)[item.key])}
                label=""
                description={item.desc}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}