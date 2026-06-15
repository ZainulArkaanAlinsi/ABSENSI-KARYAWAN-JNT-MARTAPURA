import { useState, useEffect, useMemo } from 'react';
import { getAttendanceByRange, getEmployees } from '@/lib/firestore';
import type { AttendanceRecord, Employee } from '@/types';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export interface EmployeeReport {
  userId: string;
  userName: string;
  employeeId: string;
  department: string;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  leaveDays: number;
  overtimeDays: number;
  totalLateMinutes: number;
  totalWorkMinutes: number;
  totalOvertimeMinutes: number;
  onTimeRate: number;
}

// ── CSV helpers (Excel-aman: BOM UTF-8 + escaping + CRLF) ──
const csvCell = (v: unknown) => {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const buildCsv = (rows: unknown[][]) =>
  String.fromCharCode(0xfeff) + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');

const downloadFile = (content: string, filename: string, type = 'text/csv;charset=utf-8') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const fmtHm = (mins: number) => `${Math.floor(mins / 60)}j ${Math.round(mins % 60)}m`;
const sum = (arr: EmployeeReport[], key: keyof EmployeeReport) =>
  arr.reduce((s, r) => s + (Number(r[key]) || 0), 0);
const escHtml = (s: unknown) =>
  String(s ?? '').replace(
    /[&<>]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string,
  );

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
        const data = await getAttendanceByRange(
          format(startOfMonth(dateObj), 'yyyy-MM-dd'),
          format(endOfMonth(dateObj), 'yyyy-MM-dd'),
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

  const monthLabel = useMemo(() => {
    try {
      return format(parseISO(`${month}-01`), 'MMMM yyyy', { locale: idLocale });
    } catch {
      return month;
    }
  }, [month]);

  const reports: EmployeeReport[] = useMemo(() => {
    return employees.map((emp) => {
      const a = attendance.filter((x) => x.userId === emp.id);
      const presentDays = a.filter((x) =>
        ['present', 'late', 'overtime'].includes(x.status),
      ).length;
      const lateDays = a.filter((x) => x.status === 'late').length;
      const absentDays = a.filter((x) => x.status === 'absent').length;
      const leaveDays = a.filter((x) => x.status === 'leave').length;
      const overtimeDays = a.filter(
        (x) => (x.overtimeMinutes || 0) > 0 || x.status === 'overtime',
      ).length;
      const totalLateMinutes = a.reduce((s, x) => s + (x.lateMinutes || 0), 0);
      const totalWorkMinutes = a.reduce((s, x) => s + (x.totalWorkMinutes || 0), 0);
      const totalOvertimeMinutes = a.reduce((s, x) => s + (x.overtimeMinutes || 0), 0);
      const onTimeRate =
        presentDays > 0 ? Math.round(((presentDays - lateDays) / presentDays) * 100) : 0;
      return {
        userId: emp.id,
        userName: emp.name,
        employeeId: emp.employeeId,
        department: emp.department,
        presentDays,
        lateDays,
        absentDays,
        leaveDays,
        overtimeDays,
        totalLateMinutes,
        totalWorkMinutes,
        totalOvertimeMinutes,
        onTimeRate,
      };
    });
  }, [employees, attendance]);

  const filteredReports = useMemo(() => {
    const q = search.toLowerCase();
    return reports.filter(
      (r) => r.userName.toLowerCase().includes(q) || r.department.toLowerCase().includes(q),
    );
  }, [reports, search]);

  const stats = useMemo(() => {
    if (reports.length === 0)
      return { onTimeRate: 0, lateCount: 0, absentCount: 0, leaveCount: 0, overtimeHours: 0 };
    const totalPresent = sum(reports, 'presentDays');
    const totalLate = sum(reports, 'lateDays');
    const onTimeRate =
      totalPresent > 0 ? Math.round(((totalPresent - totalLate) / totalPresent) * 100) : 0;
    return {
      onTimeRate,
      lateCount: sum(reports, 'totalLateMinutes'),
      absentCount: sum(reports, 'absentDays'),
      leaveCount: sum(reports, 'leaveDays'),
      overtimeHours: Math.round((sum(reports, 'totalOvertimeMinutes') / 60) * 10) / 10,
    };
  }, [reports]);

  // ── Export 1: detail per karyawan (CSV Excel-aman) ──
  const handleExport = () => {
    const headers = [
      'Nama',
      'ID Karyawan',
      'Unit',
      'Hadir',
      'Telat',
      'Izin',
      'Alfa',
      'Lembur (hari)',
      'Menit Telat',
      'Lembur (menit)',
      'Jam Kerja',
      'Tepat Waktu %',
    ];
    const body = filteredReports.map((r) => [
      r.userName,
      r.employeeId,
      r.department,
      r.presentDays,
      r.lateDays,
      r.leaveDays,
      r.absentDays,
      r.overtimeDays,
      r.totalLateMinutes,
      r.totalOvertimeMinutes,
      fmtHm(r.totalWorkMinutes),
      `${r.onTimeRate}%`,
    ]);
    const totals = [
      'TOTAL',
      '',
      `${filteredReports.length} karyawan`,
      sum(filteredReports, 'presentDays'),
      sum(filteredReports, 'lateDays'),
      sum(filteredReports, 'leaveDays'),
      sum(filteredReports, 'absentDays'),
      sum(filteredReports, 'overtimeDays'),
      sum(filteredReports, 'totalLateMinutes'),
      sum(filteredReports, 'totalOvertimeMinutes'),
      fmtHm(sum(filteredReports, 'totalWorkMinutes')),
      '',
    ];
    const rows = [
      ['Laporan Absensi — JNE Martapura'],
      ['Periode', monthLabel],
      [],
      headers,
      ...body,
      [],
      totals,
    ];
    downloadFile(buildCsv(rows), `Laporan_Absensi_${month}.csv`);
  };

  // ── Export 2: ringkasan per Unit/Departemen (CSV) ──
  const handleExportDept = () => {
    const byDept = new Map<string, EmployeeReport[]>();
    filteredReports.forEach((r) => {
      const k = r.department || '—';
      if (!byDept.has(k)) byDept.set(k, []);
      byDept.get(k)!.push(r);
    });
    const headers = [
      'Unit',
      'Jml Karyawan',
      'Hadir',
      'Telat',
      'Izin',
      'Alfa',
      'Lembur (menit)',
      'Rata Tepat Waktu %',
    ];
    const body = Array.from(byDept.entries()).map(([dept, list]) => {
      const present = sum(list, 'presentDays');
      const late = sum(list, 'lateDays');
      const avgOnTime = present > 0 ? Math.round(((present - late) / present) * 100) : 0;
      return [
        dept,
        list.length,
        present,
        late,
        sum(list, 'leaveDays'),
        sum(list, 'absentDays'),
        sum(list, 'totalOvertimeMinutes'),
        `${avgOnTime}%`,
      ];
    });
    const rows = [
      ['Ringkasan Kehadiran per Unit — JNE Martapura'],
      ['Periode', monthLabel],
      [],
      headers,
      ...body,
    ];
    downloadFile(buildCsv(rows), `Ringkasan_Unit_${month}.csv`);
  };

  // ── Export 3: cetak PDF (laporan manajemen ber-branding via print window) ──
  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=1100,height=800');
    if (!win) return;
    const generated = new Date().toLocaleString('id-ID');
    const rowsHtml = filteredReports
      .map(
        (r, i) => `<tr>
        <td>${i + 1}</td>
        <td class="l"><b>${escHtml(r.userName)}</b><div class="sub">${escHtml(r.employeeId)}</div></td>
        <td class="l">${escHtml(r.department)}</td>
        <td>${r.presentDays}</td>
        <td>${r.lateDays}</td>
        <td>${r.leaveDays}</td>
        <td class="${r.absentDays > 0 ? 'red' : ''}">${r.absentDays}</td>
        <td>${r.overtimeDays}</td>
        <td class="${r.onTimeRate >= 90 ? 'green' : r.onTimeRate < 70 ? 'red' : ''}">${r.onTimeRate}%</td>
      </tr>`,
      )
      .join('');
    const totalsHtml = `<tr>
      <td></td><td class="l">TOTAL (${filteredReports.length} karyawan)</td><td></td>
      <td>${sum(filteredReports, 'presentDays')}</td>
      <td>${sum(filteredReports, 'lateDays')}</td>
      <td>${sum(filteredReports, 'leaveDays')}</td>
      <td>${sum(filteredReports, 'absentDays')}</td>
      <td>${sum(filteredReports, 'overtimeDays')}</td>
      <td>${stats.onTimeRate}%</td>
    </tr>`;
    const html = `<!doctype html><html lang="id"><head><meta charset="utf-8">
      <title>Laporan Kehadiran ${escHtml(monthLabel)} — JNE Martapura</title>
      <style>
        *{box-sizing:border-box}
        body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;margin:0;padding:26px}
        .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #E31E24;padding-bottom:12px;margin-bottom:16px}
        .brand{font-size:10px;font-weight:800;letter-spacing:3px;color:#E31E24;text-transform:uppercase}
        h1{font-size:21px;margin:4px 0 2px;font-weight:800}
        .muted{color:#64748b;font-size:12px}
        .ontime{text-align:right}.ontime .v{font-size:30px;font-weight:900;color:#059669;line-height:1}
        .ontime .k{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700}
        .cards{display:flex;gap:8px;margin-bottom:14px}
        .card{flex:1;border:1px solid #e2e8f0;border-radius:9px;padding:9px 11px}
        .card .k{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700}
        .card .v{font-size:18px;font-weight:800;margin-top:2px}
        table{width:100%;border-collapse:collapse;font-size:11px}
        th{background:#f1f5f9;text-align:center;padding:7px 5px;font-size:9px;text-transform:uppercase;letter-spacing:.4px;color:#475569;border-bottom:1px solid #cbd5e1}
        th.l,td.l{text-align:left}
        td{text-align:center;padding:6px 5px;border-bottom:1px solid #eef2f6}
        td .sub{font-size:9px;color:#94a3b8;font-weight:400}
        .red{color:#E31E24;font-weight:700}.green{color:#059669;font-weight:700}
        tfoot td{font-weight:800;background:#f8fafc;border-top:2px solid #cbd5e1}
        .foot{margin-top:16px;font-size:10px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:8px}
        @page{size:A4 landscape;margin:12mm}
        @media print{body{padding:0}.noprint{display:none}}
      </style></head><body>
      <div class="head">
        <div>
          <div class="brand">JNE Martapura</div>
          <h1>Laporan Kehadiran Karyawan</h1>
          <div class="muted">Periode <b>${escHtml(monthLabel)}</b> &middot; dibuat ${escHtml(generated)}</div>
        </div>
        <div class="ontime"><div class="v">${stats.onTimeRate}%</div><div class="k">Tepat Waktu</div></div>
      </div>
      <div class="cards">
        <div class="card"><div class="k">Total Telat</div><div class="v">${fmtHm(stats.lateCount)}</div></div>
        <div class="card"><div class="k">Alfa (Mangkir)</div><div class="v" style="color:#E31E24">${stats.absentCount}</div></div>
        <div class="card"><div class="k">Izin / Cuti</div><div class="v">${stats.leaveCount}</div></div>
        <div class="card"><div class="k">Total Lembur</div><div class="v">${stats.overtimeHours} jam</div></div>
        <div class="card"><div class="k">Karyawan</div><div class="v">${filteredReports.length}</div></div>
      </div>
      <table>
        <thead><tr>
          <th>No</th><th class="l">Karyawan</th><th class="l">Unit</th>
          <th>Hadir</th><th>Telat</th><th>Izin</th><th>Alfa</th><th>Lembur</th><th>Tepat Waktu</th>
        </tr></thead>
        <tbody>${rowsHtml || '<tr><td colspan="9" style="padding:24px;color:#94a3b8">Tidak ada data.</td></tr>'}</tbody>
        <tfoot>${totalsHtml}</tfoot>
      </table>
      <div class="foot">Sistem Absensi JNE Martapura &middot; Dokumen ini dihasilkan otomatis dari data kehadiran.</div>
      <script>window.onload=function(){setTimeout(function(){window.print()},350)}</script>
      </body></html>`;
    win.document.write(html);
    win.document.close();
  };

  return {
    loading,
    search,
    setSearch,
    month,
    setMonth,
    monthLabel,
    reports,
    filteredReports,
    stats,
    handleExport,
    handleExportDept,
    handlePrint,
  };
}
