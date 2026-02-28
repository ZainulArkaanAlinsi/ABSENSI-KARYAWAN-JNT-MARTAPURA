'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import type { TabKey } from '@/hooks/useSettingsManagement';
import OfficeSettings from './OfficeSettings';
import CompanySettings from './CompanySettings';
import AttendanceSettings from './AttendanceSettings';
import NotificationsSettings from './NotificationsSettings';
import type { Settings } from '@/types';

interface SettingsPanelProps {
  activeTab: TabKey;
  settings: Settings;
  update: (section: keyof Settings, field: string, value: any) => void;
  handleSave: () => void;
  saving: boolean;
  saved: boolean;
  tabs: readonly { key: TabKey; label: string }[];
}

export default function SettingsPanel({
  activeTab,
  settings,
  update,
  handleSave,
  saving,
  saved,
  tabs,
}: SettingsPanelProps) {
  const currentTab = tabs.find(t => t.key === activeTab);

  return (
    <div className="flex-1 min-w-0">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="pg-card p-6"
      >
        {/* Panel Header */}
        <div className="flex items-center gap-3 mb-6 pb-5" style={{ borderBottom: '1px solid var(--pg-border)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
            {/* icon bisa ditambahkan nanti */}
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--pg-text-primary)' }}>
              {currentTab?.label}
            </h3>
            <p className="text-xs" style={{ color: 'var(--pg-text-muted)' }}>
              Kelola konfigurasi {currentTab?.label.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Settings Fields */}
        <div className="space-y-6 min-h-[420px]">
          {activeTab === 'office' && <OfficeSettings settings={settings.office} update={update} />}
          {activeTab === 'company' && <CompanySettings settings={settings.company} update={update} />}
          {activeTab === 'attendance' && <AttendanceSettings settings={settings.attendance} update={update} />}
          {activeTab === 'notifications' && <NotificationsSettings settings={settings.notifications} update={update} />}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid var(--pg-border)' }}>
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl"
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  color: '#10B981',
                  border: '1px solid rgba(16,185,129,0.2)',
                }}
              >
                <CheckCircle2 size={15} /> Pengaturan berhasil disimpan
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="pg-btn-primary flex items-center gap-2 ml-auto"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save size={15} /> Simpan Perubahan
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}