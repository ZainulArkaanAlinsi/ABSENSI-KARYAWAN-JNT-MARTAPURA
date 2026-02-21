"use client";

import {
  Shield,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Binary,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useLoginLogic } from "@/hooks/useLoginLogic";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.14, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 18, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const glowPulse: Variants = {
  initial: { opacity: 0.25, scale: 0.96 },
  animate: {
    opacity: [0.18, 0.32, 0.18],
    scale: [0.96, 1.03, 0.96],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

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
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0f172a_0%,#020617_100%)]" />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[40px_40px]" />
      
      {/* Dynamic Security Blobs */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[160px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ duration: 20, repeat: Infinity }}
        style={{ background: 'radial-gradient(circle, var(--jne-red) 0%, transparent 70%)' }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[160px] pointer-events-none"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ duration: 25, repeat: Infinity }}
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 w-full max-w-6xl mx-auto px-8 lg:px-12 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center"
      >
        {/* Intelligence Context */}
        <div className="w-full lg:w-1/2 space-y-12">
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-6"
          >
            <div className="relative">
              <motion.div
                variants={glowPulse}
                initial="initial"
                animate="animate"
                className="absolute inset-0 rounded-2xl bg-jne-red/40 blur-2xl"
              />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-jne-red to-jne-danger shadow-2xl border border-white/10">
                <Shield size={32} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/30 font-black">
                Security Protocol · Admin
              </p>
              <h2 className="text-xl font-black text-white tracking-widest uppercase mt-1">
                JNE Martapura <span className="text-jne-red">AI</span>
              </h2>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <h1 className="text-5xl lg:text-7xl font-black leading-tight text-white tracking-tighter">
              INTELLIGENCE<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-jne-red via-purple-500 to-indigo-500">
                AUTHORIZED.
              </span>
            </h1>
            <p className="text-[12px] text-white/30 max-w-md font-black uppercase tracking-[0.4em] leading-relaxed">
              Secure personnel deployment, face-biometric authentication, and real-time operational metrics.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 gap-6 max-w-lg"
          >
            {[
              { label: 'Biometrics', desc: 'Liveness Detection', icon: Binary },
              { label: 'Geo-Locked', desc: 'Protocol Enforcement', icon: Shield },
              { label: 'Real-time', desc: 'Sync Active', icon: Activity },
              { label: 'Encrypted', desc: 'AES-256 Link', icon: Lock },
            ].map(f => (
              <div key={f.label} className="glass-card p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-jne-red/20 group-hover:bg-jne-red transition-colors" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 mb-2 font-black group-hover:text-white transition-colors">
                  {f.label}
                </p>
                <p className="text-white/60 text-[10px] font-black tracking-widest uppercase">{f.desc}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 text-[10px] font-black tracking-[0.3em] text-white/20"
          >
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              CORE OPTIMAL
            </div>
            <span className="opacity-20 uppercase">Network Secured</span>
          </motion.div>
        </div>

        {/* Auth Terminal */}
        <div className="w-full lg:w-[480px] shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card p-10 sm:p-14 rounded-4xl border border-white/5 relative overflow-hidden shadow-2xl"
          >
            {/* Success overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-2xl"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-jne-success/10 flex items-center justify-center text-jne-success border border-jne-success/20 shadow-2xl">
                      <CheckCircle2 size={40} />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-white tracking-widest uppercase mb-2">Access Granted</p>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">Initializing Core UI...</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative space-y-10">
              {/* Header */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.5em] text-jne-red font-black">Authentication Terminal</p>
                <h2 className="text-3xl font-black text-white tracking-tight uppercase">Admin Login</h2>
                <div className="h-1 w-12 bg-jne-red/50 rounded-full" />
              </div>

              {/* Error */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-5 rounded-2xl bg-jne-danger/5 border border-jne-danger/20 flex items-start gap-4"
                  >
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-jne-danger/20 flex items-center justify-center text-jne-danger text-lg font-black italic">
                      !
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-jne-danger uppercase tracking-[0.2em] mb-1">
                        Security Alert
                      </p>
                      <p className="text-[11px] text-jne-danger/70 font-bold leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-7">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-2">
                    Personnel ID
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-jne-red transition-all"
                      size={18}
                    />
                    <input
                      type="email"
                      className="form-input pl-14! py-4!"
                      placeholder="admin@jne.mtp"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-2">
                    Authentication Key
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-jne-red transition-all"
                      size={18}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input pl-14! py-4! pr-14"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-all p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-5 h-5 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-jne-red/50 transition-colors">
                      <div className="w-2 h-2 rounded-sm bg-jne-red shadow-[0_0_10px_rgba(227,30,36,0.5)]" />
                    </div>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Secure Session</span>
                  </div>
                  <button
                    type="button"
                    className="text-[10px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-[0.2em]"
                  >
                    Recovery
                  </button>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || isSuccess}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full py-5! rounded-2xl! group shadow-2xl shadow-jne-red/20"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="uppercase tracking-[0.3em]">Authenticating</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="uppercase tracking-[0.3em]">Initialize Access</span>
                      <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
                    </div>
                  )}
                </motion.button>
              </form>

              <div className="pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">
                  Encrypted Session AES-256 Protocol
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

