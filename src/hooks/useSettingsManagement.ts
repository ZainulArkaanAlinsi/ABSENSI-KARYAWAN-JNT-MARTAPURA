import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { getSettings, updateSettings, subscribeToSettings } from '@/lib/firestore/settings';
import type { Settings } from '@/types';

export const TABS = [
  { key: 'office', label: 'Kantor & Lokasi', icon: 'office' },
  { key: 'company', label: 'Perusahaan', icon: 'company' },
  { key: 'attendance', label: 'Absensi', icon: 'attendance' },
  { key: 'notifications', label: 'Notifikasi', icon: 'notifications' },
  { key: 'maintenance', label: 'Maintenance', icon: 'maintenance' },
] as const;

export type TabKey = (typeof TABS)[number]['key'];

/**
 * Validasi koordinat kantor sebelum disimpan. Mencegah lat/lng tertukar atau
 * di luar rentang bumi yang akan bikin geofence di APK salah total.
 * null (belum diisi) dianggap valid supaya tidak memblok saat awal.
 */
function officeCoordsValid(settings: Settings): boolean {
  const lat = settings.office?.latitude;
  const lng = settings.office?.longitude;
  if (lat != null && (Number.isNaN(lat) || lat < -90 || lat > 90)) return false;
  if (lng != null && (Number.isNaN(lng) || lng < -180 || lng > 180)) return false;
  return true;
}

export function useSettingsManagement() {
  const [activeTab, setActiveTab] = useState<TabKey>('office');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const mountedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── EFFECT: Real-time settings stream from DB ──
  useEffect(() => {
    const unsubscribe = subscribeToSettings((data) => {
      if (data) {
        // Normalize settings: ensure all nested fields exist to prevent null-reference crashes
        const normalized: Settings = {
          office: {
            name: data.office?.name ?? '',
            address: data.office?.address ?? '',
            latitude: data.office?.latitude ?? null,
            longitude: data.office?.longitude ?? null,
            radiusMeters: data.office?.radiusMeters ?? 50,
          },
          company: {
            companyName: data.company?.companyName ?? '',
            appDownloadUrl: data.company?.appDownloadUrl ?? '',
            hrEmail: data.company?.hrEmail ?? '',
            hrPhone: data.company?.hrPhone ?? '',
          },
          attendance: {
            maxFaceAttempts: data.attendance?.maxFaceAttempts ?? 3,
            faceSimilarityThreshold: data.attendance?.faceSimilarityThreshold ?? 60,
            allowOfflineAttendance: data.attendance?.allowOfflineAttendance ?? true,
            overtimeCalculation: data.attendance?.overtimeCalculation ?? true,
            // Support mobile config keys
            courierBypassGeofence: data.attendance?.courierBypassGeofence ?? false,
          },
          notifications: {
            notifyOnLeaveRequest: data.notifications?.notifyOnLeaveRequest ?? true,
            notifyOnFaceEnrollment: data.notifications?.notifyOnFaceEnrollment ?? true,
            notifyOnFaceFailure: data.notifications?.notifyOnFaceFailure ?? false,
            notifyOnNewEmployee: data.notifications?.notifyOnNewEmployee ?? true,
            emailNotifications: data.notifications?.emailNotifications ?? false,
            adminEmail: data.notifications?.adminEmail ?? '',
          },
        };

        setSettings(normalized);
        setLastSync(new Date());
        setError(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── EFFECT: Initial load fallback (in case stream fires null first) ──
  useEffect(() => {
    async function loadFallback() {
      if (settings === null) {
        try {
          const data = await getSettings();
          if (data) {
            setSettings(data);
          } else {
            // Default settings when nothing in DB yet
            setSettings({
              office: {
                name: '',
                address: '',
                latitude: null,
                longitude: null,
                radiusMeters: 50,
              },
              company: {
                companyName: '',
                appDownloadUrl: '',
                hrEmail: '',
                hrPhone: '',
              },
              attendance: {
                maxFaceAttempts: 3,
                faceSimilarityThreshold: 60,
                allowOfflineAttendance: true,
                overtimeCalculation: true,
                courierBypassGeofence: false,
              },
              notifications: {
                notifyOnLeaveRequest: true,
                notifyOnFaceEnrollment: true,
                notifyOnFaceFailure: false,
                notifyOnNewEmployee: true,
                emailNotifications: false,
                adminEmail: '',
              },
            });
          }
        } catch (error) {
          console.error('Error loading settings:', error);
          setError('Gagal memuat pengaturan. Periksa koneksi internet.');
        } finally {
          setLoading(false);
        }
      }
    }

    const timeout = setTimeout(loadFallback, 3000); // Wait 3s for stream before fallback
    return () => clearTimeout(timeout);
  }, [settings]);

  // ── Update: immutable field-level update ──
  const update = useCallback((section: keyof Settings, field: string, value: unknown) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      } as Settings;
    });
    // Clear any previous error on new edit
    setError(null);
  }, []);

  // ── Save with robust error handling ──
  const handleSave = useCallback(async () => {
    if (!settings) return false;
    if (!officeCoordsValid(settings)) {
      setError(
        'Koordinat kantor tidak valid. Latitude harus -90..90 dan Longitude -180..180 — pastikan tidak tertukar. Perubahan tidak disimpan.',
      );
      return false;
    }
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateSettings(settings);
      setSaved(true);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => setSaved(false), 3000);

      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(
        (error as Error).message ||
          'Gagal menyimpan pengaturan. Periksa koneksi internet dan coba lagi.',
      );
      return false;
    } finally {
      setSaving(false);
    }
  }, [settings]);

  // ── Auto-save with debounce ──
  const debouncedSettings = useDebounce(settings, 1500);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (debouncedSettings) {
      // Don't auto-save if there's already an error
      if (!error) {
        handleSave();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSettings]);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return {
    activeTab,
    setActiveTab,
    settings,
    loading,
    saving,
    saved,
    error,
    lastSync,
    update,
    handleSave,
    TABS,
    setError,
  };
}
