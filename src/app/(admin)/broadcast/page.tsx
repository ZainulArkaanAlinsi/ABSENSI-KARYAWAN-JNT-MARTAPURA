'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Users, 
  User, 
  Megaphone, 
  Bell, 
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Globe,
  Zap,
  Clock
} from 'lucide-react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GlassCard, InteractiveButton } from '@/components/ui/Interactive';
import { toast } from 'sonner';

export default function BroadcastPage() {
  const [target, setTarget] = useState<'all' | 'specific'>('all');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [recentBroadcasts, setRecentBroadcasts] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };
    
    const fetchRecent = async () => {
      const q = query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'), limit(5));
      const snap = await getDocs(q);
      setRecentBroadcasts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchUsers();
    fetchRecent();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    
    setLoading(true);
    setStatus('idle');

    try {
      const payload = {
        title,
        message,
        createdAt: serverTimestamp(),
        sender: 'Admin JNE Martapura Hub',
        type: 'broadcast',
        priority: 'high'
      };

      if (target === 'all') {
        // Global broadcast — mobile listens to `broadcasts` collection
        await addDoc(collection(db, 'broadcasts'), { ...payload, target: 'all' });
      } else {
        if (!selectedUser) return;

        const targetUser = users.find(u => u.id === selectedUser);

        // Personal notification — mobile listens to `userNotifications` filtered by userId
        await addDoc(collection(db, 'userNotifications'), {
          ...payload,
          userId: selectedUser,
          targetName: targetUser?.name ?? selectedUser,
          isRead: false,
        });

        // Also add to broadcasts for history visibility in this panel
        await addDoc(collection(db, 'broadcasts'), {
          ...payload,
          target: 'specific',
          targetUserId: selectedUser,
          targetName: targetUser?.name ?? selectedUser,
        });
      }

      // Clear form
      setTitle('');
      setMessage('');
      setSelectedUser('');
      setStatus('success');
      toast.success('Pesan berhasil dipublikasikan ke Nexus App & Web!');
      
      // Refresh recent
      const q = query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'), limit(5));
      const snap = await getDocs(q);
      setRecentBroadcasts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast.error('Gagal mengirim broadcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 -m-10 min-h-screen overflow-hidden">
      
      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
        
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="px-3 py-1 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-600 text-[9px] font-black uppercase tracking-widest animate-pulse">Broadcast Engine</div>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Nexus Communications</span>
            </div>
            <h1 className="text-5xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">
              Communication <span className="text-orange-600">Hub</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* ── FORM SECTION ── */}
          <div className="xl:col-span-8">
            <GlassCard className="p-8 md:p-12 border-none bg-white/5 dark:bg-slate-900/40 relative overflow-hidden group">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-600/5 blur-[100px] rounded-full group-hover:bg-orange-600/10 transition-all duration-1000" />
              
              <form onSubmit={handleSend} className="space-y-10 relative z-10">
                {/* Target Selection */}
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Target Audience</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                      type="button"
                      onClick={() => setTarget('all')}
                      className={`flex items-center gap-6 p-6 rounded-2xl border-2 transition-all duration-500 ${
                        target === 'all' 
                          ? 'border-orange-600 bg-orange-600/10 text-orange-600 shadow-xl shadow-orange-600/10 scale-[1.02]' 
                          : 'border-white/5 bg-black/20 text-slate-500 hover:text-white hover:bg-black/40'
                      }`}
                    >
                      <div className={`p-4 rounded-xl ${target === 'all' ? 'bg-orange-600 text-white' : 'bg-white/5'}`}>
                        <Users size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-black uppercase text-[11px] tracking-widest">Broadcast Global</p>
                        <p className="text-[9px] font-bold opacity-60">Semua Kurir & Personnel</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTarget('specific')}
                      className={`flex items-center gap-6 p-6 rounded-2xl border-2 transition-all duration-500 ${
                        target === 'specific' 
                          ? 'border-orange-600 bg-orange-600/10 text-orange-600 shadow-xl shadow-orange-600/10 scale-[1.02]' 
                          : 'border-white/5 bg-black/20 text-slate-500 hover:text-white hover:bg-black/40'
                      }`}
                    >
                      <div className={`p-4 rounded-xl ${target === 'specific' ? 'bg-orange-600 text-white' : 'bg-white/5'}`}>
                        <User size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-black uppercase text-[11px] tracking-widest">Pesan Spesifik</p>
                        <p className="text-[9px] font-bold opacity-60">Pilih Individu Kurir</p>
                      </div>
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {target === 'specific' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Pilih Penerima</label>
                      <div className="relative">
                        <select
                          value={selectedUser}
                          onChange={(e) => setSelectedUser(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-2xl py-5 px-8 text-sm font-black text-white appearance-none focus:ring-4 focus:ring-orange-600/20 transition-all cursor-pointer outline-none uppercase italic"
                        >
                          <option value="" className="bg-slate-900">-- PILIH NAMA KURIR --</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id} className="bg-slate-900">{u.name || u.email}</option>
                          ))}
                        </select>
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                          <Search size={18} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Judul Pesan</label>
                    <input
                      type="text"
                      placeholder="Contoh: BRIEFING PAGI"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-2xl py-5 px-8 text-sm font-black text-white placeholder:opacity-20 focus:ring-4 focus:ring-orange-600/20 transition-all outline-none uppercase italic"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Priority Level</label>
                    <div className="flex gap-4">
                       <div className="flex-1 py-4 bg-orange-600/10 border border-orange-600/20 rounded-2xl flex items-center justify-center gap-3 text-orange-600">
                          <Zap size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">High Priority</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Konten Pesan</label>
                  <textarea
                    placeholder="Tuliskan instruksi atau informasi penting disini..."
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-6 px-8 text-sm font-black text-white placeholder:opacity-20 focus:ring-4 focus:ring-orange-600/20 transition-all resize-none outline-none leading-relaxed italic"
                  />
                </div>

                <InteractiveButton
                  disabled={loading || !title || !message || (target === 'specific' && !selectedUser)}
                  className="w-full h-20 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-6 transition-all shadow-2xl shadow-orange-600/40 hover:-translate-y-1 active:scale-95 disabled:bg-slate-800 disabled:shadow-none disabled:text-slate-500 group"
                >
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      <Send size={20} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                      Kirim Notifikasi Push
                    </>
                  )}
                </InteractiveButton>

                <AnimatePresence>
                  {status === 'success' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-5 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                      <CheckCircle2 size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Pesan Berhasil Dipublikasikan ke Nexus App & Web!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </GlassCard>
          </div>

          {/* ── SIDEBAR INFO ── */}
          <div className="xl:col-span-4 space-y-8">
            <GlassCard className="p-10 border-none bg-orange-600 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[80px] -mr-20 -mt-20" />
               <h3 className="text-lg font-black italic uppercase tracking-tighter mb-8 relative">Push Engine</h3>
               <div className="space-y-8 relative">
                  <div className="flex gap-5">
                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Nexus Mobile</p>
                      <p className="text-[11px] font-black italic leading-tight">Notifikasi akan muncul di lockscreen HP kurir secara instan.</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                      <Globe size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Nexus Web</p>
                      <p className="text-[11px] font-black italic leading-tight">Dashboard web akan memunculkan banner notifikasi real-time.</p>
                    </div>
                  </div>
               </div>
            </GlassCard>

            <GlassCard className="p-8 border-none bg-white/5 dark:bg-slate-900/40">
               <div className="flex items-center gap-3 mb-8">
                  <Clock size={18} className="text-orange-600" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white italic">Recent Broadcasts</h3>
               </div>
               <div className="space-y-4">
                  {recentBroadcasts.map((b, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-black/20 border border-white/5 hover:bg-black/40 transition-all">
                       <p className="text-[11px] font-black text-white uppercase italic truncate">{b.title}</p>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          {b.createdAt ? new Date(b.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                       </p>
                    </div>
                  ))}
                  {recentBroadcasts.length === 0 && (
                    <p className="text-center py-10 text-[10px] font-black uppercase tracking-widest text-slate-600 italic">No history yet</p>
                  )}
               </div>
            </GlassCard>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
