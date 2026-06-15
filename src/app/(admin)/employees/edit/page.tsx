'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Loader2,
  Check,
  User,
  Mail,
  Phone,
  IdCard,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  ToggleRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getEmployee, updateEmployee, getJamKerjas, subscribeToDepartments } from '@/lib/firestore';
import type { Employee, JamKerja, DepartmentItem } from '@/types';

const CONTRACT_TYPES = [
  { value: 'permanent', label: 'Tetap' },
  { value: 'contract', label: 'Kontrak' },
  { value: 'intern', label: 'Magang' },
];

const ROLES = [
  { value: 'employee', label: 'Karyawan' },
  { value: 'kurir', label: 'Kurir Motor' },
  { value: 'driver', label: 'Driver Mobil' },
];

export default function EmployeeEditPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams.get('id');

  const [original, setOriginal] = useState<Employee | null>(null);
  const [form, setForm] = useState<Partial<Employee>>({});
  const [jamKerjas, setJamKerjas] = useState<JamKerja[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load employee + jamKerja + departments
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    let unsubDept: (() => void) | undefined;
    (async () => {
      try {
        const [emp, jks] = await Promise.all([getEmployee(uid), getJamKerjas()]);
        if (emp) {
          setOriginal(emp);
          setForm({
            name: emp.name,
            phone: emp.phone,
            employeeId: emp.employeeId,
            department: emp.department,
            position: emp.position,
            jamKerjaId: emp.jamKerjaId,
            contractType: emp.contractType,
            joinDate: emp.joinDate?.split('T')[0],
            role: emp.role,
            isActive: emp.isActive,
            allowRemoteAttendance: emp.allowRemoteAttendance,
          });
        }
        setJamKerjas(jks);
        unsubDept = subscribeToDepartments((d) => setDepartments(d));
      } catch (e) {
        console.error('Failed to load employee:', e);
        toast.error('Gagal memuat data karyawan');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      unsubDept?.();
    };
  }, [uid]);

  const setField = <K extends keyof Employee>(key: K, value: Employee[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = () => {
    if (!original) return false;
    return Object.keys(form).some((k) => {
      const key = k as keyof Employee;
      return form[key] !== original[key];
    });
  };

  const handleSave = async () => {
    if (!uid || !original) return;
    if (!form.name?.trim()) return toast.error('Nama wajib diisi');
    if (!form.department) return toast.error('Departemen wajib diisi');

    setSaving(true);
    try {
      // Compute only the diff so updatedAt doesn't reset fields admin
      // didn't touch.
      const patch: Partial<Employee> = {};
      (Object.keys(form) as (keyof Employee)[]).forEach((k) => {
        if (form[k] !== original[k]) (patch as any)[k] = form[k];
      });

      if (Object.keys(patch).length === 0) {
        toast.message('Tidak ada perubahan untuk disimpan');
        setSaving(false);
        return;
      }

      await updateEmployee(uid, patch);
      toast.success('Perubahan disimpan');
      router.push(`/employees/detail?id=${uid}`);
    } catch (e: any) {
      console.error('Save failed:', e);
      toast.error(e?.message ?? 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 size={28} className="animate-spin text-emerald-500" />
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          Memuat data...
        </p>
      </div>
    );
  }

  if (!uid || !original) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <AlertCircle size={32} className="text-slate-300" />
        <p className="text-[13px] font-bold text-slate-600">Karyawan tidak ditemukan.</p>
        <button
          onClick={() => router.push('/employees')}
          className="mt-2 h-9 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-[12px] font-bold text-slate-600 transition-all"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-32">
      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/employees/detail?id=${uid}`)}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-all shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {original.employeeId} · Mode Edit
            </p>
            <h1 className="editorial-heading text-[22px] font-black text-slate-800 tracking-tight leading-none">
              Edit {original.name}
            </h1>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !hasChanges()}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-bold text-white transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            boxShadow: '0 4px 14px -4px rgba(16,185,129,0.4)',
          }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </motion.div>

      {/* ── FORM SECTIONS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Identitas */}
        <FormSection title="Identitas" icon={User} delay={0.05}>
          <FormField label="Nama Lengkap" icon={User} required>
            <input
              type="text"
              value={form.name ?? ''}
              onChange={(e) => setField('name', e.target.value)}
              className="form-input"
              placeholder="Nama lengkap karyawan"
            />
          </FormField>
          <FormField
            label="Email"
            icon={Mail}
            note="Email tidak bisa diubah (terkait Firebase Auth)"
          >
            <input
              type="email"
              value={original.email}
              disabled
              className="form-input opacity-60 cursor-not-allowed"
            />
          </FormField>
          <FormField label="Nomor HP" icon={Phone}>
            <input
              type="tel"
              value={form.phone ?? ''}
              onChange={(e) => setField('phone', e.target.value)}
              className="form-input"
              placeholder="0812..."
            />
          </FormField>
          <FormField label="ID Karyawan" icon={IdCard} required>
            <input
              type="text"
              value={form.employeeId ?? ''}
              onChange={(e) => setField('employeeId', e.target.value)}
              className="form-input"
              placeholder="JNE-MTP-001"
            />
          </FormField>
        </FormSection>

        {/* Penempatan */}
        <FormSection title="Penempatan" icon={Building2} delay={0.1}>
          <FormField label="Departemen" icon={Building2} required>
            <select
              value={form.department ?? ''}
              onChange={(e) => setField('department', e.target.value)}
              className="form-input"
            >
              <option value="">— Pilih Departemen —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Jabatan" icon={Briefcase}>
            <input
              type="text"
              value={form.position ?? ''}
              onChange={(e) => setField('position', e.target.value)}
              className="form-input"
              placeholder="Mis: Kurir Rider"
            />
          </FormField>
          <FormField label="Role Sistem" icon={ShieldCheck}>
            <select
              value={form.role ?? 'employee'}
              onChange={(e) => setField('role', e.target.value as any)}
              className="form-input"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Jam Kerja" icon={Clock}>
            <select
              value={form.jamKerjaId ?? ''}
              onChange={(e) => setField('jamKerjaId', e.target.value)}
              className="form-input"
            >
              <option value="">— Pilih Skema —</option>
              {jamKerjas.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name} ({j.checkInTime} – {j.checkOutTime})
                </option>
              ))}
            </select>
          </FormField>
        </FormSection>

        {/* Kontrak */}
        <FormSection title="Kontrak" icon={Calendar} delay={0.15}>
          <FormField label="Jenis Kontrak" icon={Briefcase}>
            <select
              value={form.contractType ?? 'permanent'}
              onChange={(e) => setField('contractType', e.target.value as any)}
              className="form-input"
            >
              {CONTRACT_TYPES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Tanggal Bergabung" icon={Calendar}>
            <input
              type="date"
              value={form.joinDate ?? ''}
              onChange={(e) => setField('joinDate', e.target.value)}
              className="form-input"
            />
          </FormField>
        </FormSection>

        {/* Status */}
        <FormSection title="Status Akun" icon={ToggleRight} delay={0.2}>
          <ToggleField
            label="Akun Aktif"
            desc="Nonaktifkan untuk mencegah login & sinkronisasi."
            checked={form.isActive ?? true}
            onChange={(v) => setField('isActive', v)}
            color="emerald"
          />
          <ToggleField
            label="Izinkan Absensi Remote"
            desc="Karyawan bisa absen di luar geofence kantor (cocok untuk kurir/driver)."
            checked={form.allowRemoteAttendance ?? false}
            onChange={(v) => setField('allowRemoteAttendance', v)}
            color="sky"
            icon={MapPin}
          />
        </FormSection>
      </div>

      <style jsx>{`
        :global(.form-input) {
          width: 100%;
          height: 42px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: white;
          font-size: 13px;
          font-weight: 500;
          color: #1e293b;
          outline: none;
          transition: all 0.15s ease;
        }
        :global(.form-input:focus) {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
      `}</style>
    </div>
  );
}

// ─── helpers ────────────────────────────────────────────────────

function FormSection({
  title,
  icon: Icon,
  delay = 0,
  children,
}: {
  title: string;
  icon: React.ElementType;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Icon size={16} className="text-emerald-600" />
        </div>
        <p className="text-[13px] font-black text-slate-800">{title}</p>
      </div>
      <div className="p-5 flex flex-col gap-4">{children}</div>
    </motion.div>
  );
}

function FormField({
  label,
  icon: Icon,
  required,
  note,
  children,
}: {
  label: string;
  icon: React.ElementType;
  required?: boolean;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon size={12} className="text-slate-400" />
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {children}
      {note && <p className="text-[10px] text-slate-400 leading-relaxed pl-4">{note}</p>}
    </div>
  );
}

function ToggleField({
  label,
  desc,
  checked,
  onChange,
  color = 'emerald',
  icon: Icon,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: 'emerald' | 'sky' | 'amber';
  icon?: React.ElementType;
}) {
  const colors = {
    emerald: {
      bg: 'bg-emerald-500',
      ring: 'ring-emerald-200',
      tint: 'bg-emerald-50 text-emerald-600',
    },
    sky: { bg: 'bg-sky-500', ring: 'ring-sky-200', tint: 'bg-sky-50 text-sky-600' },
    amber: { bg: 'bg-amber-500', ring: 'ring-amber-200', tint: 'bg-amber-50 text-amber-600' },
  }[color];

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
        checked
          ? `${colors.tint} border-transparent ring-2 ${colors.ring}`
          : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
      }`}
    >
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={15} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-slate-800">{label}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${checked ? colors.bg : 'bg-slate-300'}`}
      >
        <motion.div
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
        >
          {checked && <Check size={11} className="text-emerald-600" />}
        </motion.div>
      </div>
    </button>
  );
}
