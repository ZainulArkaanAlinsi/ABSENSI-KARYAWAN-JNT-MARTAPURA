'use client';

import { useEffect, useState } from 'react';
import { Search, Download, Filter, BarChart3 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getAttendanceByRange, getEmployees } from '@/lib/firestore';
import type { AttendanceRecord, Employee, AttendanceStatus } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { format, subDays } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const STATUS_OPTIONS: { value: AttendanceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'present', label: 'Hadir' },
  { value: 'late', label: 'Terlambat' },
  { value: 'absent', label: 'Tidak Hadir' },
  { value: 'leave', label: 'Izin' },
  { value: 'overtime', label: 'Lembur' },
];

function minsToHours(mins?: number) {
  if (!mins) return '-';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
}

export default function ReportsPage() {
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
    present: filtered.filter(a => a.status === 'present').length,
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

  return (
    <AdminLayout title="Laporan Absensi" subtitle="Analisis dan ekspor data kehadiran karyawan">
      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="form-label text-xs">Dari Tanggal</label>
            <input type="date" className="form-input text-sm" value={startDate}
              onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="form-label text-xs">Sampai Tanggal</label>
            <input type="date" className="form-input text-sm" value={endDate}
              onChange={e => setEndDate(e.target.value)} />
          </div>
          <div>
            <label className="form-label text-xs">Karyawan</label>
            <select className="form-input text-sm" value={filterEmployee}
              onChange={e => setFilterEmployee(e.target.value)}>
              <option value="all">Semua Karyawan</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label text-xs">Departemen</label>
            <select className="form-input text-sm" value={filterDept}
              onChange={e => setFilterDept(e.target.value)}>
              {departments.map(d => <option key={d} value={d}>{d === 'all' ? 'Semua' : d}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label text-xs">Status</label>
            <select className="form-input text-sm" value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as AttendanceStatus | 'all')}>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={exportCSV} className="btn btn-secondary w-full text-sm">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Hadir', value: summary.present, color: '#16A34A', bg: '#DCFCE7' },
          { label: 'Terlambat', value: summary.late, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Tidak Hadir', value: summary.absent, color: '#DC2626', bg: '#FEE2E2' },
          { label: 'Izin', value: summary.leave, color: '#2563EB', bg: '#DBEAFE' },
          { label: 'Lembur', value: summary.overtime, color: '#7C3AED', bg: '#EDE9FE' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">
            Data Absensi <span className="text-slate-400 font-normal text-sm">({filtered.length} record)</span>
          </h3>
          <BarChart3 size={18} color="#94A3B8" />
        </div>
        {loading ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <BarChart3 size={40} color="#CBD5E1" />
            <p className="text-slate-400 mt-3">Tidak ada data untuk filter yang dipilih</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Karyawan</th>
                  <th>Departemen</th>
                  <th>Status</th>
                  <th>Jam Masuk</th>
                  <th>Jam Pulang</th>
                  <th>Total Jam</th>
                  <th>Terlambat</th>
                  <th>Lembur</th>
                  <th>Skor Wajah</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(record => (
                  <tr key={record.id}>
                    <td className="text-sm font-medium text-slate-600">
                      {record.date ? format(new Date(record.date), 'dd MMM yyyy', { locale: localeId }) : '-'}
                    </td>
                    <td>
                      <p className="font-semibold text-slate-800 text-sm">{record.employeeName}</p>
                      <p className="text-slate-400 text-xs">{record.employeeId}</p>
                    </td>
                    <td className="text-sm text-slate-600">{record.department}</td>
                    <td><StatusBadge status={record.status} size="sm" /></td>
                    <td className="text-sm font-mono text-slate-700">{record.checkIn?.time || '-'}</td>
                    <td className="text-sm font-mono text-slate-700">{record.checkOut?.time || '-'}</td>
                    <td className="text-sm text-slate-600">{minsToHours(record.totalWorkMinutes)}</td>
                    <td className="text-sm" style={{ color: record.lateMinutes ? '#D97706' : '#94A3B8' }}>
                      {record.lateMinutes ? `${record.lateMinutes}m` : '-'}
                    </td>
                    <td className="text-sm" style={{ color: record.overtimeMinutes ? '#7C3AED' : '#94A3B8' }}>
                      {record.overtimeMinutes ? `${record.overtimeMinutes}m` : '-'}
                    </td>
                    <td className="text-sm">
                      {record.checkIn?.faceScore ? (
                        <span
                          className="font-semibold"
                          style={{ color: record.checkIn.faceScore >= 80 ? '#16A34A' : '#DC2626' }}
                        >
                          {record.checkIn.faceScore.toFixed(0)}%
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
