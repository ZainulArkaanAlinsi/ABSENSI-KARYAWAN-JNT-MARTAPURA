'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, CheckCircle2, MapPin, Building, Shield, Bell, Database } from 'lucide-react';
import type { TabKey } from '@/hooks/useSettingsManagement';
import OfficeSettings from './OfficeSettings';
import CompanySettings from './CompanySettings';
import AttendanceSettings from './AttendanceSettings';
import NotificationsSettings from './NotificationsSettings';
import MaintenanceSettings from './MaintenanceSettings';
import type { Settings } from '@/types';
import { InteractiveButton, GlassCard } from '@/components/ui/Interactive';

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
      <GlassCard
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col overflow-hidden border-none shadow-2xl"
      >
        {/* Panel Header */}
        <div className="flex items-center gap-8 px-10 py-10 border-b border-(--border-color) bg-(--bg-main)/50 relative overflow-hidden">
          <div className="h-20 w-20 rounded-[28px] flex items-center justify-center bg-(--accent-info) text-white shadow-2xl transition-transform hover:rotate-3">
            {activeTab === 'office' && <MapPin size={32} />}
            {activeTab === 'company' && <Building size={32} />}
            {activeTab === 'attendance' && <Shield size={32} />}
            {activeTab === 'notifications' && <Bell size={32} />}
            {activeTab === 'maintenance' && <Database size={32} />}
          </div>
          <div>
            <h3 className="text-3xl font-black italic tracking-tighter text-(--text-primary) uppercase">
              {currentTab?.label}
            </h3>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] mt-2 text-(--text-secondary)">
              Parameter Operasional JNE Martapura
            </p>
          </div>
        </div>

        {/* Settings Fields */}
        <div className="p-10 space-y-8 min-h-[420px] bg-(--bg-card)">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {activeTab === 'office' && <OfficeSettings settings={settings.office} update={update} />}
              {activeTab === 'company' && <CompanySettings settings={settings.company} update={update} />}
              {activeTab === 'attendance' && <AttendanceSettings settings={settings.attendance} update={update} />}
              {activeTab === 'notifications' && <NotificationsSettings settings={settings.notifications} update={update} />}
              {activeTab === 'maintenance' && <MaintenanceSettings />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-10 py-8 border-t border-(--border-color) bg-(--bg-main)/30">
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl bg-(--accent-success)/10 text-(--accent-success) border border-(--accent-success)/20"
              >
                <CheckCircle2 size={18} /> Konfigurasi Berhasil Disimpan
              </motion.div>
            )}
          </AnimatePresence>
          
          {activeTab !== 'maintenance' && (
            <InteractiveButton
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-3 ml-auto h-14 px-12 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white bg-(--accent-info) shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Memproses...
                </>
              ) : (
                <>
                  <Save size={20} /> Perbarui Sistem
                </>
              )}
            </InteractiveButton>
          )}
        </div>
      </GlassCard>
    </div>
  );
}