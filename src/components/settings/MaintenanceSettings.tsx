'use client';

import React, { useState } from 'react';
import { 
  Database, 
  Trash2, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  History,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  collection, 
  getDocs, 
  doc, 
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS, getEmployees, getJamKerjas } from '@/lib/firestore';
import { format, subDays, startOfDay, addMinutes, isWeekend } from 'date-fns';

export default function MaintenanceSettings() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const logStatus = (msg: string) => {
    setStatus(msg);
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
      const docs = snap.docs;
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = docs.slice(i, i + batchSize);
        chunk.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        deleted += chunk.length;
        setProgress(Math.round((deleted / total) * 100));
      }
      
      logStatus(`Berhasil menghapus ${deleted} data.`);
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error(err);
      logStatus('Gagal menghapus data.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const seedAttendance = async () => {
    setLoading(true);
    logStatus('Menyiapkan data seeding...');
    
    try {
      const employees = await getEmployees();
      const shifts = await getJamKerjas();
      
      if (employees.length === 0) {
        logStatus('Tidak ada karyawan ditemukan.');
        setLoading(false);
        return;
      }

      const totalDays = 30;
      const totalOperations = employees.length * totalDays;
      let completed = 0;
      
      logStatus(`Memulai seeding untuk ${employees.length} karyawan...`);

      for (const emp of employees) {
        const batch = writeBatch(db);
        const empShift = shifts.find(s => s.id === emp.jamKerjaId) || shifts[0];
        
        for (let i = 0; i < totalDays; i++) {
          const currentDate = subDays(new Date(), i);
          if (isWeekend(currentDate)) continue;

          const dateStr = format(currentDate, 'yyyy-MM-dd');
          
          const rand = Math.random();
          let status: 'present' | 'late' | 'absent' | 'leave' = 'present';
          if (rand > 0.95) status = 'absent';
          else if (rand > 0.90) status = 'leave';
          else if (rand > 0.70) status = 'late';

          const attRef = doc(collection(db, COLLECTIONS.ATTENDANCE));
          
          if (status === 'absent' || status === 'leave') {
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

          const shiftInTime = empShift?.checkInTime || '08:00';
          const [h, m] = shiftInTime.split(':').map(Number);
          const baseIn = startOfDay(currentDate);
          baseIn.setHours(h, m, 0);

          let checkInTime: Date;
          if (status === 'late') {
            checkInTime = addMinutes(baseIn, 16 + Math.floor(Math.random() * 45));
          } else {
            checkInTime = addMinutes(baseIn, -15 + Math.floor(Math.random() * 30));
          }

          const shiftOutTime = empShift?.checkOutTime || '17:00';
          const [oh, om] = shiftOutTime.split(':').map(Number);
          const baseOut = startOfDay(currentDate);
          baseOut.setHours(oh, om, 0);
          const checkOutTime = addMinutes(baseOut, -5 + Math.floor(Math.random() * 60));

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

      logStatus('Seeding selesai!');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error(err);
      logStatus('Gagal seeding.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Seeding Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-(--accent-info)">
            <Zap size={20} />
            <h4 className="text-sm font-black text-(--text-primary) uppercase tracking-tighter">Generator Data Simulasi</h4>
          </div>
          <p className="text-xs text-(--text-secondary) leading-relaxed opacity-70">
            Isi database dengan riwayat absensi otomatis selama 30 hari terakhir untuk melihat visualisasi dashboard yang lengkap.
          </p>
          <button
            onClick={seedAttendance}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-(--accent-info)/10 text-(--accent-info) border border-(--accent-info)/20 font-black text-[10px] uppercase tracking-widest hover:bg-(--accent-info) hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
            Hasilkan Riwayat 30 Hari
          </button>
        </div>

        {/* Cleanup Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-red-500">
            <Trash2 size={20} />
            <h4 className="text-sm font-black text-(--text-primary) uppercase tracking-tighter">Pembersihan Database</h4>
          </div>
          <p className="text-xs text-(--text-secondary) leading-relaxed opacity-70">
            Bersihkan semua riwayat absensi untuk memulai dari awal. Data yang dihapus tidak dapat dikembalikan.
          </p>
          <button
            onClick={clearAttendance}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Hapus Semua Riwayat
          </button>
        </div>
      </div>

      {/* Progress / Status Bar */}
      {(loading || status) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-white/5 border border-(--border-primary) space-y-4"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <History size={14} className="text-(--text-muted)" />
              <span className="text-[10px] font-black text-(--text-primary) uppercase tracking-widest">{status}</span>
            </div>
            {loading && <span className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">{progress}%</span>}
          </div>
          
          {loading && (
            <div className="w-full h-1.5 bg-(--bg-main) rounded-full overflow-hidden border border-(--border-color)">
              <motion.div 
                className="h-full bg-(--accent-info)" 
                animate={{ width: `${progress}%` }} 
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Warning Info */}
      <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
        <AlertTriangle className="text-amber-500 shrink-0" size={20} />
        <div className="space-y-1">
          <p className="text-xs font-black text-amber-500 uppercase tracking-tight">Perhatian</p>
          <p className="text-[11px] text-amber-600/70 font-medium leading-relaxed">
            Fitur ini sebaiknya hanya digunakan untuk keperluan pengujian atau demonstrasi. Seeding data akan memakan waktu tergantung jumlah karyawan yang terdaftar.
          </p>
        </div>
      </div>
    </div>
  );
}
