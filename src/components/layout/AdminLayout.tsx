'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { LanguageProvider } from '@/lib/i18n';

const COLLAPSED_W = 72;
const EXPANDED_W = 260;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <LanguageProvider>
      <div
        className="w-full min-h-screen overflow-x-hidden transition-colors duration-300"
        style={{ background: 'var(--travigo-page)' }}
      >
        <div className="w-full max-w-[1600px] mx-auto flex min-h-screen relative">
          {/* ── DESKTOP SIDEBAR (collapsible) ── */}
          <motion.div
            animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className="hidden lg:block shrink-0 h-screen sticky top-0 overflow-hidden transition-colors duration-300"
            style={{
              borderRight: '1px solid var(--border-default)',
              background: 'var(--surface-sidebar)',
            }}
          >
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
          </motion.div>

          {/* ── MOBILE DRAWER BACKDROP ── */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              />
            )}
          </AnimatePresence>

          {/* ── MOBILE DRAWER ── */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                key="drawer"
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 z-50 shadow-2xl transition-colors duration-300"
                style={{ width: EXPANDED_W, background: 'var(--surface-sidebar)' }}
              >
                <Sidebar onClose={() => setMobileOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── CONTENT AREA ── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* ── HEADER ── */}
            <div
              className="w-full h-[68px] shrink-0 sticky top-0 z-30 transition-colors duration-300"
              style={{
                background: 'var(--surface-header)',
                borderBottom: '1px solid var(--border-default)',
                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
              }}
            >
              <Header onMenuClick={() => setMobileOpen(true)} />
            </div>

            {/* ── PAGE CONTENT ── */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
              <motion.div
                key="page-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="p-5 lg:p-7 w-full"
              >
                {children}
              </motion.div>
            </main>
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
}
