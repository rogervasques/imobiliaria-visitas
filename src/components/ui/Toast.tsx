'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function Toast() {
  const { toastMessage, clearToast } = useData();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100',
    error: 'border-rose-500/40 bg-rose-950/90 text-rose-100',
    info: 'border-sky-500/40 bg-slate-900/90 text-slate-100',
  };

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl backdrop-blur-md border ${borderColors[toastMessage.type]}`}
      >
        {icons[toastMessage.type]}
        <div className="flex-1 text-xs sm:text-sm font-medium leading-tight pt-0.5">
          {toastMessage.text}
        </div>
        <button
          onClick={clearToast}
          className="text-white/60 hover:text-white p-0.5 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
