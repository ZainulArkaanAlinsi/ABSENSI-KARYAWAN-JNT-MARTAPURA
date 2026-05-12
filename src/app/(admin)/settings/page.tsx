'use client';

import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useSettingsManagement } from '@/hooks/useSettingsManagement';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import SettingsPanel from '@/components/settings/SettingsPanel';
import { Settings as SettingsIcon, Shield, Bell, Database, Globe, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BentoCard } from '@/components/ui/BentoCard';

export default function SettingsPage() {
  const router = useRouter();
  const {
    activeTab,
    setActiveTab,
    settings,
    loading,
    saving,
    saved,
    error,
    lastSync,
    update,
    handleSave,
    setError,
    TABS,
  } = useSettingsManagement();

  if (loading || !settings) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-[60vh]">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 w-full pb-20">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            <SettingsIcon size={12} strokeWidth={3} className="text-primary" />
            Control Center
            <span className="text-slate-200">/</span>
            <span className="text-primary italic">Terminal Config</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
            System <span className="text-primary not-italic font-medium">Settings</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 max-w-xl leading-relaxed">
            Configure global administrative parameters, geofencing coordinates, and tactical telemetry thresholds.
          </p>
        </div>
      </div>

      {/* ── SETTINGS CONTAINER ── */}
      <BentoCard className="p-0 overflow-hidden flex flex-col lg:flex-row min-h-[700px]" hoverEffect={false}>
        <SettingsSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          tabs={TABS} 
          className="lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-50 bg-slate-50/50"
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
      </BentoCard>
    </div>
  );
}