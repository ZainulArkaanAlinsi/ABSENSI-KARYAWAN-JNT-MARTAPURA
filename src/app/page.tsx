'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Shield, 
  Users, 
  MapPin, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Zap,
  UserCheck,
  ChevronRight,
  Globe,
  Database,
  Smartphone,
  Sparkles,
  Fingerprint,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRef } from 'react';

// ── Real JNE Assets (served from /public via next/image) ──
import logoJne from '../../assets/logo-jne.png';
import jneOrangPaket from '../../assets/JNE-logo-orang-paket.png';
import jneMobil3d from '../../assets/jne-mobil-3d.png';
import jneMotor from '../../assets/jne-motor-2.png';
import logoDelivery from '../../assets/logo-delivery.png';
import logoJneMegangHp from '../../assets/logo-jne-megang-hp.png';
import orangJneSalam from '../../assets/orang-jne-salam.png';
import jneMobilCepat from '../../assets/jne-mobil-cepat-logo.png';

// Animations dengan easing string (TypeScript friendly)
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  viewport: { once: true }
};

const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  whileInView: { scale: 1, opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }
};

export default function EnhancedLandingPage() {
  const { user } = useAuth();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.3]);

  return (
    <div className="min-h-screen bg-white text-[#0F172A] selection:bg-[#BE123C] selection:text-white font-sans overflow-x-hidden">
      
      {/* Background Elements — Solid Accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] left-[10%] w-[40vw] h-[40vw] bg-[#BE123C]/5 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[5%] w-[35vw] h-[35vw] bg-[#4F46E5]/10 rounded-full blur-[100px]"
        />
        
        {/* Grid overlay sederhana */}
        <div className="absolute inset-0 opacity-5" style={{ background: 'rgba(224,75,58,0.05)' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50">
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-4"
        >
          <div className="bg-white/70 backdrop-blur-xl border border-white/30 shadow-lg rounded-full px-6 h-16 flex items-center justify-between transition-all hover:bg-white/80">
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md shadow-black/10 p-1"
              >
                <Image src={logoJne} alt="JNE Logo" width={36} height={36} className="object-contain" />
              </motion.div>
              <span className="text-xl font-bold tracking-tight">
                JNE <span className="text-[#E04B3A]">MTP.</span>
              </span>
            </div>


            <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {['Features', 'Security', 'Integrations'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="relative group">
                  <span className="relative z-10 group-hover:text-slate-900 transition-colors">{item}</span>
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-linear-to-r from-[#4F46E5] to-[#4338CA] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                 <Link 
                  href="/dashboard"
                  className="bg-[#0F172A] text-white px-6 py-2 rounded-xl font-semibold text-sm hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold px-4 py-2">
                    Sign In
                  </Link>
                  <Link 
                    href="/login"
                    className="bg-[#E04B3A] text-white px-6 py-2 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-[#E04B3A]/30 transition-all hover:scale-105 active:scale-95"
                  >
                    Login Admin
                  </Link>

                </>
              )}
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }} 
          className="max-w-7xl mx-auto text-center relative z-10"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/80 backdrop-blur-sm rounded-full text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-8 border border-slate-200 shadow-sm">
              <Sparkles size={14} className="text-primary" />
              Intelligence Driven Workforce
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.1] mb-6"
          >
            PRECISION <br />
            <span className="text-[#E04B3A]">
              ATTENDANCE.
            </span>
          </motion.h1>


          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-light"
          >
            Precision attendance tracking for JNE Martapura. 
            Powered by biometrics, verified by GPS, and analyzed by AI.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link 
              href="/login"
              className="group bg-[#E04B3A] text-white px-8 py-4 rounded-full font-semibold text-base flex items-center gap-2 hover:shadow-xl hover:shadow-[#E04B3A]/30 transition-all hover:scale-105 active:scale-95"
            >
              Access Admin Panel 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <button className="group bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-900 px-8 py-4 rounded-full font-semibold text-base hover:bg-white transition-all flex items-center gap-2 hover:shadow-lg">
              Case Study 
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>

        {/* Hero Visual — Real JNE Image Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-16 relative z-10 max-w-5xl mx-auto"
        >
          {/* Outer card */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 p-5 shadow-2xl">
            {/* Top strip: brand dots + label */}
            <div className="flex items-center gap-2 mb-4 px-1">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E04B3A]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">JNE Martapura · Attendance Platform</span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live</span>
              </div>
            </div>

            {/* Main image grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Large featured image */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="col-span-2 relative overflow-hidden rounded-2xl bg-[#CC0000] aspect-video flex items-end shadow-lg"
              >
                <Image
                  src={jneOrangPaket}
                  alt="JNE Delivery Officer"
                  fill
                  className="object-contain object-bottom"
                  sizes="(max-width:768px) 100vw, 60vw"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                <div className="relative z-10 p-4">
                  <span className="text-white text-xs font-black uppercase tracking-widest bg-white/10 backdrop-blur px-3 py-1 rounded-full">Delivery Excellence</span>
                </div>
              </motion.div>

              {/* Right column: two stacked images */}
              <div className="flex flex-col gap-3">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative overflow-hidden rounded-2xl bg-slate-100 flex-1 flex items-center justify-center p-3 shadow-md"
                >
                  <Image
                    src={jneMobil3d}
                    alt="JNE Vehicle 3D"
                    width={200}
                    height={120}
                    className="object-contain w-full h-full"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative overflow-hidden rounded-2xl bg-[#CC0000]/8 border border-[#CC0000]/15 flex-1 flex items-center justify-center p-3 shadow-md"
                >
                  <Image
                    src={jneMotor}
                    alt="JNE Motorcycle"
                    width={200}
                    height={120}
                    className="object-contain w-full h-full"
                  />
                </motion.div>
              </div>
            </div>

            {/* Bottom strip: more assets */}
            <div className="grid grid-cols-4 gap-3 mt-3">
              {[
                { src: logoDelivery,    alt: 'Delivery Logo',     bg: 'bg-slate-50' },
                { src: logoJneMegangHp, alt: 'JNE Officer HP',    bg: 'bg-[#CC0000]/5' },
                { src: orangJneSalam,   alt: 'JNE Officer Wave',  bg: 'bg-slate-50' },
                { src: jneMobilCepat,   alt: 'JNE Express Logo',  bg: 'bg-[#CC0000]/5' },
              ].map(({ src, alt, bg }, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={`relative overflow-hidden rounded-xl ${bg} flex items-center justify-center p-2 shadow-sm border border-slate-100 aspect-square`}
                >
                  <Image
                    src={src}
                    alt={alt}
                    width={100}
                    height={100}
                    className="object-contain w-full h-full"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white/50 backdrop-blur-sm border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Latency', val: '120ms', icon: Zap },
              { label: 'Security', val: 'AES-256', icon: Shield },
              { label: 'Uptime', val: '99.9%', icon: Clock },
              { label: 'Verified', val: '10k+', icon: CheckCircle2 }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i*0.1 }}
                viewport={{ once: true }}
                className="space-y-2"
              >
                <div className="flex justify-center">
                  <stat.icon size={28} className="text-primary/30" />
                </div>
                <p className="text-3xl font-bold text-[#0F172A]">{stat.val}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.h2 {...fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
               Unified JNE <br /> 
               <span className="text-[#E04B3A]">Core Ecosystem.</span>
            </motion.h2>

            <motion.p {...fadeInUp} transition={{ delay: 0.1 }} className="text-lg text-slate-500 max-w-2xl mx-auto">
               More than just attendance. A complete ecosystem built for the scale and demands of JNE's logistics network.
            </motion.p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Shield, title: 'Biometric Shield', gradient: 'from-indigo-500 to-indigo-600', desc: 'Face recognition with liveness detection.' },
              { icon: MapPin, title: 'Domain Geofencing', gradient: 'from-primary to-primary/80', desc: 'Restrict check-ins to operational zones.' },
              { icon: BarChart3, title: 'Data Intelligence', gradient: 'from-emerald-500 to-emerald-600', desc: 'Actionable reports from attendance logs.' },
              { icon: Database, title: 'Cloud Integrity', gradient: 'from-blue-500 to-blue-600', desc: 'High availability and sync speed.' },
              { icon: Smartphone, title: 'Mobile First', gradient: 'from-amber-500 to-amber-600', desc: 'Optimized for field staff.' },
              { icon: Globe, title: 'Remote Ops', gradient: 'from-slate-700 to-slate-900', desc: 'Coordinate teams across branches.' }
            ].map((f, i) => (
              <motion.div 
                key={i}
                variants={scaleIn}
                whileHover={{ y: -8 }}
                className="group relative p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className={`w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                  <f.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-semibold text-primary uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight size={12} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            {...scaleIn}
            className="bg-[#0F172A] rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
              transition={{ duration: 15, repeat: Infinity }}
              className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
            />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to evolve?</h2>
              <p className="text-white/40 text-lg max-w-xl mx-auto mb-8">
                Secure your operations with the most advanced attendance system in the JNE network.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/login"
                  className="group bg-white text-[#0F172A] px-8 py-4 rounded-full font-semibold hover:bg-slate-100 transition-all hover:shadow-xl hover:scale-105 flex items-center gap-2"
                >
                  Launch Dashboard
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  View Network Status 
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md shadow-black/10 p-1.5 border border-slate-100">
                  <Image src={logoJne} alt="JNE Logo" width={36} height={36} className="object-contain" />
                </div>
                <span className="text-2xl font-bold tracking-tight">JNE MTP.</span>
              </div>

              <p className="text-slate-400 text-base max-w-md mb-8">
                Advancing the courier experience through intelligent workforce monitoring. Martapura Branch Internal System.
              </p>
              <div className="flex gap-3">
                {[Shield, Users, MapPin, Zap].map((Icon, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -3 }}
                    className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#E04B3A] hover:bg-white hover:shadow transition-all cursor-pointer"
                  >
                    <Icon size={18} />
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-6">Navigation</h4>
              <ul className="space-y-3 text-slate-900 font-medium">
                <li className="hover:text-primary cursor-pointer transition-colors">Admin Core</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Employee App</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Security Rules</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-6">Operations</h4>
              <ul className="space-y-3 text-slate-900 font-medium">
                <li className="hover:text-[#E04B3A] cursor-pointer transition-colors">Support Center</li>
                <li className="hover:text-[#E04B3A] cursor-pointer transition-colors">API Docs</li>
                <li className="hover:text-[#E04B3A] cursor-pointer transition-colors">Privacy</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200 gap-4">
            <div className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              © 2025 JNE Martapura Branch
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Global Presence Active</span>
              </div>
              <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Version 4.2.0
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        ::selection {
          background: #E04B3A;
          color: white;
        }
      `}</style>
    </div>
  );
}