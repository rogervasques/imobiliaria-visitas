'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import {
  Clock,
  MapPin,
  User,
  Building2,
  X,
  Send,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { StatusVisita, Imovel, Cliente } from '@/types';

interface NovaVisitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  imovelPreSelecionado?: Imovel;
  clientePreSelecionado?: Cliente;
}

export function NovaVisitaModal({
  isOpen,
  onClose,
  imovelPreSelecionado,
  clientePreSelecionado,
}: NovaVisitaModalProps) {
  const { imoveis, clientes, adicionarVisita } = useData();
  const { user } = useAuth();

  // Estados do Roteiro de Imóveis (Multi-Select) - Totalmente limpos por padrão
  const [selectedImoveisIds, setSelectedImoveisIds] = useState<string[]>([]);
  const [imovelToAddId, setImovelToAddId] = useState<string>('');

  // Estados de Dados da Visita - Totalmente limpos por padrão
  const [clienteId, setClienteId] = useState<string>('');
  const [dataHora, setDataHora] = useState<string>('');
  const [status, setStatus] = useState<StatusVisita>('agendada');
  const [observacoes, setObservacoes] = useState('');

  // Checkboxes da Régua de Notificações WhatsApp (Pré-selecionados por padrão)
  const [notificarConfirmacaoCliente, setNotificarConfirmacaoCliente] = useState(true);
  const [notificarConfirmacaoProprietario, setNotificarConfirmacaoProprietario] = useState(true);
  const [notificarLembreteCliente, setNotificarLembreteCliente] = useState(true);
  const [notificarLembreteProprietario, setNotificarLembreteProprietario] = useState(true);
  const [notificarPosVisitaCliente, setNotificarPosVisitaCliente] = useState(true);
  const [notificarComprovacaoProprietario, setNotificarComprovacaoProprietario] = useState(true);
  const [gravarLogsCliente, setGravarLogsCliente] = useState(true);
  const [gravarLogsProprietario, setGravarLogsProprietario] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincroniza ao abrir se houver imóvel ou cliente pré-selecionado explicitamente
  useEffect(() => {
    if (isOpen) {
      if (imovelPreSelecionado?.id) {
        setSelectedImoveisIds([imovelPreSelecionado.id]);
      } else {
        setSelectedImoveisIds([]);
      }

      if (clientePreSelecionado?.id) {
        setClienteId(clientePreSelecionado.id);
      } else {
        setClienteId('');
      }

      setDataHora('');
      setStatus('agendada');
      setObservacoes('');
      setNotificarConfirmacaoCliente(true);
      setNotificarConfirmacaoProprietario(true);
      setNotificarLembreteCliente(true);
      setNotificarLembreteProprietario(true);
      setNotificarPosVisitaCliente(true);
      setNotificarComprovacaoProprietario(true);
      setGravarLogsCliente(true);
      setGravarLogsProprietario(true);
      setImovelToAddId('');
    }
  }, [imovelPreSelecionado, clientePreSelecionado, isOpen]);

  // Lista dos objetos de imóveis atualmente selecionados no roteiro
  const imoveisSelecionados = selectedImoveisIds
    .map((id) => imoveis.find((i) => i.id === id))
    .filter((i): i is Imovel => !!i);

  // Imóveis ainda disponíveis para adicionar ao roteiro
  const imoveisDisponiveisParaAdicionar = imoveis.filter(
    (i) => !selectedImoveisIds.includes(i.id)
  );

  const selectedCliente = clientes.find((c) => c.id === clienteId);

  // Adiciona um imóvel ao roteiro
  const handleAddImovel = (id: string) => {
    if (!id || selectedImoveisIds.includes(id)) return;
    setSelectedImoveisIds([...selectedImoveisIds, id]);
    setImovelToAddId('');
  };

  // Remove um imóvel do roteiro
  const handleRemoveImovel = (id: string) => {
    setSelectedImoveisIds(selectedImoveisIds.filter((item) => item !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImoveisIds.length === 0 || !clienteId || !dataHora) return;

    setIsSubmitting(true);
    try {
      const temConfirmacao = notificarConfirmacaoCliente || notificarConfirmacaoProprietario;
      const temLembrete = notificarLembreteCliente || notificarLembreteProprietario;

      await adicionarVisita(
        {
          imovel_id: selectedImoveisIds[0],
          imoveis_ids: selectedImoveisIds,
          cliente_id: clienteId,
          corretor_nome: user?.name || 'Corretor Responsável',
          corretor_telefone: '',
          data_hora_visita: new Date(dataHora).toISOString(),
          status,
          observacoes,
          notificar_confirmacao: temConfirmacao,
          notificar_confirmacao_cliente: notificarConfirmacaoCliente,
          notificar_confirmacao_proprietario: notificarConfirmacaoProprietario,
          notificar_lembrete: temLembrete,
          notificar_lembrete_cliente: notificarLembreteCliente,
          notificar_lembrete_proprietario: notificarLembreteProprietario,
          notificar_pos_visita: notificarPosVisitaCliente,
          notificar_pos_visita_cliente: notificarPosVisitaCliente,
          notificar_comprovacao_proprietario: notificarComprovacaoProprietario,
          gravar_logs: gravarLogsCliente || gravarLogsProprietario,
          gravar_logs_cliente: gravarLogsCliente,
          gravar_logs_proprietario: gravarLogsProprietario,
          whatsapp_confirmacao_cliente: notificarConfirmacaoCliente ? 'pendente' : 'inativo',
          whatsapp_confirmacao_proprietario: notificarConfirmacaoProprietario ? 'pendente' : 'inativo',
          whatsapp_lembrete_cliente: notificarLembreteCliente ? 'pendente' : 'inativo',
          whatsapp_lembrete_proprietario: notificarLembreteProprietario ? 'pendente' : 'inativo',
          whatsapp_pos_visita_cliente: notificarPosVisitaCliente ? 'pendente' : 'inativo',
          whatsapp_comprovacao_proprietario: notificarComprovacaoProprietario ? 'pendente' : 'inativo',
        },
        temConfirmacao
      );
      onClose();
    } catch (err: any) {
      console.error('Erro ao criar visita:', err);
      alert(err?.message || 'Houve um erro ao salvar a visita no banco de dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Visita"
      subtitle="Preencha os dados da visita ou roteiro com régua de WhatsApp EasyMob"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ─── 1. Roteiro de Múltiplos Imóveis (Multi-Select Tags/Chips) ─── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-500" />
              Imóveis da Visita / Roteiro ({imoveisSelecionados.length} selecionado{imoveisSelecionados.length === 1 ? '' : 's'})
            </label>
            <span className="text-[11px] font-medium text-slate-400">
              Selecione 1 ou mais imóveis (Roteiro)
            </span>
          </div>

          {/* Seletor Dropdown para Adicionar Imóveis ao Roteiro */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Select
                value={imovelToAddId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) handleAddImovel(val);
                }}
              >
                <option value="">-- Selecione um imóvel para incluir na visita --</option>
                {imoveisDisponiveisParaAdicionar.map((im) => (
                  <option key={im.id} value={im.id}>
                    [{im.codigo || 'S/C'}] {im.titulo} — {im.bairro} ({im.cidade})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Container de Tags/Chips dos Imóveis Selecionados */}
          {imoveisSelecionados.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex flex-wrap gap-2">
                {imoveisSelecionados.map((im, index) => (
                  <div
                    key={im.id}
                    className="inline-flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 shadow-xs group transition-all"
                  >
                    {/* Número da Ordem do Roteiro */}
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    {/* Código e Título */}
                    <div className="text-xs leading-tight">
                      <span className="font-mono text-[10px] font-bold text-blue-700 dark:text-blue-400 mr-1">
                        [{im.codigo || 'S/C'}]
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200">{im.titulo}</strong>
                      <span className="text-slate-400 dark:text-slate-500 ml-1 text-[11px]">
                        ({im.bairro})
                      </span>
                    </div>

                    {/* Botão Remover Tag */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImovel(im.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remover este imóvel da lista"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Sequência detalhada dos Endereços do Roteiro */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Sequência do Roteiro e Endereços:
                </span>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {imoveisSelecionados.map((im, idx) => (
                    <div key={im.id} className="flex items-start gap-1.5 truncate">
                      <span className="font-bold text-emerald-600">{idx + 1}.</span>
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span className="truncate">
                        {im.endereco}, {im.numero || 'S/N'} — {im.bairro} ({im.cidade}) •{' '}
                        <strong>Proprietário:</strong> {im.proprietario_nome}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── 2. Seleção do Cliente ─── */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-500" />
            Cliente Visitante
          </label>
          <Select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
          >
            <option value="">-- Selecione o Cliente --</option>
            {clientes.map((cl) => (
              <option key={cl.id} value={cl.id}>
                {cl.nome} — {cl.telefone} {cl.perfil_interesse ? `(${cl.perfil_interesse})` : ''}
              </option>
            ))}
          </Select>
          {selectedCliente && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                WhatsApp: <strong>{selectedCliente.telefone}</strong> {selectedCliente.email ? `| ${selectedCliente.email}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* ─── 3. Data, Horário e Status ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="datetime-local"
            label="Data e Horário"
            value={dataHora}
            onChange={(e) => setDataHora(e.target.value)}
            required
            icon={<Clock className="w-4 h-4" />}
          />

          <Select
            label="Status Inicial"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusVisita)}
            disabled
          >
            <option value="agendada">Agendada</option>
          </Select>
        </div>

        {/* ─── 4. Observações ─── */}
        <Textarea
          label="Observações / Ponto de Encontro"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Ex: Ponto de encontro no primeiro imóvel, cliente busca locação rápida..."
          rows={2}
        />

        {/* ─── 5. Seção de Notificações via WhatsApp (Layout em Matriz) ─── */}
        <div className="overflow-hidden rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 shadow-xs">
          {/* Header da Tabela */}
          <div className="flex items-center justify-between p-3 bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-800/60">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                Notificações via WhatsApp
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
              Automações EasyMob
            </span>
          </div>

          {/* Tabela / Matriz de Notificações */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-3 sm:px-4">Evento de Disparo</th>
                  <th className="py-2.5 px-3 sm:px-4 text-center w-24 sm:w-28 text-emerald-700 dark:text-emerald-400">
                    Cliente
                  </th>
                  <th className="py-2.5 px-3 sm:px-4 text-center w-24 sm:w-28 text-emerald-700 dark:text-emerald-400">
                    Proprietário
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {/* Linha 1: Confirmar agendamento */}
                <tr className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 sm:px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      Confirmar agendamento
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Disparo imediato ao agendar
                    </div>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={notificarConfirmacaoCliente}
                      onChange={(e) => setNotificarConfirmacaoCliente(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={notificarConfirmacaoProprietario}
                      onChange={(e) => setNotificarConfirmacaoProprietario(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                </tr>

                {/* Linha 2: Enviar lembrete */}
                <tr className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 sm:px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      Enviar lembrete
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      1h antes da visita
                    </div>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={notificarLembreteCliente}
                      onChange={(e) => setNotificarLembreteCliente(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={notificarLembreteProprietario}
                      onChange={(e) => setNotificarLembreteProprietario(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                </tr>

                {/* Linha 3: Solicitar/Notificar pós-visita */}
                <tr className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 sm:px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      Solicitar/Notificar pós-visita
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Após concluir visita
                    </div>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={notificarPosVisitaCliente}
                      onChange={(e) => setNotificarPosVisitaCliente(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={notificarComprovacaoProprietario}
                      onChange={(e) => setNotificarComprovacaoProprietario(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                </tr>

                {/* Linha 4: Gravar histórico de atendimento */}
                <tr className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 sm:px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      Gravar histórico de atendimento
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Registra conversas até 48h depois da visita
                    </div>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={gravarLogsCliente}
                      onChange={(e) => setGravarLogsCliente(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={gravarLogsProprietario}
                      onChange={(e) => setGravarLogsProprietario(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Botões do Rodapé ─── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={selectedImoveisIds.length === 0 || !clienteId || !dataHora}
          >
            <Send className="w-4 h-4 mr-1.5" />
            Salvar e Agendar Visita {imoveisSelecionados.length > 0 ? `(${imoveisSelecionados.length} imóvel${imoveisSelecionados.length === 1 ? '' : 'is'})` : ''}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
