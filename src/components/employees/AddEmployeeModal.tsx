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
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import type { JamKerja, DepartmentItem } from '@/types';
import { useAddEmployeeLogic } from '@/hooks/useAddEmployeeLogic';

import { motion, AnimatePresence } from 'framer-motion';
import { useStaggerEntrance, usePopAnimation } from '@/hooks/useAnime';
import { useEffect, useRef } from 'react';
import { animate } from 'animejs';


interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  jamKerjas: JamKerja[];
  departmentItems: DepartmentItem[];
}





export default function AddEmployeeModal({
  isOpen,
  onClose,
  jamKerjas,
  departmentItems,
}: AddEmployeeModalProps) {

  const { loading, success, form, handleChange, handleSubmit } =
    useAddEmployeeLogic(onClose);

  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Stagger form fields when modal opens
  useStaggerEntrance('.animate-field', formRef);

  const { elementRef: checkmarkRef, play: playPop } = usePopAnimation<HTMLDivElement>();

  useEffect(() => {
    if (success) {
      setTimeout(() => playPop(), 100);
    }
  }, [success, playPop]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Karyawan Baru" maxWidth={680}>
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="flex flex-col items-center justify-center px-6 py-12 text-center"
          >
            <div
              ref={checkmarkRef}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl ring-1 ring-green-500/30"
              style={{ backgroundColor: 'rgba(22,163,74,0.1)' }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{ backgroundColor: '#16A34A' }}
              >
                <CheckCircle size={20} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white">
              Karyawan berhasil ditambahkan
            </h3>
            <p className="mt-2 text-xs text-white/60 max-w-sm">
              Data karyawan baru dengan email{' '}
              <span className="font-medium" style={{ color: '#16A34A' }}>
                {form.email}
              </span>{' '}
              sudah tersimpan di sistem.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onSubmit={handleSubmit}
            className="flex flex-col"
          >
            {/* Info banner */}
            <div
              className="flex items-start gap-3 rounded-2xl border px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em]"
              style={{ backgroundColor: 'rgba(56,99,195,0.1)', borderColor: 'rgba(56,99,195,0.2)', color: '#3863C3' }}
            >
              <Mail size={16} className="mt-0.5 shrink-0" />
              <p className="leading-relaxed">
                Isi data karyawan dengan lengkap untuk mengaktifkan akses absensi dan penjadwalan.
              </p>
            </div>

            <div className="space-y-5 pr-1">
              {/* Fields sama seperti sebelumnya, hanya ganti warna */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="animate-field space-y-1.5">
                  <label className="ml-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                    Nama lengkap
                  </label>
                  <div className="group relative">
                    <User size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9BA4B4' }} />
                    <input
                      className="w-full rounded-xl border py-2.5 pl-10 pr-3 text-xs text-white shadow-inner outline-none transition-colors"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                      placeholder="Nama karyawan"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="animate-field space-y-1.5">
                  <label className="ml-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                    ID karyawan
                  </label>
                  <div className="group relative">
                    <Briefcase size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9BA4B4' }} />
                    <input
                      className="w-full rounded-xl border py-2.5 pl-10 pr-3 text-xs text-white shadow-inner outline-none transition-colors"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                      placeholder="JNE-XXX-000"
                      value={form.employeeId}
                      onChange={(e) => handleChange('employeeId', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="animate-field space-y-1.5">
                  <label className="ml-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-xl border py-2.5 px-3 text-xs text-white shadow-inner outline-none transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                    placeholder="nama"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                  <p className="ml-1 text-[9px] text-white/40">Otomatis @jne.mtp.com</p>
                </div>
                <div className="animate-field space-y-1.5">
                  <label className="ml-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl border py-2.5 px-3 text-xs text-white shadow-inner outline-none transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                    placeholder="Min. 6 karakter"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                  />
                </div>
                <div className="animate-field space-y-1.5">
                  <label className="ml-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                    Nomor telepon
                  </label>
                  <input
                    className="w-full rounded-xl border py-2.5 px-3 text-xs text-white shadow-inner outline-none transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                    placeholder="+62 ..."
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="animate-field space-y-1.5">
                  <label className="ml-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                    Unit Kerja (Departemen)
                  </label>
                  <div className="relative">
                    <Building size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9BA4B4' }} />
                    <select
                      className="w-full appearance-none rounded-xl border py-2.5 pl-10 pr-3 text-xs text-white shadow-inner outline-none transition-colors"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                      value={form.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      required
                    >
                      <option value="" disabled style={{ backgroundColor: '#1B2A4A' }}>Pilih unit kerja</option>
                      {departmentItems.map((d) => (
                        <option key={d.id} value={d.name} style={{ backgroundColor: '#1B2A4A' }}>
                          {d.name}
                        </option>
                      ))}
                    </select>

                  </div>
                </div>

                <div className="animate-field space-y-1.5">
                  <label className="ml-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                    Jabatan Spesifik
                  </label>
                  <input
                    className="w-full rounded-xl border py-2.5 px-3 text-xs text-white shadow-inner outline-none transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                    placeholder="Contoh: Kurir Rider, Admin Inbound"
                    value={form.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="animate-field space-y-1.5">
                  <label className="ml-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                    Jam Kerja
                  </label>

                  <div className="relative">
                    <Clock size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9BA4B4' }} />
                    <select
                      className="w-full appearance-none rounded-xl border py-2.5 pl-10 pr-3 text-xs text-white shadow-inner outline-none transition-colors"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                      value={form.jamKerjaId}
                      onChange={(e) => handleChange('jamKerjaId', e.target.value)}
                      required
                    >
                      <option value="" disabled style={{ backgroundColor: '#1B2A4A' }}>Pilih jam kerja</option>
                      {jamKerjas.map((s) => (
                        <option key={s.id} value={s.id} style={{ backgroundColor: '#1B2A4A' }}>
                          {s.name} [{s.checkInTime}-{s.checkOutTime}]
                        </option>
                      ))}
                    </select>

                  </div>

                  {/* Table Shift Selection */}
                  <div className="mt-2 rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <th className="px-3 py-2 text-left font-semibold uppercase tracking-widest" style={{ color: '#9BA4B4', fontSize: '9px' }}>
                            Nama Jam Kerja
                          </th>

                          <th className="px-3 py-2 text-center font-semibold uppercase tracking-widest" style={{ color: '#9BA4B4', fontSize: '9px' }}>
                            Masuk
                          </th>
                          <th className="px-3 py-2 text-center font-semibold uppercase tracking-widest" style={{ color: '#9BA4B4', fontSize: '9px' }}>
                            Keluar
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(jamKerjas || []).map((s, i) => (
                          <tr
                            key={s.id}
                            onClick={(e) => {
                              handleChange('jamKerjaId', s.id);
                              // Cool pop effect on click
                              animate(e.currentTarget, {
                                scale: [1, 1.02, 1],
                                duration: 200,
                                easing: 'outQuad'
                              });
                            }}
                            className="cursor-pointer transition-colors"
                            style={{
                              backgroundColor: form.jamKerjaId === s.id
                                ? 'rgba(56,99,195,0.15)'
                                : i % 2 === 0
                                ? 'rgba(255,255,255,0.02)'
                                : 'transparent',
                              borderTop: '1px solid rgba(255,255,255,0.05)',
                            }}
                          >
                            <td className="px-3 py-2 font-medium" style={{ color: form.jamKerjaId === s.id ? '#3863C3' : '#E2E8F0' }}>
                              {s.name}
                            </td>
                            <td className="px-3 py-2 text-center" style={{ color: '#9BA4B4' }}>
                              {s.checkInTime}
                            </td>
                            <td className="px-3 py-2 text-center" style={{ color: '#9BA4B4' }}>
                              {s.checkOutTime}
                            </td>
                          </tr>
                        ))}

                        {jamKerjas.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-3 py-4 text-center" style={{ color: '#9BA4B4' }}>
                              Tidak ada data jam kerja
                            </td>
                          </tr>
                        )}

                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="animate-field space-y-1.5">
                  <label className="ml-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#9BA4B4' }}>
                    Status kontrak
                  </label>
                  <select
                    className="w-full appearance-none rounded-xl border py-2.5 px-3 text-xs text-white shadow-inner outline-none transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                    value={form.contractType}
                    onChange={(e) => handleChange('contractType', e.target.value)}
                  >
                    <option value="permanent" style={{ backgroundColor: '#1B2A4A' }}>Karyawan tetap</option>
                    <option value="contract" style={{ backgroundColor: '#1B2A4A' }}>Kontrak</option>
                    <option value="intern" style={{ backgroundColor: '#1B2A4A' }}>Magang</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 flex gap-3 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center rounded-xl border px-4 py-2.5 text-xs font-medium transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#9BA4B4' }}
              >
                Batal
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-lg disabled:opacity-70"
                style={{ backgroundColor: '#E04B3A' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan karyawan</span>
                    <Plus size={16} />
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
}