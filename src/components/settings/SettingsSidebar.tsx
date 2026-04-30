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
    <div className="w-full xl:w-72 shrink-0">
      <div 
        className="p-6 flex flex-col gap-2 xl:sticky xl:top-28 relative rounded-3xl"
        style={{ 
          background: 'var(--bg-card)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), inset 0 2px 0 rgba(255, 255, 255, 0.8)'
        }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.2em] px-3 mb-3 relative z-10" style={{ color: 'var(--text-muted)' }}>
          Menu Pengaturan
        </p>
        <div className="space-y-3 relative z-10">
          {tabs.map((tab) => {
            const Icon = iconMap[tab.icon] || MapPin;
            const isActive = activeTab === tab.key;
            
            return (
              <motion.button
                key={tab.key}
                whileHover={{ y: isActive ? 0 : -2, backgroundColor: isActive ? undefined : 'var(--bg-input)' }}
                whileTap={{ y: 2, boxShadow: isActive ? '0 0px 0 #b31217, 0 2px 4px rgba(227,30,36,0.3)' : 'inset 0 3px 5px rgba(0,0,0,0.1)' }}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all text-left relative overflow-hidden group`}
                style={{
                  background: isActive ? 'var(--jne-red)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 4px 0 #b31217, 0 6px 15px rgba(227,30,36,0.3), inset 0 2px 0 rgba(255,255,255,0.2)' : 'none',
                  border: isActive ? 'none' : '1px solid transparent',
                  marginBottom: isActive ? '4px' : '0'
                }}
              >
                <Icon size={18} className={isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100 transition-opacity'} style={{ filter: isActive ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' : 'none' }} />
                <span className="tracking-wide z-10" style={{ textShadow: isActive ? '0 2px 2px rgba(0,0,0,0.2)' : 'none' }}>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}