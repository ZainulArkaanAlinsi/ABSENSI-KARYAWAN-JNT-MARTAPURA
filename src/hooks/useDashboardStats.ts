'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, getCountFromServer, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firestore';
import { listen } from '@/lib/firestoreListener';
import { fortressRetry } from '@/lib/fortress';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { AttendanceRecord, Employee } from '@/types';
import { isWorkday } from '@/lib/holidays';

export interface RecentActivity {
  id: string;
  userName: string;
  department: string;
  status: string;
  checkIn: string; // "HH:mm" or "—"
  checkOut?: string;
  employeeId?: string;
  color: string;
  actionLabel: string;
  // NEW: Real-time timestamp for live updates
  timestamp: Date;
}

interface PendingRequest {
  id: string;
  type: string;
  [key: string]: unknown;
}

interface AnalyticsStats {
  totalEmployees: number;
  faceRegisteredCount: number;
  presentToday: number;
  lateToday: number;
  onLeaveToday: number;
  absentToday: number;
  onlineNowCount: number;
  overtimeThisMonth: number;
  pendingLeaves: number;
  alphaCount: number;
  totalWorkingHours: number;
  overtimeHours: number;

  // Advanced Metrics
  engagementIndex: number;
  punctualityRate: number;
  monthlyAttendanceRecordCount: number;
  totalAttendanceRecords: number;
  totalDepartments: number;
  activeDepartmentsCount: number;
  departmentDistribution: { name: string; attendance: number }[];
  weeklyTrends: {
    day: string;
    present: number;
    late: number;
    absent: number;
  }[];
  recentActivities: RecentActivity[];
  pendingRequests: PendingRequest[];
}

const toDate = (val: unknown): Date | null => {
  if (!val) return null;
  if (typeof val === 'object') {
    const o = val as { toDate?: () => Date; seconds?: number };
    if (typeof o.toDate === 'function') return o.toDate();
    if ('seconds' in val && typeof o.seconds === 'number') return new Date(o.seconds * 1000);
  }
  const d = new Date(val as string | number);
  return isNaN(d.getTime()) ? null : d;
};

// Extract "HH:mm" from a check-in/check-out entry, which may be a nested
// `{ time }` object, a raw "HH:mm" string, or a Firestore Timestamp.
// Returns '—' when unavailable.
const extractHHMM = (check: unknown): string => {
  if (!check) return '—';
  if (typeof check === 'string') return check;
  if (typeof check !== 'object') return '—';
  const t = (check as { time?: unknown }).time;
  if (!t) return '—';
  if (typeof t === 'string') return t;
  if (typeof t === 'object') {
    if ('toDate' in t && typeof (t as { toDate?: unknown }).toDate === 'function') {
      return format((t as { toDate: () => Date }).toDate(), 'HH:mm');
    }
    if ('seconds' in t) {
      return format(new Date((t as { seconds: number }).seconds * 1000), 'HH:mm');
    }
  }
  return '—';
};

