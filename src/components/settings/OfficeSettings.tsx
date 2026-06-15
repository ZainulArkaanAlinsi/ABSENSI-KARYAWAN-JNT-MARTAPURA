'use client';

import { MapPin, Navigation, LocateFixed, Target } from 'lucide-react';
import type { Settings } from '@/types';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

interface OfficeSettingsProps {
  settings: Settings['office'];
  update: (section: 'office', field: string, value: any) => void;
}

export default function OfficeSettings({ settings, update }: OfficeSettingsProps) {
  const lat = settings.latitude;
  const lng = settings.longitude;
  const latInvalid = lat != null && (Number.isNaN(lat) || lat < -90 || lat > 90);
  const lngInvalid = lng != null && (Number.isNaN(lng) || lng < -180 || lng > 180);
  const hasValidCoords = lat != null && lng != null && !latInvalid && !lngInvalid;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Target size={12} strokeWidth={3} className="text-primary" />
            Deployment Hub Name
          </label>
          <input
            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all placeholder:text-slate-300"
            placeholder="e.g. JNE Martapura Main Terminal"
            value={settings.name ?? ''}
            onChange={(e) => update('office', 'name', e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <LocateFixed size={12} strokeWidth={3} className="text-primary" />
            Operational Address
          </label>
          <textarea
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all placeholder:text-slate-300 resize-none min-h-[160px]"
            placeholder="Enter full operational coordinates and physical address..."
            value={settings.address ?? ''}
            onChange={(e) => update('office', 'address', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-10">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Latitude
            </label>
            <div className="relative group">
              <MapPin
                size={16}
                strokeWidth={2.5}
                className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${latInvalid ? 'text-red-400' : 'text-slate-300 group-focus-within:text-primary'}`}
              />
              <input
                type="number"
                step="0.000001"
                className={`w-full h-14 bg-slate-50 border rounded-2xl pl-14 pr-6 text-sm font-black text-slate-900 outline-none focus:bg-white transition-all ${latInvalid ? 'border-red-400 focus:border-red-400' : 'border-slate-100 focus:border-primary/20'}`}
                value={settings.latitude ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  update('office', 'latitude', val === '' ? null : parseFloat(val));
                }}
              />
            </div>
            {latInvalid && (
              <p className="text-[10px] font-bold text-red-500">
                Latitude harus antara -90 dan 90 (mungkin tertukar dgn Longitude).
              </p>
            )}
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Longitude
            </label>
            <div className="relative group">
              <MapPin
                size={16}
                strokeWidth={2.5}
                className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${lngInvalid ? 'text-red-400' : 'text-slate-300 group-focus-within:text-primary'}`}
              />
              <input
                type="number"
                step="0.000001"
                className={`w-full h-14 bg-slate-50 border rounded-2xl pl-14 pr-6 text-sm font-black text-slate-900 outline-none focus:bg-white transition-all ${lngInvalid ? 'border-red-400 focus:border-red-400' : 'border-slate-100 focus:border-primary/20'}`}
                value={settings.longitude ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  update('office', 'longitude', val === '' ? null : parseFloat(val));
                }}
              />
            </div>
            {lngInvalid && (
              <p className="text-[10px] font-bold text-red-500">
                Longitude harus antara -180 dan 180.
              </p>
            )}
          </div>
        </div>

        <AnimatedButton
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  update('office', 'latitude', pos.coords.latitude);
                  update('office', 'longitude', pos.coords.longitude);
                },
                () => alert('Unable to detect location. Please check browser permissions.'),
              );
            } else {
              alert('Your browser does not support geolocation.');
            }
          }}
          className="w-full h-14 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:shadow-xl hover:shadow-slate-200 transition-all"
        >
          <Navigation size={18} strokeWidth={3} className="text-primary" />
          Capture Live Coordinates
        </AnimatedButton>

        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Geofence Perimeter
              </label>
              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                Operational enforcement radius
              </p>
            </div>
            <span className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-black tracking-widest shadow-lg shadow-slate-200">
              {settings.radiusMeters ?? 50}M
            </span>
          </div>

          <div className="relative py-4 group">
            <input
              type="range"
              min={50}
              max={1000}
              step={50}
              className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
              value={settings.radiusMeters ?? 50}
              onChange={(e) => {
                const val = e.target.value;
                update('office', 'radiusMeters', val === '' ? 50 : parseInt(val, 10));
              }}
            />
            <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-widest mt-4">
              <span>50M Hub</span>
              <span>1KM Zone</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
            <MapPin size={20} strokeWidth={2.5} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">
              Active Perimeter Locked
            </p>
            <p className="text-sm font-black text-slate-900 tracking-tight">
              {settings.latitude?.toFixed(6) ?? '—'}, {settings.longitude?.toFixed(6) ?? '—'}
            </p>
          </div>
        </div>

        {/* Peta verifikasi — pastikan titik geofence APK benar */}
        {hasValidCoords ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Verifikasi Peta
              </label>
              <a
                href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
              >
                Buka di Google Maps →
              </a>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-100">
              <iframe
                title="Peta Lokasi Kantor"
                className="w-full h-56 border-0"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.008}%2C${lng + 0.008}%2C${lat + 0.008}&layer=mapnik&marker=${lat}%2C${lng}`}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400">
              Pin = titik kantor yang dipakai geofence di APK. Pastikan tepat di lokasi kantor.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <p className="text-[11px] font-bold text-slate-400">
              Isi Latitude &amp; Longitude yang valid untuk melihat peta verifikasi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
