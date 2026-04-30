'use client';

import type { Settings } from '@/types';

interface CompanySettingsProps {
  settings: Settings['company'];
  update: (section: 'company', field: string, value: any) => void;
}

export default function CompanySettings({ settings, update }: CompanySettingsProps) {
  const fields = [
    { label: 'Nama Perusahaan', key: 'companyName', placeholder: 'PT. Example', type: 'text' },
    { label: 'URL Download APK', key: 'appDownloadUrl', placeholder: 'https://...', type: 'url' },
    { label: 'Email HR', key: 'hrEmail', placeholder: 'hr@example.com', type: 'email' },
    { label: 'No. Telepon HR', key: 'hrPhone', placeholder: '+62...', type: 'text' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {fields.map((field) => (
        <div key={field.key} className="space-y-3">
          <label className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{field.label}</label>
          <input
            type={field.type}
            className="w-full bg-black/5 dark:bg-white/5 border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-(--jne-red) transition-colors"
            style={{ 
              borderColor: 'var(--border-primary)', 
              color: 'var(--text-primary)',
              boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.5)'
            }}
            placeholder={field.placeholder}
            value={(settings as any)[field.key] ?? ''}
            onChange={(e) => update('company', field.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}