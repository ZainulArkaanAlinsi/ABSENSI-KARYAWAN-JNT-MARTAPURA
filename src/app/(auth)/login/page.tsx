'use client';

import { Eye, EyeOff, Loader2, ArrowRight, Package, MapPin, Users, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useLoginLogic } from '@/hooks/useLoginLogic';
import Image from 'next/image';
import { useState, useRef } from 'react';

// ── animated stat pill ───────────────────────────────────────────────────────
function StatPill({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
    >
      <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-orange-400" />
      </div>
      <div>
        <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest leading-none mb-0.5">
          {label}
        </p>
        <p className="text-white text-sm font-black leading-none">{value}</p>
      </div>
    </motion.div>
  );
}

// ── magnetic button ───────────────────────────────────────────────────────────
function MagneticButton({
  loading,
  disabled,
  onClick,
}: {
  loading: boolean;
  disabled: boolean;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-20, 20], [4, -4]);
  const rotateY = useTransform(x, [-60, 60], [-4, 4]);

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }
  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      type="submit"
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      whileTap={{ scale: 0.96 }}
      className="w-full h-[58px] relative overflow-hidden rounded-2xl font-black text-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      {/* Gradient background */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)',
        }}
        whileHover={{ opacity: 0.9 }}
      />
      {/* Shine sweep on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        initial={{ opacity: 0, translateX: '-100%' }}
        whileHover={{ opacity: 1, translateX: '100%' }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        style={{
          background:
            'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
        }}
      />
      {/* Shadow layer */}
      <div className="absolute inset-0 rounded-2xl shadow-[0_8px_32px_-4px_rgba(249,115,22,0.5)]" />
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {loading ? (
          <Loader2 size={22} className="animate-spin" />
        ) : (
          <>
            <span className="text-[13px] uppercase tracking-[0.15em]">Masuk ke Admin Panel</span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            >
              <ArrowRight size={18} />
            </motion.div>
          </>
        )}
      </span>
    </motion.button>
  );
}

// ── field component ───────────────────────────────────────────────────────────
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconNode: React.ReactNode;
}

function Field({ label, iconNode, ...inputProps }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <motion.label
        animate={{ color: focused ? '#F97316' : '#94A3B8' }}
        transition={{ duration: 0.2 }}
        className="block text-[10px] font-black uppercase tracking-widest mb-2"
      >
        {label}
      </motion.label>
      <div className="relative">
        <motion.div
          animate={{ color: focused ? '#F97316' : '#94A3B8' }}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
        >
          {iconNode}
        </motion.div>
        <motion.div
          animate={{
            boxShadow: focused
              ? '0 0 0 2px rgba(249,115,22,0.3), 0 1px 4px rgba(0,0,0,0.06)'
              : '0 0 0 1.5px rgba(0,0,0,0.09)',
          }}
          className="rounded-xl overflow-hidden"
        >
          <input
            {...inputProps}
            onFocus={(e) => {
              setFocused(true);
              inputProps.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              inputProps.onBlur?.(e);
            }}
            className="w-full h-[52px] bg-slate-50 pl-11 pr-4 text-slate-800 text-sm font-semibold placeholder:text-slate-300 focus:outline-none"
          />
        </motion.div>
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 lg:p-8 overflow-hidden">
      {/* subtle bg pattern */}
      <div
        className="fixed inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #CBD5E1 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── 2-card wrapper ── */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* ═══════════════════════════════════════════════════════════
            LEFT CARD — JNE Branding Panel
        ═══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: -48, rotateY: -8 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="lg:w-[48%] relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #0F172A 0%, #1E1B4B 40%, #0F172A 100%)',
            minHeight: 540,
          }}
        >
          {/* Orange glow blob */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-[80px]"
            style={{ background: 'radial-gradient(circle, #F97316, transparent)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-[60px]"
            style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }}
          />

          {/* Dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative z-10 h-full flex flex-col p-8 lg:p-10">
            {/* Logo + company */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-3 mb-auto"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg p-2.5">
                <Image src="/logo-jne.svg" alt="JNE" width={28} height={28} />
              </div>
              <div>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.35em] leading-none mb-1">
                  Martapura Hub
                </p>
                <p className="text-white text-sm font-black leading-none">JNE Express</p>
              </div>
            </motion.div>

            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center my-6"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              >
                <Image
                  src="/JNE-logo-orang-paket.svg"
                  alt="JNE Delivery"
                  width={220}
                  height={220}
                  className="drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mb-6"
            >
              <h2 className="text-white text-3xl font-black leading-tight tracking-tight mb-2">
                Admin Panel
                <br />
                <span className="text-orange-400">Operasional</span>
              </h2>
              <p className="text-white/45 text-sm font-medium leading-relaxed">
                Kelola absensi, karyawan, dan operasional harian JNE Martapura dari satu dashboard
                terpusat.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatPill icon={Users} label="Karyawan" value="Tim Aktif" delay={0.65} />
              <StatPill icon={Package} label="Absensi" value="Real-time" delay={0.72} />
              <StatPill icon={MapPin} label="Lokasi" value="Martapura" delay={0.79} />
              <StatPill icon={TrendingUp} label="Monitoring" value="Live Data" delay={0.86} />
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════
            RIGHT CARD — Login Form
        ═══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:w-[52%] bg-white rounded-3xl p-8 lg:p-10 shadow-[0_24px_64px_-12px_rgba(15,23,42,0.12)] relative overflow-hidden flex flex-col justify-center"
        >
          {/* Top-right orange accent */}
          <div
            className="absolute top-0 right-0 w-40 h-40 opacity-[0.04] rounded-full -translate-y-1/2 translate-x-1/2"
            style={{ background: 'radial-gradient(circle, #F97316, transparent)' }}
          />

          {/* Success overlay */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center rounded-3xl"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="flex flex-col items-center gap-6"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-500/30"
                  >
                    <Image
                      src="/logo-jne.svg"
                      alt="JNE"
                      width={44}
                      height={44}
                      className="brightness-0 invert"
                    />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-slate-800 text-2xl font-black">Selamat Datang</p>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-1">
                      Mengarahkan ke Dashboard...
                    </p>
                  </div>
                  <motion.div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-orange-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.85, ease: 'easeInOut' }}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-orange-600 text-[10px] font-black uppercase tracking-widest">
                Admin Only Access
              </span>
            </div>
            <h1 className="text-slate-800 text-3xl font-black tracking-tight leading-tight mb-2">
              Masuk ke
              <br />
              <span className="text-orange-500">Command Center</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Verifikasi identitas untuk akses penuh ke sistem absensi JNE.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}
            <Field
              label="Username / Email"
              iconNode={
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@jne.co.id"
              required
              autoComplete="username"
            />

            {/* Password */}
            <div className="relative">
              <Field
                label="Password"
                iconNode={
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-4 bottom-[14px] text-slate-400 hover:text-orange-500 transition-colors"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <motion.div
                    animate={{ x: [0, -6, 6, -4, 4, 0] }}
                    transition={{ duration: 0.4 }}
                    className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                    <p className="text-rose-500 text-xs font-bold">{error}</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <div className="pt-1">
              <MagneticButton loading={loading} disabled={loading || isSuccess} />
            </div>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-slate-300">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-widest">
                Secure Connection
              </span>
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
              JNE Admin v2.0
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
