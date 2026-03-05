import {
  X,
  Plus,
  Edit2,
  Trash2,
  Zap,
  Loader2,
  Calendar,
  Layers,
  Palette,
  FileText,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { DEPARTMENT_COLORS } from '@/hooks/useDepartmentManagement';
import type { DepartmentItem } from '@/types';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  editingDepartment: DepartmentItem | null;
  form: Omit<DepartmentItem, 'id' | 'createdAt' | 'updatedAt'>;
  setForm: React.Dispatch<React.SetStateAction<Omit<DepartmentItem, 'id' | 'createdAt' | 'updatedAt'>>>;
  saving: boolean;
}

export default function DepartmentModal({
  isOpen,
  onClose,
  onSave,
  editingDepartment,
  form,
  setForm,
  saving,
}: DepartmentModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingDepartment ? 'Edit Unit / Departemen' : 'Tambah Unit Baru'}
      maxWidth={580}
    >
      <form onSubmit={onSave} className="space-y-6 pt-1">
        <div className="space-y-1.5">
          <label className="pg-form-label flex items-center gap-2">
            <Layers size={14} />
            Nama Unit / Departemen
          </label>
          <input
            className="pg-form-input bg-white/5 border-white/10 text-white"
            placeholder="Contoh: Rider Delivery, Admin Support"
            value={form.name}
            onChange={(e) =>
              setForm((p) => ({ ...p, name: e.target.value }))
            }
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="pg-form-label flex items-center gap-2">
            <FileText size={14} />
            Deskripsi (Opsional)
          </label>
          <textarea
            className="pg-form-input bg-white/5 border-white/10 text-white min-h-[100px] resize-none"
            placeholder="Jelaskan peran unit ini..."
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2.5">
          <label className="pg-form-label flex items-center gap-2">
            <Palette size={14} />
            Label Warna
          </label>
          <div className="flex flex-wrap gap-3">
            {DEPARTMENT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((p) => ({ ...p, color: c }))}
                className="relative h-9 w-9 rounded-xl transition-transform"
                style={{
                  background: c,
                  transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                  outline:
                    form.color === c ? `3px solid ${c}` : 'transparent',
                  outlineOffset: 3,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold hover:bg-white/10 transition-all text-sm"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 h-12 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            style={{ backgroundColor: '#E31E24' }}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {editingDepartment ? <Edit2 size={16} /> : <Plus size={16} />}
                {editingDepartment ? 'Perbarui Departemen' : 'Daftarkan Unit'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
