'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Visita } from '@/types';
import { useData } from '@/context/DataContext';
import {
  CheckCircle2,
  UserX,
  CalendarClock,
  XCircle,
  X,
  Sparkles,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SlideToConfirm } from '../ui/SlideToConfirm';

type DesfechoType = 'realizada' | 'nao_compareceu' | 'remarcar' | 'cancelada';

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
  const [mounted, setMounted] = useState(false);
  const [selectedAction, setSelectedAction] = useState<DesfechoType>('realizada');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Swipe Down to Dismiss (Mobile Drag Gesture)
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const touchStartYRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset do estado ao abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedAction('realizada');
      setIsSubmitting(false);
      setIsConfirmed(false);
      setDragOffsetY(0);
      setIsDraggingSheet(false);
    }
  }, [isOpen]);

  // Fechamento no Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Previne scroll do body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Feedback Háptico
  const triggerHaptic = useCallback((duration = 40) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch {
        // ignore
      }
    }
  }, []);

  // Seleção de opção com vibração
  const handleSelectAction = (action: DesfechoType) => {
    if (isSubmitting || isConfirmed) return;
    setSelectedAction(action);
    triggerHaptic(40);
  };

  // Execução da Confirmação (Slider no mobile ou Botão no Desktop)
  const handleExecuteDesfecho = async () => {
    if (!visita || isSubmitting || isConfirmed) return;

    setIsSubmitting(true);
    triggerHaptic(60);

    try {
      if (selectedAction === 'realizada') {
        await concluirVisita(visita.id);
      } else if (selectedAction === 'nao_compareceu') {
        await atualizarStatusVisita(visita.id, 'nao_compareceu');
      } else if (selectedAction === 'cancelada') {
        await atualizarStatusVisita(visita.id, 'cancelada');
      } else if (selectedAction === 'remarcar') {
        setIsConfirmed(true);
        setTimeout(() => {
          onClose();
          onRemarcar?.(visita);
        }, 250);
        return;
      }

      setIsConfirmed(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 350);
    } catch (err) {
      console.error('Erro ao salvar desfecho da visita:', err);
      setIsSubmitting(false);
    }
  };

  // Gestos de Touch na Bottom Sheet (Mobile Drag Down to Close)
  const handleSheetTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    setIsDraggingSheet(true);
  };

  const handleSheetTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingSheet) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartYRef.current;
    if (deltaY > 0) {
      setDragOffsetY(deltaY);
    } else {
      setDragOffsetY(0);
    }
  };

  const handleSheetTouchEnd = () => {
    if (!isDraggingSheet) return;
    setIsDraggingSheet(false);
    if (dragOffsetY > 70) {
      // Arrastou mais de 70px para baixo: fecha o modal
      onClose();
    } else {
      // Retorna para a posição original
      setDragOffsetY(0);
    }
  };

  if (!isOpen || !mounted || !visita) return null;

  // Configurações visuais do desfecho
  const actionConfig = {
    realizada: {
      colorScheme: 'emerald' as const,
      sliderLabel: 'Deslize para confirmar',
      desktopButtonText: 'Confirmar Realizada',
      desktopButtonBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25',
    },
    nao_compareceu: {
      colorScheme: 'amber' as const,
      sliderLabel: 'Deslize para confirmar',
      desktopButtonText: 'Confirmar Não Compareceu',
      desktopButtonBg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25',
    },
    remarcar: {
      colorScheme: 'sky' as const,
      sliderLabel: 'Deslize para remarcar',
      desktopButtonText: 'Ir para Remarcar',
      desktopButtonBg: 'bg-sky-600 hover:bg-sky-700 shadow-sky-500/25',
    },
    cancelada: {
      colorScheme: 'rose' as const,
      sliderLabel: 'Deslize para confirmar',
      desktopButtonText: 'Confirmar Cancelamento',
      desktopButtonBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25',
    },
  }[selectedAction];

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={isSubmitting ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Container */}
      <div
        style={{
          transform: dragOffsetY > 0 ? `translateY(${dragOffsetY}px)` : undefined,
          transition: isDraggingSheet ? 'none' : 'transform 0.2s ease-out',
        }}
        className={cn(
          'relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 pb-safe'
        )}
      >
        {/* Drag Handle (Mobile Only) */}
        <div
          className="pt-3 pb-1 cursor-grab active:cursor-grabbing sm:hidden touch-none"
          onTouchStart={handleSheetTouchStart}
          onTouchMove={handleSheetTouchMove}
          onTouchEnd={handleSheetTouchEnd}
        >
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
        </div>

        {/* Header: Desfecho do Agendamento + Apenas Nome do Cliente */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Desfecho do Agendamento
            </h3>
            {visita.cliente?.nome && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {visita.cliente.nome}
              </p>
            )}
          </div>

          {/* Botão Fechar (Apenas Desktop - no mobile usa swipe down) */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="hidden sm:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto no-scrollbar">
          {/* ─── HIERARQUIA DE OPÇÕES ─── */}
          <div className="space-y-2.5">
            {/* 1. CAMINHO FELIZ (TOPO - 100% LARGURA): REALIZADA */}
            <button
              type="button"
              onClick={() => handleSelectAction('realizada')}
              disabled={isSubmitting}
              className={cn(
                'w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer relative overflow-hidden group',
                selectedAction === 'realizada'
                  ? 'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/50 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-400 hover:bg-emerald-50/70'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                    selectedAction === 'realizada'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300'
                  )}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="font-black text-sm sm:text-base text-emerald-950 dark:text-emerald-100">
                  Realizada
                </div>
              </div>

              {/* Indicador de Seleção */}
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                  selectedAction === 'realizada'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-emerald-300 dark:border-emerald-700'
                )}
              >
                {selectedAction === 'realizada' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </button>

            {/* 2. OPÇÕES DE EXCEÇÃO (GRID 3 COLUNAS) */}
            <div className="grid grid-cols-3 gap-2">
              {/* Opção: Não Compareceu */}
              <button
                type="button"
                onClick={() => handleSelectAction('nao_compareceu')}
                disabled={isSubmitting}
                className={cn(
                  'p-3 rounded-2xl border-2 text-left transition-all duration-150 flex flex-col justify-between gap-2.5 cursor-pointer relative overflow-hidden',
                  selectedAction === 'nao_compareceu'
                    ? 'border-amber-500 bg-amber-50/90 dark:bg-amber-950/50 ring-2 ring-amber-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-amber-400 hover:bg-amber-50/40'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                      selectedAction === 'nao_compareceu'
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    )}
                  >
                    <UserX className="w-4 h-4" />
                  </div>
                  <div
                    className={cn(
                      'w-3.5 h-3.5 rounded-full border flex items-center justify-center',
                      selectedAction === 'nao_compareceu'
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-slate-300 dark:border-slate-700'
                    )}
                  >
                    {selectedAction === 'nao_compareceu' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100 leading-tight">
                  Não Compareceu
                </div>
              </button>

              {/* Opção: Remarcar */}
              <button
                type="button"
                onClick={() => handleSelectAction('remarcar')}
                disabled={isSubmitting}
                className={cn(
                  'p-3 rounded-2xl border-2 text-left transition-all duration-150 flex flex-col justify-between gap-2.5 cursor-pointer relative overflow-hidden',
                  selectedAction === 'remarcar'
                    ? 'border-sky-500 bg-sky-50/90 dark:bg-sky-950/50 ring-2 ring-sky-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-sky-400 hover:bg-sky-50/40'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                      selectedAction === 'remarcar'
                        ? 'bg-sky-500 text-white'
                        : 'bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400'
                    )}
                  >
                    <CalendarClock className="w-4 h-4" />
                  </div>
                  <div
                    className={cn(
                      'w-3.5 h-3.5 rounded-full border flex items-center justify-center',
                      selectedAction === 'remarcar'
                        ? 'border-sky-500 bg-sky-500'
                        : 'border-slate-300 dark:border-slate-700'
                    )}
                  >
                    {selectedAction === 'remarcar' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100 leading-tight">
                  Remarcar
                </div>
              </button>

              {/* Opção: Cancelada */}
              <button
                type="button"
                onClick={() => handleSelectAction('cancelada')}
                disabled={isSubmitting}
                className={cn(
                  'p-3 rounded-2xl border-2 text-left transition-all duration-150 flex flex-col justify-between gap-2.5 cursor-pointer relative overflow-hidden',
                  selectedAction === 'cancelada'
                    ? 'border-rose-500 bg-rose-50/90 dark:bg-rose-950/50 ring-2 ring-rose-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-rose-400 hover:bg-rose-50/40'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                      selectedAction === 'cancelada'
                        ? 'bg-rose-500 text-white'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                    )}
                  >
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div
                    className={cn(
                      'w-3.5 h-3.5 rounded-full border flex items-center justify-center',
                      selectedAction === 'cancelada'
                        ? 'border-rose-500 bg-rose-500'
                        : 'border-slate-300 dark:border-slate-700'
                    )}
                  >
                    {selectedAction === 'cancelada' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100 leading-tight">
                  Cancelada
                </div>
              </button>
            </div>
          </div>

          {/* ─── CONFIRMAÇÃO: BOTÃO DE CLIQUE NO PC / SLIDER NO MOBILE ─── */}
          <div className="pt-1">
            {/* 1. Modo Desktop / PC: Botão de Clique Direto */}
            <div className="hidden sm:block">
              <button
                type="button"
                onClick={handleExecuteDesfecho}
                disabled={isSubmitting || isConfirmed}
                className={cn(
                  'w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm text-white shadow-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]',
                  actionConfig.desktopButtonBg,
                  (isSubmitting || isConfirmed) && 'opacity-80 cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gravando desfecho...</span>
                  </>
                ) : isConfirmed ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirmado!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{actionConfig.desktopButtonText}</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Modo Mobile: Slider de Confirmação Interativo */}
            <div className="block sm:hidden">
              <SlideToConfirm
                onConfirm={handleExecuteDesfecho}
                isLoading={isSubmitting}
                isConfirmed={isConfirmed}
                colorScheme={actionConfig.colorScheme}
                label={actionConfig.sliderLabel}
                loadingLabel="Gravando..."
                confirmedLabel="Confirmado!"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
