'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Toast } from '../ui/Toast';
import { NovaVisitaModal } from '../visitas/NovaVisitaModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isNovaVisitaOpen, setIsNovaVisitaOpen] = useState(false);
  const pathname = usePathname();

  // Em rotas públicas (Landing Page, Login, Recuperação, Compartilhamento Público), não renderiza a casca do app
  const isStandalonePublic =
    pathname === '/' ||
    pathname === '/home' ||
    pathname === '/login' ||
    pathname.startsWith('/cadastrar') ||
    pathname.startsWith('/recuperar-senha') ||
    pathname.startsWith('/redefinir-senha') ||
    pathname.startsWith('/imovel/') ||
    pathname.startsWith('/p/');

  if (isStandalonePublic) {
    return (
      <>
        {children}
        <Toast />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden pb-20 md:pb-8">
        <Header onOpenNovaVisita={() => setIsNovaVisitaOpen(true)} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 overflow-x-hidden">
          {children}
        </main>

        <footer className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-800/60 hidden md:block">
          <p>© {new Date().getFullYear()} <strong className="text-slate-600 dark:text-slate-300">EasyMob</strong> — Gestão Imobiliária Inteligente. Todos os direitos reservados.</p>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenNovaVisita={() => setIsNovaVisitaOpen(true)} />

      {/* Modal Global de Nova Visita */}
      <NovaVisitaModal
        isOpen={isNovaVisitaOpen}
        onClose={() => setIsNovaVisitaOpen(false)}
      />

      {/* Notificações Toast */}
      <Toast />
    </div>
  );
}
