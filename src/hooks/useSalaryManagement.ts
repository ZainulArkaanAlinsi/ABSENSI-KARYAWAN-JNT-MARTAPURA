import { useState, useEffect } from 'react';
import { 
  getEmployees, 
  getAttendanceByRange, 
  getSalariesByMonth, 
  saveSalaryRecord 
} from '@/lib/firestore';
import { Employee, SalaryRecord, SalarySummary, AttendanceRecord } from '@/types';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export function useSalaryManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [empData, existingSalaries] = await Promise.all([
        getEmployees(),
        getSalariesByMonth(month, year)
      ]);
      setEmployees(empData);

      // If existing records found for this month, use them
      if (existingSalaries.length > 0) {
        setSalaryRecords(existingSalaries);
        setLoading(false);
        return;
      }

      // Otherwise, calculate from current attendance
      const monthStart = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
      
      const attendance = await getAttendanceByRange(monthStart, monthEnd);

      const computedRecords: SalaryRecord[] = empData.map(emp => {
        const empAttendance = attendance.filter(a => a.userId === emp.id);
        
        // Basic Logic (can be refined with settings later)
        const baseSalary = emp.department.includes('delivery') ? 3000000 : 3500000;
        const allowance = 500000; // Fixed for this demo, usually per-day hadir
        
        const totalOvertimeMins = empAttendance.reduce((sum, a) => sum + (a.overtimeMinutes || 0), 0);
        const totalLateMins = empAttendance.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
        const absentCount = empAttendance.filter(a => a.status === 'absent').length;

        // Rate Constants (from JNE Rules usually)
        const OT_RATE_PER_HOUR = 20000;
        const LATE_PENALTY_PER_MIN = 1000;
        const ABSENT_PENALTY = 100000;

        const overtimePay = Math.floor((totalOvertimeMins / 60) * OT_RATE_PER_HOUR);
        const lateDeduction = totalLateMins * LATE_PENALTY_PER_MIN;
        const absentDeduction = absentCount * ABSENT_PENALTY;
        
        const netSalary = baseSalary + allowance + overtimePay - lateDeduction - absentDeduction;

        return {
          id: `temp_${emp.id}`,
          userId: emp.id,
          employeeName: emp.name,
          employeeId: emp.employeeId,
          month,
          year,
          baseSalary,
          overtimePay,
          allowance,
          deductions: {
            late: lateDeduction,
            absent: absentDeduction,
            other: 0
          },
          netSalary,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      setSalaryRecords(computedRecords);
    } catch (err) {
      console.error('Error loading salary data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [month, year]);

  const filtered = salaryRecords.filter(r => 
    r.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
    r.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  const summary: SalarySummary = {
    totalPayroll: filtered.reduce((acc, r) => acc + r.netSalary, 0),
    totalOvertime: filtered.reduce((acc, r) => acc + r.overtimePay, 0),
    totalDeductions: filtered.reduce((acc, r) => acc + (r.deductions.late + r.deductions.absent + r.deductions.other), 0),
    employeeCount: filtered.length
  };

  const publishSalaries = async () => {
    setLoading(true);
    try {
      await Promise.all(salaryRecords.map(r => saveSalaryRecord({
        ...r,
        status: 'published',
        updatedAt: new Date().toISOString()
      })));
      alert('Semua slip gaji telah dipublikasikan ke Firestore dan Karyawan!');
      await loadData();
    } catch (err) {
      alert('Gagal mempublikasikan gaji.');
    } finally {
      setLoading(false);
    }
  };

  const exportSalaryReport = () => {
    const headers = ['Nama', 'NIK', 'Gaji Pokok', 'Tunjangan', 'Lembur', 'Potongan Telat', 'Potongan Absen', 'Gaji Bersih'];
    const rows = filtered.map(r => [
      r.employeeName,
      r.employeeId,
      r.baseSalary,
      r.allowance,
      r.overtimePay,
      r.deductions.late,
      r.deductions.absent,
      r.netSalary
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Slip_Gaji_JNET_${month}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    salaryRecords: filtered,
    summary,
    loading,
    month,
    setMonth,
    year,
    setYear,
    search,
    setSearch,
    publishSalaries,
    exportSalaryReport,
    refreshManual: loadData
  };
}
