'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  /** Debounce in ms — defaults to 200ms so giant lists don't re-filter on every keystroke. */
  debounceMs?: number;
  /** Width preset. Use 'full' inside a flex parent. */
  className?: string;
}

/**
 * Standard search input with:
 *   • Lucide Search prefix icon.
 *   • Lazy clear (X) button.
 *   • Built-in debounce so the parent only re-filters once typing settles.
 *
 * Use the same component everywhere for consistent look + behavior.
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Cari...',
  debounceMs = 200,
  className = '',
}: SearchBarProps) {
  // Local state mirrors the input so typing feels instant; we push the
  // committed value upward only after debounceMs of quiet.
  const [draft, setDraft] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync inward when the parent resets externally (e.g. clear-all-filters).
  useEffect(() => { setDraft(value); }, [value]);

  // Push outward with debounce.
  useEffect(() => {
    if (draft === value) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(draft), debounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // onChange / value are stable refs from the parent's useState — exclude
    // them so we don't re-debounce on every parent rerender.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, debounceMs]);

  return (
    <div className={`relative ${className || 'flex-1 w-full'}`}>
      <Search
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 focus:bg-white transition-all"
      />
      <AnimatePresence>
        {draft && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={() => { setDraft(''); onChange(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Kosongkan pencarian"
          >
            <X size={13} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
