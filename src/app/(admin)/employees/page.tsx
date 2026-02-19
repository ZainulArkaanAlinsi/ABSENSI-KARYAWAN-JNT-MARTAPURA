'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Filter, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { subscribeToEmployees, getShifts } from '@/lib/firestore';
import type { Employee, Shift } from '@/types';
import { StatusBadge, FaceBadge, ContractBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import AddEmployeeModal from '@/components/employees/AddEmployeeModal';
import Link from 'next/link';
import { format } from 'date-fns';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterFace, setFilterFace] = useState<'all' | 'registered' | 'unregistered'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const unsub = subscribeToEmployees((data) => {
      setEmployees(data);
      setLoading(false);
    });
    getShifts().then(setShifts);
    return unsub;
  }, []);

  const departments = ['all', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean)))];

  const filtered = employees.filter(emp => {
    const matchSearch = !search ||
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'all' || emp.department === filterDept;
    const matchFace = filterFace === 'all' ||
      (filterFace === 'registered' && emp.faceRegistered) ||
      (filterFace === 'unregistered' && !emp.faceRegistered);
    return matchSearch && matchDept && matchFace;
  });

  const shiftMap = Object.fromEntries(shifts.map(s => [s.id, s.name]));

  return (
    <AdminLayout title="Manajemen Karyawan" subtitle={`${employees.length} karyawan terdaftar`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color="#94A3B8" />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Cari nama, email, atau ID karyawan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <select
          className="form-input"
          style={{ width: 'auto', minWidth: 160 }}
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
        >
          {departments.map(d => (
            <option key={d} value={d}>{d === 'all' ? 'Semua Departemen' : d}</option>
          ))}
        </select>

        <select
          className="form-input"
          style={{ width: 'auto', minWidth: 160 }}
          value={filterFace}
          onChange={e => setFilterFace(e.target.value as typeof filterFace)}
        >
          <option value="all">Semua Status Wajah</option>
          <option value="registered">Wajah Terdaftar</option>
          <option value="unregistered">Belum Daftar Wajah</option>
        </select>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary shrink-0"
        >
          <Plus size={16} />
          Tambah Karyawan
        </button>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 mb-4">
        <span className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
          Total: <strong>{employees.length}</strong>
        </span>
        <span className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
          Wajah Terdaftar: <strong className="text-green-600">{employees.filter(e => e.faceRegistered).length}</strong>
        </span>
        <span className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
          Belum Daftar: <strong className="text-red-500">{employees.filter(e => !e.faceRegistered).length}</strong>
        </span>
        {filtered.length !== employees.length && (
          <span className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
            Menampilkan: <strong>{filtered.length}</strong>
          </span>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Search size={40} color="#CBD5E1" />
            <p className="text-slate-400 mt-3">Tidak ada karyawan ditemukan</p>
            {search && (
              <button onClick={() => setSearch('')} className="btn btn-secondary mt-3 text-sm">
                <RefreshCw size={14} /> Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th>ID / Departemen</th>
                  <th>Jabatan</th>
                  <th>Shift</th>
                  <th>Kontrak</th>
                  <th>Status Wajah</th>
                  <th>Perangkat</th>
                  <th>Bergabung</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center rounded-full text-white font-bold text-sm shrink-0"
                          style={{ width: 38, height: 38, background: '#E31E24' }}
                        >
                          {emp.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{emp.name}</p>
                          <p className="text-slate-400 text-xs">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-mono text-xs text-slate-600 font-semibold">{emp.employeeId || '-'}</p>
                      <p className="text-slate-400 text-xs">{emp.department}</p>
                    </td>
                    <td className="text-sm text-slate-600">{emp.position || '-'}</td>
                    <td className="text-sm text-slate-600">{shiftMap[emp.shiftId] || '-'}</td>
                    <td><ContractBadge type={emp.contractType} /></td>
                    <td><FaceBadge registered={emp.faceRegistered} /></td>
                    <td>
                      <p className="text-xs text-slate-500">{emp.deviceModel || '-'}</p>
                    </td>
                    <td className="text-xs text-slate-500">
                      {emp.joinDate ? format(new Date(emp.joinDate), 'dd MMM yyyy') : '-'}
                    </td>
                    <td>
                      <Link
                        href={`/employees/${emp.id}`}
                        className="btn btn-secondary text-xs px-3 py-1.5"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        shifts={shifts}
      />
    </AdminLayout>
  );
}
