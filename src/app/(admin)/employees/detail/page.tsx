'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { 
  ArrowLeft, 
  Mail, 
  MapPin, 
  Phone, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  Calendar,
  Clock,
  Activity,
  User,
  MoreVertical,
  Download,
  AlertCircle,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Fingerprint
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { BentoCard } from '@/components/ui/BentoCard';
import { StatusBadge, FaceBadge } from '@/components/ui/Badge';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import type { Employee, AttendanceRecord } from '@/types';

// ── COMPONENTS ──

const InfoItem = ({ icon: Icon, label, value, highlight = false }: any) => (
  <div className={`p-6 rounded-2xl transition-all border ${highlight ? 'bg-mustard bg-opacity-5 border-mustard border-opacity-10' : 'bg-slate-50 border-transparent hover:border-slate-100'}`}>
    <div className="flex items-center gap-3 mb-3">
      <Icon size={16} className={highlight ? 'text-mustard' : 'text-slate-400'} />
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-[15px] font-extrabold text-slate-900 tracking-tight">{value || 'Not specified'}</p>
  </div>
);

export default function EmployeeDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams.get('id');
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const unsubEmp = onSnapshot(doc(db, 'employees', uid), (doc) => {
      if (doc.exists()) {
        setEmployee({ id: doc.id, ...doc.data() } as Employee);
      }
      setLoading(false);
    });

    const attQuery = query(
      collection(db, 'attendance'),
      where('userId', '==', uid),
      orderBy('date', 'desc'),
      limit(20)
    );

    const unsubAtt = onSnapshot(attQuery, (snap) => {
      setAttendance(snap.docs.map(d => d.data() as AttendanceRecord));
    });

    return () => {
      unsubEmp();
      unsubAtt();
    };
  }, [uid]);

  const stats = useMemo(() => {
    if (!attendance.length) return { rate: 0, late: 0 };
    const present = attendance.filter(r => ['present', 'late', 'overtime'].includes(r.status)).length;
    const late = attendance.filter(r => r.status === 'late').length;
    return {
      rate: Math.round((present / attendance.length) * 100),
      late
    };
  }, [attendance]);

  if (loading) return <div className="h-screen flex items-center justify-center"><PageLoader /></div>;
  if (!employee) return <div className="p-20 text-center text-slate-400">Personnel record not found.</div>;

  return (
    <div className="flex flex-col gap-10 w-full pb-20 max-w-[1440px] mx-auto">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-mustard hover:border-mustard transition-all shadow-sm"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Personnel ID: {employee.employeeId}</span>
               <span className="text-slate-300">|</span>
               <span className={`text-[11px] font-bold uppercase tracking-widest ${employee.isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                 {employee.isOnline ? 'Live Activity' : 'Offline'}
               </span>
            </div>
            <h1 className="text-h1 font-extrabold text-slate-900 tracking-tight leading-none">
              {employee.name}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <AnimatedButton className="h-14 px-8 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-600 shadow-sm hover:border-mustard transition-all flex items-center gap-3">
            <Download size={18} />
            Export Record
          </AnimatedButton>
          <AnimatedButton className="h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-mustard transition-all">
            <MoreVertical size={24} />
          </AnimatedButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Profile & Info */}
        <div className="lg:col-span-4 space-y-8">
          <BentoCard className="p-10 flex flex-col items-center">
            <div className="relative mb-8">
               <div className="w-32 h-32 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-[40px] font-black shadow-xl">
                 {employee.name.charAt(0)}
               </div>
               <div className="absolute -bottom-2 -right-2">
                 <FaceBadge registered={employee.faceRegistered} />
               </div>
            </div>
            <h3 className="text-[20px] font-extrabold text-slate-900 mb-1">{employee.name}</h3>
            <p className="text-[13px] font-medium text-slate-400 uppercase tracking-widest mb-8">{employee.position}</p>
            
            <div className="w-full grid grid-cols-2 gap-4">
               <div className="p-6 bg-slate-50 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Performance</p>
                  <p className="text-[20px] font-extrabold text-slate-900">{stats.rate}%</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Hours</p>
                  <p className="text-[20px] font-extrabold text-slate-900">162h</p>
               </div>
            </div>
          </BentoCard>

          <BentoCard className="p-10">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8">Detailed Information</h4>
            <div className="space-y-4">
              <InfoItem icon={Mail} label="Email Address" value={employee.email} />
              <InfoItem icon={Phone} label="Contact Number" value={employee.phone} />
              <InfoItem icon={Building2} label="Department" value={employee.department} highlight />
              <InfoItem icon={Briefcase} label="Role Type" value={employee.position} />
            </div>
          </BentoCard>
        </div>

        {/* RIGHT COLUMN: Attendance & Activity */}
        <div className="lg:col-span-8 space-y-8">
          
          <BentoCard className="p-10">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-[20px] font-extrabold text-slate-900 tracking-tight mb-1">Attendance History</h3>
                  <p className="text-[13px] font-medium text-slate-400">Latest biometric synchronization records.</p>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[11px] font-bold text-slate-600 border border-slate-100">
                  <Calendar size={14} className="text-mustard" />
                  Last 20 Records
               </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50">
                        <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Check In</th>
                        <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                     </tr>
                  </thead>
                  <tbody>
                     {attendance.map((log, i) => (
                        <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors group">
                           <td className="px-8 py-5 text-desc font-bold text-slate-900">
                             {format(new Date(log.date), 'MMM dd, yyyy')}
                           </td>
                           <td className="px-8 py-5 text-desc font-medium text-slate-500 tabular-nums">
                             {typeof log.checkIn === 'string' ? log.checkIn : '—'}
                           </td>
                           <td className="px-8 py-5">
                             <StatusBadge status={log.status} />
                           </td>
                           <td className="px-8 py-5">
                             <div className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                                <MapPin size={12} className="group-hover:text-mustard transition-colors" />
                                Hub Martapura
                             </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {attendance.length === 0 && (
                  <div className="py-20 text-center flex flex-col items-center">
                    <AlertCircle size={32} className="text-slate-200 mb-4" />
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">No attendance records detected</p>
                  </div>
               )}
            </div>
          </BentoCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <BentoCard className="p-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 rounded-xl bg-mustard bg-opacity-10 flex items-center justify-center text-mustard">
                      <Fingerprint size={24} />
                   </div>
                   <h4 className="text-[16px] font-extrabold text-slate-900">Biometric Identity</h4>
                </div>
                <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-8">
                  Security credentials and face recognition synchronization status for this personnel.
                </p>
                <div className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <ShieldCheck size={18} className={employee.faceRegistered ? 'text-emerald-500' : 'text-slate-300'} />
                      <span className="text-[12px] font-bold text-slate-900">Face Recognition</span>
                   </div>
                   <FaceBadge registered={employee.faceRegistered} />
                </div>
             </BentoCard>

             <BentoCard className="p-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 rounded-xl bg-indigo-600 bg-opacity-10 flex items-center justify-center text-indigo-600">
                      <Lock size={24} />
                   </div>
                   <h4 className="text-[16px] font-extrabold text-slate-900">System Access</h4>
                </div>
                <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-8">
                  Privileges and administrative permissions authorized for this user account.
                </p>
                <button className="w-full h-14 border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:border-mustard hover:text-mustard transition-all flex items-center justify-center gap-2">
                   Edit Permissions <ChevronRight size={14} />
                </button>
             </BentoCard>
          </div>

        </div>
      </div>
    </div>
  );
}