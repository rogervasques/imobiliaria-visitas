'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Cliente } from '@/types';
import { Trash2, AlertTriangle, User } from 'lucide-react';

interface ConfirmDeleteLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Cliente | null;
  onConfirm: (leadId: string) => Promise<void> | void;
}

export function ConfirmDeleteLeadModal({ isOpen, onClose, lead, onConfirm }: ConfirmDeleteLeadModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!lead) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(lead.id);
      onClose();
    } catch (err) {
      console.error('Erro ao excluir lead:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Excluir Lead do Funil"
      subtitle="Confirmação de remoção definitiva"
      maxWidth="sm"
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-extrabold text-sm text-rose-900 dark:text-rose-100">
              Tem certeza que deseja excluir?
            </p>
            <p className="mt-0.5 text-rose-700 dark:text-rose-300">
              O lead <strong className="font-bold">{lead.nome}</strong> será removido do funil e da base de contatos.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting} size="sm">
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            disabled={isDeleting}
            size="sm"
            className="font-bold"
          >
            {isDeleting ? 'Excluindo...' : 'Sim, Excluir Lead'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
