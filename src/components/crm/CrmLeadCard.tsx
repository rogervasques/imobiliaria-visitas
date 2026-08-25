'use client';

import React, { useState } from 'react';
import { Cliente, EtapaCRM, Visita } from '@/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Phone,
  Mail,
  MessageSquare,
  Tag,
  DollarSign,
  CalendarCheck,
  Building2,
  MoreVertical,
  CalendarPlus,
  Eye,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Clock,
  Sparkles,
  ExternalLink,
  Send,
} from 'lucide-react';
import { formatPhone, getInitials, getWhatsAppDirectLink, cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';

interface CrmLeadCardProps {
  lead: Cliente;
  etapaAtual: EtapaCRM;
  isDragging?: boolean;
  onDragStart?: (leadId: string) => void;
  onDragEnd?: () => void;
  onClickDetails: (lead: Cliente) => void;
  onAgendarVisita: (lead: Cliente) => void;
  onPrimeiroContato?: (lead: Cliente) => void;
  onMoverEtapa: (leadId: string, novaEtapa: EtapaCRM) => void;
  onExcluirLead?: (lead: Cliente) => void;
}

const ETAPAS_ORDEM: { id: EtapaCRM; label: string; short: string }[] = [
  { id: 'novos_leads', label: 'Novos Leads', short: 'Novos' },
  { id: 'qualificacao', label: 'Qualificação', short: 'Qualif.' },
  { id: 'agendamento_visita', label: 'Agendamento de Visita', short: 'Visita' },
  { id: 'proposta_negociacao', label: 'Proposta / Negociação', short: 'Proposta' },
  { id: 'documentacao_credito', label: 'Documentação / Análise de Crédito', short: 'Doc' },
  { id: 'fechamento_contrato', label: 'Fechamento / Contrato', short: 'Contrato' },
  { id: 'venda_concluida', label: 'Venda Concluída', short: 'Concluído' },
];

const ORIGEM_LABELS: Record<string, { label: string; color: string }> = {
  portal: { label: 'Portal', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300' },
  instagram: { label: 'Instagram', color: 'bg-pink-100 text-pink-700 dark:bg-pink-950/70 dark:text-pink-300' },
  site: { label: 'Site Oficial', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300' },
  whatsapp: { label: 'WhatsApp', color: 'bg-teal-100 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300' },
  indicacao: { label: 'Indicação', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300' },
  placa: { label: 'Placa / Fachada', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300' },
};

export function CrmLeadCard({
  lead,
  etapaAtual,
  isDragging,
  onDragStart,
  onDragEnd,
  onClickDetails,
  onAgendarVisita,
  onPrimeiroContato,
  onMoverEtapa,
  onExcluirLead,
}: CrmLeadCardProps) {
  const { visitas, imoveis } = useData();
  const [showMenu, setShowMenu] = useState(false);

  const directWhatsApp = getWhatsAppDirectLink(
    lead.telefone,
    `Olá, ${lead.nome}! Tudo bem? Sou da imobiliária e gostaria de saber se encontrou as opções ideais de imóveis para você.`
  );

  // Visitas vinculadas a este cliente (NÃO exibe em novos_leads ou qualificacao)
  const podeExibirVisita = etapaAtual !== 'novos_leads' && etapaAtual !== 'qualificacao';
  const visitasDoLead = podeExibirVisita ? visitas.filter((v) => v.cliente_id === lead.id) : [];
  const proximaVisita = visitasDoLead.find((v) => v.status === 'agendada' || v.status === 'confirmada');

  // Imóvel de interesse
  const imovelInteresse = lead.imovel_interesse_id
    ? imoveis.find((i) => i.id === lead.imovel_interesse_id)
    : lead.imovel_interesse_titulo
    ? { titulo: lead.imovel_interesse_titulo, codigo: undefined, imagem_url: lead.imovel_interesse_foto, bairro: undefined, valor_venda: undefined, valor_locacao: undefined }
    : undefined;

  const imovelFoto = (imovelInteresse as any)?.imagem_url || lead.imovel_interesse_foto;

  const origemConfig = lead.origem_lead ? ORIGEM_LABELS[lead.origem_lead] : null;

  // Próxima e anterior etapas para navegação rápida
  const currentIndex = ETAPAS_ORDEM.findIndex((e) => e.id === etapaAtual);
  const prevEtapa = currentIndex > 0 ? ETAPAS_ORDEM[currentIndex - 1] : null;
  const nextEtapa = currentIndex < ETAPAS_ORDEM.length - 1 ? ETAPAS_ORDEM[currentIndex + 1] : null;

  // Tempo de parada / tag de atenção
  const tempoParada = lead.tempo_parada_texto || (lead.atualizado_em
    ? `Atualizado ${new Date(lead.atualizado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
    : 'Sem contato há 2 dias');

  const isAlertaParada = tempoParada.toLowerCase().includes('sem contato') || tempoParada.toLowerCase().includes('sem retorno');

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', lead.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(lead.id);
      }}
      onDragEnd={onDragEnd}
      onClick={() => onClickDetails(lead)}
      className={cn(
        'group relative bg-white dark:bg-slate-900/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800',
        'shadow-xs hover:shadow-md hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 cursor-grab active:cursor-grabbing select-none',
        isDragging && 'opacity-40 ring-2 ring-emerald-500 scale-[0.98]'
      )}
    >
      {/* ─── TOPO: Avatar, Nome, Origem e Ações Rápidas de Topo ─── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar com Iniciais */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold flex items-center justify-center text-xs shadow-sm shadow-emerald-600/20 shrink-0 group-hover:scale-105 transition-transform">
            {getInitials(lead.nome)}
          </div>

          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {lead.nome}
            </h4>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>{formatPhone(lead.telefone)}</span>
            </div>
          </div>
        </div>

        {/* Menu de Ações Secundárias + Ícone de Excluir */}
        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {onExcluirLead && (
            <button
              type="button"
              onClick={() => onExcluirLead(lead)}
              title="Excluir lead"
              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Opções do Lead"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Ações do Lead
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onClickDetails(lead);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ver Detalhes do Lead</span>
                </button>

                {onPrimeiroContato && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onPrimeiroContato(lead);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors text-left"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Primeiro Contato (WhatsApp)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onAgendarVisita(lead);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors text-left"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Agendar Nova Visita</span>
                </button>

                {/* Mover Etapas */}
                <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800 px-3 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Mover para:
                  </span>
                  <div className="space-y-0.5 mt-1">
                    {ETAPAS_ORDEM.filter((e) => e.id !== etapaAtual).map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onMoverEtapa(lead.id, e.id);
                        }}
                        className="w-full text-left text-xs py-1 px-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors truncate"
                      >
                        → {e.label}
                      </button>
                    ))}
                  </div>
                </div>

                {onExcluirLead && (
                  <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onExcluirLead(lead);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Lead</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── TAG VISUAL DE PRIORIDADE / TEMPO DE PARADA ─── */}
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <span
          className={cn(
            'inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border',
            isAlertaParada
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/70'
              : 'bg-slate-100/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          )}
        >
          <Clock className={cn('w-3 h-3', isAlertaParada ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400')} />
          <span>{tempoParada}</span>
        </span>

        {origemConfig && (
          <span className={cn('text-[10px] font-extrabold px-2 py-0.5 rounded-full', origemConfig.color)}>
            {origemConfig.label}
          </span>
        )}

        {lead.prioridade === 'alta' && (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 text-rose-500" /> Alta
          </span>
        )}
      </div>

      {/* ─── PERFIL / ORÇAMENTO DO CLIENTE ─── */}
      <div className="mt-2.5 p-2 rounded-xl bg-slate-50/90 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 space-y-1">
        <div className="flex items-start gap-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
          <Tag className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed">
            {lead.perfil_interesse || 'Perfil em qualificação'}
          </span>
        </div>

        {lead.faixa_orcamento && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200/40 dark:border-slate-800/60">
            <DollarSign className="w-3 h-3 shrink-0" />
            <span>Orçamento: {lead.faixa_orcamento}</span>
          </div>
        )}
      </div>

      {/* ─── IMÓVEL DE INTERESSE VINCULADO (COM MINIATURA E TÍTULO) ─── */}
      {imovelInteresse && (
        <div className="mt-2.5 flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
          {imovelFoto ? (
            <img
              src={imovelFoto}
              alt={imovelInteresse.titulo}
              className="w-11 h-11 rounded-lg object-cover shrink-0 shadow-2xs border border-emerald-200/60 dark:border-emerald-800/60"
              loading="lazy"
            />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
              Imóvel de Interesse
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate leading-tight mt-0.5">
              {imovelInteresse.titulo}
            </p>
            {proximaVisita && (
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-0.5">
                <CalendarCheck className="w-2.5 h-2.5" /> Visita agendada
              </span>
            )}
          </div>
        </div>
      )}

      {/* ─── RODAPÉ: Ações Rápidas Adaptadas por Etapa ─── */}
      <div className="flex items-center justify-between gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Caso seja "Novos Leads": Botão Principal é [ 💬 Primeiro Contato ] */}
          {etapaAtual === 'novos_leads' ? (
            <button
              type="button"
              onClick={() => onPrimeiroContato?.(lead)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs hover:shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
              title="Disparar primeiro contato via Evolution API com confirmação"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>💬 Primeiro Contato</span>
            </button>
          ) : (
            <>
              {/* Botão Rápido WhatsApp para demais etapas */}
              <a
                href={directWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs hover:shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              {/* Botão + Agendar Visita (a partir da etapa de qualificação) */}
              <button
                type="button"
                onClick={() => onAgendarVisita(lead)}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-purple-950/40 text-slate-700 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 font-bold text-xs transition-colors cursor-pointer"
                title="Agendar visita com este lead"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Agendar</span>
              </button>
            </>
          )}
        </div>

        {/* Atalhos Rápidos para Avançar/Retroceder Etapa */}
        <div className="flex items-center gap-0.5 shrink-0">
          {prevEtapa && (
            <button
              type="button"
              onClick={() => onMoverEtapa(lead.id, prevEtapa.id)}
              title={`Voltar para ${prevEtapa.label}`}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {nextEtapa && (
            <button
              type="button"
              onClick={() => onMoverEtapa(lead.id, nextEtapa.id)}
              title={`Avançar para ${nextEtapa.label}`}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
