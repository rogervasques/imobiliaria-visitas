'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Visita, Imovel, StatusDisparoWhatsApp } from '@/types';
import { ImovelDetalhesModal } from '../imoveis/ImovelDetalhesModal';
import { EditarVisitaModal } from './EditarVisitaModal';
import {
  MapPin,
  Phone,
  MessageCircle,
  Building2,
  KeyRound,
  Tag,
  FileText,
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  User,
  Calendar,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import { formatDateTime, formatPhone, getWhatsAppDirectLink, formatCurrency } from '@/lib/utils';

interface VisitaDetalhesModalProps {
  visita: Visita | null;
  isOpen: boolean;
  onClose: () => void;
}

function WhatsAppDeliveryStatusBadge({
  ativo,
  status,
}: {
  ativo?: boolean;
  status?: StatusDisparoWhatsApp;
  tipo?: 'confirmacao' | 'lembrete' | 'pos_visita';
}) {
  // 1. Inativo (Desmarcado na criação da visita)
  if (ativo === false || status === 'ignorado' || status === 'inativo') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700">
        <span className="text-xs">🚫</span>
        <span>Inativo</span>
      </div>
    );
  }

  // 2. Falha (Erro de envio ou número inválido)
  if (status === 'falha') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800/60">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        <span>⚠️ Falha</span>
      </div>
    );
  }

  // 3. Visualizado (2 checks azuis #53bdeb)
  if (status === 'visualizado' || status === 'lido') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-200 dark:border-sky-800/60">
        <CheckCheck className="w-4 h-4 text-sky-500 shrink-0 stroke-[2.5]" />
        <span>Visualizado</span>
      </div>
    );
  }

  // 4. Entregue (2 checks cinzas)
  if (status === 'entregue') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
        <CheckCheck className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 stroke-[2.5]" />
        <span>Entregue</span>
      </div>
    );
  }

  // 5. Enviado (1 check cinza)
  if (status === 'enviado') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
        <Check className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 stroke-[2.5]" />
        <span>Enviado</span>
      </div>
    );
  }

  // 6. Agendado / Pendente (⏳)
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800/60">
      <span className="text-xs">⏳</span>
      <span>Agendado / Pendente</span>
    </div>
  );
}

