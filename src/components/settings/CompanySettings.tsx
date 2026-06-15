'use client';

import type { Settings } from '@/types';

interface CompanySettingsProps {
  settings: Settings['company'];
  update: (section: 'company', field: string, value: any) => void;
}

export default function CompanySettings({ settings, update }: CompanySettingsProps) {
  const fields = [
    { label: 'Company Name', key: 'companyName', placeholder: 'PT. JNE Martapura', type: 'text' },
    { label: 'App Download URL', key: 'appDownloadUrl', placeholder: 'https://...', type: 'url' },
    { label: 'HR Email', key: 'hrEmail', placeholder: 'hr@company.com', type: 'email' },
    { label: 'HR Phone', key: 'hrPhone', placeholder: '+62...', type: 'text' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field) => (
        <div key={field.key} className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-tertiary">
            {field.label}
          </label>
          <input
            type={field.type}
            className="w-full h-10 bg-secondary border border-border-primary rounded-lg px-4 text-sm font-medium text-text-primary outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all placeholder:text-text-tertiary/40"
            placeholder={field.placeholder}
            value={(settings as any)[field.key] ?? ''}
            onChange={(e) => update('company', field.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
