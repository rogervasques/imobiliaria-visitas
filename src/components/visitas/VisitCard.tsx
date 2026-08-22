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
} from 'lucide-react';
import {
  formatFriendlyDate,
  formatPhone,
  formatTime,
  getWhatsAppDirectLink,
} from '@/lib/utils';
import { useData } from '@/context/DataContext';

interface VisitCardProps {
  visita: Visita;
  onEdit?: (visita: Visita) => void;
}

export function VisitCard({ visita, onEdit }: VisitCardProps) {
  const { atualizarStatusVisita, removerVisita, showToast } = useData();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusBadges: Record<
    StatusVisita,
    { label: string; variant: 'warning' | 'success' | 'danger' | 'default' }
  > = {
    agendada: { label: 'Agendada', variant: 'warning' },
    confirmada: { label: 'Confirmada', variant: 'success' },
    cancelada: { label: 'Cancelada', variant: 'danger' },
    reagendada: { label: 'Reagendada', variant: 'default' },
  };

  const handleStatusChange = async (novoStatus: StatusVisita) => {
    setShowStatusMenu(false);
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

              {/* Status da Visita */}
              <Badge variant={statusBadges[visita.status]?.variant || 'default'}>
                {statusBadges[visita.status]?.label || visita.status}
              </Badge>
            </div>

            {/* Menu de Três Pontos (...) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Opções da Visita"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showStatusMenu && (
                <div className="absolute right-0 top-8 z-30 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    Alterar Status
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('agendada')}
                    className="w-full text-left px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-500" /> Marcar como Agendada
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleStatusChange('confirmada')}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Marcar Confirmada
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('cancelada')}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-500" /> Cancelar Visita
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" /> Editar Visita
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowStatusMenu(false);
                      setIsDeleteModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Excluir Visita
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
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Roteiro ({visita.imoveis?.length || visita.imoveis_ids?.length} imóveis)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">
                  {visita.imovel
                    ? `${visita.imovel.endereco}, ${visita.imovel.numero || 'S/N'} - ${visita.imovel.bairro}`
                    : 'Local a confirmar'}
                </span>
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

          {/* Dois Botões Visualmente Idênticos de WhatsApp (Verde Oficial) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* WhatsApp Cliente */}
            <a
              href={directWhatsAppCliente}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                variant="whatsapp"
                size="sm"
                className="w-full text-xs font-semibold py-2"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1" />
                WhatsApp Cliente
              </Button>
            </a>

            {/* WhatsApp Proprietário (Idêntico ao Cliente) */}
            <a
              href={directWhatsAppProprietario}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                variant="whatsapp"
                size="sm"
                className="w-full text-xs font-semibold py-2"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1" />
                WhatsApp Proprietário
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
