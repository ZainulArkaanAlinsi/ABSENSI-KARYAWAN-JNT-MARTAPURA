'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  getDocs,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firestore';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import type { AttendanceRecord, Employee } from '@/types';

export interface RecentActivity {
  id: string;
  userName: string;
  department: string;
  status: string;
  checkIn: string;   // "HH:mm" or "—"
  color: string;
  actionLabel: string;
}

interface AnalyticsStats {
  totalEmployees: number;
  faceRegisteredCount: number;
  presentToday: number;
  lateToday: number;
  onLeaveToday: number;
  absentToday: number;
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
}

export function useDashboardStats() {
  const [data, setData] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubs: (() => void)[] = [];
    setLoading(true);

    async function initListeners() {
      try {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

        // 1. Core Counts
        const empQuery = query(collection(db, COLLECTIONS.USERS), where('role', '==', 'employee'));
        const faceQuery = query(collection(db, COLLECTIONS.USERS), where('role', '==', 'employee'), where('faceRegistered', '==', true));
        const pendingLeavesQuery = query(collection(db, COLLECTIONS.LEAVES), where('status', '==', 'pending'));

        const [empSnap, faceSnap, pendingLeavesSnap] = await Promise.all([
          getDocs(empQuery),
          getCountFromServer(faceQuery),
          getCountFromServer(pendingLeavesQuery),
        ]);

        const employees = empSnap.docs.map(d => ({ id: d.id, ...d.data() } as Employee));
        const totalEmployees = employees.length;
        const faceRegisteredCount = faceSnap.data().count;
        const pendingLeaves = pendingLeavesSnap.data().count;

        // 2. Attendance & Department Distribution
        const attQuery = query(
          collection(db, COLLECTIONS.ATTENDANCE), 
          where('date', '>=', monthStart),
          where('date', '<=', monthEnd)
        );

        const unsubMain = onSnapshot(attQuery, (snap) => {
          const allRecords = snap.docs.map(doc => doc.data() as AttendanceRecord);
          const todayRecords = allRecords.filter(r => r.date === todayStr);
          
          // Current Day Stats
          const presentToday = todayRecords.filter(r => ['present', 'late', 'overtime'].includes(r.status)).length;
          const lateToday = todayRecords.filter(r => r.status === 'late').length;
          const onLeaveToday = todayRecords.filter(r => r.status === 'leave').length;
          const absentToday = Math.max(0, totalEmployees - (presentToday + onLeaveToday));

          // Monthly Metrics
          const totalOTMins = allRecords.reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0);
          const overtimeThisMonth = Math.round(totalOTMins / 60);

          // Strategic Indices
          const totalAttendedAcrossMonth = allRecords.filter(r => ['present', 'late', 'overtime'].includes(r.status)).length;
          const totalLateAcrossMonth = allRecords.filter(r => r.status === 'late').length;
          
          const punctualityRate = totalAttendedAcrossMonth > 0 
            ? Math.round(((totalAttendedAcrossMonth - totalLateAcrossMonth) / totalAttendedAcrossMonth) * 100) 
            : 100;

          const uniqueUsersAttendedMonth = new Set(allRecords.map(r => r.userId)).size;
          const engagementIndex = totalEmployees > 0 
            ? Math.round((uniqueUsersAttendedMonth / totalEmployees) * 100) 
            : 0;

          // Department Distribution
          const depts = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));
          const departmentDistribution = depts.map(dept => {
            const empInDept = employees.filter(e => e.department === dept).map(e => e.id);
            const attendedInDept = todayRecords.filter(r => empInDept.includes(r.userId) && ['present', 'late', 'overtime'].includes(r.status)).length;
            const totalInDept = empInDept.length;
            const rate = totalInDept > 0 ? Math.round((attendedInDept / totalInDept) * 100) : 0;
            return { name: dept, attendance: rate };
          });

          // Weekly Trend Calculation
          const weeklyTrends = [];
          for (let i = 6; i >= 0; i--) {
            const d = subDays(new Date(), i);
            const dStr = format(d, 'yyyy-MM-dd');
            const dayName = format(d, 'EEE');
            const dayRecords = allRecords.filter(r => r.date === dStr);
            const dPresent = dayRecords.filter(r => ['present', 'late', 'overtime'].includes(r.status)).length;
            const dLeave = dayRecords.filter(r => r.status === 'leave').length;

            weeklyTrends.push({
              day: dayName,
              present: dPresent,
              late: dayRecords.filter(r => r.status === 'late').length,
              absent: Math.max(0, totalEmployees - (dPresent + dLeave))
            });
          }

          // Recent Activities — last 5 today's records, joined with employee name
          const STATUS_META: Record<string, { label: string; color: string }> = {
            present:  { label: 'Scan absensi berhasil',    color: '#10B981' },
            late:     { label: 'Keterlambatan terdeteksi', color: '#F59E0B' },
            overtime: { label: 'Lembur dicatat',           color: '#8B5CF6' },
            leave:    { label: 'Izin disetujui',           color: '#3B82F6' },
            absent:   { label: 'Tidak hadir',              color: '#EF4444' },
          };
          const recentActivities: RecentActivity[] = todayRecords
            .sort((a, b) => ((b as any).checkIn || '').localeCompare((a as any).checkIn || ''))
            .slice(0, 5)
            .map(r => {
              const emp = employees.find(e => e.id === r.userId || e.uid === r.userId);
              const meta = STATUS_META[r.status] ?? { label: r.status, color: '#94A3B8' };
              return {
                id: r.userId,
                userName: emp?.name ?? 'Karyawan',
                department: emp?.department ?? '-',
                status: r.status,
                checkIn: (r as any).checkIn ?? '—',
                color: meta.color,
                actionLabel: meta.label,
              };
            });

          setData({
            totalEmployees,
            faceRegisteredCount,
            presentToday,
            lateToday,
            onLeaveToday,
            absentToday,
            overtimeThisMonth,
            pendingLeaves,
            engagementIndex,
            punctualityRate,
            monthlyAttendanceRecordCount: allRecords.length,
            totalAttendanceRecords: allRecords.length,
            totalDepartments: depts.length,
            activeDepartmentsCount: depts.length,
            alphaCount: allRecords.filter(r => r.status === 'absent').length,
            totalWorkingHours: Math.round(allRecords.reduce((sum, r) => sum + (r.totalWorkMinutes || 0), 0) / 60),
            overtimeHours: overtimeThisMonth,
            departmentDistribution,
            weeklyTrends,
            recentActivities,
          });
          setLoading(false);
        });

        unsubs.push(unsubMain);

      } catch (err) {
        console.error('Error in Analytics Loader:', err);
        setError('Synchronized matrix failed. Neural link disrupted.');
        setLoading(false);
      }
    }

    initListeners();
    return () => unsubs.forEach(unsub => unsub());
  }, []);

  // Expose weeklyData as a top-level convenience (dashboard destructures it directly).
  const weeklyData = data?.weeklyTrends ?? [];

  return { data, weeklyData, loading, error };
}
