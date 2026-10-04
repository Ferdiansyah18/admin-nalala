import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { AdminAppShell } from '@/components/layout/AdminAppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TailAdmin - Nalala E-Commerce Admin Dashboard',
  description: 'Sistem manajemen terpadu transaksi, verifikasi manual, ekspedisi J&T, dan katalog Nalala.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} antialiased selection:bg-brand-500 selection:text-white`}>
        <ThemeProvider>
          <SidebarProvider>
            <AuthProvider>
              <ToastProvider>
                <AdminAppShell>{children}</AdminAppShell>
              </ToastProvider>
            </AuthProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
