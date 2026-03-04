import { useState } from 'react';
import { addEmployee } from '@/lib/firestore';
import type { JamKerja, Department } from '@/types';

export function useAddEmployeeLogic(onClose: () => void) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '' as Department,
    position: '',
    jamKerjaId: '',
    contractType: 'permanent' as 'permanent' | 'contract' | 'intern',
    joinDate: new Date().toISOString().split('T')[0],
    firstLogin: true,
  });


  const handleChange = (field: string, value: any) => {
    setForm((prev) => {
      const newForm = { ...prev, [field]: value };
      
      // Auto-fill position if department changes and position is empty
      if (field === 'department' && !prev.position) {
        const deptNames: Record<string, string> = {
          'rider_delivery': 'Kurir Motor (Rider)',
          'driver_delivery': 'Kurir Mobil (Driver)',
          'inbound_outbound': 'Staff Gudang',
          'pick_up': 'Staff Pick Up',
          'admin_support': 'Admin Operasional',
          'accounting': 'Staff Finance',
          'sales_sco': 'Sales Counter Officer',
        };
        newForm.position = deptNames[value] || '';
      }
      
      return newForm;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi lebih ketat
    if (!form.name || !form.email || !form.employeeId || !form.department || !form.jamKerjaId) {
      alert('Semua field wajib harus diisi!');
      return;
    }

    setLoading(true);
    try {
      await addEmployee({
        ...form,
        uid: '',
        role: 'employee',
        faceRegistered: false,
        isActive: true,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm({
          name: '',
          email: '',
          phone: '',
          employeeId: '',
          department: '' as any,
          position: '',
          jamKerjaId: '',
          contractType: 'permanent',
          joinDate: new Date().toISOString().split('T')[0],
          firstLogin: true,
        });
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Gagal menambah karyawan:', err);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return { 
    loading, 
    success, 
    form: form as any, // Using any here to bypass persistent inference issues in the component for now, but will improve later
    handleChange, 
    handleSubmit 
  };
}