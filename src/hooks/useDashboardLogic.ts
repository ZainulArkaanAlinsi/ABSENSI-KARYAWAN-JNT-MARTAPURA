import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { subscribeToTodayAttendance, getEmployees } from '@/lib/firestore';
import type { AttendanceRecord, Employee } from '@/types';

export const weeklySalesData = [
  { day: 'Mon', sales: 400 },
  { day: 'Tue', sales: 300 },
  { day: 'Wed', sales: 500 },
  { day: 'Thu', sales: 200 },
  { day: 'Fri', sales: 600 },
  { day: 'Sat', sales: 450 },
  { day: 'Sun', sales: 300 },
];

export const salesData = [
  { month: '1', value: 200 },
  { month: '2', value: 180 },
  { month: '3', value: 350 },
  { month: '4', value: 300 },
  { month: '5', value: 480 },
  { month: '6', value: 400 },
  { month: '7', value: 550 },
  { month: '8', value: 450 },
  { month: '9', value: 600 },
  { month: '10', value: 520 },
  { month: '11', value: 650 },
  { month: '12', value: 600 },
];

export const pieData = [
  { name: 'Facebook', value: 400, color: '#4facfe' },
  { name: 'Youtube', value: 300, color: '#f9d423' },
  { name: 'Instagram', value: 300, color: '#ff00cc' },
  { name: 'Website', value: 200, color: '#16a34a' },
];

export function useDashboardLogic() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployees().then(e => {
      setEmployees(e);
      setLoading(false);
    });
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const unsubAttendance = subscribeToTodayAttendance(todayStr, setAttendance);
    return () => unsubAttendance();
  }, []);

  const navigateTo = (path: string) => router.push(path);

  return {
    employees,
    attendance,
    loading,
    navigateTo,
  };
}
