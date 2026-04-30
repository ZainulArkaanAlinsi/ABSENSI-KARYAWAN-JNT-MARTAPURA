'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, CheckCircle2, Settings as SettingsIcon } from 'lucide-react';
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
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl border flex flex-col overflow-hidden relative"
        style={{ 
          background: 'var(--bg-card)', 
          borderColor: 'var(--border-primary)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), inset 0 2px 0 rgba(255, 255, 255, 0.8)'
        }}
      >
        {/* Panel Header */}
        <div className="flex items-center gap-5 px-8 py-7 border-b relative z-10" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-sidebar)', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner" style={{ background: 'rgba(0, 0, 0, 0.2)', boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.1)' }}>
            <SettingsIcon size={24} style={{ color: '#fff', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }} />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tighter text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              {currentTab?.label}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-white/80">
              Konfigurasi Parameter Sistem
            </p>
          </div>
        </div>

        {/* Settings Fields */}
        <div className="p-8 space-y-8 min-h-[420px] relative z-10" style={{ background: 'var(--bg-card)' }}>
          {activeTab === 'office' && <OfficeSettings settings={settings.office} update={update} />}
          {activeTab === 'company' && <CompanySettings settings={settings.company} update={update} />}
          {activeTab === 'attendance' && <AttendanceSettings settings={settings.attendance} update={update} />}
          {activeTab === 'notifications' && <NotificationsSettings settings={settings.notifications} update={update} />}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-8 py-5 border-t relative z-10" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-sidebar)', boxShadow: '0 -4px 20px -2px rgba(0,0,0,0.1)' }}>
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -10 }}
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl"
                style={{
                  background: '#10B981',
                  color: '#fff',
                  boxShadow: '0 4px 0 #059669, 0 5px 10px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              >
                <CheckCircle2 size={16} /> Tersimpan
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 2, boxShadow: '0 0px 0 #b31217, 0 2px 4px rgba(227,30,36,0.3)' }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 ml-auto px-8 py-3.5 rounded-xl font-black text-[12px] uppercase tracking-[0.15em] text-white transition-all"
            style={{ 
              background: saving ? 'var(--text-muted)' : 'var(--jne-red)',
              boxShadow: saving ? '0 4px 0 #64748b' : '0 4px 0 #b31217, 0 8px 15px rgba(227,30,36,0.4), inset 0 2px 0 rgba(255,255,255,0.2)'
            }}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processing
              </>
            ) : (
              <>
                <Save size={16} style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }} /> Simpan Perubahan
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}