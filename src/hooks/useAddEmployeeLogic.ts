import { useState, useEffect } from 'react';
import { registerEmployee, getNextEmployeeId } from '@/lib/firestore';
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
    allowRemoteAttendance: false,
  });

  useEffect(() => {
    const fetchNextId = async () => {
      const nextId = await getNextEmployeeId();
      setForm(prev => ({ ...prev, employeeId: nextId }));
    };
    fetchNextId();
  }, []);


  const handleChange = (field: string, value: any) => {
    setForm((prev) => {
      const newForm = { ...prev, [field]: value };
      
      // Auto-fill position if department changes
      if (field === 'department') {
        const valLower = value.toLowerCase();
        const isDelivery = valLower.includes('rider') || 
                           valLower.includes('driver') || 
                           valLower.includes('delivery') ||
                           valLower === 'rider_delivery' ||
                           valLower === 'driver_delivery';

        // Auto-enable remote attendance for delivery roles
        if (isDelivery) {
          newForm.allowRemoteAttendance = true;
          if (!prev.position) {
            newForm.position = valLower.includes('motor') || valLower.includes('rider') 
              ? 'Kurir Rider (Motor)' 
              : 'Kurir Driver (Mobil)';
          }
        } else {
          newForm.allowRemoteAttendance = false;
        }
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
      
      // Determine role based on department
      const valLower = form.department.toLowerCase();
      let dynamicRole: any = 'employee';
      if (valLower.includes('rider') || valLower.includes('motor') || valLower === 'rider_delivery') {
        dynamicRole = 'kurir';
      } else if (valLower.includes('driver') || valLower.includes('mobil') || valLower === 'driver_delivery') {
        dynamicRole = 'driver';
      }

      await registerEmployee(
        {
          ...employeeData,
          role: dynamicRole,
          faceRegistered: false,
          isActive: true,
          allowRemoteAttendance: form.allowRemoteAttendance,
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
          allowRemoteAttendance: false,
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