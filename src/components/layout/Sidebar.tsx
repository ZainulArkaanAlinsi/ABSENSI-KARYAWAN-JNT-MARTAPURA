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
      <div 
        className="shrink-0 relative z-10 flex items-center px-6"
        style={{ 
          height: '90px', 
          background: 'var(--bg-sidebar)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div className="flex items-center gap-3 pt-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ 
              background: 'var(--jne-red)', 
              boxShadow: '0 4px 12px rgba(204,0,0,0.3)'
            }}
          >
            <Image src="/logo-jne.svg" alt="JNE" width={22} height={22} className="object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          <span className="text-white font-black italic tracking-tighter text-xl uppercase leading-none">ATTENDANCE</span>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav ref={navRef} className="flex-1 px-4 py-6 space-y-1 overflow-y-auto relative z-10 custom-scrollbar scrollbar-none">
        {navItems.map((item: any, idx: number) => {
          if (item.isHeader) {
            return (
              <p
                key={`header-${idx}`}
                className="mb-3 mt-6 px-4 text-[10px] font-black uppercase tracking-wide text-white/40 first:mt-0"
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
              className="block mb-1.5"
            >
              <motion.div
                whileHover={{ x: active ? 0 : 4, backgroundColor: active ? undefined : 'rgba(255,255,255,0.03)' }}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group nav-item-animate`}
                style={{
                  background: active ? 'var(--jne-red)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                  boxShadow: active ? '0 8px 20px -5px rgba(204,0,0,0.4)' : 'none'
                }}
              >
                <div className={`shrink-0 transition-all ${active ? 'text-white' : 'group-hover:text-white'}`}>
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className="text-[13px] font-bold tracking-normal truncate">{item.label}</span>
                {active && (
                  <div className="ml-auto w-1 h-4 rounded-full bg-white/40 shrink-0" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Nav */}
      <div className="px-4 py-6 border-t relative z-10" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all group"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="text-[13px] font-bold tracking-normal">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
