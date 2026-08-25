'use client';

import React from 'react';
import { WhatsAppConfigForm } from '@/components/configuracoes/WhatsAppConfigForm';
import { Settings, MessageSquare } from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-500" />
          Configurações de Automação & WhatsApp
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden md:block">
          Integre sua API do WhatsApp (Evolution API, Z-API, Meta) e customize as mensagens automáticas de confirmação e lembrete.
        </p>
      </div>

      <WhatsAppConfigForm />
    </div>
  );
}
