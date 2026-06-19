import { useState, useEffect } from 'react';
import { registerEmployee, getNextEmployeeId } from '@/lib/firestore';
import { toast } from 'sonner';
import type { Department, UserRole } from '@/types';

export function useAddEmployeeLogic(onClose: () => void) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'JNE123!', // Auto-provisioned default password for new employees
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
      setForm((prev) => ({ ...prev, employeeId: nextId }));
    };
    fetchNextId();
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => {
      const newForm = { ...prev, [field]: value } as typeof prev;

      // Auto-fill position if department changes
      if (field === 'department') {
        const valLower = String(value).toLowerCase();
        const isDelivery =
          valLower.includes('rider') ||
          valLower.includes('driver') ||
          valLower.includes('delivery') ||
          valLower === 'rider_delivery' ||
          valLower === 'driver_delivery';

        // Auto-enable remote attendance for delivery roles
        if (isDelivery) {
          newForm.allowRemoteAttendance = true;
          if (!prev.position) {
            newForm.position =
              valLower.includes('motor') || valLower.includes('rider')
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

    // Strict Validation: Remove password from mandatory manual check as it is auto-filled
    if (!form.name || !form.email || !form.employeeId || !form.department || !form.jamKerjaId) {
      toast.error('Semua field bertanda * wajib diisi!');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password sistem tidak valid. Gunakan minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      // Kita panggil registerEmployee yang baru (Auth + Firestore)
      const { password, ...employeeData } = form;

      // Determine role based on department
      const valLower = form.department.toLowerCase();
      let dynamicRole: UserRole = 'employee';
      if (
        valLower.includes('rider') ||
        valLower.includes('motor') ||
        valLower === 'rider_delivery'
      ) {
        dynamicRole = 'kurir';
      } else if (
        valLower.includes('driver') ||
        valLower.includes('mobil') ||
        valLower === 'driver_delivery'
      ) {
        dynamicRole = 'driver';
      }

      await registerEmployee(
        {
          ...employeeData,
          role: dynamicRole,
          isOnline: false,
          faceRegistered: false,
          isActive: true,
          allowRemoteAttendance: form.allowRemoteAttendance,
        },
        password,
      );

      toast.success('Karyawan berhasil didaftarkan');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm({
          name: '',
          email: '',
          password: 'JNE123!',
          phone: '',
          employeeId: '',
          department: '' as Department,
          position: '',
          jamKerjaId: '',
          contractType: 'permanent',
          joinDate: new Date().toISOString().split('T')[0],
          firstLogin: true,
          allowRemoteAttendance: false,
        });
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Gagal menambah karyawan:', err);
      toast.error((err as Error).message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    success,
    form,
    handleChange,
    handleSubmit,
  };
}
