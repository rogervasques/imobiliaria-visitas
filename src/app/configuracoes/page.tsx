'use client';

import React, { useState } from 'react';
import { WhatsAppConfigForm } from '@/components/configuracoes/WhatsAppConfigForm';
import { ImportacaoDadosView } from '@/components/configuracoes/ImportacaoDadosView';
import { Settings, MessageSquare, UploadCloud } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'importacao'>('whatsapp');

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-500" />
            Configurações da Imobiliária
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden md:block">
            {activeTab === 'whatsapp'
              ? 'Integre sua API do WhatsApp (Evolution API, Z-API, Meta) e customize as mensagens automáticas de confirmação e lembrete.'
              : 'Importe Clientes, Proprietários e Imóveis em massa através de planilhas Excel (.xlsx) ou Feed XML (Kenlo / Portais).'}
          </p>
        </div>

        {/* Abas Principais */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp & Automação</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('importacao')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'importacao'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Central de Importação</span>
          </button>
        </div>
      </div>

      {activeTab === 'whatsapp' ? <WhatsAppConfigForm /> : <ImportacaoDadosView />}
    </div>
  );
}
