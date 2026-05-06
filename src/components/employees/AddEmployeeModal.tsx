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

export default function AddEmployeeModal({
  isOpen,
  onClose,
  jamKerjas,
  departmentItems,
}: AddEmployeeModalProps) {
  const { loading, success, form, handleChange, handleSubmit } = useAddEmployeeLogic(onClose);

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
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[32px] bg-emerald-50 text-emerald-500 shadow-sm border border-emerald-100">
              <CheckCircle size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Personil Berhasil Didaftarkan!</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">Akses absensi telah aktif. Password default: <span className="font-black text-rose-600">JNE123!</span></p>
            
            <div className="mt-8 w-full max-w-sm bg-slate-50 rounded-[24px] border border-slate-100 p-6 text-left">
               <div className="space-y-4">
                  <div className="flex justify-between">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID</span>
                     <span className="text-xs font-black text-slate-900 italic">{form.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login Email</span>
                     <span className="text-xs font-bold text-slate-900">{form.email}@jne.mtp.com</span>
                  </div>
               </div>
            </div>

            <button
              onClick={onClose}
              className="mt-8 px-12 py-4 bg-slate-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all"
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
            <div className="flex items-start gap-4 p-5 bg-(--jne-rose)/5 rounded-[24px] border border-(--jne-rose)/10">
               <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-(--jne-rose) shadow-sm shrink-0">
                  <ShieldCheck size={20} />
               </div>
               <div>
                  <p className="text-[11px] font-black text-(--jne-rose) uppercase tracking-widest mb-1">Security Auto-Provisioning</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase italic">
                    Sistem akan membuat akun otomatis dengan password default <span className="font-black text-(--jne-rose)">JNE123!</span>. 
                    Karyawan diwajibkan mengganti password pada login pertama di aplikasi mobile.
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              
              {/* --- BAGIAN KIRI: DATA PRIBADI --- */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors" />
                    <input
                      type="text"
                      placeholder="Masukkan nama sesuai KTP"
                      className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-rose-600/50 focus:ring-4 focus:ring-rose-600/5 transition-all shadow-sm"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Corporate</label>
                  <div className="flex items-center">
                    <div className="relative flex-1 group">
                       <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors" />
                       <input
                        type="text"
                        placeholder="zainaril13"
                        className="w-full h-14 bg-white border border-slate-200 rounded-l-2xl pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-rose-600/50 focus:ring-4 focus:ring-rose-600/5 transition-all shadow-sm"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value.toLowerCase().replace(/\s+/g, ''))}
                        required
                      />
                    </div>
                    <div className="h-14 px-6 bg-slate-50 dark:bg-slate-900 border border-l-0 border-slate-200 dark:border-white/5 rounded-r-2xl flex items-center justify-center text-[10px] font-black text-slate-400 italic">
                       @jne.mtp.com
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Telepon (WhatsApp)</label>
                  <div className="relative group">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors" />
                    <input
                      type="text"
                      placeholder="+62 8XX XXXX XXXX"
                      className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-rose-600/50 focus:ring-4 focus:ring-rose-600/5 transition-all shadow-sm"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* --- BAGIAN KANAN: DATA PEKERJAAN --- */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee ID (Generated)</label>
                  <div className="relative">
                    <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-600" />
                    <input
                      type="text"
                      readOnly
                      className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-black text-slate-900 italic outline-none cursor-not-allowed"
                      value={form.employeeId}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Kerja / Departemen</label>
                  <div className="relative group">
                    <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors" />
                    <select
                      className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-10 text-sm font-bold text-slate-900 outline-none appearance-none focus:border-rose-600/50 focus:ring-4 focus:ring-rose-600/5 transition-all shadow-sm"
                      value={form.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      required
                    >
                      <option value="" disabled>Pilih Unit Kerja</option>
                      {departmentItems.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                       <ArrowRight size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jabatan Spesifik</label>
                  <div className="relative group">
                    <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors" />
                    <select
                      className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-10 text-sm font-bold text-slate-900 outline-none appearance-none focus:border-rose-600/50 focus:ring-4 focus:ring-rose-600/5 transition-all shadow-sm"
                      value={form.position}
                      onChange={(e) => handleChange('position', e.target.value)}
                      required
                    >
                      <option value="" disabled>Pilih Jabatan</option>
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
              </div>

            </div>

            {/* --- SHIFT SELECTION: VISUAL BADGES --- */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Clock size={14} /> Jam Kerja & Jadwal Operasional
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
                            ? 'border-rose-600 bg-rose-600/5 shadow-md shadow-rose-600/5' 
                            : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                        }`}
                      >
                         <div className="flex justify-between items-start mb-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                               <Clock size={16} />
                            </div>
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                               shift.name.toLowerCase().includes('pagi') ? 'bg-amber-100 text-amber-600' :
                               shift.name.toLowerCase().includes('sore') ? 'bg-emerald-100 text-emerald-600' :
                               'bg-slate-900 text-white'
                            }`}>
                               {shift.name.split(' ')[0]}
                            </span>
                         </div>
                         <p className={`text-xs font-black uppercase italic ${isSelected ? 'text-rose-600' : 'text-slate-900'}`}>{shift.name}</p>
                         <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                            {shift.checkInTime} — {shift.checkOutTime}
                         </p>
                      </button>
                    );
                  })}
               </div>
            </div>

            {/* --- FOOTER: SUBMIT ACTION --- */}
            <div className="flex items-center justify-between pt-6">
               <div className="flex flex-col">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Kontrak</p>
                  <div className="flex gap-2 mt-2">
                     {['permanent', 'contract', 'intern'].map((type) => (
                       <button
                         key={type}
                         type="button"
                         onClick={() => handleChange('contractType', type)}
                         className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                           form.contractType === type ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-400 border-slate-200'
                         }`}
                       >
                          {type}
                       </button>
                     ))}
                  </div>
               </div>
               
               <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-12 py-4 bg-rose-600 text-white rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {loading ? 'Processing...' : 'Simpan Personil'}
                  </button>
               </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
}