export function useDashboardStats() {
  const [data, setData] = useState<AnalyticsStats | null>(null);
  const [, setSosAlerts] = useState<PendingRequest[]>([]);
  const sosAlertsRef = useRef<PendingRequest[]>([]);
  const pendingLeavesRef = useRef<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    async function initListeners() {
      try {
        await fortressRetry(
          async () => {
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
            const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

            const relevantRoles = ['employee', 'kurir', 'driver'];
            const empQuery = query(
              collection(db, COLLECTIONS.USERS),
              where('role', 'in', relevantRoles),
            );
            const faceQuery = query(
              collection(db, COLLECTIONS.USERS),
              where('role', 'in', relevantRoles),
              where('faceRegistered', '==', true),
            );

            const [empSnap, faceSnap] = await Promise.all([
              getDocs(empQuery),
              getCountFromServer(faceQuery),
            ]);

            const employees = empSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Employee);
            const totalEmployees = employees.length;
            const faceRegisteredCount = faceSnap.data().count;

            // ── Pending approval slice (SOS + pending leaves), kept live ──
            const buildPendingRequests = () =>
              [...sosAlertsRef.current, ...pendingLeavesRef.current].sort((a, b) => {
                if (a.type === 'SOS' && b.type !== 'SOS') return -1;
                if (a.type !== 'SOS' && b.type === 'SOS') return 1;
                return 0;
              });

            const recomputePending = () => {
              setData((prev) =>
                prev
                  ? {
                      ...prev,
                      pendingLeaves: pendingLeavesRef.current.length,
                      pendingRequests: buildPendingRequests(),
                    }
                  : prev,
              );
            };

            // Live listener for pending leaves so the approval queue and the
            // "Antrian Izin" banner stay accurate in real time (was a one-time fetch).
            const pendingLeavesQuery = query(
              collection(db, COLLECTIONS.LEAVES),
              where('status', '==', 'pending'),
              orderBy('createdAt', 'desc'),
            );
            const unsubPendingLeaves = listen(pendingLeavesQuery, (pendingSnap) => {
              pendingLeavesRef.current = pendingSnap.docs.map((d) => {
                const docData = d.data();
                return {
                  id: d.id,
                  ...docData,
                  type: docData.type || 'Leave',
                  startDate: toDate(docData.startDate) || toDate(docData.createdAt) || new Date(),
                };
              });
              recomputePending();
            });
            unsubs.push(unsubPendingLeaves);

            // NEW: Real-time online status tracking via heartbeats
            const heartbeatQuery = query(collection(db, 'user_heartbeats'));
            const unsubHeartbeat = listen(heartbeatQuery, (heartbeatSnap) => {
              const now = new Date();
              const onlineThreshold = 40 * 1000; // 40 seconds in ms
              const onlineCount = heartbeatSnap.docs.filter((doc) => {
                const data = doc.data();
                if (!data.timestamp) return false;
                const lastHeartbeat =
                  (data.timestamp as { toDate?: () => Date }).toDate?.() ||
                  new Date(data.timestamp);
                return now.getTime() - lastHeartbeat.getTime() < onlineThreshold;
              }).length;

              setData((prev) => (prev ? { ...prev, onlineNowCount: onlineCount } : null));
            });
            unsubs.push(unsubHeartbeat);

            const sosQuery = query(collection(db, 'sos_alerts'), where('status', '==', 'active'));

            const unsubSos = listen(sosQuery, (sosSnap) => {
              const activeSos = sosSnap.docs.map((d) => ({ id: d.id, ...d.data(), type: 'SOS' }));
              sosAlertsRef.current = activeSos;
              setSosAlerts(activeSos);
              recomputePending();
            });
            unsubs.push(unsubSos);

            const attQuery = query(
              collection(db, COLLECTIONS.ATTENDANCE),
              where('date', '>=', monthStart),
              where('date', '<=', monthEnd),
            );

            const unsubMain = listen(attQuery, (snap) => {
              const allRecords = snap.docs.map((doc) => doc.data() as AttendanceRecord);
              const todayRecords = allRecords.filter((r) => r.date === todayStr);

              const presentToday = todayRecords.filter((r) =>
                ['present', 'late', 'overtime'].includes(r.status),
              ).length;
              const lateToday = todayRecords.filter((r) => r.status === 'late').length;
              const onLeaveToday = todayRecords.filter((r) => r.status === 'leave').length;
              // Hanya hitung absen di hari kerja. Weekend (Minggu) & libur
              // nasional → 0, supaya tidak salah menandai semua karyawan "absen".
              const absentToday = isWorkday(new Date())
                ? Math.max(0, totalEmployees - (presentToday + onLeaveToday))
                : 0;

              const totalOTMins = allRecords.reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0);
              const overtimeThisMonth = Math.round(totalOTMins / 60);

              const totalAttendedAcrossMonth = allRecords.filter((r) =>
                ['present', 'late', 'overtime'].includes(r.status),
              ).length;
              const totalLateAcrossMonth = allRecords.filter((r) => r.status === 'late').length;

              const punctualityRate =
                totalAttendedAcrossMonth > 0
                  ? Math.round(
                      ((totalAttendedAcrossMonth - totalLateAcrossMonth) /
                        totalAttendedAcrossMonth) *
                        100,
                    )
                  : 100;

              const uniqueUsersAttendedMonth = new Set(allRecords.map((r) => r.userId)).size;
              const engagementIndex =
                totalEmployees > 0
                  ? Math.round((uniqueUsersAttendedMonth / totalEmployees) * 100)
                  : 0;

              const depts = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
              const departmentDistribution = depts.map((dept) => {
                const empInDept = employees.filter((e) => e.department === dept).map((e) => e.id);
                const attendedInDept = todayRecords.filter(
                  (r) =>
                    empInDept.includes(r.userId) &&
                    ['present', 'late', 'overtime'].includes(r.status),
                ).length;
                const totalInDept = empInDept.length;
                const rate = totalInDept > 0 ? Math.round((attendedInDept / totalInDept) * 100) : 0;
                return { name: dept, attendance: rate };
              });

              const weeklyTrends: { day: string; present: number; late: number; absent: number }[] =
                [];
              for (let i = 6; i >= 0; i--) {
                const d = subDays(new Date(), i);
                const dStr = format(d, 'yyyy-MM-dd');
                const dayName = format(d, 'EEE', { locale: idLocale });
                const dayRecords = allRecords.filter((r) => r.date === dStr);
                const dPresent = dayRecords.filter((r) =>
                  ['present', 'late', 'overtime'].includes(r.status),
                ).length;
                const dLeave = dayRecords.filter((r) => r.status === 'leave').length;

                weeklyTrends.push({
                  day: dayName,
                  present: dPresent,
                  late: dayRecords.filter((r) => r.status === 'late').length,
                  absent: isWorkday(d) ? Math.max(0, totalEmployees - (dPresent + dLeave)) : 0,
                });
              }

              const STATUS_META: Record<string, { label: string; color: string }> = {
                present: { label: 'Scan absensi berhasil', color: '#10B981' },
                late: { label: 'Keterlambatan terdeteksi', color: '#F59E0B' },
                overtime: { label: 'Lembur dicatat', color: '#8B5CF6' },
                leave: { label: 'Izin disetujui', color: '#3B82F6' },
                absent: { label: 'Tidak hadir', color: '#EF4444' },
              };
              const recentActivities: RecentActivity[] = todayRecords
                .sort((a, b) => {
                  const getTime = (val: unknown) => {
                    if (!val) return '';
                    if (typeof val === 'object' && 'time' in val)
                      return String((val as { time: unknown }).time);
                    return String(val);
                  };
                  const timeA = getTime(a.checkIn);
                  const timeB = getTime(b.checkIn);
                  return timeB.localeCompare(timeA);
                })
                .slice(0, 5)
                .map((r) => {
                  const emp = employees.find((e) => e.id === r.userId || e.uid === r.userId);
                  const meta = STATUS_META[r.status] ?? { label: r.status, color: '#94A3B8' };

                  return {
                    id: r.userId,
                    userName: emp?.name ?? 'Karyawan',
                    employeeId: emp?.employeeId ?? '—',
                    department: emp?.department ?? '-',
                    status: r.status,
                    checkIn: extractHHMM(r.checkIn),
                    checkOut: extractHHMM(r.checkOut),
                    color: meta.color,
                    actionLabel: meta.label,
                    timestamp: new Date(r.createdAt || Date.now()),
                  };
                });

              setData((prev) => ({
                totalEmployees,
                faceRegisteredCount,
                presentToday,
                lateToday,
                onLeaveToday,
                absentToday,
                onlineNowCount: prev?.onlineNowCount ?? 0,
                overtimeThisMonth,
                pendingLeaves: pendingLeavesRef.current.length,
                engagementIndex,
                punctualityRate,
                monthlyAttendanceRecordCount: allRecords.length,
                totalAttendanceRecords: allRecords.length,
                totalDepartments: depts.length,
                activeDepartmentsCount: depts.length,
                alphaCount: allRecords.filter((r) => r.status === 'absent').length,
                totalWorkingHours: Math.round(
                  allRecords.reduce((sum, r) => sum + (r.totalWorkMinutes || 0), 0) / 60,
                ),
                overtimeHours: overtimeThisMonth,
                departmentDistribution,
                weeklyTrends,
                recentActivities,
                pendingRequests: buildPendingRequests(),
              }));
              setLoading(false);
            });
            unsubs.push(unsubMain);
          },
          { taskName: 'Dashboard Stats' },
        );
      } catch (err) {
        console.error('Error in Analytics Loader:', err);
        setError('Koneksi terganggu, mencoba kembali...');
        setLoading(false);
      }
    }

    initListeners();
    return () => unsubs.forEach((unsub) => unsub());
  }, []);

  const weeklyData = data?.weeklyTrends ?? [];

  return { data, weeklyData, loading, error };
}
