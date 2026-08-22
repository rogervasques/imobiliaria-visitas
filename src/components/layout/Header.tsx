'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, Bell, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  onOpenNovaVisita: () => void;
}

export function Header({ onOpenNovaVisita }: HeaderProps) {
  const hoje = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  // Capitaliza a primeira letra do dia
  const hojeCapitalizado = hoje.charAt(0).toUpperCase() + hoje.slice(1);

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center justify-between px-4 sm:px-8 h-16 max-w-7xl mx-auto">
        {/* Logo Mobile / Info */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 sm:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
              EM
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Easy<span className="text-emerald-600 dark:text-emerald-400">Mob</span>
            </span>
          </Link>

          {/* Data Atual no Desktop */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
            <CalendarIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>{hojeCapitalizado}</span>
          </div>
        </div>

        {/* Ações da Direita */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={onOpenNovaVisita}
            size="sm"
            className="flex items-center shadow-md font-semibold text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Agendar Visita</span>
            <span className="xs:hidden">Agendar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
