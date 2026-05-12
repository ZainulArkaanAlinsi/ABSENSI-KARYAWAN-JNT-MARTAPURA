'use client';

import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useSettingsManagement } from '@/hooks/useSettingsManagement';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import SettingsPanel from '@/components/settings/SettingsPanel';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const {
    activeTab, setActiveTab,
    settings, loading, saving, saved, error,
    lastSync, update, handleSave, setError, TABS,
  } = useSettingsManagement();

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-[22px] font-black text-slate-800 tracking-tight leading-none">
          Pengaturan <span className="text-emerald-500">Sistem</span>
        </h1>
        <p className="text-[12px] text-slate-400 mt-1 font-medium">
          Konfigurasi parameter administrasi, geofencing, dan aturan jam kerja
        </p>
      </motion.div>

      {/* ── SETTINGS PANEL ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', minHeight: 600 }}
      >
        <SettingsSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={TABS}
          className="lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/60"
        />
        <div className="flex-1 overflow-y-auto">
          <SettingsPanel
            activeTab={activeTab}
            settings={settings}
            update={update}
            handleSave={handleSave}
            saving={saving}
            saved={saved}
            error={error}
            lastSync={lastSync}
            setError={setError}
            setActiveTab={setActiveTab}
            tabs={TABS}
          />
        </div>
      </motion.div>
    </div>
  );
}
