import { useState, useEffect } from 'react';
import { registerEmployee, getNextEmployeeId, addJamKerja } from '@/lib/firestore';
import { toast } from 'sonner';
import type { Department, UserRole, WorkDay } from '@/types';

export function useAddEmployeeLogic(onClose: () => void) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    // Email pribadi/Gmail asli karyawan — tujuan kirim kredensial + link
    // download APK (onEmployeeCreated pakai personalEmail || email).
    personalEmail: '',
    password: 'JNE123!', // Auto-provisioned default password for new employees
    phone: '',
    employeeId: '',
    department: '' as Department,
    position: '',
    jamKerjaId: '',
    // Jam kerja custom langsung (tanpa harus bikin template shift dulu).
    // Kalau aktif, shift baru dibuat saat submit & jamKerjaId-nya dipakai.
    useCustomShift: false,
    customCheckIn: '08:00',
    customCheckOut: '17:00',
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
    const jamKerjaValid = form.useCustomShift
      ? !!form.customCheckIn && !!form.customCheckOut
      : !!form.jamKerjaId;
    if (!form.name || !form.email || !form.employeeId || !form.department || !jamKerjaValid) {
      toast.error('Semua field bertanda * wajib diisi (termasuk jam kerja)!');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password sistem tidak valid. Gunakan minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      // Jam kerja custom → buat shift baru dulu, pakai id-nya sebagai jamKerjaId
      // (mobile baca shifts/{jamKerjaId} untuk jam masuk/keluar).
      let resolvedJamKerjaId = form.jamKerjaId;
      if (form.useCustomShift) {
        resolvedJamKerjaId = await addJamKerja({
          name: `${form.name} (${form.customCheckIn}–${form.customCheckOut})`,
          checkInTime: form.customCheckIn,
          checkOutTime: form.customCheckOut,
          toleranceMinutes: 15,
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as WorkDay[],
          color: '#E31E24',
          isActive: true,
        });
      }

      // Kita panggil registerEmployee yang baru (Auth + Firestore).
      // Buang field helper custom shift (bukan field Employee).
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        password,
        useCustomShift: _ucs,
        customCheckIn: _cci,
        customCheckOut: _cco,
        ...employeeData
      } = form;
      /* eslint-enable @typescript-eslint/no-unused-vars */

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
          jamKerjaId: resolvedJamKerjaId,
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
          personalEmail: '',
          password: 'JNE123!',
          phone: '',
          employeeId: '',
          department: '' as Department,
          position: '',
          jamKerjaId: '',
          useCustomShift: false,
          customCheckIn: '08:00',
          customCheckOut: '17:00',
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
