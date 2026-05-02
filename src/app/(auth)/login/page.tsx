"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Activity,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoginLogic } from "@/hooks/useLoginLogic";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

// Direct asset paths from /public
const logoJne = '/logo-jne.svg';
const jneBg   = '/JNE-logo-orang-paket.svg';

// Pre-computed deterministic trail heights to avoid SSR hydration mismatch
const TRAIL_HEIGHTS = Array.from({ length: 6 }, (_, i) => 150 + (i * 17) % 100);

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    togglePassword,
    loading,
    isSuccess,
    error,
    handleSubmit,
  } = useLoginLogic();

  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="fixed inset-0 overflow-y-auto bg-slate-950 flex items-center justify-center p-4">
      
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(224,75,58,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-[20%] w-px h-full bg-linear-to-b from-transparent via-white/5 to-transparent opacity-20" />
        <div className="absolute top-0 left-[80%] w-px h-full bg-linear-to-b from-transparent via-white/5 to-transparent opacity-20" />
        
        {/* Light Trails */}
        {TRAIL_HEIGHTS.map((height, i) => (
          <div 
            key={i} 
            className="light-trail" 
            style={{ 
              left: `${15 + i * 15}%`, 
              animationDelay: `${i * 1.5}s`,
              height: `${height}px` 
            }} 
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="glass-portal noisy-glass rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative">
          
          {/* Success Overlay */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl"
              >
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                    <CheckCircle2 size={48} className="text-white" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-white text-3xl font-black uppercase tracking-tight italic">Access Granted.</h2>
                    <p className="text-slate-400 text-sm mt-2 font-medium uppercase tracking-wide">Initialising Node MTP-01...</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl p-2 mb-6"
            >
              <Image src={logoJne} alt="JNE Logo" width={60} height={60} className="object-contain" />
            </motion.div>
            
            <div className="space-y-1">
              <p className="text-[#E04B3A] text-[10px] font-black uppercase tracking-wide mb-2">Systems Protocol v4.0</p>
              <h1 className="text-4xl md:text-5xl mixed-weight-heading text-white leading-none uppercase italic">
                Nexus <b>Portal.</b>
              </h1>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wide pt-2">Admin Authentication Required</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <label htmlFor="login-email" className="sr-only">Email Address</label>
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-[#E04B3A]" />
                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="MASUKKAN ID USER"
                  required
                  autoComplete="email"
                  className="w-full nexus-input rounded-2xl py-4.5 pl-14 pr-6 text-sm font-black tracking-wide uppercase placeholder:text-slate-600 focus:outline-none"
                />
                <div className="mt-2 flex items-center gap-2 px-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600/40 animate-pulse" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-wide italic">
                    Cukup masukkan ID (otomatis @jnemtp.com)
                  </p>
                </div>
              </div>

              <div className="relative group">
                <label htmlFor="login-password" className="sr-only">Password</label>
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-[#E04B3A]" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="SECURITY_CODE"
                  required
                  autoComplete="current-password"
                  className="w-full nexus-input rounded-2xl py-4.5 pl-14 pr-14 text-sm font-black tracking-widest focus:outline-none"
                />
                <button
                  id="toggle-password"
                  type="button"
                  onClick={togglePassword}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-red-400 text-[11px] font-black uppercase tracking-wide">{error}</p>
              </motion.div>
            )}

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <button
                  id="remember-me"
                  type="button"
                  role="checkbox"
                  aria-checked={rememberMe}
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#E04B3A]/40 ${rememberMe ? 'bg-[#E04B3A] border-[#E04B3A]' : 'bg-slate-900 border-slate-800'}`}
                >
                  {rememberMe && <CheckCircle2 size={12} className="text-white" />}
                </button>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-wide group-hover:text-slate-200">Remember Station</span>
              </label>
              <Link href="/forgot-password" className="text-[#E04B3A] text-[10px] font-black uppercase tracking-wide hover:text-white transition-colors">Recover Code</Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading || isSuccess}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#E04B3A] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-[#E04B3A]/20 transition-all hover:bg-[#aa0000] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-widest text-sm">Synchronize Access</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer Card Info */}
          <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex gap-4">
              {[Shield, Activity, Zap].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-[#E04B3A] transition-colors border border-transparent hover:border-white/5">
                  <Icon size={16} />
                </div>
              ))}
            </div>
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-wide text-right">
              MTP-HQ NETWORK · CORE v4.2<br />
              <span className="text-[#E04B3A]/40">SECURED_LINE_MTP_01</span>
            </p>
          </div>
        </div>
        
        {/* Floating Decorative Label (Asymmetrical touch) */}
        <div className="absolute -bottom-6 -right-6 px-6 py-2 rounded-full bg-white text-slate-950 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl rotate-3">
          JNE Martapura
        </div>
      </motion.div>
    </div>
  );
}