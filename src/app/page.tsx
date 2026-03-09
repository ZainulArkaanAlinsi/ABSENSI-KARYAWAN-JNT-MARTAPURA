'use client';

import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  MapPin, Clock, Package, Truck, Zap, ArrowRight, Shield,
  CheckCircle2, Star, ChevronDown, MessageCircle, Navigation,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRef, useState } from 'react';

const logoJne         = '/logo-jne.svg';
const jneOrangPaket   = '/JNE-logo-orang-paket.svg';
const petaJneIndonesia     = '/peta-jne-indonesia.svg';
const gerakanBersama      = '/jne-35-gerakan-bersama.svg';
const freeDelivery      = '/free-delivery.svg';
const logoJneMegangHp = '/logo-jne-megang-hp.svg';

// ── Brand tokens ──────────────────────────────────────────────
const RED        = '#CC0000';
const RED_DARK   = '#990000';
const RED_LIGHT  = '#FFE5E5';
const RED_MID    = '#FF3333';
const EMERALD    = '#10B981';
const EMERALD_L  = '#ECFDF5';
const BG_PAGE    = '#FFFFFF';
const BG_SOFT    = '#FAFAFA';
const TEXT_MAIN  = '#0F172A';
const TEXT_SUB   = '#334155';
const TEXT_MUTED = '#64748B';
const BORDER     = '#E2E8F0';

const ease = [0.16, 1, 0.3, 1] as any;

