'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getCountFromServer,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firestore';
import { format, subDays, startOfMonth, startOfToday } from 'date-fns';
import type { DashboardStats, WeeklyAttendanceData } from '@/types';

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyAttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        
        // 1. Total Employees
        const empQuery = query(collection(db, COLLECTIONS.USERS), where('role', '==', 'employee'));
        const empSnap = await getCountFromServer(empQuery);
        const totalEmployees = empSnap.data().count;

        // 2. Face Registered Count
        const faceQuery = query(collection(db, COLLECTIONS.USERS), where('role', '==', 'employee'), where('faceRegistered', '==', true));
        const faceSnap = await getCountFromServer(faceQuery);
        const faceRegisteredCount = faceSnap.data().count;

        // 3. Today's Attendance
        const attQuery = query(collection(db, COLLECTIONS.ATTENDANCE), where('date', '==', todayStr));
        const attSnap = await getDocs(attQuery);
        const attRecords = attSnap.docs.map(d => d.data());

        const presentToday = attRecords.filter(r => r.status === 'present').length;
        const lateToday = attRecords.filter(r => r.status === 'late').length;
        const onLeaveToday = attRecords.filter(r => r.status === 'leave').length;
        const absentToday = totalEmployees - (presentToday + lateToday + onLeaveToday);

        // 4. Pending Leaves
        const leaveQuery = query(collection(db, COLLECTIONS.LEAVES), where('status', '==', 'pending'));
        const leaveSnap = await getCountFromServer(leaveQuery);
        const pendingLeaves = leaveSnap.data().count;

        // 5. Monthly Overtime (Dummy aggregation for now)
        const overtimeThisMonth = 42; 

        setData({
          totalEmployees,
          presentToday,
          lateToday,
          absentToday: Math.max(0, absentToday),
          onLeaveToday,
          pendingLeaves,
          overtimeThisMonth,
          faceRegisteredCount
        });

        // 6. Weekly Distribution Data (Last 7 days)
        const weekly: WeeklyAttendanceData[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = subDays(new Date(), i);
          const dStr = format(d, 'yyyy-MM-dd');
          const dayName = format(d, 'EEE');
          
          const dayQuery = query(collection(db, COLLECTIONS.ATTENDANCE), where('date', '==', dStr));
          const daySnap = await getDocs(dayQuery);
          const dayRecords = daySnap.docs.map(doc => doc.data());

          weekly.push({
            day: dayName,
            present: dayRecords.filter(r => r.status === 'present').length,
            late: dayRecords.filter(r => r.status === 'late').length,
            absent: totalEmployees - dayRecords.length,
            leave: dayRecords.filter(r => r.status === 'leave').length
          });
        }
        setWeeklyData(weekly);

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to synchronized matrix data. Terminal link unstable.');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { data, weeklyData, loading, error };
}
