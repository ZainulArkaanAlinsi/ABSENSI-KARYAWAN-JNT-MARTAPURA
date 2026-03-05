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
      {/* ════════ FLOATING NAV ════════ */}
      <nav className="fixed top-6 w-full z-100 flex justify-center px-4">
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease }}
          className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 rounded-4xl border border-white/20 shadow-2xl backdrop-blur-2xl"
          style={{ background: 'rgba(255,255,255,0.75)', maxWidth: '900px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}
        >
          {/* logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center p-2 shadow-lg" style={{ background: RED }}>
              <Image src={logoJne} alt="JNE" width={24} height={24} className="object-contain brightness-0 invert" />
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: RED }}>Martapura</p>
              <p className="text-sm font-black tracking-tighter" style={{ color: TEXT_MAIN }}>Connecting Happiness</p>
            </div>
          </div>

          {/* links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { label: 'Layanan', href: '#layanan' },
              { label: 'Profil', href: '#profil' },
              { label: 'Kontak', href: '#kontak' }
            ].map(({ label, href }) => (
              <a key={label} href={href} className="px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold rounded-full transition-all hover:bg-black/5" style={{ color: TEXT_SUB }}>
                {label}
              </a>
            ))}
          </div>

          {/* cta */}
          <Link href={user ? '/dashboard' : '/login'}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-black text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
            style={{ background: RED }}>
            {user ? 'DASHBOARD' : 'LOGIN'} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </nav>

      {/* ════════ HERO ════════ */}
      <section ref={heroRef} className="relative pt-32 sm:pt-48 pb-20 px-4 overflow-hidden" style={{ background: BG_PAGE }}>
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] pointer-events-none opacity-20"
          style={{ background: `radial-gradient(circle, ${RED_LIGHT} 0%, transparent 70%)`, filter: 'blur(80px)' }} />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-red-100 shadow-sm"
            style={{ background: 'white', color: RED }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            Connecting Happiness · Martapura
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease }}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-8"
            style={{ color: TEXT_MAIN }}
          >
            Logistik <span className="italic" style={{ color: RED }}>Cepat</span><br />
            Tanpa <span style={{ color: TEXT_MUTED }}>Hambatan.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease }}
            className="text-base sm:text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto"
            style={{ color: TEXT_SUB }}
          >
            Layanan pengiriman terpercaya dari JNE Martapura. Kami memastikan setiap paket Anda sampai dengan aman, tepat waktu, dan penuh kebahagiaan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="#layanan"
              className="w-full sm:w-auto px-10 py-4 rounded-2xl text-sm font-black text-white transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-red-500/30"
              style={{ background: RED }}>
              LIHAT LAYANAN
            </a>
            <a href="https://wa.me/6285167394246" target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto px-10 py-4 rounded-2xl text-sm font-black border-2 transition-all hover:bg-black/5 active:scale-95"
              style={{ borderColor: BORDER, color: TEXT_MAIN }}>
              WHATSAPP KAMI
            </a>
          </motion.div>

          {/* Floating Assets Layout */}
          <div className="relative mt-24 max-w-4xl mx-auto h-[300px] sm:h-[450px]">
            {/* Main Image Center */}
            <motion.div
              style={{ y: imgY }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <div className="relative w-full h-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-white/20">
                <div className="absolute inset-0 z-0 bg-linear-to-br from-red-600 to-red-800" />
                <Image src={jneOrangPaket} alt="JNE Hero" fill className="object-contain object-bottom scale-110" priority />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent h-full" />
                
                {/* Overlay Badge */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Kurir Terpercaya</p>
                    <p className="text-white text-lg font-black tracking-tight">JNE Martapura Team</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Live Status</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Decorative Floating Cards */}
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.5, ease }}
              className="absolute -left-4 top-1/4 hidden md:block z-20 p-5 rounded-3xl bg-white shadow-2xl border border-slate-100"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                <Truck size={20} className="text-red-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pengiriman</p>
              <p className="text-sm font-black text-slate-800">JNE Trucking</p>
            </motion.div>

            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.6, ease }}
              className="absolute -right-4 top-1/2 hidden md:block z-20 p-5 rounded-3xl bg-white shadow-2xl border border-slate-100"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <Clock size={20} className="text-emerald-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kecepatan</p>
              <p className="text-sm font-black text-slate-800">Yakin Esok Sampai</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════ BENTO CORE ════════ */}
      <section className="py-20 px-4" style={{ background: BG_SOFT }}>
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Section Heading */}
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter" style={{ color: TEXT_MAIN }}>
              <span className="opacity-40">The</span> Bento <span style={{ color: RED }}>Experience.</span>
            </h2>
            <p className="mt-4 text-base font-bold uppercase tracking-widest" style={{ color: TEXT_MUTED }}>
              Layanan Logistik Masadepan
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 pb-20">
            
            {/* Bento 1: About Card (Large) */}
            <motion.div 
              {...fadeUp}
              transition={{ delay: 0.1 }}
              id="profil"
              className="md:col-span-6 lg:col-span-8 p-10 rounded-[3rem] text-white flex flex-col justify-between min-h-[400px] group overflow-hidden relative"
              style={{ background: `linear-gradient(135deg, ${RED} 0%, ${RED_DARK} 100%)` }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Image src={logoJne} alt="JNE" width={200} height={200} className="object-contain" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Star size={22} className="text-white" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">PT. Tiki Jalur Nugraha Ekakurir</p>
                      <p className="text-2xl font-black tracking-tight">JNE MARTAPURA</p>
                   </div>
                </div>
                <h3 className="text-3xl sm:text-5xl font-black leading-tight mb-6 max-w-xl">
                  Connecting Happiness<br />
                  <span className="italic opacity-60 font-medium text-4xl sm:text-5xl">to every corner.</span>
                </h3>
              </div>
              
              <div className="relative z-10 flex flex-wrap gap-4 mt-auto">
                {['LOGISTIK', 'EKSPRES', 'KEPERCAYAAN', 'NASIONAL'].map(tag => (
                   <span key={tag} className="px-5 py-2 rounded-full text-[10px] font-black bg-white/15 backdrop-blur-sm border border-white/10">{tag}</span>
                ))}
              </div>
            </motion.div>

            {/* Bento 2: Stats (Tall) */}
            <motion.div 
              {...fadeUp}
              transition={{ delay: 0.2 }}
              className="md:col-span-3 lg:col-span-4 p-10 rounded-[3rem] bg-white border border-slate-100 flex flex-col justify-between min-h-[400px] shadow-sm"
            >
               <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10" style={{ color: RED }}>Performance.</h4>
                  <div className="space-y-12">
                     {stats.map((s, i) => (
                        <div key={i} className="group">
                           <p className="text-4xl font-black tracking-tighter" style={{ color: TEXT_MAIN }}>{s.val}</p>
                           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 group-hover:text-red-600 transition-colors">{s.label}</p>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="pt-6 border-t border-slate-50">
                  <p className="text-[10px] font-bold leading-relaxed text-slate-400 italic">
                    Keandalan layanan JNE telah terverifikasi selama puluhan tahun melayani negeri.
                  </p>
               </div>
            </motion.div>

            {/* Bento 3: Services Grid (Medium) */}
            <motion.div 
              {...fadeUp}
              transition={{ delay: 0.3 }}
              id="layanan"
              className="md:col-span-3 lg:col-span-4 p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm"
            >
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8" style={{ color: TEXT_MUTED }}>Layanan Unggulan</h4>
               <div className="grid grid-cols-2 gap-3">
                  {services.map((svc, i) => (
                     <div key={i} className="p-5 rounded-3xl border border-slate-50 transition-all hover:border-red-100 hover:shadow-xl hover:shadow-red-500/5 cursor-default group"
                        style={{ background: '#FAFAFA' }}>
                        <svc.icon size={20} className="mb-4 transition-transform group-hover:scale-110" style={{ color: svc.color }} />
                        <p className="text-xs font-black tracking-tight mb-1" style={{ color: TEXT_MAIN }}>{svc.code}</p>
                        <p className="text-[10px] font-bold text-slate-400 leading-tight">{svc.desc}</p>
                     </div>
                  ))}
               </div>
            </motion.div>

            {/* Bento 4: Live Badge (Small) */}
            <motion.div 
              {...fadeUp}
              transition={{ delay: 0.4 }}
              className="md:col-span-3 lg:col-span-4 p-8 rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center text-center group transition-colors"
              style={{ borderColor: EMERALD + '40', background: EMERALD_L }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = EMERALD}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = EMERALD + '40'}
            >
               <div className="w-16 h-16 rounded-3xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: EMERALD }}>
                  <Zap size={28} className="text-white" />
               </div>
               <p className="text-lg font-black tracking-tight" style={{ color: TEXT_MAIN }}>Sistem Terpadu</p>
               <p className="text-[11px] font-bold mt-2 leading-relaxed" style={{ color: TEXT_SUB }}>
                 Integrasi API real-time menjamin data paket Anda akurat setiap detik.
               </p>
               <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-emerald-100 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live Sync</span>
               </div>
            </motion.div>

            {/* Bento 5: Map/Location (Wide) */}
            <motion.div 
              {...fadeUp}
              transition={{ delay: 0.5 }}
              className="md:col-span-6 lg:col-span-4 rounded-[3rem] overflow-hidden group border border-slate-100 bg-white shadow-sm flex flex-col"
            >
               <div className="p-8 pb-0">
                  <div className="flex items-center gap-2 mb-6 text-red-600">
                     <MapPin size={16} />
                     <p className="text-[11px] font-black uppercase tracking-[0.3em]">MARTAPURA HQ</p>
                  </div>
                  <h4 className="text-2xl font-black tracking-tighter" style={{ color: TEXT_MAIN }}>
                    Jl. A. Yani Km 38.5
                  </h4>
                  <p className="text-[11px] font-bold text-slate-400 mt-2">Cindai Alus, Seberang Polres Banjar</p>
               </div>
               <div className="mt-auto p-4 overflow-hidden relative h-40 group-hover:h-48 transition-all">
                  <Image src={petaJneIndonesia} alt="Map" fill className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all" />
                  <div className="absolute inset-0 bg-linear-to-t from-white via-transparent h-full" />
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