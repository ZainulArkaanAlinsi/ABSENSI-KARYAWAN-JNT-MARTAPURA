'use client';

import { Globe } from 'lucide-react';
import type { Settings } from '@/types';

interface OfficeSettingsProps {
  settings: Settings['office'];
  update: (section: 'office', field: string, value: any) => void;
}

export default function OfficeSettings({ settings, update }: OfficeSettingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="pg-form-label">Nama Kantor</label>
          <input
            className="pg-form-input"
            value={settings.name ?? ''}
            onChange={(e) => update('office', 'name', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="pg-form-label">Alamat</label>
          <textarea
            className="pg-form-input min-h-[120px] resize-none"
            value={settings.address ?? ''}
            onChange={(e) => update('office', 'address', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="pg-form-label">Latitude</label>
            <input
              type="number"
              step="0.000001"
              className="pg-form-input"
              value={settings.latitude ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                update('office', 'latitude', val === '' ? null : parseFloat(val));
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="pg-form-label">Longitude</label>
            <input
              type="number"
              step="0.000001"
              className="pg-form-input"
              value={settings.longitude ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                update('office', 'longitude', val === '' ? null : parseFloat(val));
              }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="pg-form-label">Radius Geo-Fence</label>
            <span className="text-sm font-semibold" style={{ color: '#7C3AED' }}>
              {settings.radiusMeters ?? 0}m
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-600"
            style={{ background: 'var(--pg-bg)' }}
            value={settings.radiusMeters ?? 50}
            onChange={(e) => {
              const val = e.target.value;
              update('office', 'radiusMeters', val === '' ? 50 : parseInt(val, 10));
            }}
          />
          <div className="flex justify-between text-xs" style={{ color: 'var(--pg-text-muted)' }}>
            <span>50m (dekat)</span>
            <span>500m (lebar)</span>
          </div>
        </div>

        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.15)',
            color: '#3B82F6',
          }}
        >
          <Globe size={16} />
          <span className="text-xs">
            Kunci lokasi:{' '}
            <strong>
              {settings.latitude ?? '-'}, {settings.longitude ?? '-'}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}