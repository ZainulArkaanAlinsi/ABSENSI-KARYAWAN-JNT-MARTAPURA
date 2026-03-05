import { useState, useEffect } from 'react';
import { subscribeToEmployees, getJamKerjas, subscribeToDepartments } from '@/lib/firestore';
import type { Employee, JamKerja, DepartmentItem } from '@/types';

export function useEmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jamKerjas, setJamKerjas] = useState<JamKerja[]>([]);
  const [departmentItems, setDepartmentItems] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterFace, setFilterFace] = useState<'all' | 'registered' | 'unregistered'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const unsubEmployees = subscribeToEmployees((data) => {
      setEmployees(data);
      if (departmentItems.length > 0) setLoading(false);
    });

    const unsubDepts = subscribeToDepartments((data) => {
      setDepartmentItems(data);
      if (employees.length > 0 || !loading) setLoading(false);
    });

    getJamKerjas().then(setJamKerjas);

    return () => {
      unsubEmployees();
      unsubDepts();
    };
  }, []);

  const departments = ['all', ...departmentItems.map(d => d.name)];

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

  const jamKerjaMap = Object.fromEntries((jamKerjas || []).map(s => [s.id, s.name]));

  return {
    employees: employees || [],
    jamKerjas: jamKerjas || [],
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
    departmentItems,
    filteredEmployees: filteredEmployees || [],
    jamKerjaMap,
  };
}

