'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Imovel, TipoImovel, FinalidadeImovel, StatusImovel, StatusVisita, Visita } from '@/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { MultiImageUpload } from '../ui/MultiImageUpload';
import { ImovelGaleriaLightbox } from './ImovelGaleriaLightbox';
import { CompartilharImovelModal } from './CompartilharImovelModal';
import { useData } from '@/context/DataContext';
import {
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Phone,
  User,
  Key,
  ShieldCheck,
  Check,
  Maximize2,
  Trees,
  Sparkles,
  MessageCircle,
  FileText,
  DollarSign,
  Tag,
  Pencil,
  Trash2,
  AlertTriangle,
  Save,
  X,
  Calendar,
  Clock,
  Plus,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Navigation,
  Images,
  Eye,
  ChevronLeft,
  ChevronRight,
  Share2,
  MoreVertical,
} from 'lucide-react';
import { formatCurrency, formatPhone, formatDateTime, getWhatsAppDirectLink, getImovelFotosList } from '@/lib/utils';
import { getGoogleMapsSearchUrl } from '@/lib/maps';

interface ImovelDetalhesModalProps {
  imovel: Imovel | null;
  isOpen: boolean;
  onClose: () => void;
  onAgendarVisita?: (imovel: Imovel) => void;
  onSelectVisita?: (visita: Visita) => void;
}

const CARACTERISTICAS_OPCOES = [
  'Água',
  'Ar condicionado',
  'Aquecimento solar',
  'Armários (cozinha/quarto)',
  'Churrasqueira',
  'Piscina',
  'Área de serviço',
  'Lavabo',
  'Varanda gourmet',
  'Academia',
  'Portaria 24h',
  'Elevador',
  'Quintal',
  'Playground',
  'Quadra poliesportiva',
  'Energia solar',
];

