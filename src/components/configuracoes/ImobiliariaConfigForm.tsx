'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
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
  ShieldCheck,
  Eye,
  Globe,
  Award,
  FileText,
  Lock,
  Search,
  AlertCircle,
} from 'lucide-react';

export function ImobiliariaConfigForm() {
  const { currentTenant, atualizarImobiliaria } = useTenant();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isGerente = user?.role === 'gestor' || (user?.role as string) === 'gerente';

  // Campos Cadastrais
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nome, setNome] = useState(''); // Nome Fantasia
  const [cnpj, setCnpj] = useState('');
  const [creciJ, setCreciJ] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [siteOficial, setSiteOficial] = useState('');

  // Endereço Detalhado
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // Logo Oficial
  const [logoUrl, setLogoUrl] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sincroniza dados do tenant ativo
  useEffect(() => {
    if (currentTenant) {
      setNome(currentTenant.nome || '');
      setRazaoSocial(currentTenant.razao_social || '');
      setCnpj(currentTenant.cnpj || '');
      setCreciJ(currentTenant.creci_j || '');
      setTelefone(currentTenant.telefone || '');
      setEmail(currentTenant.email || '');
      setSiteOficial(currentTenant.site_oficial || '');
      setLogoUrl(currentTenant.logo_url || '');

      setCep(currentTenant.cep || '');
      setLogradouro(currentTenant.logradouro || '');
      setNumero(currentTenant.numero || '');
      setComplemento(currentTenant.complemento || '');
      setBairro(currentTenant.bairro || '');
      setCidade(currentTenant.cidade || '');
      setEstado(currentTenant.estado || '');

      // Se houver endereço legado unificado e os campos novos estiverem vazios
      if (currentTenant.endereco && !currentTenant.logradouro) {
        setLogradouro(currentTenant.endereco);
      }
    }
  }, [currentTenant]);

  // Busca automática de endereço por CEP (ViaCEP)
  const handleBuscarCep = async (cepInput: string) => {
    const cleanCep = cepInput.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsSearchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setLogradouro(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
        setEstado(data.uf || '');
      }
    } catch {
      // ignore
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant?.id) return;
    setErrorMessage('');

    if (!nome.trim()) {
      setErrorMessage('O Nome Fantasia da imobiliária é obrigatório.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    // Formata o endereço completo para relatórios e fichas
    const partesEndereco = [
      logradouro.trim(),
      numero.trim() ? `nº ${numero.trim()}` : '',
      complemento.trim(),
      bairro.trim() ? `- ${bairro.trim()}` : '',
      cidade.trim() && estado.trim() ? `${cidade.trim()}/${estado.trim().toUpperCase()}` : cidade.trim(),
      cep.trim() ? `CEP: ${cep.trim()}` : '',
    ].filter(Boolean);

    const enderecoFormatado = partesEndereco.join(', ');

    try {
      await atualizarImobiliaria(currentTenant.id, {
        nome: nome.trim(),
        // Se for admin, atualiza Razão Social e CNPJ. Se for gerente, mantém os valores atuais
        razao_social: isAdmin ? razaoSocial.trim() || undefined : currentTenant.razao_social,
        cnpj: isAdmin ? cnpj.trim() || undefined : currentTenant.cnpj,
        creci_j: creciJ.trim() || undefined,
        site_oficial: siteOficial.trim() || undefined,
        telefone: telefone.trim() || undefined,
        email: email.trim() || undefined,
        logo_url: logoUrl.trim() || undefined,
        cep: cep.trim() || undefined,
        logradouro: logradouro.trim() || undefined,
        numero: numero.trim() || undefined,
        complemento: complemento.trim() || undefined,
        bairro: bairro.trim() || undefined,
        cidade: cidade.trim() || undefined,
        estado: estado.trim() || undefined,
        endereco: enderecoFormatado || undefined,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Erro ao salvar dados da imobiliária:', err);
      setErrorMessage('Houve um erro ao atualizar os dados. Tente novamente.');
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
      {/* ─── BLOCO 1 (TOPO): DADOS CADASTRAIS DA IMOBILIÁRIA ─── */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Building2 className="w-5 h-5 text-emerald-500" />
              Dados Cadastrais da Imobiliária
            </CardTitle>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {isAdmin ? 'Acesso Total (Admin)' : 'Modo Gerente'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Informações empresariais utilizadas em relatórios certificados de auditoria, mensagens de WhatsApp e fichas públicas.
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* Linha 1: Razão Social & Nome Fantasia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Razão Social (PJ)
                </label>
                {!isAdmin && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Exclusivo Admin
                  </span>
                )}
              </div>
              <Input
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                placeholder="Ex: Lagom Negócios Imobiliários Ltda"
                disabled={!isAdmin || isSaving}
                icon={<FileText className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Nome Fantasia (Exibição nos Cabeçalhos)"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Lagom Imóveis"
              icon={<Building2 className="w-4 h-4" />}
              required
              disabled={isSaving}
            />
          </div>

          {/* Linha 2: CNPJ & CRECI-J */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  CNPJ
                </label>
                {!isAdmin && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Exclusivo Admin
                  </span>
                )}
              </div>
              <Input
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="Ex: 00.000.000/0001-00"
                disabled={!isAdmin || isSaving}
                icon={<FileText className="w-4 h-4" />}
              />
            </div>

            <Input
              label="CRECI Jurídico (CRECI-J)"
              value={creciJ}
              onChange={(e) => setCreciJ(e.target.value)}
              placeholder="Ex: CRECI 12345-J"
              icon={<Award className="w-4 h-4" />}
              disabled={isSaving}
            />
          </div>

          {/* Linha 3: Contatos e Site */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Telefone / WhatsApp Comercial"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 99999-9999"
              icon={<Phone className="w-4 h-4" />}
              disabled={isSaving}
            />

            <Input
              label="E-mail Comercial"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@imobiliaria.com.br"
              icon={<Mail className="w-4 h-4" />}
              disabled={isSaving}
            />

            <Input
              label="Site Oficial / Domínio"
              value={siteOficial}
              onChange={(e) => setSiteOficial(e.target.value)}
              placeholder="www.lagomimoveis.com.br"
              icon={<Globe className="w-4 h-4" />}
              disabled={isSaving}
            />
          </div>

          {/* Linha 4: Endereço Estruturado */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Endereço da Sede</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <Input
                  label="CEP"
                  value={cep}
                  onChange={(e) => {
                    setCep(e.target.value);
                    if (e.target.value.replace(/\D/g, '').length === 8) {
                      handleBuscarCep(e.target.value);
                    }
                  }}
                  placeholder="00000-000"
                  icon={isSearchingCep ? <Search className="w-4 h-4 animate-spin text-emerald-500" /> : undefined}
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Rua / Logradouro"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  placeholder="Ex: Av. Paulista"
                />
              </div>

              <div className="sm:col-span-1">
                <Input
                  label="Número"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="1000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <Input
                  label="Complemento"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Cj 52 - Bloco A"
                />
              </div>

              <div className="sm:col-span-1">
                <Input
                  label="Bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Bela Vista"
                />
              </div>

              <div className="sm:col-span-1">
                <Input
                  label="Cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="São Paulo"
                />
              </div>

              <div className="sm:col-span-1">
                <Input
                  label="Estado (UF)"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── BLOCO 2 (ABAIXO): IDENTIDADE VISUAL & LOGO OFICIAL ─── */}
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
            Faça o upload da logo oficial da imobiliária para substituir o círculo de iniciais e o texto em todos os cabeçalhos.
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
                    <div className="p-1 px-2.5 rounded-xl bg-slate-100/95 shadow-sm border border-slate-200/90 flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoUrl}
                        alt={nome || 'Logo'}
                        className="max-h-7 max-w-[140px] w-auto h-auto object-contain"
                      />
                    </div>
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

      {/* Barra de Ações e Salvamento */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4" />
              Dados da imobiliária salvos com sucesso!
            </span>
          )}
          {errorMessage && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </span>
          )}
        </div>

        <Button type="submit" variant="primary" isLoading={isSaving} className="shadow-md">
          <Save className="w-4 h-4 mr-1.5" />
          Salvar Dados da Imobiliária
        </Button>
      </div>
    </form>
  );
}
