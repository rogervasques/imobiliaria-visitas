'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Cliente, Visita } from '@/types';
import { ClienteCard } from '@/components/clientes/ClienteCard';
import { NovoClienteModal } from '@/components/clientes/NovoClienteModal';
import { ClienteDetalhesModal } from '@/components/clientes/ClienteDetalhesModal';
import { NovaVisitaModal } from '@/components/visitas/NovaVisitaModal';
import { VisitaDetalhesModal } from '@/components/visitas/VisitaDetalhesModal';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Users, Search, Plus, Filter } from 'lucide-react';

export default function ClientesPage() {
  const { clientes } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [clienteParaVisita, setClienteParaVisita] = useState<Cliente | null>(null);
  const [visitaDetalhes, setVisitaDetalhes] = useState<Visita | null>(null);
  const [isNovaVisitaOpen, setIsNovaVisitaOpen] = useState(false);

  const filteredClientes = clientes
    .filter((cl) => {
      const matchSearch =
        search === '' ||
        cl.nome.toLowerCase().includes(search.toLowerCase()) ||
        cl.telefone.includes(search) ||
        (cl.email && cl.email.toLowerCase().includes(search.toLowerCase())) ||
        (cl.perfil_interesse && cl.perfil_interesse.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'todos' || cl.status === statusFilter;

      return matchSearch && matchStatus;
    })
    .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' }));

  const handleAgendarVisitaCliente = (cliente: Cliente) => {
    setClienteParaVisita(cliente);
    setClienteSelecionado(null);
    setIsNovaVisitaOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" />
            Clientes &amp; Leads
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden md:block">
            Base de contatos, histórico de visitas e perfil de interesse dos clientes visitantes.
          </p>
        </div>

        <Button onClick={() => setIsNovoClienteOpen(true)} variant="primary" size="sm" className="shadow-md">
          <Plus className="w-4 h-4 mr-1.5" />
          Novo Cliente
        </Button>
      </div>

      {/* Busca e Filtros */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Input
            placeholder="Buscar por nome, telefone, e-mail ou perfil..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'ativo', label: 'Ativos' },
              { id: 'negociando', label: 'Em Negociação' },
              { id: 'fechado', label: 'Fechados' },
            ].map((sf) => (
              <button
                key={sf.id}
                onClick={() => setStatusFilter(sf.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === sf.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid de Clientes */}
      {filteredClientes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              Nenhum cliente encontrado
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Cadastre um novo cliente para agendar visitas e disparar mensagens automáticas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClientes.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              onClick={(c) => setClienteSelecionado(c)}
            />
          ))}
        </div>
      )}

      {/* Modal de Novo Cliente */}
      <NovoClienteModal
        isOpen={isNovoClienteOpen}
        onClose={() => setIsNovoClienteOpen(false)}
      />

      {/* Modal de Detalhes do Cliente com Histórico de Visitas e Ações */}
      <ClienteDetalhesModal
        cliente={clienteSelecionado}
        isOpen={!!clienteSelecionado}
        onClose={() => setClienteSelecionado(null)}
        onAgendarVisita={handleAgendarVisitaCliente}
        onSelectVisita={(visita) => {
          setClienteSelecionado(null);
          setVisitaDetalhes(visita);
        }}
      />

      {/* Modal de Detalhes da Visita (Aberto ao clicar no card de visita) */}
      <VisitaDetalhesModal
        visita={visitaDetalhes}
        isOpen={!!visitaDetalhes}
        onClose={() => setVisitaDetalhes(null)}
      />

      {/* Modal de Nova Visita com Cliente Pré-selecionado */}
      <NovaVisitaModal
        isOpen={isNovaVisitaOpen}
        onClose={() => {
          setIsNovaVisitaOpen(false);
          setClienteParaVisita(null);
        }}
        clientePreSelecionado={clienteParaVisita || undefined}
      />
    </div>
  );
}
