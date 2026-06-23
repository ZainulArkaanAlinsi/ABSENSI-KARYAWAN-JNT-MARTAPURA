'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  Search,
  Paperclip,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Check,
  CheckCheck,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { useChat, type Message } from '@/hooks/useChat';
import { useEmployeeManagement } from '@/hooks/useEmployeeManagement';
import type { Employee } from '@/types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { listen } from '@/lib/firestoreListener';
import { db, auth } from '@/lib/firebase';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';

// ── DESIGN SYSTEM ─────────────────────────────────────────
// accent     : #16A34A  (green-600)
// accent-lt  : #DCFCE7  (green-100)
// bg-page    : #F8FAFC  (slate-50)
// bg-card    : #FFFFFF
// border     : #E2E8F0  (slate-200)
// text-head  : #0F172A  (slate-900)  — 15-16px font-bold
// text-body  : #475569  (slate-600)  — 13px font-normal
// text-cap   : #94A3B8  (slate-400)  — 11px font-medium
// ──────────────────────────────────────────────────────────

const ACCENT = '#16A34A';

// ── AVATAR ──

const Avatar = ({
  name,
  size = 40,
  active = false,
}: {
  name: string;
  size?: number;
  active?: boolean;
}) => (
  <div
    style={{ width: size, height: size, backgroundColor: active ? ACCENT : '#0F172A' }}
    className="rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 select-none"
  >
    {name.charAt(0).toUpperCase()}
  </div>
);

// ── CONTACT ITEM ──

