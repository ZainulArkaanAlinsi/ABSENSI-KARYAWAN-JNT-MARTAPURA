'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Banknote, 
  Search, 
  Download,
  Filter,
  Edit3,
  TrendingUp,
  Wallet,
  CalendarDays,
  X,
  Save,
  Zap,
  Settings2,
  Clock,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firestore';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// Configurable Rules
const DEFAULT_RULES = {
  baseSalary: 4200000,
  lateFinePerIncident: 25000,
  alphaFinePerDay: 150000,
  perfectAttendanceBonus: 500000
};

export default function SalaryPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [showRules, setShowRules] = useState(false);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  // FETCH REAL DATA
  useEffect(() => {
    setLoading(true);
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

    // Listen to Employees
    const qEmp = query(collection(db, COLLECTIONS.USERS), where('role', '==', 'employee'));
    const unsubEmp = onSnapshot(qEmp, (snap) => {
      setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Listen to Attendance for this month
    const qAtt = query(
      collection(db, COLLECTIONS.ATTENDANCE), 
      where('date', '>=', monthStart),
      where('date', '<=', monthEnd)
    );
    const unsubAtt = onSnapshot(qAtt, (snap) => {
      setAttendance(snap.docs.map(d => d.data()));
      setLoading(false);
    });

    return () => {
      unsubEmp();
      unsubAtt();
    };
  }, []);

  // CALCULATE REAL PAYROLL DATA
  const payrollData = useMemo(() => {
    return employees.map(emp => {
      const empAttendance = attendance.filter(a => a.userId === emp.id || a.userId === emp.uid);
      const lateCount = empAttendance.filter(a => a.status === 'late').length;
      const alphaCount = empAttendance.filter(a => a.status === 'absent').length; // Logic might vary based on your system
      
      const lateFine = lateCount * DEFAULT_RULES.lateFinePerIncident;
      const alphaFine = alphaCount * DEFAULT_RULES.alphaFinePerDay;
      const isPerfect = lateCount === 0 && alphaCount === 0 && empAttendance.length > 20; // Example condition
      const bonus = isPerfect ? DEFAULT_RULES.perfectAttendanceBonus : 0;
      
      const netSalary = DEFAULT_RULES.baseSalary + bonus - (lateFine + alphaFine);
      
      return {
        ...emp,
        lateCount,
        alphaCount,
        lateFine,
        alphaFine,
        bonus,
        netSalary,
        status: 'Calculated'
      };
    });
  }, [employees, attendance]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="text-rose-600 animate-spin" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Calculating Live Payroll...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter italic">
            Smart <span className="text-rose-600">Payroll</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] mt-2 ml-1">Kalkulasi Otomatis Berbasis Data Absensi Real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowRules(!showRules)}
            className="h-11 px-6 bg-white dark:bg-slate-800 border border-(--border-color) rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm"
          >
             <Settings2 size={16} /> Config Rules
          </button>
          <button className="h-11 px-6 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg shadow-rose-600/20">
             <Zap size={16} /> Finalize All
          </button>
        </div>
      </div>

      {/* ── RULES CONFIG (Collapsible) ── */}
      <AnimatePresence>
        {showRules && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bento-card p-8! bg-slate-950 text-white border-none mb-8">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                 <Settings2 size={14} /> Global Salary Multipliers
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                    { label: 'Base Salary', val: formatIDR(DEFAULT_RULES.baseSalary) },
                    { label: 'Denda Telat /x', val: formatIDR(DEFAULT_RULES.lateFinePerIncident), color: 'text-rose-500' },
                    { label: 'Denda Alpha /hari', val: formatIDR(DEFAULT_RULES.alphaFinePerDay), color: 'text-rose-500' },
                    { label: 'Bonus Disiplin', val: formatIDR(DEFAULT_RULES.perfectAttendanceBonus), color: 'text-emerald-500' },
                  ].map((rule, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">{rule.label}</p>
                      <p className={`text-lg font-black italic ${rule.color || 'text-white'}`}>{rule.val}</p>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN PAYROLL TABLE ── */}
      <div className="bento-card p-0! overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-(--border-color) flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
           <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Filter courier..." className="w-full bg-(--bg-main) border border-(--border-color) rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold text-(--text-primary) outline-none" />
           </div>
           <div className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">Period: {format(new Date(), 'MMMM yyyy')}</div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-(--bg-main)/30">
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Real Employee Info</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Attendance Summary</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Base & Bonus</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Penalty</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Net Payout</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color)">
              {payrollData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No personnel data found in Firestore.</p>
                  </td>
                </tr>
              ) : payrollData.map((p) => (
                <tr key={p.id} className="group hover:bg-(--bg-main)/50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-white text-[10px] font-black italic shadow-md">
                         {p.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-xs font-black text-(--text-primary) uppercase tracking-tight">{p.name}</p>
                        <p className="text-[8px] font-bold text-(--text-secondary) uppercase tracking-widest">{p.employeeId || 'NO-ID'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <div className="flex justify-end gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${p.lateCount > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                           {p.lateCount} Late
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${p.alphaCount > 0 ? 'bg-rose-600/10 text-rose-600' : 'bg-slate-500/10 text-slate-500'}`}>
                           {p.alphaCount} Alpha
                        </span>
                     </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <p className="text-[10px] font-bold text-(--text-primary)">{formatIDR(DEFAULT_RULES.baseSalary)}</p>
                     {p.bonus > 0 && <p className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">+Bonus Disiplin</p>}
                  </td>
                  <td className="px-8 py-5 text-right">
                     <p className="text-[10px] font-bold text-rose-600">-{formatIDR(p.lateFine + p.alphaFine)}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <p className="text-sm font-black text-slate-950 dark:text-white italic tracking-tighter">{formatIDR(p.netSalary)}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => setEditingEntry(p)}
                        className="w-10 h-10 bg-white dark:bg-slate-800 border border-(--border-color) rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all shadow-sm active:scale-95"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── INTERVENTION MODAL ── */}
      <AnimatePresence>
        {editingEntry && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingEntry(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl bg-(--bg-card) rounded-[32px] shadow-2xl border border-(--border-color) overflow-hidden">
              <div className="p-8 bg-slate-950 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Intervention Console</h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">Adjusting: {editingEntry.name}</p>
                </div>
                <button onClick={() => setEditingEntry(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
              </div>

              <div className="p-10 space-y-8">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Admin can override attendance stats for accurate calculation</p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Late Count (Auto-Fetched)</label>
                       <input type="number" value={editingEntry.lateCount} disabled className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-4 px-4 text-sm font-black text-slate-400 outline-none cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Manual Adjustment</label>
                       <input 
                         type="number" 
                         value={editingEntry.manualAdj || 0}
                         onChange={(e) => setEditingEntry({...editingEntry, manualAdj: parseInt(e.target.value) || 0})}
                         className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-4 px-4 text-sm font-black text-rose-600 outline-none"
                       />
                    </div>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-4xl border border-(--border-color)">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-black text-(--text-primary) uppercase tracking-widest">Recalculated Net</p>
                      <h2 className="text-3xl font-black text-rose-600 italic tracking-tighter">{formatIDR(editingEntry.netSalary + (editingEntry.manualAdj || 0))}</h2>
                    </div>
                 </div>
                 <button className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-rose-600/20">Finalize & Lock Payment</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
