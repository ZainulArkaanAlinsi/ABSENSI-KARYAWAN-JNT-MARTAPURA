"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoginLogic } from "@/hooks/useLoginLogic";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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
    <div className="min-h-screen bg-(--bg-main) flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* ── Background Detail (Zen Style) ── */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[520px]"
      >
        <div className="bg-(--bg-card) border border-(--border-primary) rounded-[40px] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.1)] relative overflow-hidden">
          
          {/* Success Overlay */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-8"
                >
                  <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 size={48} className="text-white" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-(--text-primary) text-3xl font-black uppercase tracking-tight italic">Authenticated</h2>
                    <p className="text-(--text-muted) text-[11px] mt-2 font-black uppercase tracking-[0.3em]">Accessing Command Hub...</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── 1. HEADER SECTOR ── */}
          <div className="mb-14">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-16 h-16 bg-[#121826] rounded-2xl flex items-center justify-center shadow-lg p-3">
                 <Image src="/logo-jne.svg" alt="JNE" width={40} height={40} className="brightness-0 invert" />
              </div>
              <div>
                <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] leading-none mb-2">Martapura Hub</p>
                <h1 className="text-2xl font-black text-(--text-primary) tracking-tighter uppercase leading-none">Administrative <span className="text-indigo-600">Portal</span></h1>
              </div>
            </div>
            
            <h2 className="text-5xl font-black text-(--text-primary) leading-[0.95] tracking-tighter uppercase italic mb-4">
              Secure <br /><span className="text-indigo-600 not-italic">Gateway.</span>
            </h2>
            <p className="text-(--text-muted) text-sm font-medium tracking-tight">Identity verification for JNE Hub administrators.</p>
          </div>

          {/* ── 2. FORM SECTOR ── */}
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-6">
              <div className="relative group">
                <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-(--text-dim) transition-colors group-focus-within:text-indigo-600" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="USERNAME / EMAIL"
                  required
                  className="w-full h-16 bg-slate-50 border border-transparent rounded-2xl pl-16 pr-6 text-sm font-black tracking-widest text-(--text-primary) placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                />
              </div>

              <div className="relative group">
                <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-(--text-dim) transition-colors group-focus-within:text-indigo-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="SECURITY CODE"
                  required
                  className="w-full h-16 bg-slate-50 border border-transparent rounded-2xl pl-16 pr-16 text-sm font-black tracking-[0.4em] text-(--text-primary) placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-(--text-dim) hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-center gap-4"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
              </motion.div>
            )}

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center focus:outline-none ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-100'}`}
                >
                  {rememberMe && <CheckCircle2 size={14} className="text-white" />}
                </button>
                <span className="text-(--text-muted) text-[10px] font-black uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Trust device</span>
              </label>
              <Link href="#" className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">Reset access</Link>
            </div>

            <button
              type="submit"
              disabled={loading || isSuccess}
              className="w-full h-16 bg-indigo-600 hover:bg-[#121826] text-white font-black rounded-2xl flex items-center justify-center gap-4 shadow-xl shadow-indigo-100 transition-all duration-500 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <div className="flex items-center gap-4">
                  <span className="uppercase tracking-[0.2em] text-[11px]">Authorize Access</span>
                  <ArrowRight size={20} />
                </div>
              )}
            </button>
          </form>

          {/* ── 3. FOOTER SECTOR ── */}
          <div className="mt-16 pt-10 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-slate-400">
              <ShieldCheck size={18} className="text-indigo-600/40" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">AES-256 Bit Encryption</span>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center sm:text-right leading-loose">
              JNE Martapura Tactical Hub<br />
              <span className="text-indigo-600/40">Secure Node v5.0.2</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}