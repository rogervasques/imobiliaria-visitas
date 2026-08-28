'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Users2,
  UserPlus,
  Shield,
  ShieldCheck,
  UserCheck,
  Trash2,
  Copy,
  Check,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Link as LinkIcon,
  Search,
  Pencil,
  Lock,
  MessageSquare,
  Award,
  Calendar,
  X,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { Usuario, Convite, UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useTenant } from '@/context/TenantContext';
import { cn } from '@/lib/utils';

export default function EquipePage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useData();
  const { currentTenant, imobiliarias } = useTenant();

  const isAdmin = currentUser?.role === 'admin';
  const isGerente = currentUser?.role === 'gestor' || (currentUser?.role as string) === 'gerente';

  const [users, setUsers] = useState<Usuario[]>([]);
  const [invites, setInvites] = useState<Convite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | 'gestor' | 'corretor' | 'admin'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [activeTab, setActiveTab] = useState<'membros' | 'convites'>('membros');

  // Modal Gerar Convite
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<UserRole>('corretor');
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [deletingInviteId, setDeletingInviteId] = useState<string | null>(null);
  const [isCleaningInvites, setIsCleaningInvites] = useState(false);

  // Gaveta Lateral / Modal de Detalhes do Membro
  const [selectedMember, setSelectedMember] = useState<Usuario | null>(null);
  const [drawerNome, setDrawerNome] = useState('');
  const [drawerEmail, setDrawerEmail] = useState('');
  const [drawerTelefone, setDrawerTelefone] = useState('');
  const [drawerCreci, setDrawerCreci] = useState('');
  const [drawerRole, setDrawerRole] = useState<UserRole>('corretor');
  const [drawerAtivo, setDrawerAtivo] = useState(true);
  const [drawerNovaSenha, setDrawerNovaSenha] = useState('');
  const [isSavingDrawer, setIsSavingDrawer] = useState(false);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  // Busca dados de usuários e convites
  const fetchEquipeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resUsers, resInvites] = await Promise.all([
        fetch('/api/users', { cache: 'no-store' }),
        fetch('/api/invites', { cache: 'no-store' }),
      ]);

      const dataUsers = await resUsers.json();
      const dataInvites = await resInvites.json();

      if (dataUsers.success && dataUsers.users) {
        setUsers(dataUsers.users);
      }
      if (dataInvites.success && dataInvites.invites) {
        setInvites(dataInvites.invites);
      }
    } catch {
      showToast('Erro ao carregar dados da equipe.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchEquipeData();
  }, [fetchEquipeData]);

  // Limite de licenças da imobiliária ativa
  const limiteLicencas = useMemo(() => {
    if (currentTenant?.limite_usuarios && currentTenant.limite_usuarios > 0) {
      return currentTenant.limite_usuarios;
    }
    const found = imobiliarias.find(
      (i) => i.nome.toLowerCase() === currentTenant?.nome?.toLowerCase()
    );
    return found?.limite_usuarios || 10;
  }, [currentTenant, imobiliarias]);

  // Usuários vinculados ao tenant ativo
  const tenantUsers = useMemo(() => {
    if (!currentTenant?.nome) return users;
    return users.filter((u) => {
      if (isAdmin && currentTenant.nome === 'Administração') return true;
      return u.imobiliaria?.toLowerCase() === currentTenant.nome.toLowerCase();
    });
  }, [users, currentTenant, isAdmin]);

  // Contagem de usuários ativos
  const totalUsuariosAtivos = useMemo(() => {
    return tenantUsers.filter((u) => u.ativo !== false).length;
  }, [tenantUsers]);

  const atingiuLimite = totalUsuariosAtivos >= limiteLicencas;
  const vagasRestantes = Math.max(0, limiteLicencas - totalUsuariosAtivos);
  const percentualUso = Math.min(100, Math.round((totalUsuariosAtivos / limiteLicencas) * 100));

  // Filtra usuários para exibição
  const filteredUsers = useMemo(() => {
    return tenantUsers.filter((u) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.nome?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.telefone?.includes(q) ||
        u.creci?.toLowerCase().includes(q);

      const matchRole =
        roleFilter === 'todos' ||
        u.role === roleFilter ||
        (roleFilter === 'gestor' && (u.role as string) === 'gerente');

      const matchStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'ativos' && u.ativo !== false) ||
        (statusFilter === 'inativos' && u.ativo === false);

      return matchSearch && matchRole && matchStatus;
    });
  }, [tenantUsers, searchTerm, roleFilter, statusFilter]);

  // Filtra convites da imobiliária ativa
  const tenantInvites = useMemo(() => {
    if (!currentTenant?.nome) return invites;
    return invites.filter((inv) => {
      if (isAdmin && currentTenant.nome === 'Administração') return true;
      return inv.imobiliaria?.toLowerCase() === currentTenant.nome.toLowerCase();
    });
  }, [invites, currentTenant, isAdmin]);

  const hasExpiredOrUsedInvites = useMemo(() => {
    const now = Date.now();
    return tenantInvites.some(
      (inv) => inv.used || new Date(inv.expires_at).getTime() < now
    );
  }, [tenantInvites]);

  const getInitials = (name: string) => {
    const parts = (name || '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name || 'US').slice(0, 2).toUpperCase();
  };

  const formatarDataAmigavel = (dataStr?: string) => {
    if (!dataStr) return 'Nunca acessou';
    try {
      const d = new Date(dataStr);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dataStr;
    }
  };

  // Abre a gaveta lateral
  const handleOpenMemberDrawer = (membro: Usuario) => {
    setSelectedMember(membro);
    setDrawerNome(membro.nome || '');
    setDrawerEmail(membro.email || '');
    setDrawerTelefone(membro.telefone || '');
    setDrawerCreci(membro.creci || '');
    setDrawerRole(membro.role === 'admin' ? 'admin' : membro.role === 'gestor' ? 'gestor' : 'corretor');
    setDrawerAtivo(membro.ativo !== false);
    setDrawerNovaSenha('');
  };

  // Salva alterações na gaveta lateral
  const handleSaveMemberDrawer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    if (!drawerNome.trim()) {
      showToast('O nome completo é obrigatório.', 'error');
      return;
    }

    setIsSavingDrawer(true);
    try {
      const res = await fetch(`/api/users/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: drawerNome.trim(),
          email: drawerEmail.trim() || undefined,
          telefone: drawerTelefone.trim() || undefined,
          creci: drawerCreci.trim() || undefined,
          role: drawerRole,
          ativo: drawerAtivo,
          nova_senha: drawerNovaSenha.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao salvar alterações.');
      }

      showToast(`Membro "${drawerNome}" atualizado com sucesso!`, 'success');
      setSelectedMember(null);
      await fetchEquipeData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar membro.';
      showToast(msg, 'error');
    } finally {
      setIsSavingDrawer(false);
    }
  };

  // Exclui membro
  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    if (selectedMember.id === currentUser?.id) {
      showToast('Você não pode excluir sua própria conta.', 'error');
      return;
    }

    if (!confirm(`Tem certeza que deseja remover ${selectedMember.nome} da equipe?`)) {
      return;
    }

    setIsDeletingMember(true);
    try {
      const res = await fetch(`/api/users/${selectedMember.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao excluir membro.');
      }

      showToast('Membro removido da equipe com sucesso.', 'info');
      setSelectedMember(null);
      await fetchEquipeData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao remover membro.';
      showToast(msg, 'error');
    } finally {
      setIsDeletingMember(false);
    }
  };

  // Gerar Convite
  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (atingiuLimite) {
      showToast('Limite de licenças atingido. Não é possível gerar novos convites.', 'error');
      return;
    }

    setIsGeneratingInvite(true);
    setGeneratedInviteUrl(null);
    setCopiedLink(false);

    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imobiliaria: currentTenant?.nome || currentUser?.imobiliaria,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao gerar convite.');
      }

      const currentOrigin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || '');
      const cleanInviteUrl = data.invite?.token
        ? `${currentOrigin}/cadastrar?token=${data.invite.token}`
        : (data.inviteUrl ? data.inviteUrl.replace(/https?:\/\/[^\/]+/, currentOrigin) : '');

      setGeneratedInviteUrl(cleanInviteUrl);
      showToast('Convite gerado com sucesso (validade: 24h)!', 'success');
      await fetchEquipeData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar convite.';
      showToast(msg, 'error');
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleCopyLink = (url: string, inviteId?: string) => {
    navigator.clipboard.writeText(url);
    if (inviteId) {
      setCopiedInviteId(inviteId);
      setTimeout(() => setCopiedInviteId(null), 2500);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
    showToast('Link do convite copiado para a área de transferência!', 'success');
  };

  const handleShareWhatsApp = (url: string, role: string) => {
    const cargoNome = role === 'gestor' ? 'Gerente' : 'Corretor';
    const imoNome = currentTenant?.nome || 'nossa imobiliária';
    const texto = encodeURIComponent(
      `Olá! Você foi convidado para fazer parte da equipe da *${imoNome}* como *${cargoNome}* no EasyMob.\n\nAcesse o link abaixo para concluir seu cadastro:\n${url}\n\n⏱️ _Este link é exclusivo e expira em 24 horas._`
    );
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
  };

  // Excluir convite individual
  const handleDeleteInvite = async (inv: Convite) => {
    const cargoNome = inv.role === 'gestor' ? 'Gerente' : 'Corretor';
    if (!confirm(`Deseja realmente apagar este convite de ${cargoNome}?`)) {
      return;
    }

    setDeletingInviteId(inv.id);
    try {
      const res = await fetch('/api/invites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inv.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao apagar convite.');
      }

      setInvites((prev) => prev.filter((i) => i.id !== inv.id));
      showToast('Convite apagado com sucesso!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao apagar convite.';
      console.error('Erro ao apagar convite:', err);
      showToast(msg, 'error');
    } finally {
      setDeletingInviteId(null);
    }
  };

  // Limpar convites expirados e utilizados em lote
  const handleCleanExpiredInvites = async () => {
    if (!confirm('Deseja apagar todos os convites expirados ou já utilizados desta imobiliária?')) {
      return;
    }

    setIsCleaningInvites(true);
    try {
      const res = await fetch('/api/invites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clean_expired_or_used' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao limpar convites.');
      }

      const now = Date.now();
      setInvites((prev) =>
        prev.filter((inv) => {
          const isExp = new Date(inv.expires_at).getTime() < now;
          return !isExp && !inv.used;
        })
      );
      showToast(data.message || 'Convites expirados limpos com sucesso!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao limpar convites.';
      console.error('Erro ao limpar convites:', err);
      showToast(msg, 'error');
    } finally {
      setIsCleaningInvites(false);
    }
  };

  // Se for corretor, bloqueia acesso
  if (!isAdmin && !isGerente) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Acesso Restrito</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Apenas Administradores e Gerentes têm permissão para acessar a gestão de equipe e convites.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* ─── TOPO: TÍTULO & CONTADOR DE LICENÇAS ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                Gestão de Equipe &amp; Corretores
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gerencie corretores, gerentes, permissões de acesso e convites para {currentTenant?.nome || 'sua imobiliária'}
              </p>
            </div>
          </div>
        </div>

        {/* Botão Convidar Membro */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            disabled={atingiuLimite}
            onClick={() => {
              setGeneratedInviteUrl(null);
              setCopiedLink(false);
              setIsInviteModalOpen(true);
            }}
            className={cn(
              'shadow-md font-bold text-xs flex items-center gap-2',
              atingiuLimite && 'opacity-60 cursor-not-allowed'
            )}
            title={
              atingiuLimite
                ? 'Limite de licenças atingido. Contate o administrador.'
                : 'Gerar link de convite com validade de 24h'
            }
          >
            {atingiuLimite ? <Lock className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            + Convidar Membro
          </Button>
        </div>
      </div>

      {/* ─── CARD DE LICENÇAS & USO NO TOPO ─── */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden bg-gradient-to-r from-white via-slate-50/50 to-emerald-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/20">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Licenças da Imobiliária
                </span>
                {atingiuLimite ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse">
                    Limite Atingido
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {vagasRestantes} {vagasRestantes === 1 ? 'vaga disponível' : 'vagas disponíveis'}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
                  Usuários: {totalUsuariosAtivos} / {limiteLicencas} contratados
                </span>
              </div>
            </div>

            {/* Barra de Progresso Visual */}
            <div className="sm:w-64 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <span>Uso do Plano</span>
                <span>{percentualUso}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    percentualUso >= 100
                      ? 'bg-rose-500'
                      : percentualUso >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  )}
                  style={{ width: `${percentualUso}%` }}
                />
              </div>
            </div>
          </div>

          {/* Aviso se atingiu limite */}
          {atingiuLimite && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>
                <strong>Limite de membros atingido ({limiteLicencas}/{limiteLicencas}).</strong> Para convidar novos corretores ou gerentes, entre em contato com o suporte ou administrador para expandir a quantidade de licenças contratadas.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── ABAS & BARRA DE FILTROS ─── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Alternador Membros / Convites */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shrink-0 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('membros')}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer',
                activeTab === 'membros'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <Users2 className="w-4 h-4" />
              <span>Membros da Equipe ({tenantUsers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('convites')}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer',
                activeTab === 'convites'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <Clock className="w-4 h-4" />
              <span>Convites Gerados ({tenantInvites.length})</span>
            </button>
          </div>

          {/* Campo de Busca */}
          {activeTab === 'membros' && (
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, email, telefone ou CRECI..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Filtros de Cargo e Status */}
        {activeTab === 'membros' && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Filtrar por:
            </span>

            {/* Cargo */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todos os Cargos</option>
              <option value="gestor">Gerentes / Gestores</option>
              <option value="corretor">Corretores de Imóveis</option>
              {isAdmin && <option value="admin">Administradores Master</option>}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativos">Apenas Ativos</option>
              <option value="inativos">Apenas Inativos</option>
            </select>

            {(searchTerm || roleFilter !== 'todos' || statusFilter !== 'todos') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('todos');
                  setStatusFilter('todos');
                }}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline ml-1"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── TAB 1: LISTAGEM DE MEMBROS (CARDS) ─── */}
      {activeTab === 'membros' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Carregando membros da equipe...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Users2 className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
                Nenhum membro encontrado com os filtros selecionados
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tente ajustar os termos de busca ou clique em &quot;Convidar Membro&quot; para adicionar corretores.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((membro) => {
                const isAtivo = membro.ativo !== false;
                const isUserAdmin = membro.role === 'admin';
                const isUserGerente = membro.role === 'gestor' || (membro.role as string) === 'gerente';

                return (
                  <Card
                    key={membro.id}
                    onClick={() => handleOpenMemberDrawer(membro)}
                    className={cn(
                      'border transition-all duration-200 cursor-pointer hover:shadow-md group relative overflow-hidden flex flex-col justify-between',
                      !isAtivo
                        ? 'opacity-70 bg-slate-50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-700'
                        : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                    )}
                  >
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        {/* Avatar & Nome */}
                        <div className="flex items-center gap-3 min-w-0">
                          {membro.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={membro.avatar_url}
                              alt={membro.nome}
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div
                              className={cn(
                                'w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0',
                                isUserAdmin
                                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-500'
                                  : isUserGerente
                                  ? 'bg-gradient-to-tr from-blue-600 to-cyan-500'
                                  : 'bg-gradient-to-tr from-emerald-600 to-teal-400'
                              )}
                            >
                              {getInitials(membro.nome)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {membro.nome}
                            </h3>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {membro.email}
                            </span>
                          </div>
                        </div>

                        {/* Status Ativo / Inativo */}
                        <div className="shrink-0">
                          {isAtivo ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Inativo
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 space-y-3">
                      {/* Badges de Cargo e CRECI */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isUserAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <ShieldCheck className="w-3 h-3" />
                            Administrador
                          </span>
                        ) : isUserGerente ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <Shield className="w-3 h-3" />
                            Gerente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <UserCheck className="w-3 h-3" />
                            Corretor
                          </span>
                        )}

                        {membro.creci ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800">
                            <Award className="w-3 h-3 text-amber-500" />
                            {membro.creci}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80">
                            Sem CRECI
                          </span>
                        )}
                      </div>

                      {/* Informações Rápidas e Botão de Ação */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 truncate">
                          {membro.telefone ? (
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                              {membro.telefone}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Sem telefone cadastrado</span>
                          )}
                        </div>

                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          Ver Detalhes
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: HISTÓRICO DE CONVITES ─── */}
      {activeTab === 'convites' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  Histórico de Links de Convite (Validade: 24 Horas)
                </span>
                <span className="text-[11px] text-slate-400 font-medium block">
                  Total de {tenantInvites.length} convite(s) gerado(s)
                </span>
              </div>
              {hasExpiredOrUsedInvites && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCleanExpiredInvites}
                  disabled={isCleaningInvites}
                  className="text-xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 h-8 self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  {isCleaningInvites ? 'Limpando...' : 'Limpar Expirados / Utilizados'}
                </Button>
              )}
            </div>

            {tenantInvites.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhum convite gerado recentemente para esta imobiliária.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {tenantInvites.map((inv) => {
                  const isExpired = new Date(inv.expires_at).getTime() < Date.now();
                  const isUsed = inv.used;
                  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/cadastrar?token=${inv.token}`;

                  return (
                    <div
                      key={inv.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                            Perfil: {inv.role === 'gestor' ? 'Gerente' : 'Corretor'}
                          </span>
                          {isUsed ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                              Utilizado / Cadastro Concluído
                            </span>
                          ) : isExpired ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                              Expirado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              Disponível (Válido até {formatarDataAmigavel(inv.expires_at)})
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 block truncate max-w-md">
                          {inviteUrl}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isUsed && !isExpired && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyLink(inviteUrl, inv.id)}
                              className="text-xs"
                            >
                              {copiedInviteId === inv.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                                  Copiado!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 mr-1" />
                                  Copiar Link
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShareWhatsApp(inviteUrl, inv.role || 'corretor')}
                              className="text-xs text-emerald-600 hover:text-emerald-700"
                            >
                              <MessageSquare className="w-3.5 h-3.5 mr-1" />
                              WhatsApp
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInvite(inv)}
                          disabled={deletingInviteId === inv.id}
                          className="text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-2 h-8 w-8 rounded-lg"
                          title="Apagar convite"
                        >
                          <Trash2
                            className={cn(
                              'w-4 h-4',
                              deletingInviteId === inv.id && 'animate-spin text-rose-500'
                            )}
                          />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL / GAVETA DE DETALHES DO MEMBRO ─── */}
      <Modal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title="Gerenciar Membro da Equipe"
        subtitle={selectedMember ? `${selectedMember.nome} • ${currentTenant?.nome}` : ''}
      >
        {selectedMember && (
          <form onSubmit={handleSaveMemberDrawer} className="space-y-4">
            {/* Cabeçalho do Membro */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-sm">
                  {getInitials(selectedMember.nome)}
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                    {selectedMember.nome}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Cadastrado em: {formatarDataAmigavel(selectedMember.created_at)}
                  </span>
                </div>
              </div>

              {/* Botão de WhatsApp direto se houver telefone */}
              {selectedMember.telefone && (
                <a
                  href={`https://wa.me/55${selectedMember.telefone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Abrir WhatsApp
                </a>
              )}
            </div>

            {/* Linha 1: Nome e Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={drawerNome}
                  onChange={(e) => setDrawerNome(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  E-mail de Acesso
                </label>
                <input
                  type="email"
                  value={drawerEmail}
                  onChange={(e) => setDrawerEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Linha 2: Telefone e CRECI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Telefone / WhatsApp Comercial
                </label>
                <input
                  type="text"
                  value={drawerTelefone}
                  onChange={(e) => setDrawerTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  CRECI Físico (F)
                </label>
                <input
                  type="text"
                  value={drawerCreci}
                  onChange={(e) => setDrawerCreci(e.target.value)}
                  placeholder="Ex: 123456-F"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Linha 3: Gestão de Cargo / Perfil de Acesso */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Cargo &amp; Nível de Acesso
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={cn(
                    'p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all',
                    drawerRole === 'corretor'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    value="corretor"
                    checked={drawerRole === 'corretor'}
                    onChange={() => setDrawerRole('corretor')}
                    className="sr-only"
                  />
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <div className="text-xs">
                    <span className="block font-bold">Corretor</span>
                    <span className="text-[10px] opacity-75">Acesso operacional</span>
                  </div>
                </label>

                <label
                  className={cn(
                    'p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all',
                    drawerRole === 'gestor'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    value="gestor"
                    checked={drawerRole === 'gestor'}
                    onChange={() => setDrawerRole('gestor')}
                    className="sr-only"
                  />
                  <Shield className="w-4 h-4 text-blue-500" />
                  <div className="text-xs">
                    <span className="block font-bold">Gerente</span>
                    <span className="text-[10px] opacity-75">Gestão de equipe</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Linha 4: Switch de Ativação / Desativação */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Status de Atividade na Imobiliária
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {drawerAtivo
                    ? 'Membro ativo com acesso total liberado às ferramentas.'
                    : 'Membro inativo (acesso bloqueado, mantendo todo o histórico salvo).'}
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={drawerAtivo}
                  onChange={(e) => setDrawerAtivo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Linha 5: Redefinir Senha */}
            <div className="space-y-1 pt-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                Redefinir Senha Provisória (Opcional)
              </label>
              <input
                type="password"
                value={drawerNovaSenha}
                onChange={(e) => setDrawerNovaSenha(e.target.value)}
                placeholder="Deixe em branco para manter a senha atual"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Barra de Ações */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              {selectedMember.id !== currentUser?.id ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteMember}
                  isLoading={isDeletingMember}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Remover da Equipe
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMember(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSavingDrawer}
                  className="font-bold text-xs"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* ─── MODAL GERAR CONVITE OTIMIZADO (24H) ─── */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Gerar Convite de Acesso (24 Horas)"
        subtitle={`Vincular novo membro a ${currentTenant?.nome || 'sua imobiliária'}`}
      >
        <form onSubmit={handleGenerateInvite} className="space-y-4">
          {/* Imobiliária Vinculada Automaticamente */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                  Imobiliária Vinculada
                </span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                  {currentTenant?.nome || 'EasyMob Imóveis'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Automático
            </span>
          </div>

          {/* Seleção do Perfil de Acesso: Corretor ou Gerente */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Selecione o Perfil de Acesso <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label
                className={cn(
                  'p-3.5 rounded-2xl border flex flex-col gap-1.5 cursor-pointer transition-all',
                  inviteRole === 'corretor'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                )}
              >
                <input
                  type="radio"
                  name="inviteRole"
                  value="corretor"
                  checked={inviteRole === 'corretor'}
                  onChange={() => setInviteRole('corretor')}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                  {inviteRole === 'corretor' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <span className="font-extrabold text-xs">Corretor</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Acesso aos imóveis, CRM, clientes, visitas e agendamentos.
                </span>
              </label>

              <label
                className={cn(
                  'p-3.5 rounded-2xl border flex flex-col gap-1.5 cursor-pointer transition-all',
                  inviteRole === 'gestor'
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                )}
              >
                <input
                  type="radio"
                  name="inviteRole"
                  value="gestor"
                  checked={inviteRole === 'gestor'}
                  onChange={() => setInviteRole('gestor')}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <Shield className="w-5 h-5 text-blue-500" />
                  {inviteRole === 'gestor' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <span className="font-extrabold text-xs">Gerente</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Gestão da equipe, relatórios gerenciais e dados da imobiliária.
                </span>
              </label>
            </div>
          </div>

          {/* Resultado: Link Gerado */}
          {generatedInviteUrl ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Link de Convite Gerado!
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Válido por 24 horas
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all">
                {generatedInviteUrl}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(generatedInviteUrl)}
                  className="w-full text-xs font-bold"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copiar Link
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleShareWhatsApp(generatedInviteUrl, inviteRole)}
                  className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />
                  Enviar no WhatsApp
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsInviteModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isGeneratingInvite}
                className="font-bold text-xs"
              >
                Gerar Link de Convite
              </Button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
