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
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div key={item.key} className="p-4 rounded-xl" style={{ border: '1px solid var(--pg-border)', background: 'var(--pg-bg)' }}>
            <ToggleSwitch
              checked={Boolean((settings as any)[item.key])}
              onChange={() => update('notifications', item.key, !(settings as any)[item.key])}
              label={item.label}
              description={item.desc}
            />
          </div>
        ))}
      </div>

      <div className="pt-2" style={{ borderTop: '1px solid var(--pg-border)' }}>
        <div className="p-4 rounded-xl" style={{ border: '1px solid var(--pg-border)', background: 'var(--pg-bg)' }}>
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-4 space-y-2"
            >
              <label className="pg-form-label">Email Penerima Notifikasi</label>
              <input
                type="email"
                className="pg-form-input"
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