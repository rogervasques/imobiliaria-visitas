'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Cliente, EtapaCRM, Visita } from '@/types';
import { KanbanColumn } from '@/components/crm/KanbanColumn';
import { CrmLeadCard } from '@/components/crm/CrmLeadCard';
import { NovoLeadModal } from '@/components/crm/NovoLeadModal';
import { ClienteDetalhesModal } from '@/components/clientes/ClienteDetalhesModal';
import { NovaVisitaModal } from '@/components/visitas/NovaVisitaModal';
import { VisitaDetalhesModal } from '@/components/visitas/VisitaDetalhesModal';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Kanban,
  Search,
  Plus,
  Filter,
  Users,
  Clock,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Layers,
  PhoneCall,
  Flame,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Configuração das 5 Etapas do Funil
export const ETAPAS_CRM_CONFIG: Record<
  EtapaCRM,
  {
    titulo: string;
    descricao: string;
    icon: LucideIcon;
    accent: {
      bg: string;
      text: string;
      border: string;
      badge: string;
      dot: string;
      pillActive: string;
    };
  }
> = {
  novo: {
    titulo: 'Novos Leads',
    descricao: 'Contatos recém-captados',
    icon: Flame,
    accent: {
      bg: 'bg-sky-100 dark:bg-sky-950/80',
      text: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-200 dark:border-sky-800',
      badge: 'bg-sky-500 text-white',
      dot: 'bg-sky-500',
      pillActive: 'bg-sky-600 text-white shadow-md shadow-sky-600/30',
    },
  },
  em_atendimento: {
    titulo: 'Em Atendimento',
    descricao: 'Contato e qualificação',
    icon: PhoneCall,
    accent: {
      bg: 'bg-amber-100 dark:bg-amber-950/80',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      badge: 'bg-amber-500 text-white',
      dot: 'bg-amber-500',
      pillActive: 'bg-amber-600 text-white shadow-md shadow-amber-600/30',
    },
  },
  visita_agendada: {
    titulo: 'Visita Agendada',
    descricao: 'Roteiro na agenda',
    icon: CalendarCheck,
    accent: {
      bg: 'bg-purple-100 dark:bg-purple-950/80',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      badge: 'bg-purple-500 text-white',
      dot: 'bg-purple-500',
      pillActive: 'bg-purple-600 text-white shadow-md shadow-purple-600/30',
    },
  },
  proposta: {
    titulo: 'Proposta / Negociação',
    descricao: 'Em análise ou proposta',
    icon: TrendingUp,
    accent: {
      bg: 'bg-blue-100 dark:bg-blue-950/80',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      badge: 'bg-blue-600 text-white',
      dot: 'bg-blue-600',
      pillActive: 'bg-blue-600 text-white shadow-md shadow-blue-600/30',
    },
  },
  fechado: {
    titulo: 'Fechado',
    descricao: 'Venda / Locação concluída',
    icon: CheckCircle2,
    accent: {
      bg: 'bg-emerald-100 dark:bg-emerald-950/80',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      badge: 'bg-emerald-600 text-white',
      dot: 'bg-emerald-600',
      pillActive: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
    },
  },
};

const ETAPAS_KEYS: EtapaCRM[] = ['novo', 'em_atendimento', 'visita_agendada', 'proposta', 'fechado'];

