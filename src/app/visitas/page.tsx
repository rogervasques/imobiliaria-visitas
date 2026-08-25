'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { VisitCard } from '@/components/visitas/VisitCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ListOrdered, Search, Filter, Calendar, Plus } from 'lucide-react';
import { NovaVisitaModal } from '@/components/visitas/NovaVisitaModal';

export default function VisitasPage() {
  const { visitas } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [dateFilter, setDateFilter] = useState('todas');
  const [isNovaVisitaOpen, setIsNovaVisitaOpen] = useState(false);

  const agora = new Date();
  const hojeStr = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(
    agora.getDate()
  ).padStart(2, '0')}`;

  const amanha = new Date(agora);
  amanha.setDate(amanha.getDate() + 1);
  const amanhaStr = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(
    amanha.getDate()
  ).padStart(2, '0')}`;

  const filteredVisitas = visitas.filter((v) => {
    // 1. Busca por texto (imóvel ou cliente)
    const matchSearch =
      search === '' ||
      v.imovel?.titulo.toLowerCase().includes(search.toLowerCase()) ||
      v.imovel?.bairro.toLowerCase().includes(search.toLowerCase()) ||
      v.cliente?.nome.toLowerCase().includes(search.toLowerCase()) ||
      v.cliente?.telefone.includes(search);

    // 2. Filtro por status
    const matchStatus = statusFilter === 'todas' || v.status === statusFilter;

    // 3. Filtro por data
    const vDate = new Date(v.data_hora_visita);
    const vStr = `${vDate.getFullYear()}-${String(vDate.getMonth() + 1).padStart(2, '0')}-${String(
      vDate.getDate()
    ).padStart(2, '0')}`;

    let matchDate = true;
    if (dateFilter === 'hoje') {
      matchDate = vStr === hojeStr;
    } else if (dateFilter === 'amanha') {
      matchDate = vStr === amanhaStr;
    } else if (dateFilter === 'futuras') {
      matchDate = new Date(v.data_hora_visita).getTime() >= agora.getTime();
    }

    return matchSearch && matchStatus && matchDate;
  });

  // Ordenação decrescente por data
  const visitasOrdenadas = [...filteredVisitas].sort(
    (a, b) => new Date(a.data_hora_visita).getTime() - new Date(b.data_hora_visita).getTime()
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Topo: Título e Botão Nova Visita */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-emerald-500" />
            Todas as Visitas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden md:block">
            Gerenciamento geral de agendamentos, confirmações e histórico.
          </p>
        </div>

        <Button onClick={() => setIsNovaVisitaOpen(true)} variant="primary" size="sm" className="shadow-md">
          <Plus className="w-4 h-4 mr-1.5" />
          Nova Visita
        </Button>
      </div>

      {/* Barra de Busca e Filtros */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1">
              <Input
                placeholder="Buscar por cliente, imóvel, bairro ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Filtros de Data */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Data:</span>
              {[
                { id: 'todas', label: 'Todas' },
                { id: 'hoje', label: 'Hoje' },
                { id: 'amanha', label: 'Amanhã' },
                { id: 'futuras', label: 'Próximas' },
              ].map((df) => (
                <button
                  key={df.id}
                  onClick={() => setDateFilter(df.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    dateFilter === df.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {df.label}
                </button>
              ))}
            </div>

            {/* Filtros de Status */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
              {[
                { id: 'todas', label: 'Todos' },
                { id: 'agendada', label: 'Agendadas' },
                { id: 'confirmada', label: 'Confirmadas' },
                { id: 'cancelada', label: 'Canceladas' },
              ].map((sf) => (
                <button
                  key={sf.id}
                  onClick={() => setStatusFilter(sf.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    statusFilter === sf.id
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {sf.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Visitas */}
      {visitasOrdenadas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              Nenhuma visita encontrada com os filtros selecionados
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tente limpar os filtros de busca ou agende uma nova visita.
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

      {/* Modal de Nova Visita */}
      <NovaVisitaModal
        isOpen={isNovaVisitaOpen}
        onClose={() => setIsNovaVisitaOpen(false)}
      />
    </div>
  );
}
