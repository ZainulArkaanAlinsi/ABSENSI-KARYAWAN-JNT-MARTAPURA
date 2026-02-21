import { useState, useEffect } from 'react';
import { subscribeToEmployees, getShifts } from '@/lib/firestore';
import type { Employee, Shift } from '@/types';

export function useEmployeeManagement() {
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

  const filteredEmployees = employees.filter(emp => {
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

  return {
    employees,
    shifts,
    loading,
    search,
    setSearch,
    filterDept,
    setFilterDept,
    filterFace,
    setFilterFace,
    showAddModal,
    setShowAddModal,
    departments,
    filteredEmployees,
    shiftMap,
  };
}
