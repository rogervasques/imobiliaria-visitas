'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useData } from '@/context/DataContext';
import { StatusCliente } from '@/types';
import { User, Save, DollarSign, Home, BedDouble, Target } from 'lucide-react';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils';

interface NovoClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovoClienteModal({ isOpen, onClose }: NovoClienteModalProps) {
  const { adicionarCliente } = useData();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  
  // Orçamento Estruturado (Mín / Máx com máscara de moeda)
  const [orcamentoMin, setOrcamentoMin] = useState('');
  const [orcamentoMax, setOrcamentoMax] = useState('');

  // Preferências de Imóvel Estruturadas
  const [preferenciaTipo, setPreferenciaTipo] = useState('todos');
  const [preferenciaQuartos, setPreferenciaQuartos] = useState('0');
  const [preferenciaFinalidade, setPreferenciaFinalidade] = useState<'ambos' | 'venda' | 'locacao'>('ambos');

  const [status, setStatus] = useState<StatusCliente>('ativo');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setOrcamentoMin(formatCurrencyInput(raw));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setOrcamentoMax(formatCurrencyInput(raw));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      await adicionarCliente({
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

      onClose();
      // Limpa campos
      setNome('');
      setTelefone('');
      setEmail('');
      setOrcamentoMin('');
      setOrcamentoMax('');
      setPreferenciaTipo('todos');
      setPreferenciaQuartos('0');
      setPreferenciaFinalidade('ambos');
      setStatus('ativo');
      setObservacoes('');
    } catch (err: any) {
      console.error('Erro ao adicionar cliente:', err);
      alert(err?.message || 'Houve um erro ao cadastrar o cliente no banco de dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Novo Cliente"
      subtitle="Cadastre o lead com orçamento e preferências para o cruzamento inteligente de imóveis"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Identificação Básica */}
        <Input
          label="Nome Completo *"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Mariana Castro"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="WhatsApp / Celular *"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Ex: 11999998888"
            required
          />
          <Input
            type="email"
            label="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mariana@exemplo.com"
          />
        </div>

        {/* ─── Orçamento Estruturado (Mínimo e Máximo) ─── */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Faixa de Orçamento (Matching)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Valor Mínimo (R$)"
              value={orcamentoMin}
              onChange={handleMinChange}
              placeholder="Ex: R$ 500.000"
            />
            <Input
              label="Valor Máximo (R$)"
              value={orcamentoMax}
              onChange={handleMaxChange}
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

        {/* Rodapé */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            <Save className="w-4 h-4 mr-1.5" />
            Salvar Cliente
          </Button>
        </div>
      </form>
    </Modal>
  );
}
