'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LogoUpload } from '../ui/LogoUpload';
import {
  Building2,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Kanban,
  ShieldCheck,
  Eye,
} from 'lucide-react';

export function ImobiliariaConfigForm() {
  const { currentTenant, atualizarImobiliaria } = useTenant();

  const [nome, setNome] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [moduloCrmAtivo, setModuloCrmAtivo] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sincroniza dados do tenant ativo
  useEffect(() => {
    if (currentTenant) {
      setNome(currentTenant.nome || '');
      setLogoUrl(currentTenant.logo_url || '');
      setTelefone(currentTenant.telefone || '');
      setEmail(currentTenant.email || '');
      setEndereco(currentTenant.endereco || '');
      setModuloCrmAtivo(currentTenant.modulo_crm_ativo !== false);
    }
  }, [currentTenant]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant?.id) return;
    if (!nome.trim()) {
      alert('O nome da imobiliária é obrigatório.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await atualizarImobiliaria(currentTenant.id, {
        nome: nome.trim(),
        logo_url: logoUrl.trim() || undefined,
        telefone: telefone.trim() || undefined,
        email: email.trim() || undefined,
        endereco: endereco.trim() || undefined,
        modulo_crm_ativo: moduloCrmAtivo,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Erro ao salvar dados da imobiliária:', err);
      alert('Houve um erro ao atualizar os dados. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = (name || '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name || 'IM').slice(0, 2).toUpperCase();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Card 1: Identidade Visual & Logo Oficial */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Identidade Visual &amp; Logo Oficial
            </CardTitle>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              White-Label
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Faça o upload da logo da sua imobiliária para substituir o círculo de iniciais e o texto em todos os cabeçalhos.
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Upload da Logo */}
          <LogoUpload
            label="Logo da Imobiliária (PNG ou SVG Transparente)"
            value={logoUrl}
            onChange={(url) => setLogoUrl(url)}
            disabled={isSaving}
            helpText="Recomendado: Arquivo em PNG ou SVG com fundo transparente. Altura máxima proporcional ajustada automaticamente."
          />

          {/* Pré-visualização ao Vivo nos Cabeçalhos */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Pré-visualização do Cabeçalho (Tempo Real)
              </span>
              <span className="text-[10px] text-slate-400">
                {logoUrl ? 'Exibindo Logo Personalizada' : 'Exibindo Padrão (Sem Logo)'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Preview Sidebar Web */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Topo do Menu Lateral (Web / PC)
                </span>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center min-h-[48px]">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={nome || 'Logo'}
                      className="max-h-10 max-w-[180px] w-auto h-auto object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0">
                        {getInitials(nome || 'EM')}
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-white text-xs block truncate">
                          {nome || 'Nome da Imobiliária'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Ficha Pública / Mobile */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Topo da Ficha Pública &amp; Mobile
                </span>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between min-h-[48px]">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={nome || 'Logo'}
                      className="max-h-8 max-w-[150px] w-auto h-auto object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-xs shrink-0">
                        {getInitials(nome || 'EM')}
                      </div>
                      <div>
                        <span className="font-extrabold text-white text-xs block">
                          {nome || 'Nome da Imobiliária'}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-medium">
                          Ficha do Imóvel
                        </span>
                      </div>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    by EasyMob
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Dados Gerais da Imobiliária */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Building2 className="w-5 h-5 text-emerald-500" />
            Dados Cadastrais da Imobiliária
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Essas informações são utilizadas nos relatórios certificados, mensagens automáticas e fichas públicas.
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome da Imobiliária"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Lagom Imóveis"
              required
            />

            <Input
              label="Telefone / WhatsApp de Contato"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Ex: (11) 99999-9999"
              icon={<Phone className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="E-mail Comercial"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@imobiliaria.com.br"
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Endereço da Sede"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Ex: Av. Paulista, 1000 - Cj 52"
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>

          {/* Opção do Módulo CRM */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Kanban className="w-4 h-4 text-emerald-500" />
                Módulo Funil de Vendas (CRM Kanban)
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Habilita a visualização do quadro de etapas de negociação para a equipe.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={moduloCrmAtivo}
                onChange={(e) => setModuloCrmAtivo(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Barra de Ações e Salvamento */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4" />
              Configurações salvas com sucesso!
            </span>
          )}
        </div>

        <Button type="submit" variant="primary" isLoading={isSaving} className="shadow-md">
          <Save className="w-4 h-4 mr-1.5" />
          Salvar Alterações da Imobiliária
        </Button>
      </div>
    </form>
  );
}
