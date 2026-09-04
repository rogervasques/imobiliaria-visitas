'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Visita, Imovel, StatusDisparoWhatsApp, LogMensagem, ConfiguracaoWhatsApp } from '@/types';
import { ImovelDetalhesModal } from '../imoveis/ImovelDetalhesModal';
import { EditarVisitaModal } from './EditarVisitaModal';
import {
  MapPin,
  Phone,
  Building2,
  Tag,
  FileText,
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  User,
  Calendar,
  Pencil,
  FileDown,
  ShieldCheck,
  Volume2,
  Image as ImageIcon,
  Lock,
  Key,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatDateTime, formatPhone, getWhatsAppDirectLink, formatCurrency } from '@/lib/utils';
import { getGoogleMapsSearchUrl } from '@/lib/maps';
import { gerarRelatorioAtendimentoPdf, getVisitaLogs } from '@/lib/pdfDossieGenerator';
import { buildTemplateContext, compileTemplate } from '@/lib/whatsapp';
import { mockConfigWhatsApp } from '@/lib/mockData';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

interface VisitaDetalhesModalProps {
  visita: Visita | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Ícone Oficial do WhatsApp em SVG
 */
function WhatsAppIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.04 3.68C14.25 3.68 16.31 4.54 17.87 6.1C19.42 7.66 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 14.41C16.31 14.29 15.09 13.69 14.86 13.6C14.63 13.52 14.47 13.48 14.3 13.73C14.13 13.98 13.66 14.54 13.51 14.71C13.37 14.87 13.22 14.89 12.97 14.77C12.72 14.65 11.93 14.39 10.98 13.55C10.24 12.89 9.74 12.08 9.6 11.83C9.45 11.58 9.58 11.45 9.71 11.32C9.82 11.21 9.96 11.03 10.08 10.89C10.21 10.74 10.25 10.64 10.33 10.47C10.41 10.31 10.37 10.16 10.31 10.04C10.25 9.92 9.75 8.7 9.55 8.2C9.35 7.71 9.15 7.78 8.99 7.77C8.85 7.76 8.68 7.76 8.52 7.76C8.35 7.76 8.08 7.82 7.85 8.07C7.62 8.32 6.98 8.92 6.98 10.14C6.98 11.36 7.87 12.53 7.99 12.7C8.12 12.86 9.74 15.36 12.22 16.43C12.81 16.69 13.27 16.84 13.63 16.96C14.22 17.15 14.76 17.12 15.19 17.06C15.67 16.99 16.66 16.46 16.86 15.89C17.07 15.31 17.07 14.82 17.01 14.71C16.95 14.61 16.81 14.54 16.56 14.41Z" />
    </svg>
  );
}

/**
 * Monta o link direto do WhatsApp com mensagem pronta preenchida para cada tipo de disparo
 */
function getManualWhatsAppLink(
  visita: Visita,
  tipo:
    | 'confirmacao_cliente'
    | 'confirmacao_proprietario'
    | 'lembrete_cliente'
    | 'lembrete_proprietario'
    | 'pos_visita_cliente'
    | 'comprovacao_proprietario',
  configWhatsApp?: ConfiguracaoWhatsApp
): string {
  const isCliente = tipo.includes('cliente');
  const telefone = isCliente
    ? visita.cliente?.telefone
    : (visita.imoveis?.[0]?.proprietario_telefone || visita.imovel?.proprietario_telefone);

  if (!telefone) return '#';

  const ctx = buildTemplateContext(visita);
  let template = '';

  switch (tipo) {
    case 'confirmacao_cliente':
      template = configWhatsApp?.template_confirmacao_cliente || mockConfigWhatsApp.template_confirmacao_cliente;
      break;
    case 'confirmacao_proprietario':
      template = configWhatsApp?.template_confirmacao_proprietario || mockConfigWhatsApp.template_confirmacao_proprietario;
      break;
    case 'lembrete_cliente':
      template = configWhatsApp?.template_lembrete_cliente || mockConfigWhatsApp.template_lembrete_cliente;
      break;
    case 'lembrete_proprietario':
      template = configWhatsApp?.template_lembrete_proprietario || mockConfigWhatsApp.template_lembrete_proprietario;
      break;
    case 'pos_visita_cliente':
      template = configWhatsApp?.template_pos_visita_cliente || mockConfigWhatsApp.template_pos_visita_cliente;
      break;
    case 'comprovacao_proprietario':
      template =
        configWhatsApp?.template_comprovacao_proprietario ||
        mockConfigWhatsApp.template_comprovacao_proprietario ||
        'Olá, {proprietario_nome}! Confirmamos que a visita ao seu imóvel *{imovel_titulo}* foi realizada com sucesso nesta data por intermédio do corretor *{corretor_nome}*, acompanhado do(a) cliente *{cliente_nome}*.';
      break;
  }

  const mensagemFormatada = compileTemplate(template, ctx);
  return getWhatsAppDirectLink(telefone, mensagemFormatada);
}

