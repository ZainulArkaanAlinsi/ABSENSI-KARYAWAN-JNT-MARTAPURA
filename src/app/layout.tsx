'use client';

import { Inter, Outfit, Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import '@/app/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ConfirmProvider } from '@/context/ConfirmContext';
import { Toaster } from 'sonner';

const inter       = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit      = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta' });
const playfair    = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: ['400', '700', '900'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${outfit.variable} ${plusJakarta.variable} ${playfair.variable}`}>
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