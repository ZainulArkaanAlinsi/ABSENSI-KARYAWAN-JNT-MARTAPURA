'use client';

import React, { useState, useEffect } from 'react';
import { Send, Search, MoreVertical, Paperclip, Smile, Image as ImageIcon, Loader2, Trash2, Check, CheckCheck } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useEmployeeManagement } from '@/hooks/useEmployeeManagement';
import { auth } from '@/lib/firebase';
import { format } from 'date-fns';

export default function ChatPage() {
  const { employees, loading: loadingEmployees } = useEmployeeManagement();
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Simple deterministic chatId: sort([adminId, courierId]).join('_')
  const getChatId = (adminId: string, courierId: string) => {
    return [adminId, courierId].sort().join('_');
  };

  // Synchronize with Mobile App Admin ID
  const currentAdminId = 'admin_jne_mtp'; 
  const chatId = selectedCourier ? getChatId(currentAdminId, selectedCourier.id) : null;

  const { messages, loading, sending, sendMessage, scrollRef, setTyping, otherUserTyping, deleteMessage } = useChat(chatId);

  useEffect(() => {
    if (employees.length > 0 && !selectedCourier) {
      setSelectedCourier(employees[0]);
    }
  }, [employees]);

  // Typing logic
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-4 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
      
      {/* ── COURIER LIST ── */}
      <div className="w-72 bento-card flex flex-col p-0! overflow-hidden shrink-0">
        <div className="p-5 border-b border-(--border-color) bg-white dark:bg-[#0F172A]">
          <h3 className="text-[10px] font-black text-(--text-primary) uppercase tracking-[0.2em] mb-4">Kurir Aktif</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)" size={12} />
            <input 
              type="text" 
              placeholder="Cari..." 
              className="w-full bg-(--bg-main) border border-(--border-color) rounded-lg py-2 pl-9 pr-4 text-[10px] font-bold text-(--text-primary) outline-none focus:ring-1 focus:ring-cyan-600/30 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
          {loadingEmployees ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-cyan-600" /></div>
          ) : employees.map((emp) => (
            <div 
              key={emp.id} 
              onClick={() => setSelectedCourier(emp)}
              className={`px-5 py-4 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${selectedCourier?.id === emp.id ? 'bg-cyan-600/5 border-cyan-600' : 'border-transparent hover:bg-(--bg-main)'}`}
            >
              <div className="w-10 h-10 bg-(--bg-card) border border-(--border-color) rounded-lg flex items-center justify-center text-(--text-primary) font-black italic text-xs shrink-0 uppercase shadow-sm">
                {emp.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className="text-[10px] font-black text-(--text-primary) truncate uppercase">{emp.name}</p>
                </div>
                <p className="text-[9px] font-bold text-(--text-secondary) truncate tracking-tight">
                  Unit: {emp.department}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHAT INTERFACE ── */}
      <div className="flex-1 bento-card flex flex-col p-0! overflow-hidden">
        {/* Chat Header */}
        <div className="p-5 border-b border-(--border-color) flex items-center justify-between bg-(--bg-card)/80 backdrop-blur-md">
          {selectedCourier ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-600 dark:bg-cyan-500 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-cyan-600/20 uppercase">
                {selectedCourier.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-[11px] font-black text-(--text-primary) uppercase tracking-widest">{selectedCourier.name}</h3>
                <p className="text-[9px] font-bold text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Aktif Sekarang
                </p>
              </div>
            </div>
          ) : (
            <div className="text-[11px] font-black text-(--text-secondary) uppercase tracking-widest">Pilih kurir untuk memulai chat</div>
          )}
          <button className="p-2 text-(--text-secondary) hover:text-(--text-primary) transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Message Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-(--bg-main)/30 no-scrollbar"
        >
          {loading ? (
            <div className="flex justify-center"><Loader2 className="animate-spin text-cyan-600" /></div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <ImageIcon size={48} className="opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">Belum ada percakapan</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isMe = msg.senderId === currentAdminId;
                return (
                  <div 
                    key={msg.id} 
                    className={`flex items-end gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse ml-auto animate-in slide-in-from-right-2' : 'animate-in slide-in-from-left-2'} duration-300`}
                  >
                    <div className={`w-7 h-7 ${isMe ? 'bg-cyan-600 text-white' : 'bg-(--bg-card) border border-(--border-color) text-(--text-secondary)'} rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${isMe ? 'shadow-md shadow-cyan-600/20' : ''}`}>
                      {isMe ? 'A' : selectedCourier?.name.charAt(0)}
                    </div>
                    <div className={`space-y-1 ${isMe ? 'text-right' : ''}`}>
                      <div className={`${isMe ? 'bg-cyan-600 text-white shadow-xl shadow-cyan-600/10' : 'bg-(--bg-card) border border-(--border-color) text-(--text-primary) shadow-sm'} p-4 rounded-2xl ${isMe ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="attachment" className="rounded-lg mb-2 max-w-full h-auto border border-white/10" />
                        )}
                        {msg.text && (
                          <p className="text-[11px] font-medium leading-relaxed">
                            {msg.text}
                          </p>
                        )}
                      </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-[8px] font-black text-(--text-secondary) uppercase">
                            {msg.timestamp ? format(msg.timestamp.toDate(), 'HH:mm') : '...'}
                          </span>
                          {isMe && (
                            <span className={`text-[8px] font-black uppercase ${msg.isRead ? 'text-emerald-500' : 'text-slate-400'}`}>
                              {msg.isRead ? <CheckCheck size={10} /> : <Check size={10} />}
                            </span>
                          )}
                          {isMe && !(msg as any).isDeleted && (
                            <button 
                              onClick={() => {
                                if(confirm('Hapus pesan ini?')) deleteMessage(msg.id!);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all ml-1"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                    </div>
                  </div>
                );
              })}
              {/* Typing Indicator */}
              {otherUserTyping && (
                <div className="flex items-center gap-2 text-cyan-600 animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-cyan-600 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-cyan-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-cyan-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">{selectedCourier?.name} sedang mengetik...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-5 bg-white dark:bg-[#0F172A] border-t border-(--border-color)">
          <form onSubmit={handleSendMessage} className="space-y-4">
            {selectedImage && (
              <div className="flex items-center gap-2 p-2 bg-(--bg-main) rounded-lg border border-cyan-600/20 w-fit animate-in slide-in-from-bottom-2">
                <ImageIcon size={14} className="text-cyan-600" />
                <span className="text-[9px] font-black uppercase tracking-tight truncate max-w-[150px]">{selectedImage.name}</span>
                <button type="button" onClick={() => setSelectedImage(null)} className="text-cyan-600 font-bold ml-2">×</button>
              </div>
            )}
            <div className="flex items-center gap-3">
              <label className="p-2 text-(--text-secondary) hover:text-cyan-600 transition-colors cursor-pointer">
                <Paperclip size={18} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message to courier..." 
                  className="w-full bg-(--bg-main) border border-(--border-color) rounded-xl py-3.5 px-5 text-xs font-bold text-(--text-primary) outline-none focus:ring-2 focus:ring-cyan-600/10 transition-all"
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-(--text-secondary) hover:text-amber-500 transition-colors">
                  <Smile size={18} />
                </button>
              </div>
              <button 
                type="submit"
                disabled={sending || (!inputText.trim() && !selectedImage)}
                className="w-11 h-11 bg-cyan-600 dark:bg-cyan-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-cyan-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
