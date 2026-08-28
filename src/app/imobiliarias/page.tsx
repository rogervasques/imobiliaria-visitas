'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Store,
  Building2,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Users,
  CalendarDays,
  Check,
  Search,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Kanban,
  AlertTriangle,
} from 'lucide-react';
import { Imobiliaria, Imovel, Visita, Usuario } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';
import { LogoUpload } from '@/components/ui/LogoUpload';
import Link from 'next/link';

export default function ImobiliariasPage() {
  const { user } = useAuth();
  const { imobiliarias, currentTenant, setCurrentTenant, adicionarImobiliaria, atualizarImobiliaria, removerImobiliaria } = useTenant();
  const { showToast, allImoveis, allVisitas, renomearImobiliariaCascade } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Usuario[]>([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('/api/users', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.users) {
          setUsers(data.users);
        }
      } catch {
        // ignore
      }
    }
    loadUsers();
  }, []);

  // Modal Criação
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCleanModalOpen, setIsCleanModalOpen] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanConfirmedCheckbox, setCleanConfirmedCheckbox] = useState(false);
  const [cleanConfirmText, setCleanConfirmText] = useState('');

  const [createNome, setCreateNome] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createTelefone, setCreateTelefone] = useState('');
  const [createEndereco, setCreateEndereco] = useState('');
  const [createLogoUrl, setCreateLogoUrl] = useState('');
  const [createModuloCrmAtivo, setCreateModuloCrmAtivo] = useState(true);
  const [createLimiteUsuarios, setCreateLimiteUsuarios] = useState<number>(10);
  const [isCreating, setIsCreating] = useState(false);

  const handleExecuteSeed = async () => {
    setIsSeeding(true);
    try {
      const activeTenantName = currentTenant?.nome || 'Lagom Imóveis';
      const activeTenantId = currentTenant?.id;

      const res = await fetch('/api/admin/seed-test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imobiliaria: activeTenantName,
          imobiliaria_id: activeTenantId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao gerar dados de teste.');
      }

      // Limpar caches do localStorage
      try {
        localStorage.removeItem('easymob_visitas_visitas');
        localStorage.removeItem('easymob_visitas_imoveis');
        localStorage.removeItem('easymob_visitas_clientes');
        localStorage.removeItem('easymob_visitas_proprietarios');
        localStorage.removeItem('imobiliaria_visitas_visitas');
        localStorage.removeItem('imobiliaria_visitas_imoveis');
        localStorage.removeItem('imobiliaria_visitas_clientes');
        localStorage.removeItem('imobiliaria_visitas_proprietarios');
        localStorage.removeItem('easymob_item_tenants_map');
      } catch {
        // ignore
      }

      showToast(`Base de demonstração (Varginha/MG) vinculada à "${activeTenantName}" populada com sucesso! Recarregando...`, 'success');
      setIsSeedModalOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      showToast(err.message || 'Falha ao popular base de dados.', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleExecuteClean = async () => {
    if (!cleanConfirmedCheckbox || cleanConfirmText.trim().toUpperCase() !== 'LIMPAR') {
      showToast('Por favor, confirme o checkbox e digite a palavra LIMPAR para continuar.', 'error');
      return;
    }

    setIsCleaning(true);
    try {
      const activeTenantName = currentTenant?.nome || 'Lagom Imóveis';
      const activeTenantId = currentTenant?.id;

      const res = await fetch('/api/admin/clean-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmText: cleanConfirmText.trim().toUpperCase(),
          imobiliaria: activeTenantName,
          imobiliaria_id: activeTenantId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao limpar banco de dados.');
      }

      // Limpar caches do localStorage
      try {
        localStorage.removeItem('easymob_visitas_visitas');
        localStorage.removeItem('easymob_visitas_imoveis');
        localStorage.removeItem('easymob_visitas_clientes');
        localStorage.removeItem('easymob_visitas_proprietarios');
        localStorage.removeItem('imobiliaria_visitas_visitas');
        localStorage.removeItem('imobiliaria_visitas_imoveis');
        localStorage.removeItem('imobiliaria_visitas_clientes');
        localStorage.removeItem('imobiliaria_visitas_proprietarios');
        localStorage.removeItem('easymob_item_tenants_map');
      } catch {
        // ignore
      }

      showToast(`Base de dados da imobiliária "${activeTenantName}" limpa com sucesso!`, 'success');
      setIsCleanModalOpen(false);
      setCleanConfirmedCheckbox(false);
      setCleanConfirmText('');

      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      showToast(err.message || 'Falha ao limpar base de dados.', 'error');
    } finally {
      setIsCleaning(false);
    }
  };

  // Modal Edição
  const [editingTenant, setEditingTenant] = useState<Imobiliaria | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editEndereco, setEditEndereco] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editModuloCrmAtivo, setEditModuloCrmAtivo] = useState(true);
  const [editLimiteUsuarios, setEditLimiteUsuarios] = useState<number>(10);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Exclusão
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Filtro de Busca
  const filteredImobiliarias = imobiliarias.filter((imo) => {
    const q = searchTerm.toLowerCase();
    return (
      imo.nome.toLowerCase().includes(q) ||
      (imo.email && imo.email.toLowerCase().includes(q)) ||
      (imo.telefone && imo.telefone.includes(q)) ||
      (imo.endereco && imo.endereco.toLowerCase().includes(q))
    );
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createNome.trim()) {
      showToast('O nome da imobiliária é obrigatório.', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const created = await adicionarImobiliaria({
        nome: createNome.trim(),
        email: createEmail.trim() || undefined,
        telefone: createTelefone.trim() || undefined,
        endereco: createEndereco.trim() || undefined,
        logo_url: createLogoUrl.trim() || undefined,
        modulo_crm_ativo: createModuloCrmAtivo,
        limite_usuarios: Number(createLimiteUsuarios) || 10,
      });

      showToast(`Imobiliária "${created.nome}" cadastrada com sucesso!`, 'success');
      setCreateNome('');
      setCreateEmail('');
      setCreateTelefone('');
      setCreateEndereco('');
      setCreateLogoUrl('');
      setCreateModuloCrmAtivo(true);
      setCreateLimiteUsuarios(10);
      setIsCreateModalOpen(false);
    } catch {
      showToast('Erro ao cadastrar imobiliária.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (imo: Imobiliaria) => {
    setEditingTenant(imo);
    setEditNome(imo.nome);
    setEditEmail(imo.email || '');
    setEditTelefone(imo.telefone || '');
    setEditEndereco(imo.endereco || '');
    setEditLogoUrl(imo.logo_url || '');
    setEditModuloCrmAtivo(imo.modulo_crm_ativo !== false);
    setEditLimiteUsuarios(imo.limite_usuarios || 10);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    if (!editNome.trim()) {
      showToast('O nome da imobiliária não pode ser vazio.', 'error');
      return;
    }

    setIsSavingEdit(true);
    try {
      const oldName = editingTenant.nome;
      const newName = editNome.trim();

      await atualizarImobiliaria(editingTenant.id, {
        nome: newName,
        email: editEmail.trim() || undefined,
        telefone: editTelefone.trim() || undefined,
        endereco: editEndereco.trim() || undefined,
        logo_url: editLogoUrl.trim() || undefined,
        modulo_crm_ativo: editModuloCrmAtivo,
        limite_usuarios: Number(editLimiteUsuarios) || 10,
      });

      if (oldName.toLowerCase() !== newName.toLowerCase()) {
        await renomearImobiliariaCascade(oldName, newName);
      }

      showToast(`Imobiliária "${newName}" atualizada com sucesso!`, 'success');
      setEditingTenant(null);
    } catch {
      showToast('Erro ao atualizar imobiliária.', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (imo: Imobiliaria) => {
    if (imobiliarias.length <= 1) {
      alert('Você não pode excluir a única imobiliária cadastrada.');
      return;
    }

    if (
      !confirm(
        `Tem certeza que deseja excluir a imobiliária "${imo.nome}"? Os imóveis e usuários vinculados precisarão ser reatribuídos.`
      )
    ) {
      return;
    }

    setIsDeletingId(imo.id);
    try {
      await removerImobiliaria(imo.id);
      showToast(`Imobiliária "${imo.nome}" removida.`, 'info');
    } catch {
      showToast('Erro ao excluir imobiliária.', 'error');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Se o usuário não for admin, exibe aviso
  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
          <Store className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Acesso Restrito</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Apenas administradores do sistema podem visualizar e gerenciar as imobiliárias cadastradas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─── TOPO DA PÁGINA ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
            <Store className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Gestão de Imobiliárias &amp; Franquias
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cadastre novas agências, configure os dados corporativos e alterne o contexto multi-tenant
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botão de Limpeza com Dupla Verificação */}
          <Button
            variant="outline"
            onClick={() => {
              setCleanConfirmedCheckbox(false);
              setCleanConfirmText('');
              setIsCleanModalOpen(true);
            }}
            className="border-rose-300 dark:border-rose-800/80 hover:bg-rose-50 text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 flex items-center gap-2 font-bold text-xs shadow-xs"
            title={`Limpar imóveis, clientes, proprietários e visitas de ${currentTenant?.nome || 'Lagom Imóveis'}`}
          >
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Limpar Base ({currentTenant?.nome || 'Imobiliária'})
          </Button>

          {/* Botão de Povoamento no Tenant Ativo */}
          <Button
            variant="outline"
            onClick={() => setIsSeedModalOpen(true)}
            className="border-emerald-500/40 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40 flex items-center gap-2 font-bold text-xs shadow-xs"
            title={`Popular base de teste em Varginha/MG vinculada à ${currentTenant?.nome || 'Lagom Imóveis'}`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            + Povoar Base ({currentTenant?.nome || 'Varginha/MG'})
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-md flex items-center gap-2 font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Nova Imobiliária
          </Button>
        </div>
      </div>

      {/* ─── CARDS DE MÉTRICAS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                {imobiliarias.length}
              </div>
              <div className="text-[11px] font-medium text-slate-400">Imobiliárias Ativas</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                {allImoveis.length}
              </div>
              <div className="text-[11px] font-medium text-slate-400">Imóveis no Sistema</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                {allVisitas.length}
              </div>
              <div className="text-[11px] font-medium text-slate-400">Visitas Agendadas</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-emerald-500/20">
              {getInitials(currentTenant?.nome || 'EM')}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-emerald-800 dark:text-emerald-300 truncate">
                {currentTenant?.nome || 'EasyMob Imóveis'}
              </div>
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Imobiliária Selecionada
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── BARRA DE PESQUISA ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
            Todas as Imobiliárias ({filteredImobiliarias.length})
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, telefone, email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* ─── GRID DE CARDS DAS IMOBILIÁRIAS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredImobiliarias.map((imo) => {
          const isSelected = imo.nome.toLowerCase() === currentTenant?.nome?.toLowerCase();
          const isPrimeiraImobiliaria = imobiliarias[0]?.id === imo.id;

          const imoImoveisCount = (allImoveis || []).filter((i: Imovel) => {
            if (i.imobiliaria_id && i.imobiliaria_id === imo.id) return true;
            if (i.imobiliaria && i.imobiliaria.trim().toLowerCase() === imo.nome.trim().toLowerCase()) return true;
            if (
              isPrimeiraImobiliaria &&
              (!i.imobiliaria ||
                i.imobiliaria.toLowerCase() === 'easymob imóveis' ||
                i.imobiliaria.toLowerCase() === 'easymob')
            ) {
              return true;
            }
            return false;
          }).length;

          const imoVisitasCount = (allVisitas || []).filter((v: Visita) => {
            if (v.imobiliaria_id && v.imobiliaria_id === imo.id) return true;
            if (v.imobiliaria && v.imobiliaria.trim().toLowerCase() === imo.nome.trim().toLowerCase()) return true;
            if (
              isPrimeiraImobiliaria &&
              (!v.imobiliaria ||
                v.imobiliaria.toLowerCase() === 'easymob imóveis' ||
                v.imobiliaria.toLowerCase() === 'easymob')
            ) {
              return true;
            }
            return false;
          }).length;

          const imoUsersCount = (users || []).filter((u: Usuario) => {
            if (u.imobiliaria_id && u.imobiliaria_id === imo.id) return true;
            if (u.imobiliaria && u.imobiliaria.trim().toLowerCase() === imo.nome.trim().toLowerCase()) return true;
            if (
              isPrimeiraImobiliaria &&
              (!u.imobiliaria ||
                u.imobiliaria.toLowerCase() === 'easymob imóveis' ||
                u.imobiliaria.toLowerCase() === 'easymob')
            ) {
              return true;
            }
            return false;
          }).length;

          return (
            <Card
              key={imo.id}
              className={cn(
                'border transition-all duration-200 overflow-hidden flex flex-col justify-between',
                isSelected
                  ? 'border-emerald-500 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              )}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  {/* Logo + Título */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-base shadow-md shadow-emerald-500/20 shrink-0">
                      {getInitials(imo.nome)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base truncate">
                          {imo.nome}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Imobiliária Cadastrada
                      </span>
                    </div>
                  </div>

                  {/* Badge Ativa / CRM / Ações */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                        <Check className="w-3 h-3" />
                        Ativa
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 shrink-0" title="Limite total de usuários/licenças contratadas">
                      <Users className="w-2.5 h-2.5 text-amber-500" />
                      {imo.limite_usuarios || 10} Licenças
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(imo)}
                      title="Editar Dados da Imobiliária"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(imo)}
                      disabled={isDeletingId === imo.id || imobiliarias.length <= 1}
                      title="Excluir Imobiliária"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                {/* Contatos */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {imo.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-mono">{imo.telefone}</span>
                    </div>
                  )}
                  {imo.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{imo.email}</span>
                    </div>
                  )}
                  {imo.endereco && (
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{imo.endereco}</span>
                    </div>
                  )}
                  {!imo.telefone && !imo.email && !imo.endereco && (
                    <div className="text-slate-400 text-[11px]">
                      Nenhum contato cadastrado. Clique no lápis para adicionar.
                    </div>
                  )}
                </div>

                {/* Métricas dessa Imobiliária: Imóveis, Visitas e Membros */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-center">
                  <div className="p-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="font-black text-sm text-slate-900 dark:text-slate-100">
                      {imoImoveisCount}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Imóveis</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="font-black text-sm text-slate-900 dark:text-slate-100">
                      {imoVisitasCount}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Visitas</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="font-black text-sm text-slate-900 dark:text-slate-100">
                      {imoUsersCount}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Membros</div>
                  </div>
                </div>

                {/* Botão de Alternar */}
                <div className="pt-2">
                  {isSelected ? (
                    <div className="w-full py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm">
                      <Check className="w-4 h-4" />
                      Imobiliária Selecionada
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentTenant(imo.nome);
                        showToast(`Contexto alterado para "${imo.nome}"!`, 'success');
                      }}
                      className="w-full text-xs font-bold hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300"
                    >
                      <span>Alternar para esta</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ─── MODAL CADASTRAR IMOBILIÁRIA ─── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Cadastrar Nova Imobiliária"
        subtitle="Adicione uma nova empresa para operar com seus próprios corretores e imóveis"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Nome da Imobiliária / Franquia <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={createNome}
              onChange={(e) => setCreateNome(e.target.value)}
              placeholder="Ex: Prime Imóveis Alphaville"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                E-mail de Contato
              </label>
              <input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="contato@empresa.com.br"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={createTelefone}
                onChange={(e) => setCreateTelefone(e.target.value)}
                placeholder="11999998888"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Endereço Completo
              </label>
              <input
                type="text"
                value={createEndereco}
                onChange={(e) => setCreateEndereco(e.target.value)}
                placeholder="Ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Limite de Licenças / Usuários Contratados <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={500}
                required
                value={createLimiteUsuarios}
                onChange={(e) => setCreateLimiteUsuarios(parseInt(e.target.value) || 1)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>
          </div>

          {/* Upload de Logo */}
          <LogoUpload
            label="Logo da Imobiliária (PNG ou SVG Transparente)"
            value={createLogoUrl}
            onChange={setCreateLogoUrl}
          />

          {/* Feature Toggle: Módulo CRM */}
          <label className="flex items-center gap-3 p-3 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/60 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={createModuloCrmAtivo}
              onChange={(e) => setCreateModuloCrmAtivo(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded-md border-sky-300 focus:ring-sky-500"
            />
            <div className="min-w-0 flex-1 text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Kanban className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Módulo CRM Ativo (Funil de Vendas)
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">
                Habilita a aba de CRM no menu lateral e o quadro Kanban em 7 etapas para esta imobiliária.
              </span>
            </div>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isCreating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Cadastrar Imobiliária
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL EDITAR IMOBILIÁRIA ─── */}
      <Modal
        isOpen={!!editingTenant}
        onClose={() => setEditingTenant(null)}
        title="Editar Imobiliária"
        subtitle={editingTenant ? `Atualize os dados de ${editingTenant.nome}` : ''}
      >
        {editingTenant && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Nome da Imobiliária <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  E-mail de Contato
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={editTelefone}
                  onChange={(e) => setEditTelefone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  value={editEndereco}
                  onChange={(e) => setEditEndereco(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Limite de Licenças / Usuários Contratados <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  required
                  value={editLimiteUsuarios}
                  onChange={(e) => setEditLimiteUsuarios(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>
            </div>

            {/* Upload de Logo */}
            <LogoUpload
              label="Logo da Imobiliária (PNG ou SVG Transparente)"
              value={editLogoUrl}
              onChange={setEditLogoUrl}
            />

            {/* Feature Toggle: Módulo CRM */}
            <label className="flex items-center gap-3 p-3 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/60 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editModuloCrmAtivo}
                onChange={(e) => setEditModuloCrmAtivo(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded-md border-sky-300 focus:ring-sky-500"
              />
              <div className="min-w-0 flex-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Kanban className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  Módulo CRM Ativo (Funil de Vendas)
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">
                  Habilita a aba de CRM no menu lateral e o quadro Kanban em 7 etapas para esta imobiliária.
                </span>
              </div>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingTenant(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSavingEdit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ─── MODAL CONFIRMAÇÃO SEED VARGINHA/MG ─── */}
      <Modal
        isOpen={isSeedModalOpen}
        onClose={() => !isSeeding && setIsSeedModalOpen(false)}
        title="Popular Base de Testes - Varginha/MG"
        subtitle="Geração de massa de dados realistas e verossímeis"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <div className="font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              O que será gerado no sistema:
            </div>
            <ul className="space-y-1.5 list-disc pl-4 text-[11px] text-slate-600 dark:text-slate-300">
              <li><strong>30 Proprietários</strong> com telefone seguro: <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded text-emerald-800 dark:text-emerald-300">(35) 99999-9999</code></li>
              <li><strong>70 Imóveis em Varginha/MG</strong> (bairros reais: Vila Pinto, Jd. Eliana, Centro, etc.) com galeria de 5 fotos de alta resolução</li>
              <li><strong>50 Clientes / Leads</strong> com preferências de busca no CRM (Tel: <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded text-emerald-800 dark:text-emerald-300">(35) 98888-8888</code>)</li>
              <li><strong>47 Visitas &amp; Roteiros Multi-Imóveis</strong> distribuídos ao longo de 30 dias (15 dias passados e 15 dias futuros)</li>
            </ul>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Esta rotina limpa as tabelas operacionais e insere o conjunto completo de demonstração. As contas de usuários (Administrador) permanecem preservadas.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSeeding}
              onClick={() => setIsSeedModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSeeding}
              onClick={handleExecuteSeed}
              className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Confirmar e Povoar Base
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL LIMPEZA DE DADOS (DUPLA VERIFICAÇÃO) ─── */}
      <Modal
        isOpen={isCleanModalOpen}
        onClose={() => !isCleaning && setIsCleanModalOpen(false)}
        title="Limpar Base Operacional (Dupla Verificação)"
        subtitle={`Exclusão permanente dos dados operacionais da imobiliária ${currentTenant?.nome || 'ativa'}`}
      >
        <div className="space-y-4">
          {/* Alerta de Perigo */}
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-300 space-y-2">
            <div className="font-black flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              Atenção: Ação Destrutiva e Irreversível!
            </div>
            <p className="text-[11px] leading-relaxed text-rose-800 dark:text-rose-300/90">
              Esta ação apagará permanentemente todos os <strong>imóveis</strong>, <strong>clientes</strong>, <strong>proprietários</strong>, <strong>agendamentos de visitas</strong> e <strong>logs</strong> da imobiliária <strong>{currentTenant?.nome || 'Lagom Imóveis'}</strong>.
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              As contas de usuários e convites não serão afetadas.
            </p>
          </div>

          {/* 1ª Verificação: Checkbox de Ciência */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={cleanConfirmedCheckbox}
              onChange={(e) => setCleanConfirmedCheckbox(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
              1ª Verificação: Estou ciente de que esta ação é irreversível e apagará todos os dados operacionais da <strong>{currentTenant?.nome || 'imobiliária'}</strong>.
            </span>
          </label>

          {/* 2ª Verificação: Digitar LIMPAR */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              2ª Verificação: Digite <code className="text-rose-600 dark:text-rose-400 font-mono font-black bg-rose-100 dark:bg-rose-950/60 px-1 py-0.5 rounded">LIMPAR</code> para desbloquear o botão:
            </label>
            <input
              type="text"
              value={cleanConfirmText}
              onChange={(e) => setCleanConfirmText(e.target.value)}
              placeholder="Digite LIMPAR"
              disabled={!cleanConfirmedCheckbox || isCleaning}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono font-black tracking-widest text-rose-600 dark:text-rose-400 uppercase placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isCleaning}
              onClick={() => setIsCleanModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isCleaning}
              disabled={!cleanConfirmedCheckbox || cleanConfirmText.trim().toUpperCase() !== 'LIMPAR' || isCleaning}
              onClick={handleExecuteClean}
              className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs shadow-md"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Confirmar e Limpar Banco
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
