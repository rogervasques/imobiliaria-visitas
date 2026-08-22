import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { AppShell } from '@/components/layout/AppShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'EasyMob - Gestão Imobiliária Inteligente',
  description:
    'EasyMob - Plataforma de gestão imobiliária inteligente para corretores e imobiliárias com agendamento inteligente e disparos automáticos de confirmação e lembretes (30 min antes) no WhatsApp.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EasyMob',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen">
        <AuthProvider>
          <DataProvider>
            <AppShell>{children}</AppShell>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
