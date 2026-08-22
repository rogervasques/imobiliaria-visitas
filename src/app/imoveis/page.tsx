'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Imovel } from '@/types';
import { ImovelCard } from '@/components/imoveis/ImovelCard';
import { NovoImovelModal } from '@/components/imoveis/NovoImovelModal';
import { ImovelDetalhesModal } from '@/components/imoveis/ImovelDetalhesModal';
import { NovaVisitaModal } from '@/components/visitas/NovaVisitaModal';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Building2, Search, Plus, Filter } from 'lucide-react';

export default function ImoveisPage() {
  const { imoveis } = useData();
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [isNovoImovelOpen, setIsNovoImovelOpen] = useState(false);
  const [imovelDetalhes, setImovelDetalhes] = useState<Imovel | null>(null);
  const [isNovaVisitaOpen, setIsNovaVisitaOpen] = useState(false);

  const filteredImoveis = imoveis
    .filter((im) => {
      const matchSearch =
        search === '' ||
        im.titulo.toLowerCase().includes(search.toLowerCase()) ||
        im.bairro.toLowerCase().includes(search.toLowerCase()) ||
        im.cidade.toLowerCase().includes(search.toLowerCase()) ||
        im.proprietario_nome.toLowerCase().includes(search.toLowerCase()) ||
        (im.codigo && im.codigo.toLowerCase().includes(search.toLowerCase()));

      const matchTipo = tipoFilter === 'todos' || im.tipo === tipoFilter;

      return matchSearch && matchTipo;
    })
    .sort((a, b) => (a.titulo || '').localeCompare(b.titulo || '', 'pt-BR', { sensitivity: 'base' }));

  return (
    <div className="space-y-6">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-500" />
            Catálogo de Imóveis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Gerencie imóveis, métricas físicas, custos mensais, comodidades e chaves para as visitas.
          </p>
        </div>

        <Button onClick={() => setIsNovoImovelOpen(true)} variant="primary" size="sm" className="shadow-md">
          <Plus className="w-4 h-4 mr-1.5" />
          Novo Imóvel
        </Button>
      </div>

      {/* Busca e Filtros */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Input
            placeholder="Buscar por código, título, bairro, cidade ou proprietário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Tipo:</span>
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'apartamento', label: 'Apartamentos' },
              { id: 'casa', label: 'Casas' },
              { id: 'cobertura', label: 'Coberturas' },
              { id: 'comercial', label: 'Comerciais' },
              { id: 'terreno', label: 'Terrenos' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTipoFilter(tf.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  tipoFilter === tf.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid de Imóveis */}
      {filteredImoveis.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              Nenhum imóvel encontrado
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Adicione um imóvel para começar a agendar visitas e notificar proprietários.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredImoveis.map((imovel) => (
            <ImovelCard
              key={imovel.id}
              imovel={imovel}
              onClick={(im) => setImovelDetalhes(im)}
            />
          ))}
        </div>
      )}

      {/* Modal de Detalhes do Imóvel */}
      <ImovelDetalhesModal
        imovel={imovelDetalhes}
        isOpen={!!imovelDetalhes}
        onClose={() => setImovelDetalhes(null)}
        onAgendarVisita={() => setIsNovaVisitaOpen(true)}
      />

      {/* Modal de Novo Imóvel */}
      <NovoImovelModal
        isOpen={isNovoImovelOpen}
        onClose={() => setIsNovoImovelOpen(false)}
      />

      {/* Modal de Nova Visita */}
      <NovaVisitaModal
        isOpen={isNovaVisitaOpen}
        onClose={() => setIsNovaVisitaOpen(false)}
        imovelPreSelecionado={imovelDetalhes || undefined}
      />
    </div>
  );
}
