'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ToggleSwitch from './ToggleSwitch';
import type { Settings } from '@/types';
import { Bell, UserPlus, ShieldAlert, Mail } from 'lucide-react';

interface NotificationsSettingsProps {
  settings: Settings['notifications'];
  update: (section: 'notifications', field: string, value: unknown) => void;
}

export default function NotificationsSettings({ settings, update }: NotificationsSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Broadcast Protocol */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Bell size={16} />
          </div>
          <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
            Broadcast Protocol
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              key: 'notifyOnLeaveRequest',
              label: 'Leave Submission',
              desc: 'Instant notification for new leave requests.',
              icon: Bell,
            },
            {
              key: 'notifyOnFaceEnrollment',
              label: 'Identity Verification',
              desc: 'Confirmation on successful biometric enrollment.',
              icon: UserPlus,
            },
            {
              key: 'notifyOnFaceFailure',
              label: 'Security Alerts',
              desc: 'Warning on repeated verification failures.',
              icon: ShieldAlert,
            },
            {
              key: 'notifyOnNewEmployee',
              label: 'Personnel Onboarding',
              desc: 'Notification when new employee logs in first time.',
              icon: UserPlus,
            },
          ].map((item) => (
            <div
              key={item.key}
              className="p-5 rounded-xl border border-border-primary bg-secondary/50 hover:border-border-hover transition-all"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-text-tertiary group-hover:text-primary transition-colors">
                  <item.icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-text-primary uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={Boolean((settings as Record<string, unknown>)[item.key])}
                onChange={() => update('notifications', item.key, !(settings as Record<string, unknown>)[item.key])}
                label=""
                description={item.desc}
              />
            </div>
          ))}
        </div>
      </div>

      {/* External Channels */}
      <div className="pt-6 border-t border-border-primary">
        <div className="p-5 rounded-xl border border-border-primary bg-secondary/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-text-tertiary">
              <Mail size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-text-primary uppercase tracking-wider">
                Email Notifications
              </p>
            </div>
            <ToggleSwitch
              checked={settings.emailNotifications}
              onChange={() =>
                update('notifications', 'emailNotifications', !settings.emailNotifications)
              }
              label=""
            />
          </div>

          <AnimatePresence>
            {settings.emailNotifications && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3 border-t border-border-primary/50">
                  <label className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider">
                    Destination Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary/50"
                    />
                    <input
                      type="email"
                      className="w-full h-10 bg-primary/5 border border-border-primary rounded-lg pl-10 pr-4 text-sm font-medium text-text-primary outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all placeholder:text-text-tertiary/40"
                      placeholder="admin@company.com"
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
