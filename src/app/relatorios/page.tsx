'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent } from '@/components/ui/Card';
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
} from 'lucide-react';
import { formatTime, formatFriendlyDate, formatPhone } from '@/lib/utils';

export default function RelatoriosPage() {
  const { visitas, imoveis, clientes, metrics } = useData();

  const totalVisitas = visitas.length;
  const confirmadas = visitas.filter((v) => v.status === 'confirmada').length;
  const agendadas = visitas.filter((v) => v.status === 'agendada').length;
  const canceladas = visitas.filter((v) => v.status === 'cancelada').length;
  const taxaSucesso = totalVisitas > 0 ? Math.round((confirmadas / totalVisitas) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-emerald-500" />
          Relatórios &amp; Estatísticas
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Visão analítica de visitas, taxa de confirmação, imóveis mais visitados e histórico geral.
        </p>
      </div>

      {/* Cards de Métricas Principais (Compactos) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
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
              Registradas no sistema
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
              {taxaSucesso}% taxa de conversão
            </p>
          </CardContent>
        </Card>

        {/* Aguardando */}
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
                  Aguardando
                </div>
              </div>
            </div>
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-2 border-t border-amber-500/10 pt-1.5 truncate">
              Pendentes de confirmação
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
              Desmarcadas / Reagendadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seções Analíticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Desempenho da Base */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Resumo da Operação Imobiliária
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Imóveis Ativos no Portfólio</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">{imoveis.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Clientes Cadastrados</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">{clientes.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Automação WhatsApp</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Ativa (30min antes)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Últimas Visitas Registradas */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Últimas Visitas
            </h3>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {visitas.slice(0, 5).map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {v.imovel?.titulo || 'Imóvel'}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                      {v.cliente?.nome || 'Cliente'} — {formatFriendlyDate(v.data_hora_visita)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      v.status === 'confirmada'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : v.status === 'cancelada'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
