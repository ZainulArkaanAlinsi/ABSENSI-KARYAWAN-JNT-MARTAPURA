import { useState, useEffect } from 'react';
import { MapPin, Building, Bell, Shield } from 'lucide-react';
import { getSystemSettings, updateSystemSettings } from '@/lib/firestore';
import type { SystemSettings } from '@/types';

export const TABS = [
  { key: 'office', label: 'Lokasi Kantor', icon: MapPin },
  { key: 'company', label: 'Perusahaan', icon: Building },
  { key: 'attendance', label: 'Parameter Absensi', icon: Shield },
  { key: 'notifications', label: 'Notifikasi', icon: Bell },
];

export const DEFAULT_SETTINGS: SystemSettings = {
  office: { name: 'JNE MTP', address: '', latitude: -6.2, longitude: 106.8, radiusMeters: 100 },
  company: { companyName: 'JNE MTP', hrEmail: '', hrPhone: '', appDownloadUrl: '' },
  attendance: { maxFaceAttempts: 3, faceSimilarityThreshold: 80, allowOfflineAttendance: true, overtimeCalculation: true },
  notifications: { notifyOnLeaveRequest: true, notifyOnFaceEnrollment: true, notifyOnFaceFailure: true, notifyOnNewEmployee: true, emailNotifications: false, adminEmail: '' },
};

export function useSettingsManagement() {
  const [activeTab, setActiveTab] = useState('office');
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSystemSettings().then(data => {
      if (data) setSettings(data);
      setLoading(false);
    });
  }, []);

  const update = (section: keyof SystemSettings, field: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSystemSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return {
    activeTab,
    setActiveTab,
    settings,
    loading,
    saving,
    saved,
    update,
    handleSave,
  };
}
