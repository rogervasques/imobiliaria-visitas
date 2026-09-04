'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useData } from '@/context/DataContext';
import { StatusCliente } from '@/types';
import { User, Save } from 'lucide-react';

interface NovoClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovoClienteModal({ isOpen, onClose }: NovoClienteModalProps) {
  const { adicionarCliente } = useData();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [perfilInteresse, setPerfilInteresse] = useState('');
  const [faixaOrcamento, setFaixaOrcamento] = useState('');
  const [status, setStatus] = useState<StatusCliente>('ativo');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !telefone) return;

    setIsSubmitting(true);
    try {
      await adicionarCliente({
        nome,
        telefone,
        email: email || undefined,
        perfil_interesse: perfilInteresse || undefined,
        faixa_orcamento: faixaOrcamento || undefined,
        status,
        observacoes: observacoes || undefined,
      });
      onClose();
      // Limpa campos
      setNome('');
      setTelefone('');
      setEmail('');
      setPerfilInteresse('');
      setFaixaOrcamento('');
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
      subtitle="Cadastre o lead/cliente para agendamento de visitas e notificações"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
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

        <Input
          label="Perfil de Interesse"
          value={perfilInteresse}
          onChange={(e) => setPerfilInteresse(e.target.value)}
          placeholder="Ex: Apto 3 quartos Zona Sul até R$ 900k"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Faixa de Orçamento"
            value={faixaOrcamento}
            onChange={(e) => setFaixaOrcamento(e.target.value)}
            placeholder="Ex: R$ 800k a 1.2M"
          />
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
        </div>

        <Textarea
          label="Observações sobre o Cliente"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Ex: Preferência por andar alto, tem financiamento aprovado na Caixa..."
          rows={2}
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
