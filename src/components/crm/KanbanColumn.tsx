'use client';

import React, { useState } from 'react';
import { Cliente, EtapaCRM } from '@/types';
import { CrmLeadCard } from './CrmLeadCard';
import { LucideIcon, Plus, Sparkles, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  etapa: EtapaCRM;
  titulo: string;
  descricao: string;
  icon: LucideIcon;
  accentColor: {
    bg: string;
    text: string;
    border: string;
    badge: string;
    dot: string;
  };
  leads: Cliente[];
  draggingLeadId: string | null;
  onDropLead: (leadId: string, targetEtapa: EtapaCRM) => void;
  onClickDetails: (lead: Cliente) => void;
  onAgendarVisita: (lead: Cliente) => void;
  onPrimeiroContato?: (lead: Cliente) => void;
  onMoverEtapa: (leadId: string, novaEtapa: EtapaCRM) => void;
  onExcluirLead?: (lead: Cliente) => void;
  onAddNewLead?: (initialEtapa: EtapaCRM) => void;
}

export function KanbanColumn({
  etapa,
  titulo,
  descricao,
  icon: Icon,
  accentColor,
  leads,
  draggingLeadId,
  onDropLead,
  onClickDetails,
  onAgendarVisita,
  onPrimeiroContato,
  onMoverEtapa,
  onExcluirLead,
  onAddNewLead,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Evita falsos disparos ao passar por elementos filhos
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      onDropLead(leadId, etapa);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col flex-1 min-w-[280px] max-w-[320px] lg:min-w-[295px] lg:max-w-[335px] bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl p-3 sm:p-3.5 border transition-all duration-200 select-none shrink-0',
        isDragOver
          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30 shadow-lg'
          : 'border-slate-200/80 dark:border-slate-800 shadow-xs'
      )}
    >
      {/* ─── CABEÇALHO DA COLUNA ─── */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs', accentColor.bg, accentColor.text)}>
            <Icon className="w-4 h-4 stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xs sm:text-[13px] text-slate-900 dark:text-slate-100 truncate">
                {titulo}
              </h3>
              <span className={cn('text-[11px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-2xs', accentColor.badge)}>
                {leads.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
              {descricao}
            </p>
          </div>
        </div>

        {onAddNewLead && (
          <button
            type="button"
            onClick={() => onAddNewLead(etapa)}
            title={`Adicionar lead em ${titulo}`}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ─── CONTAINER DE CARDS (ROLAGEM VERTICAL COM DRAG & DROP) ─── */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-270px)] min-h-[160px] py-3 space-y-2.5 pr-0.5 scrollbar-thin">
        {leads.length === 0 ? (
          <div
            className={cn(
              'h-32 flex flex-col items-center justify-center p-4 text-center rounded-2xl border-2 border-dashed transition-colors',
              isDragOver
                ? 'border-emerald-500 bg-emerald-100/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-300/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-white/40 dark:bg-slate-900/30'
            )}
          >
            <p className="text-xs font-semibold">Nenhum lead nesta etapa</p>
            <p className="text-[10px] mt-1 text-slate-400">
              {isDragOver ? 'Solte o card aqui para mover' : 'Arraste um lead ou clique em +'}
            </p>
          </div>
        ) : (
          leads.map((lead) => (
            <CrmLeadCard
              key={lead.id}
              lead={lead}
              etapaAtual={etapa}
              isDragging={draggingLeadId === lead.id}
              onClickDetails={onClickDetails}
              onAgendarVisita={onAgendarVisita}
              onPrimeiroContato={onPrimeiroContato}
              onMoverEtapa={onMoverEtapa}
              onExcluirLead={onExcluirLead}
            />
          ))
        )}

        {/* Drop target ghost ao arrastar */}
        {isDragOver && (
          <div className="h-16 rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 flex items-center justify-center animate-pulse">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Mover para {titulo}
            </span>
          </div>
        )}
      </div>

      {/* ─── RODAPÉ DA COLUNA: Adicionar Lead Rápido ─── */}
      {onAddNewLead && (
        <button
          type="button"
          onClick={() => onAddNewLead(etapa)}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Lead nesta etapa</span>
        </button>
      )}
    </div>
  );
}
