'use client';

import React, { useState } from 'react';
import { Visita, StatusVisita } from '@/types';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EditarVisitaModal } from './EditarVisitaModal';
import {
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Building2,
  Trash2,
  AlertTriangle,
  Pencil,
  RotateCcw,
  Check,
  CheckCheck,
  User,
  Navigation,
  ChevronDown,
} from 'lucide-react';
import {
  formatFriendlyDate,
  formatPhone,
  formatTime,
  getWhatsAppDirectLink,
} from '@/lib/utils';
import { getGoogleMapsDirectionsUrl, getGoogleMapsSearchUrl } from '@/lib/maps';
import { useData } from '@/context/DataContext';

interface VisitCardProps {
  visita: Visita;
  onEdit?: (visita: Visita) => void;
}

export function VisitCard({ visita, onEdit }: VisitCardProps) {
  const { atualizarStatusVisita, removerVisita, showToast } = useData();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusBadges: Record<
    StatusVisita,
    { label: string; variant: 'warning' | 'success' | 'danger' | 'purple' | 'default'; dotColor: string }
  > = {
    agendada: { label: 'Agendada', variant: 'warning', dotColor: 'bg-amber-400 border-amber-500' },
    confirmada: { label: 'Confirmada', variant: 'success', dotColor: 'bg-emerald-600 border-emerald-500' },
    concluida: { label: 'Concluída', variant: 'purple', dotColor: 'bg-purple-500 border-purple-400' },
    reagendada: { label: 'Concluída', variant: 'purple', dotColor: 'bg-purple-500 border-purple-400' },
    cancelada: { label: 'Cancelada', variant: 'danger', dotColor: 'bg-rose-500 border-rose-400' },
  };

  // Regra por Horário: Se atingir/ultrapassar o horário e não estiver Concluída ou Cancelada
  const isHorarioAtingido = new Date(visita.data_hora_visita).getTime() <= Date.now();
  const podeConcluir = isHorarioAtingido && visita.status !== 'concluida' && visita.status !== 'reagendada' && visita.status !== 'cancelada';

  const handleStatusChange = async (novoStatus: StatusVisita) => {
    setShowStatusDropdown(false);
    await atualizarStatusVisita(visita.id, novoStatus);
  };

  const handleOpenEdit = () => {
    setShowStatusMenu(false);
    if (onEdit) {
      onEdit(visita);
    } else {
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteVisita = async () => {
    setIsDeleting(true);
    try {
      await removerVisita(visita.id);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Erro ao excluir visita:', err);
      showToast('Erro ao excluir a visita. Tente novamente.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Link direto de WhatsApp para o Cliente
  const directWhatsAppCliente = visita.cliente?.telefone
    ? getWhatsAppDirectLink(
        visita.cliente.telefone,
        `Olá, ${visita.cliente.nome}! Tudo bem? Gostaria de falar sobre nossa visita ao imóvel ${visita.imovel?.titulo || ''}.`
      )
    : '#';

  // Link direto de WhatsApp para o Proprietário
  const directWhatsAppProprietario = visita.imovel?.proprietario_telefone
    ? getWhatsAppDirectLink(
        visita.imovel.proprietario_telefone,
        `Olá, ${visita.imovel.proprietario_nome}! Gostaria de falar sobre a visita agendada ao seu imóvel (${visita.imovel?.titulo || ''}) com o cliente ${visita.cliente?.nome || ''}.`
      )
    : '#';

  // Link do Google Maps / Rotas
  const directMapsUrl = visita.imovel ? getGoogleMapsDirectionsUrl(visita.imovel) : '#';

  return (
    <>
      <Card className="hover:border-emerald-500/40 transition-all duration-300 relative group overflow-visible">
        <CardContent className="p-4 sm:p-5">
          {/* Cabeçalho do Card */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tag Horário */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold shadow-xs">
                <Clock className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span>{formatTime(visita.data_hora_visita)}</span>
              </div>

              {/* Data Amigável */}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {formatFriendlyDate(visita.data_hora_visita)}
              </span>

              {/* ─── 1. Pílula de Status Interativa com Dropdown ─── */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setShowStatusDropdown(v => !v)}
                  className="inline-flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all"
                  title="Clique para alterar o status"
                >
                  <Badge variant={statusBadges[visita.status]?.variant || 'default'} size="sm" className="font-bold cursor-pointer">
                    <div className={`w-2 h-2 rounded-full border ${statusBadges[visita.status]?.dotColor || 'bg-slate-400'}`} />
                    <span>{statusBadges[visita.status]?.label || visita.status}</span>
                    <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                  </Badge>
                </button>

                {showStatusDropdown && (
                  <div
                    className="absolute left-0 top-full mt-1.5 z-40 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      Alterar Status
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('agendada')}
                      className="w-full text-left px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500 shrink-0" />
                      <span>Agendada</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('confirmada')}
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-emerald-500 shrink-0" />
                      <span>Confirmada</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('concluida')}
                      className="w-full text-left px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-purple-400 shrink-0" />
                      <span>Concluída</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('cancelada')}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-400 shrink-0" />
                      <span>Cancelada</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ─── 3. Menu de Três Pontos Simplificado (...) ─── */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Mais opções"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showStatusMenu && (
                <div className="absolute right-0 top-8 z-30 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    <span>Editar Visita</span>
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowStatusMenu(false);
                      setIsDeleteModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Excluir Visita</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Informações do Imóvel com Thumbnail no Canto Esquerdo */}
          <div className="flex items-start gap-3.5 mb-3.5">
            {/* Thumbnail da Foto Principal */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-xs">
              {visita.imovel?.imagem_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={visita.imovel.imagem_url}
                  alt={visita.imovel.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Building2 className="w-7 h-7" />
                </div>
              )}
              {visita.imovel?.codigo && (
                <div className="absolute bottom-1 left-1 bg-black/65 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-medium">
                  {visita.imovel.codigo}
                </div>
              )}
            </div>

            {/* Título e Endereço */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                  {visita.imovel?.titulo || 'Imóvel sem título'}
                </h4>
                {((visita.imoveis && visita.imoveis.length > 1) || (visita.imoveis_ids && visita.imoveis_ids.length > 1)) && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                    Roteiro ({visita.imoveis?.length || visita.imoveis_ids?.length} imóveis)
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">
                    {visita.imovel
                      ? `${visita.imovel.endereco}, ${visita.imovel.numero || 'S/N'} - ${visita.imovel.bairro}`
                      : 'Local a confirmar'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                  <a
                    href={getGoogleMapsDirectionsUrl(visita.imovel)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-200 dark:border-blue-800 transition-colors shadow-xs"
                    title="Traçar rota no Google Maps até o imóvel"
                  >
                    <Navigation className="w-3 h-3 text-blue-500" />
                    <span>🚗 Traçar Rota</span>
                  </a>

                  <a
                    href={getGoogleMapsSearchUrl(visita.imovel)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
                    title="Abrir no Google Maps"
                  >
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    <span>📍 Mapa</span>
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <User className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">
                  Corretor: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{visita.corretor_nome || visita.created_by_user_nome || 'Roger Vasques Berchembrock'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Detalhes do Cliente e Proprietário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 text-xs mb-3.5">
            {/* Cliente */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cliente Visitante
              </span>
              <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {visita.cliente?.nome || 'Cliente não identificado'}
              </div>
              <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{formatPhone(visita.cliente?.telefone)}</span>
              </div>
            </div>

            {/* Proprietário */}
            <div className="space-y-0.5 sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Proprietário
              </span>
              <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {visita.imovel?.proprietario_nome || 'Não informado'}
              </div>
              <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{formatPhone(visita.imovel?.proprietario_telefone)}</span>
              </div>
            </div>
          </div>

          {/* Status das 3 Notificações WhatsApp */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800/60 mb-3.5 text-slate-500">
            {/* Confirmação */}
            <div className="flex items-center gap-1 truncate">
              {visita.whatsapp_confirmacao_cliente === 'visualizado' || visita.whatsapp_confirmacao_cliente === 'lido' ? (
                <CheckCheck className="w-3.5 h-3.5 text-sky-500 shrink-0 stroke-[2.5]" />
              ) : visita.whatsapp_confirmacao_cliente === 'entregue' ? (
                <CheckCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 stroke-[2.5]" />
              ) : visita.whatsapp_confirmacao_cliente === 'enviado' ? (
                <Check className="w-3.5 h-3.5 text-slate-400 shrink-0 stroke-[2.5]" />
              ) : visita.whatsapp_confirmacao_cliente === 'inativo' || visita.whatsapp_confirmacao_cliente === 'ignorado' ? (
                <span className="text-[10px]">🚫</span>
              ) : (
                <span className="text-[10px]">⏳</span>
              )}
              <span className="truncate">Conf:</span>
              <span className={`font-bold ${visita.whatsapp_confirmacao_cliente === 'visualizado' ? 'text-sky-600' : visita.whatsapp_confirmacao_cliente === 'entregue' || visita.whatsapp_confirmacao_cliente === 'enviado' ? 'text-emerald-600' : 'text-slate-400'}`}>
                {visita.whatsapp_confirmacao_cliente === 'visualizado' ? 'Lida' : visita.whatsapp_confirmacao_cliente === 'entregue' ? 'Entregue' : visita.whatsapp_confirmacao_cliente === 'enviado' ? 'Enviada' : visita.whatsapp_confirmacao_cliente === 'inativo' || visita.whatsapp_confirmacao_cliente === 'ignorado' ? 'Inativo' : 'Pendente'}
              </span>
            </div>

            {/* Lembrete 1h */}
            <div className="flex items-center gap-1 truncate">
              {visita.whatsapp_lembrete_cliente === 'visualizado' || visita.whatsapp_lembrete_cliente === 'lido' ? (
                <CheckCheck className="w-3.5 h-3.5 text-sky-500 shrink-0 stroke-[2.5]" />
              ) : visita.whatsapp_lembrete_cliente === 'entregue' ? (
                <CheckCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 stroke-[2.5]" />
              ) : visita.whatsapp_lembrete_cliente === 'enviado' ? (
                <Check className="w-3.5 h-3.5 text-slate-400 shrink-0 stroke-[2.5]" />
              ) : visita.whatsapp_lembrete_cliente === 'inativo' || visita.whatsapp_lembrete_cliente === 'ignorado' ? (
                <span className="text-[10px]">🚫</span>
              ) : (
                <span className="text-[10px]">⏳</span>
              )}
              <span className="truncate">Lemb:</span>
              <span className={`font-bold ${visita.whatsapp_lembrete_cliente === 'visualizado' ? 'text-sky-600' : visita.whatsapp_lembrete_cliente === 'entregue' || visita.whatsapp_lembrete_cliente === 'enviado' ? 'text-emerald-600' : 'text-slate-400'}`}>
                {visita.whatsapp_lembrete_cliente === 'visualizado' ? 'Lido' : visita.whatsapp_lembrete_cliente === 'entregue' ? 'Entregue' : visita.whatsapp_lembrete_cliente === 'enviado' ? 'Enviado' : visita.whatsapp_lembrete_cliente === 'inativo' || visita.whatsapp_lembrete_cliente === 'ignorado' ? 'Inativo' : 'Agendado'}
              </span>
            </div>

            {/* Pós-Visita 2h */}
            <div className="flex items-center gap-1 truncate">
              {visita.whatsapp_pos_visita_cliente === 'visualizado' || visita.whatsapp_pos_visita_cliente === 'lido' ? (
                <CheckCheck className="w-3.5 h-3.5 text-sky-500 shrink-0 stroke-[2.5]" />
              ) : visita.whatsapp_pos_visita_cliente === 'entregue' ? (
                <CheckCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 stroke-[2.5]" />
              ) : visita.whatsapp_pos_visita_cliente === 'enviado' ? (
                <Check className="w-3.5 h-3.5 text-slate-400 shrink-0 stroke-[2.5]" />
              ) : visita.whatsapp_pos_visita_cliente === 'inativo' || visita.whatsapp_pos_visita_cliente === 'ignorado' ? (
                <span className="text-[10px]">🚫</span>
              ) : (
                <span className="text-[10px]">⏳</span>
              )}
              <span className="truncate">Pós:</span>
              <span className={`font-bold ${visita.whatsapp_pos_visita_cliente === 'visualizado' ? 'text-sky-600' : visita.whatsapp_pos_visita_cliente === 'entregue' || visita.whatsapp_pos_visita_cliente === 'enviado' ? 'text-emerald-600' : 'text-slate-400'}`}>
                {visita.whatsapp_pos_visita_cliente === 'visualizado' ? 'Lido' : visita.whatsapp_pos_visita_cliente === 'entregue' ? 'Entregue' : visita.whatsapp_pos_visita_cliente === 'enviado' ? 'Enviado' : visita.whatsapp_pos_visita_cliente === 'inativo' || visita.whatsapp_pos_visita_cliente === 'ignorado' ? 'Inativo' : 'Agendado'}
              </span>
            </div>
          </div>

          {/* ─── 2. Botão Dinâmico "Concluir Visita" por Horário ─── */}
          {podeConcluir && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('concluida');
              }}
              className="w-full mb-2.5 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-in fade-in"
              title="Concluir visita agendada"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir Visita</span>
            </button>
          )}

          {/* Três Botões de Ação em Linha: WhatsApp Cliente, WhatsApp Proprietário e Mapa */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {/* WhatsApp Cliente */}
            <a
              href={directWhatsAppCliente}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
              title="WhatsApp Cliente"
            >
              <Button
                variant="whatsapp"
                size="sm"
                className="w-full text-[11px] sm:text-xs font-bold py-1.5 sm:py-2 px-1 sm:px-2 flex items-center justify-center gap-1 truncate shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">WhatsApp </span>
                <span>Cliente</span>
              </Button>
            </a>

            {/* WhatsApp Proprietário */}
            <a
              href={directWhatsAppProprietario}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
              title="WhatsApp Proprietário"
            >
              <Button
                variant="whatsapp"
                size="sm"
                className="w-full text-[11px] sm:text-xs font-bold py-1.5 sm:py-2 px-1 sm:px-2 flex items-center justify-center gap-1 truncate shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">WhatsApp </span>
                <span>Proprietário</span>
              </Button>
            </a>

            {/* Mapa / GPS */}
            <a
              href={directMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
              title="Abrir no Google Maps / GPS"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full text-[11px] sm:text-xs font-bold py-1.5 sm:py-2 px-1 sm:px-2 flex items-center justify-center gap-1 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80 truncate shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                <span className="hidden sm:inline">Abrir </span>
                <span>Mapa</span>
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição de Visita */}
      <EditarVisitaModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        visita={visita}
      />

      {/* Modal de Confirmação de Segurança para Excluir Visita */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Excluir Visita"
        subtitle="Confirmação de segurança (dupla checagem)"
        maxWidth="md"
      >
        <div className="space-y-4 pt-1">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-xs text-rose-950 dark:text-rose-200 space-y-1.5 flex-1">
              <p className="font-bold text-sm text-rose-900 dark:text-rose-100">
                Tem certeza que deseja excluir esta visita?
              </p>
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-rose-100 dark:border-rose-900/30 text-slate-700 dark:text-slate-300 space-y-0.5">
                <p>
                  🏠 Imóvel: <strong>{visita.imovel?.titulo || 'Imóvel'}</strong>
                </p>
                <p>
                  👤 Cliente: <strong>{visita.cliente?.nome || 'Cliente'}</strong>
                </p>
                <p>
                  ⏰ Horário: <strong>{formatFriendlyDate(visita.data_hora_visita)} às {formatTime(visita.data_hora_visita)}</strong>
                </p>
              </div>
              <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                Esta ação é irreversível e removerá este compromisso permanentemente.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteVisita}
              isLoading={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Sim, Excluir Visita
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
