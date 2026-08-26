'use client';

import React, { useState } from 'react';
import { Visita } from '@/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useData } from '@/context/DataContext';
import {
  CheckCircle2,
  Building2,
  User,
  Calendar,
  Clock,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Phone,
} from 'lucide-react';
import { formatDateTime, formatPhone, getInitials } from '@/lib/utils';

interface ConcluirVisitaModalProps {
  visita: Visita | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ConcluirVisitaModal({
  visita,
  isOpen,
  onClose,
  onSuccess,
}: ConcluirVisitaModalProps) {
  const { concluirVisita } = useData();

  const [enviarPosVisitaCliente, setEnviarPosVisitaCliente] = useState(true);
  const [enviarComprovacaoProprietario, setEnviarComprovacaoProprietario] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!visita) return null;

  const imoveis = (visita.imoveis && visita.imoveis.length > 0)
    ? visita.imoveis
    : visita.imovel
    ? [visita.imovel]
    : [];

  const handleConfirmar = async () => {
    setIsSubmitting(true);
    try {
      await concluirVisita(visita.id, {
        enviarPosVisitaCliente,
        enviarComprovacaoProprietario,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Erro ao concluir visita:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Concluir Visita"
      subtitle={`Confirme a conclusão do atendimento para ${visita.cliente?.nome || 'o cliente'}`}
      maxWidth="lg"
    >
      <div className="space-y-4 pt-1">
        {/* ─── Card de Resumo da Visita ─── */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {getInitials(visita.cliente?.nome || 'CL')}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  {visita.cliente?.nome}
                </h4>
                {visita.cliente?.telefone && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {formatPhone(visita.cliente.telefone)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>{formatDateTime(visita.data_hora_visita)}</span>
            </div>
          </div>

          {/* Roteiro de Imóveis Realizados */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Imóvel(is) Visitado(s):
            </span>
            {imoveis.map((im, idx) => (
              <div key={im?.id || idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="font-semibold truncate">{im?.titulo}</span>
                {im?.codigo && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {im.codigo}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Checkboxes de Ações ao Concluir ─── */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
          <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Ações de Encerramento (WhatsApp)
          </span>

          {/* Checkbox 1: Pós-visita ao Cliente */}
          <label className="flex items-start gap-2.5 cursor-pointer group select-none">
            <input
              type="checkbox"
              checked={enviarPosVisitaCliente}
              onChange={(e) => setEnviarPosVisitaCliente(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="leading-snug flex-1">
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors text-xs">
                Enviar mensagem pós-visita ao Cliente (Pedir feedback)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Dispara mensagem automática pelo WhatsApp solicitando a opinião e interesse em proposta.
              </p>
            </div>
          </label>

          {/* Checkbox 2: Comprovação ao Proprietário */}
          <label className="flex items-start gap-2.5 cursor-pointer group select-none">
            <input
              type="checkbox"
              checked={enviarComprovacaoProprietario}
              onChange={(e) => setEnviarComprovacaoProprietario(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="leading-snug flex-1">
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors text-xs">
                Enviar mensagem de comprovação ao Proprietário
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Confirma formalmente ao proprietário que a visita foi realizada com sucesso por intermédio do corretor.
              </p>
            </div>
          </label>
        </div>

        {/* ─── Tag e Aviso do Comprovante de Atendimento (Ciclo de Vida + 48h) ─── */}
        <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Comprovante de Atendimento &amp; Auditoria</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            A gravação do histórico das mensagens continuará ativa por <strong>mais 48 horas</strong> após esta conclusão para consolidação no <strong>Relatório de Atendimento</strong>.
          </p>
        </div>

        {/* ─── Botões de Ação ─── */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-semibold"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmar}
            isLoading={isSubmitting}
            className="text-xs font-bold shadow-md cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Confirmar e Finalizar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
