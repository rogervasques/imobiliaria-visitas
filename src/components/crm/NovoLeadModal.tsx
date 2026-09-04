'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useData } from '@/context/DataContext';
import { EtapaCRM, OrigemLead, StatusCliente } from '@/types';
import { User, Phone, Mail, DollarSign, Tag, Building2, Layers, Sparkles } from 'lucide-react';

interface NovoLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEtapa?: EtapaCRM;
}

export function NovoLeadModal({ isOpen, onClose, initialEtapa = 'novos_leads' }: NovoLeadModalProps) {
  const { adicionarCliente, imoveis } = useData();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [origemLead, setOrigemLead] = useState<OrigemLead>('portal');
  const [etapaCrm, setEtapaCrm] = useState<EtapaCRM>(initialEtapa);
  const [imovelId, setImovelId] = useState('');
  const [faixaOrcamento, setFaixaOrcamento] = useState('');
  const [perfilInteresse, setPerfilInteresse] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEtapaCrm(initialEtapa);
    }
  }, [isOpen, initialEtapa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) return;

    setIsSubmitting(true);
    try {
      const imovelSelecionado = imoveis.find((i) => i.id === imovelId);

      let statusCliente: StatusCliente = 'ativo';
      if (etapaCrm === 'venda_concluida') {
        statusCliente = 'fechado';
      } else if (
        etapaCrm === 'proposta_negociacao' ||
        etapaCrm === 'documentacao_credito' ||
        etapaCrm === 'fechamento_contrato'
      ) {
        statusCliente = 'negociando';
      }

      await adicionarCliente({
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim() || undefined,
        origem_lead: origemLead,
        etapa_crm: etapaCrm,
        status: statusCliente,
        imovel_interesse_id: imovelSelecionado?.id,
        imovel_interesse_titulo: imovelSelecionado?.titulo,
        faixa_orcamento: faixaOrcamento.trim() || undefined,
        perfil_interesse: perfilInteresse.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      });

      onClose();
      // Limpeza de formulário
      setNome('');
      setTelefone('');
      setEmail('');
      setOrigemLead('portal');
      setImovelId('');
      setFaixaOrcamento('');
      setPerfilInteresse('');
      setObservacoes('');
    } catch (err) {
      console.error('Erro ao cadastrar lead:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Novo Lead no CRM"
      subtitle="Adicione um lead ao funil de negociações para acompanhamento"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Nome do Lead */}
        <Input
          label="Nome Completo *"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Gabriel Albuquerque"
          icon={<User className="w-4 h-4" />}
          required
        />

        {/* WhatsApp & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="WhatsApp / Celular *"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Ex: 11999998888"
            icon={<Phone className="w-4 h-4" />}
            required
          />
          <Input
            type="email"
            label="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="lead@exemplo.com"
            icon={<Mail className="w-4 h-4" />}
          />
        </div>

        {/* Etapa do Funil & Origem */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Etapa Inicial no Funil *"
            value={etapaCrm}
            onChange={(e) => setEtapaCrm(e.target.value as EtapaCRM)}
          >
            <option value="novos_leads">1. Novos Leads</option>
            <option value="qualificacao">2. Qualificação</option>
            <option value="agendamento_visita">3. Agendamento de Visita</option>
            <option value="proposta_negociacao">4. Proposta / Negociação</option>
            <option value="documentacao_credito">5. Documentação / Análise de Crédito</option>
            <option value="fechamento_contrato">6. Fechamento / Contrato</option>
            <option value="venda_concluida">7. Venda Concluída</option>
          </Select>

          <Select
            label="Origem do Lead *"
            value={origemLead}
            onChange={(e) => setOrigemLead(e.target.value as OrigemLead)}
          >
            <option value="portal">Portal Imobiliário (Zap/VivaReal)</option>
            <option value="instagram">Instagram / Facebook Ads</option>
            <option value="site">Site Oficial da Imobiliária</option>
            <option value="whatsapp">WhatsApp Direto</option>
            <option value="indicacao">Indicação de Cliente/Parceiro</option>
            <option value="placa">Placa no Imóvel</option>
          </Select>
        </div>

        {/* Imóvel de Interesse & Faixa de Orçamento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Imóvel de Interesse (Opcional)"
            value={imovelId}
            onChange={(e) => setImovelId(e.target.value)}
          >
            <option value="">Nenhum imóvel específico</option>
            {imoveis.map((im) => (
              <option key={im.id} value={im.id}>
                [{im.codigo}] {im.titulo} ({im.bairro})
              </option>
            ))}
          </Select>

          <Input
            label="Faixa de Orçamento"
            value={faixaOrcamento}
            onChange={(e) => setFaixaOrcamento(e.target.value)}
            placeholder="Ex: R$ 800k a 1.2M"
            icon={<DollarSign className="w-4 h-4" />}
          />
        </div>

        {/* Perfil de Interesse */}
        <Input
          label="Perfil / Preferências"
          value={perfilInteresse}
          onChange={(e) => setPerfilInteresse(e.target.value)}
          placeholder="Ex: Apartamento 3 dorms, 2 vagas, varanda gourmet"
          icon={<Tag className="w-4 h-4" />}
        />

        {/* Observações */}
        <Textarea
          label="Observações Iniciais"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Anotações adicionais sobre o perfil do lead, preferências de horário..."
          rows={2}
        />

        {/* Botões */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting || !nome.trim() || !telefone.trim()}
          >
            Adicionar Lead ao Funil
          </Button>
        </div>
      </form>
    </Modal>
  );
}
