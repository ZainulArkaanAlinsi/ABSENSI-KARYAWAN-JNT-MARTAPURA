'use client';

import React, { useState } from 'react';
import { 
  Database, 
  Trash2, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  History,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  writeBatch,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS, getEmployees, getJamKerjas } from '@/lib/firestore';
import { useAuth } from '@/context/AuthContext';
import { format, subDays, startOfDay, addMinutes, isWeekend, parse } from 'date-fns';

export default function MaintenancePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const logStatus = (msg: string) => {
    setStatus(msg);
    console.log(msg);
  };

  const clearAttendance = async () => {
    if (!confirm('Hapus SEMUA riwayat absensi? Tindakan ini tidak bisa dibatalkan.')) return;
    
    setLoading(true);
    logStatus('Menghapus data absensi...');
    
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
      const total = snap.size;
      let deleted = 0;
      
      const batchSize = 500;
      for (let i = 0; i < snap.docs.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = snap.docs.slice(i, i + batchSize);
        chunk.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        deleted += chunk.length;
        setProgress(Math.round((deleted / total) * 100));
      }
      
      logStatus(`Berhasil menghapus ${deleted} data absensi.`);
      setProgress(0);
    } catch (err) {
      console.error(err);
      logStatus('Gagal menghapus data.');
    } finally {
      setLoading(false);
    }
  };

  const seedAttendance = async () => {
    setLoading(true);
    logStatus('Menyiapkan data seeding...');
    
    try {
      const employees = await getEmployees();
      const shifts = await getJamKerjas();
      
      if (employees.length === 0) {
        logStatus('Tidak ada karyawan ditemukan. Silakan tambah karyawan terlebih dahulu.');
        setLoading(false);
        return;
      }

      const totalDays = 30;
      const totalOperations = employees.length * totalDays;
      let completed = 0;
      
      logStatus(`Memulai seeding untuk ${employees.length} karyawan selama 30 hari...`);

      for (const emp of employees) {
        const batch = writeBatch(db);
        const empShift = shifts.find(s => s.id === emp.jamKerjaId) || shifts[0];
        
        for (let i = 0; i < totalDays; i++) {
          const currentDate = subDays(new Date(), i);
          if (isWeekend(currentDate)) continue; // Skip weekend

          const dateStr = format(currentDate, 'yyyy-MM-dd');
          
          // Generate random status
          const rand = Math.random();
          let status: 'present' | 'late' | 'absent' | 'leave' = 'present';
          if (rand > 0.95) status = 'absent';
          else if (rand > 0.90) status = 'leave';
          else if (rand > 0.70) status = 'late';

          if (status === 'absent' || status === 'leave') {
            const attRef = doc(collection(db, COLLECTIONS.ATTENDANCE));
            batch.set(attRef, {
              userId: emp.uid,
              employeeName: emp.name,
              employeeId: emp.employeeId,
              department: emp.department,
              jamKerjaId: emp.jamKerjaId,
              date: dateStr,
              status,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            continue;
          }

          // Generate Check-In
          const shiftInTime = empShift?.checkInTime || '08:00';
          const [h, m] = shiftInTime.split(':').map(Number);
          const baseIn = startOfDay(currentDate);
          baseIn.setHours(h, m, 0);

          let checkInTime: Date;
          if (status === 'late') {
            // Late between 16 to 60 minutes
            checkInTime = addMinutes(baseIn, 16 + Math.floor(Math.random() * 45));
          } else {
            // Early or on-time (up to 15 min early or 15 min late)
            checkInTime = addMinutes(baseIn, -15 + Math.floor(Math.random() * 30));
          }

          // Generate Check-Out (Randomly around 17:00 or shift out time)
          const shiftOutTime = empShift?.checkOutTime || '17:00';
          const [oh, om] = shiftOutTime.split(':').map(Number);
          const baseOut = startOfDay(currentDate);
          baseOut.setHours(oh, om, 0);
          const checkOutTime = addMinutes(baseOut, -5 + Math.floor(Math.random() * 60));

          const attRef = doc(collection(db, COLLECTIONS.ATTENDANCE));
          batch.set(attRef, {
            userId: emp.uid,
            employeeName: emp.name,
            employeeId: emp.employeeId,
            department: emp.department,
            jamKerjaId: emp.jamKerjaId,
            date: dateStr,
            status,
            checkIn: {
              time: format(checkInTime, 'HH:mm'),
              location: 'Kantor JNE Martapura',
              photoUrl: emp.photoUrl || null
            },
            checkOut: {
              time: format(checkOutTime, 'HH:mm'),
              location: 'Kantor JNE Martapura'
            },
            totalWorkMinutes: Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / 60000),
            lateMinutes: status === 'late' ? Math.floor((checkInTime.getTime() - baseIn.getTime()) / 60000) : 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        
        await batch.commit();
        completed += totalDays;
        setProgress(Math.min(100, Math.round((completed / totalOperations) * 100)));
      }

      logStatus('Seeding selesai! Data absensi 30 hari terakhir telah ditambahkan.');
      setProgress(0);
    } catch (err) {
      console.error(err);
      logStatus('Gagal melakukan seeding.');
    } finally {
      setLoading(false);
    }
  };

  // Tool seeding & hapus-massal hanya untuk Super Admin — cegah admin biasa
  // tak sengaja mengisi data palsu / menghapus absensi asli saat pertama pakai.
  if (user?.role !== 'superadmin') {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/10 text-red-600 mb-4">
          <AlertTriangle size={26} />
        </div>
        <h1 className="editorial-heading text-xl font-black uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Akses Terbatas</h1>
        <p className="text-sm mt-2 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
          Halaman maintenance (generate data & hapus absensi) hanya untuk <strong>Super Admin</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4 mb-2">
        <div className="h-12 w-12 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 shadow-sm border border-red-600/20">
          <Database size={24} />
        </div>
        <div>
          <h1 className="editorial-heading text-2xl font-black italic tracking-tighter uppercase" style={{ color: 'var(--text-primary)' }}>Sistem Maintenance</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>Database Tools & Data Seeding</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seeding Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden group"
          style={{ background: 'var(--surface-card)', borderColor: 'var(--border-card)' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-red-600/10 transition-colors" />
          
          <div className="flex items-center gap-3">
            <Zap className="text-red-600" size={20} />
            <h2 className="text-lg font-black italic uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Generate Mock Data</h2>
          </div>
          
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Gunakan fitur ini untuk mengisi dashboard dengan data dummy selama 30 hari terakhir. 
            Sangat berguna untuk demonstrasi atau pengujian visual dashboard.
          </p>

          <ul className="space-y-3">
            {[
              'Menghasilkan data absensi 30 hari terakhir',
              'Randomisasi status (Hadir, Terlambat, Izin)',
              'Otomatis menghitung menit keterlambatan',
              'Melewati hari Sabtu & Minggu (Weekend)'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={seedAttendance}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg
                     bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100"
          >
            {loading ? 'Processing...' : 'Start Seeding Data'}
          </button>
        </motion.div>

        {/* Cleanup Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden group"
          style={{ background: 'var(--surface-card)', borderColor: 'var(--border-card)' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-slate-600/10 transition-colors" />

          <div className="flex items-center gap-3">
            <Trash2 className="text-slate-400" size={20} />
            <h2 className="text-lg font-black italic uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Database Cleanup</h2>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Bersihkan semua riwayat absensi dari database. Gunakan ini jika Anda ingin memulai dari awal dengan data yang bersih.
          </p>

          <div className="p-4 rounded-2xl bg-red-600/5 border border-red-600/10 flex items-start gap-3">
            <AlertTriangle className="text-red-600 shrink-0" size={18} />
            <p className="text-[11px] font-bold text-red-600/80 uppercase tracking-tight leading-normal">
              Peringatan: Data yang dihapus tidak dapat dipulihkan kembali.
            </p>
          </div>

          <button
            onClick={clearAttendance}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed border
                     text-red-500 dark:text-red-400 border-red-500/20 dark:border-red-400/20 hover:bg-red-500/5"
          >
            Clear All Attendance
          </button>
        </motion.div>
      </div>

      {/* Progress & Log */}
      {(loading || status) && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border rounded-3xl p-6 space-y-4 shadow-2xl"
          style={{ background: 'var(--surface-card)', borderColor: 'var(--border-default)' }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <History size={16} className="text-red-600" />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Maintenance Log</span>
            </div>
            <span className="text-[10px] font-black uppercase" style={{ color: 'var(--text-dim)' }}>{progress}% Complete</span>
          </div>

          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
            <motion.div 
              className="h-full bg-red-600" 
              animate={{ width: `${progress}%` }} 
            />
          </div>

          <p className="text-[11px] font-mono break-all p-4 rounded-xl border" style={{ color: 'var(--text-muted)', background: 'var(--surface-hover)', borderColor: 'var(--border-card)' }}>
            {'> '} {status}
          </p>
        </motion.div>
      )}

      {/* Statistics Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Personnel', icon: Users, color: '#3B82F6' },
          { label: 'Attendance', icon: CheckCircle2, color: '#10B981' },
        ].map((item, i) => (
          <div key={i} className="border p-6 rounded-3xl flex items-center gap-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-card)' }}>
             <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}10`, color: item.color }}>
                <item.icon size={18} />
             </div>
             <div>
                <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1" style={{ color: 'var(--text-dim)' }}>{item.label}</p>
                <p className="text-lg font-black italic tracking-tighter uppercase leading-none" style={{ color: 'var(--text-primary)' }}>Ready</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
