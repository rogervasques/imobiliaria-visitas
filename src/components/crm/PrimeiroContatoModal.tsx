'use client';

import React, { useState, useEffect } from 'react';
import { Cliente, Imovel } from '@/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { formatPhone } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import {
  MessageSquare,
  Sparkles,
  CalendarCheck,
  Send,
  User,
  Building2,
  Phone,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Bot,
  Zap,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrimeiroContatoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Cliente | null;
  onSuccess?: () => void;
}

interface TemplateOption {
  id: string;
  titulo: string;
  descricao: string;
  tag: string;
  icone: React.ElementType;
  cor: string;
  badgeCor: string;
  gerarTexto: (params: { nome: string; corretor: string; imobiliaria: string; imovel: string }) => string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'boas_vindas',
    titulo: 'Boas-vindas e Apresentação',
    descricao: 'Apresentação inicial do corretor e abertura de contato cordial sobre o imóvel de interesse.',
    tag: 'Recomendado para novos leads',
    icone: Sparkles,
    cor: 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300',
    badgeCor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    gerarTexto: ({ nome, corretor, imobiliaria, imovel }) =>
      `Olá, ${nome}! Tudo bem? Sou ${corretor}, da imobiliária ${imobiliaria}.\n\nVi que você demonstrou interesse no imóvel "${imovel}". Estou à disposição para tirar todas as suas dúvidas e te enviar fotos, valores e detalhes!\n\nComo posso te ajudar hoje?`,
  },
  {
    id: 'agendamento_direto',
    titulo: 'Agendamento Direto de Visita',
    descricao: 'Convite direto e objetivo para marcar uma visita presencial ou tour guiado no imóvel.',
    tag: 'Foco em conversão rápida',
    icone: CalendarCheck,
    cor: 'border-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300',
    badgeCor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
    gerarTexto: ({ nome, corretor, imobiliaria, imovel }) =>
      `Olá, ${nome}! Aqui é ${corretor}, da ${imobiliaria}.\n\nEstou entrando em contato a respeito do imóvel "${imovel}". Gostaria de te convidar para conhecer o imóvel pessoalmente!\n\nQual seria o melhor dia e horário para você esta semana?`,
  },
];