function RecipientStatusRow({
  label,
  status,
  ativo,
  whatsappLink,
}: {
  label: string;
  status?: StatusDisparoWhatsApp;
  ativo?: boolean;
  whatsappLink?: string;
}) {
  const hasLink = Boolean(whatsappLink && whatsappLink !== '#');

  const waActionBtn = hasLink ? (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-90 text-white transition-all shadow-2xs shrink-0 cursor-pointer"
      title={`Disparo Manual: Abrir WhatsApp com mensagem preenchida (${label})`}
    >
      <WhatsAppIcon className="w-3 h-3 text-white fill-white" />
    </a>
  ) : null;

  // 1. Inativo ou N/A (Desmarcado na criação da visita)
  if (ativo === false || status === 'ignorado' || status === 'inativo') {
    return (
      <div className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-slate-500 dark:text-slate-400 truncate">{label}:</span>
          {waActionBtn}
        </div>
        <div className="shrink-0 flex items-center">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
            <span className="text-[10px]">🚫</span> N/A
          </span>
        </div>
      </div>
    );
  }

  // 2. Falha
  if (status === 'falha') {
    return (
      <div className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{label}:</span>
          {waActionBtn}
        </div>
        <div className="shrink-0 flex items-center">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" /> Falha
          </span>
        </div>
      </div>
    );
  }

  // 3. Visualizado
  if (status === 'visualizado' || status === 'lido') {
    return (
      <div className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{label}:</span>
          {waActionBtn}
        </div>
        <div className="shrink-0 flex items-center">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400">
            <CheckCheck className="w-3.5 h-3.5 text-sky-500 stroke-[2.5]" /> Visualizado
          </span>
        </div>
      </div>
    );
  }

  // 4. Entregue
  if (status === 'entregue') {
    return (
      <div className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{label}:</span>
          {waActionBtn}
        </div>
        <div className="shrink-0 flex items-center">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <CheckCheck className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" /> Entregue
          </span>
        </div>
      </div>
    );
  }

  // 5. Enviado
  if (status === 'enviado') {
    return (
      <div className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{label}:</span>
          {waActionBtn}
        </div>
        <div className="shrink-0 flex items-center">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" /> Enviado
          </span>
        </div>
      </div>
    );
  }

  // 6. Agendado / Pendente
  return (
    <div className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{label}:</span>
        {waActionBtn}
      </div>
      <div className="shrink-0 flex items-center">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
          <span className="text-[10px]">⏳</span> Agendado
        </span>
      </div>
    </div>
  );
}

