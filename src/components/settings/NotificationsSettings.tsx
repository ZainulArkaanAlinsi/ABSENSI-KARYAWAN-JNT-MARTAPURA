'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ToggleSwitch from './ToggleSwitch';
import type { Settings } from '@/types';
import { Bell, UserPlus, ShieldAlert, Mail, Smartphone, Radio } from 'lucide-react';

interface NotificationsSettingsProps {
  settings: Settings['notifications'];
  update: (section: 'notifications', field: string, value: any) => void;
}

export default function NotificationsSettings({ settings, update }: NotificationsSettingsProps) {
  return (
    <div className="space-y-10">
      {/* Real-time Alerts */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-rose-600/10 text-rose-600 flex items-center justify-center">
              <Radio size={18} />
           </div>
           <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Broadcast Protocol</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              key: 'notifyOnLeaveRequest',
              label: 'Leave Submission',
              desc: 'Notifikasi instan untuk pengajuan izin baru.',
              icon: Bell
            },
            {
              key: 'notifyOnFaceEnrollment',
              label: 'Identity Verification',
              desc: 'Konfirmasi pendaftaran biometrik sukses.',
              icon: Smartphone
            },
            {
              key: 'notifyOnFaceFailure',
              label: 'Security Breaches',
              desc: 'Peringatan kegagalan verifikasi berulang.',
              icon: ShieldAlert
            },
            {
              key: 'notifyOnNewEmployee',
              label: 'Personnel Onboarding',
              desc: 'Status login pertama karyawan baru.',
              icon: UserPlus
            },
          ].map((item) => (
            <div key={item.key} className="p-6 rounded-[24px] border border-(--border-color) bg-(--bg-main) hover:border-rose-600/30 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-rose-600 transition-colors">
                    <item.icon size={20} />
                 </div>
                 <div className="flex-1">
                    <p className="text-[11px] font-black text-(--text-primary) uppercase tracking-widest">{item.label}</p>
                 </div>
              </div>
              <ToggleSwitch
                checked={Boolean((settings as any)[item.key])}
                onChange={() => update('notifications', item.key, !(settings as any)[item.key])}
                label=""
                description={item.desc}
              />
            </div>
          ))}
        </div>
      </div>

      {/* External Channels */}
      <div className="pt-8 border-t border-(--border-color)">
        <div className="p-6 rounded-[24px] border border-(--border-color) bg-(--bg-main) hover:border-rose-600/30 transition-all group">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-rose-600 transition-colors">
                <Mail size={20} />
             </div>
             <div className="flex-1">
                <p className="text-[11px] font-black text-(--text-primary) uppercase tracking-widest">Enterprise Email Bridge</p>
             </div>
          </div>
          <ToggleSwitch
            checked={settings.emailNotifications}
            onChange={() => update('notifications', 'emailNotifications', !settings.emailNotifications)}
            label=""
            description="Kirim ringkasan operasional harian ke email pusat."
          />
          
          <AnimatePresence>
            {settings.emailNotifications && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-8"
              >
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Destination Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      className="w-full h-14 bg-(--bg-main) border border-(--border-color) rounded-2xl pl-12 pr-6 text-sm font-black text-(--text-primary) outline-none focus:border-rose-600/50 transition-all shadow-sm"
                      placeholder="admin.nexus@jne.mtp.com"
                      value={settings.adminEmail ?? ''}
                      onChange={(e) => update('notifications', 'adminEmail', e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}