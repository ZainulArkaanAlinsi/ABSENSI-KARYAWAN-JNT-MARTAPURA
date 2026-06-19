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
  role: 'admin' | 'superadmin';
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
        // Set cookie for middleware
        document.cookie = `jne_admin_session=${fbUser.uid}; path=/; max-age=86400; SameSite=Lax`;

        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.role === 'admin' || data.role === 'superadmin') {
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
              document.cookie = 'jne_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
          } else {
            console.error('User document not found for UID:', fbUser.uid);
            await firebaseSignOut(auth);
            setUser(null);
            setError('Akun tidak ditemukan di database. Hubungi IT.');
            document.cookie = 'jne_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        } catch (err) {
          console.error('Error fetching user doc:', err);
          setUser(null);
          setError('Terjadi kesalahan saat memuat data pengguna.');
        }
      } else {
        setUser(null);
        document.cookie = 'jne_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      // NORMALISASI EMAIL
      const normalizedEmail = email.trim().toLowerCase();

      // DOMAIN CHECK: Allow official JNE email domains + gmail for dev/testing
      const isOfficialDomain =
        normalizedEmail.endsWith('@jne.mtp.com') ||
        normalizedEmail.endsWith('@jnemtp.com') ||
        normalizedEmail.endsWith('@jne.co.id') ||
        normalizedEmail.endsWith('@gmail.com');

      if (!isOfficialDomain) {
        setError('Akses ditolak. Gunakan email resmi @jne.mtp.com');
        setLoading(false);
        return false;
      }

      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const fbUser = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));

      if (!userDoc.exists()) {
        await firebaseSignOut(auth);
        setError('Akun tidak ditemukan di database. Hubungi Administrator.');
        setLoading(false);
        return false;
      }

      const data = userDoc.data();
      if (data.role !== 'admin' && data.role !== 'superadmin') {
        await firebaseSignOut(auth);
        setError('Akses ditolak. Akun ini tidak memiliki hak akses.');
        setLoading(false);
        return false;
      }

      // Set cookie on success
      document.cookie = `jne_admin_session=${fbUser.uid}; path=/; max-age=86400; SameSite=Lax`;

      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        name: data.name || fbUser.email || 'Admin',
        role: data.role,
      });

      setLoading(false);
      return true;
    } catch (err) {
      const e = err as { code?: string; message?: string };
      console.error('Login error detail:', err);
      let msg = 'Gagal masuk. Periksa kembali email dan password Anda.';

      if (
        e.code === 'auth/user-not-found' ||
        e.code === 'auth/wrong-password' ||
        e.code === 'auth/invalid-credential'
      ) {
        msg = 'Email atau password salah.';
      } else if (e.code === 'auth/too-many-requests') {
        msg = 'Terlalu banyak percobaan. Coba lagi nanti.';
      }

      setError(`${msg} (Error: ${e.code || e.message})`);
      setLoading(false);
      return false;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    document.cookie = 'jne_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