function LogItemCard({ log }: { log: LogMensagem }) {
  return (
    <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={
              log.remetente_tipo === 'CLIENTE'
                ? 'px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                : log.remetente_tipo === 'PROPRIETARIO'
                ? 'px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : log.remetente_tipo === 'CORRETOR'
                ? 'px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                : 'px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }
          >
            {log.remetente_tipo}
          </span>
          {log.remetente_nome && (
            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
              {log.remetente_nome}
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
        {log.conteudo_texto}
      </p>

      {log.tipo_midia === 'audio' && log.midia_url && (
        <div className="pt-1">
          <a
            href={log.midia_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 font-bold text-[11px] hover:underline"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-600" />
            <span>[🔊 Áudio de Atendimento • Ouvir Gravação]</span>
          </a>
        </div>
      )}

      {log.tipo_midia === 'imagem' && log.midia_url && (
        <div className="pt-1">
          <a
            href={log.midia_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-[11px] hover:underline"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>[🖼️ Foto da Visita/Imóvel • Ver Anexo]</span>
          </a>
        </div>
      )}

      <div className="text-[9px] font-mono text-slate-400 truncate pt-0.5">
        Meta ID: {log.message_id}
      </div>
    </div>
  );
}

export function VisitaDetalhesModal({ visita, isOpen, onClose }: VisitaDetalhesModalProps) {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const { configWhatsApp } = useData();
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [logs, setLogs] = useState<LogMensagem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Estados dos Accordions (Ocultos por padrão)
  const [openCliente, setOpenCliente] = useState(false);
  const [openProprietario, setOpenProprietario] = useState(false);

  // Busca os logs descriptografados em memória no servidor via API Route
  const carregarLogsReais = useCallback(async () => {
    if (!visita?.id) return;
    setIsLoadingLogs(true);
    try {
      const res = await fetch(`/api/visitas/${visita.id}/logs`);
      const data = await res.json();
      if (data.success && Array.isArray(data.logs) && data.logs.length > 0) {
        setLogs(data.logs);
      } else {
        setLogs(getVisitaLogs(visita));
      }
    } catch {
      setLogs(getVisitaLogs(visita));
    } finally {
      setIsLoadingLogs(false);
    }
  }, [visita]);

  useEffect(() => {
    if (isOpen && visita?.id) {
      carregarLogsReais();
    }
  }, [isOpen, visita?.id, carregarLogsReais]);

  if (!visita) return null;

  const imoveisLista: Imovel[] = (visita.imoveis && visita.imoveis.length > 0)
    ? visita.imoveis
    : visita.imovel
    ? [visita.imovel]
    : [];

  const cliente = visita.cliente;

  const statusLabels: Record<string, string> = {
    agendada: 'Agendada',
    cancelada: 'Cancelada',
    reagendada: 'Realizada',
    concluida: 'Realizada',
    nao_compareceu: 'Não Compareceu',
  };

  const statusColors: Record<string, string> = {
    agendada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    cancelada: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    reagendada: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    concluida: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    nao_compareceu: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  };

  const waCliente = cliente?.telefone
    ? getWhatsAppDirectLink(cliente.telefone, `Olá, ${cliente.nome}! Sobre nossa visita agendada pela EasyMob.`)
    : '#';

  // Separação dos canais de auditoria: Cliente vs. Proprietário
  const allLogs = logs.length > 0 ? logs : getVisitaLogs(visita);
  const logsCliente = allLogs.filter(
    (log) =>
      log.remetente_tipo === 'CLIENTE' ||
      (log.remetente_tipo === 'SISTEMA' && !log.remetente_nome?.toLowerCase().includes('propriet') && !log.conteudo_texto?.toLowerCase().includes('ao seu imóvel') && !log.conteudo_texto?.toLowerCase().includes('proprietário')) ||
      (log.remetente_tipo === 'CORRETOR' && !log.remetente_nome?.toLowerCase().includes('propriet') && !log.conteudo_texto?.toLowerCase().includes('ao seu imóvel'))
  );
  const logsProprietario = allLogs.filter(
    (log) =>
      log.remetente_tipo === 'PROPRIETARIO' ||
      (log.remetente_tipo === 'SISTEMA' && (log.remetente_nome?.toLowerCase().includes('propriet') || log.conteudo_texto?.toLowerCase().includes('ao seu imóvel') || log.conteudo_texto?.toLowerCase().includes('proprietário'))) ||
      (log.remetente_tipo === 'CORRETOR' && (log.remetente_nome?.toLowerCase().includes('propriet') || log.conteudo_texto?.toLowerCase().includes('ao seu imóvel')))
  );

  const handleDownloadDossie = (filtro: 'cliente' | 'proprietario' | 'todos' = 'todos') => {
    gerarRelatorioAtendimentoPdf({
      visita: {
        ...visita,
        logs_mensagens: allLogs,
      },
      imobiliariaNome: currentTenant?.nome || user?.name || 'EasyMob Imobiliária',
      corretorTelefone: visita.corretor_telefone || '(31) 99887-7665',
      instanciaOrigem: user?.instance_name || configWhatsApp?.instancia_nome || 'easymob',
      filtroDestinatario: filtro,
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={imoveisLista.length > 1 ? `Roteiro de Visitas (${imoveisLista.length} Imóveis)` : 'Detalhes da Visita'}
        subtitle={imoveisLista.length > 1 ? `Cliente: ${cliente?.nome || '—'}` : (imoveisLista[0]?.titulo || 'Compromisso')}
        maxWidth="3xl"
        headerActions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs border border-slate-200 dark:border-slate-700"
              title="Editar Visita"
            >
              <Pencil className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Editar</span>
            </button>
          </div>
        }
      >
        <div className="space-y-5 pb-1 max-h-[80vh] overflow-y-auto pr-1">
          {/* ── Status e Horário Condensados em Linha Única ── */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[visita.status] || statusColors.agendada}`}>
                {statusLabels[visita.status] || visita.status}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{formatDateTime(visita.data_hora_visita)}</span>
              </div>
            </div>
            {visita.corretor_nome && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <User className="w-3 h-3 text-slate-400" />
                <span>Corretor: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{visita.corretor_nome}</strong></span>
              </div>
            )}
          </div>

          {/* ── SEÇÃO 1: ROTEIRO DE IMÓVEIS ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-500" />
                {imoveisLista.length > 1 ? `Roteiro de Imóveis (${imoveisLista.length} locais)` : 'Imóvel da Visita'}
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Clique no card para abrir os detalhes
              </span>
            </div>

            <div className="space-y-3">
              {imoveisLista.map((im, index) => {
                const waProp = im.proprietario_telefone
                  ? getWhatsAppDirectLink(im.proprietario_telefone, `Olá, ${im.proprietario_nome}! Sobre a visita agendada pela EasyMob ao imóvel "${im.titulo}".`)
                  : '#';
                return (
                  <div
                    key={im.id || index}
                    onClick={() => setImovelSelecionado(im)}
                    role="button"
                    tabIndex={0}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 cursor-pointer hover:border-emerald-500 hover:shadow-md hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all duration-200 group text-left"
                  >
                    <div className="flex flex-col sm:flex-row gap-3.5 items-start">
                      <div className="relative w-full sm:w-28 h-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group-hover:ring-2 group-hover:ring-emerald-500 transition-all">
                        {im.imagem_url ? (
                          <img src={im.imagem_url} alt={im.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Building2 className="w-6 h-6" />
                          </div>
                        )}
                        <div className="absolute top-1.5 left-1.5 bg-emerald-600 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {im.titulo}
                          </h4>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{im.endereco}, {im.numero || 'S/N'} - {im.bairro}, {im.cidade}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                            <a
                              href={getGoogleMapsSearchUrl(im)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                              title="Abrir no Google Maps"
                            >
                              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Maps</span>
                            </a>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {im.valor_venda && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                              <Tag className="w-3 h-3" /> Venda: {formatCurrency(im.valor_venda)}
                            </span>
                          )}
                          {im.valor_locacao && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md">
                              <Tag className="w-3 h-3" /> Locação: {formatCurrency(im.valor_locacao)}/mês
                            </span>
                          )}
                        </div>

                        {/* Proprietário do Imóvel & Chaves */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Proprietário: <strong>{im.proprietario_nome || 'Não informado'}</strong> {im.proprietario_telefone && `(${formatPhone(im.proprietario_telefone)})`}
                          </span>
                          {im.proprietario_telefone && (
                            <a
                              href={waProp}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              <Phone className="w-3 h-3" /> WhatsApp Proprietário
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {im.observacoes_chaves && (
                      <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span><strong>Chaves / Acesso:</strong> {im.observacoes_chaves}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SEÇÃO 2: CLIENTE E OBSERVAÇÕES ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cliente && (
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Cliente</span>
                <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{cliente.nome}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" />{formatPhone(cliente.telefone)}</span>
                  <a href={waCliente} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:underline">WhatsApp</a>
                </div>
              </div>
            )}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Obs. Internas</span>
              <p className="text-xs text-slate-700 dark:text-slate-300">{visita.observacoes || 'Nenhuma observação interna.'}</p>
            </div>
          </div>

          {/* ── SEÇÃO 3: RÉGUA DE NOTIFICAÇÕES WHATSAPP COM ATALHOS DE DISPARO MANUAL ── */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/40 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Régua de Notificações WhatsApp — Status de Entrega
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                Automações EasyMob
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: Confirmação Imediata */}
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                    1. Confirmação
                  </span>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                    Imediato
                  </span>
                </div>
                <div className="space-y-0.5">
                  <RecipientStatusRow
                    label="Cliente"
                    status={visita.whatsapp_confirmacao_cliente}
                    ativo={visita.notificar_confirmacao_cliente !== false && visita.notificar_confirmacao !== false}
                    whatsappLink={getManualWhatsAppLink(visita, 'confirmacao_cliente', configWhatsApp)}
                  />
                  <RecipientStatusRow
                    label="Proprietário"
                    status={visita.whatsapp_confirmacao_proprietario}
                    ativo={visita.notificar_confirmacao_proprietario !== false && visita.notificar_confirmacao !== false}
                    whatsappLink={getManualWhatsAppLink(visita, 'confirmacao_proprietario', configWhatsApp)}
                  />
                </div>
              </div>

              {/* Card 2: Lembrete (1h antes) */}
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                    2. Lembrete
                  </span>
                  <span className="text-[10px] font-bold uppercase text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950 px-1.5 py-0.5 rounded border border-sky-200/60 dark:border-sky-800/60">
                    1h Antes
                  </span>
                </div>
                <div className="space-y-0.5">
                  <RecipientStatusRow
                    label="Cliente"
                    status={visita.whatsapp_lembrete_cliente}
                    ativo={visita.notificar_lembrete_cliente !== false && visita.notificar_lembrete !== false}
                    whatsappLink={getManualWhatsAppLink(visita, 'lembrete_cliente', configWhatsApp)}
                  />
                  <RecipientStatusRow
                    label="Proprietário"
                    status={visita.whatsapp_lembrete_proprietario}
                    ativo={visita.notificar_lembrete_proprietario !== false && visita.notificar_lembrete !== false}
                    whatsappLink={getManualWhatsAppLink(visita, 'lembrete_proprietario', configWhatsApp)}
                  />
                </div>
              </div>

              {/* Card 3: Feedback Pós-Visita (Na Conclusão) */}
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                    3. Pós-Visita
                  </span>
                  <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded border border-purple-200/60 dark:border-purple-800/60">
                    Na Conclusão
                  </span>
                </div>
                <div className="space-y-0.5">
                  <RecipientStatusRow
                    label="Cliente"
                    status={visita.whatsapp_pos_visita_cliente}
                    ativo={visita.notificar_pos_visita !== false}
                    whatsappLink={getManualWhatsAppLink(visita, 'pos_visita_cliente', configWhatsApp)}
                  />
                  <RecipientStatusRow
                    label="Proprietário"
                    status={visita.whatsapp_comprovacao_proprietario}
                    ativo={visita.notificar_comprovacao_proprietario !== false}
                    whatsappLink={getManualWhatsAppLink(visita, 'comprovacao_proprietario', configWhatsApp)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── SEÇÃO 4: RELATÓRIO DE ATENDIMENTO E HISTÓRICO EXPANSÍVEL DUAL (48H) ── */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800 pb-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Relatório de Atendimento e Histórico (48h)
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {visita.gravar_logs !== false ? 'Gravação Ativa' : 'Desativada'}
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  AES-256
                </span>
              </div>
            </div>

            {isLoadingLogs ? (
              <div className="py-4 text-center text-xs text-slate-400">
                <span>Descriptografando registros em memória no servidor...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* ── Accordion 1: Histórico WhatsApp — Cliente ── */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-2xs">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenCliente((prev) => !prev)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                            👤 Histórico WhatsApp — Cliente {cliente?.nome ? `(${cliente.nome})` : ''}
                          </h5>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              visita.gravar_logs_cliente !== false && visita.gravar_logs !== false
                                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800'
                                : 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {visita.gravar_logs_cliente !== false && visita.gravar_logs !== false
                              ? 'Gravação Ativa'
                              : 'Gravação Desativada'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {logsCliente.length} registro(s) auditáveis
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadDossie('cliente');
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                        title="Exportar Relatório PDF do Cliente"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Exportar PDF</span>
                      </button>

                      <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        {openCliente ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {openCliente && (
                    <div className="p-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-950/40">
                      {logsCliente.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3 text-center">
                          Nenhuma mensagem registrada com o cliente até o momento.
                        </p>
                      ) : (
                        logsCliente.map((log) => <LogItemCard key={log.id} log={log} />)
                      )}
                    </div>
                  )}
                </div>

                {/* ── Accordion 2: Histórico WhatsApp — Proprietário ── */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-2xs">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenProprietario((prev) => !prev)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                            🏠 Histórico WhatsApp — Proprietário {visita.imovel?.proprietario_nome ? `(${visita.imovel.proprietario_nome})` : ''}
                          </h5>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              visita.gravar_logs_proprietario !== false && visita.gravar_logs !== false
                                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800'
                                : 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {visita.gravar_logs_proprietario !== false && visita.gravar_logs !== false
                              ? 'Gravação Ativa'
                              : 'Gravação Desativada'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {logsProprietario.length} registro(s) auditáveis
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadDossie('proprietario');
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                        title="Exportar Relatório PDF do Proprietário"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Exportar PDF</span>
                      </button>

                      <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        {openProprietario ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {openProprietario && (
                    <div className="p-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-950/40">
                      {logsProprietario.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3 text-center">
                          Nenhuma mensagem registrada com o proprietário até o momento.
                        </p>
                      ) : (
                        logsProprietario.map((log) => <LogItemCard key={log.id} log={log} />)
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal de Detalhes do Imóvel Selecionado */}
      <ImovelDetalhesModal
        imovel={imovelSelecionado}
        isOpen={!!imovelSelecionado}
        onClose={() => setImovelSelecionado(null)}
      />

      {/* Modal de Edição da Visita Atual */}
      {visita && (
        <EditarVisitaModal
          visita={visita}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  );
}
