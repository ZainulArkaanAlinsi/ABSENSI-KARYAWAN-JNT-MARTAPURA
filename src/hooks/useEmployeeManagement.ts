import { useState, useEffect, useMemo } from 'react';
import { subscribeToEmployees, getJamKerjas, subscribeToDepartments } from '@/lib/firestore';
import { useDebounce } from './useDebounce';
import type { Employee, JamKerja, DepartmentItem } from '@/types';
import { toast } from 'sonner';

export function useEmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jamKerjas, setJamKerjas] = useState<JamKerja[]>([]);
  const [departmentItems, setDepartmentItems] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
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
        console.error('Critical: Employee Sync Failed', err);
        setError('Gagal sinkronisasi data karyawan.');
      }
    });

    const unsubDepts = subscribeToDepartments((data) => {
      if (!isMounted) return;
      setDepartmentItems(data || []);
    });

    getJamKerjas()
      .then((data) => {
        if (isMounted) setJamKerjas(data || []);
      })
      .catch((err) => {
        console.error('Jam Kerja fetch error', err);
      });

    return () => {
      isMounted = false;
      unsubEmployees();
      unsubDepts();
    };
  }, []);

  const departments = ['all', ...(departmentItems?.map((d) => d.name) || [])];

  const filteredEmployees = useMemo(() => {
    return (employees || []).filter((emp) => {
      if (!emp) return false;
      const s = debouncedSearch.toLowerCase();
      const matchSearch =
        !debouncedSearch ||
        (emp.name?.toLowerCase()?.includes(s) ?? false) ||
        (emp.email?.toLowerCase()?.includes(s) ?? false) ||
        (emp.employeeId?.toLowerCase()?.includes(s) ?? false);

      const matchDept = filterDept === 'all' || emp.department === filterDept;
      const matchFace =
        filterFace === 'all' ||
        (filterFace === 'registered' && emp.faceRegistered) ||
        (filterFace === 'unregistered' && !emp.faceRegistered);

      return matchSearch && matchDept && matchFace;
    });
  }, [employees, debouncedSearch, filterDept, filterFace]);

  const jamKerjaMap = Object.fromEntries((jamKerjas || []).map((s) => [s.id, s.name]));

  const deleteEmployeeOptimistic = async (id: string) => {
    // Save current state for rollback
    const previousEmployees = [...employees];

    // Optimistically update UI
    setEmployees(employees.filter((e) => e.id !== id));

    try {
      const { deleteEmployee } = await import('@/lib/firestore');
      await deleteEmployee(id);
      toast.success('Karyawan berhasil dihapus');
    } catch (err) {
      console.error('Deletion failed, rolling back', err);
      setEmployees(previousEmployees);
      toast.error('Gagal menghapus data. Silakan coba lagi.');
    }
  };

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
    deleteEmployeeOptimistic,
  };
}
