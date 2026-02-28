import { useState, useEffect } from 'react';
import { getAttendanceByRange, getEmployees } from '@/lib/firestore';
import type { AttendanceRecord, Employee, AttendanceStatus } from '@/types';
import { format, subDays } from 'date-fns';

export const STATUS_OPTIONS: { value: AttendanceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'present', label: 'Hadir' },
  { value: 'late', label: 'Terlambat' },
  { value: 'absent', label: 'Tidak Hadir' },
  { value: 'leave', label: 'Izin' },
  { value: 'overtime', label: 'Lembur' },
];

export function minsToHours(mins?: number) {
  if (!mins) return '-';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
}

export function useReportManagement() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');
  const [filterDept, setFilterDept] = useState('all');

  useEffect(() => {
    getEmployees().then(setEmployees);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getAttendanceByRange(
      startDate,
      endDate,
      filterEmployee !== 'all' ? filterEmployee : undefined
    );
    setAttendance(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [startDate, endDate]);

  const departments = ['all', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean)))];

  const filtered = attendance.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchDept = filterDept === 'all' || a.department === filterDept;
    const matchEmp = filterEmployee === 'all' || a.userId === filterEmployee;
    return matchStatus && matchDept && matchEmp;
  });

  // Summary stats
  const summary = {
    present: filtered.filter(a => ['present', 'late', 'overtime'].includes(a.status)).length,
    late: filtered.filter(a => a.status === 'late').length,
    absent: filtered.filter(a => a.status === 'absent').length,
    leave: filtered.filter(a => a.status === 'leave').length,
    overtime: filtered.filter(a => a.status === 'overtime').length,
  };

  const exportCSV = () => {
    const headers = ['Tanggal', 'Nama', 'Departemen', 'Status', 'Jam Masuk', 'Jam Pulang', 'Total Jam', 'Terlambat (menit)', 'Lembur (menit)'];
    const rows = filtered.map(a => [
      a.date,
      a.employeeName,
      a.department,
      a.status,
      a.checkIn?.time || '-',
      a.checkOut?.time || '-',
      minsToHours(a.totalWorkMinutes),
      a.lateMinutes || 0,
      a.overtimeMinutes || 0,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-absensi-${startDate}-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    attendance,
    employees,
    loading,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filterEmployee,
    setFilterEmployee,
    filterStatus,
    setFilterStatus,
    filterDept,
    setFilterDept,
    departments,
    filtered,
    summary,
    exportCSV,
  };
}
