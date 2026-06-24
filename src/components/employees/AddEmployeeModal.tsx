'use client';

import {
  Loader2,
  Mail,
  User,
  Building,
  Briefcase,
  Clock,
  Plus,
  CheckCircle,
  Phone,
  ArrowRight,
  ShieldCheck,
  Satellite,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import type { JamKerja, DepartmentItem } from '@/types';
import { useAddEmployeeLogic } from '@/hooks/useAddEmployeeLogic';
import { motion, AnimatePresence } from 'framer-motion';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  jamKerjas: JamKerja[];
  departmentItems: DepartmentItem[];
}

const inputCls = `w-full h-14 border rounded-2xl pl-12 pr-4 text-sm font-bold outline-none
  focus:border-cyan-600/50 focus:ring-4 focus:ring-cyan-600/5 transition-all shadow-sm
  dark:text-slate-100 dark:placeholder:text-slate-500`;

const selectCls = `w-full h-14 border rounded-2xl pl-12 pr-10 text-sm font-bold outline-none appearance-none
  focus:border-cyan-600/50 focus:ring-4 focus:ring-cyan-600/5 transition-all shadow-sm
  dark:text-slate-100`;

export default function AddEmployeeModal({
  isOpen,
  onClose,
  jamKerjas,
  departmentItems,
}: AddEmployeeModalProps) {
  const { loading, success, form, handleChange, handleSubmit } = useAddEmployeeLogic(onClose);

  const fieldStyle = {
    background: 'var(--surface-card)',
    borderColor: 'var(--border-default)',
    color: 'var(--text-primary)',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Daftarkan Personil Baru" maxWidth={720}>
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-500 shadow-sm border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle size={40} strokeWidth={2.5} />
            </div>
            <h3
              className="text-xl font-black uppercase tracking-tight italic"
              style={{ color: 'var(--text-primary)' }}
            >
              Personil Berhasil Didaftarkan!
            </h3>
            <p className="mt-2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Akses absensi telah aktif. Password default:{' '}
              <span className="font-black text-cyan-600">JNE123!</span>
            </p>

            <div
              className="mt-8 w-full max-w-sm rounded-3xl border p-6 text-left"
              style={{ background: 'var(--surface-hover)', borderColor: 'var(--border-card)' }}
            >
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    Employee ID
                  </span>
                  <span
                    className="text-xs font-black italic"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {form.employeeId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    Login Email
                  </span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {form.email}@jne.mtp.com
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-8 px-12 py-4 bg-slate-950 dark:bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all"
            >
              Kembali ke Dashboard
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-8 p-2"
          >
            {/* Header Info */}
            <div className="flex items-start gap-4 p-5 bg-cyan-600/5 rounded-3xl border border-cyan-600/10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-cyan-600 shadow-sm shrink-0"
                style={{ background: 'var(--surface-card)' }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[11px] font-black text-cyan-600 uppercase tracking-widest mb-1">
                  Security Auto-Provisioning
                </p>
                <p
                  className="text-[10px] font-bold leading-relaxed uppercase italic"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Sistem akan membuat akun otomatis dengan password default{' '}
                  <span className="font-black text-cyan-600">JNE123!</span>. Karyawan diwajibkan
                  mengganti password pada login pertama di aplikasi mobile.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {/* --- BAGIAN KIRI: DATA PRIBADI --- */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <User
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Masukkan nama sesuai KTP"
                      className={inputCls}
                      style={fieldStyle}
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    Email Corporate <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <div className="relative flex-1 group">
                      <Mail
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="zainaril13"
                        className={`${inputCls} rounded-r-none`}
                        style={fieldStyle}
                        value={form.email}
                        onChange={(e) =>
                          handleChange('email', e.target.value.toLowerCase().replace(/\s+/g, ''))
                        }
                        required
                      />
                    </div>
                    <div
                      className="h-14 px-4 rounded-r-2xl flex items-center justify-center text-[10px] font-black italic border border-l-0"
                      style={{
                        background: 'var(--surface-hover)',
                        borderColor: 'var(--border-default)',
                        color: 'var(--text-dim)',
                      }}
                    >
                      @jne.mtp.com
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black uppercase tracking-widest ml-1"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    Email Pribadi (Gmail)
                  </label>
                  <div className="relative group">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="budi@gmail.com"
                      className={inputCls}
                      style={fieldStyle}
                      value={form.personalEmail}
                      onChange={(e) => handleChange('personalEmail', e.target.value.trim())}
                    />
                  </div>
                  <p className="text-[10px] ml-1" style={{ color: 'var(--text-dim)' }}>
                    Kredensial login & link download APK dikirim ke email ini.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black uppercase tracking-widest ml-1"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    Nomor Telepon (WhatsApp)
                  </label>
                  <div className="relative group">
                    <Phone
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="+62 8XX XXXX XXXX"
                      className={inputCls}
                      style={fieldStyle}
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* --- BAGIAN KANAN: DATA PEKERJAAN --- */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    Unit Kerja / Departemen <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Building
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors"
                    />
                    <select
                      className={selectCls}
                      style={fieldStyle}
                      value={form.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Pilih Unit Kerja
                      </option>
                      {departmentItems.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ArrowRight size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    Jabatan Spesifik <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Briefcase
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors"
                    />
                    <select
                      className={selectCls}
                      style={fieldStyle}
                      value={form.position}
                      onChange={(e) => handleChange('position', e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Pilih Jabatan
                      </option>
                      <option value="Kurir Rider (Motor)">Kurir Rider (Motor)</option>
                      <option value="Kurir Driver (Mobil)">Kurir Driver (Mobil)</option>
                      <option value="Staff Gudang Inbound">Staff Gudang Inbound</option>
                      <option value="Staff Gudang Outbound">Staff Gudang Outbound</option>
                      <option value="Admin Operasional">Admin Operasional</option>
                      <option value="Sales Counter Officer">Sales Counter Officer</option>
                      <option value="Staff Pick Up">Staff Pick Up</option>
                      <option value="Staff Finance / Accounting">Staff Finance / Accounting</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ArrowRight size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label
                    className="text-[10px] font-black uppercase tracking-widest ml-1"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    Izin Absen Luar (Remote)
                  </label>
                  <div
                    onClick={() =>
                      handleChange('allowRemoteAttendance', !form.allowRemoteAttendance)
                    }
                    className="h-14 rounded-2xl px-5 flex items-center justify-between cursor-pointer transition-all shadow-sm border"
                    style={{
                      background: 'var(--surface-hover)',
                      borderColor: 'var(--border-default)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.allowRemoteAttendance ? 'bg-cyan-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}
                      >
                        <Satellite size={16} />
                      </div>
                      <div>
                        <p
                          className="text-[11px] font-black uppercase tracking-tight italic leading-none mb-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {form.allowRemoteAttendance ? 'Aktif' : 'Non-aktif'}
                        </p>
                        <p
                          className="text-[8px] font-bold uppercase tracking-widest"
                          style={{ color: 'var(--text-dim)' }}
                        >
                          Bypass Radius Hub
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${form.allowRemoteAttendance ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${form.allowRemoteAttendance ? 'translate-x-6' : 'translate-x-0'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- SHIFT SELECTION --- */}
            <div
              className="space-y-4 pt-4 border-t"
              style={{ borderColor: 'var(--border-default)' }}
            >
              <label
                className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2"
                style={{ color: 'var(--text-dim)' }}
              >
                <Clock size={14} /> Jam Kerja & Jadwal Operasional{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                {jamKerjas.map((shift) => {
                  const isSelected = form.jamKerjaId === shift.id;
                  return (
                    <button
                      key={shift.id}
                      type="button"
                      onClick={() => handleChange('jamKerjaId', shift.id)}
                      className={`p-5 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        isSelected
                          ? 'border-cyan-600 bg-cyan-600/5 shadow-md shadow-cyan-600/5'
                          : 'hover:scale-[1.01]'
                      }`}
                      style={
                        !isSelected
                          ? {
                              borderColor: 'var(--border-card)',
                              background: 'var(--surface-card)',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                            }
                          : undefined
                      }
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                          style={!isSelected ? { background: 'var(--surface-hover)' } : undefined}
                        >
                          <Clock size={16} />
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                            shift.name.toLowerCase().includes('pagi')
                              ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : shift.name.toLowerCase().includes('sore')
                                ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                          }`}
                        >
                          {shift.name.split(' ')[0]}
                        </span>
                      </div>
                      <p
                        className={`text-xs font-black uppercase italic ${isSelected ? 'text-cyan-600' : ''}`}
                        style={!isSelected ? { color: 'var(--text-primary)' } : undefined}
                      >
                        {shift.name}
                      </p>
                      <p
                        className="text-[10px] font-bold mt-1 uppercase tracking-tighter"
                        style={{ color: 'var(--text-dim)' }}
                      >
                        {shift.checkInTime} — {shift.checkOutTime}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- FOOTER --- */}
            <div className="flex items-center justify-between pt-6">
              <div className="flex flex-col">
                <p
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: 'var(--text-dim)' }}
                >
                  Status Kontrak
                </p>
                <div className="flex gap-2 mt-2">
                  {(['permanent', 'contract', 'intern'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleChange('contractType', type)}
                      className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                        form.contractType === type
                          ? 'bg-slate-950 dark:bg-emerald-500 text-white border-transparent'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                      style={
                        form.contractType !== type
                          ? {
                              background: 'var(--surface-card)',
                              borderColor: 'var(--border-default)',
                            }
                          : undefined
                      }
                    >
                      {type === 'permanent' ? 'Tetap' : type === 'contract' ? 'Kontrak' : 'Magang'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-4 bg-slate-950 dark:bg-cyan-600 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-950/20 dark:shadow-cyan-600/20 hover:bg-cyan-600 hover:shadow-cyan-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {loading ? 'Memproses...' : 'Simpan Personil'}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
}
