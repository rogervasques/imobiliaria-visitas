'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Imovel, Proprietario } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ImovelDetalhesModal } from '@/components/imoveis/ImovelDetalhesModal';
import { NovaVisitaModal } from '@/components/visitas/NovaVisitaModal';
import {
  UserCheck,
  Search,
  Phone,
  MessageCircle,
  Building2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Tag,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency, formatPhone, getWhatsAppDirectLink } from '@/lib/utils';

export default function ProprietariosPage() {
  const { proprietarios, imoveis } = useData();
  const [search, setSearch] = useState('');
  const [expandedPropId, setExpandedPropId] = useState<string | null>(null);
  const [imovelDetalhes, setImovelDetalhes] = useState<Imovel | null>(null);
  const [imovelParaVisita, setImovelParaVisita] = useState<Imovel | null>(null);
  const [isNovaVisitaOpen, setIsNovaVisitaOpen] = useState(false);

  // Filtra proprietários pela busca (nome, telefone ou email) e ordena alfabeticamente
  const filteredProprietarios = proprietarios
    .filter((p) => {
      const s = search.toLowerCase().trim();
      if (!s) return true;
      return (
        p.nome.toLowerCase().includes(s) ||
        p.telefone.includes(s) ||
        (p.email && p.email.toLowerCase().includes(s))
      );
    })
    .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' }));

  // Retorna os imóveis vinculados a um proprietário
  const getImoveisDoProprietario = (prop: Proprietario) => {
    const cleanPhone = prop.telefone?.trim().toLowerCase();
    return imoveis.filter(
      (im) =>
        (im.proprietario_id && im.proprietario_id === prop.id) ||
        (cleanPhone && im.proprietario_telefone?.trim().toLowerCase() === cleanPhone) ||
        im.proprietario_nome?.trim().toLowerCase() === prop.nome?.trim().toLowerCase()
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedPropId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-500" />
            Módulo de Proprietários
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Gerenciamento relacional de proprietários e visualização unificada de seus imóveis cadastrados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="md">
            {proprietarios.length} {proprietarios.length === 1 ? 'Proprietário' : 'Proprietários'}
          </Badge>
        </div>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar proprietário por nome, telefone ou WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      {/* Lista de Proprietários */}
      {filteredProprietarios.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              Nenhum proprietário encontrado
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Os proprietários são vinculados automaticamente ao cadastrar novos imóveis no sistema.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredProprietarios.map((prop) => {
            const imoveisProp = getImoveisDoProprietario(prop);
            const isExpanded = expandedPropId === prop.id;

            const waLink = getWhatsAppDirectLink(
              prop.telefone,
              `Olá, ${prop.nome}! Gostaria de falar sobre os seus imóveis anunciados conosco.`
            );

            return (
              <Card
                key={prop.id}
                className="overflow-hidden transition-all border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40"
              >
                {/* Linha Principal do Proprietário */}
                <div
                  onClick={() => toggleExpand(prop.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0 border border-emerald-200 dark:border-emerald-800/60">
                      {prop.nome.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {prop.nome}
                        <Badge variant="default" size="sm">
                          {imoveisProp.length} {imoveisProp.length === 1 ? 'imóvel' : 'imóveis'}
                        </Badge>
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {formatPhone(prop.telefone)}
                        </span>
                        {prop.email && (
                          <span className="text-slate-400 hidden sm:inline">• {prop.email}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações Rápidas: WhatsApp Direto + Botão Expandir */}
                  <div
                    className="flex items-center gap-2 self-end sm:self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800/60 transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Conversar no WhatsApp
                    </a>

                    <button
                      type="button"
                      onClick={() => toggleExpand(prop.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={isExpanded ? 'Recolher' : 'Expandir imóveis'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ── Área Expandida: Imóveis do Proprietário ── */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                        Imóveis Vinculados ({imoveisProp.length})
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Clique em qualquer imóvel para ver ou editar detalhes
                      </span>
                    </div>

                    {imoveisProp.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        Nenhum imóvel ativo vinculado a este proprietário.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {imoveisProp.map((im) => (
                          <div
                            key={im.id}
                            onClick={() => setImovelDetalhes(im)}
                            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-2"
                          >
                            <div className="flex items-start gap-2.5">
                              {im.imagem_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={im.imagem_url}
                                  alt={im.titulo}
                                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                  <Building2 className="w-6 h-6" />
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-mono font-bold text-slate-400 block">
                                  {im.codigo || 'SEM-COD'}
                                </span>
                                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 transition-colors">
                                  {im.titulo}
                                </h5>
                                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                  {im.valor_venda ? formatCurrency(im.valor_venda) : ''}
                                  {im.valor_venda && im.valor_locacao ? ' | ' : ''}
                                  {im.valor_locacao ? `${formatCurrency(im.valor_locacao)}/mês` : ''}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                              <span className="truncate">
                                {im.bairro}, {im.cidade}
                              </span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                Ver detalhes →
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Reaproveitamento de Componente: Modal de Detalhes do Imóvel */}
      <ImovelDetalhesModal
        imovel={imovelDetalhes}
        isOpen={!!imovelDetalhes}
        onClose={() => setImovelDetalhes(null)}
        onAgendarVisita={(im) => {
          setImovelParaVisita(im);
          setImovelDetalhes(null);
          setIsNovaVisitaOpen(true);
        }}
      />

      {/* Modal de Nova Visita com Imóvel Pré-selecionado */}
      <NovaVisitaModal
        isOpen={isNovaVisitaOpen}
        onClose={() => {
          setIsNovaVisitaOpen(false);
          setImovelParaVisita(null);
        }}
        imovelPreSelecionado={imovelParaVisita || undefined}
      />
    </div>
  );
}
