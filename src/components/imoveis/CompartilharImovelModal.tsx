'use client';

import React, { useState } from 'react';
import { Imovel } from '@/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Phone,
  Building2,
  Users,
  X,
  Send,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatPhone, getWhatsAppDirectLink, cleanPhoneForWhatsApp } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

interface CompartilharImovelModalProps {
  imovel: Imovel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CompartilharImovelModal({
  imovel,
  isOpen,
  onClose,
}: CompartilharImovelModalProps) {
  const { clientes, showToast } = useData();
  const { user } = useAuth();
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string>('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [isSendingDirectly, setIsSendingDirectly] = useState(false);

  if (!imovel) return null;

  // Cliente selecionado (se houver)
  const clienteSelecionado = clientes.find((c) => c.id === clienteSelecionadoId);

  // Monta a URL pública com a imobiliária dona do imóvel
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://easymob.com.br';
  const imobQuery = imovel.imobiliaria ? `?imob=${encodeURIComponent(imovel.imobiliaria)}` : '';
  const publicUrl = `${baseUrl}/imovel/${imovel.id}${imobQuery}`;

  const areaConstruidaOuUtil = imovel.area_construida || imovel.area_util || 0;
  const valorPrincipal = imovel.valor_venda
    ? formatCurrency(imovel.valor_venda)
    : imovel.valor_locacao
    ? `${formatCurrency(imovel.valor_locacao)}/mês`
    : 'Sob Consulta';

  // Mensagem padronizada pronta para o WhatsApp (personalizada se houver cliente)
  const saudacao = clienteSelecionado
    ? `🏢 *Olá, ${clienteSelecionado.nome.split(' ')[0]}! Olha este imóvel que separei especialmente para você:*`
    : `🏢 *Olha este imóvel que separei para você!*`;

  const mensagemWhatsApp = `${saudacao}

*${imovel.titulo}*
📌 Código: *${imovel.codigo || 'SEM-COD'}*
📍 Localização: ${imovel.bairro}, ${imovel.cidade} - ${imovel.estado}
💰 Valor: *${valorPrincipal}*
🛏️ ${imovel.quartos} quartos ${imovel.suites ? `(${imovel.suites} suítes)` : ''} | 🚿 ${imovel.banheiros} banheiros | 🚗 ${imovel.vagas} vagas ${areaConstruidaOuUtil > 0 ? `| 📐 ${areaConstruidaOuUtil}m²` : ''}

👉 *Veja as fotos completas e todos os detalhes no link:*
${publicUrl}

Se você quiser agendar uma visita presencial, me avise por aqui! 🤝`;

  const handleCopiarLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      showToast('Link do imóvel copiado com sucesso!', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast('Não foi possível copiar o link', 'error');
    }
  };

  const handleCopiarMensagem = async () => {
    try {
      await navigator.clipboard.writeText(mensagemWhatsApp);
      setCopiedMsg(true);
      showToast('Mensagem para WhatsApp copiada!', 'success');
      setTimeout(() => setCopiedMsg(false), 2500);
    } catch {
      showToast('Não foi possível copiar a mensagem', 'error');
    }
  };

  // Opção 1: Envio direto via API (instância conectada do corretor)
  const handleEnviarDiretoWhatsAppConectado = async () => {
    const telefoneFinal = telefoneCliente || (clienteSelecionado ? clienteSelecionado.telefone : '');
    const clean = cleanPhoneForWhatsApp(telefoneFinal);

    if (!clean || clean.length < 10) {
      showToast('Informe ou selecione um número de WhatsApp válido', 'info');
      return;
    }

    setIsSendingDirectly(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhone: clean,
          message: mensagemWhatsApp,
          instanceName: user?.instance_name,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showToast('Ficha do imóvel enviada com sucesso pelo WhatsApp conectado!', 'success');
        onClose();
      } else {
        showToast(
          data.error || 'Não foi possível disparar pelo WhatsApp conectado. Verifique se o seu WhatsApp está pareado.',
          'error'
        );
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Falha de conexão';
      showToast('Erro ao enviar mensagem via WhatsApp conectado: ' + errMsg, 'error');
    } finally {
      setIsSendingDirectly(false);
    }
  };

  // Opção 2: Abertura manual no WhatsApp Web / App para revisão
  const handleAbrirNoWhatsApp = () => {
    const telefoneFinal = telefoneCliente || (clienteSelecionado ? clienteSelecionado.telefone : '');
    const linkWa = getWhatsAppDirectLink(telefoneFinal, mensagemWhatsApp);
    window.open(linkWa, '_blank');
    onClose();
  };

  const handleSelectCliente = (clId: string) => {
    setClienteSelecionadoId(clId);
    const cl = clientes.find((c) => c.id === clId);
    if (cl) {
      setTelefoneCliente(formatPhone(cl.telefone));
    }
  };

  const handleLimparCliente = () => {
    setClienteSelecionadoId('');
    setTelefoneCliente('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compartilhar Ficha Pública do Imóvel"
      maxWidth="md"
    >
      <div
        className="space-y-5"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Preview Compacto do Imóvel */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-300 dark:border-slate-700">
            {imovel.imagem_url || (imovel.fotos_urls && imovel.fotos_urls[0]) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imovel.imagem_url || imovel.fotos_urls![0]}
                alt={imovel.titulo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Building2 className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-black/75 text-white font-mono text-[10px] font-bold shrink-0">
                {imovel.codigo || 'SEM-COD'}
              </span>
              <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                {imovel.titulo}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {imovel.bairro}, {imovel.cidade} • <strong className="text-emerald-600 dark:text-emerald-400">{valorPrincipal}</strong>
            </p>
          </div>
        </div>

        {/* 1. Selecionar Cliente da Base & Opções de Envio WhatsApp */}
        <div className="space-y-3.5 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Enviar Ficha no WhatsApp
            </label>
            {clienteSelecionadoId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLimparCliente();
                }}
                className="text-[11px] text-rose-500 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
                Limpar cliente
              </button>
            )}
          </div>

          {/* Selecionar Cliente Cadastrado */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              Selecionar Cliente Cadastrado:
            </label>
            <select
              value={clienteSelecionadoId}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                handleSelectCliente(e.target.value);
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              <option value="">-- Selecionar da lista de clientes ({clientes.length}) --</option>
              {clientes
                .slice()
                .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'))
                .map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.nome} — {formatPhone(cl.telefone)} {cl.perfil_interesse ? `(${cl.perfil_interesse})` : ''}
                  </option>
                ))}
            </select>
          </div>

          {/* Telefone do Destinatário */}
          <div className="space-y-1 pt-0.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Número do WhatsApp do Destinatário:
            </label>
            <div className="relative w-full">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="tel"
                value={telefoneCliente}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  setTelefoneCliente(formatPhone(e.target.value));
                  if (clienteSelecionadoId) setClienteSelecionadoId('');
                }}
                placeholder="(11) 99999-9999"
                className="pl-9 text-xs font-medium"
              />
            </div>
          </div>

          {/* Botões de Ação Duais (Conectado vs Manual) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleEnviarDiretoWhatsAppConectado}
              isLoading={isSendingDirectly}
              disabled={isSendingDirectly}
              className="w-full font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-1.5 py-2.5 rounded-xl cursor-pointer"
              title="Disparar a mensagem automaticamente pela instância de WhatsApp conectada do corretor"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar via WhatsApp Conectado</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleAbrirNoWhatsApp}
              disabled={isSendingDirectly}
              className="w-full font-bold text-xs border-emerald-600/70 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/60 dark:text-emerald-300 dark:hover:bg-emerald-950/40 flex items-center justify-center gap-1.5 py-2.5 rounded-xl cursor-pointer"
              title="Abrir no WhatsApp Web / Mobile para revisar antes de enviar"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Abrir no WhatsApp</span>
            </Button>
          </div>
        </div>

        {/* 2. Link Público do Imóvel */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Link Público do Imóvel</span>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1 lowercase"
            >
              <span>visualizar ficha</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 select-all"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopiarLink}
              className="shrink-0 font-bold text-xs cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copiar Link
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 3. Prévia do Texto da Mensagem */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Texto da Mensagem {clienteSelecionado && `(Personalizada para ${clienteSelecionado.nome.split(' ')[0]})`}
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopiarMensagem}
              className="text-xs text-emerald-600 font-bold h-7 px-2 cursor-pointer"
            >
              {copiedMsg ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  Mensagem Copiada
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copiar Mensagem
                </>
              )}
            </Button>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-sans text-slate-700 dark:text-slate-300 whitespace-pre-line border border-slate-200 dark:border-slate-800 max-h-36 overflow-y-auto leading-relaxed">
            {mensagemWhatsApp}
          </div>
        </div>

        {/* Botão Fechar */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
