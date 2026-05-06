'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AdminUser {
  uid: string;
  email: string | null;
  name: string;
  role: 'admin' | 'superadmin' | 'employee';
}

interface AuthContextType {
  user: AdminUser | null;
  firebaseUser: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.role === 'admin' || data.role === 'superadmin' || data.role === 'employee') {
              setUser({
                uid: fbUser.uid,
                email: fbUser.email,
                name: data.name || fbUser.email || 'Admin',
                role: data.role,
              });
            } else {
              console.warn('User role not allowed:', data.role);
              await firebaseSignOut(auth);
              setUser(null);
              setError('Akses ditolak. Akun ini tidak memiliki izin akses.');
            }
          } else {
            console.error('User document not found for UID:', fbUser.uid);
            await firebaseSignOut(auth); // Sign out if no doc
            setUser(null);
            setError('Akun tidak ditemukan di database. Hubungi IT.');
          }
        } catch (err) {
          console.error('Error fetching user doc:', err);
          setUser(null);
          setError('Terjadi kesalahan saat memuat data pengguna.');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      // 1. Firebase Auth Sign In
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const fbUser = userCredential.user;

      // 2. Immediate Firestore Verification
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      
      if (!userDoc.exists()) {
        await firebaseSignOut(auth);
        setError('Akun tidak ditemukan di database. Hubungi Administrator.');
        setLoading(false);
        return false;
      }

      const data = userDoc.data();
      if (data.role !== 'admin' && data.role !== 'superadmin' && data.role !== 'employee') {
        await firebaseSignOut(auth);
        setError('Akses ditolak. Akun ini tidak memiliki hak akses.');
        setLoading(false);
        return false;
      }

      // 3. Set local state immediately for faster UI response
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        name: data.name || fbUser.email || 'Admin',
        role: data.role,
      });

      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('Login error detail:', err);
      let msg = 'Gagal masuk. Periksa kembali email dan password Anda.';
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Email atau password salah.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Terlalu banyak percobaan. Coba lagi nanti.';
      }
      
      setError(`${msg} (Error: ${err.code || err.message})`);
      setLoading(false);
      return false;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
