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
      className="sidebar-stable flex flex-col border-r shadow-2xl fixed inset-y-0 left-0 h-screen z-50 overflow-hidden"
      style={{ 
        width: 'var(--sidebar-width)',
        background: 'var(--bg-sidebar)',
        borderColor: 'var(--border-primary)'
      }}
    >
      {/* Decorative Blur BG */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-10 w-32 h-32 bg-pink-400 rounded-full blur-3xl" />
      </div>

      <div 
        className="shrink-0 relative z-10 flex items-center px-6"
        style={{ 
          height: 'var(--header-height)', 
          background: 'var(--bg-sidebar)',
          boxShadow: '0 4px 20px -5px rgba(0,0,0,0.2)'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ 
              background: 'var(--jne-red)', 
              boxShadow: '0 4px 0 #b31217, 0 6px 15px rgba(227,30,36,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
              marginBottom: '4px'
            }}
          >
            <Image src="/logo-jne.svg" alt="JNE" width={32} height={32} className="object-contain" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5)) brightness(0) invert(1)' }} />
          </div>
          <span className="text-white font-black italic tracking-tighter text-2xl uppercase" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>ATTENDANCE</span>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav ref={navRef} className="flex-1 px-4 py-6 space-y-1 overflow-y-auto relative z-10 custom-scrollbar scrollbar-none">
        {navItems.map((item: any, idx: number) => {
          if (item.isHeader) {
            return (
              <p
                key={`header-${idx}`}
                className="mb-3 mt-6 px-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/50 first:mt-0"
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
              className="block mb-2"
            >
              <motion.div
                whileHover={{ y: active ? 0 : -2, backgroundColor: active ? undefined : 'var(--bg-input)' }}
                whileTap={{ y: 2, boxShadow: active ? '0 0px 0 #b31217, 0 2px 4px rgba(227,30,36,0.3)' : 'inset 0 3px 5px rgba(0,0,0,0.1)' }}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group nav-item-animate`}
                style={{
                  background: active ? 'var(--jne-red)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  boxShadow: active ? '0 4px 0 #b31217, 0 6px 15px rgba(227,30,36,0.3), inset 0 2px 0 rgba(255,255,255,0.2)' : 'none',
                  marginBottom: active ? '4px' : '0'
                }}
              >
                <div className={`shrink-0 transition-all ${active ? 'text-white' : 'opacity-70 group-hover:opacity-100'}`}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} style={{ filter: active ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' : 'none' }} />
                </div>
                <span className="text-[14px] font-bold tracking-wide truncate" style={{ textShadow: active ? '0 2px 2px rgba(0,0,0,0.2)' : 'none' }}>{item.label}</span>
                {active && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white shrink-0" 
                    style={{ boxShadow: '0 0 10px rgba(255,255,255,1), 0 2px 2px rgba(0,0,0,0.5)' }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Nav */}
      <div className="px-4 py-6 border-t relative z-10" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <motion.button
          onClick={signOut}
          whileHover={{ y: -2 }}
          whileTap={{ y: 2, boxShadow: 'inset 0 3px 5px rgba(0,0,0,0.2)' }}
          className="flex w-full items-center gap-4 px-4 py-3.5 rounded-2xl text-white/70 hover:text-white transition-all group"
          style={{ 
            background: 'rgba(255,255,255,0.05)',
            boxShadow: '0 4px 0 rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.1)',
            marginBottom: '4px'
          }}
        >
          <LogOut size={20} className="shrink-0" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }} />
          <span className="text-[14px] font-black tracking-widest uppercase">Sign Out</span>
        </motion.button>
      </div>
    </aside>
  );
}
