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
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-[32px] border border-(--border-color) flex flex-col overflow-hidden bg-(--bg-card) shadow-sm"
      >
        {/* Panel Header */}
        <div className="flex items-center gap-6 px-10 py-8 border-b border-(--border-color) bg-slate-50/50 dark:bg-slate-900/50 relative overflow-hidden">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-slate-950 text-white shadow-2xl transition-transform hover:scale-110">
            {activeTab === 'office' && <MapPin size={28} />}
            {activeTab === 'company' && <Building size={28} />}
            {activeTab === 'attendance' && <Shield size={28} />}
            {activeTab === 'notifications' && <Bell size={28} />}
            {activeTab === 'maintenance' && <Database size={28} />}
          </div>
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter text-(--text-primary) uppercase">
              {currentTab?.label}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-(--text-secondary)">
              Parameter Operasional JNE Martapura
            </p>
          </div>
        </div>

        {/* Settings Fields */}
        <div className="p-10 space-y-8 min-h-[420px] bg-(--bg-card)">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
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
        <div className="flex items-center justify-between px-10 py-6 border-t border-(--border-color) bg-slate-50/50 dark:bg-slate-900/50">
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              >
                <CheckCircle2 size={16} /> Data Tersimpan
              </motion.div>
            )}
          </AnimatePresence>
          
          {activeTab !== 'maintenance' && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-3 ml-auto px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white bg-rose-600 shadow-xl shadow-rose-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Processing
                </>
              ) : (
                <>
                  <Save size={18} /> Update Configuration
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}