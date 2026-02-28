'use client';

import { motion } from 'framer-motion';
import { MapPin, Building, Shield, Bell } from 'lucide-react';
import type { TabKey } from '@/hooks/useSettingsManagement';

const iconMap = {
  office: MapPin,
  company: Building,
  attendance: Shield,
  notifications: Bell,
};

interface SettingsSidebarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  tabs: readonly { key: TabKey; label: string; icon: keyof typeof iconMap }[];
}

export default function SettingsSidebar({ activeTab, setActiveTab, tabs }: SettingsSidebarProps) {
  return (
    <div className="w-full xl:w-60 shrink-0">
      <div className="pg-card p-2 xl:sticky xl:top-28">
        <p className="text-xs font-semibold px-3 py-2" style={{ color: 'var(--pg-text-muted)' }}>
          Menu Pengaturan
        </p>
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = iconMap[tab.icon] || MapPin;
            return (
              <motion.button
                key={tab.key}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.key)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{
                  background: activeTab === tab.key ? '#7C3AED' : 'transparent',
                  color: activeTab === tab.key ? '#fff' : 'var(--pg-text-secondary)',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}