export function VisitaDetalhesModal({ visita, isOpen, onClose }: VisitaDetalhesModalProps) {
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!visita) return null;

  const imoveisLista: Imovel[] = (visita.imoveis && visita.imoveis.length > 0)
    ? visita.imoveis
    : visita.imovel
    ? [visita.imovel]
    : [];

  const cliente = visita.cliente;

  const statusLabels: Record<string, string> = {
    agendada: 'Agendada',
    confirmada: 'Confirmada',
    cancelada: 'Cancelada',
    reagendada: 'Reagendada',
  };

  const statusColors: Record<string, string> = {
    agendada: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    confirmada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    cancelada: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    reagendada: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  const waCliente = cliente?.telefone
    ? getWhatsAppDirectLink(cliente.telefone, `Olá, ${cliente.nome}! Sobre nossa visita agendada pela EasyMob.`)
    : '#';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={imoveisLista.length > 1 ? `Roteiro de Visitas (${imoveisLista.length} Imóveis)` : 'Detalhes da Visita'}
        subtitle={imoveisLista.length > 1 ? `Cliente: ${cliente?.nome || '—'}` : (imoveisLista[0]?.titulo || 'Compromisso')}
        maxWidth="xl"
        headerActions={
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs border border-slate-200 dark:border-slate-700"
            title="Editar Visita"
          >
            <Pencil className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Editar</span>
          </button>
        }
      >
        <div className="space-y-5 pb-1 max-h-[80vh] overflow-y-auto pr-1">
          {/* ── Status e Horário ── */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[visita.status] || statusColors.agendada}`}>
              {statusLabels[visita.status] || visita.status}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>{formatDateTime(visita.data_hora_visita)}</span>
            </div>
            {visita.corretor_nome && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <User className="w-3 h-3" />
                <span>Corretor: {visita.corretor_nome}</span>
              </div>
            )}
          </div>

          {/* ── SEÇÃO 1: ROTEIRO DE IMÓVEIS (CLICÁVEIS) ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-500" />
                {imoveisLista.length > 1 ? `Roteiro de Imóveis (${imoveisLista.length} locais)` : 'Imóvel da Visita'}
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Clique no card para abrir o imóvel
              </span>
            </div>

            <div className="space-y-3">
              {imoveisLista.map((im, index) => {
                const waProp = im.proprietario_telefone
                  ? getWhatsAppDirectLink(im.proprietario_telefone, `Olá, ${im.proprietario_nome}! Sobre a visita agendada pela EasyMob ao imóvel "${im.titulo}".`)
                  : '#';

                return (
                  <div
                    key={im.id || index}
                    onClick={() => setImovelSelecionado(im)}
                    role="button"
                    tabIndex={0}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 cursor-pointer hover:border-emerald-500 hover:shadow-md hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all duration-200 group text-left"
                  >
                    <div className="flex flex-col sm:flex-row gap-3.5 items-start">
                      <div className="relative w-full sm:w-28 h-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group-hover:ring-2 group-hover:ring-emerald-500 transition-all">
                        {im.imagem_url ? (
                          <img src={im.imagem_url} alt={im.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Building2 className="w-6 h-6" />
                          </div>
                        )}
                        <div className="absolute top-1.5 left-1.5 bg-emerald-600 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {im.titulo}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            Ver Imóvel <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{im.endereco}, {im.numero || 'S/N'} - {im.bairro}, {im.cidade}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {im.valor_venda && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                              <Tag className="w-3 h-3" /> Venda: {formatCurrency(im.valor_venda)}
                            </span>
                          )}
                          {im.valor_locacao && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md">
                              <Tag className="w-3 h-3" /> Locação: {formatCurrency(im.valor_locacao)}/mês
                            </span>
                          )}
                        </div>

                        {/* Proprietário do Imóvel */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Proprietário: <strong>{im.proprietario_nome}</strong> {im.proprietario_telefone && `(${formatPhone(im.proprietario_telefone)})`}
                          </span>
                          {im.proprietario_telefone && (
                            <a
                              href={waProp}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> WA Proprietário
                              </button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {im.observacoes_chaves && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span><strong>Chaves:</strong> {im.observacoes_chaves}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SEÇÃO 2: CLIENTE E OBSERVAÇÕES ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cliente && (
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Cliente</span>
                <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{cliente.nome}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" />{formatPhone(cliente.telefone)}</span>
                  <a href={waCliente} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:underline">WhatsApp</a>
                </div>
              </div>
            )}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Obs. Internas</span>
              <p className="text-xs text-slate-700 dark:text-slate-300">{visita.observacoes || 'Nenhuma observação interna.'}</p>
            </div>
          </div>

          {/* ── SEÇÃO 3: RÉGUA DE NOTIFICAÇÕES WHATSAPP (DESIGN CLEAN) ── */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/40 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Régua de Notificações WhatsApp — Status de Entrega
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                Automações EasyMob
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: Confirmação Imediata */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                    1. Confirmação
                  </span>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                    Imediato
                  </span>
                </div>
                <div>
                  <WhatsAppDeliveryStatusBadge
                    ativo={visita.notificar_confirmacao}
                    status={visita.whatsapp_confirmacao_cliente}
                    tipo="confirmacao"
                  />
                </div>
              </div>

              {/* Card 2: Lembrete (1h antes) */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                    2. Lembrete
                  </span>
                  <span className="text-[10px] font-bold uppercase text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950 px-1.5 py-0.5 rounded">
                    1h Antes
                  </span>
                </div>
                <div>
                  <WhatsAppDeliveryStatusBadge
                    ativo={visita.notificar_lembrete}
                    status={visita.whatsapp_lembrete_cliente}
                    tipo="lembrete"
                  />
                </div>
              </div>

              {/* Card 3: Feedback Pós-Visita (2h depois) */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                    3. Pós-Visita
                  </span>
                  <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded">
                    2h Depois
                  </span>
                </div>
                <div>
                  <WhatsAppDeliveryStatusBadge
                    ativo={visita.notificar_pos_visita}
                    status={visita.whatsapp_pos_visita_cliente}
                    tipo="pos_visita"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Detalhes do Imóvel Selecionado */}
      <ImovelDetalhesModal
        imovel={imovelSelecionado}
        isOpen={!!imovelSelecionado}
        onClose={() => setImovelSelecionado(null)}
      />

      {/* Modal de Edição da Visita Atual */}
      {visita && (
        <EditarVisitaModal
          visita={visita}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  );
}

