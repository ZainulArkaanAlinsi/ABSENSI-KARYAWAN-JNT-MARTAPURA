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
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoginLogic } from "@/hooks/useLoginLogic";
import Link from "next/link";

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

  return (
    <div className="min-h-screen bg-[#1A1F2E] flex items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#E04B3A_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#3863C3_0%,transparent_50%)]" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-6xl mx-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Left: Branding Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-8 p-8 lg:p-12"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#E04B3A]/20 blur-2xl rounded-full" />
                <div className="relative w-16 h-16 bg-linear-to-br from-[#E04B3A] to-[#C0392B] rounded-2xl flex items-center justify-center shadow-xl">
                  <Shield size={32} className="text-white" />
                </div>
              </div>
              <div>
                <p className="text-[#9BA4B4] text-xs font-semibold uppercase tracking-widest">
                  JNE Martapura
                </p>
                <h2 className="text-white text-2xl font-bold tracking-tight">
                  Attendance System
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight">
                Welcome Back,
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#E04B3A] to-[#3863C3]">
                  Authorized Personnel
                </span>
              </h1>
              <p className="text-[#9BA4B4] text-sm max-w-md leading-relaxed">
                Secure face recognition attendance system with real-time monitoring and AES-256 encryption.
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-[#9BA4B4]">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16A34A]" />
                </span>
                System Online
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#E04B3A]" />
                AI Ready
              </div>
            </div>

            {/* Feature list */}
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {[
                "Face Recognition",
                "GPS Tracking",
                "Real-time Sync",
                "Encrypted",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-xs text-[#9BA4B4] bg-white/5 px-3 py-2 rounded-lg border border-white/10"
                >
                  <div className="w-1 h-1 rounded-full bg-[#E04B3A]" />
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-[#1B2A4A] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl p-8 lg:p-10"
          >
            {/* Success Overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1B2A4A]/90 backdrop-blur-xl rounded-3xl"
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-20 h-20 bg-[#16A34A]/10 rounded-2xl flex items-center justify-center border border-[#16A34A]/20">
                      <CheckCircle2 size={40} className="text-[#16A34A]" />
                    </div>
                    <p className="text-white text-xl font-bold">Access Granted</p>
                    <p className="text-[#9BA4B4] text-xs">Redirecting to dashboard...</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <p className="text-[#E04B3A] text-xs font-semibold uppercase tracking-widest">
                  Authentication Required
                </p>
                <h3 className="text-white text-2xl font-bold">Admin Login</h3>
                <div className="w-12 h-1 bg-[#E04B3A]/50 rounded-full" />
              </div>

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 text-sm font-bold">
                      !
                    </div>
                    <p className="text-sm text-red-500/90 flex-1">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[#9BA4B4] text-xs font-semibold uppercase tracking-wider ml-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9BA4B4]"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-[#9BA4B4]/50 focus:outline-none focus:border-[#E04B3A]/50 focus:ring-2 focus:ring-[#E04B3A]/20 transition-all"
                      placeholder="admin@jne.mtp"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[#9BA4B4] text-xs font-semibold uppercase tracking-wider ml-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9BA4B4]"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white text-sm placeholder:text-[#9BA4B4]/50 focus:outline-none focus:border-[#E04B3A]/50 focus:ring-2 focus:ring-[#E04B3A]/20 transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9BA4B4] hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-sm bg-[#E04B3A] shadow-[0_0_8px_rgba(224,75,58,0.5)]" />
                    </div>
                    <span className="text-[#9BA4B4] text-xs">Remember me</span>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#9BA4B4] hover:text-white transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || isSuccess}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-linear-to-r from-[#E04B3A] to-[#C0392B] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#E04B3A]/20 flex items-center justify-center gap-2 hover:from-[#E04B3A] hover:to-[#B0302A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="text-center text-[#9BA4B4] text-xs border-t border-white/10 pt-6">
                <p>© 2025 JNE Martapura. All rights reserved.</p>
                <p className="mt-1 opacity-60">Secure Connection • AES-256</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}