export function PrimeiroContatoModal({ isOpen, onClose, lead, onSuccess }: PrimeiroContatoModalProps) {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const { imoveis, moverEtapaCRM, atualizarCliente, showToast } = useData();

  const [step, setStep] = useState<'selecao' | 'previa'>('selecao');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('boas_vindas');
  const [mensagemEditada, setMensagemEditada] = useState<string>('');
  const [moverParaQualificacao, setMoverParaQualificacao] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Variáveis resolvidas
  const nomeCliente = lead?.nome || 'Cliente';
  const telefoneCliente = lead?.telefone || '';
  const corretorNome = user?.name || 'Corretor';
  const imobiliariaNome = currentTenant?.nome || user?.imobiliaria || 'Nossa Imobiliária';

  const imovelVinculado = lead?.imovel_interesse_id
    ? imoveis.find((i) => i.id === lead.imovel_interesse_id)
    : undefined;

  const imovelTitulo = imovelVinculado?.titulo || lead?.imovel_interesse_titulo || lead?.perfil_interesse || 'Imóvel em Destaque';

  // Inicialização do modal
  useEffect(() => {
    if (isOpen && lead) {
      setStep('selecao');
      setSelectedTemplateId('boas_vindas');
      const tpl = TEMPLATES.find((t) => t.id === 'boas_vindas') || TEMPLATES[0];
      const texto = tpl.gerarTexto({
        nome: lead.nome,
        corretor: corretorNome,
        imobiliaria: imobiliariaNome,
        imovel: imovelTitulo,
      });
      setMensagemEditada(texto);
      setMoverParaQualificacao(true);
    }
  }, [isOpen, lead, corretorNome, imobiliariaNome, imovelTitulo]);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tpl = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
    const texto = tpl.gerarTexto({
      nome: nomeCliente,
      corretor: corretorNome,
      imobiliaria: imobiliariaNome,
      imovel: imovelTitulo,
    });
    setMensagemEditada(texto);
    setStep('previa');
  };

  const handleConfirmarEnvio = async () => {
    if (!lead || !telefoneCliente || !mensagemEditada.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhone: telefoneCliente,
          message: mensagemEditada.trim(),
          destinatarioNome: nomeCliente,
          tipoDestinatario: 'cliente',
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Falha no disparo da Evolution API');
      }

      const agora = new Date();
      const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // Atualiza o lead com a tag de primeiro contato enviado
      await atualizarCliente(lead.id, {
        tempo_parada_texto: `Contato enviado hoje às ${horaFormatada}`,
      });

      // Move automaticamente para Qualificação se solicitado
      if (moverParaQualificacao) {
        await moverEtapaCRM(lead.id, 'qualificacao');
      }

      showToast(`Primeiro contato enviado com sucesso para ${nomeCliente}!`, 'success');
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      showToast(`Erro no envio: ${msg}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (!lead) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="💬 Primeiro Contato via WhatsApp"
      subtitle={`Disparo oficial automatizado via Evolution API para ${nomeCliente}`}
      maxWidth="lg"
    >
      <div className="space-y-4 pt-1">
        {/* ─── INDICADOR DE ETAPAS DO MODAL ─── */}
        <div className="flex items-center justify-between px-1 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep('selecao')}
              className={cn(
                'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer',
                step === 'selecao'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800'
              )}
            >
              <span>1. Escolher Template</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">→</span>

            <button
              type="button"
              onClick={() => setStep('previa')}
              className={cn(
                'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer',
                step === 'previa'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800'
              )}
            >
              <span>2. Prévia &amp; Edição</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <Phone className="w-3 h-3 text-emerald-500" />
            <span>{formatPhone(telefoneCliente)}</span>
          </div>
        </div>

        {/* ─── ETAPA 1: SELEÇÃO DE TEMPLATE ─── */}
        {step === 'selecao' && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Selecione o modelo de mensagem para personalizar e disparar:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATES.map((tpl) => {
                const Icon = tpl.icone;
                const isSelected = selectedTemplateId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={cn(
                      'p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3',
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className={cn('p-2 rounded-xl shrink-0', tpl.cor)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={cn('text-[10px] font-extrabold px-2 py-0.5 rounded-full', tpl.badgeCor)}>
                          {tpl.tag}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-3 leading-snug">
                        {tpl.titulo}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {tpl.descricao}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        Usar este modelo <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── ETAPA 2: CONFIRMAÇÃO, PRÉVIA E EDIÇÃO ─── */}
        {step === 'previa' && (
          <div className="space-y-4">
            {/* Informações dos Parâmetros Substituídos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Cliente
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 truncate block">
                  {nomeCliente}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Telefone
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">
                  {formatPhone(telefoneCliente)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Corretor
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 truncate block">
                  {corretorNome}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Imóvel
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block" title={imovelTitulo}>
                  {imovelTitulo}
                </span>
              </div>
            </div>

            {/* Simulação Visual do Balão do WhatsApp */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Edição Rápida da Mensagem (Texto Final):
              </label>

              <Textarea
                value={mensagemEditada}
                onChange={(e) => setMensagemEditada(e.target.value)}
                rows={5}
                className="font-sans text-sm leading-relaxed"
                placeholder="Escreva a mensagem personalizada..."
              />
            </div>

            {/* Prévia do Balão do WhatsApp */}
            <div className="p-3.5 rounded-2xl bg-[#efeae2] dark:bg-slate-950 border border-slate-300/80 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                Prévia no WhatsApp do Cliente:
              </span>

              <div className="max-w-md ml-auto bg-[#d9fdd3] dark:bg-emerald-950/80 text-slate-900 dark:text-slate-100 p-3 rounded-2xl rounded-tr-xs shadow-xs border border-[#c1e9bb] dark:border-emerald-800/60 text-xs leading-relaxed whitespace-pre-wrap relative">
                {mensagemEditada || 'Nenhuma mensagem escrita...'}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-sky-600 dark:text-sky-400 font-bold">✓✓</span>
                </div>
              </div>
            </div>

            {/* Opção para mover automaticamente para Qualificação */}
            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={moverParaQualificacao}
                onChange={(e) => setMoverParaQualificacao(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md border-emerald-300 focus:ring-emerald-500"
              />
              <div className="min-w-0 flex-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  Avançar para a etapa "Qualificação" após o envio
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                  Atualiza automaticamente o status do funil para manter a organização.
                </span>
              </div>
            </label>
          </div>
        )}

        {/* ─── BOTÕES DE AÇÃO ─── */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          {step === 'previa' ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('selecao')}
              disabled={isSending}
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Trocar Modelo
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={onClose} disabled={isSending} size="sm">
              Cancelar
            </Button>
          )}

          {step === 'selecao' ? (
            <Button
              type="button"
              variant="primary"
              onClick={() => setStep('previa')}
              size="sm"
              className="font-bold"
            >
              Avançar para Prévia <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmarEnvio}
              disabled={isSending || !mensagemEditada.trim()}
              size="sm"
              className="font-extrabold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Disparando via Evolution API...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5" />
                  Confirmar e Enviar WhatsApp
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
