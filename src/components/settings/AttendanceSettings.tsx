'use client';

import ToggleSwitch from './ToggleSwitch';
import type { Settings } from '@/types';


interface AttendanceSettingsProps {
  settings: Settings['attendance'];
  update: (section: 'attendance', field: string, value: any) => void;
}

export default function AttendanceSettings({ settings, update }: AttendanceSettingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="pg-form-label">Maks. Percobaan Wajah</label>
          <input
            type="number"
            min={1}
            max={10}
            className="pg-form-input"
            value={settings.maxFaceAttempts ?? 1}
            onChange={(e) => {
              const val = e.target.value;
              update('attendance', 'maxFaceAttempts', val === '' ? 1 : parseInt(val, 10));
            }}
          />
          <p className="text-xs" style={{ color: 'var(--pg-text-muted)' }}>
            Kunci otomatis setelah batas percobaan
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="pg-form-label">Ambang Kemiripan Wajah</label>
            <span className="text-sm font-semibold" style={{ color: '#7C3AED' }}>
              {settings.faceSimilarityThreshold ?? 60}%
            </span>
          </div>
          <input
            type="range"
            min={60}
            max={99}
            step={1}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-600"
            value={settings.faceSimilarityThreshold ?? 60}
            onChange={(e) => {
              const val = e.target.value;
              update('attendance', 'faceSimilarityThreshold', val === '' ? 60 : parseInt(val, 10));
            }}
          />
          <div className="flex justify-between text-xs" style={{ color: 'var(--pg-text-muted)' }}>
            <span>60% (longgar)</span>
            <span>99% (ketat)</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="pg-form-label">Protokol Akses</label>
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
          <div key={item.key} className="p-4 rounded-xl" style={{ border: '1px solid var(--pg-border)', background: 'var(--pg-bg)' }}>
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