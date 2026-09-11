'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronsRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SlideToConfirmProps {
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  isConfirmed?: boolean;
  label?: string;
  loadingLabel?: string;
  confirmedLabel?: string;
  colorScheme?: 'purple' | 'amber' | 'sky' | 'rose' | 'emerald';
  disabled?: boolean;
  className?: string;
}

export function SlideToConfirm({
  onConfirm,
  isLoading = false,
  isConfirmed = false,
  label = 'Deslize para confirmar',
  loadingLabel = 'Gravando...',
  confirmedLabel = 'Confirmado!',
  colorScheme = 'purple',
  disabled = false,
  className,
}: SlideToConfirmProps) {
  const [sliderPosition, setSliderPosition] = useState(0); // 0 to 1 (percentage)
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);

  const colors = {
    purple: {
      bgTrack: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
      fill: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
      thumb: 'bg-purple-600 text-white shadow-purple-500/30 hover:bg-purple-700',
      text: 'text-purple-800 dark:text-purple-200',
    },
    amber: {
      bgTrack: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      fill: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white',
      thumb: 'bg-amber-500 text-white shadow-amber-500/30 hover:bg-amber-600',
      text: 'text-amber-800 dark:text-amber-200',
    },
    sky: {
      bgTrack: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
      fill: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white',
      thumb: 'bg-sky-600 text-white shadow-sky-500/30 hover:bg-sky-700',
      text: 'text-sky-800 dark:text-sky-200',
    },
    rose: {
      bgTrack: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      fill: 'bg-gradient-to-r from-rose-500 to-red-600 text-white',
      thumb: 'bg-rose-600 text-white shadow-rose-500/30 hover:bg-rose-700',
      text: 'text-rose-800 dark:text-rose-200',
    },
    emerald: {
      bgTrack: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      fill: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
      thumb: 'bg-emerald-600 text-white shadow-emerald-500/30 hover:bg-emerald-700',
      text: 'text-emerald-800 dark:text-emerald-200',
    },
  }[colorScheme];

  // Vibração ao confirmar
  const triggerHaptic = useCallback((duration = 50) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch {
        // ignore
      }
    }
  }, []);

  const handleDragStart = (clientX: number) => {
    if (disabled || isLoading || isConfirmed) return;
    setIsDragging(true);
    startXRef.current = clientX;
  };

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging || disabled || isLoading || isConfirmed || !trackRef.current) return;
      const trackRect = trackRef.current.getBoundingClientRect();
      const maxDistance = trackRect.width - 48; // 48px thumb width
      if (maxDistance <= 0) return;

      const deltaX = clientX - startXRef.current;
      const newPos = Math.max(0, Math.min(1, deltaX / maxDistance));
      setSliderPosition(newPos);
    },
    [isDragging, disabled, isLoading, isConfirmed]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging || disabled || isLoading || isConfirmed) return;
    setIsDragging(false);

    // Se arrastou mais de 80%, confirma!
    if (sliderPosition >= 0.8) {
      setSliderPosition(1);
      triggerHaptic(60);
      onConfirm();
    } else {
      // Retorno suave para a posição inicial
      setSliderPosition(0);
    }
  }, [isDragging, disabled, isLoading, isConfirmed, sliderPosition, triggerHaptic, onConfirm]);

  // Touch Listeners
  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse Listeners
  const onMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleDragMove(e.clientX);
      }
    };

    const onMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Reset se disabled ou reset
  useEffect(() => {
    if (!isLoading && !isConfirmed) {
      setSliderPosition(0);
    }
  }, [isLoading, isConfirmed]);

  const progressPercent = sliderPosition * 100;
  const isDone = isConfirmed || sliderPosition >= 0.99 || isLoading;

  return (
    <div
      ref={trackRef}
      className={cn(
        'relative select-none h-13 w-full rounded-2xl border-2 p-1 flex items-center overflow-hidden transition-colors shadow-inner',
        colors.bgTrack,
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
    >
      {/* Fill Progress */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 rounded-2xl transition-all duration-75',
          colors.fill
        )}
        style={{ width: `${Math.max(progressPercent, isDone ? 100 : 8)}%` }}
      />

      {/* Label centralizada com fade conforme o arraste */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center pointer-events-none font-bold text-xs tracking-wide transition-opacity duration-150 pl-8 pr-2',
          colors.text
        )}
        style={{ opacity: Math.max(0, 1 - sliderPosition * 1.5) }}
      >
        <span className="flex items-center gap-1">
          {label}
          <ChevronsRight className="w-3.5 h-3.5 opacity-70 animate-bounce-x" />
        </span>
      </div>

      {/* Label de Carregamento / Sucesso */}
      {(isLoading || isConfirmed) && (
        <div className="absolute inset-0 flex items-center justify-center font-extrabold text-xs text-white z-20">
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {loadingLabel}
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              {confirmedLabel}
            </span>
          )}
        </div>
      )}

      {/* Draggable Thumb Button */}
      <div
        ref={thumbRef}
        className={cn(
          'relative z-10 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-md cursor-grab active:cursor-grabbing transition-transform duration-75 select-none',
          colors.thumb,
          isDragging && 'scale-105 shadow-lg'
        )}
        style={{
          transform: `translateX(${sliderPosition * ((trackRef.current?.getBoundingClientRect().width || 280) - 48)}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isDone ? (
          <Check className="w-4 h-4" />
        ) : (
          <ChevronsRight className="w-4 h-4 transition-transform" />
        )}
      </div>
    </div>
  );
}
