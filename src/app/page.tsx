'use client';

import { motion } from 'framer-motion';
import { Shield, ArrowRight, Lock, LayoutDashboard, Database, Activity, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const logoJne = '/logo-jne.svg';

export default function AdminPortalPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* ── Precise Background Grid ── */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(204,0,0,0.03),transparent_70%)] z-0" />

      {/* ── Main Container ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden"
      >
        
        {/* Left Side: Visual & Status */}
        <div className="p-12 lg:p-16 bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-3 mb-10 shadow-2xl">
              <Image src={logoJne} alt="JNE Logo" width={48} height={48} className="object-contain" />
            </div>
            
            <h1 className="text-4xl font-black tracking-tighter leading-none mb-6 italic uppercase">
              Management<br/><span className="text-red-500">System.</span>
            </h1>
            
            <div className="space-y-4">
              {[
                { icon: Shield, text: 'Enforced Security Protocol' },
                { icon: Database, text: 'Real-time Node Synchronization' },
                { icon: Activity, text: 'Operational Live Monitoring' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-400 group">
                  <item.icon size={16} className="text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-12 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Authorized Personnel Only</p>
            </div>
          </div>
        </div>

        {/* Right Side: Access Control */}
        <div className="p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-50 border border-red-100 mb-4">
              <Lock size={12} className="text-red-600" />
              <span className="text-[9px] font-black text-red-600 uppercase tracking-wide">Portal Access v4.0</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic mb-2">Gate <span className="text-slate-300">Terminal</span></h2>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">Pintu masuk utama untuk administrasi operasional JNE Martapura.</p>
          </div>

          <div className="space-y-4">
            <Link 
              href={user ? '/dashboard' : '/login'}
              className="group w-full h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-between px-8 hover:bg-red-600 transition-all duration-500 shadow-xl shadow-slate-900/10 active:scale-[0.98]"
            >
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-wide mb-1">Authenticated Entrance</span>
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {user ? 'Buka Dashboard' : 'Login ke Sistem'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-red-600 transition-all">
                <ArrowRight size={20} />
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <Zap size={16} className="text-slate-400" />
                <span className="text-[8px] font-black uppercase tracking-wide text-slate-500">Fast Load</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <CheckCircle2 size={16} className="text-slate-400" />
                <span className="text-[8px] font-black uppercase tracking-wide text-slate-500">Verified</span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-wide italic">Martapura Hub Node</p>
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Server Online</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Precise Footer Decoration */}
      <div className="absolute bottom-8 left-8 flex items-center gap-4 opacity-20">
        <div className="w-12  bg-slate-900" />
        <span className="text-[9px] font-black uppercase tracking-[0.4em]">Internal Resource</span>
      </div>
    </div>
  );
}