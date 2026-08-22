'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Visita, StatusVisita } from '@/types';
import { EditarVisitaModal } from '@/components/visitas/EditarVisitaModal';
import { VisitaDetalhesModal } from '@/components/visitas/VisitaDetalhesModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  MessageCircle, MoreVertical, CheckCircle2, XCircle,
  RotateCcw, Pencil, Trash2, AlertTriangle, MapPin, Phone,
  Building2, CalendarDays, Timer, ChevronLeft, ChevronRight,
  Clock, CalendarCheck2, Hourglass, Ban, User,
} from 'lucide-react';
import {
  formatPhone, formatTime, getWhatsAppDirectLink,
} from '@/lib/utils';
import { WhatsAppStatusBadge } from '@/components/layout/WhatsAppStatusBadge';

// ─── Constantes de Status ────────────────────────────────────────────────────

const STATUS_CFG: Record<StatusVisita, { label: string; dot: string; badge: string; line: string }> = {
  confirmada: {
    label: 'Confirmada',
    dot: 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    line: 'border-l-emerald-400',
  },
  agendada: {
    label: 'Agendada',
    dot: 'bg-amber-400 ring-4 ring-amber-100 dark:ring-amber-950',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    line: 'border-l-amber-400',
  },
  cancelada: {
    label: 'Cancelada',
    dot: 'bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    line: 'border-l-rose-400',
  },
  reagendada: {
    label: 'Reagendada',
    dot: 'bg-slate-400 ring-4 ring-slate-100 dark:ring-slate-800',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    line: 'border-l-slate-400',
  },
};

const pad = (n: number) => String(n).padStart(2, '0');

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ─── Hook: Próxima Visita ────────────────────────────────────────────────────

function useProximaVisita(visitas: Visita[]) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Procura EXCLUSIVAMENTE a próxima visita futura não cancelada (horário maior que agora)
  const proxima = visitas
    .filter(v => new Date(v.data_hora_visita).getTime() > now.getTime() && v.status !== 'cancelada')
    .sort((a, b) => new Date(a.data_hora_visita).getTime() - new Date(b.data_hora_visita).getTime())[0];

  if (!proxima) {
    return { proxima: null, horas: 0, minutos: 0, segundos: 0, dias: 0, diffMs: 0 };
  }

  const targetTime = new Date(proxima.data_hora_visita).getTime();
  const diffMs = Math.max(0, targetTime - now.getTime());
  const totalSeg = Math.floor(diffMs / 1000);
  const dias = Math.floor(totalSeg / 86400);
  const horas = Math.floor((totalSeg % 86400) / 3600);
  const minutos = Math.floor((totalSeg % 3600) / 60);
  const segundos = totalSeg % 60;

  return {
    proxima,
    diffMs,
    dias,
    horas,
    minutos,
    segundos,
  };
}

// ─── Mini Calendário ─────────────────────────────────────────────────────────

