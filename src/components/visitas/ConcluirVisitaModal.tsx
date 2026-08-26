'use client';

import React, { useState } from 'react';
import { Visita } from '@/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useData } from '@/context/DataContext';
import { CheckCircle2 } from 'lucide-react';

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
      maxWidth="sm"
    >
      <div className="space-y-4 pt-1">
        {/* Checkboxes Essenciais */}
        <div className="space-y-2.5 pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer group select-none">
            <input
              type="checkbox"
              checked={enviarPosVisitaCliente}
              onChange={(e) => setEnviarPosVisitaCliente(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors text-xs sm:text-sm">
              Enviar WhatsApp pós-visita ao Cliente (Pedir feedback)
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer group select-none">
            <input
              type="checkbox"
              checked={enviarComprovacaoProprietario}
              onChange={(e) => setEnviarComprovacaoProprietario(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors text-xs sm:text-sm">
              Enviar WhatsApp de comprovação ao Proprietário
            </span>
          </label>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
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
