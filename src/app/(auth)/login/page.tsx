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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoginLogic } from "@/hooks/useLoginLogic";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

// Direct static imports from the assets folder — no /public copy needed
import logoJne from "../../../../assets/logo-jne.png";
import jneBg from "../../../../assets/JNE-logo-orang-paket.png";

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
    /* fixed inset-0 prevents ANY scrolling; the page is always exactly the viewport */
    <div className="fixed inset-0 flex overflow-hidden" style={{ background: "#CC0000" }}>

      {/* ===== LEFT PANEL – Branding ===== */}
      <div
        className="hidden lg:flex w-[52%] flex-col justify-between relative overflow-hidden"
        style={{ background: "#B30000" }}
      >
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Top header */}
        <div className="relative z-10 px-12 pt-12 flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg p-1.5">
            <Image
              src={logoJne}
              alt="JNE Logo"
              width={52}
              height={52}
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">
              JNE Martapura
            </p>
            <h2 className="text-white text-xl font-bold leading-tight">
              Attendance System
            </h2>
          </div>
        </div>

        {/* Center hero */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 text-center">
          <Image
            src={jneBg}
            alt="JNE Illustration"
            width={380}
            height={380}
            className="object-contain drop-shadow-2xl mb-8"
            priority
          />
          <h1 className="text-white text-4xl font-black leading-tight mb-3">
            Welcome Back!
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-xs">
            Sistem absensi karyawan JNE Martapura yang aman, cepat, dan terpercaya.
          </p>
        </div>

        {/* Bottom status */}
        <div className="relative z-10 px-12 pb-10">
          <div className="flex items-center gap-6 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              System Online
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={13} />
              AES-256 Encrypted
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL – Login Form (white) ===== */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md px-8 relative"
        >
          {/* Success overlay */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white"
              >
                <motion.div
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 size={40} className="text-white" />
                  </div>
                  <p className="text-gray-900 text-2xl font-bold">Access Granted</p>
                  <p className="text-gray-500 text-sm">Redirecting to dashboard...</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile logo (shows on small screens) */}
          <div className="flex lg:hidden items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow p-1.5 bg-white border border-gray-100">
              <Image src={logoJne} alt="JNE" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">JNE Martapura</p>
              <h2 className="text-gray-900 text-lg font-bold">Attendance System</h2>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-[#CC0000] text-xs font-bold uppercase tracking-widest mb-1">
              Admin Portal
            </p>
            <h3 className="text-gray-900 text-3xl font-black">Sign In</h3>
            <p className="text-gray-500 text-sm mt-1.5">
              Masukkan kredensial Anda untuk masuk ke dashboard.
            </p>
            <div className="mt-3 h-1 w-12 rounded-full" style={{ background: "#CC0000" }} />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                  !
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl py-3.5 pl-11 pr-4 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all"
                  style={{ "--tw-ring-color": "#CC0000" } as React.CSSProperties}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#CC0000")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                  placeholder="admin@jne.mtp"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl py-3.5 pl-11 pr-12 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all"
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#CC0000")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={togglePassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <button
                  type="button"
                  id="remember-me"
                  role="checkbox"
                  aria-checked={rememberMe}
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30 ${
                    rememberMe
                      ? "border-[#CC0000]"
                      : "border-gray-300 bg-white group-hover:border-red-300"
                  }`}
                  style={{ background: rememberMe ? "#CC0000" : undefined }}
                >
                  {rememberMe && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  )}
                </button>
                <span className="text-gray-600 text-sm group-hover:text-gray-900 transition-colors">
                  Ingat saya
                </span>
              </label>
              <Link
                href="/forgot-password"
                id="forgot-password-link"
                className="text-sm font-semibold hover:underline transition-colors"
                style={{ color: "#CC0000" }}
              >
                Lupa password?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              id="login-submit"
              disabled={loading || isSuccess}
              whileHover={{ scale: loading || isSuccess ? 1 : 1.015 }}
              whileTap={{ scale: loading || isSuccess ? 1 : 0.985 }}
              className="w-full text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-base disabled:opacity-60 transition-colors mt-1 shadow-lg"
              style={{ background: "#CC0000" }}
              onMouseEnter={(e) => !loading && !isSuccess && (e.currentTarget.style.background = "#aa0000")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#CC0000")}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Mengautentikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-400 text-xs mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-1.5">
            <Shield size={11} />
            © 2025 JNE Martapura · Secure Connection · AES-256
          </p>
        </motion.div>
      </div>
    </div>
  );
}