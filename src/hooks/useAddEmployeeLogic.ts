import { useState } from 'react';
import { registerEmployee } from '@/lib/firestore';
import type { JamKerja, Department } from '@/types';

export function useAddEmployeeLogic(onClose: () => void) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '', // Password wajib untuk Admin
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
    if (!form.name || !form.email || !form.password || !form.employeeId || !form.department || !form.jamKerjaId) {
      alert('Semua field wajib harus diisi (termasuk Password)!');
      return;
    }

    if (form.password.length < 6) {
      alert('Password minimal 6 karakter!');
      return;
    }

    setLoading(true);
    try {
      // Kita panggil registerEmployee yang baru (Auth + Firestore)
      const { password, ...employeeData } = form;
      
      await registerEmployee(
        {
          ...employeeData,
          role: 'employee',
          faceRegistered: false,
          isActive: true,
        },
        password
      );

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm({
          name: '',
          email: '',
          password: '',
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

    } catch (err: any) {
      console.error('Gagal menambah karyawan:', err);
      alert(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
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