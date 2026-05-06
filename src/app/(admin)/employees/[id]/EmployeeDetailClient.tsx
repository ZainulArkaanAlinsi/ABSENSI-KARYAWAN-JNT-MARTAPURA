'use client';

import { useEffect, useState, use } from 'react';
import { getEmployee, getAttendanceByRange } from '@/lib/firestore';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { format, subDays, parseISO } from 'date-fns';
import { id as dateFnsId } from 'date-fns/locale';
import { 
  ArrowLeft, User, Mail, Briefcase, Calendar, CheckCircle2, 
  AlertTriangle, XCircle, Clock, MapPin, Building, Smartphone,
  ExternalLink, ShieldCheck, Fingerprint, History
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { Employee, AttendanceRecord } from '@/types';

export default function EmployeeDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const employeeId = unwrappedParams.id;
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!employeeId) return;
      setLoading(true);
      try {
        const emp = await getEmployee(employeeId);
        setEmployee(emp);

        if (emp) {
           const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
           const endDate = format(new Date(), 'yyyy-MM-dd');
           const records = await getAttendanceByRange(startDate, endDate, emp.uid);
           setAttendance(records);
        }
      } catch (error) {
        console.error('Gagal memuat detail karyawan', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
          <PageLoader />
        </div>
        <p className="text-[11px] font-black text-(--text-muted) uppercase tracking-[0.4em] animate-pulse">Sinkronisasi Database...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <div className="h-24 w-24 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <AlertTriangle size={48} className="text-red-500/50" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Karyawan Terputus</h2>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Entitas ID tidak ditemukan dalam sistem JNE</p>
        </div>
        <Link href="/employees" className="mt-4 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-black tracking-widest uppercase">
          Kembali ke Terminal
        </Link>
      </div>
    );
  }

  const totalHadir = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const totalTelat = attendance.filter(a => a.status === 'late').length;
  const totalAbsen = attendance.filter(a => a.status === 'absent').length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20 px-4 lg:px-0">
      
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link 
            href="/employees" 
            className="h-14 w-14 flex items-center justify-center rounded-2xl bg-(--bg-card) border border-(--border-primary) hover:bg-white/10 hover:border-white/20 transition-all group shadow-sm active:scale-95"
          >
            <ArrowLeft size={22} className="text-zinc-400 group-hover:text-white transition-colors" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-500/20 rounded">Security Verified</span>
              <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Employee #{employee.employeeId}</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
              Personnel <span className="text-blue-500">Intelligence</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
            Reset Auth Device
          </button>
          <Link href={`/employees/${employee.id}/edit`} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-[0_10px_30px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 active:scale-95">
            Modify Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-(--bg-card) rounded-4xl border border-(--border-primary) p-10 shadow-2xl relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 w-48 h-48 bg-linear-to-bl from-blue-600/10 via-transparent to-transparent pointer-events-none group-hover:scale-125 transition-transform duration-700" />
             
             <div className="flex flex-col items-center">
                <div className="h-40 w-40 rounded-4xl bg-zinc-900 border-4 border-white/5 p-1 mb-8 relative group/photo overflow-hidden">
                  {employee.photoUrl ? (
                    <img src={employee.photoUrl} alt={employee.name} className="w-full h-full object-cover rounded-3xl group-hover/photo:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      <User size={64} />
                    </div>
                  )}
                  <div className={`absolute bottom-4 right-4 h-8 w-8 rounded-xl border-2 border-zinc-950 flex items-center justify-center shadow-2xl transition-transform hover:scale-110 ${employee.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {employee.faceRegistered ? <ShieldCheck size={16} className="text-white" /> : <XCircle size={16} className="text-white" />}
                  </div>
                </div>

                <div className="text-center space-y-2 mb-10">
                  <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">{employee.name}</h2>
                  <p className="text-[11px] font-black tracking-[0.3em] text-blue-500 bg-blue-500/10 px-4 py-1.5 rounded-full uppercase border border-blue-500/20 inline-block">
                    {employee.position || 'OPERATIVE'}
                  </p>
                </div>

                <div className="w-full space-y-3">
                  {[
                    { icon: Building, label: 'Departmental Node', value: employee.department || 'General' },
                    { icon: Mail, label: 'Neural Link (Email)', value: employee.email },
                    { icon: Calendar, label: 'Activation Date', value: employee.joinDate ? format(parseISO(employee.joinDate), 'dd MMMM yyyy') : 'Unknown' },
                    { icon: Smartphone, label: 'Linked Device', value: employee.deviceModel || 'Unlinked System' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl bg-white/2 border border-white/3 hover:bg-white/5 transition-all">
                      <div className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/5">
                        <item.icon size={18} className="text-zinc-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{item.label}</p>
                        <p className="text-sm font-bold text-white truncate max-w-[200px]">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </motion.div>

          <div className="bg-linear-to-br from-blue-600 to-indigo-900 rounded-4xl p-8 text-white relative overflow-hidden shadow-xl">
             <Fingerprint size={120} className="absolute -bottom-8 -right-8 opacity-10 -rotate-12" />
             <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-black uppercase italic tracking-widest">Biometric Status</h3>
                   <span className="px-3 py-1 bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-md">Active Zone</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className={`h-4 w-4 rounded-full ${employee.faceRegistered ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
                   <p className="text-lg font-black tracking-tight uppercase italic">
                      {employee.faceRegistered ? 'Face Signature Locked' : 'Signature Required'}
                   </p>
                </div>
                <p className="text-xs text-white/60 font-bold uppercase tracking-wider leading-relaxed">
                   Biometric verification ensures 99.9% operational integrity across all attendance protocols.
                </p>
             </div>
          </div>
        </div>


        {/* Right Column: Attendance Logs */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { label: 'Attendance Score', value: totalHadir, sub: 'Last 30 Cycles', color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
               { label: 'Latency Issues', value: totalTelat, sub: 'Late Encounters', color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
               { label: 'Mission Failure', value: totalAbsen, sub: 'Absent Entries', color: 'text-red-500', bg: 'bg-red-500/5', border: 'border-red-500/10' }
             ].map((stat, idx) => (
               <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 * idx }}
                key={idx} 
                className={`${stat.bg} ${stat.border} rounded-4xl p-8 border flex flex-col items-center justify-center text-center group hover:bg-opacity-80 transition-all`}
               >
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 group-hover:text-zinc-400 transition-colors">{stat.label}</span>
                  <span className={`text-5xl font-black ${stat.color} tracking-tighter mb-1 italic`}>{stat.value}</span>
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{stat.sub}</span>
               </motion.div>
             ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="bg-(--bg-card) rounded-4xl border border-(--border-primary) shadow-2xl overflow-hidden flex flex-col"
          >
             <div className="px-10 py-8 border-b border-(--border-primary) flex justify-between items-center bg-white/2">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <History size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">Operational Log</h3>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">History Matrix — 30 Day Spectrum</p>
                  </div>
                </div>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-(--border-primary) bg-zinc-950/50">
                     <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Log Entry (Date)</th>
                     <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Sync IN</th>
                     <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Sync OUT</th>
                     <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Vector (Location)</th>
                     <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Integrity</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-(--border-primary)">
                   <AnimatePresence mode="popLayout">
                   {attendance.length === 0 ? (
                     <tr>
                       <td colSpan={5} className="px-10 py-24 text-center">
                         <div className="flex flex-col items-center justify-center gap-6 max-w-xs mx-auto">
                            <div className="h-20 w-20 bg-zinc-900 rounded-4xl flex items-center justify-center border border-white/5 shadow-inner">
                               <Clock size={32} className="text-zinc-700" />
                            </div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed text-center">No operational telemetry detected.</p>
                         </div>
                       </td>
                     </tr>
                   ) : (
                     attendance.map((record, index) => (
                       <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        key={record.id} 
                        className="hover:bg-white/3 transition-all group"
                       >
                         <td className="px-10 py-6 whitespace-nowrap">
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-white italic uppercase tracking-tight">
                                {format(parseISO(record.date), 'dd MMM yyyy', { locale: dateFnsId })}
                              </span>
                              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                {format(parseISO(record.date), 'EEEE', { locale: dateFnsId })}
                              </span>
                           </div>
                         </td>
                         <td className="px-10 py-6 text-center">
                           <span className="text-base font-black text-white tracking-tighter tabular-nums italic">
                             {record.checkIn ? format(parseISO(record.checkIn.time), 'HH:mm') : '--:--'}
                           </span>
                         </td>
                         <td className="px-10 py-6 text-center">
                           <span className="text-base font-black text-zinc-500 tracking-tighter tabular-nums italic group-hover:text-white transition-colors">
                             {record.checkOut ? format(parseISO(record.checkOut.time), 'HH:mm') : '--:--'}
                           </span>
                         </td>
                         <td className="px-10 py-6">
                            <div className="flex items-center gap-2 group/map">
                              <MapPin size={14} className="text-zinc-600 group-hover/map:text-blue-500 transition-colors" />
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate max-w-[150px]">
                                {record.checkIn ? `${record.checkIn.distance.toFixed(0)}m from HQ` : 'Vector Unknown'}
                              </span>
                              {record.checkIn && (
                                <a 
                                  href={`https://www.google.com/maps?q=${record.checkIn.latitude},${record.checkIn.longitude}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="opacity-0 group-hover/map:opacity-100 transition-opacity"
                                >
                                  <ExternalLink size={12} className="text-blue-500" />
                                </a>
                              )}
                            </div>
                         </td>
                         <td className="px-10 py-6 text-right">
                            {record.status === 'present' && <span className="inline-flex px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">OPTIMAL</span>}
                            {record.status === 'late' && <span className="inline-flex px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-500/20">LATENCY</span>}
                            {record.status === 'absent' && <span className="inline-flex px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-500/20">FAILURE</span>}
                            {record.status === 'leave' && <span className="inline-flex px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20">DELEGATED</span>}
                         </td>
                       </motion.tr>
                     ))
                   )}
                   </AnimatePresence>
                 </tbody>
               </table>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
