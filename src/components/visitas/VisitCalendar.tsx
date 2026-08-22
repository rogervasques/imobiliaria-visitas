'use client';

import React, { useState } from 'react';
import { Visita } from '@/types';
import { VisitCard } from './VisitCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

interface VisitCalendarProps {
  visitas: Visita[];
}

export function VisitCalendar({ visitas }: VisitCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const prevDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() - 1);
    setSelectedDate(next);
  };

  const nextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const setToday = () => {
    setSelectedDate(new Date());
  };

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(
    selectedDate.getDate()
  ).padStart(2, '0')}`;

  const visitasDoDia = visitas.filter((v) => {
    const vDate = new Date(v.data_hora_visita);
    const vStr = `${vDate.getFullYear()}-${String(vDate.getMonth() + 1).padStart(2, '0')}-${String(
      vDate.getDate()
    ).padStart(2, '0')}`;
    return vStr === selectedDateStr;
  });

  // Ordena por horário
  const visitasOrdenadas = [...visitasDoDia].sort(
    (a, b) => new Date(a.data_hora_visita).getTime() - new Date(b.data_hora_visita).getTime()
  );

  const formattedSelected = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(selectedDate);

  const capitalFormatted = formattedSelected.charAt(0).toUpperCase() + formattedSelected.slice(1);

  return (
    <div className="space-y-4">
      {/* Controles de Navegação de Data */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={setToday}>
              Hoje
            </Button>
            <div className="flex items-center">
              <button
                onClick={prevDay}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextDay}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-500" />
              <span>{capitalFormatted}</span>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
            {visitasOrdenadas.length} visita{visitasOrdenadas.length === 1 ? '' : 's'} agendada{visitasOrdenadas.length === 1 ? '' : 's'}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Visitas do Dia Selecionado */}
      {visitasOrdenadas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              Nenhuma visita agendada para este dia
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Use o botão de agendamento rápido para marcar uma nova visita e disparar as confirmações pelo WhatsApp.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visitasOrdenadas.map((visita) => (
            <VisitCard key={visita.id} visita={visita} />
          ))}
        </div>
      )}
    </div>
  );
}
