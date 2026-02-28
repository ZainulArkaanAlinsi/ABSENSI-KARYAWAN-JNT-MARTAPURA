'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  getDocs,
  getCountFromServer,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firestore';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import type { DashboardStats, WeeklyAttendanceData, AttendanceRecord, Employee } from '@/types';

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyAttendanceData[]>([]);
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

        // 1. Total Employees & Face Registered (Static/One-time for initial count, but could be real-time)
        const empQuery = query(collection(db, COLLECTIONS.USERS), where('role', '==', 'employee'));
        const faceQuery = query(collection(db, COLLECTIONS.USERS), where('role', '==', 'employee'), where('faceRegistered', '==', true));
        
        const [empSnap, faceSnap] = await Promise.all([
          getCountFromServer(empQuery),
          getCountFromServer(faceQuery)
        ]);

        const totalEmployees = empSnap.data().count;
        const faceRegisteredCount = faceSnap.data().count;

        // 2. Real-time Attendance Listener (Today)
        const todayQuery = query(collection(db, COLLECTIONS.ATTENDANCE), where('date', '==', todayStr));
        const unsubToday = onSnapshot(todayQuery, (snap) => {
          const attRecords = snap.docs.map(doc => doc.data() as AttendanceRecord);
          
          const presentToday = attRecords.filter((r: AttendanceRecord) => ['present', 'late', 'overtime'].includes(r.status)).length;
          const lateToday = attRecords.filter((r: AttendanceRecord) => r.status === 'late').length;
          const onLeaveToday = attRecords.filter((r: AttendanceRecord) => r.status === 'leave').length;
          const absentToday = Math.max(0, totalEmployees - (presentToday + onLeaveToday));

          setData(prev => ({
            ...prev!,
            totalEmployees,
            faceRegisteredCount,
            presentToday,
            lateToday,
            onLeaveToday,
            absentToday,
          }));
        });
        unsubs.push(unsubToday);

        // 3. Real-time Pending Leaves Listener
        const leaveQuery = query(collection(db, COLLECTIONS.LEAVES), where('status', '==', 'pending'));
        const unsubLeaves = onSnapshot(leaveQuery, (snap) => {
          setData(prev => ({
            ...prev!,
            pendingLeaves: snap.size
          }));
        });
        unsubs.push(unsubLeaves);

        // 4. Overtime Calculation (Monthly)
        const otQuery = query(
          collection(db, COLLECTIONS.ATTENDANCE), 
          where('date', '>=', monthStart),
          where('date', '<=', monthEnd)
        );
        const unsubOT = onSnapshot(otQuery, (snap) => {
          const records = snap.docs.map(doc => doc.data() as AttendanceRecord);
          const totalMinutes = records.reduce((sum: number, r: AttendanceRecord) => sum + (r.overtimeMinutes || 0), 0);
          const overtimeThisMonth = Math.round(totalMinutes / 60);

          setData(prev => ({
            ...prev!,
            overtimeThisMonth
          }));
        });
        unsubs.push(unsubOT);

        // 5. Weekly Distribution Data (Last 7 days - Static initial fetch)
        const weekly: WeeklyAttendanceData[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = subDays(new Date(), i);
          const dStr = format(d, 'yyyy-MM-dd');
          const dayName = format(d, 'EEE');
          
          const dayQuery = query(collection(db, COLLECTIONS.ATTENDANCE), where('date', '==', dStr));
          const daySnap = await getDocs(dayQuery);
          const dayRecords = daySnap.docs.map(doc => doc.data() as AttendanceRecord);

          const dailyPresent = dayRecords.filter(r => ['present', 'late', 'overtime'].includes(r.status)).length;
          const dailyLeave = dayRecords.filter(r => r.status === 'leave').length;

          weekly.push({
            day: dayName,
            present: dailyPresent,
            late: dayRecords.filter(r => r.status === 'late').length,
            absent: Math.max(0, totalEmployees - (dailyPresent + dailyLeave)),
            leave: dailyLeave
          });
        }
        setWeeklyData(weekly);
        setLoading(false);

      } catch (err) {
        console.error('Error initializing dashboard listeners:', err);
        setError('Synchronized matrix failed. Neural link disrupted.');
        setLoading(false);
      }
    }

    initListeners();

    return () => unsubs.forEach(unsub => unsub());
  }, []);

  return { data, weeklyData, loading, error };
}
