'use client';

import React, { useState } from 'react';
import {
  Database,
  Trash2,
  Zap,
  CheckCircle2,
  AlertTriangle,
  History,
  Loader2,
  RefreshCcw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  collection,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS, getEmployees, getJamKerjas } from '@/lib/firestore';
import { format, subDays, startOfDay, addMinutes, isWeekend } from 'date-fns';

export default function MaintenanceSettings() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const clearAttendance = async () => {
    if (!confirm('Delete ALL attendance history? This cannot be undone.')) return;

    setLoading(true);
    setStatus('Deleting attendance data...');

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

      setStatus(`Deleted ${deleted} records.`);
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setStatus('Delete failed. Please try again.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const seedAttendance = async () => {
    setLoading(true);
    setStatus('Preparing seed data...');

    try {
      const employees = await getEmployees();
      const shifts = await getJamKerjas();

      if (employees.length === 0) {
        setStatus('No employees found.');
        setLoading(false);
        return;
      }

      const totalDays = 30;
      const totalOperations = employees.length * totalDays;
      let completed = 0;

      setStatus(`Seeding for ${employees.length} employees...`);

      for (const emp of employees) {
        const batch = writeBatch(db);
        const empShift = shifts.find((s) => s.id === emp.jamKerjaId) || shifts[0];

        for (let i = 0; i < totalDays; i++) {
          const currentDate = subDays(new Date(), i);
          if (isWeekend(currentDate)) continue;

          const dateStr = format(currentDate, 'yyyy-MM-dd');

          const rand = Math.random();
          let status: 'present' | 'late' | 'absent' | 'leave' = 'present';
          if (rand > 0.95) status = 'absent';
          else if (rand > 0.9) status = 'leave';
          else if (rand > 0.7) status = 'late';

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
              location: 'JNE Martapura Office',
              photoUrl: emp.photoUrl || null,
            },
            checkOut: {
              time: format(checkOutTime, 'HH:mm'),
              location: 'JNE Martapura Office',
            },
            totalWorkMinutes: Math.floor(
              (checkOutTime.getTime() - checkInTime.getTime()) / 60000,
            ),
            lateMinutes:
              status === 'late'
                ? Math.floor((checkInTime.getTime() - baseIn.getTime()) / 60000)
                : 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        await batch.commit();
        completed += totalDays;
        setProgress(Math.min(100, Math.round((completed / totalOperations) * 100)));
      }

      setStatus('Seeding complete!');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setStatus('Seeding failed. Please try again.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Generate */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Database size={18} />
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-tight">Simulated Data Generator</h4>
          </div>
          <p className="text-[11px] font-medium text-text-tertiary leading-relaxed">
            Populate the database with 30 days of simulated attendance for visualization and testing.
          </p>
          <button
            onClick={seedAttendance}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 h-10 rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Zap size={15} />
            )}
            Generate 30-Day History
          </button>
        </div>

        {/* Cleanup */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-danger">
            <Trash2 size={18} />
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-tight">Data Cleanup</h4>
          </div>
          <p className="text-[11px] font-medium text-text-tertiary leading-relaxed">
            Remove all attendance records. This action is irreversible.
          </p>
          <button
            onClick={clearAttendance}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 h-10 rounded-lg bg-danger/10 text-danger border border-danger/20 font-bold text-[10px] uppercase tracking-widest hover:bg-danger hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            Delete All Records
          </button>
        </div>
      </div>

      {/* Progress */}
      {(loading || status) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-secondary border border-border-primary space-y-3"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <History size={13} className="text-text-tertiary" />
              <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">{status}</span>
            </div>
            {loading && <span className="text-[9px] font-medium text-text-tertiary">{progress}%</span>}
          </div>
          {loading && (
            <div className="w-full h-1 bg-secondary rounded-full overflow-hidden border border-border-primary/50">
              <motion.div
                className="h-full bg-primary transition-all duration-300"
                animate={{ width: `${progress}%` }}
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Warning */}
      <div className="p-4 rounded-xl bg-mustard/5 border border-mustard/10/50 flex items-start gap-3">
        <AlertTriangle className="text-mustard shrink-0" size={18} />
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-mustard uppercase tracking-tight">Notice</p>
          <p className="text-[10px] font-medium text-text-tertiary leading-relaxed">
            These tools are intended for testing and demonstration. Data generation time depends on the number of employees.
          </p>
        </div>
      </div>
    </div>
  );
}