'use client';

import { useState, useEffect } from 'react';
import { getEmployees } from '@/lib/firestore';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Search, ScanFace, CheckCircle2, XCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FaceEnrollmentPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Failed to load employees for biometrics', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      (emp.department && emp.department.toLowerCase().includes(search.toLowerCase())),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <PageLoader />
        <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.3em] ml-3">
          Loading biometric data...
        </p>
      </div>
    );
  }

  const enrolledCount = employees.filter((e) => e.faceData).length;
  const pendingCount = employees.length - enrolledCount;

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight leading-none">
          Face <span className="text-primary font-normal">Enrollment</span>
        </h1>
        <p className="text-[11px] font-medium text-text-tertiary mt-1">
          Biometric identity management for {employees.length} personnel
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-primary/5 border border-border-primary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <UserCheck size={18} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Total Personnel</p>
              <h3 className="text-2xl font-bold text-text-primary">{employees.length}</h3>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-primary/5 border border-border-primary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Enrolled</p>
              <h3 className="text-2xl font-bold text-success">{enrolledCount}</h3>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-primary/5 border border-border-primary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-mustard/10 flex items-center justify-center text-mustard">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Pending</p>
              <h3 className="text-2xl font-bold text-mustard">{pendingCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search by name or division..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 bg-primary/5 border border-border-primary rounded-lg pl-10 pr-4 text-sm font-medium text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
        />
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredEmployees.map((emp, idx) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-primary border border-border-primary rounded-xl p-5 shadow-xs hover:shadow-md transition-all group relative overflow-hidden"
            >
              {emp.faceData ? (
                <div className="absolute top-3 right-3 text-success">
                  <CheckCircle2 size={16} />
                </div>
              ) : (
                <div className="absolute top-3 right-3 text-mustard">
                  <AlertTriangle size={16} />
                </div>
              )}

              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4 border border-border-primary overflow-hidden relative">
                {emp.photoUrl ? (
                  <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-text-tertiary">{emp.name.charAt(0)}</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <h4 className="text-sm font-bold text-text-primary mb-1 truncate">{emp.name}</h4>
              <span className="px-2 py-0.5 bg-secondary rounded text-[8px] font-bold text-text-tertiary uppercase tracking-wider border border-border-primary/50">
                {emp.department || 'Staff'}
              </span>

              <button
                onClick={() =>
                  alert(
                    'Face enrollment requires the JNE Attendance Mobile App for biometric verification.',
                  )
                }
                className={`w-full mt-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  emp.faceData
                    ? 'bg-secondary border border-border-primary text-text-secondary hover:bg-white/5'
                    : 'bg-primary text-white border border-primary hover:bg-primary/90 shadow-sm'
                }`}
              >
                <ScanFace size={13} />
                {emp.faceData ? 'View Data' : 'Enroll Face'}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}