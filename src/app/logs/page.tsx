'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  ShieldCheck,
  History,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  Calendar,
  User,
  Database,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  FileText,
  Download,
  RefreshCw,
  Eye,
  ShieldAlert,
  Building2,
  Users,
  CalendarDays,
  UserCheck,
  Sparkles,
  DollarSign,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useTenant } from '@/context/TenantContext';
import { LogSistema, ItemLixeira } from '@/types';
import { cn } from '@/lib/utils';

export default function LogsAdminPage() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const {
    carregarLogsSistema,
    carregarLixeira,
    restaurarRegistro,
    excluirDefinitivoLixeira,
    purgarLixeiraExpirados,
    showToast,
  } = useData();

  // Abas principais
  const [activeTab, setActiveTab] = useState<'auditoria' | 'lixeira'>('auditoria');

  // Estado da aba de Auditoria
  const [logs, setLogs] = useState<LogSistema[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [searchLog, setSearchLog] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [filtroAcao, setFiltroAcao] = useState('todos');
  const [filtroTabela, setFiltroTabela] = useState('todos');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [paginaLogs, setPaginaLogs] = useState(1);
  const itensPorPaginaLogs = 15;
  const [logSelecionado, setLogSelecionado] = useState<LogSistema | null>(null);

  // Estado da aba de Lixeira
  const [itensLixeira, setItensLixeira] = useState<ItemLixeira[]>([]);
  const [isLoadingLixeira, setIsLoadingLixeira] = useState(true);
  const [filtroTipoLixeira, setFiltroTipoLixeira] = useState<'todos' | 'imovel' | 'cliente' | 'visita' | 'proprietario'>('todos');
  const [searchLixeira, setSearchLixeira] = useState('');
  const [itemRestaurando, setItemRestaurando] = useState<string | null>(null);
  const [itemExcluindo, setItemExcluindo] = useState<ItemLixeira | null>(null);
  const [isPurgando, setIsPurgando] = useState(false);

  const isAdmin = user?.role === 'admin';

  // -------------------------------------------------------------
  // CARREGAR DADOS
  // -------------------------------------------------------------
  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const data = await carregarLogsSistema({
        usuarioEmail: filtroUsuario !== 'todos' ? filtroUsuario : undefined,
        acao: filtroAcao !== 'todos' ? filtroAcao : undefined,
        tabela: filtroTabela !== 'todos' ? filtroTabela : undefined,
        dataInicio: filtroDataInicio || undefined,
        dataFim: filtroDataFim || undefined,
        limit: 200,
      });
      setLogs(data);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [carregarLogsSistema, filtroUsuario, filtroAcao, filtroTabela, filtroDataInicio, filtroDataFim]);

  const fetchLixeira = useCallback(async () => {
    setIsLoadingLixeira(true);
    try {
      const items = await carregarLixeira();
      setItensLixeira(items);
    } catch (err) {
      console.error('Erro ao carregar lixeira:', err);
    } finally {
      setIsLoadingLixeira(false);
    }
  }, [carregarLixeira]);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'auditoria') {
        fetchLogs();
      } else {
        fetchLixeira();
      }
    }
  }, [isAdmin, activeTab, fetchLogs, fetchLixeira]);

  // Lista única de usuários para o filtro
  const listaUsuarios = useMemo(() => {
    const emails = new Set<string>();
    logs.forEach((l) => {
      if (l.usuario_email) emails.add(l.usuario_email);
    });
    return Array.from(emails);
  }, [logs]);

  // Logs filtrados
  const logsFiltrados = useMemo(() => {
    return logs.filter((log) => {
      if (searchLog) {
        const query = searchLog.toLowerCase();
        const matchesQuery =
          log.usuario_email.toLowerCase().includes(query) ||
          log.usuario_nome?.toLowerCase().includes(query) ||
          log.acao.toLowerCase().includes(query) ||
          log.tabela.toLowerCase().includes(query) ||
          log.registro_id?.toLowerCase().includes(query) ||
          JSON.stringify(log.detalhes || {}).toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }
      return true;
    });
  }, [logs, searchLog]);

  // Paginação de Logs
  const totalPaginasLogs = Math.ceil(logsFiltrados.length / itensPorPaginaLogs) || 1;
  const logsPaginados = useMemo(() => {
    const start = (paginaLogs - 1) * itensPorPaginaLogs;
    return logsFiltrados.slice(start, start + itensPorPaginaLogs);
  }, [logsFiltrados, paginaLogs]);

  // Lixeira filtrada
  const lixeiraFiltrada = useMemo(() => {
    return itensLixeira.filter((item) => {
      if (filtroTipoLixeira !== 'todos' && item.tipo !== filtroTipoLixeira) return false;
      if (searchLixeira) {
        const query = searchLixeira.toLowerCase();
        const matchesQuery =
          item.titulo.toLowerCase().includes(query) ||
          item.subtitulo?.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }
      return true;
    });
  }, [itensLixeira, filtroTipoLixeira, searchLixeira]);

  // Métricas rápidas da auditoria
  const metricasLogs = useMemo(() => {
    const total = logs.length;
    const exclusoes = logs.filter((l) => l.acao.includes('excluir')).length;
    const precos = logs.filter((l) => l.acao.includes('preco')).length;
    const crm = logs.filter((l) => l.acao.includes('crm') || l.acao.includes('etapa')).length;
    return { total, exclusoes, precos, crm };
  }, [logs]);

  // Métricas da lixeira
  const metricasLixeira = useMemo(() => {
    const total = itensLixeira.length;
    const imoveis = itensLixeira.filter((i) => i.tipo === 'imovel').length;
    const clientes = itensLixeira.filter((i) => i.tipo === 'cliente').length;
    const visitas = itensLixeira.filter((i) => i.tipo === 'visita').length;
    const criticos = itensLixeira.filter((i) => i.dias_restantes <= 7).length;
    return { total, imoveis, clientes, visitas, criticos };
  }, [itensLixeira]);

  // -------------------------------------------------------------
  // AÇÕES DA LIXEIRA
  // -------------------------------------------------------------
  const handleRestaurar = async (item: ItemLixeira) => {
    setItemRestaurando(item.id);
    try {
      await restaurarRegistro(item.tabela, item.id);
      setItensLixeira((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error('Erro ao restaurar:', err);
    } finally {
      setItemRestaurando(null);
    }
  };

  const handleExcluirDefinitivo = async () => {
    if (!itemExcluindo) return;
    try {
      await excluirDefinitivoLixeira(itemExcluindo.tabela, itemExcluindo.id);
      setItensLixeira((prev) => prev.filter((i) => i.id !== itemExcluindo.id));
      setItemExcluindo(null);
    } catch (err) {
      console.error('Erro ao excluir definitivamente:', err);
    }
  };

  const handlePurgarExpirados = async () => {
    if (!confirm('Deseja executar a purga automática de todos os registros excluídos há mais de 60 dias?')) return;
    setIsPurgando(true);
    try {
      await purgarLixeiraExpirados();
      fetchLixeira();
    } finally {
      setIsPurgando(false);
    }
  };

  const exportarLogsCsv = () => {
    if (logsFiltrados.length === 0) {
      showToast('Nenhum log para exportar.', 'info');
      return;
    }

    const headers = ['ID', 'Data/Hora', 'Usuário Email', 'Usuário Nome', 'Ação', 'Tabela', 'Registro ID', 'Detalhes'];
    const rows = logsFiltrados.map((l) => [
      `"${l.id}"`,
      `"${new Date(l.criado_em).toLocaleString('pt-BR')}"`,
      `"${l.usuario_email}"`,
      `"${l.usuario_nome || ''}"`,
      `"${l.acao}"`,
      `"${l.tabela}"`,
      `"${l.registro_id || ''}"`,
      `"${JSON.stringify(l.detalhes || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exportação CSV gerada com sucesso!', 'success');
  };

  // -------------------------------------------------------------
  // PROTEÇÃO DE ROTA ADMIN
  // -------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Acesso Restrito ao Administrador</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6 text-sm">
          A visualização do histórico de auditoria e a gestão da lixeira com retenção de dados são exclusivas para usuários administradores.
        </p>
        <Button onClick={() => window.history.back()} variant="outline">
          Voltar para a página anterior
        </Button>
      </div>
    );
  }

  // Formatador visual de ações
  const renderAcaoBadge = (acao: string) => {
    if (acao.includes('excluir_soft')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
          <Trash2 className="w-3 h-3" /> Exclusão (Lixeira)
        </span>
      );
    }
    if (acao.includes('restaurar')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <RotateCcw className="w-3 h-3" /> Restaurado
        </span>
      );
    }
    if (acao.includes('excluir_hard') || acao.includes('purge')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-white dark:bg-black dark:text-rose-400">
          <AlertCircle className="w-3 h-3" /> Purga Definitiva
        </span>
      );
    }
    if (acao.includes('preco')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          <DollarSign className="w-3 h-3" /> Alteração de Preço
        </span>
      );
    }
    if (acao.includes('crm') || acao.includes('etapa')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
          <TrendingUp className="w-3 h-3" /> Avanço no CRM
        </span>
      );
    }
    if (acao.includes('criar') || acao.includes('adicionar')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          <Sparkles className="w-3 h-3" /> Cadastro
        </span>
      );
    }
    if (acao.includes('status')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
          <CheckCircle2 className="w-3 h-3" /> Status Alterado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <FileText className="w-3 h-3" /> {acao.replace(/_/g, ' ')}
      </span>
    );
  };

  const renderTabelaIcon = (tabela: string) => {
    switch (tabela) {
      case 'imoveis':
        return <Building2 className="w-4 h-4 text-amber-500" />;
      case 'clientes':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'visitas':
        return <CalendarDays className="w-4 h-4 text-emerald-500" />;
      case 'proprietarios':
        return <UserCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <Database className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── CABEÇALHO PRINCIPAL COM IDENTIDADE VISUAL ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Auditoria, Logs & Retenção
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rastreamento de operações críticas e lixeira segura com retenção automática de 60 dias.
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE ABAS */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setActiveTab('auditoria')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer',
              activeTab === 'auditoria'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <History className="w-4 h-4" />
            Histórico de Atividades
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              {logs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lixeira')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer',
              activeTab === 'lixeira'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            Lixeira & Recuperação (60d)
            {itensLixeira.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 font-bold">
                {itensLixeira.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          ABA 1: HISTÓRICO DE ATIVIDADES / AUDITORIA
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'auditoria' && (
        <div className="space-y-6">
          {/* CARDS DE RESUMO DE ATIVIDADES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total de Registros de Log</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{metricasLogs.total}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Operações salvas no banco</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Alterações de Preço</p>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{metricasLogs.precos}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Variações de valores registradas</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Movimentações CRM</p>
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{metricasLogs.crm}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Avanços no funil de vendas</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Exclusões & Soft Deletes</p>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{metricasLogs.exclusoes}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Enviados para a lixeira</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BARRA DE FILTROS AVANÇADOS */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* BUSCA POR TEXTO */}
                <div className="relative lg:col-span-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchLog}
                    onChange={(e) => {
                      setSearchLog(e.target.value);
                      setPaginaLogs(1);
                    }}
                    placeholder="Buscar por usuário, tabela, ação ou ID..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* FILTRO USUÁRIO */}
                <div>
                  <select
                    value={filtroUsuario}
                    onChange={(e) => {
                      setFiltroUsuario(e.target.value);
                      setPaginaLogs(1);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="todos">Todos os Corretores / Usuários</option>
                    {listaUsuarios.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* FILTRO TABELA */}
                <div>
                  <select
                    value={filtroTabela}
                    onChange={(e) => {
                      setFiltroTabela(e.target.value);
                      setPaginaLogs(1);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="todos">Todas as Tabelas</option>
                    <option value="imoveis">Imóveis</option>
                    <option value="clientes">Clientes</option>
                    <option value="visitas">Visitas</option>
                    <option value="proprietarios">Proprietários</option>
                    <option value="configuracoes_whatsapp">WhatsApp Config</option>
                  </select>
                </div>

                {/* FILTRO AÇÃO */}
                <div>
                  <select
                    value={filtroAcao}
                    onChange={(e) => {
                      setFiltroAcao(e.target.value);
                      setPaginaLogs(1);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="todos">Todas as Ações</option>
                    <option value="criar_imovel">Criar Imóvel</option>
                    <option value="atualizar_preco_imovel">Atualizar Preço</option>
                    <option value="excluir_soft_imovel">Excluir Imóvel (Soft)</option>
                    <option value="restaurar_imovel">Restaurar Imóvel</option>
                    <option value="criar_cliente">Criar Cliente</option>
                    <option value="mover_etapa_crm">Mover Etapa CRM</option>
                    <option value="excluir_soft_cliente">Excluir Cliente (Soft)</option>
                    <option value="restaurar_cliente">Restaurar Cliente</option>
                    <option value="criar_visita">Criar Visita</option>
                    <option value="status_visita">Status da Visita</option>
                    <option value="excluir_soft_visita">Excluir Visita (Soft)</option>
                    <option value="restaurar_visita">Restaurar Visita</option>
                  </select>
                </div>
              </div>

              {/* LINHA DE DATAS E AÇÕES RÁPIDAS */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> De:
                  </span>
                  <input
                    type="date"
                    value={filtroDataInicio}
                    onChange={(e) => setFiltroDataInicio(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                  <span className="text-xs text-slate-400">Até:</span>
                  <input
                    type="date"
                    value={filtroDataFim}
                    onChange={(e) => setFiltroDataFim(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                  {(filtroDataInicio || filtroDataFim || filtroUsuario !== 'todos' || filtroAcao !== 'todos' || filtroTabela !== 'todos' || searchLog) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchLog('');
                        setFiltroUsuario('todos');
                        setFiltroAcao('todos');
                        setFiltroTabela('todos');
                        setFiltroDataInicio('');
                        setFiltroDataFim('');
                      }}
                      className="text-xs text-rose-500 hover:text-rose-600 font-medium ml-2 cursor-pointer"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchLogs}
                    disabled={isLoadingLogs}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className={cn('w-3.5 h-3.5', isLoadingLogs && 'animate-spin')} />
                    Atualizar
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportarLogsCsv}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    Exportar CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TABELA DE AUDITORIA */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Data & Hora</th>
                    <th className="py-3 px-4">Usuário / Corretor</th>
                    <th className="py-3 px-4">Ação</th>
                    <th className="py-3 px-4">Módulo</th>
                    <th className="py-3 px-4">Resumo da Alteração</th>
                    <th className="py-3 px-4 text-right">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {isLoadingLogs ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                          <span>Carregando logs de auditoria...</span>
                        </div>
                      </td>
                    </tr>
                  ) : logsPaginados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <History className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                          <span className="font-medium">Nenhum registro de log encontrado para os filtros selecionados.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logsPaginados.map((log) => {
                      const dataFormatada = new Date(log.criado_em).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      });

                      // Resumo amigável dos detalhes
                      let resumo = '';
                      const det = log.detalhes || {};
                      if (det.preco_antigo !== undefined && det.preco_novo !== undefined) {
                        resumo = `Preço: R$ ${Number(det.preco_antigo).toLocaleString('pt-BR')} ➔ R$ ${Number(det.preco_novo).toLocaleString('pt-BR')}`;
                      } else if (det.etapa_anterior && det.etapa_nova) {
                        resumo = `Funil: ${det.etapa_anterior} ➔ ${det.etapa_nova}`;
                      } else if (det.status_anterior && det.status_novo) {
                        resumo = `Status: ${det.status_anterior} ➔ ${det.status_novo}`;
                      } else if (det.titulo) {
                        resumo = `${det.titulo}`;
                      } else if (det.nome) {
                        resumo = `${det.nome}`;
                      } else if (det.motivo) {
                        resumo = `Motivo: ${det.motivo}`;
                      } else {
                        resumo = log.registro_id ? `ID: ${log.registro_id.slice(0, 8)}...` : '-';
                      }

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {dataFormatada}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {log.usuario_nome || log.usuario_email.split('@')[0]}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{log.usuario_email}</div>
                          </td>
                          <td className="py-3 px-4">{renderAcaoBadge(log.acao)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-medium capitalize">
                              {renderTabelaIcon(log.tabela)}
                              <span>{log.tabela}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300" title={resumo}>
                            {resumo}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setLogSelecionado(log)}
                              className="h-7 w-7 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Visualizar detalhes completos em JSON"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500 hover:text-emerald-600" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* CONTROLES DE PAGINAÇÃO */}
            {logsFiltrados.length > itensPorPaginaLogs && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div>
                  Mostrando {Math.min(logsFiltrados.length, (paginaLogs - 1) * itensPorPaginaLogs + 1)} até{' '}
                  {Math.min(logsFiltrados.length, paginaLogs * itensPorPaginaLogs)} de {logsFiltrados.length} registros
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPaginaLogs((p) => Math.max(1, p - 1))}
                    disabled={paginaLogs === 1}
                    className="h-8 px-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-3 py-1 font-bold text-slate-700 dark:text-slate-200">
                    {paginaLogs} / {totalPaginasLogs}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPaginaLogs((p) => Math.min(totalPaginasLogs, p + 1))}
                    disabled={paginaLogs === totalPaginasLogs}
                    className="h-8 px-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          ABA 2: LIXEIRA & RETENÇÃO DE 60 DIAS
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'lixeira' && (
        <div className="space-y-6">
          {/* BANNER INFORMATIVO DA POLÍTICA DE RETENÇÃO */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                  Política de Retenção de 60 Dias Ativa
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                  Itens excluídos por corretores ou gestores permanecem em quarentena recuperável por 60 dias. Após este
                  período, a purga automática do banco remove o registro definitivamente.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handlePurgarExpirados}
              isLoading={isPurgando}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs whitespace-nowrap shadow-xs shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
              Executar Purga &gt;60d Agora
            </Button>
          </div>

          {/* CARDS DE RESUMO DA LIXEIRA */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setFiltroTipoLixeira('todos')}
              className={cn(
                'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                filtroTipoLixeira === 'todos'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 border-transparent shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Total na Lixeira</span>
                <Layers className="w-4 h-4 opacity-70" />
              </div>
              <div className="text-2xl font-black mt-1">{metricasLixeira.total}</div>
            </button>

            <button
              type="button"
              onClick={() => setFiltroTipoLixeira('imovel')}
              className={cn(
                'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                filtroTipoLixeira === 'imovel'
                  ? 'bg-amber-600 text-white border-transparent shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Imóveis</span>
                <Building2 className="w-4 h-4 opacity-70" />
              </div>
              <div className="text-2xl font-black mt-1">{metricasLixeira.imoveis}</div>
            </button>

            <button
              type="button"
              onClick={() => setFiltroTipoLixeira('cliente')}
              className={cn(
                'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                filtroTipoLixeira === 'cliente'
                  ? 'bg-blue-600 text-white border-transparent shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Clientes</span>
                <Users className="w-4 h-4 opacity-70" />
              </div>
              <div className="text-2xl font-black mt-1">{metricasLixeira.clientes}</div>
            </button>

            <button
              type="button"
              onClick={() => setFiltroTipoLixeira('visita')}
              className={cn(
                'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                filtroTipoLixeira === 'visita'
                  ? 'bg-emerald-600 text-white border-transparent shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Visitas</span>
                <CalendarDays className="w-4 h-4 opacity-70" />
              </div>
              <div className="text-2xl font-black mt-1">{metricasLixeira.visitas}</div>
            </button>
          </div>

          {/* BARRA DE BUSCA DA LIXEIRA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLixeira}
                onChange={(e) => setSearchLixeira(e.target.value)}
                placeholder="Buscar por título, código, cliente ou endereço..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={fetchLixeira}
              disabled={isLoadingLixeira}
              className="text-xs flex items-center gap-1.5 w-full sm:w-auto"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isLoadingLixeira && 'animate-spin')} />
              Atualizar Lixeira
            </Button>
          </div>

          {/* LISTAGEM DE ITENS NA LIXEIRA */}
          {isLoadingLixeira ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
              <span>Verificando itens na lixeira...</span>
            </div>
          ) : lixeiraFiltrada.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
                Lixeira Limpa!
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Não há nenhum imóvel, cliente ou visita na lixeira com os filtros atuais.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lixeiraFiltrada.map((item) => {
                const isCritico = item.dias_restantes <= 7;
                const isMedio = item.dias_restantes > 7 && item.dias_restantes <= 20;

                return (
                  <Card
                    key={`${item.tabela}_${item.id}`}
                    className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                              item.tipo === 'imovel' && 'bg-amber-100 dark:bg-amber-900/40 text-amber-600',
                              item.tipo === 'cliente' && 'bg-blue-100 dark:bg-blue-900/40 text-blue-600',
                              item.tipo === 'visita' && 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600',
                              item.tipo === 'proprietario' && 'bg-purple-100 dark:bg-purple-900/40 text-purple-600'
                            )}
                          >
                            {renderTabelaIcon(item.tabela)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {item.tipo}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate" title={item.titulo}>
                              {item.titulo}
                            </h4>
                          </div>
                        </div>

                        {/* BADGE DE DIAS RESTANTES */}
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1',
                            isCritico
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 animate-pulse'
                              : isMedio
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                          )}
                        >
                          <Clock className="w-3 h-3" />
                          {item.dias_restantes}d restantes
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 pt-2 space-y-3">
                      {item.subtitulo && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.subtitulo}</p>
                      )}

                      <div className="text-[11px] text-slate-400 space-y-0.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between">
                          <span>Excluído em:</span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {new Date(item.deletado_em).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Purga definitiva:</span>
                          <span className="font-medium text-rose-600 dark:text-rose-400">
                            {new Date(item.data_expiracao || item.deletado_em).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {/* BOTÕES DE RESTAURAÇÃO E PURGA */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleRestaurar(item)}
                          disabled={itemRestaurando === item.id}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                          <RotateCcw className={cn('w-3.5 h-3.5 mr-1.5', itemRestaurando === item.id && 'animate-spin')} />
                          Restaurar Cadastro
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setItemExcluindo(item)}
                          className="px-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-800"
                          title="Excluir Definitivamente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL DE DETALHES DO LOG (JSON VIEWER) ─── */}
      <Modal
        isOpen={!!logSelecionado}
        onClose={() => setLogSelecionado(null)}
        title="Detalhes da Operação de Auditoria"
      >
        {logSelecionado && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 block">Usuário:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {logSelecionado.usuario_nome || logSelecionado.usuario_email}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Data/Hora:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {new Date(logSelecionado.criado_em).toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Ação:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{logSelecionado.acao}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Tabela:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{logSelecionado.tabela}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Payload JSON de Detalhes
                </label>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(logSelecionado.detalhes || {}, null, 2));
                    showToast('JSON copiado para a área de transferência!', 'success');
                  }}
                  className="text-[11px] text-emerald-600 hover:underline font-medium cursor-pointer"
                >
                  Copiar JSON
                </button>
              </div>
              <pre className="p-3 text-[11px] font-mono rounded-xl bg-slate-950 text-emerald-400 overflow-x-auto max-h-64 border border-slate-800 select-all">
                {JSON.stringify(logSelecionado.detalhes || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setLogSelecionado(null)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DEFINITIVA ─── */}
      <Modal
        isOpen={!!itemExcluindo}
        onClose={() => setItemExcluindo(null)}
        title="Excluir Registro Definitivamente"
      >
        {itemExcluindo && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Aviso de Operação Irreversível</p>
                <p className="mt-0.5">
                  Esta ação irá apagar o registro definitivamente do banco de dados antes do prazo de 60 dias. Não será
                  possível recuperar fotos, histórico ou dados deste cadastro.
                </p>
              </div>
            </div>

            <div className="text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-400">Item a ser purgado:</p>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{itemExcluindo.titulo}</p>
              {itemExcluindo.subtitulo && <p className="text-slate-500 text-[11px] mt-0.5">{itemExcluindo.subtitulo}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setItemExcluindo(null)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleExcluirDefinitivo}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Sim, Excluir Definitivamente
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
