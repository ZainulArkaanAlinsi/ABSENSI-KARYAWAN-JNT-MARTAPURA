'use client';

import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SaveStatusBarProps {
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  disabled?: boolean;
}

export default function SaveStatusBar({ saving, saved, onSave, disabled }: SaveStatusBarProps) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid var(--pg-border)' }}>
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl"
            style={{
              background: 'rgba(16,185,129,0.1)',
              color: '#10B981',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            <CheckCircle2 size={15} /> Pengaturan berhasil disimpan
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSave}
        disabled={saving || disabled}
        className="pg-btn-primary flex items-center gap-2 ml-auto"
      >
        {saving ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Menyimpan...
          </>
        ) : (
          <>
            <Save size={15} /> Simpan Perubahan
          </>
        )}
      </motion.button>
    </div>
  );
}