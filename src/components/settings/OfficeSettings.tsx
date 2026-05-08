'use client';

import { Globe, MapPin, Navigation } from 'lucide-react';
import { InteractiveButton } from '@/components/ui/Interactive';
import type { Settings } from '@/types';

interface OfficeSettingsProps {
  settings: Settings['office'];
  update: (section: 'office', field: string, value: any) => void;
}

export default function OfficeSettings({ settings, update }: OfficeSettingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">Identitas Kantor</label>
          <input
            className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl px-5 py-4 text-sm font-bold text-(--text-primary) outline-none focus:border-(--accent-info)/50 transition-all shadow-sm"
            placeholder="Contoh: JNE Martapura Main Hub"
            value={settings.name ?? ''}
            onChange={(e) => update('office', 'name', e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">Alamat Fisik Operasional</label>
          <textarea
            className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl px-5 py-4 text-sm font-bold text-(--text-primary) outline-none focus:border-(--accent-info)/50 transition-all shadow-sm min-h-[160px] resize-none"
            placeholder="Alamat lengkap operasional..."
            value={settings.address ?? ''}
            onChange={(e) => update('office', 'address', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">Garis Lintang (Latitude)</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-secondary) opacity-40" />
              <input
                type="number"
                step="0.000001"
                className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-(--text-primary) outline-none focus:border-(--accent-info)/50 transition-all shadow-sm"
                value={settings.latitude ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  update('office', 'latitude', val === '' ? null : parseFloat(val));
                }}
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">Garis Bujur (Longitude)</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-secondary) opacity-40" />
              <input
                type="number"
                step="0.000001"
                className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-(--text-primary) outline-none focus:border-(--accent-info)/50 transition-all shadow-sm"
                value={settings.longitude ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  update('office', 'longitude', val === '' ? null : parseFloat(val));
                }}
              />
            </div>
          </div>
        </div>

        <InteractiveButton
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  update('office', 'latitude', position.coords.latitude);
                  update('office', 'longitude', position.coords.longitude);
                },
                (error) => alert('Gagal mendeteksi lokasi. Pastikan izin lokasi browser Anda aktif.')
              );
            } else {
              alert('Browser tidak mendukung deteksi lokasi.');
            }
          }}
          className="w-full h-16 bg-(--bg-main) text-(--text-primary) rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 border border-(--border-color) hover:border-(--accent-info)/50 transition-all group shadow-sm"
        >
          <Navigation size={20} className="group-hover:animate-bounce text-(--accent-info)" /> 
          Deteksi Koordinat Otomatis
        </InteractiveButton>

        <div className="space-y-6 pt-2">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">Radius Geo-Fence</label>
              <span className="text-[9px] font-bold text-(--text-secondary) opacity-50 uppercase tracking-widest mt-1 italic">Jarak maksimal yang diizinkan (meter)</span>
            </div>
            <div className="px-4 py-2 bg-(--accent-info) text-white text-xs font-black rounded-xl shadow-lg shadow-(--accent-info)/20 italic">
              {settings.radiusMeters ?? 0} M
            </div>
          </div>
          <div className="relative h-2 w-full bg-(--bg-main) rounded-full border border-(--border-color)">
            <input
              type="range"
              min={50}
              max={1000}
              step={50}
              className="absolute inset-0 w-full h-2 rounded-full appearance-none cursor-pointer bg-transparent accent-(--accent-info) z-10"
              value={settings.radiusMeters ?? 50}
              onChange={(e) => {
                const val = e.target.value;
                update('office', 'radiusMeters', val === '' ? 50 : parseInt(val, 10));
              }}
            />
            <div 
              className="absolute top-0 left-0 h-full bg-(--accent-info) rounded-full shadow-[0_0_15px_rgba(14,116,144,0.3)]"
              style={{ width: `${((settings.radiusMeters ?? 50) - 50) / (1000 - 50) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-(--text-secondary) opacity-50">
            <span>50m (Ketat)</span>
            <span>1000m (Fleksibel)</span>
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-(--bg-main) border border-(--border-color) text-(--accent-success)">
          <div className="w-10 h-10 rounded-xl bg-(--bg-card) shadow-sm flex items-center justify-center shrink-0 border border-(--border-color)">
             <Globe size={18} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Kunci Geografis Aktif</p>
            <p className="text-[11px] font-black italic tracking-wider text-(--text-primary)">
               {settings.latitude?.toFixed(6) ?? '--'}, {settings.longitude?.toFixed(6) ?? '--'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}