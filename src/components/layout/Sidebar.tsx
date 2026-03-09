'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogOut, Activity, LayoutDashboard } from 'lucide-react';
const logo = '/logo-jne.svg';
import { useSidebarLogic } from '@/hooks/useSidebarLogic';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import * as animePkg from 'animejs';
const safeAnimate = (animePkg as any).animate || (animePkg as any).default || animePkg;

export default function Sidebar() {
  const { signOut, isActive, navItems, pathname } = useSidebarLogic();
  const navRef = useRef<HTMLElement>(null);

  // Staggered Entry Animation for Nav Items
  useEffect(() => {
    if (navRef.current) {
      const items = navRef.current.querySelectorAll('.nav-item-animate');
      safeAnimate(items, {
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 800,
        delay: (el: any, i: number) => i * 100,
        easing: 'easeOutExpo'
      });
    }
  }, []);

  return (
    <aside
      className="sidebar-stable flex flex-col bg-(--lector-sidebar-brand) border-r border-(--lector-border) shadow-2xl relative z-50 overflow-hidden"
    >
      {/* Decorative Blur BG */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-10 w-32 h-32 bg-pink-400 rounded-full blur-3xl" />
      </div>

      {/* Brand Header (JNE Style) */}
      <div className="lector-sidebar-header shrink-0 shadow-lg relative z-10 bg-[#E31E24]!">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-white/20 shadow-sm">
            <Image src="/logo-jne.svg" alt="JNE" width={32} height={32} className="object-contain" />
          </div>
          <span className="text-white font-black italic tracking-tighter text-xl uppercase">EXPRESS</span>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav ref={navRef} className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto relative z-10 custom-scrollbar scrollbar-none">
        {navItems.map((item: any, idx: number) => {
          if (item.isHeader) {
            return (
              <p
                key={`header-${idx}`}
                className="mb-2 mt-6 px-4 text-[9px] font-black uppercase tracking-[0.25em] text-white/40 first:mt-0"
              >
                {item.label}
              </p>
            );
          }

          const active = isActive(item.href);
          const Icon = item.icon || LayoutDashboard;
          
          return (
            <Link
              key={`${item.href}-${idx}`}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-300 group nav-item-animate ${
                active 
                  ? 'bg-white/10 text-white shadow-md border border-white/10 font-black' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`${active ? 'text-white' : 'opacity-70 group-hover:opacity-100'}`}>
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
              {active && (
                <motion.div 
                  layoutId="active-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Nav */}
      <div className="px-4 py-6 border-t border-white/10 relative z-10">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all group"
        >
          <LogOut size={18} className="opacity-70 group-hover:opacity-100" />
          <span className="text-[13px] font-bold tracking-tight">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
