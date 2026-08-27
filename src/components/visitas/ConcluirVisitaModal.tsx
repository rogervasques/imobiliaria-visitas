'use client';

import React, { useState } from 'react';
import { Visita } from '@/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useData } from '@/context/DataContext';
import {
  CheckCircle2,
  UserX,
  CalendarClock,
  XCircle,
  Building2,
  User,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { formatFriendlyDate, formatTime } from '@/lib/utils';

interface ConcluirVisitaModalProps {
  visita: Visita | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onRemarcar?: (visita: Visita) => void;
}

export function ConcluirVisitaModal({
  visita,
  isOpen,
  onClose,
  onSuccess,
  onRemarcar,
}: ConcluirVisitaModalProps) {
  const { concluirVisita, atualizarStatusVisita } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  if (!visita) return null;

  // 1. Realizada (Conclusão com sucesso + disparos configurados globalmente)
  const handleRealizada = async () => {
    setSelectedAction('realizada');
    setIsSubmitting(true);
    try {
      await concluirVisita(visita.id);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Erro ao registrar realização da visita:', err);
    } finally {
      setIsSubmitting(false);
      setSelectedAction(null);
    }
  };

  // 2. Não Compareceu (Ausência registrada, sem envios pós-visita)
  const handleNaoCompareceu = async () => {
    setSelectedAction('nao_compareceu');
    setIsSubmitting(true);
    try {
      await atualizarStatusVisita(visita.id, 'nao_compareceu');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Erro ao marcar não comparecimento:', err);
    } finally {
      setIsSubmitting(false);
      setSelectedAction(null);
    }
  };

  // 3. Remarcar (Abre tela/modal de reagendamento)
  const handleRemarcar = () => {
    onClose();
    onRemarcar?.(visita);
  };

  // 4. Cancelar (Cancelamento definitivo, sem envios pós-visita)
  const handleCancelar = async () => {
    setSelectedAction('cancelada');
    setIsSubmitting(true);
    try {
      await atualizarStatusVisita(visita.id, 'cancelada');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Erro ao cancelar visita:', err);
    } finally {
      setIsSubmitting(false);
      setSelectedAction(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Desfecho do Agendamento"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Resumo Rápido da Visita */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
              {visita.imovel?.titulo || 'Imóvel agendado'}
            </h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                {visita.cliente?.nome || 'Cliente'}
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                <Clock className="w-3 h-3 text-purple-500" />
                {formatFriendlyDate(visita.data_hora_visita)} às {formatTime(visita.data_hora_visita)}
              </span>
            </div>
          </div>
        </div>

        {/* Instrução */}
        <div>
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
            Selecione o Resultado da Visita:
          </h5>

          {/* Grid de Opções de Desfecho */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Opção 1: [ 🟣 Realizada ] */}
            <button
              type="button"
              onClick={handleRealizada}
              disabled={isSubmitting}
              className="p-3.5 rounded-2xl border-2 border-purple-500/30 dark:border-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/70 dark:hover:bg-purple-950/50 hover:border-purple-500 transition-all text-left group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs sm:text-sm text-purple-900 dark:text-purple-200">
                      🟣 Realizada
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-purple-700/80 dark:text-purple-300/70 mt-0.5 leading-snug">
                    Visita concluída com sucesso. Disparos automáticos conforme configurações.
                  </p>
                </div>
              </div>
              {selectedAction === 'realizada' && (
                <div className="absolute inset-0 bg-purple-600/10 flex items-center justify-center backdrop-blur-xs font-bold text-xs text-purple-700">
                  Gravando...
                </div>
              )}
            </button>

            {/* Opção 2: [ 🟡 Não Compareceu ] */}
            <button
              type="button"
              onClick={handleNaoCompareceu}
              disabled={isSubmitting}
              className="p-3.5 rounded-2xl border-2 border-amber-400/30 dark:border-amber-400/40 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-100/70 dark:hover:bg-amber-950/50 hover:border-amber-500 transition-all text-left group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform font-bold">
                  <UserX className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                      🟡 Não Compareceu
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70 mt-0.5 leading-snug">
                    Cliente ou proprietário faltou. Sem envios de pós-visita.
                  </p>
                </div>
              </div>
              {selectedAction === 'nao_compareceu' && (
                <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center backdrop-blur-xs font-bold text-xs text-amber-700">
                  Gravando...
                </div>
              )}
            </button>

            {/* Opção 3: [ 🔵 Remarcar ] */}
            <button
              type="button"
              onClick={handleRemarcar}
              disabled={isSubmitting}
              className="p-3.5 rounded-2xl border-2 border-sky-400/30 dark:border-sky-400/40 bg-sky-50/40 dark:bg-sky-950/20 hover:bg-sky-100/70 dark:hover:bg-sky-950/50 hover:border-sky-500 transition-all text-left group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs sm:text-sm text-sky-900 dark:text-sky-200">
                      🔵 Remarcar
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-sky-700/80 dark:text-sky-300/70 mt-0.5 leading-snug">
                    Abre formulário para escolher nova data e horário.
                  </p>
                </div>
              </div>
            </button>

            {/* Opção 4: [ 🔴 Cancelar ] */}
            <button
              type="button"
              onClick={handleCancelar}
              disabled={isSubmitting}
              className="p-3.5 rounded-2xl border-2 border-rose-400/30 dark:border-rose-400/40 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/70 dark:hover:bg-rose-950/50 hover:border-rose-500 transition-all text-left group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <XCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs sm:text-sm text-rose-900 dark:text-rose-200">
                      🔴 Cancelar
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-rose-700/80 dark:text-rose-300/70 mt-0.5 leading-snug">
                    Cancelamento definitivo. Sem envios pós-visita.
                  </p>
                </div>
              </div>
              {selectedAction === 'cancelada' && (
                <div className="absolute inset-0 bg-rose-600/10 flex items-center justify-center backdrop-blur-xs font-bold text-xs text-rose-700">
                  Cancelando...
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Rodapé Informativo e Fechar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            Execução imediata
          </span>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-semibold"
          >
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
