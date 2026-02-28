import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JNE MTP Admin — Sistem Manajemen Absensi Digital',
  description: 'Panel admin untuk sistem manajemen absensi digital JNE MTP dengan Face Recognition dan GPS Tracking.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('jne-theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-[#1A1F2E] text-white antialiased min-h-screen`}>
        {/* Background dekoratif */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="absolute inset-0 bg-linear-to-br from-[#0D1B35]/20 via-transparent to-[#E04B3A]/5" />
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#E04B3A]/30 to-transparent" />
        </div>

        {/* Konten utama */}
        <div className="relative z-10 animate-entrance">
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}