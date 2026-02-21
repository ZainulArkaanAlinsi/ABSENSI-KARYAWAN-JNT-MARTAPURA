'use client';

import { Loader2, Mail, User, Building, Briefcase, Clock, Plus } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import type { Shift } from '@/types';
import { useAddEmployeeLogic } from '@/hooks/useAddEmployeeLogic';
import { motion, AnimatePresence } from 'framer-motion';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: Shift[];
}

const DEPARTMENTS = ['Operasional', 'Kurir', 'Admin', 'Gudang', 'IT', 'HR', 'Keuangan', 'Marketing'];

export default function AddEmployeeModal({ isOpen, onClose, shifts }: AddEmployeeModalProps) {
  const { loading, success, form, handleChange, handleSubmit } = useAddEmployeeLogic(onClose);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registry New Employee" maxWidth={680}>
      <AnimatePresence mode="wait">
        {success ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-24 h-24 rounded-3xl bg-linear-to-br from-jne-success/20 to-transparent flex items-center justify-center text-jne-success mb-8 border border-jne-success/30 shadow-2xl relative"
              >
                <div className="absolute inset-0 bg-jne-success/10 blur-xl rounded-full" />
                <div className="w-12 h-12 rounded-full bg-jne-success flex items-center justify-center text-white shadow-xl shadow-jne-success/40 relative z-10">
                  <span className="text-3xl font-black">✓</span>
                </div>
              </motion.div>
              <h3 className="text-3xl font-black text-white tracking-tight uppercase mb-3">Access Granted</h3>
              <p className="text-[12px] font-black text-(--text-dim) uppercase tracking-[0.4em] leading-relaxed max-w-sm">
                Identity matrix synchronized. Access package transmitted to <span className="text-jne-info">{form.email}</span>.
              </p>
            </div>
        ) : (
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#22d3ee]/5 border border-[#22d3ee]/10 text-[11px] text-[#22d3ee] font-black uppercase tracking-[0.2em] leading-relaxed shadow-inner backdrop-blur-xl">
              <Mail size={18} className="shrink-0 mt-0.5" />
              <p>System automation active. Initializing encrypted welcome package for new agent protocol.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">
                  Full Identity
                </label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-jne-red transition-all" size={14} />
                  <input className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-jne-red/50 transition-all shadow-inner" placeholder="Agent Name..." value={form.name}
                    onChange={e => handleChange('name', e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">
                  Agent ID Code
                </label>
                <div className="relative group">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-jne-red transition-all" size={14} />
                  <input className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-jne-red/50 transition-all shadow-inner" placeholder="JNE-XXX-000" value={form.employeeId}
                    onChange={e => handleChange('employeeId', e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">
                  Secure Email Link
                </label>
                <input type="email" className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-jne-red/50 transition-all shadow-inner" placeholder="identity@jnemtp.com" value={form.email}
                  onChange={e => handleChange('email', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">
                  Terminal Phone
                </label>
                <input className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-jne-red/50 transition-all shadow-inner" placeholder="+62 ..." value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">
                  Operational Sector
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={14} />
                  <select className="appearance-none w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-jne-red/50 transition-all shadow-inner cursor-pointer" value={form.department}
                    onChange={e => handleChange('department', e.target.value)} required>
                    <option value="" disabled className="bg-[#0f172a]">Select Sector</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#0f172a]">{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">
                  Designated Function
                </label>
                <input className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-jne-red/50 transition-all shadow-inner" placeholder="Position Profile..." value={form.position}
                  onChange={e => handleChange('position', e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">
                  Schedule Protocol
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={14} />
                  <select className="appearance-none w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-jne-red/50 transition-all shadow-inner cursor-pointer" value={form.shiftId}
                    onChange={e => handleChange('shiftId', e.target.value)} required>
                    <option value="" disabled className="bg-[#0f172a]">Select Protocol</option>
                    {shifts.map(s => (
                      <option key={s.id} value={s.id} className="bg-[#0f172a]">{s.name} [{s.checkInTime}-{s.checkOutTime}]</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">
                  Engagement Mode
                </label>
                <select className="appearance-none w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-jne-red/50 transition-all shadow-inner cursor-pointer" value={form.contractType}
                  onChange={e => handleChange('contractType', e.target.value)}>
                  <option value="permanent" className="bg-[#0f172a]">Permanent Agent</option>
                  <option value="contract" className="bg-[#0f172a]">External Link</option>
                  <option value="intern" className="bg-[#0f172a]">Temporary Asset</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Discard
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Deployment</span>
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

