'use client';

import React, { useState } from 'react';
import { Imovel } from '@/types';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Phone,
  User,
  Key,
  Sparkles,
  Maximize2,
  Tag,
  Calendar,
  Images,
  ChevronLeft,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { formatCurrency, formatPhone, getWhatsAppDirectLink } from '@/lib/utils';
import { getGoogleMapsSearchUrl } from '@/lib/maps';
import { CompartilharImovelModal } from './CompartilharImovelModal';

interface ImovelCardProps {
  imovel: Imovel;
  onClick?: (imovel: Imovel) => void;
  onEdit?: (imovel: Imovel) => void;
  onAgendarVisita?: (imovel: Imovel) => void;
}

export function ImovelCard({ imovel, onClick, onEdit, onAgendarVisita }: ImovelCardProps) {
  const [cardImageIndex, setCardImageIndex] = useState(0);
  const [isCompartilharOpen, setIsCompartilharOpen] = useState(false);

  const fotosCard = imovel.fotos_urls && imovel.fotos_urls.length > 0
    ? imovel.fotos_urls
    : (imovel.imagem_url ? [imovel.imagem_url] : []);
  const currentCardPhoto = fotosCard[cardImageIndex] || imovel.imagem_url;

  const statusColors = {
    disponivel: 'success' as const,
    reservado: 'warning' as const,
    vendido: 'purple' as const,
    alugado: 'info' as const,
    inativo: 'default' as const,
  };

  const directWhatsAppOwner = getWhatsAppDirectLink(
    imovel.proprietario_telefone,
    `Olá, ${imovel.proprietario_nome}! Gostaria de falar sobre o seu imóvel ${imovel.titulo} (${imovel.codigo || ''}).`
  );

  const areaConstruidaOuUtil = imovel.area_construida || imovel.area_util || 0;
  const valorMetroQuadrado =
    imovel.valor_venda && areaConstruidaOuUtil > 0
      ? Math.round(imovel.valor_venda / areaConstruidaOuUtil)
      : null;

  return (
    <Card
      onClick={() => onClick?.(imovel)}
      className="hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group"
    >
      {/* Imagem de Capa com Carrossel */}
      <div className="relative h-44 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        {currentCardPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentCardPhoto}
            alt={imovel.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
            <Building2 className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}

        {/* Setas de Navegação do Carrossel no Hover */}
        {fotosCard.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCardImageIndex((prev) => (prev - 1 + fotosCard.length) % fotosCard.length);
              }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/65 hover:bg-black/90 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 z-20 hover:scale-110"
              title="Foto anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCardImageIndex((prev) => (prev + 1) % fotosCard.length);
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/65 hover:bg-black/90 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 z-20 hover:scale-110"
              title="Próxima foto"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Bullets / Dots do Carrossel */}
            <div className="absolute bottom-2 right-2.5 flex items-center gap-1 z-20 bg-black/50 backdrop-blur-xs px-1.5 py-0.5 rounded-full">
              {fotosCard.slice(0, 5).map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    dotIdx === cardImageIndex
                      ? 'bg-emerald-400 scale-125'
                      : 'bg-white/50'
                  }`}
                />
              ))}
              {fotosCard.length > 5 && (
                <span className="text-[8px] font-bold text-white font-mono leading-none ml-0.5">
                  +{fotosCard.length - 5}
                </span>
              )}
            </div>
          </>
        )}

        {/* Badges de Código e Status */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white font-mono text-xs font-bold">
            {imovel.codigo || 'SEM-COD'}
          </span>
          <Badge variant={statusColors[imovel.status] || 'default'} size="sm">
            {imovel.status.toUpperCase()}
          </Badge>
        </div>

        {/* Contador de Fotos */}
        {fotosCard.length > 1 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[11px] font-bold shadow-xs z-10">
            <Images className="w-3 h-3 text-emerald-400" />
            <span>{cardImageIndex + 1}/{fotosCard.length}</span>
          </div>
        )}

        {/* Tipo e Finalidade */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider">
            {imovel.tipo} • {imovel.finalidade === 'ambos' ? 'VENDA E LOCAÇÃO' : imovel.finalidade}
          </span>
        </div>
      </div>

      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Título e Valor com Valor do m² */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {imovel.titulo}
            </h4>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {imovel.valor_venda ? formatCurrency(imovel.valor_venda) : ''}
              {imovel.valor_venda && imovel.valor_locacao ? ' | ' : ''}
              {imovel.valor_locacao ? `${formatCurrency(imovel.valor_locacao)}/mês` : ''}
            </div>
            {valorMetroQuadrado && (
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-500" />
                <span>{formatCurrency(valorMetroQuadrado)}/m²</span>
                {imovel.valor_condominio && (
                  <span>• Cond. {formatCurrency(imovel.valor_condominio)}</span>
                )}
              </div>
            )}
          </div>

          {/* Endereço com Link Rápido de Mapa */}
          <div className="flex items-center justify-between gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-start gap-1.5 min-w-0 flex-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="truncate">
                {imovel.endereco}{imovel.numero ? `, ${imovel.numero}` : ''} - {imovel.bairro}, {imovel.cidade}
              </span>
            </div>
            <a
              href={getGoogleMapsSearchUrl(imovel)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800"
              title="Abrir no Google Maps"
            >
              <MapPin className="w-3 h-3 shrink-0" />
              <span>Mapa</span>
            </a>
          </div>

          {/* Especificações (Quartos, Suítes, Banheiros, Vagas, Área) */}
          <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 py-2 border-y border-slate-100 dark:border-slate-800 flex-wrap">
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-slate-400" />
              <strong>{imovel.quartos}</strong> qts
            </span>
            {imovel.suites ? (
              <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                <Sparkles className="w-3.5 h-3.5" />
                <strong>{imovel.suites}</strong> suítes
              </span>
            ) : null}
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              <strong>{imovel.banheiros}</strong> banh
            </span>
            <span className="flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-slate-400" />
              <strong>{imovel.vagas}</strong> vag
            </span>
            {areaConstruidaOuUtil > 0 && (
              <span className="text-slate-500 flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                <strong>{areaConstruidaOuUtil}</strong> m²
              </span>
            )}
          </div>

          {/* Dados do Proprietário & Chaves */}
          <div
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1 font-semibold">
                <User className="w-3 h-3 text-slate-400" />
                {imovel.proprietario_nome}
              </span>
              <a
                href={directWhatsAppOwner}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-0.5"
              >
                <Phone className="w-3 h-3" />
                WhatsApp
              </a>
            </div>
            {imovel.observacoes_chaves && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-0.5 border-t border-slate-200/50 dark:border-slate-800">
                <Key className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">{imovel.observacoes_chaves}</span>
              </div>
            )}
          </div>

          {/* Botões Rápidos: [ 📅 Agendar Visita ] e [ 📲 Compartilhar ] */}
          <div className="flex items-center gap-2 mt-2">
            {onAgendarVisita && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAgendarVisita(imovel);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                title="Agendar visita neste imóvel"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Agendar Visita</span>
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCompartilharOpen(true);
              }}
              className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              title="Compartilhar ficha pública com o cliente no WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-500 hover:text-white" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
          </div>
        </div>
      </CardContent>

      <CompartilharImovelModal
        imovel={imovel}
        isOpen={isCompartilharOpen}
        onClose={() => setIsCompartilharOpen(false)}
      />
    </Card>
  );
}
