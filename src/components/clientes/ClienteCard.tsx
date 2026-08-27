'use client';

import React, { useMemo } from 'react';
import { Cliente, Imovel } from '@/types';
import { Card, CardContent } from '../ui/Card';
import {
  Phone,
  Tag,
  DollarSign,
  Clock,
  Sparkles,
  MessageCircle,
  CalendarCheck,
  Zap,
} from 'lucide-react';
import { formatPhone, getInitials, getWhatsAppDirectLink } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { getImoveisCompativeis } from '@/lib/imovelMatching';

interface ClienteCardProps {
  cliente: Cliente;
  onClick?: (cliente: Cliente) => void;
  onOpenMatches?: (cliente: Cliente, matches: Imovel[]) => void;
}

export function ClienteCard({ cliente, onClick, onOpenMatches }: ClienteCardProps) {
  const { visitas, imoveis } = useData();

  const directWhatsApp = getWhatsAppDirectLink(
    cliente.telefone,
    `Olá, ${cliente.nome}! Tudo bem? Sou da imobiliária e gostaria de falar sobre as opções de imóveis para você.`
  );

  const totalVisitasCliente = useMemo(() => {
    return visitas.filter((v) => v.cliente_id === cliente.id).length;
  }, [visitas, cliente.id]);

  // Identifica se o cliente possui uma visita ativa (Confirmada ou Agendada)
  const visitaAtiva = useMemo(() => {
    const visitasDoCliente = visitas.filter((v) => v.cliente_id === cliente.id);
    const confirmada = visitasDoCliente.find((v) => v.status === 'confirmada');
    if (confirmada) return { status: 'confirmada', label: 'Visita Confirmada' };
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
      className="hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden relative border-slate-200/90 dark:border-slate-800"
    >
      <CardContent className="p-4 sm:p-5 space-y-3.5">
        {/* ─── 1. Topo: Avatar, Nome, Telefone + Tag Compacta de Visita Ativa ─── */}
        <div className="flex items-start justify-between gap-2">
          {/* Avatar e Identificação */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-emerald-600/20 shrink-0 group-hover:scale-105 transition-transform">
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

          {/* Canto Superior Direito: Tag Compacta e Discreta de Visita Ativa */}
          {visitaAtiva && (
            <div className="shrink-0">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold leading-tight ${
                  visitaAtiva.status === 'confirmada'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80'
                    : 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80'
                }`}
              >
                <span className="text-[10px]">📅</span>
                <span className="whitespace-nowrap">{visitaAtiva.label}</span>
              </span>
            </div>
          )}
        </div>

        {/* ─── 2. Corpo do Card: Perfil, Orçamento & Última Interação ─── */}
        <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-xs space-y-2">
          {/* Perfil de Interesse */}
          {cliente.perfil_interesse && (
            <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
              <Tag className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="font-semibold line-clamp-1">{cliente.perfil_interesse}</span>
            </div>
          )}

          {/* Orçamento */}
          {cliente.faixa_orcamento && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Orçamento: <strong className="text-slate-800 dark:text-slate-200">{cliente.faixa_orcamento}</strong></span>
            </div>
          )}

          {/* Faixa Inferior de Métricas: Tempo de Parada e Visitas */}
          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
              <Clock className="w-3 h-3 text-amber-500 shrink-0" />
              <span>{cliente.tempo_parada_texto || 'Contato recente'}</span>
            </span>

            <span className="flex items-center gap-1">
              <CalendarCheck className="w-3 h-3 text-sky-500 shrink-0" />
              <span>{totalVisitasCliente} visita{totalVisitasCliente === 1 ? '' : 's'}</span>
            </span>
          </div>
        </div>

        {/* ─── 3. Rodapé Unificado Lado a Lado: Match de Imóveis (Esquerda) + Botão Compacto WhatsApp (Direita) ─── */}
        <div
          className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Esquerda: Match de Imóveis (se houver) */}
          <div className="flex-1 min-w-0">
            {imoveisCompativeis.length > 0 ? (
              <button
                type="button"
                onClick={() => onOpenMatches?.(cliente, imoveisCompativeis)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold transition-all shadow-2xs hover:shadow-xs group/match cursor-pointer truncate"
                title="Visualizar imóveis compatíveis com este perfil"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 shrink-0" />
                  <span className="truncate">{imoveisCompativeis.length} {imoveisCompativeis.length === 1 ? 'Compatível' : 'Compatíveis'}</span>
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 group-hover/match:translate-x-0.5 transition-transform shrink-0 ml-1">
                  Ver →
                </span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium pl-1">
                Sem imóveis sugeridos
              </span>
            )}
          </div>

          {/* Direita: Ícone/Botão Compacto do WhatsApp */}
          <a
            href={directWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs hover:scale-105 transition-all cursor-pointer"
            title="Conversar com o cliente no WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

