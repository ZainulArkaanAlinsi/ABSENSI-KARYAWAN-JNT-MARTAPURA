'use client';

import { Inter, Outfit, Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import '@/app/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ConfirmProvider } from '@/context/ConfirmContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700', '900'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${plusJakarta.variable} ${playfair.variable}`}
    >
      <head>
        {/* Metadata di-set manual di <head> karena RootLayout ini client
            component ('use client') — Next tidak mengizinkan export metadata. */}
        <title>JNE Absensi — Panel Admin</title>
        <meta
          name="description"
          content="Panel admin sistem absensi karyawan JNE Martapura — kelola kehadiran, cuti, lembur, dan laporan."
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#E31E24" />
        <meta name="apple-mobile-web-app-title" content="JNE Absensi" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* Open Graph / Twitter — preview saat link admin dibagikan */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://admin-absensi-jne-mtp.web.app/" />
        <meta property="og:title" content="JNE Absensi — Panel Admin" />
        <meta
          property="og:description"
          content="Panel admin sistem absensi karyawan JNE Martapura — kelola kehadiran, cuti, lembur, dan laporan."
        />
        <meta property="og:image" content="https://admin-absensi-jne-mtp.web.app/icon-512.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="JNE Absensi — Panel Admin" />
        <meta
          name="twitter:description"
          content="Panel admin sistem absensi karyawan JNE Martapura."
        />
        <meta name="twitter:image" content="https://admin-absensi-jne-mtp.web.app/icon-512.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('jne-theme');
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const theme = savedTheme || systemTheme;
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-secondary text-primary antialiased min-h-screen transition-[background-color] duration-500"
      >
        {/* Background Grid — barely visible */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
        </div>

        {/* Root Content */}
        <div className="relative z-10">
          <ThemeProvider>
            <AuthProvider>
              <ConfirmProvider>
                {children}
                <Toaster
                  position="top-center"
                  richColors
                  expand={false}
                  toastOptions={{
                    style: {
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      borderRadius: '20px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                      fontFamily: 'var(--font-plus-jakarta)',
                    },
                    className: 'premium-toast',
                  }}
                />
              </ConfirmProvider>
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
