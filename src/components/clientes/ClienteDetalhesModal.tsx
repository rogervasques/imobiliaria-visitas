'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Cliente, StatusCliente, StatusVisita, Visita } from '@/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useData } from '@/context/DataContext';
import {
  User,
  Phone,
  Mail,
  Tag,
  DollarSign,
  Calendar,
  Clock,
  MessageCircle,
  Pencil,
  Trash2,
  AlertTriangle,
  Save,
  Plus,
  Building2,
  History,
  FileText,
  Sparkles,
  Home,
} from 'lucide-react';
import { formatCurrency, formatPhone, formatDateTime, getInitials, getWhatsAppDirectLink, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils';
import { EnviarImovelModal } from './EnviarImovelModal';

interface ClienteDetalhesModalProps {
  cliente: Cliente | null;
  isOpen: boolean;
  onClose: () => void;
  onAgendarVisita?: (cliente: Cliente) => void;
  onSelectVisita?: (visita: Visita) => void;
}

export function ClienteDetalhesModal({
  cliente,
  isOpen,
  onClose,
  onAgendarVisita,
  onSelectVisita,
}: ClienteDetalhesModalProps) {
  const { atualizarCliente, removerCliente, visitas } = useData();

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnviarImovelOpen, setIsEnviarImovelOpen] = useState(false);

  // Estados de Edição
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  
  // Orçamento Estruturado
  const [orcamentoMin, setOrcamentoMin] = useState('');
  const [orcamentoMax, setOrcamentoMax] = useState('');

  // Preferências Estruturadas
  const [preferenciaTipo, setPreferenciaTipo] = useState('todos');
  const [preferenciaQuartos, setPreferenciaQuartos] = useState('0');
  const [preferenciaFinalidade, setPreferenciaFinalidade] = useState<'ambos' | 'venda' | 'locacao'>('ambos');

  const [status, setStatus] = useState<StatusCliente>('ativo');
  const [observacoes, setObservacoes] = useState('');

  // Sincroniza formulário quando o cliente mudar
  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome || '');
      setTelefone(cliente.telefone || '');
      setEmail(cliente.email || '');
      setOrcamentoMin(cliente.orcamento_min ? formatCurrencyInput(cliente.orcamento_min) : '');
      setOrcamentoMax(cliente.orcamento_max ? formatCurrencyInput(cliente.orcamento_max) : '');
      setPreferenciaTipo(cliente.preferencia_tipo || 'todos');
      setPreferenciaQuartos(String(cliente.preferencia_quartos || 0));
      setPreferenciaFinalidade(cliente.preferencia_finalidade || 'ambos');
      setStatus(cliente.status || 'ativo');
      setObservacoes(cliente.observacoes || '');
      setIsEditing(false);
      setIsConfirmingDelete(false);
    }
  }, [cliente, isOpen]);

  // Histórico de visitas do cliente
  const historicoVisitas = useMemo(() => {
    if (!cliente) return [];
    return visitas
      .filter((v) => v.cliente_id === cliente.id)
      .sort((a, b) => new Date(b.data_hora_visita).getTime() - new Date(a.data_hora_visita).getTime());
  }, [visitas, cliente]);

  if (!cliente) return null;

  const statusVariants = {
    ativo: 'success' as const,
    negociando: 'warning' as const,
    fechado: 'purple' as const,
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

  const directWhatsApp = getWhatsAppDirectLink(
    cliente.telefone,
    `Olá, ${cliente.nome}! Tudo bem? Sou da EasyMob e gostaria de falar sobre as opções de imóveis para você.`
  );

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !telefone) return;

    setIsSubmitting(true);
    try {
      const numMin = parseCurrencyInput(orcamentoMin);
      const numMax = parseCurrencyInput(orcamentoMax);
      const numQuartos = parseInt(preferenciaQuartos, 10) || 0;

      // Gera texto amigável de faixa de orçamento para compatibilidade retroativa
      let faixaTexto = '';
      if (numMin > 0 && numMax > 0) {
        faixaTexto = `${formatCurrency(numMin)} a ${formatCurrency(numMax)}`;
      } else if (numMin > 0) {
        faixaTexto = `A partir de ${formatCurrency(numMin)}`;
      } else if (numMax > 0) {
        faixaTexto = `Até ${formatCurrency(numMax)}`;
      }

      // Gera descrição amigável de perfil de interesse
      const tipoLabel = preferenciaTipo !== 'todos' ? preferenciaTipo.charAt(0).toUpperCase() + preferenciaTipo.slice(1) : '';
      const quartosLabel = numQuartos > 0 ? `${numQuartos}+ quartos` : '';
      const finalidadeLabel = preferenciaFinalidade === 'locacao' ? 'Locação' : preferenciaFinalidade === 'venda' ? 'Venda' : '';
      const perfilDesc = [tipoLabel, quartosLabel, finalidadeLabel].filter(Boolean).join(' • ');

      await atualizarCliente(cliente.id, {
        nome,
        telefone,
        email: email || undefined,
        orcamento_min: numMin > 0 ? numMin : undefined,
        orcamento_max: numMax > 0 ? numMax : undefined,
        preferencia_tipo: preferenciaTipo,
        preferencia_quartos: numQuartos,
        preferencia_finalidade: preferenciaFinalidade,
        faixa_orcamento: faixaTexto || undefined,
        perfil_interesse: perfilDesc || undefined,
        status,
        observacoes: observacoes || undefined,
      });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Erro ao atualizar cliente:', err);
      alert(err?.message || 'Houve um erro ao atualizar o cliente no banco de dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExcluirCliente = async () => {
    setIsSubmitting(true);
    try {
      await removerCliente(cliente.id);
      onClose();
    } catch (err: any) {
      console.error('Erro ao excluir cliente:', err);
      alert(err?.message || 'Houve um erro ao excluir o cliente no banco de dados. Tente novamente.');
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
        title={isEditing ? 'Editar Cliente' : cliente.nome}
        subtitle={isEditing ? 'Atualize as informações, orçamento e preferências do cliente' : 'Ficha completa do cliente e histórico de visitas'}
        maxWidth="2xl"
      >
        {/* ─── MODAL EM MODO EDIÇÃO ─── */}
        {isEditing ? (
          <form onSubmit={handleSalvarEdicao} className="space-y-4 pt-1">
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

            <Input
              label="Nome Completo *"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="WhatsApp / Celular *"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
              />
              <Input
                type="email"
                label="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* ─── Faixa de Orçamento (Mínimo e Máximo) ─── */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Faixa de Orçamento (Matching)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Valor Mínimo (R$)"
                  value={orcamentoMin}
                  onChange={(e) => setOrcamentoMin(formatCurrencyInput(e.target.value))}
                  placeholder="Ex: R$ 500.000"
                />
                <Input
                  label="Valor Máximo (R$)"
                  value={orcamentoMax}
                  onChange={(e) => setOrcamentoMax(formatCurrencyInput(e.target.value))}
                  placeholder="Ex: R$ 950.000"
                />
              </div>
            </div>

            {/* ─── Preferências de Imóvel Estruturadas (Dropdowns) ─── */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-emerald-500" />
                Preferências de Imóvel (Matching)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Tipo de Imóvel"
                  value={preferenciaTipo}
                  onChange={(e) => setPreferenciaTipo(e.target.value)}
                >
                  <option value="todos">Todos os Tipos</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa</option>
                  <option value="sobrado">Sobrado</option>
                  <option value="terreno">Terreno</option>
                  <option value="comercial">Comercial</option>
                  <option value="cobertura">Cobertura</option>
                  <option value="studio">Studio</option>
                  <option value="rural">Rural / Chácara</option>
                  <option value="outro">Outro</option>
                </Select>

                <Select
                  label="Mínimo de Quartos"
                  value={preferenciaQuartos}
                  onChange={(e) => setPreferenciaQuartos(e.target.value)}
                >
                  <option value="0">Qualquer</option>
                  <option value="1">1+ quarto</option>
                  <option value="2">2+ quartos</option>
                  <option value="3">3+ quartos</option>
                  <option value="4">4+ quartos</option>
                </Select>

                <Select
                  label="Finalidade"
                  value={preferenciaFinalidade}
                  onChange={(e) => setPreferenciaFinalidade(e.target.value as any)}
                >
                  <option value="ambos">Venda e Locação</option>
                  <option value="venda">Venda</option>
                  <option value="locacao">Locação</option>
                </Select>
              </div>
            </div>

            {/* Status do Cliente */}
            <Select
              label="Status do Cliente"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusCliente)}
            >
              <option value="ativo">Ativo</option>
              <option value="negociando">Em Negociação</option>
              <option value="fechado">Fechado</option>
              <option value="inativo">Inativo</option>
            </Select>

            {/* Campo Livre: Observações / Perfil Geral */}
            <Textarea
              label="Observações / Perfil Geral"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Busca imóvel próximo a escolas, andar alto, aceita permuta, financiamento aprovado..."
              rows={3}
            />

            {/* Rodapé da Edição */}
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
          /* ─── MODAL EM MODO VISUALIZAÇÃO / LEITURA ─── */
          <div className="space-y-5 pt-1">
            {/* Barra de Ações: [ ✏️ Editar ] e [ 🗑️ Excluir ] */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Ações do Cliente:
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="font-bold text-xs shadow-xs text-slate-700 dark:text-slate-200"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="font-bold text-xs shadow-xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Excluir
                </Button>
              </div>
            </div>

            {/* Cartão de Identificação do Cliente */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center text-base sm:text-lg shadow-md shadow-emerald-600/25 shrink-0">
                  {getInitials(cliente.nome)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 truncate">
                    {cliente.nome}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 font-mono font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {formatPhone(cliente.telefone)}
                    </span>
                    {cliente.email && (
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {cliente.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Ações Rápidas: 100% contidas no card superior */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={directWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    type="button"
                    variant="whatsapp"
                    size="sm"
                    className="w-full font-bold text-xs flex items-center justify-center gap-1.5 py-2 shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </Button>
                </a>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEnviarImovelOpen(true)}
                  className="w-full font-bold text-xs shadow-xs border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-center gap-1.5 py-2 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enviar Imóvel</span>
                </Button>

                {onAgendarVisita && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onAgendarVisita(cliente);
                    }}
                    className="w-full font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agendar Visita</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Informações de Perfil de Interesse & Orçamento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Home className="w-3 h-3 text-emerald-500" /> Preferências de Imóvel
                </span>
                <div className="flex items-center gap-1.5 flex-wrap text-slate-800 dark:text-slate-200 font-bold text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                    {cliente.preferencia_tipo && cliente.preferencia_tipo !== 'todos' ? cliente.preferencia_tipo.toUpperCase() : 'Todos os Tipos'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                    {cliente.preferencia_quartos && cliente.preferencia_quartos > 0 ? `${cliente.preferencia_quartos}+ quartos` : 'Qualquer quarto'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                    {cliente.preferencia_finalidade === 'locacao' ? 'Locação' : cliente.preferencia_finalidade === 'venda' ? 'Venda' : 'Venda e Locação'}
                  </span>
                </div>
                {cliente.perfil_interesse && !cliente.preferencia_tipo && (
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {cliente.perfil_interesse}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-500" /> Faixa de Orçamento
                </span>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  {(cliente.orcamento_min || cliente.orcamento_max)
                    ? `${cliente.orcamento_min ? formatCurrency(cliente.orcamento_min) : 'R$ 0'} a ${cliente.orcamento_max ? formatCurrency(cliente.orcamento_max) : 'Ilimitado'}`
                    : cliente.faixa_orcamento || 'Não especificado'}
                </p>
              </div>
            </div>

            {/* Observações / Perfil Geral */}
            {cliente.observacoes && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-emerald-500" /> Observações / Perfil Geral
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {cliente.observacoes}
                </p>
              </div>
            )}

            {/* ── HISTÓRICO DE VISITAS DO CLIENTE ── */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-emerald-500" />
                  Histórico de Visitas ({historicoVisitas.length})
                </h4>
              </div>

              {historicoVisitas.length === 0 ? (
                <div className="p-8 text-center space-y-2 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Nenhuma visita registrada para este cliente até o momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {historicoVisitas.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => onSelectVisita?.(v)}
                      className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all space-y-2 ${
                        onSelectVisita ? 'cursor-pointer hover:border-emerald-500 hover:shadow-md group' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                            {formatDateTime(v.data_hora_visita)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {statusVisitaBadge(v.status)}
                        </div>
                      </div>

                      {/* Imóvel ou Roteiro Visitado */}
                      {((v.imoveis && v.imoveis.length > 1) ? v.imoveis : [v.imovel]).map((im, idx) => (
                        <div key={im?.id || idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                          {im?.imagem_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={im.imagem_url}
                              alt={im.titulo}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              {((v.imoveis && v.imoveis.length > 1)) && (
                                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-slate-400 font-mono">
                                {im?.codigo || 'SEM-COD'}
                              </span>
                            </div>
                            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                              {im?.titulo || 'Imóvel'}
                            </h5>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {im?.bairro}, {im?.cidade}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Notas e Feedback se houver */}
                      {(v.observacoes || v.feedback_cliente) && (
                        <div className="text-xs text-slate-500 pt-1 space-y-1">
                          {v.observacoes && (
                            <p className="line-clamp-2">
                              <strong>Notas:</strong> {v.observacoes}
                            </p>
                          )}
                          {v.feedback_cliente && (
                            <p className="line-clamp-2 text-emerald-600 dark:text-emerald-400">
                              <strong>Feedback:</strong> {v.feedback_cliente}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (DUPLA CHECAGEM) ─── */}
      <Modal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        title="Confirmar Exclusão de Cliente"
        maxWidth="md"
      >
        <div className="space-y-4 pt-1">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs text-rose-950 dark:text-rose-200">
              <h4 className="font-bold text-sm text-rose-900 dark:text-rose-100">
                Tem certeza que deseja excluir este cliente?
              </h4>
              <p className="leading-relaxed">
                Você está prestes a excluir permanentemente o cadastro de{' '}
                <strong className="text-slate-900 dark:text-white">
                  &quot;{cliente.nome}&quot;
                </strong>.
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold pt-1">
                ⚠️ Esta ação não pode ser desfeita e removerá o vínculo com visitas e históricos deste cliente.
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
              onClick={handleExcluirCliente}
              isLoading={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Sim, Excluir Cliente
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Busca Rápida e Envio de Imóvel via WhatsApp */}
      <EnviarImovelModal
        cliente={cliente}
        isOpen={isEnviarImovelOpen}
        onClose={() => setIsEnviarImovelOpen(false)}
      />
    </>
  );
}
