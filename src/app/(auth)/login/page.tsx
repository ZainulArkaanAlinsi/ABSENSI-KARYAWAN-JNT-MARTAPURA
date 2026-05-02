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
    <div className="min-h-screen bg-(--bg-main) flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      
      {/* ── Background Detail ── */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-linear-to-bl from-red-600/5 to-transparent rounded-full blur-3xl -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-linear-to-tr from-[#005596]/5 to-transparent rounded-full blur-3xl -ml-48 -mb-48" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bg-(--bg-card) border border-(--border-primary) rounded-4xl p-10 md:p-14 shadow-2xl relative overflow-hidden">
          
          {/* Success Overlay */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-(--bg-card) backdrop-blur-xl"
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
                    <h2 className="text-(--text-primary) text-3xl font-black uppercase tracking-tight italic">Berhasil Masuk</h2>
                    <p className="text-(--text-muted) text-[11px] mt-2 font-black uppercase tracking-[0.3em]">Mempersiapkan Dashboard...</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-[#E31E24] rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20 p-2.5">
                <Image src="/logo-jne.svg" alt="JNE Logo" width={40} height={40} className="brightness-0 invert" />
              </div>
              <div>
                <p className="text-[#E31E24] text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-1">Martapura</p>
                <h1 className="text-2xl font-black text-(--text-primary) italic tracking-tighter uppercase leading-none">Admin Portal</h1>
              </div>
            </div>
            
            <h2 className="text-4xl font-black text-(--text-primary) leading-tight tracking-tighter uppercase italic">
              Selamat <b>Datang.</b>
            </h2>
            <p className="text-(--text-muted) text-xs font-bold uppercase tracking-widest mt-3">Silakan masuk untuk mengelola sistem absensi.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-5">
              <div className="relative group">
                <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-(--text-dim) transition-colors group-focus-within:text-[#E31E24]" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ID PENGGUNA"
                  required
                  className="w-full bg-white/5 border border-(--border-primary) rounded-2xl py-5 pl-16 pr-6 text-sm font-black tracking-widest text-(--text-primary) placeholder:text-(--text-dim) focus:outline-none focus:border-[#E31E24]/30 transition-all shadow-sm"
                />
              </div>

              <div className="relative group">
                <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-(--text-dim) transition-colors group-focus-within:text-[#E31E24]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="KODE KEAMANAN"
                  required
                  className="w-full bg-white/5 border border-(--border-primary) rounded-2xl py-5 pl-16 pr-16 text-sm font-black tracking-[0.4em] text-(--text-primary) placeholder:text-(--text-dim) focus:outline-none focus:border-[#E31E24]/30 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-(--text-dim) hover:text-(--text-primary) transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-center gap-4"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
              </motion.div>
            )}

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center focus:outline-none ${rememberMe ? 'bg-[#E31E24] border-[#E31E24]' : 'bg-white/5 border-(--border-primary)'}`}
                >
                  {rememberMe && <CheckCircle2 size={12} className="text-white" />}
                </button>
                <span className="text-(--text-muted) text-[10px] font-black uppercase tracking-widest group-hover:text-(--text-primary) transition-colors">Ingat Perangkat</span>
              </label>
              <Link href="#" className="text-[#E31E24] text-[10px] font-black uppercase tracking-widest hover:underline">Lupa Kode?</Link>
            </div>

            <button
              type="submit"
              disabled={loading || isSuccess}
              className="w-full bg-[#E31E24] hover:bg-red-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-4 shadow-xl shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <div className="flex items-center gap-4">
                  <span className="uppercase tracking-[0.2em] text-[11px]">Verifikasi Akses</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-14 pt-8 border-t border-(--border-primary) flex items-center justify-between">
            <div className="flex items-center gap-3 text-(--text-dim)">
              <ShieldCheck size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest">Enkripsi AES-256 Aktif</span>
            </div>
            <p className="text-[9px] font-black text-(--text-dim) uppercase tracking-widest text-right leading-relaxed">
              JNE Martapura HQ<br />
              <span className="text-(--text-muted)">Secure Station v4.2</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}