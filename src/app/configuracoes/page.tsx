'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ImobiliariaConfigForm } from '@/components/configuracoes/ImobiliariaConfigForm';
import { MeuPerfilConfigForm } from '@/components/configuracoes/MeuPerfilConfigForm';
import { WhatsAppConfigForm } from '@/components/configuracoes/WhatsAppConfigForm';
import { ImportacaoDadosView } from '@/components/configuracoes/ImportacaoDadosView';
import { Settings, MessageSquare, UploadCloud, Building2, User } from 'lucide-react';

type ConfigTab = 'imobiliaria' | 'meu-perfil' | 'whatsapp' | 'importacao';

export default function ConfiguracoesPage() {
  const { user } = useAuth();

  const isCorretor = user?.role === 'corretor';
  const podeVerImobiliaria = user?.role === 'admin' || user?.role === 'gestor' || (user?.role as string) === 'gerente';

  const [activeTab, setActiveTab] = useState<ConfigTab>('imobiliaria');

  // Se o usuário for Corretor, redireciona automaticamente para 'meu-perfil'
  useEffect(() => {
    if (isCorretor && activeTab === 'imobiliaria') {
      setActiveTab('meu-perfil');
    }
  }, [isCorretor, activeTab]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-500" />
            Configurações da Plataforma
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden md:block">
            {activeTab === 'imobiliaria'
              ? 'Gerencie os dados empresariais, razão social, CNPJ, CRECI-J e identidade visual da imobiliária.'
              : activeTab === 'meu-perfil'
              ? 'Gerencie seus dados pessoais, telefone, CRECI físico e alteração de senha de acesso.'
              : activeTab === 'whatsapp'
              ? 'Integre sua API do WhatsApp (Evolution API, Z-API, Meta) e customize as mensagens automáticas.'
              : 'Importe Clientes, Proprietários e Imóveis em massa através de planilhas Excel (.xlsx) ou Feed XML.'}
          </p>
        </div>

        {/* Abas Principais */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shrink-0 self-start sm:self-auto flex-wrap">
          {/* Sub-aba Imobiliária (Apenas Admin e Gerente) */}
          {podeVerImobiliaria && (
            <button
              type="button"
              onClick={() => setActiveTab('imobiliaria')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'imobiliaria'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Imobiliária</span>
            </button>
          )}

          {/* Sub-aba Meu Perfil (Para todos os perfis) */}
          <button
            type="button"
            onClick={() => setActiveTab('meu-perfil')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'meu-perfil'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Meu Perfil</span>
          </button>

          {/* Sub-aba WhatsApp & Automação */}
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
            <span>WhatsApp &amp; Automação</span>
          </button>

          {/* Sub-aba Central de Importação */}
          {podeVerImobiliaria && (
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
          )}
        </div>
      </div>

      {activeTab === 'imobiliaria' && podeVerImobiliaria && <ImobiliariaConfigForm />}
      {activeTab === 'meu-perfil' && <MeuPerfilConfigForm />}
      {activeTab === 'whatsapp' && <WhatsAppConfigForm />}
      {activeTab === 'importacao' && podeVerImobiliaria && <ImportacaoDadosView />}
    </div>
  );
}
