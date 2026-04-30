'use client';

import { Globe } from 'lucide-react';
import type { Settings } from '@/types';

interface OfficeSettingsProps {
  settings: Settings['office'];
  update: (section: 'office', field: string, value: any) => void;
}

export default function OfficeSettings({ settings, update }: OfficeSettingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Nama Kantor</label>
          <input
            className="w-full bg-black/5 dark:bg-white/5 border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-(--jne-red) transition-colors"
            style={{ 
              borderColor: 'var(--border-primary)', 
              color: 'var(--text-primary)',
              boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.5)'
            }}
            value={settings.name ?? ''}
            onChange={(e) => update('office', 'name', e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Alamat</label>
          <textarea
            className="w-full bg-(--bg-input) border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-(--jne-red) transition-colors shadow-inner min-h-[120px] resize-none"
            style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            value={settings.address ?? ''}
            onChange={(e) => update('office', 'address', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Latitude</label>
            <input
              type="number"
              step="0.000001"
              className="w-full bg-(--bg-input) border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-(--jne-red) transition-colors shadow-inner"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              value={settings.latitude ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                update('office', 'latitude', val === '' ? null : parseFloat(val));
              }}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Longitude</label>
            <input
              type="number"
              step="0.000001"
              className="w-full bg-(--bg-input) border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-(--jne-red) transition-colors shadow-inner"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              value={settings.longitude ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                update('office', 'longitude', val === '' ? null : parseFloat(val));
              }}
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Radius Geo-Fence</label>
            <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border shadow-sm" style={{ color: 'var(--jne-red)', background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}>
              {settings.radiusMeters ?? 0} M
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: 'var(--border-primary)' }}
            value={settings.radiusMeters ?? 50}
            onChange={(e) => {
              const val = e.target.value;
              update('office', 'radiusMeters', val === '' ? 50 : parseInt(val, 10));
            }}
          />
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            <span>50m (Dekat)</span>
            <span>500m (Lebar)</span>
          </div>
        </div>

        <div
          className="mt-6 flex items-center gap-3 px-5 py-4 rounded-2xl text-[12px] font-bold border"
          style={{
            background: 'var(--bg-input)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)',
          }}
        >
          <Globe size={18} style={{ color: 'var(--color-info)' }} />
          <span>
            Kunci lokasi satelit:{' '}
            <strong className="tracking-widest" style={{ color: 'var(--color-info)' }}>
              {settings.latitude ?? '-'}, {settings.longitude ?? '-'}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}