'use client';

import React, { useState } from 'react';
import { Cliente, Imovel } from '@/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Sparkles,
  Building2,
  MapPin,
  BedDouble,
  DollarSign,
  CalendarPlus,
  ExternalLink,
  MessageCircle,
  Tag,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { formatCurrency, getWhatsAppDirectLink } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { compilePropertyTemplate } from '@/lib/whatsapp';
import { mockConfigWhatsApp } from '@/lib/mockData';
import { ImovelDetalhesModal } from '../imoveis/ImovelDetalhesModal';

interface ImoveisCompativeisModalProps {
  cliente: Cliente | null;
  imoveis: Imovel[];
  isOpen: boolean;
  onClose: () => void;
  onAgendarVisita?: (cliente: Cliente, imovel: Imovel) => void;
  onVerImovel?: (imovel: Imovel) => void;
}

export function ImoveisCompativeisModal({
  cliente,
  imoveis,
  isOpen,
  onClose,
  onAgendarVisita,
  onVerImovel,
}: ImoveisCompativeisModalProps) {
  const { configWhatsApp } = useData();
  const { user } = useAuth();
  const [imovelParaDetalhes, setImovelParaDetalhes] = useState<Imovel | null>(null);

  if (!cliente) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Imóveis Compatíveis (Match Inteligente)"
        subtitle={`Opções ativas no portfólio para ${cliente.nome}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Resumo do Perfil do Cliente */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Critérios de Busca do Lead
              </span>
              <div className="flex items-center gap-1.5 flex-wrap text-slate-800 dark:text-slate-200 font-bold">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 text-[11px]">
                  Tipo: {cliente.preferencia_tipo && cliente.preferencia_tipo !== 'todos' ? cliente.preferencia_tipo.toUpperCase() : 'TODOS'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 text-[11px]">
                  Quartos: {cliente.preferencia_quartos && cliente.preferencia_quartos > 0 ? `${cliente.preferencia_quartos}+` : 'QUALQUER'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 text-[11px]">
                  {cliente.preferencia_finalidade === 'locacao' ? 'LOCAÇÃO' : cliente.preferencia_finalidade === 'venda' ? 'VENDA' : 'VENDA / LOCAÇÃO'}
                </span>
              </div>
              {cliente.observacoes && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Obs: {cliente.observacoes}
                </p>
              )}
            </div>
            <div className="sm:text-right shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Faixa de Orçamento
              </span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm">
                {(cliente.orcamento_min || cliente.orcamento_max)
                  ? `${cliente.orcamento_min ? formatCurrency(cliente.orcamento_min) : 'R$ 0'} a ${cliente.orcamento_max ? formatCurrency(cliente.orcamento_max) : 'Ilimitado'}`
                  : cliente.faixa_orcamento || 'Não especificado'}
              </span>
            </div>
          </div>

          {/* Lista de Imóveis Compatíveis */}
          {imoveis.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Preencha o orçamento e preferências para ver imóveis compatíveis
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Defina a faixa de valor mínimo/máximo, tipo de imóvel ou quartos na ficha do cliente para o sistema cruzar automaticamente com as opções disponíveis no portfólio.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{imoveis.length} {imoveis.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}:</span>
                </p>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 italic hidden sm:inline">
                  Clique no card para ver a ficha completa
                </span>
              </div>

              {imoveis.map((imovel) => {
                const valorFormatado = imovel.valor_venda
                  ? formatCurrency(imovel.valor_venda)
                  : imovel.valor_locacao
                  ? `${formatCurrency(imovel.valor_locacao)}/mês`
                  : 'Sob consulta';

                const origin = typeof window !== 'undefined' ? window.location.origin : 'https://easymob.com.br';
                const imobQuery = imovel.imobiliaria ? `?imob=${encodeURIComponent(imovel.imobiliaria)}` : '';
                const linkImovel = `${origin}/imovel/${imovel.id}${imobQuery}`;

                const areaConstruidaOuUtil = imovel.area_construida || imovel.area_util || 0;
                const enderecoFormatado = `${imovel.endereco || ''}${imovel.numero ? `, ${imovel.numero}` : ''} - ${imovel.bairro}, ${imovel.cidade}`;

                const templateBase =
                  configWhatsApp?.template_imovel_compativel ||
                  mockConfigWhatsApp.template_imovel_compativel;

                const msgWhatsApp = compilePropertyTemplate(templateBase, {
                  cliente_nome: cliente.nome.split(' ')[0],
                  nome_cliente: cliente.nome,
                  cliente: cliente.nome.split(' ')[0],
                  nome: cliente.nome.split(' ')[0],
                  imovel_titulo: imovel.titulo,
                  titulo_imovel: imovel.titulo,
                  titulo: imovel.titulo,
                  imovel_codigo: imovel.codigo || 'SEM-COD',
                  codigo: imovel.codigo || 'SEM-COD',
                  endereco: enderecoFormatado,
                  bairro: imovel.bairro || '',
                  cidade: imovel.cidade || '',
                  valor: valorFormatado,
                  valor_venda: imovel.valor_venda ? formatCurrency(imovel.valor_venda) : '',
                  valor_locacao: imovel.valor_locacao ? `${formatCurrency(imovel.valor_locacao)}/mês` : '',
                  quartos: String(imovel.quartos || 0),
                  suites: String(imovel.suites || 0),
                  banheiros: String(imovel.banheiros || 0),
                  vagas: String(imovel.vagas || 0),
                  area: areaConstruidaOuUtil > 0 ? `${areaConstruidaOuUtil}m²` : '',
                  link_imovel: linkImovel,
                  link: linkImovel,
                  corretor_nome: user?.name || 'Corretor',
                  corretor_telefone: user?.telefone || '',
                  imobiliaria_nome: imovel.imobiliaria || 'EasyMob',
                });

                const linkWa = getWhatsAppDirectLink(cliente.telefone, msgWhatsApp);

                return (
                  <div
                    key={imovel.id}
                    onClick={() => {
                      if (onVerImovel) {
                        onVerImovel(imovel);
                      } else {
                        setImovelParaDetalhes(imovel);
                      }
                    }}
                    className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-emerald-500/70 hover:shadow-md hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-all flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between cursor-pointer group select-none"
                    title="Clique para ver os detalhes completos deste imóvel"
                  >
                    {/* Foto e Detalhes */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 relative">
                        {imovel.imagem_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imovel.imagem_url}
                            alt={imovel.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-300">
                            <Building2 className="w-6 h-6" />
                          </div>
                        )}
                        {imovel.codigo && (
                          <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/70 text-white font-mono text-[9px]">
                            {imovel.codigo}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                            {imovel.tipo} • {imovel.finalidade === 'ambos' ? 'VENDA E LOCAÇÃO' : imovel.finalidade}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {imovel.titulo}
                        </h4>

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{imovel.bairro}, {imovel.cidade}</span>
                          </span>
                          {imovel.quartos && (
                            <span className="flex items-center gap-1">
                              <BedDouble className="w-3 h-3 text-slate-400" />
                              <span>{imovel.quartos} qts</span>
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          {valorFormatado}
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div
                      className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={linkWa}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 sm:flex-initial"
                        title="Apresentar imóvel no WhatsApp"
                      >
                        <Button
                          type="button"
                          variant="whatsapp"
                          size="sm"
                          className="w-full text-xs font-semibold"
                        >
                          <MessageCircle className="w-3.5 h-3.5 sm:mr-1" />
                          <span className="hidden sm:inline">Apresentar</span>
                        </Button>
                      </a>

                      {onAgendarVisita && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAgendarVisita(cliente, imovel);
                          }}
                          className="flex-1 sm:flex-initial text-xs font-semibold shadow-xs"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 mr-1" />
                          <span>Agendar</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Detalhes Completos do Imóvel (Ficha com fotos, descrição, características e proprietário) */}
      <ImovelDetalhesModal
        imovel={imovelParaDetalhes}
        isOpen={!!imovelParaDetalhes}
        onClose={() => setImovelParaDetalhes(null)}
        onAgendarVisita={(im) => {
          setImovelParaDetalhes(null);
          onAgendarVisita?.(cliente, im);
        }}
      />
    </>
  );
}
