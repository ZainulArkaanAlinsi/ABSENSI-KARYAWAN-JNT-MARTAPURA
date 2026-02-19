'use client';

import { useEffect, useState } from 'react';
import { Save, MapPin, Building, Bell, Shield, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getSystemSettings, updateSystemSettings } from '@/lib/firestore';
import type { SystemSettings } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';

const TABS = [
  { key: 'office', label: 'Lokasi Kantor', icon: MapPin },
  { key: 'company', label: 'Perusahaan', icon: Building },
  { key: 'attendance', label: 'Parameter Absensi', icon: Shield },
  { key: 'notifications', label: 'Notifikasi', icon: Bell },
];

const DEFAULT_SETTINGS: SystemSettings = {
  office: { name: 'JNE MTP', address: '', latitude: -6.2, longitude: 106.8, radiusMeters: 100 },
  company: { companyName: 'JNE MTP', hrEmail: '', hrPhone: '', appDownloadUrl: '' },
  attendance: { maxFaceAttempts: 3, faceSimilarityThreshold: 80, allowOfflineAttendance: true, overtimeCalculation: true },
  notifications: { notifyOnLeaveRequest: true, notifyOnFaceEnrollment: true, notifyOnFaceFailure: true, notifyOnNewEmployee: true, emailNotifications: false, adminEmail: '' },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('office');
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSystemSettings().then(data => {
      if (data) setSettings(data);
      setLoading(false);
    });
  }, []);

  const update = (section: keyof SystemSettings, field: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSystemSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <AdminLayout title="Pengaturan Sistem"><PageLoader /></AdminLayout>;

  return (
    <AdminLayout title="Pengaturan Sistem" subtitle="Konfigurasi global sistem absensi">
      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-52 shrink-0">
          <div className="card p-2 space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
                style={{
                  background: activeTab === tab.key ? '#FEE2E2' : 'transparent',
                  color: activeTab === tab.key ? '#E31E24' : '#64748B',
                }}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="card p-6">
            {/* Office Settings */}
            {activeTab === 'office' && (
              <div className="space-y-5">
                <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">Pengaturan Lokasi Kantor</h3>
                <div>
                  <label className="form-label">Nama Kantor</label>
                  <input className="form-input" value={settings.office.name}
                    onChange={e => update('office', 'name', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Alamat Kantor</label>
                  <textarea className="form-input" style={{ minHeight: 80 }} value={settings.office.address}
                    onChange={e => update('office', 'address', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Latitude GPS</label>
                    <input type="number" step="0.000001" className="form-input" value={settings.office.latitude}
                      onChange={e => update('office', 'latitude', parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <label className="form-label">Longitude GPS</label>
                    <input type="number" step="0.000001" className="form-input" value={settings.office.longitude}
                      onChange={e => update('office', 'longitude', parseFloat(e.target.value))} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Radius Absensi: <strong>{settings.office.radiusMeters} meter</strong></label>
                  <input type="range" min={50} max={500} step={10} className="w-full mt-2"
                    value={settings.office.radiusMeters}
                    onChange={e => update('office', 'radiusMeters', parseInt(e.target.value))}
                    style={{ accentColor: '#E31E24' }}
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>50m</span><span>500m</span>
                  </div>
                </div>
                <div
                  className="p-4 rounded-xl text-sm"
                  style={{ background: '#DBEAFE', color: '#1D4ED8' }}
                >
                  📍 Koordinat: {settings.office.latitude}, {settings.office.longitude} — Radius: {settings.office.radiusMeters}m
                </div>
              </div>
            )}

            {/* Company Settings */}
            {activeTab === 'company' && (
              <div className="space-y-5">
                <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">Informasi Perusahaan</h3>
                <div>
                  <label className="form-label">Nama Perusahaan</label>
                  <input className="form-input" value={settings.company.companyName}
                    onChange={e => update('company', 'companyName', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Email HR</label>
                    <input type="email" className="form-input" value={settings.company.hrEmail}
                      onChange={e => update('company', 'hrEmail', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Telepon HR</label>
                    <input className="form-input" value={settings.company.hrPhone}
                      onChange={e => update('company', 'hrPhone', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Link Download Aplikasi</label>
                  <input className="form-input" placeholder="https://play.google.com/..." value={settings.company.appDownloadUrl}
                    onChange={e => update('company', 'appDownloadUrl', e.target.value)} />
                </div>
              </div>
            )}

            {/* Attendance Settings */}
            {activeTab === 'attendance' && (
              <div className="space-y-5">
                <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">Parameter Absensi</h3>
                <div>
                  <label className="form-label">Maksimal Percobaan Face Recognition</label>
                  <input type="number" min={1} max={10} className="form-input" value={settings.attendance.maxFaceAttempts}
                    onChange={e => update('attendance', 'maxFaceAttempts', parseInt(e.target.value))} />
                  <p className="text-xs text-slate-400 mt-1">Karyawan akan diblokir setelah melebihi batas percobaan.</p>
                </div>
                <div>
                  <label className="form-label">
                    Threshold Kemiripan Wajah: <strong>{settings.attendance.faceSimilarityThreshold}%</strong>
                  </label>
                  <input type="range" min={60} max={99} step={1} className="w-full mt-2"
                    value={settings.attendance.faceSimilarityThreshold}
                    onChange={e => update('attendance', 'faceSimilarityThreshold', parseInt(e.target.value))}
                    style={{ accentColor: '#E31E24' }}
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>60% (longgar)</span><span>99% (ketat)</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'allowOfflineAttendance', label: 'Izinkan Absensi Offline', desc: 'Data tersinkronisasi saat koneksi pulih' },
                    { key: 'overtimeCalculation', label: 'Hitung Lembur Otomatis', desc: 'Berdasarkan jam pulang vs shift' },
                  ].map(item => (
                    <label key={item.key} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={settings.attendance[item.key as keyof typeof settings.attendance] as boolean}
                        onChange={e => update('attendance', item.key, e.target.checked)}
                        style={{ accentColor: '#E31E24' }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">Pengaturan Notifikasi Admin</h3>
                <div className="space-y-3">
                  {[
                    { key: 'notifyOnLeaveRequest', label: 'Pengajuan Izin Baru', desc: 'Notifikasi saat karyawan mengajukan izin' },
                    { key: 'notifyOnFaceEnrollment', label: 'Pendaftaran Wajah Selesai', desc: 'Notifikasi saat karyawan mendaftar wajah' },
                    { key: 'notifyOnFaceFailure', label: 'Kegagalan Verifikasi Wajah', desc: 'Notifikasi saat karyawan gagal verifikasi berulang' },
                    { key: 'notifyOnNewEmployee', label: 'Karyawan Baru Aktif', desc: 'Notifikasi saat karyawan baru pertama login' },
                    { key: 'emailNotifications', label: 'Notifikasi via Email', desc: 'Kirim ringkasan harian ke email admin' },
                  ].map(item => (
                    <label key={item.key} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                        onChange={e => update('notifications', item.key, e.target.checked)}
                        style={{ accentColor: '#E31E24' }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {settings.notifications.emailNotifications && (
                  <div>
                    <label className="form-label">Email Penerima Notifikasi</label>
                    <input type="email" className="form-input" placeholder="admin@jnemtp.com"
                      value={settings.notifications.adminEmail}
                      onChange={e => update('notifications', 'adminEmail', e.target.value)} />
                  </div>
                )}
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</> : <><Save size={15} /> Simpan Pengaturan</>}
              </button>
              {saved && (
                <span className="text-sm font-semibold" style={{ color: '#16A34A' }}>
                  ✓ Pengaturan berhasil disimpan!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
