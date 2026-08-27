'use client';

import React, { useMemo } from 'react';
import { Cliente, Imovel } from '@/types';
import { Card, CardContent } from '../ui/Card';
import {
  Phone,
  Tag,
  DollarSign,
  Clock,
  MessageCircle,
  CalendarCheck,
  Zap,
} from 'lucide-react';
import { formatPhone, getInitials, getWhatsAppDirectLink } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useTenant } from '@/context/TenantContext';
import { getImoveisCompativeis } from '@/lib/imovelMatching';

interface ClienteCardProps {
  cliente: Cliente;
  onClick?: (cliente: Cliente) => void;
  onOpenMatches?: (cliente: Cliente, matches: Imovel[]) => void;
}

export function ClienteCard({ cliente, onClick, onOpenMatches }: ClienteCardProps) {
  const { visitas, imoveis } = useData();
  const { moduloCrmAtivo } = useTenant();

  const directWhatsApp = getWhatsAppDirectLink(
    cliente.telefone,
    `Olá, ${cliente.nome}! Tudo bem? Sou da imobiliária e gostaria de falar sobre as opções de imóveis para você.`
  );

  const totalVisitasCliente = useMemo(() => {
    return visitas.filter((v) => v.cliente_id === cliente.id).length;
  }, [visitas, cliente.id]);

  // Identifica se o cliente possui uma visita ativa (Agendada)
  const visitaAtiva = useMemo(() => {
    const visitasDoCliente = visitas.filter((v) => v.cliente_id === cliente.id);
    const agendada = visitasDoCliente.find((v) => v.status === 'agendada');
    if (agendada) return { status: 'agendada', label: 'Visita Agendada' };
    return null;
  }, [visitas, cliente.id]);

  // Calcula imóveis compatíveis com o perfil do cliente
  const imoveisCompativeis = useMemo(() => {
    return getImoveisCompativeis(cliente, imoveis);
  }, [cliente, imoveis]);

  return (
    <Card
      onClick={() => onClick?.(cliente)}
      className="hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden relative border-slate-200/90 dark:border-slate-800"
    >
      <CardContent className="p-3 sm:p-3.5 space-y-2.5">
        {/* ─── 1. Topo: Avatar, Nome, Telefone + Tag Compacta de Visita Ativa ─── */}
        <div className="flex items-start justify-between gap-2">
          {/* Avatar e Identificação */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              {getInitials(cliente.nome)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {cliente.nome}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-mono">{formatPhone(cliente.telefone)}</span>
              </div>
            </div>
          </div>

          {/* Canto Superior Direito: Tag Compacta de Visita Ativa */}
          {visitaAtiva && (
            <div className="shrink-0">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold leading-tight bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80"
              >
                <span className="text-[10px]">📅</span>
                <span className="whitespace-nowrap">{visitaAtiva.label}</span>
              </span>
            </div>
          )}
        </div>

        {/* ─── 2. Linha 1: Perfil de Interesse Completo ─── */}
        {cliente.perfil_interesse && (
          <div className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
            <Tag className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="font-semibold line-clamp-2 leading-relaxed" title={cliente.perfil_interesse}>
              {cliente.perfil_interesse}
            </span>
          </div>
        )}

        {/* ─── 3. Linha 2: Faixa de Orçamento em Destaque ─── */}
        {cliente.faixa_orcamento && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              Orçamento: <strong className="text-slate-900 dark:text-slate-100 font-bold">{cliente.faixa_orcamento}</strong>
            </span>
          </div>
        )}

        {/* ─── 4. Linha de Métricas: Status CRM (se ativo) + Quantidade de Visitas ─── */}
        <div className={`flex items-center text-[11px] text-slate-500 dark:text-slate-400 ${moduloCrmAtivo && cliente.tempo_parada_texto ? 'justify-between' : 'justify-end'}`}>
          {moduloCrmAtivo && cliente.tempo_parada_texto && (
            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 truncate">
              <Clock className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate">{cliente.tempo_parada_texto}</span>
            </span>
          )}

          <span className="flex items-center gap-1 shrink-0 font-medium">
            <CalendarCheck className="w-3 h-3 text-sky-500 shrink-0" />
            <span>{totalVisitasCliente} visita{totalVisitasCliente === 1 ? '' : 's'}</span>
          </span>
        </div>

        {/* ─── 4. Rodapé Unificado Lado a Lado: Barra de Compatíveis + Botão Circular WhatsApp ─── */}
        <div
          className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Esquerda: Barra de Imóveis Compatíveis */}
          <div className="flex-1 min-w-0">
            {imoveisCompativeis.length > 0 ? (
              <button
                type="button"
                onClick={() => onOpenMatches?.(cliente, imoveisCompativeis)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all shadow-2xs hover:shadow-xs group/match cursor-pointer truncate"
                title="Visualizar imóveis compatíveis com este perfil"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 shrink-0 animate-pulse" />
                <span className="truncate">
                  {imoveisCompativeis.length} {imoveisCompativeis.length === 1 ? 'Imóvel Compatível' : 'Imóveis Compatíveis'}
                </span>
              </button>
            ) : (
              <div className="py-1 px-1 text-[11px] text-slate-400 font-medium truncate">
                Sem imóveis compatíveis
              </div>
            )}
          </div>

          {/* Direita: Botão Circular do WhatsApp */}
          <a
            href={directWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs hover:scale-105 transition-all cursor-pointer"
            title="Conversar com o cliente no WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

