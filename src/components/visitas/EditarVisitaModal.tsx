'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useData } from '@/context/DataContext';
import {
  Clock,
  User,
  Building2,
  Save,
  Plus,
  X,
  Bell,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Visita, StatusVisita, Imovel } from '@/types';

interface EditarVisitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  visita: Visita;
}

export function EditarVisitaModal({ isOpen, onClose, visita }: EditarVisitaModalProps) {
  const { imoveis, clientes, atualizarVisita } = useData();

  const [selectedImoveisIds, setSelectedImoveisIds] = useState<string[]>([]);
  const [imovelToAddId, setImovelToAddId] = useState<string>('');
  const [mostrarSeletorAdicional, setMostrarSeletorAdicional] = useState(false);

  const [clienteId, setClienteId] = useState(visita.cliente_id);
  const [dataHora, setDataHora] = useState('');
  const [status, setStatus] = useState<StatusVisita>(visita.status || 'agendada');
  const [observacoes, setObservacoes] = useState(visita.observacoes || '');

  const [notificarConfirmacaoCliente, setNotificarConfirmacaoCliente] = useState(
    visita.notificar_confirmacao_cliente !== undefined ? visita.notificar_confirmacao_cliente : visita.notificar_confirmacao !== false
  );
  const [notificarConfirmacaoProprietario, setNotificarConfirmacaoProprietario] = useState(
    visita.notificar_confirmacao_proprietario !== undefined ? visita.notificar_confirmacao_proprietario : visita.notificar_confirmacao !== false
  );
  const [notificarLembreteCliente, setNotificarLembreteCliente] = useState(
    visita.notificar_lembrete_cliente !== undefined ? visita.notificar_lembrete_cliente : visita.notificar_lembrete !== false
  );
  const [notificarLembreteProprietario, setNotificarLembreteProprietario] = useState(
    visita.notificar_lembrete_proprietario !== undefined ? visita.notificar_lembrete_proprietario : visita.notificar_lembrete !== false
  );
  const [notificarPosVisitaCliente, setNotificarPosVisitaCliente] = useState(
    visita.notificar_pos_visita_cliente !== undefined ? visita.notificar_pos_visita_cliente : visita.notificar_pos_visita !== false
  );
  const [notificarComprovacaoProprietario, setNotificarComprovacaoProprietario] = useState(
    visita.notificar_comprovacao_proprietario !== undefined ? visita.notificar_comprovacao_proprietario : true
  );
  const [gravarLogsCliente, setGravarLogsCliente] = useState(
    visita.gravar_logs_cliente !== undefined ? visita.gravar_logs_cliente : visita.gravar_logs !== false
  );
  const [gravarLogsProprietario, setGravarLogsProprietario] = useState(
    visita.gravar_logs_proprietario !== undefined ? visita.gravar_logs_proprietario : visita.gravar_logs !== false
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visita) {
      const initialIds = (visita.imoveis_ids && visita.imoveis_ids.length > 0)
        ? visita.imoveis_ids
        : [visita.imovel_id];

      setSelectedImoveisIds(initialIds);
      setClienteId(visita.cliente_id);
      setStatus(visita.status || 'agendada');
      setObservacoes(visita.observacoes || '');
      setNotificarConfirmacaoCliente(visita.notificar_confirmacao_cliente !== undefined ? visita.notificar_confirmacao_cliente : visita.notificar_confirmacao !== false);
      setNotificarConfirmacaoProprietario(visita.notificar_confirmacao_proprietario !== undefined ? visita.notificar_confirmacao_proprietario : visita.notificar_confirmacao !== false);
      setNotificarLembreteCliente(visita.notificar_lembrete_cliente !== undefined ? visita.notificar_lembrete_cliente : visita.notificar_lembrete !== false);
      setNotificarLembreteProprietario(visita.notificar_lembrete_proprietario !== undefined ? visita.notificar_lembrete_proprietario : visita.notificar_lembrete !== false);
      setNotificarPosVisitaCliente(visita.notificar_pos_visita_cliente !== undefined ? visita.notificar_pos_visita_cliente : visita.notificar_pos_visita !== false);
      setNotificarComprovacaoProprietario(visita.notificar_comprovacao_proprietario !== undefined ? visita.notificar_comprovacao_proprietario : true);
      setGravarLogsCliente(visita.gravar_logs_cliente !== undefined ? visita.gravar_logs_cliente : visita.gravar_logs !== false);
      setGravarLogsProprietario(visita.gravar_logs_proprietario !== undefined ? visita.gravar_logs_proprietario : visita.gravar_logs !== false);

      if (visita.data_hora_visita) {
        const d = new Date(visita.data_hora_visita);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        setDataHora(`${year}-${month}-${day}T${hours}:${minutes}`);
      }
    }
  }, [visita, isOpen]);

  // Lista dos objetos de imóveis atualmente selecionados
  const imoveisSelecionados = selectedImoveisIds
    .map((id) => imoveis.find((i) => i.id === id) || (visita.imovel?.id === id ? visita.imovel : undefined))
    .filter((i): i is Imovel => !!i);

  const imoveisDisponiveisParaAdicionar = imoveis.filter(
    (i) => !selectedImoveisIds.includes(i.id)
  );

  const selectedCliente = clientes.find((c) => c.id === clienteId) || visita.cliente;

  const handleAddImovel = (id: string) => {
    if (!id || selectedImoveisIds.includes(id)) return;
    setSelectedImoveisIds([...selectedImoveisIds, id]);
    setImovelToAddId('');
    setMostrarSeletorAdicional(false);
  };

  const handleRemoveImovel = (id: string) => {
    if (selectedImoveisIds.length <= 1) return;
    setSelectedImoveisIds(selectedImoveisIds.filter((item) => item !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImoveisIds.length === 0 || !clienteId || !dataHora) return;

    setIsSubmitting(true);
    try {
      const temConfirmacao = notificarConfirmacaoCliente || notificarConfirmacaoProprietario;
      const temLembrete = notificarLembreteCliente || notificarLembreteProprietario;

      await atualizarVisita(visita.id, {
        imovel_id: selectedImoveisIds[0],
        imoveis_ids: selectedImoveisIds,
        cliente_id: clienteId,
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
      });
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar visita:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Visita"
      subtitle="Atualize os imóveis do roteiro, cliente, data ou opções de notificação"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ─── 1. Roteiro de Múltiplos Imóveis ─── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-500" />
              Imóveis da Visita / Roteiro ({imoveisSelecionados.length} selecionado{imoveisSelecionados.length === 1 ? '' : 's'})
            </label>
            <span className="text-[11px] font-medium text-slate-400">
              1 ou mais imóveis vinculados
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex flex-wrap gap-2">
              {imoveisSelecionados.map((im, index) => (
                <div
                  key={im.id}
                  className="inline-flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 shadow-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="text-xs leading-tight">
                    <span className="font-mono text-[10px] font-bold text-blue-700 dark:text-blue-400 mr-1">
                      [{im.codigo || 'S/C'}]
                    </span>
                    <strong className="text-slate-800 dark:text-slate-200">{im.titulo}</strong>
                    <span className="text-slate-400 ml-1 text-[11px]">({im.bairro})</span>
                  </div>
                  {imoveisSelecionados.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImovel(im.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remover do roteiro"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Prévia dos Endereços do Roteiro */}
            {imoveisSelecionados.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Sequência do Roteiro:
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
            )}

            {/* Adicionar mais imóveis */}
            {imoveisDisponiveisParaAdicionar.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                {!mostrarSeletorAdicional ? (
                  <button
                    type="button"
                    onClick={() => setMostrarSeletorAdicional(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 py-1 px-2.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar imóvel ao roteiro
                  </button>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1">
                      <Select
                        value={imovelToAddId}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) handleAddImovel(val);
                        }}
                      >
                        <option value="">-- Selecione para adicionar ao roteiro --</option>
                        {imoveisDisponiveisParaAdicionar.map((im) => (
                          <option key={im.id} value={im.id}>
                            [{im.codigo || 'S/C'}] {im.titulo} — {im.bairro}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMostrarSeletorAdicional(false)}
                      className="px-2.5 py-2 text-xs font-semibold text-slate-500 rounded-xl bg-slate-200 dark:bg-slate-800 cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── 2. Seleção do Cliente ─── */}
        <div>
          <Select
            label="Cliente Visitante *"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
          >
            {clientes.map((cl) => (
              <option key={cl.id} value={cl.id}>
                {cl.nome} — Tel: {cl.telefone}
              </option>
            ))}
          </Select>
          {selectedCliente && (
            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>{selectedCliente.nome}</span>
              </div>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                {selectedCliente.telefone}
              </span>
            </div>
          )}
        </div>

        {/* ─── 3. Data, Horário e Status ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Data e Horário *"
            type="datetime-local"
            value={dataHora}
            onChange={(e) => setDataHora(e.target.value)}
            required
            icon={<Clock className="w-4 h-4" />}
          />

          <Select
            label="Status da Visita"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusVisita)}
          >
            <option value="agendada">Agendada</option>
            <option value="concluida">Realizada</option>
            <option value="nao_compareceu">Não Compareceu</option>
            <option value="cancelada">Cancelada</option>
            <option value="reagendada">Reagendada</option>
          </Select>
        </div>

        {/* ─── 4. Observações ─── */}
        <Textarea
          label="Observações Internas"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Ex: Cliente tem interesse em proposta à vista..."
          rows={2}
        />

        {/* ─── 5. Notificações WhatsApp (Layout em Matriz) ─── */}
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

        {/* ─── Rodapé ─── */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            <Save className="w-4 h-4 mr-1.5" />
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}

