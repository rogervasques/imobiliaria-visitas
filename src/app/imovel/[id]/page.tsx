'use client';

import React, { useState, useEffect, use } from 'react';
import { Imovel } from '@/types';
import { supabase } from '@/lib/supabase';
import { mockImoveis } from '@/lib/mockData';
import { ImovelGaleriaLightbox } from '@/components/imoveis/ImovelGaleriaLightbox';
import { getGoogleMapsSearchUrl, getGoogleMapsDirectionsUrl } from '@/lib/maps';
import { formatCurrency, getWhatsAppDirectLink } from '@/lib/utils';
import {
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Car,
  PawPrint,
  Maximize2,
  Sparkles,
  Share2,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Images,
  ShieldCheck,
  Tag,
  Clock,
  Home,
} from 'lucide-react';
import { EasyMobLogo } from '@/components/ui/EasyMobLogo';
import Link from 'next/link';

interface PublicImovelPageProps {
  params: Promise<{ id: string }>;
}

export default function PublicImovelPage({ params }: PublicImovelPageProps) {
  const resolvedParams = use(params);
  const imovelId = resolvedParams.id;

  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [nomeImobiliaria, setNomeImobiliaria] = useState<string>('');
  const [logoImobiliaria, setLogoImobiliaria] = useState<string>('');
  const [telefoneImobiliaria, setTelefoneImobiliaria] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadImovel() {
      try {
        setLoading(true);

        // 0. Verifica se há parâmetro ?imob= na URL ou cache local
        let imobFromUrl = '';
        let localImovel: Imovel | null = null;
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          imobFromUrl = params.get('imob') || '';

          const localStr =
            localStorage.getItem('easymob_visitas_imoveis') ||
            localStorage.getItem('imobiliaria_visitas_imoveis');
          if (localStr) {
            try {
              const list: Imovel[] = JSON.parse(localStr);
              localImovel = list.find((im) => im.id === imovelId || im.codigo === imovelId) || null;
            } catch {
              // ignore
            }
          }
        }

        // 1. Tenta buscar no Supabase
        const { data, error } = await supabase
          .from('imoveis')
          .select('*')
          .eq('id', imovelId)
          .single();

        let targetImovel: Imovel | null = null;

        if (data && !error) {
          targetImovel = data as Imovel;
        } else if (localImovel) {
          targetImovel = localImovel;
        } else {
          // 2. Fallback para os dados de demonstração
          const fallback = mockImoveis.find((im) => im.id === imovelId || im.codigo === imovelId);
          if (fallback) {
            targetImovel = fallback;
          }
        }

        if (targetImovel) {
          // Se o imóvel no cache local tem a imobiliária correta, mescla
          if (localImovel && localImovel.imobiliaria) {
            targetImovel.imobiliaria = localImovel.imobiliaria;
            targetImovel.imobiliaria_id = localImovel.imobiliaria_id;
          }

          setImovel(targetImovel);

          // 3. Descobre o nome real da Imobiliária dona deste imóvel (prioridade máxima: URL > localImovel > targetImovel)
          let finalNome =
            imobFromUrl ||
            localImovel?.imobiliaria ||
            targetImovel.imobiliaria ||
            '';
          let finalLogo = '';
          let finalTelefone = '';

          // A. Se o imóvel tem imobiliaria_id, busca os dados da imobiliária
          if (targetImovel.imobiliaria_id) {
            try {
              const { data: imoData } = await supabase
                .from('imobiliarias')
                .select('*')
                .eq('id', targetImovel.imobiliaria_id)
                .single();
              if (imoData && imoData.nome) {
                finalNome = finalNome || imoData.nome;
                finalLogo = imoData.logo_url || '';
                finalTelefone = imoData.telefone || '';
              }
            } catch {
              // ignore
            }
          }

          // B. Busca detalhes (logo e telefone) da lista salva no localStorage
          if (typeof window !== 'undefined') {
            const savedListStr = localStorage.getItem('easymob_imobiliarias_list');
            if (savedListStr) {
              try {
                const list = JSON.parse(savedListStr);
                const match = list.find(
                  (i: { nome?: string; id?: string }) =>
                    (finalNome && i.nome?.toLowerCase() === finalNome.toLowerCase()) ||
                    (targetImovel?.imobiliaria_id && i.id === targetImovel.imobiliaria_id)
                );
                if (match) {
                  finalNome = finalNome || match.nome;
                  finalLogo = finalLogo || match.logo_url || '';
                  finalTelefone = finalTelefone || match.telefone || '';
                }
              } catch {
                // ignore
              }
            }

            // Fallback para o tenant ativo no navegador se ainda não houver nome
            if (!finalNome) {
              const savedActive = localStorage.getItem('easymob_active_tenant_nome');
              if (savedActive && savedActive !== 'Administração') {
                finalNome = savedActive;
              }
            }
          }

          setNomeImobiliaria(finalNome || targetImovel.imobiliaria || 'Imobiliária');
          setLogoImobiliaria(finalLogo);
          setTelefoneImobiliaria(finalTelefone);
        }
      } catch {
        const fallback = mockImoveis.find((im) => im.id === imovelId || im.codigo === imovelId);
        if (fallback) {
          setImovel(fallback);
          setNomeImobiliaria(fallback.imobiliaria || 'Imobiliária');
        }
      } finally {
        setLoading(false);
      }
    }

    if (imovelId) {
      loadImovel();
    }
  }, [imovelId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-400">Carregando detalhes do imóvel...</p>
      </div>
    );
  }

  if (!imovel) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-100">Imóvel Não Encontrado</h1>
        <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">
          Este imóvel pode ter sido desativado, vendido ou o link está incorreto.
        </p>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
        >
          Voltar ao Início
        </Link>
      </div>
    );
  }

  const fotosList =
    imovel.fotos_urls && imovel.fotos_urls.length > 0
      ? imovel.fotos_urls
      : imovel.imagem_url
      ? [imovel.imagem_url]
      : [];
  const activePhoto = fotosList[activePhotoIndex] || imovel.imagem_url || '';

  const areaConstruidaOuUtil = imovel.area_construida || imovel.area_util || 0;
  const valorPrincipal = imovel.valor_venda
    ? formatCurrency(imovel.valor_venda)
    : imovel.valor_locacao
    ? `${formatCurrency(imovel.valor_locacao)}/mês`
    : 'Sob Consulta';

  // Link do WhatsApp com mensagem pronta direcionada para a imobiliária
  const mensagemWhatsAppCliente = `Olá! 👋 Vi o imóvel *${imovel.titulo}* (Código: ${imovel.codigo || 'SEM-COD'}) e gostaria de mais informações ou agendar uma visita presencial!`;
  const whatsappUrl = getWhatsAppDirectLink(telefoneImobiliaria, mensagemWhatsAppCliente);

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: imovel.titulo,
          text: `Confira este imóvel: ${imovel.titulo} - ${valorPrincipal}`,
          url: window.location.href,
        });
      } catch {
        // Ignora cancelamento
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  const getInitials = (name: string) => {
    const parts = (name || '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name || 'IM').slice(0, 2).toUpperCase();
  };

  const imobiliariaExibicao = nomeImobiliaria || imovel.imobiliaria || 'Lagom Imóveis';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-28 md:pb-12">
      {/* ── Topo / Barra de Navegação Pública ── */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Lado Esquerdo: Nome da Imobiliária dona do imóvel */}
          <div className="flex items-center gap-2.5 min-w-0">
            {logoImobiliaria ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoImobiliaria}
                alt={imobiliariaExibicao}
                className="w-8 h-8 rounded-xl object-cover bg-white shadow-md shadow-emerald-500/20 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 shrink-0">
                {getInitials(imobiliariaExibicao)}
              </div>
            )}
            <div className="min-w-0">
              <span className="font-extrabold text-sm text-white tracking-tight block truncate leading-tight">
                {imobiliariaExibicao}
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                Ficha do Imóvel
              </span>
            </div>
          </div>

          {/* Lado Direito: by EasyMob */}
          <div className="flex items-center px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-800 text-slate-400 shadow-2xs shrink-0 select-none">
            <EasyMobLogo variant="watermark" />
          </div>
        </div>
      </header>

      {/* ── Conteúdo Principal ── */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 1. Carrossel de Fotos Interativo & Lightbox */}
        <div className="space-y-2.5">
          <div
            onClick={() => fotosList.length > 0 && setLightboxIndex(activePhotoIndex)}
            className="relative h-72 sm:h-[420px] w-full rounded-3xl bg-slate-900 overflow-hidden shadow-2xl border border-slate-800 group cursor-pointer"
          >
            {activePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activePhoto}
                alt={`${imovel.titulo} - Foto ${activePhotoIndex + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                <Building2 className="w-16 h-16 stroke-[1.5]" />
              </div>
            )}

            {/* Setas de Navegação */}
            {fotosList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex((prev) => (prev - 1 + fotosList.length) % fotosList.length);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/65 hover:bg-black/90 text-white backdrop-blur-md transition-all hover:scale-110 shadow-lg z-20 cursor-pointer"
                  title="Foto anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex((prev) => (prev + 1) % fotosList.length);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/65 hover:bg-black/90 text-white backdrop-blur-md transition-all hover:scale-110 shadow-lg z-20 cursor-pointer"
                  title="Próxima foto"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Bullets / Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md">
                  {fotosList.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIndex(dotIdx);
                      }}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        dotIdx === activePhotoIndex
                          ? 'bg-emerald-400 scale-125'
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      title={`Ir para foto ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badges no Topo */}
            <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
              <span className="px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white font-mono text-xs font-bold">
                REF: {imovel.codigo || 'SEM-COD'}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider">
                {imovel.tipo} • {imovel.finalidade}
              </span>
            </div>

            {/* Contador de Fotos */}
            {fotosList.length > 1 && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white font-mono text-xs font-bold shadow-md z-10">
                <Images className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activePhotoIndex + 1} / {fotosList.length}</span>
              </div>
            )}

            {/* Botão de Zoom */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-md transition-all group-hover:scale-105 shadow-md z-10">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ver em Tela Cheia</span>
            </div>
          </div>

          {/* Faixa de Miniaturas */}
          {fotosList.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
              {fotosList.map((url, idx) => {
                const isSelected = idx === activePhotoIndex;
                return (
                  <button
                    key={url + idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-105 shadow-md'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Cabeçalho de Título, Preço e Localização */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                {imovel.finalidade === 'venda' ? 'Imóvel à Venda' : 'Imóvel para Locação'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {imovel.titulo}
              </h1>
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Valor do Imóvel
              </span>
              <div className="text-3xl font-black text-emerald-400">
                {valorPrincipal}
              </div>
              {(imovel.valor_condominio || imovel.valor_iptu) && (
                <div className="text-xs text-slate-400 font-semibold mt-0.5">
                  {imovel.valor_condominio ? `Cond.: ${formatCurrency(imovel.valor_condominio)}` : ''}
                  {imovel.valor_condominio && imovel.valor_iptu ? ' • ' : ''}
                  {imovel.valor_iptu ? `IPTU: ${formatCurrency(imovel.valor_iptu)}` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Endereço & Botão de Mapa */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                {imovel.endereco}{imovel.numero ? `, ${imovel.numero}` : ''} - {imovel.bairro}, {imovel.cidade} - {imovel.estado}
              </span>
            </div>

            <a
              href={getGoogleMapsSearchUrl(imovel)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl self-start sm:self-auto"
            >
              <span>📍 Ver no Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* 3. Grade de Características Físicas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
            <BedDouble className="w-5 h-5 text-slate-400 mx-auto" />
            <div className="text-lg font-black text-white">{imovel.quartos}</div>
            <span className="text-[11px] text-slate-400 uppercase font-bold">Quartos</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
            <Sparkles className="w-5 h-5 text-sky-400 mx-auto" />
            <div className="text-lg font-black text-sky-400">{imovel.suites || 0}</div>
            <span className="text-[11px] text-slate-400 uppercase font-bold">Suítes</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
            <Bath className="w-5 h-5 text-slate-400 mx-auto" />
            <div className="text-lg font-black text-white">{imovel.banheiros}</div>
            <span className="text-[11px] text-slate-400 uppercase font-bold">Banheiros</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
            <Car className="w-5 h-5 text-slate-400 mx-auto" />
            <div className="text-lg font-black text-white">{imovel.vagas}</div>
            <span className="text-[11px] text-slate-400 uppercase font-bold">Vagas</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
            <Maximize2 className="w-5 h-5 text-slate-400 mx-auto" />
            <div className="text-lg font-black text-white">{areaConstruidaOuUtil || '—'}</div>
            <span className="text-[11px] text-slate-400 uppercase font-bold">Área m²</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
            <PawPrint className="w-5 h-5 text-emerald-400 mx-auto" />
            <div className="text-sm font-black text-white pt-1">
              {imovel.aceita_pet ? 'Sim' : 'Não'}
            </div>
            <span className="text-[11px] text-slate-400 uppercase font-bold">Aceita Pet</span>
          </div>
        </div>

        {/* 4. Descrição Comercial */}
        {imovel.descricao_comercial && (
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-400" />
              Sobre este Imóvel
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {imovel.descricao_comercial}
            </p>
          </div>
        )}

        {/* 5. Comodidades e Diferenciais */}
        {imovel.caracteristicas && imovel.caracteristicas.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Comodidades &amp; Infraestrutura
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {imovel.caracteristicas.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-semibold text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Card de Chamada para Visita */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Ficou interessado neste imóvel?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Agende uma visita presencial para conhecer todos os detalhes de perto. Nosso corretor entrará em contato para confirmar o melhor horário!
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-lg hover:scale-105"
          >
            <MessageCircle className="w-5 h-5 fill-slate-950" />
            <span>Agendar Visita pelo WhatsApp</span>
          </a>
        </div>
      </main>

      {/* ── Barra Flutuante Fixa Inferior no Celular (CTA Rápido) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 sm:hidden shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor</span>
          <div className="text-base font-black text-emerald-400 truncate max-w-[130px]">
            {valorPrincipal}
          </div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4 fill-slate-950" />
          <span>Falar no WhatsApp</span>
        </a>
      </div>

      {/* Lightbox em Tela Cheia */}
      <ImovelGaleriaLightbox
        fotos={fotosList}
        initialIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      />
    </div>
  );
}
