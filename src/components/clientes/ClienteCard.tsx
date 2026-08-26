'use client';

import React, { useMemo } from 'react';
import { Cliente, Imovel } from '@/types';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  User,
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

  const statusVariants: Record<string, 'success' | 'warning' | 'purple' | 'default'> = {
    ativo: 'success',
    negociando: 'warning',
    fechado: 'purple',
    inativo: 'default',
  };

  const statusLabels: Record<string, string> = {
    ativo: 'Ativo',
    negociando: 'Negociando',
    fechado: 'Fechado',
    inativo: 'Inativo',
  };

  const directWhatsApp = getWhatsAppDirectLink(
    cliente.telefone,
    `Olá, ${cliente.nome}! Tudo bem? Sou da imobiliária e gostaria de falar sobre as opções de imóveis para você.`
  );

  const totalVisitasCliente = useMemo(() => {
    return visitas.filter((v) => v.cliente_id === cliente.id).length;
  }, [visitas, cliente.id]);

  // Calcula imóveis compatíveis com o perfil do cliente
  const imoveisCompativeis = useMemo(() => {
    return getImoveisCompativeis(cliente, imoveis);
  }, [cliente, imoveis]);

  const corretorNome =
    cliente.corretor_responsavel_nome || 'Roger Vasques';

  return (
    <Card
      onClick={() => onClick?.(cliente)}
      className="hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden relative border-slate-200/90 dark:border-slate-800"
    >
      <CardContent className="p-4 sm:p-5 space-y-3.5">
        {/* ─── 1. Topo: Avatar, Nome, Telefone + Corretor e Status ─── */}
        <div className="flex items-start justify-between gap-2.5">
          {/* Avatar e Identificação */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-emerald-600/20 shrink-0 group-hover:scale-105 transition-transform">
              {getInitials(cliente.nome)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {cliente.nome}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-mono">{formatPhone(cliente.telefone)}</span>
              </div>
            </div>
          </div>

          {/* Canto Superior Direito: Corretor Responsável & Status */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={statusVariants[cliente.status] || 'default'} size="sm" className="font-bold">
              {statusLabels[cliente.status] || cliente.status.toUpperCase()}
            </Badge>

            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60 max-w-[130px] truncate" title={`Corretor responsável: ${corretorNome}`}>
              <User className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
              <span className="truncate">{corretorNome}</span>
            </span>
          </div>
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

        {/* ─── 3. Badge / Botão em Destaque de Match de Imóveis ─── */}
        {imoveisCompativeis.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onOpenMatches?.(cliente, imoveisCompativeis)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all shadow-2xs hover:shadow-xs group/match cursor-pointer"
              title="Visualizar imóveis compatíveis com este perfil"
            >
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 animate-pulse" />
                <span>{imoveisCompativeis.length} {imoveisCompativeis.length === 1 ? 'Imóvel Compatível' : 'Imóveis Compatíveis'}</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 group-hover/match:translate-x-0.5 transition-transform">
                Ver opções →
              </span>
            </button>
          </div>
        )}

        {/* ─── 4. Rodapé: Apenas o Botão de WhatsApp Isolado Alinhado à Direita ─── */}
        <div
          className="flex items-center justify-end pt-1 border-t border-slate-100 dark:border-slate-800/80"
          onClick={(e) => e.stopPropagation()}
        >
          <a
            href={directWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="whatsapp"
              size="sm"
              className="text-xs font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1" />
              WhatsApp
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

