'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('jne-theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-(--bg-main) text-(--text-primary) antialiased min-h-screen transition-colors duration-300`}>
        {/* Background Grid & Decor */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-red-600/10" />
        </div>

        {/* Root Content */}
        <div className="relative z-10">
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