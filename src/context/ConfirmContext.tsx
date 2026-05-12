'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    setIsOpen(false);
    if (resolver) resolver(result);
  }, [resolver]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {isOpen && options && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleClose(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[360px] bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border border-white/40"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                    options.variant === 'danger' ? 'bg-red-50 text-red-500 shadow-red-100' : 
                    options.variant === 'warning' ? 'bg-amber-50 text-amber-500 shadow-amber-100' : 
                    'bg-indigo-50 text-indigo-500 shadow-indigo-100'
                  }`}>
                    <AlertCircle size={24} strokeWidth={2.5} />
                  </div>
                  <button 
                    onClick={() => handleClose(false)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <h3 className="text-[20px] font-black text-slate-900 leading-tight mb-3 tracking-tight">
                  {options.title || 'Konfirmasi Tindakan'}
                </h3>
                <p className="text-[14px] font-medium text-slate-500 leading-relaxed opacity-80">
                  {options.message}
                </p>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 h-12 rounded-2xl text-[13px] font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
                >
                  {options.cancelLabel || 'Batalkan'}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className={`flex-1 h-12 rounded-2xl text-[13px] font-black text-white shadow-xl transition-all active:scale-95 ${
                    options.variant === 'danger' 
                      ? 'bg-linear-to-br from-red-500 to-rose-600 shadow-red-200' 
                      : 'bg-linear-to-br from-slate-800 to-slate-950 shadow-slate-200'
                  }`}
                >
                  {options.confirmLabel || 'Lanjutkan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
};
