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
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">{field.label}</label>
          <input
            type={field.type}
            className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl px-5 py-4 text-sm font-black text-(--text-primary) outline-none focus:border-(--accent-info)/50 transition-all shadow-sm placeholder:text-(--text-secondary) placeholder:opacity-30"
            placeholder={field.placeholder}
            value={(settings as any)[field.key] ?? ''}
            onChange={(e) => update('company', field.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}