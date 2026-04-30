'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ToggleSwitch from './ToggleSwitch';
import type { Settings } from '@/types';

interface NotificationsSettingsProps {
  settings: Settings['notifications'];
  update: (section: 'notifications', field: string, value: any) => void;
}

export default function NotificationsSettings({ settings, update }: NotificationsSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          {
            key: 'notifyOnLeaveRequest',
            label: 'Permohonan Izin Baru',
            desc: 'Notifikasi saat ada pengajuan izin baru',
          },
          {
            key: 'notifyOnFaceEnrollment',
            label: 'Pendaftaran Wajah Berhasil',
            desc: 'Konfirmasi saat biometrik terdaftar',
          },
          {
            key: 'notifyOnFaceFailure',
            label: 'Kegagalan Verifikasi Wajah',
            desc: 'Peringatan pada percobaan berulang yang gagal',
          },
          {
            key: 'notifyOnNewEmployee',
            label: 'Karyawan Baru Aktif',
            desc: 'Notifikasi login awal karyawan baru',
          },
        ].map((item) => (
          <div key={item.key} className="p-5 rounded-2xl border transition-all hover:bg-(--bg-input)" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}>
            <ToggleSwitch
              checked={Boolean((settings as any)[item.key])}
              onChange={() => update('notifications', item.key, !(settings as any)[item.key])}
              label={item.label}
              description={item.desc}
            />
          </div>
        ))}
      </div>

      <div className="pt-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="p-5 rounded-2xl border transition-all hover:bg-(--bg-input)" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}>
          <ToggleSwitch
            checked={settings.emailNotifications}
            onChange={() => update('notifications', 'emailNotifications', !settings.emailNotifications)}
            label="Notifikasi Email"
            description="Kirim ringkasan harian ke email admin"
          />
        </div>

        <AnimatePresence>
          {settings.emailNotifications && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="overflow-hidden mt-6 space-y-3"
            >
              <label className="text-[11px] font-black uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>Email Penerima Notifikasi</label>
              <input
                type="email"
                className="w-full bg-black/5 dark:bg-white/5 border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-(--jne-red) transition-colors"
                style={{ 
                  borderColor: 'var(--border-primary)', 
                  color: 'var(--text-primary)',
                  boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.5)'
                }}
                placeholder="admin@perusahaan.com"
                value={settings.adminEmail ?? ''}
                onChange={(e) => update('notifications', 'adminEmail', e.target.value)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}