'use client';

import React from 'react';
import Link from 'next/link';
import { ImportacaoDadosView } from '@/components/configuracoes/ImportacaoDadosView';
import { Settings, MessageSquare, UploadCloud, ArrowLeft } from 'lucide-react';

export default function ImportacaoPage() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/configuracoes"
              className="text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Configurações</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-emerald-500" />
            Central de Importação de Dados
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Importe Clientes, Proprietários e Imóveis em massa através de planilhas Excel (.xlsx) ou Feed XML (Kenlo / Portais).
          </p>
        </div>

        {/* Abas de Navegação Rápida de Configurações */}
        <div className="flex items-center gap-2">
          <Link
            href="/configuracoes"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span>WhatsApp & Automação</span>
          </Link>
          <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4" />
            <span>Importação de Dados</span>
          </span>
        </div>
      </div>

      <ImportacaoDadosView />
    </div>
  );
}
