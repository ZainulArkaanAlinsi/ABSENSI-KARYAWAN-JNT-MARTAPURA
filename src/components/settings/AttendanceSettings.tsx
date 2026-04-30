'use client';

import ToggleSwitch from './ToggleSwitch';
import type { Settings } from '@/types';


interface AttendanceSettingsProps {
  settings: Settings['attendance'];
  update: (section: 'attendance', field: string, value: any) => void;
}

export default function AttendanceSettings({ settings, update }: AttendanceSettingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-8">
        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Maks. Percobaan Wajah</label>
          <input
            type="number"
            min={1}
            max={10}
            className="w-full bg-black/5 dark:bg-white/5 border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-(--jne-red) transition-colors"
            style={{ 
              borderColor: 'var(--border-primary)', 
              color: 'var(--text-primary)',
              boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.5)'
            }}
            value={settings.maxFaceAttempts ?? 1}
            onChange={(e) => {
              const val = e.target.value;
              update('attendance', 'maxFaceAttempts', val === '' ? 1 : parseInt(val, 10));
            }}
          />
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Kunci otomatis setelah batas percobaan
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Ambang Kemiripan Wajah</label>
            <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border shadow-sm" style={{ color: 'var(--jne-red)', background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}>
              {settings.faceSimilarityThreshold ?? 60}%
            </span>
          </div>
          <input
            type="range"
            min={60}
            max={99}
            step={1}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: 'var(--border-primary)' }}
            value={settings.faceSimilarityThreshold ?? 60}
            onChange={(e) => {
              const val = e.target.value;
              update('attendance', 'faceSimilarityThreshold', val === '' ? 60 : parseInt(val, 10));
            }}
          />
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            <span>60% (Longgar)</span>
            <span>99% (Ketat)</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[11px] font-black uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>Protokol Akses</label>
        {[
          {
            key: 'allowOfflineAttendance',
            label: 'Izinkan Absensi Offline',
            desc: 'Data disimpan lokal saat tidak ada koneksi',
          },
          {
            key: 'overtimeCalculation',
            label: 'Hitung Lembur Otomatis',
            desc: 'Sinkronisasi data lembur secara otomatis',
          },
        ].map((item) => (
          <div key={item.key} className="p-4 rounded-2xl border transition-all hover:bg-(--bg-input)" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}>
            <ToggleSwitch
              checked={Boolean((settings as any)[item.key])}
              onChange={() => update('attendance', item.key, !(settings as any)[item.key])}
              label={item.label}
              description={item.desc}
            />
          </div>
        ))}
      </div>
    </div>
  );
}