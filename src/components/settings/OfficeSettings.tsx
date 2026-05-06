'use client';

import { Globe, MapPin, Navigation } from 'lucide-react';
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
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">Office Identifier</label>
          <input
            className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl px-5 py-4 text-sm font-bold text-(--text-primary) outline-none focus:ring-1 focus:ring-rose-600/30 focus:border-rose-600/50 transition-all shadow-sm"
            placeholder="e.g. JNE Martapura Main Hub"
            value={settings.name ?? ''}
            onChange={(e) => update('office', 'name', e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">Physical Address</label>
          <textarea
            className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl px-5 py-4 text-sm font-bold text-(--text-primary) outline-none focus:ring-1 focus:ring-rose-600/30 focus:border-rose-600/50 transition-all shadow-sm min-h-[160px] resize-none"
            placeholder="Full operational address..."
            value={settings.address ?? ''}
            onChange={(e) => update('office', 'address', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">Latitude</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="0.000001"
                className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-(--text-primary) outline-none focus:border-rose-600/50 transition-all"
                value={settings.latitude ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  update('office', 'latitude', val === '' ? null : parseFloat(val));
                }}
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">Longitude</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="0.000001"
                className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-(--text-primary) outline-none focus:border-rose-600/50 transition-all"
                value={settings.longitude ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  update('office', 'longitude', val === '' ? null : parseFloat(val));
                }}
              />
            </div>
          </div>
        </div>

        <button
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
          className="w-full h-14 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl hover:bg-rose-600 transition-all active:scale-95 group"
        >
          <Navigation size={18} className="group-hover:animate-bounce" /> Auto-Detect Current Location
        </button>

        <div className="space-y-6 pt-2">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">Geo-Fence Radius</label>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Maximum allowed distance (meters)</span>
            </div>
            <div className="px-4 py-2 bg-rose-600 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/20 italic">
              {settings.radiusMeters ?? 0} M
            </div>
          </div>
          <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
            <input
              type="range"
              min={50}
              max={1000}
              step={50}
              className="absolute inset-0 w-full h-2 rounded-full appearance-none cursor-pointer bg-transparent accent-rose-600 z-10"
              value={settings.radiusMeters ?? 50}
              onChange={(e) => {
                const val = e.target.value;
                update('office', 'radiusMeters', val === '' ? 50 : parseInt(val, 10));
              }}
            />
            <div 
              className="absolute top-0 left-0 h-full bg-rose-600 rounded-full"
              style={{ width: `${((settings.radiusMeters ?? 50) - 50) / (1000 - 50) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
            <span>50m (Strict)</span>
            <span>1000m (Flexible)</span>
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 py-5 rounded-[24px] bg-emerald-500/5 border border-emerald-500/10 text-emerald-500">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center shrink-0">
             <Globe size={18} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Geographic Lock</p>
            <p className="text-[11px] font-black italic tracking-wider">
               {settings.latitude?.toFixed(6) ?? '--'}, {settings.longitude?.toFixed(6) ?? '--'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}