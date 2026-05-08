import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  setDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/lib/firebase';

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: any;
  isRead: boolean;
  imageUrl?: string;
}

export const useChat = (chatId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!chatId) return;

    setLoading(true);
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
      setTimeout(scrollToBottom, 100);

      // Mark as read if the last message is from the other user
      msgs.forEach(msg => {
        if (!msg.isRead && msg.senderId !== auth.currentUser?.uid) {
          updateDoc(doc(db, 'chats', chatId, 'messages', msg.id!), {
            isRead: true
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
      let imageUrl = '';
      if (imageFile) {
        const imageRef = ref(storage, `chats/${chatId}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const messageData: Partial<Message> = {
        text,
        senderId: auth.currentUser.uid,
        receiverId,
        timestamp: serverTimestamp(),
        isRead: false,
        ...(imageUrl && { imageUrl }),
      };

      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

      // Update chat metadata
      await setDoc(doc(db, 'chats', chatId), {
        lastMessage: imageUrl ? '📷 Photo' : text,
        lastTimestamp: serverTimestamp(),
        participants: [auth.currentUser.uid, receiverId],
        [`unread_${receiverId}`]: (await getUnreadCount(chatId, receiverId)) + 1,
      }, { merge: true });

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getUnreadCount = async (chatId: string, userId: string) => {
    // This is a placeholder, in a real app you might want to handle unread counts differently
    return 0; 
  };

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [otherUserTyping, setOtherUserTyping] = useState<boolean>(false);

  useEffect(() => {
    if (!chatId) return;

    const typingRef = doc(db, 'chats', chatId, 'typing', 'status');
    const unsubscribe = onSnapshot(typingRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const otherUserId = chatId.split('_').find(id => id !== auth.currentUser?.uid);
        if (otherUserId) {
          setOtherUserTyping(data[otherUserId] || false);
        }
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  const setTyping = async (typing: boolean) => {
    if (!auth.currentUser || !chatId) return;
    const typingRef = doc(db, 'chats', chatId, 'typing', 'status');
    await setDoc(typingRef, {
      [auth.currentUser.uid]: typing
    }, { merge: true });
    setIsTyping(typing);
  };

  const deleteMessage = async (messageId: string) => {
    if (!chatId) return;
    try {
      // In a real app, you might want to do a soft delete (e.g. set 'isDeleted: true')
      // but for this request, we'll do a hard delete or set status
      await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
        text: '🚫 Pesan telah dihapus',
        imageUrl: null,
        isDeleted: true
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return { messages, loading, sending, sendMessage, deleteMessage, scrollRef, scrollToBottom, isTyping, setTyping, otherUserTyping };
};