export function ImovelDetalhesModal({
  imovel,
  isOpen,
  onClose,
  onAgendarVisita,
  onSelectVisita,
}: ImovelDetalhesModalProps) {
  const { atualizarImovel, removerImovel, proprietarios, visitas } = useData();

  const [activeTab, setActiveTab] = useState<'detalhes' | 'visitas'>('detalhes');
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isCompartilharOpen, setIsCompartilharOpen] = useState(false);
  const [showMenuAcoes, setShowMenuAcoes] = useState(false);

  // Estados de Edição
  const [codigo, setCodigo] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<TipoImovel>('apartamento');
  const [finalidade, setFinalidade] = useState<FinalidadeImovel>('venda');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('São Paulo');
  const [estado, setEstado] = useState('SP');
  const [cep, setCep] = useState('');
  const [valorVenda, setValorVenda] = useState('');
  const [valorLocacao, setValorLocacao] = useState('');
  const [valorCondominio, setValorCondominio] = useState('');
  const [valorIptu, setValorIptu] = useState('');
  const [areaConstruida, setAreaConstruida] = useState('');
  const [areaTerreno, setAreaTerreno] = useState('');
  const [quartos, setQuartos] = useState('3');
  const [suites, setSuites] = useState('1');
  const [banheiros, setBanheiros] = useState('2');
  const [vagas, setVagas] = useState('2');
  const [descricaoComercial, setDescricaoComercial] = useState('');
  const [caracteristicasSelecionadas, setCaracteristicasSelecionadas] = useState<string[]>([]);
  const [proprietarioId, setProprietarioId] = useState<string | null>(null);
  const [proprietarioNome, setProprietarioNome] = useState('');
  const [proprietarioTelefone, setProprietarioTelefone] = useState('');
  const [proprietarioEmail, setProprietarioEmail] = useState('');
  const [showPropSuggestions, setShowPropSuggestions] = useState(false);
  const [observacoesChaves, setObservacoesChaves] = useState('');
  const [status, setStatus] = useState<StatusImovel>('disponivel');
  const [imagemUrl, setImagemUrl] = useState('');
  const [fotosUrls, setFotosUrls] = useState<string[]>([]);

  // Histórico de visitas vinculadas a este imóvel (individual ou parte de roteiro)
  const historicoVisitas = useMemo(() => {
    if (!imovel) return [];
    return visitas
      .filter((v) => v.imovel_id === imovel.id || v.imoveis_ids?.includes(imovel.id))
      .sort((a, b) => new Date(b.data_hora_visita).getTime() - new Date(a.data_hora_visita).getTime());
  }, [visitas, imovel]);

  // Sincroniza formulário quando o imóvel mudar ou entrar em modo edição
  useEffect(() => {
    if (imovel) {
      setCodigo(imovel.codigo || '');
      setTitulo(imovel.titulo || '');
      setTipo(imovel.tipo || 'apartamento');
      setFinalidade(imovel.finalidade || 'venda');
      setEndereco(imovel.endereco || '');
      setNumero(imovel.numero || '');
      setComplemento(imovel.complemento || '');
      setBairro(imovel.bairro || '');
      setCidade(imovel.cidade || 'São Paulo');
      setEstado(imovel.estado || 'SP');
      setCep(imovel.cep || '');
      setValorVenda(imovel.valor_venda ? String(imovel.valor_venda) : '');
      setValorLocacao(imovel.valor_locacao ? String(imovel.valor_locacao) : '');
      setValorCondominio(imovel.valor_condominio ? String(imovel.valor_condominio) : '');
      setValorIptu(imovel.valor_iptu ? String(imovel.valor_iptu) : '');
      setAreaConstruida(imovel.area_construida ? String(imovel.area_construida) : (imovel.area_util ? String(imovel.area_util) : ''));
      setAreaTerreno(imovel.area_terreno ? String(imovel.area_terreno) : '');
      setQuartos(String(imovel.quartos || 0));
      setSuites(String(imovel.suites || 0));
      setBanheiros(String(imovel.banheiros || 0));
      setVagas(String(imovel.vagas || 0));
      setDescricaoComercial(imovel.descricao_comercial || '');
      setCaracteristicasSelecionadas(imovel.caracteristicas || []);
      setProprietarioId(imovel.proprietario_id || null);
      setProprietarioNome(imovel.proprietario_nome || '');
      setProprietarioTelefone(imovel.proprietario_telefone || '');
      setProprietarioEmail(imovel.proprietario_email || '');
      setObservacoesChaves(imovel.observacoes_chaves || '');
      setStatus(imovel.status || 'disponivel');

      const initialFotos = imovel.fotos_urls && imovel.fotos_urls.length > 0
        ? imovel.fotos_urls
        : (imovel.imagem_url ? [imovel.imagem_url] : []);
      setFotosUrls(initialFotos);
      setImagemUrl(imovel.imagem_url || initialFotos[0] || '');
      setActivePhotoIndex(0);

      setIsEditing(false);
      setIsConfirmingDelete(false);
      setActiveTab('detalhes');
    }
  }, [imovel, isOpen]);

  if (!imovel) return null;

  const statusColors = {
    disponivel: 'success' as const,
    reservado: 'warning' as const,
    vendido: 'purple' as const,
    alugado: 'info' as const,
    inativo: 'default' as const,
  };

  const statusVisitaBadge = (st: StatusVisita) => {
    switch (st) {
      case 'agendada':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Agendada
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Cancelada
          </span>
        );
      case 'concluida':
      case 'reagendada':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Realizada
          </span>
        );
      case 'nao_compareceu':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Não Compareceu
          </span>
        );
      default:
        return null;
    }
  };

  const directWhatsAppOwner = getWhatsAppDirectLink(
    imovel.proprietario_telefone,
    `Olá, ${imovel.proprietario_nome}! Gostaria de falar sobre o seu imóvel ${imovel.titulo} (${imovel.codigo || ''}).`
  );

  // Fotos da galeria e capa de visualização (garante 5 fotos para carrossel)
  const fotosList = getImovelFotosList(imovel);
  const capaVisualizacao = imovel.imagem_url || fotosList[0] || '';
  const activePhoto = fotosList[activePhotoIndex] || capaVisualizacao;

  // Cálculo automático do valor do m²
  const areaConstruidaOuUtil = imovel.area_construida || imovel.area_util || 0;
  const valorMetroQuadrado =
    imovel.valor_venda && areaConstruidaOuUtil > 0
      ? Math.round(imovel.valor_venda / areaConstruidaOuUtil)
      : null;

  const defaultCaracteristicas = [
    'Água',
    'Ar condicionado',
    'Aquecimento solar',
    'Armários planejados',
    'Churrasqueira',
    'Piscina',
    'Área de serviço',
    'Lavabo',
    'Varanda gourmet',
    'Portaria 24h',
    'Elevador',
  ];

  const caracteristicasExibidas =
    imovel.caracteristicas && imovel.caracteristicas.length > 0
      ? imovel.caracteristicas
      : defaultCaracteristicas.slice(0, 6);

  const sugestoesProprietarios = proprietarios.filter(
    (p) =>
      p.nome.toLowerCase().includes(proprietarioNome.toLowerCase()) ||
      p.telefone.includes(proprietarioNome)
  );

  const toggleCaracteristica = (item: string) => {
    setCaracteristicasSelecionadas((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !endereco || !bairro || !proprietarioNome || !proprietarioTelefone) return;

    setIsSubmitting(true);
    try {
      await atualizarImovel(imovel.id, {
        codigo,
        titulo,
        tipo,
        finalidade,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        valor_venda: valorVenda ? parseFloat(valorVenda) : null,
        valor_locacao: valorLocacao ? parseFloat(valorLocacao) : null,
        valor_condominio: valorCondominio ? parseFloat(valorCondominio) : null,
        valor_iptu: valorIptu ? parseFloat(valorIptu) : null,
        area_construida: areaConstruida ? parseFloat(areaConstruida) : null,
        area_util: areaConstruida ? parseFloat(areaConstruida) : null,
        area_terreno: areaTerreno ? parseFloat(areaTerreno) : null,
        quartos: parseInt(quartos, 10) || 0,
        suites: parseInt(suites, 10) || 0,
        banheiros: parseInt(banheiros, 10) || 0,
        vagas: parseInt(vagas, 10) || 0,
        descricao_comercial: descricaoComercial,
        caracteristicas: caracteristicasSelecionadas,
        proprietario_id: proprietarioId || undefined,
        proprietario_nome: proprietarioNome,
        proprietario_telefone: proprietarioTelefone,
        proprietario_email: proprietarioEmail,
        observacoes_chaves: observacoesChaves,
        status,
        imagem_url: imagemUrl || fotosUrls[0] || '',
        fotos_urls: fotosUrls.length > 0 ? fotosUrls : (imagemUrl ? [imagemUrl] : []),
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Erro ao editar imóvel:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExcluirImovel = async () => {
    setIsSubmitting(true);
    try {
      await removerImovel(imovel.id);
      onClose();
    } catch (err) {
      console.error('Erro ao excluir imóvel:', err);
    } finally {
      setIsSubmitting(false);
      setIsConfirmingDelete(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isConfirmingDelete}
        onClose={onClose}
        title={isEditing ? 'Editar Imóvel' : imovel.titulo}
        subtitle={
          isEditing
            ? `Alterando dados do imóvel ${imovel.codigo || ''}`
            : `${imovel.codigo || 'SEM-COD'} • ${imovel.bairro}, ${imovel.cidade} - ${imovel.estado}`
        }
        maxWidth="2xl"
      >
        {/* ─── MODAL EM MODO EDIÇÃO ─── */}
        {isEditing ? (
          <form onSubmit={handleSalvarEdicao} className="space-y-5 pt-1">
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-xl">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Pencil className="w-4 h-4 text-emerald-600" /> Modo de Edição Ativo
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold"
              >
                Cancelar Edição
              </Button>
            </div>

            {/* Identificação */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Input
                  label="Código"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
                <Select
                  label="Tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoImovel)}
                >
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa</option>
                  <option value="cobertura">Cobertura</option>
                  <option value="comercial">Comercial</option>
                  <option value="terreno">Terreno</option>
                </Select>
                <Select
                  label="Finalidade"
                  value={finalidade}
                  onChange={(e) => setFinalidade(e.target.value as FinalidadeImovel)}
                >
                  <option value="venda">Venda</option>
                  <option value="locacao">Locação</option>
                  <option value="ambos">Venda e Locação</option>
                </Select>
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusImovel)}
                >
                  <option value="disponivel">Disponível</option>
                  <option value="reservado">Reservado</option>
                  <option value="vendido">Vendido</option>
                  <option value="alugado">Alugado</option>
                  <option value="inativo">Inativo</option>
                </Select>
              </div>

              <Input
                label="Título do Anúncio *"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            {/* Localização */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Endereço &amp; Localização
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Endereço *"
                    required
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                  />
                </div>
                <Input
                  label="Número"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Input
                  label="Complemento"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                />
                <Input
                  label="Bairro *"
                  required
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                />
                <Input
                  label="Cidade *"
                  required
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                />
                <Input
                  label="Estado *"
                  required
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                />
              </div>
            </div>

            {/* Financeiro */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Valores (R$)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Input
                  label="Valor Venda (R$)"
                  type="number"
                  value={valorVenda}
                  onChange={(e) => setValorVenda(e.target.value)}
                />
                <Input
                  label="Valor Locação (R$)"
                  type="number"
                  value={valorLocacao}
                  onChange={(e) => setValorLocacao(e.target.value)}
                />
                <Input
                  label="Condomínio (R$)"
                  type="number"
                  value={valorCondominio}
                  onChange={(e) => setValorCondominio(e.target.value)}
                />
                <Input
                  label="IPTU (R$)"
                  type="number"
                  value={valorIptu}
                  onChange={(e) => setValorIptu(e.target.value)}
                />
              </div>
            </div>

            {/* Métricas */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Métricas &amp; Cômodos
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Input
                  label="Área Const. (m²)"
                  type="number"
                  value={areaConstruida}
                  onChange={(e) => setAreaConstruida(e.target.value)}
                />
                <Input
                  label="Área Terreno (m²)"
                  type="number"
                  value={areaTerreno}
                  onChange={(e) => setAreaTerreno(e.target.value)}
                />
                <Input
                  label="Quartos"
                  type="number"
                  value={quartos}
                  onChange={(e) => setQuartos(e.target.value)}
                />
                <Input
                  label="Suítes"
                  type="number"
                  value={suites}
                  onChange={(e) => setSuites(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Banheiros"
                  type="number"
                  value={banheiros}
                  onChange={(e) => setBanheiros(e.target.value)}
                />
                <Input
                  label="Vagas"
                  type="number"
                  value={vagas}
                  onChange={(e) => setVagas(e.target.value)}
                />
              </div>
            </div>

            {/* Descrição e Comodidades */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Textarea
                label="Descrição Comercial"
                rows={3}
                value={descricaoComercial}
                onChange={(e) => setDescricaoComercial(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Comodidades:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CARACTERISTICAS_OPCOES.map((item) => {
                    const isSelected = caracteristicasSelecionadas.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleCaracteristica(item)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Galeria de Fotos (Upload Múltiplo) */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <MultiImageUpload
                label="Galeria de Fotos do Imóvel"
                fotos={fotosUrls}
                capaUrl={imagemUrl}
                onChange={(novasFotos, novaCapa) => {
                  setFotosUrls(novasFotos);
                  setImagemUrl(novaCapa);
                }}
              />
            </div>

            {/* Proprietário (Uso Interno com Autocomplete) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Proprietário &amp; Acesso — Uso Interno
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nome do Proprietário *
                  </label>
                  <input
                    required
                    type="text"
                    value={proprietarioNome}
                    onChange={(e) => {
                      setProprietarioNome(e.target.value);
                      setShowPropSuggestions(true);
                    }}
                    onFocus={() => setShowPropSuggestions(true)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                  {showPropSuggestions && proprietarioNome.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-40 overflow-y-auto">
                      {sugestoesProprietarios.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setProprietarioId(p.id);
                            setProprietarioNome(p.nome);
                            setProprietarioTelefone(p.telefone);
                            setProprietarioEmail(p.email || '');
                            setShowPropSuggestions(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-emerald-950/40 flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-100 block">{p.nome}</span>
                            <span className="text-[11px] text-slate-400">{p.telefone}</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/20">
                            Selecionar
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Input
                  label="WhatsApp do Proprietário *"
                  required
                  value={proprietarioTelefone}
                  onChange={(e) => setProprietarioTelefone(e.target.value)}
                />
                <Input
                  label="E-mail do Proprietário"
                  type="email"
                  value={proprietarioEmail}
                  onChange={(e) => setProprietarioEmail(e.target.value)}
                />
              </div>

              <Textarea
                label="Instruções sobre Chaves & Portaria"
                value={observacoesChaves}
                onChange={(e) => setObservacoesChaves(e.target.value)}
                rows={2}
              />
            </div>

            {/* Botões de Ação da Edição */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                <Save className="w-4 h-4 mr-1.5" />
                Salvar Alterações
              </Button>
            </div>
          </form>
        ) : (
          /* ─── MODAL EM MODO VISUALIZAÇÃO COM ABAS ─── */
          <div className="space-y-5 pt-1">
            {/* Seletor de Abas Internas: [ Detalhes do Imóvel ] | [ Histórico de Visitas (N) ] */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveTab('detalhes')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'detalhes'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  Detalhes do Imóvel
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('visitas')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'visitas'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-sky-500" />
                  Histórico de Visitas ({historicoVisitas.length})
                </button>
              </div>

              {/* Botões de Ação do Imóvel: [ 📲 Compartilhar ] e Menu [ ... ] */}
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCompartilharOpen(true)}
                  className="font-bold text-xs shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  title="Compartilhar link público e enviar mensagem pronta para cliente no WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" />
                  <span>Compartilhar Imóvel</span>
                </Button>

                {/* Menu de 3 Pontos para Editar e Excluir */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMenuAcoes((prev) => !prev)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
                    title="Mais opções do imóvel"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showMenuAcoes && (
                    <div
                      className="absolute right-0 top-full mt-1.5 z-30 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-150"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenuAcoes(false);
                          setIsEditing(true);
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Editar Imóvel</span>
                      </button>
                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenuAcoes(false);
                          setIsConfirmingDelete(true);
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Excluir Imóvel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── ABA 1: DETALHES DO IMÓVEL ── */}
            {activeTab === 'detalhes' && (
              <div className="space-y-6">
                {/* 1. Imagem de Capa, Badges e Carrossel da Galeria */}
                <div className="space-y-2.5">
                  <div
                    onClick={() => fotosList.length > 0 && setLightboxIndex(activePhotoIndex)}
                    className="relative h-64 sm:h-80 w-full rounded-2xl bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner border border-slate-200/80 dark:border-slate-800 group cursor-pointer"
                  >
                    {activePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activePhoto}
                        alt={`${imovel.titulo} - Foto ${activePhotoIndex + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                        <Building2 className="w-14 h-14 stroke-[1.5]" />
                      </div>
                    )}

                    {/* Setas de Navegação do Carrossel */}
                    {fotosList.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePhotoIndex((prev) => (prev - 1 + fotosList.length) % fotosList.length);
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all hover:scale-110 shadow-lg z-20 cursor-pointer"
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all hover:scale-110 shadow-lg z-20 cursor-pointer"
                          title="Próxima foto"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Indicadores de bolinhas / dots no rodapé da imagem */}
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

                    {/* Badges Topo Esquerda: Apenas Código */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                      <span className="px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white font-mono text-xs font-bold shadow-md">
                        {imovel.codigo || 'SEM-COD'}
                      </span>
                    </div>

                    {/* Badges Topo Direita: Status / Disponível e Contador */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                      {fotosList.length > 1 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white font-mono text-xs font-bold shadow-md">
                          <Images className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{activePhotoIndex + 1} / {fotosList.length}</span>
                        </div>
                      )}
                      <Badge variant={statusColors[imovel.status] || 'default'} size="sm" className="shadow-md">
                        {imovel.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Botão de Zoom no Canto Inferior Direito */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-md transition-all group-hover:scale-105 shadow-md z-10">
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Zoom</span>
                    </div>
                  </div>

                  {/* Tags Principais do Imóvel: Tipo e Finalidade */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                      {imovel.tipo} • {imovel.finalidade === 'ambos' ? 'VENDA E LOCAÇÃO' : imovel.finalidade}
                    </span>
                  </div>

                  {/* Faixa de Miniaturas Navegáveis */}
                  {fotosList.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                      {fotosList.map((url, idx) => {
                        const isSelected = idx === activePhotoIndex;
                        return (
                          <button
                            key={url + idx}
                            type="button"
                            onClick={() => setActivePhotoIndex(idx)}
                            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer shadow-xs ${
                              isSelected
                                ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-105 shadow-md'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 opacity-70 hover:opacity-100'
                            }`}
                            title={`Visualizar foto ${idx + 1}`}
                          >
                            <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 right-0 bg-black/70 text-[9px] font-mono text-white px-1">
                              {idx + 1}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Valores Financeiros e Valor do m² */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Valor do Imóvel
                    </span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {imovel.valor_venda ? formatCurrency(imovel.valor_venda) : ''}
                      {imovel.valor_venda && imovel.valor_locacao ? ' | ' : ''}
                      {imovel.valor_locacao ? `${formatCurrency(imovel.valor_locacao)}/mês` : ''}
                      {!imovel.valor_venda && !imovel.valor_locacao && 'Sob Consulta'}
                    </div>

                    {/* Valor do m² automatizado */}
                    {valorMetroQuadrado && (
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-emerald-500" />
                        <span>Valor do m²:</span>
                        <strong className="text-slate-700 dark:text-slate-300">
                          {formatCurrency(valorMetroQuadrado)} / m²
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Condomínio e IPTU */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {imovel.valor_condominio && (
                      <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Condomínio</span>
                        <strong className="text-slate-900 dark:text-slate-100">
                          {formatCurrency(imovel.valor_condominio)}/mês
                        </strong>
                      </div>
                    )}
                    {imovel.valor_iptu && (
                      <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">IPTU</span>
                        <strong className="text-slate-900 dark:text-slate-100">
                          {formatCurrency(imovel.valor_iptu)}/mês
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Métricas Físicas com Ícones */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Métricas &amp; Espaços
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <BedDouble className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                      <span className="text-[10px] font-semibold text-slate-400 block">Quartos</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">{imovel.quartos}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <Sparkles className="w-4 h-4 text-sky-500 mx-auto mb-1" />
                      <span className="text-[10px] font-semibold text-slate-400 block">Suítes</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">{imovel.suites ?? 0}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <Bath className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                      <span className="text-[10px] font-semibold text-slate-400 block">Banheiros</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">{imovel.banheiros}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <Car className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                      <span className="text-[10px] font-semibold text-slate-400 block">Vagas</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">{imovel.vagas}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <Maximize2 className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                      <span className="text-[10px] font-semibold text-slate-400 block">Área Const.</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {areaConstruidaOuUtil ? `${areaConstruidaOuUtil} m²` : '—'}
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <Trees className="w-4 h-4 text-teal-500 mx-auto mb-1" />
                      <span className="text-[10px] font-semibold text-slate-400 block">Terreno</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {imovel.area_terreno ? `${imovel.area_terreno} m²` : '—'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 4. Endereço Completo */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300 min-w-0">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        {imovel.endereco}{imovel.numero ? `, ${imovel.numero}` : ''}
                        {imovel.complemento ? ` (${imovel.complemento})` : ''}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        {imovel.bairro} — {imovel.cidade}/{imovel.estado} {imovel.cep ? `• CEP: ${imovel.cep}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
                    <a
                      href={getGoogleMapsSearchUrl(imovel)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                      title="Abrir localização no Google Maps"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      <span>📍 Mapa</span>
                    </a>
                  </div>
                </div>

                {/* 5. Descrição Comercial */}
                {imovel.descricao_comercial && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      Descrição Comercial
                    </span>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {imovel.descricao_comercial}
                    </div>
                  </div>
                )}

                {/* 6. Características & Comodidades (Checkmarks Verdes) */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Características &amp; Comodidades
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {caracteristicasExibidas.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-xs font-medium text-slate-800 dark:text-slate-200"
                      >
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Proprietário & Acesso (Uso Interno com Destaque de Segurança) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black tracking-wider uppercase text-slate-200">
                        Proprietário &amp; Acesso — Uso Interno
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Sigiloso
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Proprietário</span>
                      <p className="font-bold text-slate-100 text-sm">{imovel.proprietario_nome}</p>
                      <p className="text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {formatPhone(imovel.proprietario_telefone)}
                      </p>
                      {imovel.proprietario_email && (
                        <p className="text-slate-400 text-[11px] truncate">{imovel.proprietario_email}</p>
                      )}
                    </div>

                    <div className="space-y-1 sm:border-l sm:border-slate-800 sm:pl-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Instruções de Chaves</span>
                      <div className="flex items-start gap-1.5 text-slate-300">
                        <Key className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs leading-relaxed">
                          {imovel.observacoes_chaves || 'Chave sob responsabilidade do corretor de plantão.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
                    <a
                      href={directWhatsAppOwner}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp Proprietário
                    </a>

                    {onAgendarVisita && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onClose();
                          onAgendarVisita(imovel);
                        }}
                        className="text-xs font-bold text-slate-200 border-slate-700 hover:bg-slate-800"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Agendar Visita Neste Imóvel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── ABA 2: HISTÓRICO DE VISITAS ── */}
            {activeTab === 'visitas' && (
              <div className="space-y-4">
                {/* Cabeçalho da Aba de Visitas com Botão de Atalho */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <History className="w-4 h-4 text-emerald-500" />
                      Histórico Cronológico de Visitas
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Total de <strong>{historicoVisitas.length}</strong> {historicoVisitas.length === 1 ? 'visita registrada' : 'visitas registradas'} para este imóvel.
                    </p>
                  </div>

                  {onAgendarVisita && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => onAgendarVisita(imovel)}
                      className="shadow-sm font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Agendar Nova Visita
                    </Button>
                  )}
                </div>

                {/* Lista de Visitas (Estilo Linha do Tempo) */}
                {historicoVisitas.length === 0 ? (
                  <div className="p-10 text-center space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      Nenhuma visita registrada ainda
                    </h5>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Este imóvel ainda não possui compromissos na agenda. Clique no botão abaixo para criar a primeira visita.
                    </p>
                    {onAgendarVisita && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onAgendarVisita(imovel)}
                        className="font-bold text-xs mt-2"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Agendar Primeira Visita
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historicoVisitas.map((v) => {
                      const waCliente = v.cliente?.telefone
                        ? getWhatsAppDirectLink(
                            v.cliente.telefone,
                            `Olá, ${v.cliente.nome}! Sobre sua visita ao imóvel ${imovel.titulo}...`
                          )
                        : null;

                      return (
                        <div
                          key={v.id}
                          onClick={() => onSelectVisita?.(v)}
                          className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all space-y-3 ${
                            onSelectVisita ? 'cursor-pointer hover:border-emerald-500 hover:shadow-md group' : ''
                          }`}
                        >
                          {/* Cabeçalho do Card de Visita: Data, Horário e Status */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                <Clock className="w-4 h-4 text-emerald-500" />
                              </div>
                              <div>
                                <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                                  {formatDateTime(v.data_hora_visita)}
                                </span>
                                <span className="text-[11px] text-slate-400 block">
                                  Corretor: <strong>{v.corretor_nome}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {((v.imoveis_ids && v.imoveis_ids.length > 1) || (v.imoveis && v.imoveis.length > 1)) && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  Roteiro de {v.imoveis?.length || v.imoveis_ids?.length} Imóveis
                                </span>
                              )}
                              {statusVisitaBadge(v.status)}
                            </div>
                          </div>

                          {/* Dados do Cliente Visitante */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Cliente Visitante
                              </span>
                              <p className="font-bold text-slate-800 dark:text-slate-200">
                                {v.cliente?.nome || 'Cliente não identificado'}
                              </p>
                              {v.cliente?.telefone && (
                                <p className="text-slate-500 font-mono text-[11px]">
                                  {formatPhone(v.cliente.telefone)}
                                </p>
                              )}
                            </div>

                            {waCliente && (
                              <a
                                href={waCliente}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200/60 dark:border-emerald-800/60 self-start sm:self-center transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                                WhatsApp Cliente
                              </a>
                            )}
                          </div>

                          {/* Observações / Feedback se houver */}
                          {(v.observacoes || v.feedback_cliente) && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {v.observacoes && (
                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60">
                                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                    Notas Internas:
                                  </span>
                                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                                    {v.observacoes}
                                  </p>
                                </div>
                              )}

                              {v.feedback_cliente && (
                                <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase">
                                    Feedback do Cliente:
                                  </span>
                                  <p className="text-emerald-950 dark:text-emerald-200 mt-0.5">
                                    {v.feedback_cliente}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ─── MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (DUPLA CHECAGEM) ─── */}
      <Modal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        title="Confirmar Exclusão de Imóvel"
        maxWidth="md"
      >
        <div className="space-y-4 pt-1">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs text-rose-950 dark:text-rose-200">
              <h4 className="font-bold text-sm text-rose-900 dark:text-rose-100">
                Tem certeza que deseja excluir este imóvel?
              </h4>
              <p className="leading-relaxed">
                Você está prestes a excluir permanentemente o imóvel{' '}
                <strong className="text-slate-900 dark:text-white">
                  &quot;{imovel.titulo}&quot; ({imovel.codigo || ''})
                </strong>.
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold pt-1">
                ⚠️ Regra de integridade: Se este for o único imóvel vinculado a{' '}
                <strong>{imovel.proprietario_nome}</strong>, o cadastro do proprietário também será removido automaticamente dos bastidores.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsConfirmingDelete(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleExcluirImovel}
              isLoading={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Sim, Excluir Imóvel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Compartilhamento / Envio no WhatsApp */}
      <CompartilharImovelModal
        imovel={imovel}
        isOpen={isCompartilharOpen}
        onClose={() => setIsCompartilharOpen(false)}
      />

      {/* Lightbox de Galeria em Tela Cheia */}
      <ImovelGaleriaLightbox
        isOpen={lightboxIndex !== null}
        fotos={fotosList}
        initialIndex={lightboxIndex || 0}
        imovelTitulo={imovel.titulo}
        imovelCodigo={imovel.codigo}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
}
