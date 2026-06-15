import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  where,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/lib/firebase';
import { listen } from '@/lib/firestoreListener';

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  receiverId: string;
  receiverRole?: string;
  chatId: string;
  createdAt: any;
  status: 'sent' | 'delivered' | 'read';
  readAt?: any;
  deliveredAt?: any;
  imageUrl?: string;
  isDeleted: boolean;
  isRead?: boolean;
}

// ── Flat `messages` collection (same path as mobile `chat_provider.dart`)
// Mobile writes to: collection('messages').where('chatId', isEqualTo: chatId)
// Admin must use the same path for cross-platform messaging to work.

export const useChat = (chatId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // ── Listen to flat `messages` collection filtered by chatId ──
  useEffect(() => {
    if (!chatId) return;

    setLoading(true);
    const q = query(collection(db, 'messages'), where('chatId', '==', chatId));

    const unsubscribe = listen(q, (snapshot) => {
      const msgs = snapshot.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            get isRead() {
              return this.status === 'read';
            },
          } as Message;
        })
        .sort((a, b) => {
          const aTs = a.createdAt?.seconds ?? 0;
          const bTs = b.createdAt?.seconds ?? 0;
          return aTs - bTs;
        });
      setMessages(msgs);
      setLoading(false);
      setTimeout(scrollToBottom, 100);

      // Mark incoming messages as read
      msgs.forEach((msg) => {
        if (msg.status !== 'read' && msg.senderId !== auth.currentUser?.uid) {
          updateDoc(doc(db, 'messages', msg.id!), {
            status: 'read',
            readAt: serverTimestamp(),
          });
        }
      });
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async (text: string, receiverId: string, imageFile?: File) => {
    if (!auth.currentUser || !chatId || (!text.trim() && !imageFile)) return;

    setSending(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const imageRef = ref(storage, `chats/${chatId}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const messageData = {
        text,
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName ?? 'Admin',
        senderRole: 'admin',
        receiverId,
        receiverRole: 'employee',
        chatId,
        status: 'sent',
        createdAt: serverTimestamp(),
        readAt: null,
        deliveredAt: null,
        imageUrl: imageUrl ?? null,
        isDeleted: false,
      };

      const docRef = await addDoc(collection(db, 'messages'), messageData);

      // Mark as delivered immediately (optimistic — mirrors mobile behavior)
      await updateDoc(docRef, {
        status: 'delivered',
        deliveredAt: serverTimestamp(),
      });

      // Update chat metadata for sidebar last-message preview
      await setDoc(
        doc(db, 'chats', chatId),
        {
          lastMessage: imageUrl ? '📷 Foto' : text,
          lastTimestamp: serverTimestamp(),
          participants: [auth.currentUser.uid, receiverId],
        },
        { merge: true },
      );
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // ── Typing indicator (same path as mobile: chats/{chatId}/typing/status) ──
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  useEffect(() => {
    if (!chatId) return;

    const typingRef = doc(db, 'chats', chatId, 'typing', 'status');
    const unsubscribe = listen(typingRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // Room model: admin memantau apakah user sedang mengetik.
        setOtherUserTyping(data['user'] ?? false);
      } else {
        setOtherUserTyping(false);
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  const setTyping = async (typing: boolean) => {
    if (!auth.currentUser || !chatId) return;
    // Key berbasis peran agar konsisten dengan mobile ('user' / 'admin').
    await setDoc(
      doc(db, 'chats', chatId, 'typing', 'status'),
      {
        admin: typing,
      },
      { merge: true },
    );
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        text: '🚫 Pesan telah dihapus',
        imageUrl: null,
        isDeleted: true,
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return {
    messages,
    loading,
    sending,
    sendMessage,
    deleteMessage,
    scrollRef,
    scrollToBottom,
    setTyping,
    otherUserTyping,
  };
};
