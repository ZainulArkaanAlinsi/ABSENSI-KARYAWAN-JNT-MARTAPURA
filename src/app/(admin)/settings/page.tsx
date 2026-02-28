'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useSettingsManagement } from '@/hooks/useSettingsManagement';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import SettingsPanel from '@/components/settings/SettingsPanel';

export default function SettingsPage() {
  const {
    activeTab,
    setActiveTab,
    settings,
    loading,
    saving,
    saved,
    update,
    handleSave,
    TABS, // ← diambil dari hook
  } = useSettingsManagement();

  if (loading) {
    return (
      <AdminLayout title="Pengaturan">
        <div className="py-32 flex justify-center">
          <PageLoader />
        </div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout title="Pengaturan">
        <div className="py-32 flex justify-center">
          <PageLoader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Pengaturan" subtitle="Konfigurasi sistem & parameter global">
      <div className="flex flex-col xl:flex-row gap-5">
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />
        <SettingsPanel
          activeTab={activeTab}
          settings={settings}
          update={update}
          handleSave={handleSave}
          saving={saving}
          saved={saved}
          tabs={TABS}
        />
      </div>
    </AdminLayout>
  );
}