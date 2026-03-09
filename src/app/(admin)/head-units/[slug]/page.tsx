'use client';

import { useParams } from 'next/navigation';
import { 
  Users, 
  MapPin, 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Activity,
  CalendarDays,
  ShieldCheck,
  UserX,
  History
} from 'lucide-react';

import AdminLayout from '@/components/layout/AdminLayout';
import { DEPARTMENT_RULES } from '@/lib/departmentRules';
import { useEmployeeManagement } from '@/hooks/useEmployeeManagement';
import { motion } from 'framer-motion';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useEffect, useState } from 'react';
import { subscribeToTodayAttendance } from '@/lib/firestore';
import { AttendanceRecord } from '@/types';
import { format } from 'date-fns';

export default function HeadUnitPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { employees, loading: empLoading, jamKerjaMap } = useEmployeeManagement();
  
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [attLoading, setAttLoading] = useState(true);

  const rule = DEPARTMENT_RULES.find(r => r.id === slug);
  const unitEmployees = employees.filter(e => e.department === slug);

  useEffect(() => {
    if (!slug) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const unsub = subscribeToTodayAttendance(today, (data) => {
      // Filter attendance for this unit
      // Since attendance records might not always have department field correctly synced 
      // or we want to match by the employees currently in this unit
      const unitEmpIds = new Set(unitEmployees.map(e => e.id));
      const filtered = data.filter(r => unitEmpIds.has(r.userId));
      setAttendance(filtered);
      setAttLoading(false);
    });
    return unsub;
  }, [slug, unitEmployees.length]);

  if (!rule) {
    return (
      <AdminLayout title="Error" subtitle="Head unit tidak ditemukan">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle size={48} className="text-[#E31E24] mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Head Unit Tidak Ditemukan</h2>
          <p className="text-slate-500">Slug "{slug}" tidak terdaftar dalam sistem.</p>
        </div>
      </AdminLayout>
    );
  }

  // Stats
  const totalEmp = unitEmployees.length;
  const activeEmp = unitEmployees.filter(e => e.isActive).length;
  const faceRegistered = unitEmployees.filter(e => e.faceRegistered).length;
  
  const presentCount = attendance.filter(r => ['present', 'late', 'overtime'].includes(r.status)).length;
  const lateCount = attendance.filter(r => r.status === 'late').length;
  const absentCount = totalEmp > 0 ? (totalEmp - attendance.length) : 0;

  return (
    <AdminLayout
      title={rule.name}
      subtitle={rule.description}
    >
      {empLoading ? (
        <div className="flex justify-center py-24">
          <PageLoader />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today's Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Personel</span>
                <Users size={14} className="text-[#005596]" />
              </div>
              <p className="text-2xl font-black text-slate-900">{totalEmp}</p>
              <p className="text-[9px] text-slate-400 mt-1 uppercase">Unit Force Count</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Hadir Hari Ini</span>
                <ShieldCheck size={14} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600">{presentCount}</p>
              <p className="text-[9px] text-emerald-500/60 mt-1 uppercase">Checked-in Today</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Terlambat</span>
                <Clock size={14} className="text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600">{lateCount}</p>
              <p className="text-[9px] text-amber-500/60 mt-1 uppercase">Outside Tolerance</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#E31E24] uppercase tracking-widest">Belum Absen</span>
                <UserX size={14} className="text-[#E31E24]" />
              </div>
              <p className="text-2xl font-black text-[#E31E24]">{absentCount}</p>
              <p className="text-[9px] text-red-500/60 mt-1 uppercase">No Signal Detected</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Rule Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 rounded-xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E31E24]/10 text-[#E31E24]">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Aturan & Target Unit</h3>
                  <p className="text-[11px] text-slate-400">Sistem validasi otomatis</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={16} className="text-[#005596]" />
                    <span className="text-xs font-semibold text-slate-700">Validasi Geofencing</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {rule.gpsRequired 
                      ? `Radius ${rule.radiusMeters}m dari koordinat. Karyawan harus berada di dalam zona untuk absen.`
                      : 'Bebas lokasi untuk unit admin/support.'}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <History size={16} className="text-[#005596]" />
                    <span className="text-xs font-semibold text-slate-700">Threshold Waktu</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Toleransi: {rule.toleranceMinutes} menit. Terlambat akan tercatat otomatis di sistem.
                  </p>
                </div>

                {rule.target && (
                  <div className="md:col-span-2 rounded-xl bg-[#E31E24]/5 p-4 border border-[#E31E24]/10">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp size={16} className="text-[#E31E24]" />
                      <span className="text-xs font-bold text-[#E31E24] uppercase">Mission Target</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 italic">
                      "{rule.target}"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions / Other Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Face ID Compliance</span>
                  <Activity size={16} className="text-emerald-500" />
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-slate-900">{faceRegistered}</p>
                  <p className="text-sm font-bold text-slate-400 mb-1.5">/ {totalEmp}</p>
                </div>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(faceRegistered/totalEmp || 0) * 100}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
                <p className="mt-2 text-[10px] text-slate-400 uppercase font-black">Biometric Readiness</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-[#005596]/5 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <CalendarDays size={16} className="text-[#005596]" />
                  <span className="text-[10px] font-bold text-[#005596]/60 uppercase tracking-widest">Shift Protocol</span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Semua personel wajib mengikuti jam kerja yang telah ditentukan oleh Central Admin.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Employee List & Attendance Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider leading-none">Status Personel Hari Ini</h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Live Monitoring Unit</p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 rounded-lg bg-[#005596]/10 border border-[#005596]/20 text-[10px] font-bold text-[#005596] uppercase">
                  {unitEmployees.length} Personnel
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4 text-center">No</th>
                    <th className="px-6 py-4">Nama Personel</th>
                    <th className="px-6 py-4">Jam Kerja</th>
                    <th className="px-6 py-4">Absensi Masuk</th>
                    <th className="px-6 py-4">Validasi Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {unitEmployees.map((emp, i) => {
                    const record = attendance.find(r => r.userId === emp.id);
                    return (
                      <tr key={emp.id} className="hover:bg-white/1 transition-colors group">
                        <td className="px-6 py-4 text-center text-[10px] font-black text-slate-300 group-hover:text-slate-500">
                          {String(i + 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center text-[11px] font-black text-slate-900 group-hover:border-[#E31E24]/40 transition-colors shadow-sm">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900 leading-tight group-hover:text-[#E31E24] transition-colors">{emp.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{emp.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-slate-300" />
                            <span className="text-[10px] font-bold text-slate-600">
                              {jamKerjaMap[emp.jamKerjaId] || 'Not Set'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {record?.checkIn?.time ? (
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-emerald-600 font-mono">
                                  {format(new Date(record.checkIn.time), 'HH:mm:ss')}
                                </span>
                                <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">
                                  Signal Captured
                                </span>
                            </div>
                          ) :                              <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">
                                No Signal
                              </span>
                          }
                        </td>
                        <td className="px-6 py-4">
                          {record ? (
                             <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest border ${
                                record.status === 'present' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                  : record.status === 'late'
                                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : 'bg-slate-50 text-slate-400 border-slate-100'
                             }`}>
                              <ShieldCheck size={10} strokeWidth={3} />
                              {record.status === 'present' ? 'Verified' : record.status.toUpperCase()}
                             </div>
                          ) : (
                             <div className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#E31E24] border border-red-100">
                               <AlertCircle size={10} strokeWidth={3} />
                               MISSING
                             </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {unitEmployees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic bg-white/1">
                        Deployment Pending: No personnel assets in this unit
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
