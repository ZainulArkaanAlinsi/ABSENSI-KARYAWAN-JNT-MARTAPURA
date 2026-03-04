import { useState, useEffect } from 'react';
import { subscribeToEmployees, getJamKerjas } from '@/lib/firestore';
import type { Employee, JamKerja } from '@/types';

export function useEmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jamKerjas, setJamKerjas] = useState<JamKerja[]>([]);
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
    getJamKerjas().then(setJamKerjas);
    return unsub;
  }, []);

  const departments = ['all', 'rider_delivery', 'driver_delivery', 'inbound_outbound', 'pick_up', 'admin_support', 'accounting', 'sales_sco'];

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
    filteredEmployees: filteredEmployees || [],
    jamKerjaMap,
  };
}

