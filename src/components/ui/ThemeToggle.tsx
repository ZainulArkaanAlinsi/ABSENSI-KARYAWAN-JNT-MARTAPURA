'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-11 h-11 rounded-xl flex items-center justify-center transition-all bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 group relative overflow-hidden"
      aria-label="Toggle Theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.3, ease: 'backOut' }}
          className="text-(--sidebar-text)/60 group-hover:text-(--sidebar-text)"
        >
          {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
        </motion.div>
      </AnimatePresence>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-(--accent-primary)/0 group-hover:bg-(--accent-primary)/5 transition-colors" />
    </button>
  );
}
