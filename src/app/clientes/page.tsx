'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Cliente, Imovel, Visita } from '@/types';
import { ClienteCard } from '@/components/clientes/ClienteCard';
import { NovoClienteModal } from '@/components/clientes/NovoClienteModal';
import { ClienteDetalhesModal } from '@/components/clientes/ClienteDetalhesModal';
import { ImoveisCompativeisModal } from '@/components/clientes/ImoveisCompativeisModal';
import { NovaVisitaModal } from '@/components/visitas/NovaVisitaModal';
import { VisitaDetalhesModal } from '@/components/visitas/VisitaDetalhesModal';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Users, Search, Plus, Filter, Key, UserCheck, Sparkles } from 'lucide-react';

export default function ClientesPage() {
  const { clientes, proprietarios, imoveis } = useData();
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'compradores' | 'proprietarios'>('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [clienteParaVisita, setClienteParaVisita] = useState<Cliente | null>(null);
  const [imovelParaVisita, setImovelParaVisita] = useState<Imovel | null>(null);
  const [visitaDetalhes, setVisitaDetalhes] = useState<Visita | null>(null);
  const [isNovaVisitaOpen, setIsNovaVisitaOpen] = useState(false);
  const [matchesModalData, setMatchesModalData] = useState<{ cliente: Cliente; matches: Imovel[] } | null>(null);

  // Lista consolidada de contatos respeitando o tipo selecionado
  const baseClientes = useMemo(() => {
    if (tipoFiltro === 'compradores') {
      return clientes.filter((c) => c.tipo_cliente !== 'proprietario');
    }
    if (tipoFiltro === 'proprietarios') {
      // Clientes marcados como proprietários
      const clientesProprietarios = clientes.filter((c) => c.tipo_cliente === 'proprietario');
      if (clientesProprietarios.length > 0) return clientesProprietarios;
      
      // Se não houver clientes com essa flag, mapeia da base de proprietários para visualização unificada
      return proprietarios.map((p) => ({
        id: p.id,
        nome: p.nome,
        telefone: p.telefone,
        email: p.email,
        tipo_cliente: 'proprietario' as const,
        status: 'ativo' as const,
        perfil_interesse: p.imoveis_count ? `Proprietário de ${p.imoveis_count} imóvel(is)` : 'Proprietário de Imóvel',
        tempo_parada_texto: 'Proprietário ativo',
        corretor_responsavel_nome: 'Roger Vasques',
        criado_em: p.criado_em,
      }));
    }
    return clientes;
  }, [clientes, proprietarios, tipoFiltro]);

  const filteredClientes = useMemo(() => {
    return baseClientes
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
  }, [baseClientes, search, statusFilter]);

  const countCompradores = useMemo(() => clientes.filter((c) => c.tipo_cliente !== 'proprietario').length, [clientes]);
  const countProprietarios = useMemo(() => {
    const fromClientes = clientes.filter((c) => c.tipo_cliente === 'proprietario').length;
    return fromClientes > 0 ? fromClientes : proprietarios.length;
  }, [clientes, proprietarios]);

  const handleAgendarVisitaCliente = (cliente: Cliente, imovel?: Imovel) => {
    setClienteParaVisita(cliente);
    setImovelParaVisita(imovel || null);
    setClienteSelecionado(null);
    setMatchesModalData(null);
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
            Base inteligente de contatos, histórico de visitas e compatibilidade de imóveis.
          </p>
        </div>

        <Button onClick={() => setIsNovoClienteOpen(true)} variant="primary" size="sm" className="shadow-md">
          <Plus className="w-4 h-4 mr-1.5" />
          Novo Cliente
        </Button>
      </div>

      {/* ─── 1. Abas Primárias de Tipo de Contato ─── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setTipoFiltro('todos')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            tipoFiltro === 'todos'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md scale-[1.02]'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Todos</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${tipoFiltro === 'todos' ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            {clientes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTipoFiltro('compradores')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            tipoFiltro === 'compradores'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Compradores / Inquilinos</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${tipoFiltro === 'compradores' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            {countCompradores}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTipoFiltro('proprietarios')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            tipoFiltro === 'proprietarios'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Proprietários</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${tipoFiltro === 'proprietarios' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            {countProprietarios}
          </span>
        </button>
      </div>

      {/* Busca e Filtros de Status */}
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
                type="button"
                onClick={() => setStatusFilter(sf.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === sf.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
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
              Nenhum contato encontrado
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Cadastre um novo contato ou ajuste os filtros para visualizar a listagem.
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
              onOpenMatches={(c, matches) => setMatchesModalData({ cliente: c, matches })}
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
        onAgendarVisita={(c) => handleAgendarVisitaCliente(c)}
        onSelectVisita={(visita) => {
          setClienteSelecionado(null);
          setVisitaDetalhes(visita);
        }}
      />

      {/* Modal de Imóveis Compatíveis (Match Inteligente) */}
      <ImoveisCompativeisModal
        cliente={matchesModalData?.cliente || null}
        imoveis={matchesModalData?.matches || []}
        isOpen={!!matchesModalData}
        onClose={() => setMatchesModalData(null)}
        onAgendarVisita={(c, imovel) => handleAgendarVisitaCliente(c, imovel)}
      />

      {/* Modal de Detalhes da Visita (Aberto ao clicar no card de visita) */}
      <VisitaDetalhesModal
        visita={visitaDetalhes}
        isOpen={!!visitaDetalhes}
        onClose={() => setVisitaDetalhes(null)}
      />

      {/* Modal de Nova Visita com Cliente e Imóvel Pré-selecionados */}
      <NovaVisitaModal
        isOpen={isNovaVisitaOpen}
        onClose={() => {
          setIsNovaVisitaOpen(false);
          setClienteParaVisita(null);
          setImovelParaVisita(null);
        }}
        clientePreSelecionado={clienteParaVisita || undefined}
        imovelPreSelecionado={imovelParaVisita || undefined}
      />
    </div>
  );
}
