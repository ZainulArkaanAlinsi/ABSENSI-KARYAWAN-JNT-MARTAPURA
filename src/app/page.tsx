'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Lock, LayoutDashboard, Globe, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function AdminPortalPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-(--bg-main) flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      
      {/* ── Background Detail ── */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#E31E2410,transparent_70%)]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--border-primary) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      {/* ── Main Container ── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-[1100px] bg-(--bg-card) rounded-4xl shadow-2xl border border-(--border-primary) overflow-hidden grid grid-cols-1 lg:grid-cols-11"
      >
        
        {/* Left Side: Visual Brand */}
        <div className="lg:col-span-5 p-12 lg:p-16 bg-[#0F172A] text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-bl from-red-600/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-3 mb-12 shadow-xl">
              <Image src="/logo-jne.svg" alt="JNE Logo" width={48} height={48} className="object-contain" />
            </div>
            
            <h1 className="text-4xl font-black tracking-tighter leading-tight mb-8 italic uppercase">
              Sistem Manajemen<br/><span className="text-[#E31E24]">Operasional.</span>
            </h1>
            
            <div className="space-y-6">
              {[
                { icon: ShieldCheck, text: 'Keamanan Data Terenkripsi' },
                { icon: Globe, text: 'Sinkronisasi Cloud Real-time' },
                { icon: CheckCircle2, text: 'Otorisasi Absensi FaceID' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-400 group">
                  <item.icon size={20} className="text-[#E31E24] group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-12 border-t border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Internal Resource</p>
            <p className="text-xs text-slate-300 font-medium">Khusus untuk personel resmi JNE Martapura.</p>
          </div>
        </div>

        {/* Right Side: Access Control */}
        <div className="lg:col-span-6 p-12 lg:p-16 flex flex-col justify-center bg-(--bg-card)">
          <div className="mb-14">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/10 mb-6">
              <Lock size={14} className="text-[#E31E24]" />
              <span className="text-[10px] font-black text-[#E31E24] uppercase tracking-widest">Portal Resmi v4.2</span>
            </div>
            <h2 className="text-3xl font-black text-(--text-primary) tracking-tighter uppercase italic leading-none mb-4">
              Gateway <span className="text-(--text-dim)">Akses</span>
            </h2>
            <p className="text-(--text-muted) text-sm font-bold uppercase tracking-widest leading-relaxed">Pintu masuk utama administrasi operasional JNE Martapura.</p>
          </div>

          <div className="space-y-6">
            <Link 
              href={user ? '/dashboard' : '/login'}
              className="group w-full h-24 rounded-3xl bg-[#0F172A] text-white flex items-center justify-between px-10 hover:bg-[#E31E24] transition-all duration-500 shadow-2xl shadow-slate-950/20 active:scale-[0.98]"
            >
              <div className="flex flex-col items-start">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5">Authenticated Entrance</span>
                <span className="text-[13px] font-black uppercase tracking-[0.2em]">
                  {user ? 'Lanjut ke Dashboard' : 'Masuk ke Sistem'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-[#E31E24] transition-all border border-white/10 group-hover:border-transparent">
                <ArrowRight size={22} />
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white/2 border border-(--border-primary) flex flex-col items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                <LayoutDashboard size={20} className="text-(--text-muted)" />
                <span className="text-[9px] font-black uppercase tracking-widest text-(--text-dim)">Interface Pro</span>
              </div>
              <div className="p-6 rounded-3xl bg-white/2 border border-(--border-primary) flex flex-col items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                <ShieldCheck size={20} className="text-(--text-muted)" />
                <span className="text-[9px] font-black uppercase tracking-widest text-(--text-dim)">Verified</span>
              </div>
            </div>
          </div>

          <div className="mt-14 pt-8 border-t border-(--border-primary) flex items-center justify-between">
            <p className="text-[10px] font-black text-(--text-dim) uppercase tracking-widest italic">Martapura HQ Hub</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">Network Online</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}