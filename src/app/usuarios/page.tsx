'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Users,
  UserPlus,
  Shield,
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
  Briefcase,
} from 'lucide-react';
import { Usuario, Convite, UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useTenant } from '@/context/TenantContext';
import { cn } from '@/lib/utils';

export default function UsuariosPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useData();
  const { imobiliarias, currentTenant } = useTenant();

  const [users, setUsers] = useState<Usuario[]>([]);
  const [invites, setInvites] = useState<Convite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('todos');

  // Modal Gerar Convite
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [imobiliariaInvite, setImobiliariaInvite] = useState(currentTenant?.nome || 'EasyMob Imóveis');
  const [roleInvite, setRoleInvite] = useState<UserRole>('corretor');
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTableLinkId, setCopiedTableLinkId] = useState<string | null>(null);

  // Deletar Usuário
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Editar Usuário
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editImobiliaria, setEditImobiliaria] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('corretor');
  const [editNovaSenha, setEditNovaSenha] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Atualiza imobiliariaInvite ao abrir o modal ou mudar o tenant ativo
  useEffect(() => {
    if (currentTenant?.nome) {
      setImobiliariaInvite(currentTenant.nome);
    }
  }, [currentTenant]);

  const fetchUsersAndInvites = useCallback(async () => {
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
      showToast('Erro ao carregar lista de usuários.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsersAndInvites();
  }, [fetchUsersAndInvites]);

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingInvite(true);
    setGeneratedInviteUrl(null);

    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imobiliaria: imobiliariaInvite.trim() || 'EasyMob Imóveis',
          role: roleInvite,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.inviteUrl) {
        setGeneratedInviteUrl(data.inviteUrl);
        showToast(
          `Convite de ${roleInvite === 'gestor' ? 'Gestor' : 'Corretor'} gerado com sucesso (validade: 24h)!`,
          'success'
        );
        fetchUsersAndInvites();
      } else {
        showToast(data.error || 'Erro ao gerar convite.', 'error');
      }
    } catch {
      showToast('Erro de conexão ao gerar convite.', 'error');
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleCopyGeneratedUrl = () => {
    if (!generatedInviteUrl) return;
    navigator.clipboard.writeText(generatedInviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    showToast('Link do convite copiado para a área de transferência!', 'success');
  };

  const handleCopyTableUrl = (token: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}/cadastrar?token=${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedTableLinkId(id);
    setTimeout(() => setCopiedTableLinkId(null), 2500);
    showToast('Link do convite copiado!', 'success');
  };

  const handleDeleteUser = async (id: string, nome: string) => {
    if (currentUser?.id === id) {
      alert('Você não pode excluir sua própria conta de Administrador logada.');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir o usuário "${nome}"? Esta ação é irreversível.`)) {
      return;
    }

    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showToast(`Usuário "${nome}" excluído com sucesso.`, 'info');
      } else {
        showToast(data.error || 'Erro ao excluir usuário.', 'error');
      }
    } catch {
      showToast('Erro ao excluir usuário.', 'error');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleOpenEdit = (u: Usuario) => {
    setEditingUser(u);
    setEditNome(u.nome);
    setEditEmail(u.email);
    setEditTelefone(u.telefone || '');
    setEditImobiliaria(u.imobiliaria || 'EasyMob Imóveis');
    setEditRole(u.role);
    setEditNovaSenha('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editNome.trim() || !editEmail.trim()) {
      showToast('Nome e e-mail são obrigatórios.', 'error');
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: editNome.trim(),
          email: editEmail.trim(),
          telefone: editTelefone.trim() || undefined,
          imobiliaria: editImobiliaria.trim(),
          role: editRole,
          nova_senha: editNovaSenha.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? data.user : u)));
        setEditingUser(null);
        showToast(`Usuário "${data.user.nome}" atualizado com sucesso!`, 'success');
      } else {
        showToast(data.error || 'Erro ao atualizar usuário.', 'error');
      }
    } catch {
      showToast('Erro de conexão ao salvar alterações.', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const [nowMs, setNowMs] = useState<number>(0);

  useEffect(() => {
    setNowMs(Date.now());
  }, [invites]);

  // Filtro de Busca e Imobiliária
  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      u.nome.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.imobiliaria.toLowerCase().includes(q) ||
      (u.telefone && u.telefone.includes(q));

    const matchesTenant =
      selectedTenantFilter === 'todos' ||
      u.imobiliaria.toLowerCase() === selectedTenantFilter.toLowerCase();

    return matchesSearch && matchesTenant;
  });

  // Agrupamento dos usuários filtrados por Imobiliária
  const usersByImobiliaria = useMemo(() => {
    const groups: Record<string, Usuario[]> = {};

    filteredUsers.forEach((u) => {
      const rawTenant = u.imobiliaria?.trim();
      const key =
        u.role === 'admin' &&
        (!rawTenant || rawTenant.toLowerCase() === 'administração' || rawTenant.toLowerCase() === 'administracao')
          ? 'Administração Geral'
          : (rawTenant || 'Sem Imobiliária');

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(u);
    });

    // Ordenação: Grupos de administração primeiro, depois ordem alfabética
    return Object.entries(groups).sort(([a, usersA], [b, usersB]) => {
      const hasAdminA = usersA.some((u) => u.role === 'admin');
      const hasAdminB = usersB.some((u) => u.role === 'admin');
      if (hasAdminA && !hasAdminB) return -1;
      if (!hasAdminA && hasAdminB) return 1;
      return a.localeCompare(b);
    });
  }, [filteredUsers]);

  const handleOpenInviteForTenant = (tenantName: string) => {
    setImobiliariaInvite(tenantName);
    setGeneratedInviteUrl(null);
    setIsInviteModalOpen(true);
  };

  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalGestores = users.filter((u) => u.role === 'gestor').length;
  const totalCorretores = users.filter((u) => u.role === 'corretor').length;
  const totalInvitesAtivos = invites.filter(
    (i) => !i.used && new Date(i.expires_at).getTime() > (nowMs || 0)
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─── TOPO DA PÁGINA ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
            <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Gestão de Usuários &amp; Corretores
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Controle de acesso multi-tenant (Admin, Gestor e Corretor) e emissão de convites temporários
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setGeneratedInviteUrl(null);
            setIsInviteModalOpen(true);
          }}
          className="shadow-md flex items-center gap-2 font-bold text-xs"
        >
          <UserPlus className="w-4 h-4" />
          Gerar Convite de Membro
        </Button>
      </div>

      {/* ─── CARDS DE RESUMO / MÉTRICAS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                {users.length}
              </div>
              <div className="text-[11px] font-medium text-slate-400">Total Usuários</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                {totalAdmins}
              </div>
              <div className="text-[11px] font-medium text-slate-400">Administradores</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                {totalGestores}
              </div>
              <div className="text-[11px] font-medium text-slate-400">Gestores</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                {totalCorretores}
              </div>
              <div className="text-[11px] font-medium text-slate-400">Corretores</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                {totalInvitesAtivos}
              </div>
              <div className="text-[11px] font-medium text-slate-400">Convites Ativos</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── BARRA DE FILTRO E BUSCA ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
            Equipe por Imobiliária
          </span>
          <span className="text-xs font-bold text-slate-400">
            ({filteredUsers.length} {filteredUsers.length === 1 ? 'usuário' : 'usuários'})
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Seletor / Filtro por Imobiliária */}
          <div className="relative min-w-[200px] sm:min-w-[230px]">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedTenantFilter}
              onChange={(e) => setSelectedTenantFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-semibold cursor-pointer"
            >
              <option value="todos">🏢 Todas as Imobiliárias</option>
              {imobiliarias.map((imo) => (
                <option key={imo.id} value={imo.nome}>
                  {imo.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Campo de Busca */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* ─── LISTAGEM DE USUÁRIOS AGRUPADOS POR IMOBILIÁRIA ─── */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-12 text-center text-xs text-slate-400">
              Carregando lista de usuários...
            </CardContent>
          </Card>
        ) : usersByImobiliaria.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-12 text-center text-xs text-slate-400">
              Nenhum usuário encontrado para os filtros selecionados.
            </CardContent>
          </Card>
        ) : (
          usersByImobiliaria.map(([tenantName, groupUsers]) => {
            const isAdminGroup = groupUsers.some((u) => u.role === 'admin');

            return (
              <Card key={tenantName} className="border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <CardHeader className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-800 py-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs',
                        isAdminGroup
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      )}
                    >
                      {isAdminGroup ? <Shield className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {tenantName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {groupUsers.length} {groupUsers.length === 1 ? 'colaborador' : 'colaboradores'}
                      </span>
                    </div>
                  </div>

                  {!isAdminGroup && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenInviteForTenant(tenantName)}
                      className="text-xs font-semibold self-start sm:self-auto hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 hover:border-emerald-300"
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Convidar Corretor para {tenantName}
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4">Usuário</th>
                          <th className="py-2.5 px-4">Contato</th>
                          <th className="py-2.5 px-4">Perfil de Acesso</th>
                          <th className="py-2.5 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                        {groupUsers.map((u) => {
                          const isAdmin = u.role === 'admin';
                          const isSelf = currentUser?.id === u.id;

                          return (
                            <tr
                              key={u.id}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              {/* Nome & Avatar */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                    {u.nome.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                      <span>{u.nome}</span>
                                      {isSelf && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                          Você
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-400">{u.email}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Contato */}
                              <td className="py-3 px-4 font-mono text-[11px]">
                                {u.telefone ? (
                                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                    <Phone className="w-3 h-3 text-emerald-500" />
                                    {u.telefone}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>

                              {/* Perfil */}
                              <td className="py-3 px-4">
                                {u.role === 'admin' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 shadow-xs">
                                    <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                    <span>Administrador</span>
                                  </span>
                                ) : u.role === 'gestor' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs">
                                    <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                    <span>Gestor</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
                                    <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>Corretor</span>
                                  </span>
                                )}
                              </td>

                              {/* Ações */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(u)}
                                    title="Editar Usuário"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>

                                  {!isSelf && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUser(u.id, u.nome)}
                                      disabled={isDeletingId === u.id}
                                      title="Excluir Usuário"
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* ─── HISTÓRICO DE CONVITES GERADOS ─── */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-emerald-500" />
            Convites de Cadastro Gerados ({invites.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invites.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Nenhum convite gerado ainda. Clique em &quot;Gerar Convite de Corretor&quot; para convidar novos membros.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200/70 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Imobiliária</th>
                    <th className="py-3 px-4">Token do Link</th>
                    <th className="py-3 px-4">Validade</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Copiar Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {invites.map((inv) => {
                    const isExpired = new Date(inv.expires_at).getTime() < (nowMs || 0);
                    const isUsed = inv.used;
                    const isValid = !isExpired && !isUsed;

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold">{inv.imobiliaria}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {inv.token.slice(0, 16)}...
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500">
                          {new Date(inv.expires_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          {isUsed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Utilizado
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                              <AlertTriangle className="w-3 h-3 text-rose-500" />
                              Expirado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                              <Clock className="w-3 h-3" />
                              Válido (24h)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isValid && (
                            <button
                              type="button"
                              onClick={() => handleCopyTableUrl(inv.token, inv.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                            >
                              {copiedTableLinkId === inv.id ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copiar Link</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── MODAL GERAR CONVITE DE MEMBRO (CORRETOR / GESTOR) ─── */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Gerar Convite de Acesso"
        subtitle="Crie um link único com validade de 24 horas para cadastrar um Corretor ou Gestor"
        maxWidth="md"
      >
        {!generatedInviteUrl ? (
          <form onSubmit={handleGenerateInvite} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Imobiliária Vinculada ao Membro *
              </label>
              <div className="space-y-2">
                <select
                  value={imobiliariaInvite}
                  onChange={(e) => setImobiliariaInvite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                >
                  {imobiliarias.map((imo) => (
                    <option key={imo.id} value={imo.nome}>
                      🏢 {imo.nome}
                    </option>
                  ))}
                </select>

                {!imobiliarias.some((i) => i.nome === imobiliariaInvite) && (
                  <input
                    type="text"
                    required
                    value={imobiliariaInvite}
                    onChange={(e) => setImobiliariaInvite(e.target.value)}
                    placeholder="Digite o nome da nova imobiliária..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Perfil de Acesso do Convidado *
              </label>
              <select
                value={roleInvite}
                onChange={(e) => setRoleInvite(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
              >
                <option value="corretor">Corretor (Agenda restrita às suas próprias visitas)</option>
                <option value="gestor">Gestor (Visualiza todas as visitas e métricas da imobiliária)</option>
              </select>
              <p className="text-[11px] text-slate-400">
                {roleInvite === 'gestor'
                  ? 'O gestor terá visão panorâmica de todas as visitas agendadas por todos os corretores da imobiliária.'
                  : 'O corretor visualizará apenas os imóveis e clientes da imobiliária, mas sua agenda e visitas serão estritamente individuais.'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                Regras do Convite:
              </div>
              <ul className="text-[11px] text-slate-600 dark:text-slate-300 list-disc list-inside space-y-0.5">
                <li>Validade de 24 horas a partir da geração.</li>
                <li>Uso único (o link expira automaticamente após o primeiro cadastro).</li>
                <li>Atribui o perfil selecionado ({roleInvite === 'gestor' ? 'Gestor' : 'Corretor'}).</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="primary"
                isLoading={isGeneratingInvite}
                className="text-xs font-bold"
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Gerar Link de Convite
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Link de Convite Gerado!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Envie este link para o corretor completar seu cadastro no EasyMob:
              </p>
            </div>

            {/* Container do Link com Botão Copiar */}
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs text-emerald-700 dark:text-emerald-300">
              <span className="truncate flex-1 text-left select-all">
                {generatedInviteUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyGeneratedUrl}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer"
                title="Copiar Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGeneratedInviteUrl(null)}
                className="text-xs"
              >
                Gerar Outro Convite
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-xs font-bold"
              >
                Concluído
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL EDITAR USUÁRIO ─── */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Editar Usuário"
        subtitle={editingUser ? `Atualize as informações cadastrais de ${editingUser.nome}` : ''}
        maxWidth="md"
      >
        {editingUser && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="email@imobiliaria.com"
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
                  placeholder="11988887777"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Imobiliária *
                </label>
                <select
                  value={editImobiliaria}
                  onChange={(e) => setEditImobiliaria(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                >
                  {imobiliarias.map((imo) => (
                    <option key={imo.id} value={imo.nome}>
                      🏢 {imo.nome}
                    </option>
                  ))}
                  {!imobiliarias.some((i) => i.nome === editImobiliaria) && editImobiliaria && (
                    <option value={editImobiliaria}>🏢 {editImobiliaria}</option>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Perfil de Acesso *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                >
                  <option value="corretor">Corretor (Agenda individual)</option>
                  <option value="gestor">Gestor (Visão ampla da imobiliária)</option>
                  <option value="admin">Administrador (Super Admin)</option>
                </select>
              </div>
            </div>

            {/* Campo Opcional de Nova Senha */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Redefinir Senha (Opcional)</span>
                <span className="text-[10px] text-slate-400 font-normal">Deixe em branco para manter</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="password"
                  value={editNovaSenha}
                  onChange={(e) => setEditNovaSenha(e.target.value)}
                  placeholder="Digite uma nova senha caso queira redefinir..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
                className="text-xs"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="primary"
                isLoading={isSavingEdit}
                className="text-xs font-bold"
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
