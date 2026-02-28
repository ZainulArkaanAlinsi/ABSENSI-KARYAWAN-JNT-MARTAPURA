'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#1A1F2E] flex items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#E04B3A_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#3863C3_0%,transparent_50%)]" />
      </div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-[#1B2A4A] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl p-8">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-xs text-[#9BA4B4] hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>

          <div className="space-y-6">
            <div className="w-12 h-12 bg-[#E04B3A]/10 rounded-xl flex items-center justify-center border border-[#E04B3A]/20">
              <Shield size={24} className="text-[#E04B3A]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-white text-2xl font-bold">Secure Reset</h3>
              <p className="text-[#9BA4B4] text-sm">
                Enter your administrative email to receive a secure recovery link.
              </p>
            </div>

            {!submitted ? (
              <form 
                onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                className="space-y-6"
              >
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
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-[#9BA4B4]/50 focus:outline-none focus:border-[#E04B3A]/50 transition-all"
                      placeholder="admin@jne.mtp"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-linear-to-r from-[#E04B3A] to-[#C0392B] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all hover:scale-[1.02]"
                >
                  Send Recovery Link
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center"
              >
                <p className="text-emerald-500 text-sm font-bold">Recovery link sent!</p>
                <p className="text-white/60 text-xs mt-2">
                  Check your inbox for further authorization instructions.
                </p>
              </motion.div>
            )}
          </div>
          
          <div className="mt-8 text-center text-[#9BA4B4] text-[10px] uppercase tracking-[0.2em] opacity-40">
            JNE MTP SECURITY PROTOCOL v4.2
          </div>
        </div>
      </motion.div>
    </div>
  );
}
