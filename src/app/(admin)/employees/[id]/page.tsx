'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building, Briefcase, Clock, Smartphone, Calendar, RotateCcw, Trash2, Shield } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getEmployee, updateEmployee, getShifts } from '@/lib/firestore';
import type { Employee, Shift } from '@/types';
import { FaceBadge, ContractBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    Promise.all([getEmployee(id), getShifts()]).then(([emp, sh]) => {
      setEmployee(emp);
      setShifts(sh);
      setLoading(false);
    });
  }, [id]);

  const handleResetFace = async () => {
    if (!employee || !confirm('Reset data wajah karyawan ini? Karyawan harus mendaftar ulang wajah.')) return;
    setResetting(true);
    await updateEmployee(id, { faceRegistered: false, deviceId: undefined, deviceModel: undefined });
    setEmployee(prev => prev ? { ...prev, faceRegistered: false } : null);
    setResetting(false);
  };

  const shiftName = shifts.find(s => s.id === employee?.shiftId)?.name || '-';
  const shift = shifts.find(s => s.id === employee?.shiftId);

  if (loading) return <AdminLayout title="Detail Karyawan"><PageLoader /></AdminLayout>;
  if (!employee) return (
    <AdminLayout title="Karyawan Tidak Ditemukan">
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-400">Karyawan tidak ditemukan.</p>
        <button onClick={() => router.back()} className="btn btn-secondary mt-4"><ArrowLeft size={14} /> Kembali</button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Personnel Profile" subtitle="Advanced Identity & Access Protocol Matrix">
      <div className="relative pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-jne-red/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="relative z-10 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 border-b border-white/5 pb-6"
          >
            <button 
              onClick={() => router.back()} 
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none mb-1.5">Employee Registry</p>
              <h2 className="text-xl font-bold text-white tracking-tight leading-none uppercase">{employee.name}</h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Identity Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="xl:col-span-4 space-y-8"
            >
              <div className="glass-premium p-6 rounded-2xl border border-white/5 bg-white/3 text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-jne-red to-jne-danger flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-jne-red/20">
                    {employee.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center shadow-lg">
                    <Shield size={16} className="text-jne-info" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white tracking-tight">{employee.name}</h3>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1.5">{employee.position} • {employee.department}</p>

                <div className="flex justify-center gap-2 mt-6">
                  <FaceBadge registered={employee.faceRegistered} />
                  <ContractBadge type={employee.contractType} />
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30">
                      <Mail size={14} />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Comm Link</p>
                      <p className="text-xs font-bold text-white/70 truncate">{employee.email}</p>
                    </div>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30">
                        <Phone size={14} />
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Mobile Terminal</p>
                        <p className="text-xs font-bold text-white/70">{employee.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30">
                      <Calendar size={14} />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Activation Date</p>
                      <p className="text-xs font-bold text-white/70">
                        {employee.joinDate ? format(new Date(employee.joinDate), 'dd MMMM yyyy') : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Management Sector */}
              <div className="glass-premium p-6 rounded-2xl border border-white/5 bg-white/3 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-jne-red border border-white/5">
                    <Shield size={16} />
                  </div>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">Management Protocols</h4>
                </div>

                <button
                  onClick={handleResetFace}
                  disabled={resetting || !employee.faceRegistered}
                  className="w-full btn-secondary py-3 flex items-center justify-center gap-2 text-[10px]"
                >
                  <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
                  {resetting ? 'Resetting Biometric...' : 'Reset Biometric Data'}
                </button>
                
                <button
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                  onClick={() => alert('Feature coming soon: Encrypted password reset.')}
                >
                  <Mail size={14} />
                  Transmit Reset Protocol
                </button>

                <button
                  className="w-full py-3 rounded-xl bg-jne-danger/10 border border-jne-danger/20 text-jne-danger text-[10px] font-bold uppercase tracking-widest hover:bg-jne-danger/20 transition-all flex items-center justify-center gap-2"
                  onClick={() => alert('Confirm personnel decommissioning.')}
                >
                  <Trash2 size={14} />
                  Deactivate Identity
                </button>
              </div>
            </motion.div>

            {/* Matrix Data Column */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="xl:col-span-8 space-y-8"
            >
              {/* Asset Allocation */}
              <div className="glass-premium p-6 rounded-2xl border border-white/5 bg-white/3">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 border border-white/5">
                    <Smartphone size={16} />
                  </div>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Asset Assignment</h4>
                </div>

                {employee.deviceModel ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/2 border border-white/5 shadow-inner">
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Terminal Signature</p>
                      <p className="text-sm font-bold text-white">{employee.deviceModel}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/2 border border-white/5 shadow-inner">
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Global Link Address</p>
                      <p className="text-xs font-mono text-white/60 break-all">{employee.deviceId || '-'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center opacity-40">
                    <Smartphone size={32} strokeWidth={1} className="mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No Terminal Registered</p>
                  </div>
                )}
              </div>

              {/* Temporal Protocol */}
              {shift && (
                <div className="glass-premium p-6 rounded-2xl border border-white/5 bg-white/3">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 border border-white/5">
                      <Clock size={16} />
                    </div>
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Temporal Protocol</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/2 border border-white/5 shadow-inner text-center">
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Sync Profile</p>
                      <p className="text-sm font-bold text-jne-red">{shift.name}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/2 border border-white/5 shadow-inner text-center">
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Activation Call</p>
                      <p className="text-sm font-bold text-white">{shift.checkInTime}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/2 border border-white/5 shadow-inner text-center">
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Release Call</p>
                      <p className="text-sm font-bold text-white">{shift.checkOutTime}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 rounded-xl bg-jne-info/5 border border-jne-info/10 flex items-center justify-between">
                    <p className="text-[9px] font-bold text-jne-info uppercase tracking-widest">Drift Tolerance</p>
                    <p className="text-[10px] font-bold text-white">{shift.toleranceMinutes} Minutes Buffer</p>
                  </div>
                </div>
              )}

              {/* Activity Ledger Placeholder or More Data */}
              <div className="glass-premium p-12 rounded-2xl border border-white/5 bg-white/3 border-dashed flex flex-col items-center justify-center text-center opacity-30">
                <Briefcase size={40} strokeWidth={1} className="mb-4" />
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Activity History Terminal</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Connecting to Intelligence Core...</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
