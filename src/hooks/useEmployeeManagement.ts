import { useState, useEffect } from 'react';
import { subscribeToEmployees, getJamKerjas, subscribeToDepartments } from '@/lib/firestore';
import type { Employee, JamKerja, DepartmentItem } from '@/types';

export function useEmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jamKerjas, setJamKerjas] = useState<JamKerja[]>([]);
  const [departmentItems, setDepartmentItems] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterFace, setFilterFace] = useState<'all' | 'registered' | 'unregistered'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const unsubEmployees = subscribeToEmployees((data) => {
      if (!isMounted) return;
      try {
        setEmployees(data || []);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Critical: Employee Sync Failed", err);
        setError("Gagal sinkronisasi data karyawan.");
      }
    });

    const unsubDepts = subscribeToDepartments((data) => {
      if (!isMounted) return;
      setDepartmentItems(data || []);
    });

    getJamKerjas()
      .then(data => {
        if (isMounted) setJamKerjas(data || []);
      })
      .catch(err => {
        console.error("Jam Kerja fetch error", err);
      });

    return () => {
      isMounted = false;
      unsubEmployees();
      unsubDepts();
    };
  }, []);

  const departments = ['all', ...(departmentItems?.map(d => d.name) || [])];

  const filteredEmployees = (employees || []).filter(emp => {
    if (!emp) return false;
    const s = search.toLowerCase();
    const matchSearch = !search ||
      (emp.name?.toLowerCase()?.includes(s) ?? false) ||
      (emp.email?.toLowerCase()?.includes(s) ?? false) ||
      (emp.employeeId?.toLowerCase()?.includes(s) ?? false);
    
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
    error,
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

