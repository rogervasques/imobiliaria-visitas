'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface EasyMobLogoProps {
  variant?: 'vertical' | 'horizontal' | 'icon' | 'watermark' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  subtitle?: string;
}

export function EasyMobLogo({
  variant = 'horizontal',
  size = 'md',
  className,
  subtitle,
}: EasyMobLogoProps) {
  const sizeMap = {
    xs: { icon: 'w-4 h-4', title: 'text-xs', sub: 'text-[9px]' },
    sm: { icon: 'w-6 h-6', title: 'text-sm', sub: 'text-[10px]' },
    md: { icon: 'w-8 h-8', title: 'text-lg', sub: 'text-xs' },
    lg: { icon: 'w-12 h-12', title: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'w-16 h-16', title: 'text-3xl', sub: 'text-sm' },
    '2xl': { icon: 'w-20 h-20', title: 'text-4xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Ícone Vetorial SVG Oficial EasyMob (100% transparente, sem fundo branco)
  const HouseShieldIcon = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none drop-shadow-md', className)}
    >
      {/* Contorno da Casa com Chaminé e Cauda de Balão de Chat */}
      <path
        d="M 67 18 L 67 28 L 50 14 L 18 40 L 18 72 C 18 78 22 82 28 82 L 46 82 C 48 89 53 97 64 97 C 59 92 58 87 58 82 L 72 82 C 78 82 82 78 82 72 L 82 40 L 50 14 L 67 28 Z"
        stroke="#14b8a6"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Escudo Interno Verde Esmeralda */}
      <path
        d="M 50 36 C 50 36 38 41 38 48 C 38 60 50 67 50 67 C 50 67 62 60 62 48 C 62 41 50 36 50 36 Z"
        fill="#10b981"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Detalhe de Brilho no Escudo */}
      <path
        d="M 50 38 L 50 64 C 50 64 59 58 59 48 C 59 42 50 38 50 38 Z"
        fill="#34d399"
      />
    </svg>
  );

  // Variante: Apenas Marca d'água 'by EasyMob'
  if (variant === 'watermark') {
    return (
      <div className={cn('inline-flex items-center gap-1.5 select-none', className)}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          by
        </span>
        <HouseShieldIcon className="w-3.5 h-3.5" />
        <span className="font-extrabold tracking-tight text-xs">
          <span className="text-teal-500 dark:text-teal-400">Easy</span>
          <span className="text-emerald-500 dark:text-emerald-400">Mob</span>
        </span>
      </div>
    );
  }

  // Variante: Badge de Cabeçalho
  if (variant === 'badge') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 dark:bg-slate-800/80 border border-slate-700/60 backdrop-blur-md select-none shadow-sm',
          className
        )}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          BY
        </span>
        <HouseShieldIcon className="w-4 h-4" />
        <span className="font-black text-xs tracking-tight">
          <span className="text-teal-400">Easy</span>
          <span className="text-emerald-400">Mob</span>
        </span>
      </div>
    );
  }

  // Variante: Apenas Ícone
  if (variant === 'icon') {
    return <HouseShieldIcon className={cn(currentSize.icon, className)} />;
  }

  // Variante: Vertical (Ícone em cima, texto em baixo - ideal para login)
  if (variant === 'vertical') {
    return (
      <div className={cn('flex flex-col items-center text-center select-none space-y-2.5', className)}>
        <HouseShieldIcon className={cn(currentSize.icon, 'transition-transform hover:scale-105 duration-200')} />
        <div>
          <div className={cn('font-black tracking-tight leading-none', currentSize.title)}>
            <span className="text-teal-400">Easy</span>
            <span className="text-emerald-400">Mob</span>
          </div>
          {subtitle && (
            <p className={cn('font-medium text-slate-300 mt-1.5', currentSize.sub)}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Variante Padrão: Horizontal (Ícone ao lado do texto)
  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <HouseShieldIcon className={currentSize.icon} />
      <div className="min-w-0">
        <div className={cn('font-black tracking-tight leading-none', currentSize.title)}>
          <span className="text-teal-500 dark:text-teal-400">Easy</span>
          <span className="text-emerald-500 dark:text-emerald-400">Mob</span>
        </div>
        {subtitle && (
          <p className={cn('font-medium text-slate-400 mt-1 truncate', currentSize.sub)}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
