'use client';

import { motion } from 'framer-motion';
import { MapPin, Building, Shield, Bell, Database } from 'lucide-react';
import type { TabKey } from '@/hooks/useSettingsManagement';

const iconMap = {
  office: MapPin,
  company: Building,
  attendance: Shield,
  notifications: Bell,
  maintenance: Database,
};

interface SettingsSidebarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  tabs: readonly { key: TabKey; label: string; icon: keyof typeof iconMap }[];
}

export default function SettingsSidebar({ activeTab, setActiveTab, tabs }: SettingsSidebarProps) {
  return (
    <div className="w-full xl:w-72 shrink-0">
      <div 
        className="p-6 flex flex-col gap-2 xl:sticky xl:top-28 relative rounded-[32px] overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar"
        style={{ 
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-premium)'
        }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.2em] px-3 mb-3 relative z-10 text-(--text-secondary)">
          Menu Pengaturan
        </p>
        <div className="space-y-2 relative z-10">
          {tabs.map((tab) => {
            const Icon = iconMap[tab.icon] || MapPin;
            const isActive = activeTab === tab.key;
            
            return (
              <motion.button
                key={tab.key}
                whileHover={{ y: isActive ? 0 : -2, backgroundColor: isActive ? undefined : 'var(--bg-main)' }}
                whileTap={{ y: 1 }}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[12px] font-bold transition-all text-left relative overflow-hidden group`}
                style={{
                  background: isActive ? 'var(--accent-primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-primary)',
                  boxShadow: isActive ? '0 10px 20px -5px var(--accent-primary)/30' : 'none',
                }}
              >
                <Icon size={18} className={isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100 transition-opacity'} />
                <span className="tracking-wide z-10">{tab.label}</span>
                {isActive && (
                   <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-linear-to-r from-white/10 to-transparent pointer-events-none" 
                   />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}