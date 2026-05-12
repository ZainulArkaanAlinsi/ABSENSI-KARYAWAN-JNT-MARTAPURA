'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 560 }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="relative w-full overflow-hidden rounded-3xl shadow-2xl"
            style={{ maxWidth, background: 'var(--surface-card)', border: '1px solid var(--border-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />

            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90
                             text-slate-400 dark:text-slate-500
                             hover:text-rose-500 hover:bg-rose-500/10"
                  style={{ background: 'var(--surface-hover)' }}
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}