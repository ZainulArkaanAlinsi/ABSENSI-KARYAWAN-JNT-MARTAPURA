'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Loader2,
  CheckCircle2,
  MapPin,
  Building,
  Shield,
  Bell,
  Database,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import type { TabKey } from '@/hooks/useSettingsManagement';
import type { Settings } from '@/types';
import { InteractiveButton } from '@/components/ui/Interactive';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import OfficeSettings from './OfficeSettings';
import CompanySettings from './CompanySettings';
import AttendanceSettings from './AttendanceSettings';
import NotificationsSettings from './NotificationsSettings';
import MaintenanceSettings from './MaintenanceSettings';

interface SettingsPanelProps {
  activeTab: TabKey;
  settings: Settings;
  update: (section: keyof Settings, field: string, value: any) => void;
  handleSave: () => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
  lastSync: Date | null;
  setError: (msg: string | null) => void;
  setActiveTab: (tab: TabKey) => void;
  tabs: readonly { key: TabKey; label: string }[];
}

export default function SettingsPanel({
  activeTab,
  settings,
  update,
  handleSave,
  saving,
  saved,
  error,
  lastSync,
  setError,
  setActiveTab,
  tabs,
}: SettingsPanelProps) {
  const currentTab = tabs.find((t) => t.key === activeTab);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Panel Header */}
      <div className="flex items-center gap-6 px-10 py-8 border-b border-slate-50">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-sm shrink-0">
          {activeTab === 'office' && <MapPin size={22} strokeWidth={1.5} />}
          {activeTab === 'company' && <Building size={22} strokeWidth={1.5} />}
          {activeTab === 'attendance' && <Shield size={22} strokeWidth={1.5} />}
          {activeTab === 'notifications' && <Bell size={22} strokeWidth={1.5} />}
          {activeTab === 'maintenance' && <Database size={22} strokeWidth={1.5} />}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic leading-none">
            {currentTab?.label}
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
            Tactical Parameters & Configuration
          </p>
        </div>
        {lastSync && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest shrink-0">
            <RefreshCw size={12} strokeWidth={3} className="animate-spin-slow" />
            Live Sync
          </div>
        )}
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-10 mt-6 flex items-start gap-4 px-6 py-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600"
            role="alert"
          >
            <AlertCircle size={18} strokeWidth={2.5} className="shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                System Exception
              </p>
              <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Fields */}
      <div className="flex-1 p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'office' && (
              <OfficeSettings settings={settings.office} update={update} />
            )}
            {activeTab === 'company' && (
              <CompanySettings settings={settings.company} update={update} />
            )}
            {activeTab === 'attendance' && (
              <AttendanceSettings settings={settings.attendance} update={update} />
            )}
            {activeTab === 'notifications' && (
              <NotificationsSettings settings={settings.notifications} update={update} />
            )}
            {activeTab === 'maintenance' && <MaintenanceSettings />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-10 py-6 border-t border-slate-50 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {saved && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-200"
              >
                <CheckCircle2 size={14} strokeWidth={3} />
                Parameters Locked
              </motion.div>
            )}
            {saving && (
              <motion.div
                key="saving"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-slate-900 text-white"
              >
                <Loader2 size={14} strokeWidth={3} className="animate-spin" />
                Encrypting Data...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {activeTab !== 'maintenance' && (
          <AnimatedButton
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 h-14 px-10 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {saving ? (
              <Loader2 size={18} strokeWidth={3} className="animate-spin" />
            ) : (
              <Save size={18} strokeWidth={2.5} />
            )}
            Save Configuration
          </AnimatedButton>
        )}
      </div>
    </div>
  );
}
