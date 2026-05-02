'use client';

import { motion } from 'framer-motion';
import { Edit2, Trash2, Users, ChevronRight } from 'lucide-react';
import type { DepartmentItem } from '@/types';

interface DepartmentCardProps {
  department: DepartmentItem;
  onEdit: (dept: DepartmentItem) => void;
  onDelete: (id: string, name: string) => void;
  index: number;
}

export default function DepartmentCard({ department, onEdit, onDelete, index }: DepartmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-(--bg-card) rounded-4xl border border-(--border-primary) p-8 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-8">
        <div 
          className="h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3"
          style={{ backgroundColor: department.color || '#005596' }}
        >
          <span className="text-xl font-black italic">{department.name.charAt(0)}</span>
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(department)}
            className="h-10 w-10 rounded-xl bg-white/5 text-(--text-muted) hover:bg-(--text-primary) hover:text-(--bg-card) flex items-center justify-center transition-all shadow-sm"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(department.id, department.name)}
            className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
           <span className={`h-2 w-2 rounded-full ${department.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-(--text-dim)'}`} />
           <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest leading-none">
             {department.isActive ? 'Active Unit' : 'Inactive'}
           </p>
        </div>
        <h3 className="text-xl font-black text-(--text-primary) italic uppercase tracking-tight">{department.name}</h3>
        <p className="mt-3 text-(--text-secondary) text-xs font-medium leading-relaxed line-clamp-2">
          {department.description || 'Tidak ada deskripsi untuk unit ini.'}
        </p>
      </div>

      <div className="pt-6 border-t border-(--border-primary) flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-(--text-muted)">
            <Users size={14} />
          </div>
          <div>
            <p className="text-[9px] font-black text-(--text-muted) uppercase tracking-widest leading-none">Personel</p>
            <p className="text-xs font-bold text-(--text-primary) mt-0.5">Kelola Tim</p>
          </div>
        </div>
        
        <button className="h-8 w-8 rounded-lg bg-white/5 text-(--text-dim) flex items-center justify-center hover:bg-[#005596] hover:text-white transition-all">
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
