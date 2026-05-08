'use client';

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Image as ImageIcon, 
  Loader2, 
  Trash2, 
  Check, 
  CheckCheck,
  Phone,
  Video,
  User,
  MoreHorizontal,
  MessageSquare
} from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useEmployeeManagement } from '@/hooks/useEmployeeManagement';
import { auth } from '@/lib/firebase';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, InteractiveButton } from '@/components/ui/Interactive';

export default function ChatPage() {
  const { employees, loading: loadingEmployees } = useEmployeeManagement();
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentAdminId = 'admin_jne_mtp'; 
  const getChatId = (adminId: string, courierId: string) => [adminId, courierId].sort().join('_');
  const chatId = selectedCourier ? getChatId(currentAdminId, selectedCourier.id) : null;

  const { 
    messages, 
    loading, 
    sending, 
    sendMessage, 
    scrollRef, 
    setTyping, 
    otherUserTyping, 
    deleteMessage 
  } = useChat(chatId);

  useEffect(() => {
    if (employees.length > 0 && !selectedCourier) {
      setSelectedCourier(employees[0]);
    }
  }, [employees]);

  useEffect(() => {
    if (inputText.length > 0) {
      setTyping(true);
      const timeout = setTimeout(() => setTyping(false), 2000);
      return () => clearTimeout(timeout);
    } else {
      setTyping(false);
    }
  }, [inputText]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || !selectedCourier) return;
    await sendMessage(inputText, selectedCourier.id, selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden animate-in fade-in duration-700">
      
      {/* ── SIDEBAR: CONTACTS ── */}
      <div className="w-80 flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl shrink-0">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">Pesan</h2>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-cyan-600 transition-colors cursor-pointer">
              <MoreHorizontal size={18} />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Cari kurir atau unit..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 ring-cyan-600/20 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-1">
          {loadingEmployees ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-cyan-600" size={24} />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Memuat Kurir...</p>
            </div>
          ) : filteredEmployees.map((emp) => {
            const isActive = selectedCourier?.id === emp.id;
            return (
              <motion.div 
                key={emp.id} 
                whileHover={{ x: 4 }}
                onClick={() => setSelectedCourier(emp)}
                className={`p-4 flex items-center gap-4 cursor-pointer rounded-3xl transition-all relative group ${
                  isActive ? 'bg-cyan-600 shadow-xl shadow-cyan-600/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-sm shrink-0 uppercase transition-all ${
                  isActive ? 'bg-white text-cyan-600 rotate-3' : 'bg-slate-900 text-white group-hover:rotate-3'
                }`}>
                  {emp.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className={`text-xs font-black truncate uppercase tracking-tight ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {emp.name}
                    </p>
                    <span className={`text-[8px] font-bold ${isActive ? 'text-white/60' : 'text-slate-400'}`}>12:45</span>
                  </div>
                  <p className={`text-[10px] font-bold truncate tracking-tight ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
                    Unit: {emp.department}
                  </p>
                </div>
                {emp.isOnline && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl relative">
        
        {/* WALLPAPER OVERLAY */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none dark:invert" style={{ backgroundImage: 'url("https://www.toptal.com/designers/subtlepatterns/uploads/double_lined.png")' }} />

        {/* CHAT HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-10">
          {selectedCourier ? (
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg shadow-cyan-600/20 uppercase text-lg">
                  {selectedCourier.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-lg bg-emerald-500 border-4 border-white dark:border-slate-900" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{selectedCourier.name}</h3>
                <div className="flex items-center gap-2">
                   <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Online</p>
                   {otherUserTyping && (
                     <p className="text-[10px] font-black text-cyan-600 animate-pulse uppercase tracking-tighter">• Mengetik...</p>
                   )}
                </div>
              </div>
            </div>
          ) : (
             <div className="h-12 flex items-center text-xs font-black text-slate-400 uppercase tracking-widest italic">Pilih Operatif JNE</div>
          )}
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex gap-2 mr-4">
              <InteractiveButton className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-cyan-600 transition-all">
                <Phone size={18} />
              </InteractiveButton>
              <InteractiveButton className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-cyan-600 transition-all">
                <Video size={18} />
              </InteractiveButton>
            </div>
            <InteractiveButton className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
              <Search size={18} />
            </InteractiveButton>
            <InteractiveButton className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
              <MoreVertical size={18} />
            </InteractiveButton>
          </div>
        </div>

        {/* MESSAGES */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar relative z-0"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
               <Loader2 className="animate-spin text-cyan-600" size={32} />
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">Enkripsi Pesan...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-700 gap-6 opacity-30">
              <div className="w-24 h-24 rounded-4xl border-4 border-dashed border-current flex items-center justify-center">
                <MessageSquare size={48} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.5em] italic">No Logs Found</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === currentAdminId;
                const showAvatar = idx === 0 || messages[idx-1]?.senderId !== msg.senderId;
                
                return (
                  <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className={`flex items-end gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse ml-auto' : ''}`}
                  >
                    {!isMe && (
                      <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-[10px] shrink-0 shadow-lg">
                        {selectedCourier?.name.charAt(0)}
                      </div>
                    )}
                    <div className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`p-4 rounded-[1.8rem] shadow-sm relative overflow-hidden ${
                        isMe 
                        ? 'bg-cyan-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-100 dark:border-white/5'
                      }`}>
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="attachment" className="rounded-2xl mb-3 max-w-full h-auto border border-white/10 hover:scale-[1.02] transition-transform cursor-zoom-in" />
                        )}
                        {msg.text && (
                          <p className="text-[13px] font-semibold leading-relaxed tracking-tight">
                            {msg.text}
                          </p>
                        )}
                      </div>
                      
                      <div className={`flex items-center gap-2 mt-2 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                         <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                           {msg.timestamp ? format(msg.timestamp.toDate(), 'HH:mm') : '--:--'}
                         </span>
                         {isMe && (
                           <div className={`flex items-center ${msg.isRead ? 'text-cyan-500' : 'text-slate-300 dark:text-slate-600'}`}>
                              {msg.isRead ? <CheckCheck size={12} strokeWidth={3} /> : <Check size={12} strokeWidth={3} />}
                           </div>
                         )}
                         {isMe && (
                           <button 
                             onClick={() => confirm('Hapus pesan?') && deleteMessage(msg.id!)}
                             className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                           >
                             <Trash2 size={12} />
                           </button>
                         )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* INPUT AREA */}
        <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 z-10">
          <form onSubmit={handleSendMessage} className="space-y-6">
            <AnimatePresence>
              {selectedImage && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-cyan-600/20 w-fit"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-600/10 flex items-center justify-center text-cyan-600">
                    <ImageIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Attachment</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{selectedImage.name}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedImage(null)} className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 transition-all">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <label className="w-14 h-14 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-cyan-600 transition-all cursor-pointer">
                  <Paperclip size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setSelectedImage(e.target.files[0])} />
                </label>
                <InteractiveButton className="hidden sm:flex w-14 h-14 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl items-center justify-center text-slate-400 hover:text-amber-500 transition-all">
                  <Smile size={20} />
                </InteractiveButton>
              </div>

              <div className="flex-1">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Kirim pesan ke kurir..." 
                  className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-[1.2rem] px-6 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 ring-cyan-600/20 transition-all placeholder:text-slate-400"
                />
              </div>

              <InteractiveButton 
                type="submit"
                disabled={sending || (!inputText.trim() && !selectedImage)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${
                  sending || (!inputText.trim() && !selectedImage)
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  : 'bg-cyan-600 text-white shadow-cyan-600/30 hover:scale-105 active:scale-95'
                }`}
              >
                {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </InteractiveButton>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
