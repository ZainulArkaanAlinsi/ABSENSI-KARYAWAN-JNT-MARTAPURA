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
  className?: string;
}

export default function SettingsSidebar({
  activeTab,
  setActiveTab,
  tabs,
  className = '',
}: SettingsSidebarProps) {
  return (
    <div className={`shrink-0 flex flex-col p-8 gap-4 ${className}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] px-4 mb-4 text-slate-400">
        System Configuration
      </p>
      <div className="space-y-2">
        {tabs.map((tab) => {
          const Icon = iconMap[tab.icon] || MapPin;
          const isActive = activeTab === tab.key;

          return (
            <motion.button
              key={tab.key}
              whileHover={isActive ? {} : { x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.key)}
              className={`
                w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black transition-all text-left group relative
                ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                    : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'
                }
              `}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                className={
                  isActive
                    ? 'text-primary'
                    : 'opacity-40 group-hover:opacity-100 transition-opacity'
                }
              />
              <span className="tracking-widest uppercase">{tab.label}</span>

              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-auto p-6 rounded-2xl bg-primary/5 border border-primary/10">
        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">
          Operational State
        </p>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-600">Terminal Synchronized</span>
        </div>
      </div>
    </div>
  );
}
