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

export interface AnalyticsStats {
  totalEmployees: number;
  faceRegisteredCount: number;
  presentToday: number;
  lateToday: number;
  onLeaveToday: number;
  absentToday: number;
  overtimeThisMonth: number;
  
  // Advanced Metrics
  engagementIndex: number; // % of employees attending regularly
  punctualityRate: number; // % of non-late attendance vs total attendance
  departmentDistribution: { name: string; attendance: number }[];
  weeklyTrends: {
    day: string;
    present: number;
    late: number;
    absent: number;
  }[];
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
        
        const [empSnap, faceSnap] = await Promise.all([
          getDocs(empQuery),
          getCountFromServer(faceQuery)
        ]);

        const employees = empSnap.docs.map(d => ({ id: d.id, ...d.data() } as Employee));
        const totalEmployees = employees.length;
        const faceRegisteredCount = faceSnap.data().count;

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

          setData({
            totalEmployees,
            faceRegisteredCount,
            presentToday,
            lateToday,
            onLeaveToday,
            absentToday,
            overtimeThisMonth,
            engagementIndex,
            punctualityRate,
            departmentDistribution,
            weeklyTrends
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

  return { data, loading, error };
}
