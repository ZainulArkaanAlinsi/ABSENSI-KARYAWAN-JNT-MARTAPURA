'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";

export default function Template({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Artificial delay of 2 seconds as requested
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-(--bg-main)"
          >
            <div className="relative">
              {/* Outer Pulse */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-jne-red/20 blur-2xl rounded-full"
              />
              
              {/* Spinning Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-2 border-jne-red/10 border-t-jne-red rounded-full relative z-10"
              />

              {/* Center Logo/Icon */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <Shield size={32} className="text-jne-red animate-pulse" />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col items-center gap-2"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-(--text-dim) opacity-60">
                Initializing Matrix
              </span>
              <div className="flex gap-1.5 mt-2">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      backgroundColor: ['var(--text-dim)', 'var(--jne-red)', 'var(--text-dim)']
                    }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                    className="w-1.5 h-1.5 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
