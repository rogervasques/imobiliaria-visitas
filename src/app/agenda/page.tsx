'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Visita, StatusVisita } from '@/types';
import { VisitaDetalhesModal } from '@/components/visitas/VisitaDetalhesModal';
import { NovaVisitaModal } from '@/components/visitas/NovaVisitaModal';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Building2,
  User,
  ArrowRight,
  CheckCircle2,
  CalendarCheck2,
  Hourglass,
  Ban,
  List,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
} from 'lucide-react';
import {
  formatTime,
  formatDate,
  formatFriendlyDate,
  formatPhone,
} from '@/lib/utils';
import Link from 'next/link';

type ViewMode = 'semana' | 'mes' | 'lista';

const HOURS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
];

const pad = (n: number) => String(n).padStart(2, '0');

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function AgendaPage() {
  const { visitas } = useData();

  // Estados principais
  const [viewMode, setViewMode] = useState<ViewMode>('semana');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(() => toDateStr(new Date()));
  const [visitaDetalhes, setVisitaDetalhes] = useState<Visita | null>(null);
  const [isNovaVisitaOpen, setIsNovaVisitaOpen] = useState<boolean>(false);

  const hojeStr = toDateStr(new Date());

  // ─── Navegação de Semana / Mês ───────────────────────────────────────────────

  // Início da semana (Segunda-feira)
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay(); // 0=Dom, 1=Seg...
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // ajusta para segunda
    const monday = new Date(d.setDate(diff));

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  }, [currentDate]);

  // Texto do cabeçalho da semana (ex: 18 – 24 de agosto, 2026)
  const weekLabel = useMemo(() => {
    if (viewMode === 'mes') {
      return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);
    }
    if (weekDays.length === 0) return '';
    const first = weekDays[0];
    const last = weekDays[6];
    const firstMonth = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(first);
    const lastMonth = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(last);
    const year = last.getFullYear();

    if (firstMonth === lastMonth) {
      return `${first.getDate()} – ${last.getDate()} de ${firstMonth}, ${year}`;
    }
    return `${first.getDate()} de ${firstMonth} – ${last.getDate()} de ${lastMonth}, ${year}`;
  }, [weekDays, currentDate, viewMode]);

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'mes') {
      next.setMonth(next.getMonth() - 1);
    } else {
      next.setDate(next.getDate() - 7);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'mes') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDayStr(toDateStr(now));
  };

  // Visitas da semana atual
  const weekDateStrs = useMemo(() => new Set(weekDays.map(toDateStr)), [weekDays]);

  const visitasDaSemana = useMemo(() => {
    return visitas.filter((v) => {
      const ds = toDateStr(new Date(v.data_hora_visita));
      return weekDateStrs.has(ds);
    });
  }, [visitas, weekDateStrs]);

  // Visitas do dia selecionado no painel lateral
  const visitasDoDia = useMemo(() => {
    return visitas
      .filter((v) => toDateStr(new Date(v.data_hora_visita)) === selectedDayStr)
      .sort((a, b) => new Date(a.data_hora_visita).getTime() - new Date(b.data_hora_visita).getTime());
  }, [visitas, selectedDayStr]);

  // Estatísticas da semana
  const statsSemana = useMemo(() => {
    return {
      total: visitasDaSemana.length,
      confirmadas: visitasDaSemana.filter((v) => v.status === 'confirmada').length,
      agendadas: visitasDaSemana.filter((v) => v.status === 'agendada').length,
      concluidas: visitasDaSemana.filter((v) => v.status === 'concluida' || v.status === 'reagendada').length,
      canceladas: visitasDaSemana.filter((v) => v.status === 'cancelada').length,
    };
  }, [visitasDaSemana]);

  // Mapa de cor dos blocos na grade correspondendo perfeitamente à legenda
  const statusCardStyles: Record<
    StatusVisita,
    { bg: string; border: string; text: string; label: string }
  > = {
    confirmada: {
      bg: 'bg-emerald-700 dark:bg-emerald-800 hover:bg-emerald-600 dark:hover:bg-emerald-700',
      border: 'border border-emerald-500 dark:border-emerald-400',
      text: 'text-white dark:text-emerald-50',
      label: 'Confirmada',
    },
    agendada: {
      bg: 'bg-amber-100/95 dark:bg-amber-950/80 hover:bg-amber-200/90 dark:hover:bg-amber-900/90',
      border: 'border border-amber-300 dark:border-amber-700/60',
      text: 'text-amber-950 dark:text-amber-100',
      label: 'Agendada',
    },
    concluida: {
      bg: 'bg-purple-100/95 dark:bg-purple-950/80 hover:bg-purple-200/90 dark:hover:bg-purple-900/90',
      border: 'border border-purple-300 dark:border-purple-700/60',
      text: 'text-purple-950 dark:text-purple-100',
      label: 'Concluída',
    },
    reagendada: {
      bg: 'bg-purple-100/95 dark:bg-purple-950/80 hover:bg-purple-200/90 dark:hover:bg-purple-900/90',
      border: 'border border-purple-300 dark:border-purple-700/60',
      text: 'text-purple-950 dark:text-purple-100',
      label: 'Concluída',
    },
    cancelada: {
      bg: 'bg-rose-100/95 dark:bg-rose-950/80 hover:bg-rose-200/90 dark:hover:bg-rose-900/90',
      border: 'border border-rose-300 dark:border-rose-700/60',
      text: 'text-rose-950 dark:text-rose-100',
      label: 'Cancelada',
    },
  };

  // Estilos de tag colorida por status no Mês
  const statusMonthStyles: Record<
    StatusVisita,
    { bg: string; border: string; text: string }
  > = {
    confirmada: {
      bg: 'bg-emerald-600 dark:bg-emerald-700',
      border: 'border-emerald-500 dark:border-emerald-600',
      text: 'text-white',
    },
    agendada: {
      bg: 'bg-amber-100 dark:bg-amber-950/90',
      border: 'border-amber-300 dark:border-amber-700/70',
      text: 'text-amber-950 dark:text-amber-100',
    },
    concluida: {
      bg: 'bg-purple-100 dark:bg-purple-950/90',
      border: 'border-purple-300 dark:border-purple-700/70',
      text: 'text-purple-950 dark:text-purple-100',
    },
    reagendada: {
      bg: 'bg-purple-100 dark:bg-purple-950/90',
      border: 'border-purple-300 dark:border-purple-700/70',
      text: 'text-purple-950 dark:text-purple-100',
    },
    cancelada: {
      bg: 'bg-rose-100 dark:bg-rose-950/90',
      border: 'border-rose-300 dark:border-rose-700/70',
      text: 'text-rose-950 dark:text-rose-100',
    },
  };

  // Dias calculados matematicamente para a visualização em Mês (grid de semanas completas)
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDay = firstDayOfMonth.getDay(); // 0 = Domingo
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

    const totalDays = Math.ceil((startingDay + lastDateOfMonth) / 7) * 7;
    const days: Date[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(year, month, 1 - startingDay + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Visitas da lista ordenadas cronologicamente em fluxo único
  const visitasListaOrdenadas = useMemo(() => {
    return [...visitasDaSemana].sort(
      (a, b) => new Date(a.data_hora_visita).getTime() - new Date(b.data_hora_visita).getTime()
    );
  }, [visitasDaSemana]);

  // Formatação do dia selecionado no painel lateral
  const selectedDayLabel = useMemo(() => {
    const [y, m, d] = selectedDayStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const s = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(dateObj);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }, [selectedDayStr]);

  return (
    <div className="space-y-3.5 sm:space-y-5">
      {/* ─── 1. Topo & Controles Principais ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Controles de Navegação */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Botão Hoje */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="font-bold text-xs shadow-xs"
          >
            Hoje
          </Button>

          {/* Navegador < Data > */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-xs">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 capitalize whitespace-nowrap">
              {weekLabel}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Seletores de Visão [ Semana ] [ Mês ] [ Lista ] */}
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode('semana')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'semana'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mes')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'mes'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Mês
          </button>
          <button
            type="button"
            onClick={() => setViewMode('lista')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'lista'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      {/* ─── 2. Layout Principal: Grade Semanal + Painel Lateral Direito ─── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* ── Coluna Esquerda: Grade Semanal / Mês / Lista ── */}
        <div className="flex-1 min-w-0 w-full">
          {viewMode === 'semana' && (
            <Card className="overflow-hidden shadow-sm w-full">
              <div className="w-full">
                {/* Cabeçalho dos Dias da Semana - 100% da largura */}
                <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 sticky top-0 z-10 w-full">
                  {/* Célula Horários (vazia) */}
                  <div className="p-1 sm:p-3 text-center text-[9px] sm:text-[11px] font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <span className="hidden sm:inline">Horário</span>
                    <span className="sm:hidden">Hora</span>
                  </div>

                  {/* 7 Colunas de Dias */}
                  {weekDays.map((d) => {
                    const ds = toDateStr(d);
                    const isHoje = ds === hojeStr;
                    const isSelected = ds === selectedDayStr;
                    const dayNameShort = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(d).slice(0, 3);
                    const dayLetter = dayNameShort.charAt(0).toUpperCase();
                    const dayNum = d.getDate();

                    return (
                      <button
                        key={ds}
                        type="button"
                        onClick={() => setSelectedDayStr(ds)}
                        className={`p-1 sm:p-3 text-center border-r last:border-r-0 border-slate-200 dark:border-slate-800 transition-all cursor-pointer min-w-0 ${
                          isSelected
                            ? 'bg-emerald-500/15 dark:bg-emerald-500/25 ring-1 sm:ring-2 ring-inset ring-emerald-500'
                            : isHoje
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                            : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="block text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 capitalize truncate">
                          <span className="sm:hidden">{dayLetter}</span>
                          <span className="hidden sm:inline">{dayNameShort}</span>
                        </span>
                        <span
                          className={`inline-block mt-0.5 text-[11px] sm:text-base font-black px-1 sm:px-1.5 py-0.5 rounded sm:rounded-lg leading-none ${
                            isHoje
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {dayNum}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Grade de Horas x Dias - 100% da largura */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[640px] overflow-y-auto w-full">
                  {HOURS.map((hourStr) => {
                    const hourNum = parseInt(hourStr.split(':')[0], 10);

                    return (
                      <div key={hourStr} className="grid grid-cols-8 min-h-[52px] sm:min-h-[72px] w-full">
                        {/* Coluna Horário */}
                        <div className="p-0.5 sm:p-2.5 text-center text-[8px] sm:text-xs font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 select-none flex items-center justify-center">
                          {hourStr}
                        </div>

                        {/* 7 Células de Dias */}
                        {weekDays.map((d) => {
                          const ds = toDateStr(d);

                          // Visitas que caem neste dia e nesta hora
                          const visitasNoHorario = visitasDaSemana.filter((v) => {
                            const vDate = new Date(v.data_hora_visita);
                            const vDs = toDateStr(vDate);
                            const vHour = vDate.getHours();
                            return vDs === ds && vHour === hourNum;
                          });

                          return (
                            <div
                              key={`${ds}-${hourStr}`}
                              className="p-0.5 sm:p-1 border-r last:border-r-0 border-slate-100 dark:border-slate-800/60 relative group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex flex-col justify-start min-w-0 overflow-hidden"
                            >
                              {visitasNoHorario.map((visita) => {
                                const style = statusCardStyles[visita.status] || statusCardStyles.agendada;

                                return (
                                  <button
                                    key={visita.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setVisitaDetalhes(visita);
                                    }}
                                    className={`w-full text-left p-0.5 sm:p-1.5 rounded sm:rounded-xl ${style.border} ${style.bg} ${style.text} shadow-xs transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer mb-0.5 sm:mb-1 block overflow-hidden min-w-0`}
                                    title={`${visita.imovel?.titulo} - ${visita.cliente?.nome}`}
                                  >
                                    {/* Horário */}
                                    <div className="text-[7.5px] sm:text-[10px] font-black tabular-nums leading-none opacity-90 truncate">
                                      {formatTime(visita.data_hora_visita)}
                                    </div>

                                    {/* Nome do Cliente (Título Principal em Destaque) */}
                                    <div
                                      className="text-[8.5px] sm:text-[11.5px] font-black leading-tight my-0.5 line-clamp-1 break-words truncate"
                                      title={visita.cliente?.nome || 'Cliente'}
                                    >
                                      {visita.cliente?.nome || 'Cliente'}
                                    </div>

                                    {/* Título do Imóvel (Informação Secundária / Subtexto) */}
                                    <div
                                      className="text-[7.5px] sm:text-[10px] opacity-80 truncate leading-none whitespace-nowrap overflow-hidden text-ellipsis hidden sm:block"
                                      title={visita.imovel?.titulo || 'Imóvel'}
                                    >
                                      {visita.imovel?.titulo || 'Imóvel'}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Legenda de Cores no Rodapé da Grade (Marcador Único) ── */}
              <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
                  Legenda:
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <div className="w-3 h-3 rounded-full bg-emerald-700 border border-emerald-500 shrink-0" />
                    <span className="font-semibold">Confirmada</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500 shrink-0" />
                    <span className="font-semibold">Agendada</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <div className="w-3 h-3 rounded-full bg-purple-500 border border-purple-400 shrink-0" />
                    <span className="font-semibold">Concluída</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <div className="w-3 h-3 rounded-full bg-rose-500 border border-rose-400 shrink-0" />
                    <span className="font-semibold">Cancelada</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Visão Lista Alternativa */}
          {viewMode === 'lista' && (
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <List className="w-5 h-5 text-emerald-500" />
                    Lista de Visitas da Semana ({weekLabel})
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {visitasDaSemana.length} compromissos
                  </span>
                </div>

                {visitasDaSemana.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                    <CalendarDays className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                      Nenhuma visita agendada para esta semana.
                    </p>
                    <p className="text-[11px]">
                      Navegue para outra semana ou crie um novo agendamento.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {visitasListaOrdenadas.map((v) => {
                      const dateObj = new Date(v.data_hora_visita);
                      const diaSemanaShort = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
                        .format(dateObj)
                        .replace('.', '')
                        .toUpperCase();
                      const diaMesStr = new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      }).format(dateObj);

                      return (
                        <div
                          key={v.id}
                          onClick={() => setVisitaDetalhes(v)}
                          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Bloco da Esquerda com Data e Hora Explícitas (ex: QUI, 27/08 • 09:00) */}
                            <div className="flex flex-col items-center justify-center min-w-[76px] sm:min-w-[88px] py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 text-center shrink-0 group-hover:border-emerald-500/40 transition-colors">
                              <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {diaSemanaShort}, {diaMesStr}
                              </span>
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                                {formatTime(v.data_hora_visita)}
                              </span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {v.cliente?.nome || 'Cliente'}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                <span className="truncate flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  {v.imovel?.titulo || 'Imóvel'}
                                </span>
                                {v.imovel?.bairro && (
                                  <span className="hidden sm:inline text-slate-400">
                                    • {v.imovel.bairro}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                v.status === 'confirmada'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : v.status === 'cancelada'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                  : v.status === 'concluida' || v.status === 'reagendada'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                  : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Visão Mês Alternativa com Cores Dinâmicas por Status */}
          {viewMode === 'mes' && (
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-3 sm:p-5 space-y-3">
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 mb-1">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                    <div key={d} className="py-1 uppercase tracking-wider text-[10px] sm:text-xs">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {monthDays.map((d) => {
                    const ds = toDateStr(d);
                    const isHoje = ds === hojeStr;
                    const isSelected = ds === selectedDayStr;
                    const isCurrentMonth = d.getMonth() === currentDate.getMonth();

                    const visitasDesteDia = visitas.filter(
                      (v) => toDateStr(new Date(v.data_hora_visita)) === ds
                    );

                    return (
                      <div
                        key={ds}
                        onClick={() => {
                          setSelectedDayStr(ds);
                        }}
                        className={`min-h-[85px] sm:min-h-[105px] p-1 sm:p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 ring-1 sm:ring-2 ring-emerald-500'
                            : isHoje
                            ? 'border-emerald-400 bg-emerald-50/20'
                            : isCurrentMonth
                            ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850'
                            : 'border-slate-100 dark:border-slate-800/40 bg-slate-50/40 dark:bg-slate-950/30 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold leading-none ${
                              isHoje
                                ? 'w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs'
                                : isCurrentMonth
                                ? 'text-slate-700 dark:text-slate-300'
                                : 'text-slate-400'
                            }`}
                          >
                            {d.getDate()}
                          </span>

                          {visitasDesteDia.length > 0 && (
                            <span className="text-[10px] font-bold text-slate-400">
                              {visitasDesteDia.length}v
                            </span>
                          )}
                        </div>

                        {/* Blocos de Visitas com Cores Dinâmicas por Status */}
                        <div className="space-y-1 mt-1 w-full overflow-hidden">
                          {visitasDesteDia.slice(0, 2).map((v) => {
                            const style = statusMonthStyles[v.status] || statusMonthStyles.agendada;

                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setVisitaDetalhes(v);
                                }}
                                className={`w-full text-left px-1.5 py-0.5 rounded text-[9.5px] font-bold truncate border ${style.bg} ${style.border} ${style.text} shadow-2xs hover:scale-[1.02] transition-transform cursor-pointer block leading-tight`}
                                title={`${formatTime(v.data_hora_visita)} - ${v.cliente?.nome || 'Cliente'} (${v.imovel?.titulo || 'Imóvel'})`}
                              >
                                <span className="font-mono mr-1 opacity-90">{formatTime(v.data_hora_visita)}</span>
                                <span className="truncate">{v.cliente?.nome || 'Cliente'}</span>
                              </button>
                            );
                          })}

                          {visitasDesteDia.length > 2 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDayStr(ds);
                                setViewMode('semana');
                              }}
                              className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold px-1 hover:underline block text-left"
                            >
                              +{visitasDesteDia.length - 2} mais
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>

              {/* Legenda de Cores no Rodapé do Mês */}
              <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
                  Legenda:
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <div className="w-3 h-3 rounded-full bg-emerald-600 border border-emerald-500 shrink-0" />
                    <span className="font-semibold">Confirmada</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500 shrink-0" />
                    <span className="font-semibold">Agendada</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <div className="w-3 h-3 rounded-full bg-purple-500 border border-purple-400 shrink-0" />
                    <span className="font-semibold">Concluída</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <div className="w-3 h-3 rounded-full bg-rose-500 border border-rose-400 shrink-0" />
                    <span className="font-semibold">Cancelada</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* ─── 3. Painel Lateral Direito (Sidebar da Agenda) ─── */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {/* Card 1: Agenda do Dia Selecionado */}
          <Card className="shadow-xs overflow-hidden border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Agenda do Dia
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 capitalize mt-0.5">
                  {selectedDayLabel}
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {visitasDoDia.length} {visitasDoDia.length === 1 ? 'visita' : 'visitas'}
              </span>
            </div>

            <CardContent className="p-4 space-y-3">
              {visitasDoDia.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 space-y-1.5">
                  <Clock className="w-6 h-6 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-600 dark:text-slate-300">
                    Nenhuma visita neste dia
                  </p>
                  <p className="text-[11px]">
                    Clique no botão acima para agendar um compromisso.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {visitasDoDia.map((visita) => (
                    <div
                      key={visita.id}
                      onClick={() => setVisitaDetalhes(visita)}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-emerald-400/50 transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-emerald-500" />
                          {formatTime(visita.data_hora_visita)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            visita.status === 'confirmada'
                              ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                              : visita.status === 'cancelada'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {visita.status}
                        </span>
                      </div>

                      {/* Nome do Cliente em destaque como título principal */}
                      <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                        {visita.cliente?.nome || 'Cliente'}
                      </p>

                      {/* Título do Imóvel como subtexto secundário */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {visita.imovel?.titulo || 'Imóvel'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Estatísticas da Semana */}
          <Card className="shadow-xs overflow-hidden border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Estatísticas
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 mt-0.5">
                Resumo da Semana
              </h3>
            </div>

            <CardContent className="p-4 space-y-3">
              <div className="space-y-2 text-xs">
                {/* Agendadas */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
                    <CalendarCheck2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Visitas Agendadas</span>
                  </div>
                  <span className="font-bold text-amber-700 dark:text-amber-300">
                    {statsSemana.agendadas}
                  </span>
                </div>

                {/* Confirmadas */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Confirmadas</span>
                  </div>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {statsSemana.confirmadas}
                  </span>
                </div>

                {/* Concluídas */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/70 dark:bg-purple-950/30">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                    <span>Concluídas</span>
                  </div>
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    {statsSemana.concluidas}
                  </span>
                </div>

                {/* Canceladas */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/30">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-medium">
                    <Ban className="w-3.5 h-3.5 text-rose-500" />
                    <span>Canceladas</span>
                  </div>
                  <span className="font-bold text-rose-700 dark:text-rose-300">
                    {statsSemana.canceladas}
                  </span>
                </div>
              </div>

              {/* Botão Ver Relatório Completo */}
              <Link href="/relatorios" className="block pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <span>Ver relatório completo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Modais Globais ─── */}
      <VisitaDetalhesModal
        visita={visitaDetalhes}
        isOpen={!!visitaDetalhes}
        onClose={() => setVisitaDetalhes(null)}
      />

      <NovaVisitaModal
        isOpen={isNovaVisitaOpen}
        onClose={() => setIsNovaVisitaOpen(false)}
      />
    </div>
  );
}