export default function CrmPage() {
  const { clientes, moverEtapaCRM, removerCliente } = useData();

  const [search, setSearch] = useState('');
  const [origemFilter, setOrigemFilter] = useState('todos');
  const [mobileTabEtapa, setMobileTabEtapa] = useState<EtapaCRM>('novo');

  // Modais
  const [isNovoLeadOpen, setIsNovoLeadOpen] = useState(false);
  const [initialLeadEtapa, setInitialLeadEtapa] = useState<EtapaCRM>('novo');
  const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);
  const [clienteParaVisita, setClienteParaVisita] = useState<Cliente | null>(null);
  const [isNovaVisitaOpen, setIsNovaVisitaOpen] = useState(false);
  const [visitaDetalhes, setVisitaDetalhes] = useState<Visita | null>(null);

  // Drag and Drop
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);

  // Normalização e associação de cada cliente a uma etapa
  const getClienteEtapa = (c: Cliente): EtapaCRM => {
    if (c.etapa_crm) return c.etapa_crm;
    if (c.status === 'fechado') return 'fechado';
    if (c.status === 'negociando') return 'proposta';
    return 'novo';
  };

  // Filtragem de Leads
  const filteredClientes = useMemo(() => {
    return clientes.filter((c) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        q === '' ||
        c.nome.toLowerCase().includes(q) ||
        c.telefone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.perfil_interesse && c.perfil_interesse.toLowerCase().includes(q)) ||
        (c.imovel_interesse_titulo && c.imovel_interesse_titulo.toLowerCase().includes(q));

      const matchOrigem = origemFilter === 'todos' || c.origem_lead === origemFilter;

      return matchSearch && matchOrigem;
    });
  }, [clientes, search, origemFilter]);

  // Agrupamento por Etapa
  const leadsPorEtapa = useMemo(() => {
    const map: Record<EtapaCRM, Cliente[]> = {
      novo: [],
      em_atendimento: [],
      visita_agendada: [],
      proposta: [],
      fechado: [],
    };

    filteredClientes.forEach((c) => {
      const etapa = getClienteEtapa(c);
      if (map[etapa]) {
        map[etapa].push(c);
      } else {
        map.novo.push(c);
      }
    });

    return map;
  }, [filteredClientes]);

  // Métricas do Funil
  const totalLeads = clientes.length;
  const totalAtivos = clientes.filter((c) => {
    const et = getClienteEtapa(c);
    return et !== 'fechado';
  }).length;
  const totalFechados = leadsPorEtapa.fechado.length;

  const handleOpenNovoLead = (etapa: EtapaCRM = 'novo') => {
    setInitialLeadEtapa(etapa);
    setIsNovoLeadOpen(true);
  };

  const handleAgendarVisita = (lead: Cliente) => {
    setClienteParaVisita(lead);
    setIsNovaVisitaOpen(true);
  };

  const handleDropLead = (leadId: string, targetEtapa: EtapaCRM) => {
    moverEtapaCRM(leadId, targetEtapa);
    setDraggingLeadId(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ─── TOPO DA PÁGINA ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Kanban className="w-6 h-6 text-emerald-500" />
            CRM &amp; Funil de Leads
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden md:block">
            Acompanhamento visual de oportunidades, etapas de negociação e conversão de leads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenNovoLead('novo')}
            variant="primary"
            size="sm"
            className="shadow-md shadow-emerald-600/20 font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* ─── MÉTRICAS RESUMIDAS DO CRM ─── */}
      {/* Mobile: Pílulas Compactas */}
      <div className="md:hidden grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 text-center shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block">Total Funil</span>
          <span className="text-base font-black text-slate-900 dark:text-slate-100">{totalLeads}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-2.5 text-center shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">Em Andamento</span>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{totalAtivos}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 rounded-2xl p-2.5 text-center shadow-xs">
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block">Fechados</span>
          <span className="text-base font-black text-purple-600 dark:text-purple-400">{totalFechados}</span>
        </div>
      </div>

      {/* Desktop: Cards de Métricas */}
      <div className="hidden md:grid grid-cols-5 gap-3">
        {ETAPAS_KEYS.map((key) => {
          const cfg = ETAPAS_CRM_CONFIG[key];
          const Icon = cfg.icon;
          const count = leadsPorEtapa[key].length;

          return (
            <div
              key={key}
              onClick={() => setMobileTabEtapa(key)}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex items-center justify-between transition-all hover:border-emerald-500/30"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-400 block truncate">
                  {cfg.titulo}
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {count}
                </span>
              </div>
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', cfg.accent.bg, cfg.accent.text)}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── BARRA DE BUSCA E FILTROS ─── */}
      <Card>
        <CardContent className="p-3 sm:p-4 space-y-3">
          <Input
            placeholder="Buscar por lead, telefone, perfil ou imóvel de interesse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Origem:
            </span>
            {[
              { id: 'todos', label: 'Todas as Origens' },
              { id: 'portal', label: 'Portais' },
              { id: 'instagram', label: 'Instagram' },
              { id: 'site', label: 'Site' },
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'indicacao', label: 'Indicação' },
              { id: 'placa', label: 'Placa' },
            ].map((of) => (
              <button
                key={of.id}
                onClick={() => setOrigemFilter(of.id)}
                className={cn(
                  'px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0',
                  origemFilter === of.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {of.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── MOBILE (< 768px): TABS / PÍLULAS SUPERIORES + LISTA VERTICAL ─── */}
      <div className="md:hidden space-y-3">
        {/* Seletor de Tabs em Pílulas */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {ETAPAS_KEYS.map((key) => {
            const cfg = ETAPAS_CRM_CONFIG[key];
            const isSelected = mobileTabEtapa === key;
            const count = leadsPorEtapa[key].length;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setMobileTabEtapa(key)}
                className={cn(
                  'px-3 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 cursor-pointer',
                  isSelected
                    ? cfg.accent.pillActive
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                )}
              >
                <span>{cfg.titulo}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-black',
                    isSelected ? 'bg-white/30 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Lista de Cards da Etapa Selecionada no Mobile */}
        <div className="space-y-2.5">
          {leadsPorEtapa[mobileTabEtapa].length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center border border-slate-200/80 dark:border-slate-800 space-y-2">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Nenhum lead em {ETAPAS_CRM_CONFIG[mobileTabEtapa].titulo}
              </p>
              <p className="text-xs text-slate-400">
                Cadastre um novo lead ou mova contatos de outras etapas.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenNovoLead(mobileTabEtapa)}
                className="mt-2"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Adicionar Lead nesta Etapa
              </Button>
            </div>
          ) : (
            leadsPorEtapa[mobileTabEtapa].map((lead) => (
              <CrmLeadCard
                key={lead.id}
                lead={lead}
                etapaAtual={mobileTabEtapa}
                onClickDetails={(l) => setClienteDetalhes(l)}
                onAgendarVisita={handleAgendarVisita}
                onMoverEtapa={(id, novaEtapa) => moverEtapaCRM(id, novaEtapa)}
                onExcluirLead={(id) => removerCliente(id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ─── DESKTOP (>= 768px): KANBAN BOARD COM 5 COLUNAS E DRAG & DROP ─── */}
      <div className="hidden md:block">
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 scrollbar-thin">
          {ETAPAS_KEYS.map((key) => {
            const cfg = ETAPAS_CRM_CONFIG[key];
            const leadsDaColuna = leadsPorEtapa[key];

            return (
              <KanbanColumn
                key={key}
                etapa={key}
                titulo={cfg.titulo}
                descricao={cfg.descricao}
                icon={cfg.icon}
                accentColor={cfg.accent}
                leads={leadsDaColuna}
                draggingLeadId={draggingLeadId}
                onDropLead={handleDropLead}
                onClickDetails={(l) => setClienteDetalhes(l)}
                onAgendarVisita={handleAgendarVisita}
                onMoverEtapa={(id, novaEtapa) => moverEtapaCRM(id, novaEtapa)}
                onExcluirLead={(id) => removerCliente(id)}
                onAddNewLead={(et) => handleOpenNovoLead(et)}
              />
            );
          })}
        </div>
      </div>

      {/* ─── MODAIS ─── */}
      {/* 1. Modal de Criação de Novo Lead */}
      <NovoLeadModal
        isOpen={isNovoLeadOpen}
        onClose={() => setIsNovoLeadOpen(false)}
        initialEtapa={initialLeadEtapa}
      />

      {/* 2. Modal de Detalhes do Lead/Cliente */}
      {clienteDetalhes && (
        <ClienteDetalhesModal
          isOpen={!!clienteDetalhes}
          onClose={() => setClienteDetalhes(null)}
          cliente={clienteDetalhes}
          onAgendarVisita={(c) => {
            setClienteDetalhes(null);
            handleAgendarVisita(c);
          }}
          onSelectVisita={(v: Visita) => {
            setClienteDetalhes(null);
            setVisitaDetalhes(v);
          }}
        />
      )}

      {/* 3. Modal de Agendamento de Visita a partir do Lead */}
      <NovaVisitaModal
        isOpen={isNovaVisitaOpen}
        onClose={() => {
          setIsNovaVisitaOpen(false);
          setClienteParaVisita(null);
        }}
        clientePreSelecionado={clienteParaVisita || undefined}
      />

      {/* 4. Modal de Detalhes da Visita */}
      {visitaDetalhes && (
        <VisitaDetalhesModal
          isOpen={!!visitaDetalhes}
          onClose={() => setVisitaDetalhes(null)}
          visita={visitaDetalhes}
        />
      )}
    </div>
  );
}
