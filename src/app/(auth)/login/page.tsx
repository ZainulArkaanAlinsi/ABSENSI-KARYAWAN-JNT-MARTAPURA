'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { signIn, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/dashboard');
    } catch {
      // error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}
    >
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(circle at 30% 50%, #E31E24 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-5"
          style={{ background: '#E31E24' }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{ width: 52, height: 52, background: '#E31E24' }}
          >
            <Shield size={26} color="white" />
          </div>
          <div>
            <p className="text-white font-bold text-xl">JNE MTP</p>
            <p className="text-slate-400 text-sm">Admin Dashboard</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Sistem Manajemen<br />
            <span style={{ color: '#E31E24' }}>Absensi Digital</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Pantau kehadiran karyawan secara real-time dengan teknologi Face Recognition dan GPS Tracking.
          </p>

          {/* Feature list */}
          {[
            '✓ Verifikasi wajah & GPS real-time',
            '✓ Laporan absensi otomatis',
            '✓ Notifikasi push ke karyawan',
            '✓ Manajemen shift fleksibel',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 mb-2">
              <p className="text-slate-300 text-sm">{f}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="relative text-slate-500 text-xs">
          © 2025 JNE MTP. Sistem Manajemen Absensi Digital.
        </p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div
          className="w-full rounded-3xl p-8 lg:p-10"
          style={{
            maxWidth: 440,
            background: 'white',
            boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
          }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 40, height: 40, background: '#E31E24' }}
            >
              <Shield size={20} color="white" />
            </div>
            <div>
              <p className="font-bold text-slate-800">JNE MTP Admin</p>
              <p className="text-slate-400 text-xs">Sistem Absensi Digital</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Selamat Datang</h2>
          <p className="text-slate-500 text-sm mb-8">Masuk ke panel admin JNE MTP</p>

          {error && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm"
              style={{ background: '#FEE2E2', color: '#B91C1C' }}
            >
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Email Admin</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@jnemtp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: 44 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                  style={{ color: '#94A3B8' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-3 text-base"
              style={{ borderRadius: 12 }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Hanya untuk admin yang berwenang.{' '}
            <span className="text-slate-500">Hubungi IT Support jika lupa password.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