const ContactItem = ({
  emp,
  isActive,
  lastTime,
  online,
  onClick,
}: {
  emp: Employee;
  isActive: boolean;
  lastTime?: string;
  online?: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left ${
      isActive
        ? 'bg-green-50 border border-green-100'
        : 'hover:bg-slate-50 border border-transparent'
    }`}
  >
    <div className="relative shrink-0">
      <Avatar name={emp.name} size={42} active={isActive} />
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-0.5">
        <p
          className={`text-[13px] font-semibold truncate ${isActive ? 'text-green-700' : 'text-slate-900'}`}
        >
          {emp.name}
        </p>
        {lastTime && <span className="text-[11px] text-slate-400 shrink-0 ml-2">{lastTime}</span>}
      </div>
      <p className="text-[12px] text-slate-400 truncate">{emp.department}</p>
    </div>
  </button>
);

// ── MESSAGE BUBBLE ──

const Bubble = ({
  msg,
  isMe,
  showAvatar,
  peerName,
  onDelete,
}: {
  msg: Message;
  isMe: boolean;
  showAvatar: boolean;
  peerName: string;
  onDelete: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse ml-auto' : ''} max-w-[75%]`}
  >
    {/* Avatar placeholder for alignment */}
    <div className="w-8 shrink-0">
      {!isMe && showAvatar && <Avatar name={peerName} size={32} />}
    </div>

    <div className={`group flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
      <div
        className={`px-4 py-3 rounded-2xl ${
          isMe
            ? 'bg-green-600 text-white rounded-br-sm'
            : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm shadow-sm'
        }`}
      >
        {msg.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- remote Firebase Storage image in a static export; next/image optimization is disabled
          <img src={msg.imageUrl} alt="attachment" className="rounded-xl mb-2 max-w-full h-auto" />
        )}
        {msg.text && <p className="text-[13px] leading-relaxed">{msg.text}</p>}
      </div>

      <div className={`flex items-center gap-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
        <span className="text-[11px] text-slate-400">
          {msg.createdAt ? format(msg.createdAt.toDate(), 'HH:mm') : '--:--'}
        </span>
        {isMe && (
          <span className={msg.isRead ? 'text-green-500' : 'text-slate-300'}>
            {msg.isRead ? (
              <CheckCheck size={12} strokeWidth={2.5} />
            ) : (
              <Check size={12} strokeWidth={2.5} />
            )}
          </span>
        )}
        {isMe && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 ml-1"
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

// ── EMPTY STATE ──

const EmptyState = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: LucideIcon;
  title: string;
  desc?: string;
}) => (
  <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
    <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300">
      <Icon size={28} />
    </div>
    <div>
      <p className="text-desc font-semibold text-slate-500">{title}</p>
      {desc && <p className="text-[12px] text-slate-400 mt-1">{desc}</p>}
    </div>
  </div>
);

// ── MAIN PAGE ──

export default function ChatPage() {
  const { employees, loading: loadingEmployees } = useEmployeeManagement();
  const [selectedCourier, setSelectedCourier] = useState<Employee | null>(null);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMeta, setChatMeta] = useState<Record<string, string>>({});
  const { confirm } = useConfirm();

  // ── Listen to chats collection for last message timestamps ──
  useEffect(() => {
    const unsub = listen(collection(db, 'chats'), (snap) => {
      const meta: Record<string, string> = {};
      snap.docs.forEach((d) => {
        const ts = d.data().lastTimestamp;
        if (ts) {
          try {
            meta[d.id] = format(ts.toDate(), 'HH:mm');
          } catch {
            /* ignore */
          }
        }
      });
      setChatMeta(meta);
    });
    return () => unsub();
  }, []);

  // ── Presence realtime (akurat ala WA) ──
  // Status online dihitung langsung di dalam listener (online && lastSeen segar).
  // Karena admin heartbeat tiap 30 dtk, listener nyala ≤30 dtk → staleness
  // ter-refresh otomatis tanpa timer (yang melanggar aturan purity React).
  const PRESENCE_STALE_MS = 75000; // 2.5x heartbeat 30 dtk
  const [onlineSet, setOnlineSet] = useState<Set<string>>(new Set());
  const [lastSeenMap, setLastSeenMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const unsub = listen(collection(db, 'user_presence'), (snap) => {
      const now = Date.now();
      const online = new Set<string>();
      const seen: Record<string, number> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        const ls = typeof data.lastSeen?.toMillis === 'function' ? data.lastSeen.toMillis() : 0;
        seen[d.id] = ls;
        if (data.isOnline === true && now - ls < PRESENCE_STALE_MS) online.add(d.id);
      });
      setOnlineSet(online);
      setLastSeenMap(seen);
    });
    return () => unsub();
  }, []);

  // Admin menulis presence-nya sendiri → user (APK) bisa lihat admin online/offline.
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const beat = () => {
      void setDoc(
        doc(db, 'user_presence', uid),
        {
          userId: uid,
          isOnline: true,
          lastSeen: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    };
    beat();
    const iv = setInterval(beat, 30000);
    const goOffline = () => {
      void setDoc(
        doc(db, 'user_presence', uid),
        { isOnline: false, lastSeen: serverTimestamp() },
        { merge: true },
      );
    };
    window.addEventListener('beforeunload', goOffline);
    return () => {
      clearInterval(iv);
      window.removeEventListener('beforeunload', goOffline);
      goOffline();
    };
  }, []);

  const isUserOnline = (uid?: string) => !!uid && onlineSet.has(uid);
  const lastSeenOf = (uid?: string) => (uid ? (lastSeenMap[uid] ?? 0) : 0);

  // Room model: room dikunci ke userId. Admin membuka room user yang dipilih.
  const chatId = selectedCourier ? selectedCourier.uid : null;

  const {
    messages,
    loading,
    sending,
    sendMessage,
    scrollRef,
    setTyping,
    otherUserTyping,
    deleteMessage,
  } = useChat(chatId);

  useEffect(() => {
    if (employees.length > 0 && !selectedCourier) setSelectedCourier(employees[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees]);

  useEffect(() => {
    if (inputText.length > 0) {
      setTyping(true);
      const t = setTimeout(() => setTyping(false), 2000);
      return () => clearTimeout(t);
    }
    setTyping(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || !selectedCourier) return;
    await sendMessage(inputText, selectedCourier.uid, selectedImage ?? undefined);
    setInputText('');
    setSelectedImage(null);
  };

  const filtered = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-[calc(100vh-140px)] flex gap-5 overflow-hidden">
      {/* ─────────────────────────────────────────────────────
          SIDEBAR
      ───────────────────────────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-slate-900">Pesan</h2>
          </div>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Cari kurir..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {loadingEmployees ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-green-500" size={22} />
              <p className="text-[12px] text-slate-400">Memuat kontak...</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-[12px] text-slate-400 py-8">Tidak ditemukan</p>
          ) : (
            filtered.map((emp) => (
              <ContactItem
                key={emp.id}
                emp={emp}
                isActive={selectedCourier?.id === emp.id}
                lastTime={chatMeta[emp.uid]}
                online={isUserOnline(emp.uid)}
                onClick={() => setSelectedCourier(emp)}
              />
            ))
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          CHAT AREA
      ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm min-w-0">
        {/* Chat header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          {selectedCourier ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar name={selectedCourier.name} size={42} active />
                {isUserOnline(selectedCourier.uid) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>
              <div>
                <h3 className="text-desc font-semibold text-slate-900 leading-tight">
                  {selectedCourier.name}
                </h3>
                <p className="text-[12px] leading-tight mt-0.5">
                  {otherUserTyping ? (
                    <span className="text-green-500">Sedang mengetik...</span>
                  ) : isUserOnline(selectedCourier.uid) ? (
                    <span className="text-green-500">Online</span>
                  ) : (
                    <span className="text-slate-400">
                      {lastSeenOf(selectedCourier.uid)
                        ? `Terakhir dilihat ${format(new Date(lastSeenOf(selectedCourier.uid)), 'HH:mm')}`
                        : 'Offline'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-desc text-slate-400">Pilih kontak untuk memulai</p>
          )}

        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-60">
              <Loader2 className="animate-spin text-green-500" size={28} />
              <p className="text-[13px] text-slate-400">Memuat pesan...</p>
            </div>
          ) : messages.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Belum ada pesan"
              desc="Mulai percakapan dengan kurir ini"
            />
          ) : (
            <AnimatePresence>
              {messages.map((msg, idx) => {
                // Semua pesan dari admin (admin manapun) tampil di sisi kanan.
                const isMe = msg.senderRole === 'admin';
                const showAvatar = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId;
                return (
                  <Bubble
                    key={msg.id}
                    msg={msg}
                    isMe={isMe}
                    showAvatar={showAvatar}
                    peerName={selectedCourier?.name ?? '?'}
                    onDelete={async () => {
                      const isConfirmed = await confirm({
                        title: 'Hapus Pesan',
                        message: 'Apakah Anda yakin ingin menghapus pesan ini?',
                        variant: 'danger',
                        confirmLabel: 'Hapus',
                        cancelLabel: 'Batal',
                      });
                      if (isConfirmed) {
                        try {
                          await deleteMessage(msg.id!);
                          toast.success('Pesan dihapus');
                        } catch {
                          toast.error('Gagal menghapus pesan');
                        }
                      }
                    }}
                  />
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Input area */}
        <div className="px-5 py-4 border-t border-slate-100 bg-white shrink-0">
          {/* Image preview */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                  <ImageIcon size={16} className="text-green-600 shrink-0" />
                  <p className="text-[12px] font-medium text-green-700 flex-1 truncate">
                    {selectedImage.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="text-green-400 hover:text-green-700 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSend} className="flex items-center gap-2.5">
            {/* Attachments */}
            <label className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer shrink-0">
              <Paperclip size={18} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setSelectedImage(e.target.files[0])}
              />
            </label>
            {/* Text input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 h-10 bg-slate-100 rounded-xl px-4 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-green-200 border border-transparent focus:border-green-300 transition-all"
            />

            {/* Send */}
            <button
              type="submit"
              disabled={sending || (!inputText.trim() && !selectedImage)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                sending || (!inputText.trim() && !selectedImage)
                  ? 'bg-slate-100 text-slate-300'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-200'
              }`}
            >
              {sending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
