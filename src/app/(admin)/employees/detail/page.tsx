'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getEmployee, getAttendanceByRange } from '@/lib/firestore';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { format, subDays, parseISO } from 'date-fns';
import { id as dateFnsId } from 'date-fns/locale';
import { ArrowLeft, User, Mail, Briefcase, Calendar, CheckCircle2, AlertTriangle, XCircle, Clock, Building, Edit3, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Employee, AttendanceRecord } from '@/types';

function EmployeeDetailContent() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('id');
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!employeeId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const emp = await getEmployee(employeeId);
        setEmployee(emp);

        if (emp) {
           // Tarik history absensi 30 hari terakhir
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
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <PageLoader />
        <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-[0.3em]">Memuat Rekam Jejak...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertTriangle size={48} className="text-[#E31E24]/50" />
        <h2 className="text-xl font-bold text-white">Karyawan Tidak Ditemukan</h2>
        <Link href="/employees" className="mt-4 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-xs font-black tracking-widest uppercase">
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  // Statistik Singkat
  const totalHadir = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const totalTelat = attendance.filter(a => a.status === 'late').length;
  const totalAbsen = attendance.filter(a => a.status === 'absent').length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
      
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Link 
          href="/employees" 
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
        >
          <ArrowLeft size={18} className="text-(--text-dim) group-hover:text-white transition-colors" />
        </Link>
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">Profil Karyawan</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-muted)">Rekam Jejak & Identitas</p>
        </div>
        <div className="ml-auto flex gap-3">
          <button 
            onClick={() => alert('Feature: Form edit data personil sedang disiapkan.')}
            className="h-11 px-6 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all"
          >
            <Edit3 size={16} /> Edit Personnel
          </button>
          <button 
            onClick={() => alert('Security Protocol: Reset biometrik memerlukan otorisasi fisik. Silakan instruksikan karyawan untuk login ulang di perangkat baru.')}
            className="h-11 px-6 rounded-xl bg-rose-600/10 border border-rose-600/20 text-rose-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-600 hover:text-white transition-all"
          >
            <RefreshCcw size={16} /> Reset Binding
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Kolom Kiri: Profil Card ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-6">
          <div className="bg-(--bg-card) rounded-4xl border border-(--border-primary) p-8 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-[#005596]/10 to-transparent pointer-events-none" />
             
             <div className="flex flex-col items-center text-center">
                <div className="h-28 w-28 rounded-full bg-black/20 border-4 border-white/5 flex items-center justify-center mb-6 relative">
                  {employee.photoUrl ? (
                    <img src={employee.photoUrl} alt={employee.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <User size={40} className="text-(--text-dim)" />
                  )}
                  <div className={`absolute bottom-0 right-0 h-6 w-6 rounded-full border-2 border-[#020617] flex items-center justify-center ${employee.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {employee.faceRegistered ? <CheckCircle2 size={12} className="text-white" /> : <XCircle size={12} className="text-white" />}
                  </div>
                </div>

                <h2 className="text-2xl font-black text-(--text-primary) tracking-tight mb-1">{employee.name}</h2>
                <p className="text-[11px] font-bold tracking-widest text-[#005596] uppercase bg-[#005596]/10 px-3 py-1 rounded-lg mb-6">
                  {employee.employeeId}
                </p>

                <div className="w-full space-y-4 text-left">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <Building size={16} className="text-(--text-muted)" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-(--text-muted)">Departemen</p>
                      <p className="text-sm font-bold text-(--text-primary)">{employee.department || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <Briefcase size={16} className="text-(--text-muted)" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-(--text-muted)">Posisi / Jabatan</p>
                      <p className="text-sm font-bold text-(--text-primary)">{employee.position || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <Mail size={16} className="text-(--text-muted)" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-(--text-muted)">Email Akses</p>
                      <p className="text-sm font-bold text-(--text-primary)">{employee.email}</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </motion.div>


        {/* ── Kolom Kanan: History & Stats ── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-(--bg-card) rounded-3xl border border-(--border-primary) p-6 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-(--text-muted) mb-2">Total Hadir (30 Hari)</span>
                <span className="text-3xl font-black text-emerald-500">{totalHadir}</span>
             </div>
             <div className="bg-(--bg-card) rounded-3xl border border-(--border-primary) p-6 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-(--text-muted) mb-2">Terlambat</span>
                <span className="text-3xl font-black text-amber-500">{totalTelat}</span>
             </div>
             <div className="bg-(--bg-card) rounded-3xl border border-(--border-primary) p-6 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-(--text-muted) mb-2">Alpha / Mangkir</span>
                <span className="text-3xl font-black text-[#E31E24]">{totalAbsen}</span>
             </div>
          </div>

          {/* Face History Gallery */}
          <div className="bg-(--bg-card) rounded-4xl border border-(--border-primary) p-8 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black italic tracking-tighter text-(--text-primary) uppercase">Galeri Riwayat Wajah</h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-(--text-muted)">Bukti Visual Scan Absensi</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-cyan-600/10 border border-cyan-600/20 flex items-center justify-center">
                  <User size={18} className="text-cyan-600" />
                </div>
             </div>

             <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {attendance.filter(a => a.checkIn?.photoUrl).length === 0 ? (
                  <div className="col-span-full py-10 text-center border-2 border-dashed border-(--border-primary) rounded-3xl">
                     <p className="text-[10px] font-black uppercase tracking-widest text-(--text-muted)">Tidak ada data visual</p>
                  </div>
                ) : (
                  attendance.filter(a => a.checkIn?.photoUrl).map((rec, i) => (
                    <motion.div 
                      key={rec.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-(--border-primary) cursor-pointer hover:border-cyan-600 transition-all shadow-sm"
                      onClick={() => window.open(rec.checkIn?.photoUrl, '_blank')}
                    >
                       <img 
                        src={rec.checkIn?.photoUrl} 
                        alt={`Scan ${rec.date}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                       />
                       <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                          <p className="text-[7px] font-black text-white uppercase truncate">{format(parseISO(rec.date), 'dd MMM')}</p>
                          <p className="text-[6px] font-bold text-white/60 uppercase">{rec.checkIn?.time ? format(parseISO(rec.checkIn.time), 'HH:mm') : '--:--'}</p>
                       </div>
                    </motion.div>
                  ))
                )}
             </div>
          </div>

          {/* Table History */}
          <div className="bg-(--bg-card) rounded-4xl border border-(--border-primary) shadow-sm overflow-hidden flex flex-col">
             <div className="px-8 py-6 border-b border-(--border-primary) flex justify-between items-center bg-white/2">
                <div>
                  <h3 className="text-lg font-black italic tracking-tighter text-(--text-primary) uppercase">Log Absensi</h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-(--text-muted)">30 Hari Terakhir</p>
                </div>
                <Calendar className="text-(--text-dim)" size={20} />
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-(--border-primary) bg-black/20">
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-(--text-muted)">Tanggal</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-(--text-muted)">Jam Masuk</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-(--text-muted)">Jam Pulang</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-(--text-muted)">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-(--border-primary)">
                   {attendance.length === 0 ? (
                     <tr>
                       <td colSpan={4} className="px-8 py-16 text-center">
                         <div className="flex flex-col items-center justify-center gap-3">
                            <Clock size={32} className="text-(--text-dim)" />
                            <p className="text-[11px] font-bold text-(--text-muted) uppercase tracking-widest">Belum Ada Riwayat Absensi</p>
                         </div>
                       </td>
                     </tr>
                   ) : (
                     attendance.map((record) => (
                       <tr key={record.id} className="hover:bg-white/5 transition-colors">
                         <td className="px-8 py-4 whitespace-nowrap">
                           <span className="text-sm font-bold text-(--text-primary)">
                             {record.date ? format(parseISO(record.date), 'dd MMM yyyy', { locale: dateFnsId }) : '-'}
                           </span>
                         </td>
                         <td className="px-8 py-4 whitespace-nowrap">
                           <span className="text-sm font-bold text-(--text-primary)">
                             {record.checkIn?.time ? format(parseISO(record.checkIn.time), 'HH:mm') : '--:--'}
                           </span>
                         </td>
                         <td className="px-8 py-4 whitespace-nowrap">
                           <span className="text-sm font-bold text-(--text-primary)">
                             {record.checkOut?.time ? format(parseISO(record.checkOut.time), 'HH:mm') : '--:--'}
                           </span>
                         </td>
                         <td className="px-8 py-4 whitespace-nowrap">
                            {record.status === 'present' && <span className="inline-flex px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">Tepat Waktu</span>}
                            {record.status === 'late' && <span className="inline-flex px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-500/20">Terlambat</span>}
                            {record.status === 'absent' && <span className="inline-flex px-3 py-1 bg-[#E31E24]/10 text-[#E31E24] text-[10px] font-black uppercase tracking-widest rounded-lg border border-[#E31E24]/20">Alpha</span>}
                            {record.status === 'leave' && <span className="inline-flex px-3 py-1 bg-[#005596]/10 text-[#005596] text-[10px] font-black uppercase tracking-widest rounded-lg border border-[#005596]/20">Izin / Cuti</span>}
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          </div>

        </motion.div>
      </div>

    </div>
  );
}

export default function EmployeeDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <PageLoader />
        <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-[0.3em]">Memuat Halaman...</p>
      </div>
    }>
      <EmployeeDetailContent />
    </Suspense>
  );
}
