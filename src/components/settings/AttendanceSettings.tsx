'use client';

import ToggleSwitch from './ToggleSwitch';
import type { Settings } from '@/types';
import { UserCheck, ShieldCheck, Zap, Lock, Eye, Clock, Fingerprint, Activity } from 'lucide-react';

interface AttendanceSettingsProps {
  settings: Settings['attendance'];
  update: (section: 'attendance', field: string, value: any) => void;
}

export default function AttendanceSettings({ settings, update }: AttendanceSettingsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-10">
        {/* Face Recognition Protocol */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-primary flex items-center justify-center shrink-0 shadow-sm">
              <Fingerprint size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">
                Biometric Protocol
              </h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Facial Recognition Parameters
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Similarity Threshold
              </label>
              <span className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-black tracking-widest shadow-lg shadow-primary/20">
                {settings.faceSimilarityThreshold ?? 60}%
              </span>
            </div>

            <div className="relative py-4">
              <input
                type="range"
                min={60}
                max={99}
                step={1}
                className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                value={settings.faceSimilarityThreshold ?? 60}
                onChange={(e) => {
                  const val = e.target.value;
                  update(
                    'attendance',
                    'faceSimilarityThreshold',
                    val === '' ? 60 : parseInt(val, 10),
                  );
                }}
              />
              <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-widest mt-4">
                <span>Fast Sync (60%)</span>
                <span>Max Precision (99%)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Lock size={12} strokeWidth={3} className="text-primary" />
              Security Attempt Limit
            </label>
            <div className="relative group">
              <Activity
                size={16}
                strokeWidth={2.5}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"
              />
              <input
                type="number"
                min={1}
                max={10}
                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all"
                value={settings.maxFaceAttempts ?? 1}
                onChange={(e) => {
                  const val = e.target.value;
                  update('attendance', 'maxFaceAttempts', val === '' ? 1 : parseInt(val, 10));
                }}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
              * The system will automatically suspend biometric access for the user if verification
              fails beyond this threshold.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">
              Operational Logic
            </h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Telemetry & Sync Behavior
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {[
            {
              key: 'allowOfflineAttendance',
              label: 'Offline Data Buffer',
              desc: 'Enable local storage for telemetry packets when network connection is unstable.',
              icon: Zap,
              color: 'text-amber-500',
              bg: 'bg-amber-50',
            },
            {
              key: 'courierBypassGeofence',
              label: 'Tactical Perimeter Bypass',
              desc: 'Allow designated couriers to execute attendance triggers outside geofence boundaries.',
              icon: Eye,
              color: 'text-blue-500',
              bg: 'bg-blue-50',
            },
            {
              key: 'overtimeCalculation',
              label: 'Precision Overtime',
              desc: 'Automated computation of surplus operational hours based on shift delta.',
              icon: Clock,
              color: 'text-primary',
              bg: 'bg-primary/5',
            },
          ].map((item) => (
            <div
              key={item.key}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-5 mb-8">
                <div
                  className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm`}
                >
                  <item.icon size={20} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    {item.label}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={Boolean((settings as any)[item.key])}
                onChange={() => update('attendance', item.key, !(settings as any)[item.key])}
                description={item.desc}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
