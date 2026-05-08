import { useState, useEffect, useMemo } from 'react';
import { getAttendanceByRange, getEmployees } from '@/lib/firestore';
import type { AttendanceRecord, Employee } from '@/types';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export function useReportManagement() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    getEmployees().then(setEmployees);
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const dateObj = parseISO(`${month}-01`);
        const start = startOfMonth(dateObj);
        const end = endOfMonth(dateObj);
        
        const data = await getAttendanceByRange(
          format(start, 'yyyy-MM-dd'),
          format(end, 'yyyy-MM-dd')
        );
        setAttendance(data);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [month]);

  // Transform attendance to per-employee reports
  const reports = useMemo(() => {
    return employees.map(emp => {
      const empAttendance = attendance.filter(a => a.userId === emp.id);
      const presentDays = empAttendance.filter(a => ['present', 'late', 'overtime'].includes(a.status)).length;
      const lateDays = empAttendance.filter(a => a.status === 'late').length;
      const totalLateMinutes = empAttendance.reduce((acc, a) => acc + (a.lateMinutes || 0), 0);
      const absentDays = empAttendance.filter(a => a.status === 'absent').length;
      const leaveDays = empAttendance.filter(a => a.status === 'leave').length;

      return {
        userId: emp.id,
        userName: emp.name,
        employeeId: emp.employeeId,
        department: emp.department,
        presentDays,
        lateDays,
        absentDays,
        leaveDays,
        totalLateMinutes
      };
    });
  }, [employees, attendance]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => 
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase())
    );
  }, [reports, search]);

  const stats = useMemo(() => {
    if (reports.length === 0) return { onTimeRate: 0, lateCount: 0, absentCount: 0 };
    
    const totalPresent = reports.reduce((acc, r) => acc + r.presentDays, 0);
    const totalLate = reports.reduce((acc, r) => acc + r.lateDays, 0);
    const totalAbsent = reports.reduce((acc, r) => acc + r.absentDays, 0);
    const totalLeave = reports.reduce((acc, r) => acc + (r as any).leaveDays, 0);
    const totalLateMins = reports.reduce((acc, r) => acc + r.totalLateMinutes, 0);

    const onTimeRate = totalPresent > 0 ? Math.round(((totalPresent - totalLate) / totalPresent) * 100) : 0;

    return {
      onTimeRate,
      lateCount: totalLateMins,
      absentCount: totalAbsent,
      leaveCount: totalLeave
    };
  }, [reports]);

  const handleExport = () => {
    const headers = ['Nama', 'ID Karyawan', 'Unit', 'Hadir', 'Telat', 'Izin', 'Alfa'];
    const rows = filteredReports.map(r => [
      r.userName,
      r.employeeId,
      r.department,
      r.presentDays,
      r.lateDays,
      (r as any).leaveDays,
      r.absentDays
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Absensi_${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    loading,
    search,
    setSearch,
    month,
    setMonth,
    reports,
    filteredReports,
    handleExport,
    stats
  };
}
