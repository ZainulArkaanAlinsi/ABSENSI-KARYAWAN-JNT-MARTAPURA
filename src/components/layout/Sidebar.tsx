'use client';

import Link from 'next/link';
import { LogOut, Shield, Zap } from 'lucide-react';
import { useSidebarLogic } from '@/hooks/useSidebarLogic';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const { signOut, isActive, navItems } = useSidebarLogic();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col z-50 transition-all duration-700 border-r border-white/5"
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-sidebar)',
        backdropFilter: 'blur(32px)',
      }}
    >
      {/* Decorative Accent */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-linear-to-b from-jne-red/10 to-transparent blur-[80px] pointer-events-none opacity-50" />

      {/* Brand Identity Node */}
      <div className="flex items-center justify-center py-10 relative">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="flex items-center justify-center rounded-[1.25rem] cursor-pointer relative group overflow-hidden shadow-2xl shadow-jne-red/20"
          style={{ 
            width: 48, 
            height: 48, 
            background: 'linear-gradient(135deg, #ff3366 0%, #ff1a53 100%)',
          }}
        >
          <Shield size={24} color="white" strokeWidth={2.5} className="drop-shadow-md" />
          <div className="absolute inset-0 bg-white/10 group-hover:opacity-0 transition-opacity" />
        </motion.div>
      </div>

      {/* Navigation Matrix */}
      <nav className="flex-1 px-3 space-y-2 pt-4">
        {navItems.map(({ href, label, icon: Icon }: any) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className="relative block group outline-none">
              <motion.div
                className={`relative flex flex-col items-center justify-center gap-2 py-4 rounded-2xl transition-all duration-500 ${
                  active 
                    ? 'text-white bg-white/8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                    : 'text-(--text-dim) hover:text-white hover:bg-white/4'
                }`}
              >
                <div className="relative">
                   <Icon 
                    size={22} 
                    strokeWidth={active ? 2.5 : 2} 
                    className={`transition-all duration-500 ${active ? 'text-jne-red drop-shadow-[0_0_8px_rgba(255,51,102,0.5)]' : 'group-hover:scale-110 group-hover:text-white'}`}
                  />
                  {active && (
                    <motion.div 
                      layoutId="sidebar-glow"
                      className="absolute inset-x-0 -bottom-1 h-3 bg-jne-red/20 blur-md rounded-full"
                    />
                  )}
                </div>
                
                <span className={`text-[9px] font-black uppercase tracking-tighter transition-all duration-500 text-center leading-none ${active ? 'opacity-100 scale-100' : 'opacity-40 group-hover:opacity-100 scale-95 group-hover:scale-100'}`}>
                  {label}
                </span>
                
                {active && (
                   <motion.div
                     layoutId="sidebar-active-indicator"
                     className="absolute left-0 w-1 h-7 bg-jne-red rounded-full shadow-[0_0_10px_rgba(255,51,102,0.8)]"
                     transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                   />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* System Termination Node */}
      <div className="p-4 pb-10 flex flex-col items-center">
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,51,102,0.1)' }}
          whileTap={{ scale: 0.9 }}
          onClick={signOut}
          className="p-4 rounded-2xl text-(--text-dim) hover:text-jne-red transition-all group relative bg-white/3 border border-white/5 shadow-lg"
          title="Sign Out"
        >
          <LogOut size={22} />
        </motion.button>
      </div>
    </aside>
  );
}


