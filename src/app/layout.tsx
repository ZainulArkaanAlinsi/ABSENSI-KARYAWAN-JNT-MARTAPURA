'use client';

import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <head>
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
        className="bg-(--bg-main) text-(--text-primary) antialiased min-h-screen transition-[background-color] duration-500"
      >
        {/* Background Grid & Decor */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-red-600/10" />
          
          {/* Connection Heartbeat Indicator */}
          <div className="fixed bottom-8 left-8 z-50 flex items-center gap-3 bg-(--bg-card) border border-(--border-primary) px-4 py-2 rounded-2xl shadow-xl">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-widest text-(--text-dim)">Fortress Online</span>
          </div>
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