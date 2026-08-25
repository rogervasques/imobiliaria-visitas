'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  BarChart3,
  CalendarCheck2,
  Hourglass,
  Ban,
  Building2,
  Users,
  CheckCircle2,
  TrendingUp,
  MessageCircle,
  Clock,
  User,
  Calendar,
  FileSpreadsheet,
  ArrowUpRight,
  Filter,
  Flame,
  Award,
  Download,
  FolderDown,
  Sparkles,
  Layers,
  FileText,
  Check,
} from 'lucide-react';
import { formatTime, formatFriendlyDate, formatPhone, formatCurrency } from '@/lib/utils';
import {
  exportarRelatorioAnaliticoExcel,
  exportarImoveisExcel,
  exportarClientesExcel,
  exportarProprietariosExcel,
  exportarVisitasExcel,
} from '@/lib/excelExport';

type PeriodoOption = 'este_mes' | 'mes_passado' | 'ultimos_30_dias' | 'este_ano' | 'todos' | 'custom';
type TabOption = 'dashboard' | 'exportacoes';

export default function RelatoriosPage() {
  const { visitas, imoveis, clientes, proprietarios } = useData();

  const [activeTab, setActiveTab] = useState<TabOption>('dashboard');
  const [periodo, setPeriodo] = useState<PeriodoOption>('este_mes');
  const [dataInicio, setDataInicio] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [dataFim, setDataFim] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Filtra as visitas de acordo com o período selecionado
  const { visitasFiltradas, periodoLabel } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let filtered = visitas;
    let label = 'Todo o Histórico';

    if (periodo === 'este_mes') {
      label = `Este Mês (${new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(now)})`;
      filtered = visitas.filter((v) => {
        const d = new Date(v.data_hora_visita);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
    } else if (periodo === 'mes_passado') {
      const pastMonthDate = new Date(currentYear, currentMonth - 1, 1);
      label = `Mês Passado (${new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(pastMonthDate)})`;
      filtered = visitas.filter((v) => {
        const d = new Date(v.data_hora_visita);
        return d.getFullYear() === pastMonthDate.getFullYear() && d.getMonth() === pastMonthDate.getMonth();
      });
    } else if (periodo === 'ultimos_30_dias') {
      label = 'Últimos 30 Dias';
      const trintaDiasAtras = new Date(now.getTime() - 30 * 24 * 60 * 1000);
      filtered = visitas.filter((v) => new Date(v.data_hora_visita) >= trintaDiasAtras);
    } else if (periodo === 'este_ano') {
      label = `Ano de ${currentYear}`;
      filtered = visitas.filter((v) => new Date(v.data_hora_visita).getFullYear() === currentYear);
    } else if (periodo === 'custom') {
      label = `Personalizado (${dataInicio || 'Início'} até ${dataFim || 'Fim'})`;
      filtered = visitas.filter((v) => {
        const dStr = v.data_hora_visita.split('T')[0];
        if (dataInicio && dStr < dataInicio) return false;
        if (dataFim && dStr > dataFim) return false;
        return true;
      });
    }

    return {
      visitasFiltradas: filtered,
      periodoLabel: label,
    };
  }, [visitas, periodo, dataInicio, dataFim]);

  // Métricas do período
  const totalVisitas = visitasFiltradas.length;
  const confirmadas = visitasFiltradas.filter((v) => v.status === 'confirmada').length;
  const agendadas = visitasFiltradas.filter((v) => v.status === 'agendada').length;
  const concluidas = visitasFiltradas.filter((v) => v.status === 'concluida' || v.status === 'reagendada').length;
  const canceladas = visitasFiltradas.filter((v) => v.status === 'cancelada').length;
  const taxaSucesso = totalVisitas > 0 ? Math.round(((confirmadas + concluidas) / totalVisitas) * 100) : 0;

  // 1. Relatório de Desempenho por Corretor
  const desempenhoCorretores = useMemo(() => {
    const mapa = new Map<string, { nome: string; total: number; confirmadas: number; agendadas: number; concluidas: number; canceladas: number }>();

    visitasFiltradas.forEach((v) => {
      const nomeCorretor = v.corretor_nome || v.created_by_user_nome || 'Corretor Geral';
      if (!mapa.has(nomeCorretor)) {
        mapa.set(nomeCorretor, {
          nome: nomeCorretor,
          total: 0,
          confirmadas: 0,
          agendadas: 0,
          concluidas: 0,
          canceladas: 0,
        });
      }

      const item = mapa.get(nomeCorretor)!;
      item.total += 1;
      if (v.status === 'confirmada') item.confirmadas += 1;
      if (v.status === 'agendada') item.agendadas += 1;
      if (v.status === 'concluida' || v.status === 'reagendada') item.concluidas += 1;
      if (v.status === 'cancelada') item.canceladas += 1;
    });

    return Array.from(mapa.values())
      .map((c) => ({
        ...c,
        taxaConversao: c.total > 0 ? Math.round(((c.confirmadas + c.concluidas) / c.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [visitasFiltradas]);

  // 2. Relatório de Atividade & Ranking por Imóvel
  const rankingImoveis = useMemo(() => {
    const mapa = new Map<string, { imovelId: string; totalVisitas: number; clientes: Set<string> }>();

    visitasFiltradas.forEach((v) => {
      const ims = v.imoveis && v.imoveis.length > 0 ? v.imoveis : v.imovel ? [v.imovel] : [];
      ims.forEach((im) => {
        if (!mapa.has(im.id)) {
          mapa.set(im.id, { imovelId: im.id, totalVisitas: 0, clientes: new Set() });
        }
        const item = mapa.get(im.id)!;
        item.totalVisitas += 1;
        if (v.cliente?.nome) item.clientes.add(v.cliente.nome);
      });
    });

    return Array.from(mapa.entries())
      .map(([id, info]) => {
        const imovel = imoveis.find((im) => im.id === id);
        return {
          id,
          codigo: imovel?.codigo || 'S/C',
          titulo: imovel?.titulo || 'Imóvel',
          bairro: imovel?.bairro || '—',
          status: imovel?.status || 'disponivel',
          totalVisitas: info.totalVisitas,
          clientesDistintos: info.clientes.size,
        };
      })
      .sort((a, b) => b.totalVisitas - a.totalVisitas);
  }, [visitasFiltradas, imoveis]);

  // Dispara o download da planilha Excel com múltiplas abas
  const handleExportarExcelConsolidado = () => {
    exportarRelatorioAnaliticoExcel({
      periodoLabel,
      resumo: {
        totalVisitas,
        confirmadas,
        concluidas,
        canceladas,
        taxaSucesso,
      },
      desempenhoCorretores,
      atividadeImoveis: rankingImoveis,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Topo & Botão Principal de Exportação ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            Central de Relatórios
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden md:block">
            Acompanhe a performance de visitas da sua equipe e faça download de relatórios completos em Excel (.xlsx).
          </p>
        </div>

        <Button
          onClick={handleExportarExcelConsolidado}
          variant="primary"
          size="sm"
          className="shadow-md font-bold self-start sm:self-auto bg-emerald-600 hover:bg-emerald-700 text-white"
          title="Baixar relatório analítico executivo consolidado com múltiplas abas em Excel (.xlsx)"
        >
          <FileSpreadsheet className="w-4 h-4 mr-1.5" />
          Exportar Relatório Consolidado (.xlsx)
        </Button>
      </div>

      {/* ── 1. Criação das Abas Principais (Navegação Superior) ── */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs border border-slate-200/80 dark:border-slate-700/80'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <BarChart3 className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
          <span>Dashboard Analítico</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exportacoes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'exportacoes'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs border border-slate-200/80 dark:border-slate-700/80'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <FolderDown className={`w-4 h-4 ${activeTab === 'exportacoes' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
          <span>Central de Exportações</span>
          <span className="ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
            .XLSX
          </span>
        </button>
      </div>

      {/* ── 2. Conteúdo da Aba "Dashboard Analítico" ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* ── Filtro Global por Período ── */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Filtrar Período Analítico
                  </span>
                </div>

                {/* Botões Rápidos de Período */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { key: 'este_mes', label: 'Este Mês' },
                    { key: 'mes_passado', label: 'Mês Passado' },
                    { key: 'ultimos_30_dias', label: 'Últimos 30 Dias' },
                    { key: 'este_ano', label: 'Este Ano' },
                    { key: 'todos', label: 'Todo o Histórico' },
                    { key: 'custom', label: 'Personalizado' },
                  ].map((opt) => {
                    const isSelected = periodo === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setPeriodo(opt.key as PeriodoOption)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Inputs de Data para Período Personalizado */}
                {periodo === 'custom' && (
                  <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-400 font-bold">De:</span>
                      <input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-400 font-bold">Até:</span>
                      <input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                Exibindo dados consolidados de: <strong className="text-slate-700 dark:text-slate-300">{periodoLabel}</strong>
              </div>
            </CardContent>
          </Card>

          {/* ── Cards de Métricas Principais: Pílulas Compactas no Mobile (< 768px) e Cards no Desktop (>= 768px) ── */}
          {/* 1. Mobile (< 768px): 5 Pílulas 100% Visíveis (3 no topo, 2 embaixo) */}
          <div className="grid grid-cols-6 gap-1.5 md:hidden">
            {/* Total */}
            <div className="col-span-2 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs shadow-2xs truncate">
              <BarChart3 className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              <span className="font-black tabular-nums text-slate-900 dark:text-slate-100">{totalVisitas}</span>
              <span className="text-[11px] font-semibold truncate">Total</span>
            </div>

            {/* Confirmadas */}
            <div className="col-span-2 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs shadow-2xs truncate">
              <CalendarCheck2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="font-black tabular-nums text-emerald-700 dark:text-emerald-300">{confirmadas}</span>
              <span className="text-[11px] font-semibold truncate">Confirmadas</span>
            </div>

            {/* Agendadas */}
            <div className="col-span-2 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-amber-50/90 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs shadow-2xs truncate">
              <Hourglass className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="font-black tabular-nums text-amber-700 dark:text-amber-300">{agendadas}</span>
              <span className="text-[11px] font-semibold truncate">Agendadas</span>
            </div>

            {/* Concluídas */}
            <div className="col-span-3 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-purple-50/90 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 text-purple-800 dark:text-purple-300 text-xs shadow-2xs truncate">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-purple-600 dark:text-purple-400" />
              <span className="font-black tabular-nums text-purple-700 dark:text-purple-300">{concluidas}</span>
              <span className="text-[11px] font-semibold truncate">Concluídas</span>
            </div>

            {/* Canceladas */}
            <div className="col-span-3 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-rose-50/90 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs shadow-2xs truncate">
              <Ban className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="font-black tabular-nums text-rose-700 dark:text-rose-400">{canceladas}</span>
              <span className="text-[11px] font-semibold truncate">Canceladas</span>
            </div>
          </div>

          {/* 2. Desktop (>= 768px): Cards Grandes Detalhados */}
          <div className="hidden md:grid md:grid-cols-5 gap-2.5 sm:gap-3">
            {/* Total */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {totalVisitas}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight text-slate-400 truncate">
                      Total de Visitas
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 border-t border-slate-100 dark:border-slate-800/60 pt-1.5 truncate">
                  {periodoLabel}
                </p>
              </CardContent>
            </Card>

            {/* Confirmadas */}
            <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-xs">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CalendarCheck2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 leading-tight">
                      {confirmadas}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight text-emerald-600 dark:text-emerald-400 truncate">
                      Confirmadas
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-2 border-t border-emerald-500/10 pt-1.5 truncate">
                  {taxaSucesso}% conversão global
                </p>
              </CardContent>
            </Card>

            {/* Concluídas */}
            <Card className="border-purple-500/20 bg-purple-500/5 shadow-xs">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-300 leading-tight">
                      {concluidas}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight text-purple-600 dark:text-purple-400 truncate">
                      Concluídas
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-purple-600/80 dark:text-purple-400/80 mt-2 border-t border-purple-500/10 pt-1.5 truncate">
                  Visitas realizadas
                </p>
              </CardContent>
            </Card>

            {/* Agendadas */}
            <Card className="border-amber-500/20 bg-amber-500/5 shadow-xs">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <Hourglass className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-300 leading-tight">
                      {agendadas}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight text-amber-600 dark:text-amber-400 truncate">
                      Agendadas
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-2 border-t border-amber-500/10 pt-1.5 truncate">
                  Pendentes / Em andamento
                </p>
              </CardContent>
            </Card>

            {/* Canceladas */}
            <Card className="border-rose-500/20 bg-rose-500/5 shadow-xs">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                    <Ban className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-400 leading-tight">
                      {canceladas}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight text-rose-600 dark:text-rose-400 truncate">
                      Canceladas
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-2 border-t border-rose-500/10 pt-1.5 truncate">
                  Desmarcadas no período
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ── Grid Principal: Desempenho por Corretor & Atividade por Imóvel ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 1. Relatório de Desempenho por Corretor */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    Desempenho por Corretor
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {desempenhoCorretores.length} {desempenhoCorretores.length === 1 ? 'corretor' : 'corretores'}
                  </span>
                </div>

                {desempenhoCorretores.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Nenhuma visita registrada no período.</p>
                ) : (
                  <div className="space-y-3">
                    {desempenhoCorretores.map((corretor, idx) => (
                      <div
                        key={corretor.nome}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-mono font-bold flex items-center justify-center text-slate-700 dark:text-slate-300">
                              #{idx + 1}
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                              {corretor.nome}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              {corretor.taxaConversao}% conversão
                            </span>
                          </div>
                        </div>

                        {/* Barra de Progresso de Conversão */}
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${corretor.taxaConversao}%` }}
                          />
                        </div>

                        {/* Métricas do Corretor */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 flex-wrap gap-1">
                          <span>Total: <strong className="text-slate-800 dark:text-slate-200">{corretor.total}</strong></span>
                          <span>Confirmadas: <strong className="text-emerald-600">{corretor.confirmadas}</strong></span>
                          <span>Concluídas: <strong className="text-purple-600">{corretor.concluidas}</strong></span>
                          <span>Agendadas: <strong className="text-amber-600">{corretor.agendadas}</strong></span>
                          <span>Canceladas: <strong className="text-rose-500">{corretor.canceladas}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Relatório de Atividade & Ranking por Imóvel */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Imóveis Mais Visitados
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold">Top Imóveis</span>
                </div>

                {rankingImoveis.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Nenhum imóvel visitado no período.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {rankingImoveis.map((im, idx) => (
                      <div
                        key={im.id + idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold shrink-0">
                              {im.codigo}
                            </span>
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                              {im.titulo}
                            </p>
                          </div>
                          <p className="text-slate-400 text-[11px] truncate">
                            Bairro: {im.bairro} • Status: {im.status.toUpperCase()}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                            {im.totalVisitas} {im.totalVisitas === 1 ? 'visita' : 'visitas'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {im.clientesDistintos} {im.clientesDistintos === 1 ? 'cliente' : 'clientes'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Resumo Geral da Operação ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Imóveis Cadastrados</span>
                <div className="text-xl font-black text-slate-900 dark:text-slate-100">{imoveis.length}</div>
              </div>
              <Building2 className="w-6 h-6 text-slate-400" />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Clientes na Base</span>
                <div className="text-xl font-black text-slate-900 dark:text-slate-100">{clientes.length}</div>
              </div>
              <Users className="w-6 h-6 text-slate-400" />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Proprietários</span>
                <div className="text-xl font-black text-slate-900 dark:text-slate-100">{proprietarios.length}</div>
              </div>
              <User className="w-6 h-6 text-slate-400" />
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Conteúdo da Aba "Central de Exportações" ── */}
      {activeTab === 'exportacoes' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Card em Destaque: Relatório Consolidado Executivo */}
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-slate-50 dark:via-slate-900/80 to-slate-50 dark:to-slate-900/80 shadow-md">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      Recomendado para Gestão
                    </span>
                    <Badge variant="purple" size="sm" className="font-bold">
                      Multi-Abas (.XLSX)
                    </Badge>
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                    Relatório Executivo Analítico Consolidado
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Planilha completa com 3 abas estruturadas contendo <strong>Resumo Geral &amp; Métricas</strong>, 
                    <strong> Ranking de Desempenho por Corretor</strong> e <strong>Atividade Detalhada por Imóvel</strong>.
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Check className="w-4 h-4 text-emerald-500" /> Resumo do Período ({periodoLabel})
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Check className="w-4 h-4 text-emerald-500" /> Conversão por Corretor
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Check className="w-4 h-4 text-emerald-500" /> Imóveis Mais Procurados
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-stretch md:items-end gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleExportarExcelConsolidado}
                    className="shadow-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-5 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Relatório Consolidado
                  </Button>
                  <span className="text-[11px] text-slate-400 font-semibold text-center md:text-right">
                    Formato .xlsx compatível com Excel, Sheets e Numbers
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Exportações Avulsas por Módulo */}
          <div>
            <div className="mb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                Exportações Avulsas por Módulo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Baixe planilhas individuais dedicadas com todas as colunas formatadas para cada base de dados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 1. Imóveis */}
              <Card className="border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all shadow-xs group">
                <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                            Base de Imóveis
                          </h4>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {imoveis.length} {imoveis.length === 1 ? 'imóvel cadastrado' : 'imóveis cadastrados'}
                          </span>
                        </div>
                      </div>
                      <Badge variant="success" size="sm" className="font-mono text-[10px]">
                        imoveis.xlsx
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Exporta códigos, títulos, tipos, finalidade, valores de venda/locação, IPTU, condomínio, endereço completo, quantidade de fotos, dados do proprietário e chaves.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 font-semibold truncate">
                      Todas as colunas preenchidas
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => exportarImoveisExcel(imoveis)}
                      className="font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                      Baixar Imóveis
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Clientes */}
              <Card className="border-slate-200 dark:border-slate-800 hover:border-sky-500/40 transition-all shadow-xs group">
                <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                            Base de Clientes &amp; Leads
                          </h4>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {clientes.length} {clientes.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
                          </span>
                        </div>
                      </div>
                      <Badge variant="default" size="sm" className="font-mono text-[10px] text-sky-600 bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-800">
                        clientes.xlsx
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Exporta nome completo, WhatsApp/telefone com formatação, e-mail, faixa de orçamento, perfil/bairros de interesse, origem do lead, status e observações.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 font-semibold truncate">
                      Contatos e preferências
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => exportarClientesExcel(clientes)}
                      className="font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
                      Baixar Clientes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Proprietários */}
              <Card className="border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all shadow-xs group">
                <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                            Base de Proprietários
                          </h4>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {proprietarios.length} {proprietarios.length === 1 ? 'proprietário' : 'proprietários'}
                          </span>
                        </div>
                      </div>
                      <Badge variant="warning" size="sm" className="font-mono text-[10px]">
                        proprietarios.xlsx
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Exporta nome do proprietário, telefones, e-mails, observações cadastrais e a lista de imóveis vinculados a cada proprietário na carteira.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 font-semibold truncate">
                      Vínculos com imóveis
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => exportarProprietariosExcel(proprietarios, imoveis)}
                      className="font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                      Baixar Proprietários
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 4. Visitas do Período */}
              <Card className="border-slate-200 dark:border-slate-800 hover:border-purple-500/40 transition-all shadow-xs group">
                <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                            Visitas do Período Selecionado
                          </h4>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {visitasFiltradas.length} {visitasFiltradas.length === 1 ? 'visita' : 'visitas'} ({periodoLabel})
                          </span>
                        </div>
                      </div>
                      <Badge variant="purple" size="sm" className="font-mono text-[10px]">
                        visitas.xlsx
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Exporta data/hora, status, cliente, telefone, corretor, imóveis visitados, endereços, status de disparos de WhatsApp (confirmação, lembrete 1h, pós-visita) e log de dossiê.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 font-semibold truncate">
                      Filtro ativo: {periodoLabel}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => exportarVisitasExcel(visitasFiltradas, `visitas_${periodo}.xlsx`)}
                      className="font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
                      Baixar Visitas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
