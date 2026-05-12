'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAttendanceByRange } from '@/lib/firestore';
import type { AttendanceRecord } from '@/types';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { timeValueToISO } from '@/lib/departmentRules';
import {
  Search,
  Calendar,
  Filter,
  ArrowLeft,
  Building2,
  ChevronLeft,
  ChevronRight,
  History,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    present: { label: 'Present', color: 'text-success', bg: 'bg-success/10' },
    late: { label: 'Late', color: 'text-mustard', bg: 'bg-mustard/10' },
    absent: { label: 'Absent', color: 'text-pink', bg: 'bg-pink/10' },
    leave: { label: 'Leave', color: 'text-primary', bg: 'bg-primary/10' },
    overtime: { label: 'Overtime', color: 'text-cyan', bg: 'bg-cyan/10' },
  };
  const s = map[status] || map.absent;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${s.bg} ${s.color}`}>
      {s.label}
    </span>
  );
}

export default function AttendanceHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDept = searchParams.get('dept') || 'all';

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [deptFilter, setDeptFilter] = useState(initialDept);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const dateObj = parseISO(`${month}-01`);
        const start = startOfMonth(dateObj);
        const end = endOfMonth(dateObj);

        const data = await getAttendanceByRange(
          format(start, 'yyyy-MM-dd'),
          format(end, 'yyyy-MM-dd'),
        );
        setAttendance(data);
      } catch (error) {
        console.error('Failed to fetch attendance history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [month]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((item) => {
      const matchSearch =
        item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        item.employeeId.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === 'all' || item.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [attendance, search, deptFilter]);

  const handleExport = () => {
    const headers = ['Date', 'Name', 'ID', 'Unit', 'Status', 'Check In', 'Check Out'];
    const rows = filteredAttendance.map((a) => [
      a.date,
      a.employeeName,
      a.employeeId,
      a.department,
      a.status,
      a.checkIn?.time ? format(new Date(timeValueToISO(a.checkIn.time)), 'HH:mm:ss') : '-',
      a.checkOut?.time ? format(new Date(timeValueToISO(a.checkOut.time)), 'HH:mm:ss') : '-',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `History_Absensi_${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-primary pb-5">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-medium text-text-tertiary uppercase tracking-widest mb-2 hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={13} />
            Back
          </button>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight leading-none">
            Registry <span className="text-primary font-normal">Archive</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg border border-border-primary shadow-xs">
            <Calendar size={13} className="text-primary" />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent border-none text-[11px] font-bold text-text-primary outline-none w-32 cursor-pointer uppercase tracking-widest"
            />
          </div>
          <button
            onClick={handleExport}
            className="h-9 px-4 bg-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all"
          >
            <FileSpreadsheet size={13} />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-primary/5 border border-border-primary rounded-lg pl-9 pr-4 text-sm font-medium text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-border-primary rounded-lg shadow-xs">
          <Building2 size={13} className="text-primary" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-transparent text-[10px] font-bold text-text-secondary outline-none appearance-none cursor-pointer pr-8 min-w-[130px] uppercase tracking-wider"
          >
            <option value="all">All Units</option>
            <option value="Rider Martapura">Rider Martapura</option>
            <option value="Inbound">Inbound</option>
            <option value="Outbound">Outbound</option>
            <option value="Office">Office</option>
          </select>
          <Filter size={11} className="text-text-tertiary -ml-5 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-primary border border-border-primary rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary text-[8px] font-bold uppercase tracking-widest text-text-tertiary">
                <th className="px-5 py-3">Personnel</th>
                <th className="px-5 py-3">Unit</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-5 py-4">
                      <div className="h-3 w-full bg-secondary rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-[0.3]">
                      <History size={40} />
                      <p className="text-xs font-bold uppercase tracking-widest">No Records</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-[9px] font-bold text-text-tertiary">
                          {rec.employeeName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary tracking-tight">{rec.employeeName}</p>
                          <p className="text-[8px] font-medium text-text-tertiary">{rec.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[9px] font-medium text-text-secondary px-2 py-0.5 bg-secondary rounded border border-border-primary">
                        {rec.department}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-text-primary">
                          {format(parseISO(rec.date), 'dd MMM yyyy', { locale: localeId })}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 opacity-60">
                          <Clock3 size={10} className="text-primary" />
                          <span className="text-[9px] font-medium text-text-tertiary">
                            {rec.checkIn?.time
                              ? format(new Date(timeValueToISO(rec.checkIn.time)), 'HH:mm:ss')
                              : '—'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusChip status={rec.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="p-1.5 text-text-tertiary hover:text-primary transition-colors">
                        <Search size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border-primary flex items-center justify-between">
          <p className="text-[8px] font-medium text-text-tertiary uppercase tracking-wider">
            Total <span className="text-text-primary">{filteredAttendance.length}</span> records
          </p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-md bg-secondary border border-border-primary text-text-tertiary disabled:opacity-40 transition-all">
              <ChevronLeft size={16} />
            </button>
            <button className="p-1.5 rounded-md bg-secondary border border-border-primary text-text-tertiary hover:border-border-hover transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}