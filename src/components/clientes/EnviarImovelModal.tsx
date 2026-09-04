'use client';

import React, { useState, useMemo } from 'react';
import { Cliente, Imovel } from '@/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useData } from '@/context/DataContext';
import {
  Search,
  Building2,
  MapPin,
  BedDouble,
  Car,
  MessageCircle,
  ExternalLink,
  Tag,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, getWhatsAppDirectLink } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { compilePropertyTemplate } from '@/lib/whatsapp';
import { mockConfigWhatsApp } from '@/lib/mockData';

interface EnviarImovelModalProps {
  cliente: Cliente | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EnviarImovelModal({ cliente, isOpen, onClose }: EnviarImovelModalProps) {
  const { imoveis, configWhatsApp, showToast } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');

  const imoveisFiltrados = useMemo(() => {
    return imoveis
      .filter((im) => {
        const matchesSearch =
          search === '' ||
          im.titulo.toLowerCase().includes(search.toLowerCase()) ||
          im.codigo.toLowerCase().includes(search.toLowerCase()) ||
          im.bairro.toLowerCase().includes(search.toLowerCase()) ||
          im.cidade.toLowerCase().includes(search.toLowerCase()) ||
          im.endereco.toLowerCase().includes(search.toLowerCase());

        const matchesTipo = tipoFilter === 'todos' || im.tipo === tipoFilter;

        return matchesSearch && matchesTipo;
      })
      .sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
  }, [imoveis, search, tipoFilter]);

  if (!cliente) return null;

  const handleEnviarImovelWhatsApp = (imovel: Imovel) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://easymob.com.br';
    const imobQuery = imovel.imobiliaria ? `?imob=${encodeURIComponent(imovel.imobiliaria)}` : '';
    const linkImovel = `${origin}/imovel/${imovel.id}${imobQuery}`;

    const valorFormatado = imovel.valor_venda
      ? formatCurrency(imovel.valor_venda)
      : imovel.valor_locacao
      ? `${formatCurrency(imovel.valor_locacao)}/mês`
      : 'Sob consulta';

    const areaConstruidaOuUtil = imovel.area_construida || imovel.area_util || 0;
    const enderecoFormatado = `${imovel.endereco || ''}${imovel.numero ? `, ${imovel.numero}` : ''} - ${imovel.bairro}, ${imovel.cidade}`;

    const templateBase =
      configWhatsApp?.template_imovel_compativel ||
      mockConfigWhatsApp.template_imovel_compativel;

    const mensagem = compilePropertyTemplate(templateBase, {
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

    const linkWhatsApp = getWhatsAppDirectLink(cliente.telefone, mensagem);
    window.open(linkWhatsApp, '_blank');
    showToast(`Link do imóvel ${imovel.codigo} preparado para ${cliente.nome}!`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar Imóvel para o Cliente"
      subtitle={`Selecione um imóvel do catálogo para enviar via WhatsApp para ${cliente.nome}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Barra de Busca e Filtro de Tipo */}
        <div className="space-y-3">
          <Input
            placeholder="Buscar imóvel por título, código (ex: AP-1024), bairro ou rua..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'apartamento', label: 'Apartamentos' },
              { id: 'casa', label: 'Casas' },
              { id: 'cobertura', label: 'Coberturas' },
              { id: 'comercial', label: 'Comerciais' },
            ].map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => setTipoFilter(tf.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  tipoFilter === tf.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Imóveis */}
        {imoveisFiltrados.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Nenhum imóvel encontrado
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tente buscar por outro termo ou remova os filtros de busca.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {imoveisFiltrados.length} {imoveisFiltrados.length === 1 ? 'imóvel disponível' : 'imóveis disponíveis'}
            </span>

            {imoveisFiltrados.map((imovel) => {
              const valorFormatado = imovel.valor_venda
                ? formatCurrency(imovel.valor_venda)
                : imovel.valor_locacao
                ? `${formatCurrency(imovel.valor_locacao)}/mês`
                : 'Sob consulta';

              return (
                <div
                  key={imovel.id}
                  className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 hover:shadow-md transition-all flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between group"
                >
                  {/* Thumbnail e Informações */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 relative">
                      {imovel.imagem_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imovel.imagem_url}
                          alt={imovel.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}
                      {imovel.codigo && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] font-bold">
                          {imovel.codigo}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                          {imovel.tipo} • {imovel.finalidade === 'ambos' ? 'VENDA E LOCAÇÃO' : imovel.finalidade}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {imovel.titulo}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{imovel.bairro}, {imovel.cidade}</span>
                        </span>
                        {imovel.quartos && (
                          <span className="flex items-center gap-1">
                            <BedDouble className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{imovel.quartos} qts</span>
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {valorFormatado}
                      </div>
                    </div>
                  </div>

                  {/* Ação de Envio */}
                  <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <Button
                      type="button"
                      variant="whatsapp"
                      size="sm"
                      onClick={() => handleEnviarImovelWhatsApp(imovel)}
                      className="w-full sm:w-auto text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 mr-1.5" />
                      Enviar no WhatsApp
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
