'use client';

import React, { useState } from 'react';
import { Visita } from '@/types';
import { Modal } from '../ui/Modal';
import { useData } from '@/context/DataContext';
import { CheckCircle2, UserX, CalendarClock, XCircle } from 'lucide-react';

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

  // 3. Remarcar (Abre formulário/modal de reagendamento)
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
      maxWidth="sm"
    >
      <div className="pt-2 pb-1">
        {/* Grid com apenas os 4 botões de Desfecho */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Opção 1: [ 🟣 Realizada ] */}
          <button
            type="button"
            onClick={handleRealizada}
            disabled={isSubmitting}
            className="p-3.5 rounded-2xl border-2 border-purple-500/30 dark:border-purple-500/40 bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/60 hover:border-purple-500 transition-all text-center group cursor-pointer relative overflow-hidden flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-xs sm:text-sm text-purple-900 dark:text-purple-200">
              🟣 Realizada
            </span>
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
            className="p-3.5 rounded-2xl border-2 border-amber-400/30 dark:border-amber-400/40 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:border-amber-500 transition-all text-center group cursor-pointer relative overflow-hidden flex items-center justify-center gap-2"
          >
            <UserX className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-xs sm:text-sm text-amber-900 dark:text-amber-200">
              🟡 Não Compareceu
            </span>
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
            className="p-3.5 rounded-2xl border-2 border-sky-400/30 dark:border-sky-400/40 bg-sky-50/60 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-950/60 hover:border-sky-500 transition-all text-center group cursor-pointer relative overflow-hidden flex items-center justify-center gap-2"
          >
            <CalendarClock className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-xs sm:text-sm text-sky-900 dark:text-sky-200">
              🔵 Remarcar
            </span>
          </button>

          {/* Opção 4: [ 🔴 Cancelar ] */}
          <button
            type="button"
            onClick={handleCancelar}
            disabled={isSubmitting}
            className="p-3.5 rounded-2xl border-2 border-rose-400/30 dark:border-rose-400/40 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:border-rose-500 transition-all text-center group cursor-pointer relative overflow-hidden flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-xs sm:text-sm text-rose-900 dark:text-rose-200">
              🔴 Cancelar
            </span>
            {selectedAction === 'cancelada' && (
              <div className="absolute inset-0 bg-rose-600/10 flex items-center justify-center backdrop-blur-xs font-bold text-xs text-rose-700">
                Cancelando...
              </div>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
