'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border
                 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5
                 text-slate-500 dark:text-slate-400
                 hover:bg-amber-50 dark:hover:bg-amber-500/10
                 hover:border-amber-200 dark:hover:border-amber-500/20
                 hover:text-amber-500 dark:hover:text-amber-400"
      aria-label="Toggle Theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 10, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -10, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
