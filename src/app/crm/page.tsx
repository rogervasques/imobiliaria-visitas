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
  UserCheck,
  FileText,
  ShieldCheck,
  FileSignature,
  Trophy,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Configuração das 7 Etapas do Funil de Vendas do CRM
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
  novos_leads: {
    titulo: 'Novos Leads',
    descricao: 'Contatos recebidos aguardando primeiro retorno',
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
  qualificacao: {
    titulo: 'Qualificação',
    descricao: 'Em atendimento / identificando perfil e orçamento',
    icon: UserCheck,
    accent: {
      bg: 'bg-amber-100 dark:bg-amber-950/80',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      badge: 'bg-amber-500 text-white',
      dot: 'bg-amber-500',
      pillActive: 'bg-amber-600 text-white shadow-md shadow-amber-600/30',
    },
  },
  agendamento_visita: {
    titulo: 'Agendamento de Visita',
    descricao: 'Visita presencial/virtual marcada — integrado à agenda',
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
  proposta_negociacao: {
    titulo: 'Proposta / Negociação',
    descricao: 'Oferta formal enviada e negociação de valores',
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
  documentacao_credito: {
    titulo: 'Documentação / Crédito',
    descricao: 'Coleta de documentos e aprovação bancária/locação',
    icon: ShieldCheck,
    accent: {
      bg: 'bg-teal-100 dark:bg-teal-950/80',
      text: 'text-teal-600 dark:text-teal-400',
      border: 'border-teal-200 dark:border-teal-800',
      badge: 'bg-teal-600 text-white',
      dot: 'bg-teal-600',
      pillActive: 'bg-teal-600 text-white shadow-md shadow-teal-600/30',
    },
  },
  fechamento_contrato: {
    titulo: 'Fechamento / Contrato',
    descricao: 'Elaboração, assinatura de contrato e sinal',
    icon: FileSignature,
    accent: {
      bg: 'bg-indigo-100 dark:bg-indigo-950/80',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800',
      badge: 'bg-indigo-600 text-white',
      dot: 'bg-indigo-600',
      pillActive: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30',
    },
  },
  venda_concluida: {
    titulo: 'Venda Concluída',
    descricao: 'Negócio finalizado e comissão liberada',
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

const ETAPAS_KEYS: EtapaCRM[] = [
  'novos_leads',
  'qualificacao',
  'agendamento_visita',
  'proposta_negociacao',
  'documentacao_credito',
  'fechamento_contrato',
  'venda_concluida',
];

export default function CrmPage() {
  const { clientes, moverEtapaCRM, removerCliente } = useData();

  const [search, setSearch] = useState('');
  const [origemFilter, setOrigemFilter] = useState('todos');
  const [mobileTabEtapa, setMobileTabEtapa] = useState<EtapaCRM>('novos_leads');

  // Modais
  const [isNovoLeadOpen, setIsNovoLeadOpen] = useState(false);
  const [initialLeadEtapa, setInitialLeadEtapa] = useState<EtapaCRM>('novos_leads');
  const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);
  const [clienteParaVisita, setClienteParaVisita] = useState<Cliente | null>(null);
  const [isNovaVisitaOpen, setIsNovaVisitaOpen] = useState(false);
  const [visitaDetalhes, setVisitaDetalhes] = useState<Visita | null>(null);

  // Drag and Drop
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);

  // Normalização e associação de cada cliente a uma das 7 etapas
  const getClienteEtapa = (c: Cliente): EtapaCRM => {
    if (c.etapa_crm) {
      // Mapeamento retrocompatível caso haja strings antigas
      if (c.etapa_crm === ('novo' as any)) return 'novos_leads';
      if (c.etapa_crm === ('em_atendimento' as any)) return 'qualificacao';
      if (c.etapa_crm === ('visita_agendada' as any)) return 'agendamento_visita';
      if (c.etapa_crm === ('proposta' as any)) return 'proposta_negociacao';
      if (c.etapa_crm === ('fechado' as any)) return 'venda_concluida';
      return c.etapa_crm;
    }
    if (c.status === 'fechado') return 'venda_concluida';
    if (c.status === 'negociando') return 'proposta_negociacao';
    return 'novos_leads';
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
      novos_leads: [],
      qualificacao: [],
      agendamento_visita: [],
      proposta_negociacao: [],
      documentacao_credito: [],
      fechamento_contrato: [],
      venda_concluida: [],
    };

    filteredClientes.forEach((c) => {
      const etapa = getClienteEtapa(c);
      if (map[etapa]) {
        map[etapa].push(c);
      } else {
        map.novos_leads.push(c);
      }
    });

    return map;
  }, [filteredClientes]);

  // Métricas do Funil
  const totalLeads = clientes.length;
  const totalAtivos = clientes.filter((c) => {
    const et = getClienteEtapa(c);
    return et !== 'venda_concluida' && c.status !== 'inativo';
  }).length;
  const totalFechados = leadsPorEtapa.venda_concluida.length;

  const handleOpenNovoLead = (etapa: EtapaCRM = 'novos_leads') => {
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
            CRM &amp; Funil de Vendas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden md:block">
            Gestão visual do pipeline de oportunidades em 7 etapas estratégicas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenNovoLead('novos_leads')}
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
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block">Concluídos</span>
          <span className="text-base font-black text-purple-600 dark:text-purple-400">{totalFechados}</span>
        </div>
      </div>

      {/* Desktop: Cards de Métricas das 7 Etapas */}
      <div className="hidden md:grid grid-cols-7 gap-2.5">
        {ETAPAS_KEYS.map((key) => {
          const cfg = ETAPAS_CRM_CONFIG[key];
          const Icon = cfg.icon;
          const count = leadsPorEtapa[key].length;

          return (
            <div
              key={key}
              onClick={() => setMobileTabEtapa(key)}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-xs flex items-center justify-between transition-all hover:border-emerald-500/30"
            >
              <div className="min-w-0 pr-1">
                <span className="text-[11px] font-bold text-slate-400 block truncate" title={cfg.titulo}>
                  {cfg.titulo}
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {count}
                </span>
              </div>
              <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center shrink-0', cfg.accent.bg, cfg.accent.text)}>
                <Icon className="w-3.5 h-3.5" />
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

      {/* ─── MOBILE (< 768px): TABS / PÍLULAS SUPERIORES COM ROLAGEM + LISTA VERTICAL ─── */}
      <div className="md:hidden space-y-3">
        {/* Seletor de Tabs em Pílulas com Scroll Horizontal */}
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
                Cadastre um novo lead ou mova contatos de outras etapas do funil.
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

      {/* ─── DESKTOP (>= 768px): KANBAN BOARD COM AS 7 COLUNAS E DRAG & DROP ─── */}
      <div className="hidden md:block">
        <div className="flex gap-3.5 overflow-x-auto pb-6 pt-1 scrollbar-thin">
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