const fadeUp = {
  initial:     { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-40px' },
  transition:  { duration: 0.8, ease },
};

// ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user } = useAuth();
  const heroRef  = useRef(null);
  const [open, setOpen] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imgY  = useTransform(scrollYProgress, [0, 1], [0, 60]);

  // ── data ──────────────────────────────────────────────────
  const services = [
    { code: 'YES', name: 'Yakin Esok Sampai', icon: Zap, color: '#10B981', desc: 'Tiba esok hari dijamin aman.' },
    { code: 'REG', name: 'JNE Reguler', icon: Package, color: '#CC0000', desc: 'Layanan andalan se-Indonesia.' },
    { code: 'JTR', name: 'JNE Trucking', icon: Truck, color: '#CC0000', desc: 'Kargo hemat via darat & laut.' },
    { code: 'SS',  name: 'Super Speed', icon: Zap, color: '#10B981', desc: 'Maksimal 24 jam sampai tujuan.' },
  ];

  const stats = [
    { val: '24/7', label: 'Monitoring' },
    { val: '100%', label: 'Terintegrasi' },
    { val: '0.2%', label: 'Asuransi' },
  ];

  const faqs = [
    { q: 'Apakah ada layanan pick-up ke rumah?', a: 'Ya, JNE Martapura menyediakan layanan jemput paket gratis. Hubungi WA kami untuk jadwal.' },
    { q: 'Bagaimana cara melacak kiriman?', a: 'Lacak real-time 24 jam di website resmi JNE dengan nomor resi Anda.' },
    { q: 'JNE Martapura buka hari Minggu?', a: 'Kantor fisik libur Minggu, namun layanan YES tetap diproses dan diantarkan.' },
  ];

  // ── render ────────────────────────────────────────────────
  return (
    <div style={{ background: BG_PAGE, color: TEXT_MAIN, fontFamily: "'Inter','Segoe UI',sans-serif", overflowX: 'hidden' }}>
      {/* ════════ NEXUS PILL NAV ════════ */}
      <nav className="fixed top-8 w-full z-100 flex justify-center px-4">
        <motion.div
          initial={{ y: -60, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease }}
          className="flex items-center justify-between px-6 h-18 rounded-[2.5rem] border border-white/40 shadow-2xl backdrop-blur-3xl noisy-glass"
          style={{ maxWidth: '1000px', width: '100%' }}
        >
          {/* Brand Nexus */}
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.7, ease }}
              className="w-11 h-11 rounded-2xl flex items-center justify-center p-2 shadow-xl bg-red-600 shadow-red-500/20"
            >
              <Image src={logoJne} alt="JNE" width={28} height={28} className="object-contain brightness-0 invert" />
            </motion.div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 leading-none mb-1">Nexus</p>
              <p className="text-sm font-black tracking-tighter text-slate-900 leading-none">JNE Martapura</p>
            </div>
          </div>

          {/* Liquid Links */}
          <div className="flex items-center gap-2 bg-slate-900/5 p-1.5 rounded-3xl border border-slate-900/5">
            {[
              { label: 'SERVICES', href: '#layanan' },
              { label: 'EQUIPMENT', href: '#profil' },
              { label: 'SUPPORT', href: '#kontak' }
            ].map(({ label, href }) => (
              <motion.a 
                key={label} 
                href={href}
                whileHover={{ y: -2 }}
                className="px-5 py-2 text-[10px] font-black rounded-2xl transition-all hover:bg-white hover:shadow-lg text-slate-500 hover:text-red-600 tracking-widest"
              >
                {label}
              </motion.a>
            ))}
          </div>

          {/* Portal Acccess */}
          <Link href={user ? '/dashboard' : '/login'}
            className="flex items-center gap-3 px-8 h-12 rounded-2xl text-[10px] font-black text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-500/30 bg-red-600 tracking-[0.2em]"
          >
            {user ? 'DASHBOARD' : 'LOGIN PORTAL'} 
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight size={14} />
            </motion.div>
          </Link>
        </motion.div>
      </nav>

      {/* ════════ HERO ════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center px-4 overflow-hidden pt-20">
        {/* Nexus Mesh Background */}
        <div className="nexus-mesh" />
        
        {/* Floating Decorative Elements */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Asymmetrical Copy */}
          <div className="lg:col-span-7 text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/40 backdrop-blur-md border border-white/20 shadow-sm mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">NexGen Logistics System</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease }}
              className="text-6xl sm:text-8xl md:text-[8rem] lg:text-[10rem] mixed-weight-heading leading-[0.8] mb-12 tracking-[-0.04em]"
            >
              Logical.<br />
              <b>Nexus</b><br />
              <span className="font-black italic text-red-600">Sync.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease }}
              className="text-lg sm:text-xl text-slate-500 max-w-xl leading-relaxed mb-12"
            >
              Arsitektur pengiriman masa depan dari <b>JNE Martapura</b>. 
              Kecepatan nexus yang terintegrasi penuh dengan keamanan AES-256.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease }}
              className="flex flex-wrap gap-5"
            >
              <Link href="/login"
                className="px-10 py-5 rounded-3xl bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-red-500/40 hover:scale-105 active:scale-95 transition-all outline-none"
              >
                MULAI SEKARANG
              </Link>
              <a href="#layanan"
                className="px-10 py-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/40 text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-slate-200/50"
              >
                EKSPLORASI LAYANAN
              </a>
            </motion.div>
          </div>

          {/* Right Column: Floating Asymmetrical Visuals */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
              {/* Main Floating Card */}
              <motion.div
                style={{ y: imgY }}
                className="absolute inset-x-0 bottom-10 z-20"
              >
                <div className="noisy-glass p-8 rounded-[3.5rem] shadow-2xl border border-white/50 overflow-hidden group">
                  <div className="absolute inset-0 bg-linear-to-br from-red-600/10 to-transparent" />
                  <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden mb-6 shadow-inner bg-slate-100/50">
                    <Image src={jneOrangPaket} alt="JNE Hero" fill className="object-contain object-bottom scale-110 group-hover:scale-115 transition-transform duration-700" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Integration</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">Nexus Node #102</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                      <Zap className="text-white fill-current" size={16} />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Overlapping Decorative Cards */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, delay: 0.6, ease }}
                className="absolute -right-6 top-10 z-30 p-6 rounded-3xl bg-white shadow-2xl border border-slate-100 max-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Clock size={16} />
                  </div>
                  <span className="text-[10px] font-black text-slate-900 uppercase">On-Time</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '94%' }}
                    transition={{ duration: 2, delay: 1 }}
                    className="h-full bg-emerald-500" 
                  />
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-2">SLA Integrity: 94.2%</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.8, ease }}
                className="absolute -left-10 top-0 z-10 w-48 h-48 rounded-[2.5rem] bg-slate-900 p-6 flex flex-col justify-between shadow-2xl"
              >
                <Shield className="text-blue-500" size={32} />
                <div>
                   <p className="text-white font-black text-sm tracking-tight leading-none mb-1">Encrypted</p>
                   <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Node Protection</p>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════ LIQUID BENTO CORE ════════ */}
      <section className="py-32 px-4 relative overflow-hidden" style={{ background: BG_SOFT }}>
        {/* Subtle mesh for the section */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          
          {/* Section Heading: Editorial Style */}
          <motion.div {...fadeUp} className="mb-24">
            <h2 className="text-5xl sm:text-7xl mixed-weight-heading leading-tight max-w-2xl">
              Logistik <b>Masa Depan</b><br />
              <span className="text-red-600">Terintegrasi Nexus.</span>
            </h2>
            <div className="h-1 w-24 bg-red-600 mt-8 rounded-full" />
          </motion.div>

          {/* Clean Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
            
            {/* Box 1: Core Vision (Top Emphasis) */}
             <motion.div 
                {...fadeUp}
                id="profil"
                style={{ background: `linear-gradient(135deg, ${RED} 0%, ${RED_DARK} 100%)` }}
                className="md:col-span-8 p-12 lg:p-16 rounded-[3rem] text-white relative overflow-hidden flex flex-col justify-end min-h-[440px] group shadow-2xl"
             >
               <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/4 -translate-y-1/4 scale-150 rotate-12 group-hover:rotate-6 transition-transform duration-1000">
                  <Image src={logoJne} alt="JNE" width={400} height={400} className="object-contain" />
               </div>
               
               <div className="relative z-10 max-w-2xl">
                  <div className="flex items-center gap-4 mb-10">
                     <Star size={24} className="text-white fill-white animate-pulse" />
                     <span className="text-xs font-black uppercase tracking-[0.4em] text-white/60">Legacy Integrity</span>
                  </div>
                  <h3 className="text-4xl sm:text-6xl font-black leading-[1.1] mb-8 tracking-tighter">
                     Connecting <span className="italic opacity-60">Humanity</span> through Logistics.
                  </h3>
                  <p className="text-lg text-white/70 leading-relaxed mb-10 font-medium">
                     Sejak 1990, JNE telah menjadi arteri ekonomi nasional. Martapura Branch kini hadir dengan <b>Nexus Core</b> untuk pengiriman yang lebih intelijen.
                  </p>
                  <div className="flex flex-wrap gap-3">
                     {['DYNAMIC', 'SECURE', 'SCALABLE'].map(t => (
                        <span key={t} className="px-6 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black tracking-widest">{t}</span>
                     ))}
                  </div>
               </div>
            </motion.div>

            {/* Box 2: Stats Vertical (Thin / High Performance) */}
            <motion.div 
              {...fadeUp}
              transition={{ delay: 0.2 }}
              className="md:col-span-4 p-12 rounded-[4rem] bg-slate-900 text-white flex flex-col justify-between shadow-2xl"
            >
               <div className="space-y-16">
                  {stats.map((s, i) => (
                    <div key={i} className="group cursor-context-menu">
                       <p className="text-5xl font-black tracking-tighter mb-2 group-hover:text-red-500 transition-colors">{s.val}</p>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-white transition-colors">{s.label}</p>
                    </div>
                  ))}
               </div>
               <div className="pt-10 border-t border-slate-800 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center">
                     <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enterprise Verified</p>
               </div>
            </motion.div>

            {/* Box 3: Services Hub (Floating Glass Style) */}
            <motion.div 
              {...fadeUp}
              transition={{ delay: 0.3 }}
              id="layanan"
              className="md:col-span-5 p-10 rounded-[3.5rem] noisy-glass border border-white/60 shadow-xl flex flex-col justify-between"
            >
               <div>
                  <div className="flex items-center justify-between mb-10">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Services Hub</h4>
                     <Zap size={16} className="text-red-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     {services.map((svc, i) => (
                        <motion.div 
                           key={i} 
                           whileHover={{ scale: 1.05, y: -5 }}
                           className="p-6 rounded-3xl bg-white/40 border border-white flex flex-col gap-4 shadow-sm hover:shadow-xl hover:bg-white transition-all group"
                        >
                           <svc.icon size={22} style={{ color: svc.color }} className="group-hover:scale-110 transition-transform" />
                           <p className="text-sm font-black text-slate-900 tracking-tight">{svc.code}</p>
                        </motion.div>
                     ))}
                  </div>
               </div>
            </motion.div>

            {/* Box 4: Interactive Map/Node Focus */}
            <motion.div 
              {...fadeUp}
              transition={{ delay: 0.4 }}
              className="md:col-span-7 rounded-[4rem] overflow-hidden relative group min-h-[350px] shadow-2xl bg-white"
            >
               <div className="absolute inset-0 z-0">
                  <Image src={petaJneIndonesia} alt="Map" fill className="object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-40 transition-all duration-1000" />
               </div>
               <div className="relative z-10 p-12 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                        <MapPin size={20} />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Node Location: Martapura</p>
                  </div>
                  <div className="mt-auto">
                     <h3 className="text-3xl font-black text-slate-900 leading-tight mb-2 italic">Nexus Headquarters</h3>
                     <p className="text-sm font-bold text-slate-400">Banjarbaru Selatan, Martapura Crossing</p>
                     
                     <Link href="/login" className="inline-flex items-center gap-2 mt-8 text-[10px] font-black uppercase tracking-widest text-red-600 hover:gap-4 transition-all">
                        Route Details <ArrowRight size={14} />
                     </Link>
                  </div>
               </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ════════ MODERN FAQ ════════ */}
      <section className="py-32 px-4" style={{ background: '#fff' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
           <div>
              <motion.div {...fadeUp} className="sticky top-32">
                 <h3 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none mb-6" style={{ color: TEXT_MAIN }}>
                    Hal yang Sering<br />
                    <span style={{ color: RED }}>Ditanyakan.</span>
                 </h3>
                 <p className="text-lg font-medium leading-relaxed" style={{ color: TEXT_SUB }}>
                    Temukan jawaban cepat untuk pertanyaan umum mengenai layanan kami. Punya pertanyaan lain? Tim kami siap membantu Anda.
                 </p>
                 <div className="mt-10 flex gap-4">
                    <a href="https://wa.me/6285167394246" 
                       className="px-8 py-3.5 rounded-2xl text-xs font-black text-white shadow-xl shadow-red-500/20"
                       style={{ background: RED }}>
                       TANYA CS KAMI
                    </a>
                 </div>
              </motion.div>
           </div>
           
           <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div 
                   key={i} 
                   {...fadeUp} 
                   transition={{ delay: i * 0.1 }}
                   className="group p-8 rounded-[2.5rem] border border-slate-50 hover:border-red-100 hover:bg-slate-50 transition-all cursor-pointer"
                   onClick={() => setOpen(open === i ? null : i)}
                >
                   <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-black tracking-tight" style={{ color: TEXT_MAIN }}>{faq.q}</p>
                      <ChevronDown size={18} className={`transition-transform duration-500 ${open === i ? 'rotate-180 text-red-600' : 'text-slate-300'}`} />
                   </div>
                   <AnimatePresence>
                     {open === i && (
                        <motion.div
                           initial={{ height: 0, opacity: 0, marginTop: 0 }}
                           animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                           exit={{ height: 0, opacity: 0, marginTop: 0 }}
                           className="overflow-hidden"
                        >
                           <p className="text-sm leading-relaxed" style={{ color: TEXT_SUB }}>{faq.a}</p>
                        </motion.div>
                     )}
                   </AnimatePresence>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* ════════ KONTAK / FOOTER COMBO ════════ */}
      <footer id="kontak" className="pt-20 pb-10 px-4" style={{ background: '#0F172A' }}>
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
             
             {/* Brand Column */}
             <div className="lg:col-span-5">
                <div className="flex items-center gap-3 mb-10">
                   <div className="w-12 h-12 rounded-2xl flex items-center justify-center p-2.5" style={{ background: RED }}>
                      <Image src={logoJne} alt="JNE" width={30} height={30} className="object-contain brightness-0 invert" />
                   </div>
                   <div>
                      <h4 className="text-2xl font-black text-white tracking-tighter">JNE MARTAPURA</h4>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Connecting Happiness</p>
                   </div>
                </div>
                <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none mb-10">
                   Melayani dengan<br />
                   <span className="text-red-600">Hati & Efisiensi.</span>
                </h2>
                <div className="space-y-6">
                   <div className="flex items-start gap-4 p-5 rounded-3xl bg-white/5 border border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                         <Phone size={18} className="text-red-500" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Hubungi Kami</p>
                         <p className="text-white font-bold">+62 851-0041-1129</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4 p-5 rounded-3xl bg-white/5 border border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                         <MessageCircle size={18} className="text-emerald-500" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">WhatsApp CS</p>
                         <p className="text-white font-bold">0851-6739-4246</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Links & Navigation */}
             <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10">
                <div>
                   <h5 className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mb-8">Eksplorasi</h5>
                   <ul className="space-y-4">
                      {['Beranda', 'Layanan', 'Profil', 'Kontak'].map(item => (
                         <li key={item}>
                            <a href={`#${item.toLowerCase()}`} className="text-sm font-bold text-white/60 hover:text-red-500 transition-colors uppercase tracking-widest">{item}</a>
                         </li>
                      ))}
                   </ul>
                </div>
                <div>
                   <h5 className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mb-8">Akses Admin</h5>
                   <ul className="space-y-4">
                      <li>
                         <Link href="/login" className="text-sm font-black text-white hover:text-red-500 transition-colors uppercase tracking-widest">Portal Login</Link>
                      </li>
                      <li>
                         <a href="/forgot-password" className="text-sm font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">Lupa Password</a>
                      </li>
                   </ul>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <h5 className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mb-8">Jam Layanan</h5>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                       <p className="text-xs font-black text-white mb-2">SENIN — SABTU</p>
                       <p className="text-lg font-black text-red-500">09.30 — 21.00</p>
                       <p className="text-[10px] font-bold text-white/40 mt-4 italic">Minggu & Hari Libur Nasional Layanan Drop Tetap Buka.</p>
                    </div>
                </div>
             </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
             <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
                © 2026 JNE Martapura Branch. All Rights Reserved.
             </p>
             <div className="flex gap-8">
                {['Facebook', 'Instagram', 'Twitter'].map(social => (
                   <a key={social} href="#" className="text-[10px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest">{social}</a>
                ))}
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}