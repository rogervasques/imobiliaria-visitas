import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { TenantProvider } from '@/context/TenantContext';
import { DataProvider } from '@/context/DataContext';
import { AppShell } from '@/components/layout/AppShell';
import { RegisterServiceWorker } from '@/components/pwa/RegisterServiceWorker';

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
    'EasyMob - Plataforma de gestão imobiliária inteligente para corretores e imobiliárias com agendamento inteligente e disparos automáticos de confirmação e lembretes no WhatsApp.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-180.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EasyMob',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="EasyMob" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body className="antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen">
        <RegisterServiceWorker />
        <AuthProvider>
          <TenantProvider>
            <DataProvider>
              <AppShell>{children}</AppShell>
            </DataProvider>
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
