import { useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings } from '@/lib/firestore/settings';
import type { Settings } from '@/types';

export const TABS = [
  { key: 'office', label: 'Kantor & Lokasi', icon: 'office' },
  { key: 'company', label: 'Perusahaan', icon: 'company' },
  { key: 'attendance', label: 'Absensi', icon: 'attendance' },
  { key: 'notifications', label: 'Notifikasi', icon: 'notifications' },
] as const;

export type TabKey = typeof TABS[number]['key'];

export function useSettingsManagement() {
  const [activeTab, setActiveTab] = useState<TabKey>('office');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getSettings();
        if (data) {
          setSettings(data);
        } else {
          // Default settings
          setSettings({
            office: { name: '', address: '', latitude: null, longitude: null, radiusMeters: 50 },
            company: { companyName: '', appDownloadUrl: '', hrEmail: '', hrPhone: '' },
            attendance: { maxFaceAttempts: 3, faceSimilarityThreshold: 60, allowOfflineAttendance: false, overtimeCalculation: true },
            notifications: { notifyOnLeaveRequest: true, notifyOnFaceEnrollment: true, notifyOnFaceFailure: false, notifyOnNewEmployee: true, emailNotifications: false, adminEmail: '' }
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const update = useCallback((
    section: keyof Settings,
    field: string,
    value: any
  ) => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  }, [settings]);

  return {
    activeTab,
    setActiveTab,
    settings,
    loading,
    saving,
    saved,
    update,
    handleSave,
    TABS,
  };
}