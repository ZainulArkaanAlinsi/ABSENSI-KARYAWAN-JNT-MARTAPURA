'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
const logo = '/logo-jne.svg';
import { useSidebarLogic } from '@/hooks/useSidebarLogic';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

export default function Sidebar() {
  const { signOut, isActive, navItems } = useSidebarLogic();
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  // Staggered Entry Animation for Nav Items
  useEffect(() => {
    if (navRef.current) {
      const items = navRef.current.querySelectorAll('.nav-item-animate');
      animate(items, {
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 800,
        delay: (el, i) => i * 100, // Manual stagger for v4 or checking utils
        easing: 'easeOutExpo'
      });
    }
  }, []);

  // Magnetic/Floated Logo Animation
  useEffect(() => {
    if (logoRef.current) {
      animate(logoRef.current, {
        translateY: [-2, 2],
        duration: 2000,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine'
      });
    }
  }, []);

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-50 flex flex-col border-r transition-all duration-700 backdrop-blur-3xl"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--glass-bg, rgba(255, 255, 255, 0.8))',
        borderColor: 'var(--glass-border, rgba(0, 0, 0, 0.05))',
      }}
    >
      {/* Brand node */}
      <div className="flex items-center gap-3 px-6 py-10">
        <motion.div
          ref={logoRef}
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="flex shrink-0 items-center justify-center rounded-2xl bg-white shadow-xl shadow-red-500/10"
          style={{
            width: 48,
            height: 48,
            padding: '6px',
            border: '1px solid rgba(255,255,255,0.8)'
          }}
        >
          <Image 
            src={logo} 
            alt="JNE Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </motion.div>
        <div>
          <p className="text-[15px] font-black uppercase tracking-tighter text-gray-900 leading-none">
            JNE <span className="text-red-600">Admin</span>
          </p>
          <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">
            Smart Logistics
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 space-y-1.5 overflow-y-auto px-4 pb-6 scrollbar-none">
        {navItems.map((item: any, idx: number) => {
          if (item.isHeader) {
            return (
              <p
                key={`header-${idx}`}
                className="mb-3 mt-8 px-4 text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 opacity-60 first:mt-0"
              >
                {item.label}
              </p>
            );
          }

          const { href, label, icon: Icon } = item;
          const active = isActive(href);
          return (
            <Link 
              key={href} 
              href={href} 
              className="block outline-none nav-item-animate opacity-0"
            >
              <motion.div
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`relative flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-500 ${
                  active ? 'text-red-600 shadow-lg shadow-red-500/5' : 'text-gray-500 hover:text-gray-900'
                }`}
                style={
                  active
                    ? {
                        background: 'rgba(255, 245, 245, 0.6)',
                        border: '1px solid rgba(227, 30, 36, 0.08)',
                      }
                    : {
                        background: 'transparent',
                        border: '1px solid transparent',
                      }
                }
              >
                {/* Active marker (Dynamic Glow) */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-marker"
                      className="absolute left-0 w-1.5 rounded-r-full bg-red-600 shadow-[2px_0_12px_rgba(220,38,38,0.4)]"
                      style={{ height: 28 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon wrapper */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${
                    active 
                      ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' 
                      : 'bg-white/40 text-gray-400 group-hover:bg-white group-hover:shadow-sm border border-transparent'
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>

                {/* Label */}
                <span
                  className="truncate text-[13px] font-black uppercase tracking-tight"
                >
                  {label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Sign-out */}
      <div className="px-4 border-t border-gray-100/50 py-8">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={signOut}
          className="group flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 transition-all group-hover:bg-red-100 group-hover:text-red-600">
            <LogOut size={16} />
          </div>
          <span className="text-[13px] font-black uppercase tracking-tight">Keluar Portal</span>
        </motion.button>
        <p className="mt-6 px-3 text-[8px] font-black text-gray-300 uppercase tracking-[0.4em] text-center opacity-50">
          © 2026 JNE MARTAPURA
        </p>
      </div>
    </aside>
  );
}
