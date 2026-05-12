'use client';

import { motion } from 'framer-motion';
import { Edit2, Trash2, Users } from 'lucide-react';
import type { DepartmentItem } from '@/types';

interface DepartmentCardProps {
  department: DepartmentItem;
  onEdit: (dept: DepartmentItem) => void;
  onDelete: (id: string, name: string) => void;
  index: number;
}

export default function DepartmentCard({ department, onEdit, onDelete, index }: DepartmentCardProps) {
  const accent = department.color || '#10B981';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all relative overflow-hidden"
      style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: accent }} />

      <div className="flex items-start justify-between mb-4 mt-1">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[18px] font-black shadow-sm transition-transform group-hover:scale-105"
          style={{ backgroundColor: accent }}
        >
          {department.name.charAt(0)}
        </div>

        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(department)}
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center transition-all"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(department.id, department.name)}
            className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`w-1.5 h-1.5 rounded-full ${department.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {department.isActive ? 'Aktif' : 'Nonaktif'}
          </p>
        </div>
        <h3 className="text-[15px] font-black text-slate-800 tracking-tight">{department.name}</h3>
        <p className="mt-1.5 text-[12px] text-slate-400 leading-relaxed line-clamp-2">
          {department.description || 'Tidak ada deskripsi untuk unit ini.'}
        </p>
      </div>

      <div className="pt-3.5 border-t border-slate-100 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
          <Users size={12} className="text-slate-400" />
        </div>
        <p className="text-[11px] font-semibold text-slate-500">Kelola Tim</p>
      </div>
    </motion.div>
  );
}
