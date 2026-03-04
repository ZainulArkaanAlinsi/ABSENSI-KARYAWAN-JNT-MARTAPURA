'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animate } from 'animejs';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 560 }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--removed-scroll-width, 0px)';
      
      // AnimeJS Pop Entry
      if (modalRef.current) {
        animate(modalRef.current, {
          scale: [0.9, 1],
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
          easing: 'easeOutElastic(1, .8)'
        });
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto px-4 py-8 md:py-20 backdrop-blur-sm transition-all duration-300"
          style={{ backgroundColor: 'rgba(10, 20, 30, 0.7)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div
            ref={modalRef}
            className="relative w-full glass-card rounded-2xl border border-white/10 shadow-2xl my-auto shrink-0 opacity-0"
            style={{
              maxWidth,
              boxShadow: 'var(--shadow-premium)',
            }}
          >
            {/* Header dengan garis aksen */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-primary" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-white uppercase tracking-tighter">{title}</h2>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-white"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Body */}
              <div className="custom-scrollbar">
                {children}
              </div>
            </div>

            {/* Dekorasi tambahan */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}