function MiniCalendario({
  visitas,
  selectedDate,
  onSelectDate,
}: {
  visitas: Visita[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
}) {
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const hoje = toDateStr(new Date());

  // Mapa: dateStr → status[]
  const visitasPorDia = useMemo(() => {
    const m: Record<string, StatusVisita[]> = {};
    visitas.forEach(v => {
      const ds = toDateStr(new Date(v.data_hora_visita));
      if (!m[ds]) m[ds] = [];
      m[ds].push(v.status);
    });
    return m;
  }, [visitas]);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0=Dom
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Dots de status únicos por dia
  const dotColors: Record<StatusVisita, string> = {
    confirmada: 'bg-emerald-500',
    agendada: 'bg-amber-400',
    cancelada: 'bg-rose-500',
    reagendada: 'bg-slate-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header do calendário */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <button type="button" onClick={prevMonth} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">{monthName}</span>
        <button type="button" onClick={nextMonth} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3">
        {/* Cabeçalho Dias da Semana */}
        <div className="grid grid-cols-7 mb-1">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* Grade de Dias */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const ds = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
            const isSelected = ds === selectedDate;
            const isHoje = ds === hoje;
            const statusList = visitasPorDia[ds] || [];
            const uniqueStatus = [...new Set(statusList)] as StatusVisita[];

            return (
              <button
                key={ds}
                type="button"
                onClick={() => onSelectDate(ds)}
                className={`
                  relative flex flex-col items-center py-1.5 rounded-xl transition-all text-xs font-semibold
                  ${isSelected
                    ? 'bg-emerald-600 text-white shadow-md'
                    : isHoje
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-black'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                <span>{day}</span>
                {/* Status Dots */}
                {uniqueStatus.length > 0 && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {uniqueStatus.slice(0, 3).map((s) => (
                      <div
                        key={s}
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : dotColors[s]}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="px-3 pb-3 flex flex-wrap gap-2">
        {[
          { color: 'bg-emerald-500', label: 'Confirmada' },
          { color: 'bg-amber-400', label: 'Agendada' },
          { color: 'bg-rose-500', label: 'Cancelada' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
            <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Widget Próxima Visita ────────────────────────────────────────────────────

function ProximaVisitaWidget({ visitas }: { visitas: Visita[] }) {
  const { proxima, dias, horas, minutos, segundos } = useProximaVisita(visitas);

  const countdownText = dias > 0
    ? `${dias}d ${pad(horas)}h`
    : horas > 0
    ? `${pad(horas)}h ${pad(minutos)}min`
    : `${pad(minutos)}min ${pad(segundos)}s`;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Próxima visita
        </span>
      </div>

      <div className="p-4 space-y-3">
        {proxima ? (
          <>
            {/* Countdown em destaque verde */}
            <div className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-0.5">
                  Tempo Restante
                </p>
                <p className="text-2xl font-black tabular-nums leading-none">
                  {countdownText}
                </p>
              </div>
              <Timer className="w-8 h-8 text-emerald-500/30" />
            </div>

            {/* Imóvel e horário */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  {proxima.imovel?.titulo || 'Imóvel'} às {formatTime(proxima.data_hora_visita)}
                </p>
              </div>

              {proxima.cliente?.nome && (
                <div className="pl-6 text-xs text-slate-500 dark:text-slate-400">
                  Cliente: <span className="font-semibold text-slate-700 dark:text-slate-300">{proxima.cliente.nome}</span>
                </div>
              )}

              {/* Corretor na Próxima Visita */}
              <div className="pl-6 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Corretor: <strong className="font-semibold text-slate-700 dark:text-slate-300">{proxima.corretor_nome || proxima.created_by_user_nome || 'Roger Vasques Berchembrock'}</strong></span>
              </div>
            </div>
          </>
        ) : (
          <div className="py-4 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Sem visitas futuras
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Não há compromissos pendentes com horário posterior ao atual.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Timeline Card (clicável) ────────────────────────────────────────────────

function TimelineCard({
  visita,
  onOpenDetalhes,
}: {
  visita: Visita;
  onOpenDetalhes: (v: Visita) => void;
}) {
  const { atualizarStatusVisita, removerVisita, showToast } = useData();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const cfg = STATUS_CFG[visita.status] ?? STATUS_CFG.agendada;

  const handleStatus = async (s: StatusVisita) => {
    setShowMenu(false);
    await atualizarStatusVisita(visita.id, s);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removerVisita(visita.id);
      setIsDeleteOpen(false);
    } catch {
      showToast('Erro ao excluir. Tente novamente.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const waCliente = visita.cliente?.telefone
    ? getWhatsAppDirectLink(visita.cliente.telefone, `Olá, ${visita.cliente.nome}! Sobre a visita ao imóvel "${visita.imovel?.titulo || ''}".`)
    : '#';
  const waProprietario = visita.imovel?.proprietario_telefone
    ? getWhatsAppDirectLink(visita.imovel.proprietario_telefone, `Olá, ${visita.imovel.proprietario_nome}! Sobre a visita ao "${visita.imovel?.titulo || ''}".`)
    : '#';

  return (
    <>
      {/* Card clicável */}
      <div
        className={`group bg-white dark:bg-slate-900 rounded-2xl border border-l-4 ${cfg.line} border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-400/40 transition-all duration-300 cursor-pointer w-full overflow-hidden`}
        onClick={() => onOpenDetalhes(visita)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onOpenDetalhes(visita)}
        aria-label={`Ver detalhes da visita ao ${visita.imovel?.titulo}`}
      >
        <div className="p-3 sm:p-4">
          {/* Header: thumb + info + badge */}
          <div className="flex items-start gap-3">
            <div
              className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
              onClick={e => e.stopPropagation()}
            >
              {visita.imovel?.imagem_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={visita.imovel.imagem_url} alt={visita.imovel.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400"><Building2 className="w-5 h-5" /></div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 justify-between">
                <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                    {visita.imovel?.titulo || 'Imóvel sem título'}
                  </h3>
                  {((visita.imoveis && visita.imoveis.length > 1) || (visita.imoveis_ids && visita.imoveis_ids.length > 1)) && (
                    <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Roteiro ({visita.imoveis?.length || visita.imoveis_ids?.length} imóveis)
                    </span>
                  )}
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">
                  {visita.imovel ? `${visita.imovel.endereco}, ${visita.imovel.numero || 'S/N'} — ${visita.imovel.bairro}` : 'Local a confirmar'}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                <User className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">
                  Corretor: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{visita.corretor_nome || visita.created_by_user_nome || 'Roger Vasques Berchembrock'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Cliente e Proprietário */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs" onClick={e => e.stopPropagation()}>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Cliente</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{visita.cliente?.nome || '—'}</p>
              <p className="text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{formatPhone(visita.cliente?.telefone)}</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Proprietário</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{visita.imovel?.proprietario_nome || '—'}</p>
              <p className="text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{formatPhone(visita.imovel?.proprietario_telefone)}</p>
            </div>
          </div>

          {/* Rodapé: botões WA + menu — flex-wrap no mobile */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 flex-wrap">
              <a href={waCliente} target="_blank" rel="noopener noreferrer">
                <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors whitespace-nowrap">
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" /> WA Cliente
                </button>
              </a>
              <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 shrink-0" />
              <a href={waProprietario} target="_blank" rel="noopener noreferrer">
                <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors whitespace-nowrap">
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" /> WA Proprietário
                </button>
              </a>
            </div>

            {/* Menu ⋯ */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 bottom-8 z-30 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">Alterar Status</div>
                  <button type="button" onClick={() => handleStatus('agendada')} className="w-full text-left px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-500" /> Marcar como Agendada
                  </button>
                  <button type="button" onClick={() => handleStatus('confirmada')} className="w-full text-left px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Marcar Confirmada
                  </button>
                  <button type="button" onClick={() => handleStatus('cancelada')} className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-rose-500" /> Cancelar Visita
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button type="button" onClick={() => { setShowMenu(false); setIsEditOpen(true); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2">
                    <Pencil className="w-3.5 h-3.5 text-slate-500" /> Editar Visita
                  </button>
                  <button type="button" onClick={() => { setShowMenu(false); setIsDeleteOpen(true); }} className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Excluir Visita
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modais do card */}
      <EditarVisitaModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} visita={visita} />

      <Modal isOpen={isDeleteOpen} onClose={() => !isDeleting && setIsDeleteOpen(false)} title="Excluir Visita" subtitle="Confirmação de segurança" maxWidth="md">
        <div className="space-y-4 pt-1">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-xs flex-1 space-y-1.5">
              <p className="font-bold text-sm text-rose-900 dark:text-rose-100">Tem certeza que deseja excluir esta visita?</p>
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-rose-100 dark:border-rose-900/30 text-slate-700 dark:text-slate-300 space-y-0.5">
                <p>🏠 <strong>{visita.imovel?.titulo}</strong></p>
                <p>👤 <strong>{visita.cliente?.nome}</strong></p>
                <p>⏰ <strong>às {formatTime(visita.data_hora_visita)}</strong></p>
              </div>
              <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">Esta ação é irreversível.</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>Cancelar</Button>
            <Button type="button" variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              <Trash2 className="w-4 h-4 mr-1.5" /> Sim, Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { visitas, metrics } = useData();

  // Estado: data selecionada no calendário (default = hoje)
  const [selectedDate, setSelectedDate] = useState<string>(() => toDateStr(new Date()));
  // Estado: filtro de status (null = todas)
  const [filterStatus, setFilterStatus] = useState<StatusVisita | null>(null);
  // Estado: modal de detalhes
  const [visitaDetalhes, setVisitaDetalhes] = useState<Visita | null>(null);

  // Visitas do dia selecionado
  const visitasDoDia = useMemo(() =>
    visitas.filter(v => toDateStr(new Date(v.data_hora_visita)) === selectedDate),
    [visitas, selectedDate]
  );

  // Visitas filtradas + ordenadas por horário
  const visitasFiltradas = useMemo(() =>
    visitasDoDia
      .filter(v => filterStatus === null || v.status === filterStatus)
      .sort((a, b) => new Date(a.data_hora_visita).getTime() - new Date(b.data_hora_visita).getTime()),
    [visitasDoDia, filterStatus]
  );

  // Métricas do dia selecionado
  const metricasDia = useMemo(() => ({
    total: visitasDoDia.length,
    confirmadas: visitasDoDia.filter(v => v.status === 'confirmada').length,
    agendadas: visitasDoDia.filter(v => v.status === 'agendada').length,
    canceladas: visitasDoDia.filter(v => v.status === 'cancelada').length,
  }), [visitasDoDia]);

  // Data por extenso
  const isHoje = selectedDate === toDateStr(new Date());
  const dataLabel = isHoje
    ? (() => {
        const s = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
        return s.charAt(0).toUpperCase() + s.slice(1);
      })()
    : (() => {
        const [y, m, d] = selectedDate.split('-').map(Number);
        const s = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(y, m - 1, d));
        return s.charAt(0).toUpperCase() + s.slice(1);
      })();

  // Cards-filtro de métricas
  const metricCards = [
    { key: null, label: 'Total no Dia', value: metricasDia.total, color: 'slate', active: filterStatus === null },
    { key: 'confirmada' as StatusVisita, label: 'Confirmadas', value: metricasDia.confirmadas, color: 'emerald', active: filterStatus === 'confirmada' },
    { key: 'agendada' as StatusVisita, label: 'Aguardando', value: metricasDia.agendadas, color: 'amber', active: filterStatus === 'agendada' },
    { key: 'cancelada' as StatusVisita, label: 'Canceladas', value: metricasDia.canceladas, color: 'rose', active: filterStatus === 'cancelada' },
  ];

  return (
    <>
      <div className="space-y-5">
        {/* ── Cabeçalho ── */}
        <div className="space-y-1.5">
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Agenda de <span className="text-emerald-600 dark:text-emerald-400">Hoje</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              {dataLabel}
            </p>
          </div>

          {/* Status do WhatsApp na versão mobile (embaixo da data, versão mini/compacta) */}
          <div className="block md:hidden pt-0.5">
            <WhatsAppStatusBadge compact className="mt-0" />
          </div>
        </div>

        {/* ── Cards de Métricas como Filtros Clicáveis (Layout Compacto & Fluido) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {metricCards.map((card) => {
            // Configuração visual por cor
            const visualMap: Record<string, {
              icon: React.ReactNode;
              iconBg: string;
              iconColor: string;
              numColor: string;
              barGradient: string;
              barActiveGradient: string;
              ring: string;
            }> = {
              slate: {
                icon: <CalendarDays className="w-4 h-4" />,
                iconBg: 'bg-slate-100 dark:bg-slate-800',
                iconColor: 'text-slate-600 dark:text-slate-400',
                numColor: 'text-slate-900 dark:text-slate-100',
                barGradient: 'from-slate-300 to-slate-400',
                barActiveGradient: 'from-slate-500 via-slate-600 to-slate-700',
                ring: 'ring-slate-300 dark:ring-slate-700',
              },
              emerald: {
                icon: <CalendarCheck2 className="w-4 h-4" />,
                iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
                iconColor: 'text-emerald-600 dark:text-emerald-400',
                numColor: 'text-emerald-700 dark:text-emerald-300',
                barGradient: 'from-emerald-300 to-emerald-400',
                barActiveGradient: 'from-emerald-400 via-emerald-500 to-teal-500',
                ring: 'ring-emerald-300 dark:ring-emerald-800',
              },
              amber: {
                icon: <Hourglass className="w-4 h-4" />,
                iconBg: 'bg-amber-50 dark:bg-amber-950/60',
                iconColor: 'text-amber-600 dark:text-amber-400',
                numColor: 'text-amber-700 dark:text-amber-300',
                barGradient: 'from-amber-300 to-amber-400',
                barActiveGradient: 'from-amber-400 via-amber-500 to-orange-400',
                ring: 'ring-amber-300 dark:ring-amber-800',
              },
              rose: {
                icon: <Ban className="w-4 h-4" />,
                iconBg: 'bg-rose-50 dark:bg-rose-950/60',
                iconColor: 'text-rose-600 dark:text-rose-400',
                numColor: 'text-rose-700 dark:text-rose-400',
                barGradient: 'from-rose-300 to-rose-400',
                barActiveGradient: 'from-rose-400 via-rose-500 to-pink-500',
                ring: 'ring-rose-300 dark:ring-rose-800',
              },
            };

            const v = visualMap[card.color];

            return (
              <button
                key={String(card.key)}
                type="button"
                onClick={() => setFilterStatus(card.key)}
                className={`
                  relative flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900
                  border border-slate-200 dark:border-slate-800 text-left
                  transition-all duration-200 overflow-hidden cursor-pointer
                  hover:shadow-md hover:-translate-y-0.5
                  ${card.active ? `ring-2 ${v.ring} shadow-xs bg-slate-50/50 dark:bg-slate-800/40` : 'shadow-xs'}
                `}
              >
                {/* Ícone à esquerda */}
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${v.iconBg} ${v.iconColor}`}>
                  {v.icon}
                </div>

                {/* Número e Rótulo */}
                <div className="min-w-0 flex-1">
                  <div className={`text-base sm:text-xl font-black tabular-nums leading-tight ${v.numColor}`}>
                    {card.value}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400 truncate">
                    {card.label}
                  </div>
                </div>

                {/* Linha gradiente inferior sutil */}
                <div
                  className={`
                    absolute bottom-0 left-0 right-0 bg-gradient-to-r
                    ${card.active ? v.barActiveGradient : v.barGradient}
                    transition-all duration-300
                    ${card.active ? 'h-0.5 sm:h-1' : 'h-0.5 opacity-30'}
                  `}
                />
              </button>
            );
          })}
        </div>

        {/* ── Layout 2 Colunas ── */}
        <div className="flex flex-col lg:flex-row gap-5 items-start w-full overflow-x-hidden">

          {/* ── COLUNA PRINCIPAL: Timeline ── */}
          <div className="flex-1 min-w-0 w-full overflow-x-hidden space-y-1">
            {visitasFiltradas.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  {filterStatus ? `Nenhuma visita "${STATUS_CFG[filterStatus].label}" neste dia` : 'Nenhuma visita neste dia'}
                </h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Selecione outro dia no calendário ou ajuste os filtros acima.
                </p>
                {filterStatus && (
                  <button type="button" onClick={() => setFilterStatus(null)} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                    Ver todas as visitas
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                {/* Linha Vertical — posição relativa à coluna de horário (56px) */}
                <div className="absolute left-[39px] top-5 bottom-5 w-px bg-slate-200 dark:bg-slate-700/60" />

                <div className="space-y-4">
                  {visitasFiltradas.map((visita) => {
                    const cfg = STATUS_CFG[visita.status] ?? STATUS_CFG.agendada;
                    return (
                      <div key={visita.id} className="flex items-start min-w-0">
                        {/* Coluna de horário — compacta no mobile */}
                        <div className="flex flex-col items-center w-14 sm:w-20 shrink-0 pt-4">
                          <span className="text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums leading-none">
                            {formatTime(visita.data_hora_visita)}
                          </span>
                          <div className={`mt-2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${cfg.dot}`} />
                        </div>

                        {/* Card — min-w-0 evita overflow */}
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <TimelineCard visita={visita} onOpenDetalhes={setVisitaDetalhes} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── COLUNA LATERAL: Mini Calendário + Widget ── */}
          <div className="w-full lg:w-72 shrink-0 space-y-4">
            <MiniCalendario
              visitas={visitas}
              selectedDate={selectedDate}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setFilterStatus(null);
              }}
            />
            <ProximaVisitaWidget visitas={visitas} />
          </div>
        </div>
      </div>

      {/* ── Modal de Detalhes da Visita ── */}
      <VisitaDetalhesModal
        visita={visitaDetalhes}
        isOpen={!!visitaDetalhes}
        onClose={() => setVisitaDetalhes(null)}
      />
    </>
  );
}
