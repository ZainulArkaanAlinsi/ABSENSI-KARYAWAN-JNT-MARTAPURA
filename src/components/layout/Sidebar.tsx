'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import logo from '../../../assets/logo-jne.png';
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
      className="fixed left-0 top-0 bottom-0 z-50 flex flex-col border-r border-white/5 transition-all duration-700"
      style={{
        width: 'var(--sidebar-width)',
        background: 'rgba(8, 6, 22, 0.95)',
        backdropFilter: 'blur(32px)',
      }}
    >
      {/* Ambient top glow */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-72 w-full bg-primary/5"
      />

      {/* Brand node */}
      <div className="flex items-center gap-3 px-4 py-7">
        <div
          ref={logoRef}
          className="flex shrink-0 items-center justify-center rounded-xl bg-white shadow-lg shadow-black/5"
          style={{
            width: 42,
            height: 42,
            padding: '4px',
          }}
        >
          <Image 
            src={logo} 
            alt="JNE Logo" 
            className="object-contain"
          />
        </div>
        <div>
          <p className="text-[13px] font-black uppercase tracking-tight text-white leading-none">
            JNE Admin
          </p>
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
            Attendance System
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3 h-px bg-white/6" />

      {/* Section label */}
      <p className="mb-2 px-5 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
        Navigasi
      </p>

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {navItems.map((item: any, idx: number) => {
          if (item.isHeader) {
            return (
              <p
                key={`header-${idx}`}
                className="mb-2 mt-6 px-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 first:mt-0"
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
              onMouseEnter={(e) => {
                if (!active) {
                  animate(e.currentTarget, {
                    translateX: 4,
                    duration: 300,
                    easing: 'easeOutQuad'
                  });
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  animate(e.currentTarget, {
                    translateX: 0,
                    duration: 300,
                    easing: 'easeOutQuad'
                  });
                }
              }}
            >
              <div
                className={`relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 transition-all duration-300 ${
                  active ? 'text-white' : 'text-white/40 hover:text-white/80'
                }`}
                style={
                  active
                    ? {
                        background: 'rgba(227, 30, 36, 0.08)', // Using JNE Red
                        border: '0.5px solid rgba(227, 30, 36, 0.2)',
                        boxShadow: '0 4px 15px -2px rgba(227, 30, 36, 0.1)',
                      }
                    : {
                        background: 'transparent',
                        border: '0.5px solid transparent',
                      }
                }
              >
                {/* Active left accent pill */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="sidebar-pill"
                      className="absolute left-0 w-0.5 rounded-full"
                      style={{
                        height: 20,
                        background: '#E31E24', // JNE Red
                        boxShadow: '0 0 12px rgba(227, 30, 36, 0.5)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                </AnimatePresence>


                {/* Icon */}
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all"
                  style={
                    active
                      ? { background: 'rgba(124, 58, 237, 0.2)', color: 'var(--att-present)' }
                      : { background: 'rgba(255,255,255,0.04)', color: 'inherit' }
                  }
                >
                  <Icon
                    size={16}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>

                {/* Label */}
                <span
                  className="truncate text-[12px] font-semibold leading-none"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 mb-3 h-px bg-white/6" />

      {/* Sign-out */}
      <div className="px-3 pb-6">
        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
          onClick={signOut}
          className="group flex w-full items-center gap-3.5 rounded-xl border border-transparent px-3.5 py-2.5 text-white/30 transition-all hover:border-red-500/20 hover:bg-red-500/8 hover:text-red-400"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/4 transition-all group-hover:bg-red-500/15">
            <LogOut size={15} />
          </div>
          <span className="text-[12px] font-semibold">Keluar</span>
        </motion.button>
      </div>
    </aside>
  );
}
