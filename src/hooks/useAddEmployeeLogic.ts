import { useState } from 'react';
import { addEmployee } from '@/lib/firestore';
import type { Shift } from '@/types';

export function useAddEmployeeLogic(onClose: () => void) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    position: '',
    shiftId: '',
    contractType: 'permanent' as 'permanent' | 'contract' | 'intern',
    joinDate: new Date().toISOString().split('T')[0],
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!form.name || !form.email || !form.employeeId || !form.department || !form.shiftId) {
      alert('Security Protocol: All required fields must be populated.');
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
        setForm({ name: '', email: '', phone: '', employeeId: '', department: '', position: '', shiftId: '', contractType: 'permanent', joinDate: new Date().toISOString().split('T')[0] });
        onClose();
      }, 2500);
    } catch (err) {
      console.error('System Error:', err);
      alert('Data Sync Failed. Please verify your connection to the secure server.');
    } finally {
      setLoading(false);
    }
  };

  return { loading, success, form, handleChange, handleSubmit };
}
