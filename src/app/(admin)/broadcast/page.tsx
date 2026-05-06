'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Users, 
  User, 
  Megaphone, 
  Bell, 
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function BroadcastPage() {
  const [target, setTarget] = useState<'all' | 'specific'>('all');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };
    fetchUsers();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    
    setLoading(true);
    setStatus('idle');

    try {
      // Simulation of sending push notification
      // In a real app, this would trigger a Firebase Cloud Function or FCM directly
      await addDoc(collection(db, 'adminNotifications'), {
        title,
        message,
        type: 'broadcast',
        target: target === 'all' ? 'everyone' : selectedUser,
        targetName: target === 'all' ? 'All Couriers' : users.find(u => u.id === selectedUser)?.name || 'Specific User',
        timestamp: serverTimestamp(),
        sender: 'Admin JNE Martapura',
        isRead: false
      });

      // Clear form
      setTitle('');
      setMessage('');
      setSelectedUser('');
      setStatus('success');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* ── HEADER ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500 rounded-xl text-white">
            <Megaphone size={24} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Broadcast Center</h1>
        </div>
        <p className="text-slate-500 font-medium ml-12">Kirim informasi dan instruksi penting ke semua kurir atau personel tertentu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* ── FORM SECTION ── */}
        <div className="md:col-span-8">
          <form onSubmit={handleSend} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
            
            {/* Target Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Penerima</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTarget('all')}
                  className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all ${
                    target === 'all' 
                      ? 'border-rose-500 bg-rose-50 text-rose-600' 
                      : 'border-slate-100 bg-slate-50 text-slate-400 grayscale hover:grayscale-0'
                  }`}
                >
                  <Users size={20} />
                  <span className="font-black uppercase text-xs">Semua Kurir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTarget('specific')}
                  className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all ${
                    target === 'specific' 
                      ? 'border-rose-500 bg-rose-50 text-rose-600' 
                      : 'border-slate-100 bg-slate-50 text-slate-400 grayscale hover:grayscale-0'
                  }`}
                >
                  <User size={20} />
                  <span className="font-black uppercase text-xs">User Spesifik</span>
                </button>
              </div>
            </div>

            {/* Specific User Dropdown */}
            {target === 'specific' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih User</label>
                <div className="relative">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">-- Pilih Nama Kurir --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Search size={18} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Title & Message */}
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Notifikasi</label>
                <input
                  type="text"
                  placeholder="Contoh: Info Rapat Koordinasi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pesan / Konten</label>
                <textarea
                  placeholder="Tuliskan pesan lengkap disini..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              disabled={loading || !title || !message || (target === 'specific' && !selectedUser)}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-lg shadow-rose-200"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Blast Notification Now
                </>
              )}
            </button>

            {/* Status Messages */}
            {status === 'success' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <CheckCircle2 size={18} />
                <span className="text-xs font-bold uppercase tracking-tight">Broadcast Berhasil Terkirim ke {target === 'all' ? 'Semua Kurir' : 'User Terpilih'}!</span>
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <AlertCircle size={18} />
                <span className="text-xs font-bold uppercase tracking-tight">Gagal mengirim broadcast. Periksa koneksi Anda.</span>
              </motion.div>
            )}
          </form>
        </div>

        {/* ── INFO SIDEBAR ── */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
            <h3 className="text-lg font-black uppercase tracking-tight mb-4">Informasi Push</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <Bell size={16} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Instant Alert</p>
                  <p className="text-[10px] text-slate-300 leading-relaxed">Notifikasi akan langsung muncul di HP kurir dalam hitungan detik.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Verified Sender</p>
                  <p className="text-[10px] text-slate-300 leading-relaxed">Pesan dikirim atas nama Hub Martapura dan akan tersimpan di riwayat user.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Preview Notifikasi</h3>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-inner">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-6 w-6 bg-rose-500 rounded-md flex items-center justify-center">
                   <div className="text-[8px] font-black text-white">JNE</div>
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-bold text-slate-900 truncate">{title || 'Judul Notifikasi'}</p>
                   <p className="text-[8px] font-medium text-slate-500 uppercase">Baru Saja • JNE Martapura</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 line-clamp-2 italic">{message || 'Teks pesan akan muncul disini sebagai gambaran tampilan di perangkat mobile user...'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
