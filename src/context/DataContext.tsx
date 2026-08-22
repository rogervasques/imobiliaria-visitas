'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Cliente,
  ConfiguracaoWhatsApp,
  DashboardMetrics,
  Imovel,
  Proprietario,
  StatusVisita,
  Visita,
  WhatsAppLog,
} from '@/types';
import {
  mockClientes,
  mockConfigWhatsApp,
  mockImoveis,
  mockProprietarios,
  mockLogs,
  mockVisitas,
} from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { buildTemplateContext, compileTemplate, sendWhatsAppMessage, TemplateContext } from '@/lib/whatsapp';
import { useAuth } from './AuthContext';
import { generateInstanceName } from '@/lib/auth';

interface DataContextType {
  imoveis: Imovel[];
  proprietarios: Proprietario[];
  clientes: Cliente[];
  visitas: Visita[];
  configWhatsApp: ConfiguracaoWhatsApp;
  logs: WhatsAppLog[];
  metrics: DashboardMetrics;
  isLoading: boolean;
  
  // Imóveis
  adicionarImovel: (imovel: Omit<Imovel, 'id' | 'criado_em'>) => Promise<Imovel>;
  atualizarImovel: (id: string, imovel: Partial<Imovel>) => Promise<void>;
  removerImovel: (id: string) => Promise<void>;

  // Proprietários
  adicionarProprietario: (proprietario: Omit<Proprietario, 'id' | 'criado_em'>) => Promise<Proprietario>;
  atualizarProprietario: (id: string, proprietario: Partial<Proprietario>) => Promise<void>;
  
  // Clientes
  adicionarCliente: (cliente: Omit<Cliente, 'id' | 'criado_em'>) => Promise<Cliente>;
  atualizarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  removerCliente: (id: string) => Promise<void>;
  
  // Visitas
  adicionarVisita: (visita: Omit<Visita, 'id' | 'criado_em'>, enviarWhatsApp?: boolean) => Promise<Visita>;
  atualizarStatusVisita: (id: string, novoStatus: StatusVisita) => Promise<void>;
  atualizarVisita: (id: string, visita: Partial<Visita>) => Promise<void>;
  removerVisita: (id: string) => Promise<void>;
  
  // WhatsApp
  atualizarConfigWhatsApp: (config: Partial<ConfiguracaoWhatsApp>) => Promise<void>;
  dispararWhatsAppManual: (visitaId: string, tipo: 'confirmacao' | 'lembrete' | 'pos_visita', destinatario: 'cliente' | 'proprietario' | 'ambos') => Promise<{ success: boolean; message: string }>;
  executarRotinaLembretes30m: () => Promise<{ processadas: number; enviadas: number; logs: string[] }>;
  
  // Feedback
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'easymob_visitas_';

// Helpers de ordenação alfabética
const sortImoveisAlphabetically = (list: Imovel[]): Imovel[] =>
  [...list].sort((a, b) => (a.titulo || '').localeCompare(b.titulo || '', 'pt-BR', { sensitivity: 'base' }));

const sortProprietariosAlphabetically = (list: Proprietario[]): Proprietario[] =>
  [...list].sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' }));

const sortClientesAlphabetically = (list: Cliente[]): Cliente[] =>
  [...list].sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' }));

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [configWhatsApp, setConfigWhatsApp] = useState<ConfiguracaoWhatsApp>(mockConfigWhatsApp);
  const [logs, setLogs] = useState<WhatsAppLog[]>(mockLogs);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // 1. Carregamento inicial (Supabase com fallback para LocalStorage e Mocks)
  const carregarDados = useCallback(async () => {
    setIsLoading(true);
    try {
      const getLocalItem = (key: string) =>
        localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`) ||
        localStorage.getItem(`imobiliaria_visitas_${key}`);

      // Tenta buscar no Supabase
      const { data: dbImoveis, error: errImoveis } = await supabase.from('imoveis').select('*');
      const { data: dbProprietarios, error: errProprietarios } = await supabase.from('proprietarios').select('*');
      const { data: dbClientes, error: errClientes } = await supabase.from('clientes').select('*');
      const { data: dbVisitas, error: errVisitas } = await supabase.from('visitas').select('*');
      const { data: dbConfig, error: errConfig } = await supabase.from('configuracoes_whatsapp').select('*').single();

      let loadedImoveis: Imovel[] = [];
      if (!errImoveis && dbImoveis && dbImoveis.length > 0) {
        loadedImoveis = dbImoveis;
      } else {
        const local = getLocalItem('imoveis');
        loadedImoveis = local ? JSON.parse(local) : mockImoveis;
      }
      const sortedImoveis = sortImoveisAlphabetically(loadedImoveis);
      setImoveis(sortedImoveis);

      // Proprietários
      let loadedProprietarios: Proprietario[] = [];
      if (!errProprietarios && dbProprietarios && dbProprietarios.length > 0) {
        loadedProprietarios = dbProprietarios;
      } else {
        const local = getLocalItem('proprietarios');
        if (local) {
          loadedProprietarios = JSON.parse(local);
        } else {
          // Extrai proprietários únicos a partir dos imóveis carregados
          const map = new Map<string, Proprietario>();
          sortedImoveis.forEach((im) => {
            const key = im.proprietario_telefone.trim().toLowerCase();
            if (!map.has(key)) {
              map.set(key, {
                id: im.proprietario_id || `prop_${Math.random().toString(36).substr(2, 9)}`,
                nome: im.proprietario_nome,
                telefone: im.proprietario_telefone,
                email: im.proprietario_email,
                criado_em: im.criado_em || new Date().toISOString(),
              });
            }
          });
          loadedProprietarios = Array.from(map.values());
        }
      }
      const sortedProprietarios = sortProprietariosAlphabetically(loadedProprietarios);
      setProprietarios(sortedProprietarios);

      let loadedClientes: Cliente[] = [];
      if (!errClientes && dbClientes && dbClientes.length > 0) {
        loadedClientes = dbClientes;
      } else {
        const local = getLocalItem('clientes');
        loadedClientes = local ? JSON.parse(local) : mockClientes;
      }
      const sortedClientes = sortClientesAlphabetically(loadedClientes);
      setClientes(sortedClientes);

      if (!errConfig && dbConfig && dbConfig.api_url && !dbConfig.api_url.includes('exemplo-evolution')) {
        setConfigWhatsApp(dbConfig);
      } else {
        const local = getLocalItem('config_wa');
        const parsed = local ? JSON.parse(local) : null;
        if (parsed && parsed.api_url && !parsed.api_url.includes('exemplo-evolution')) {
          setConfigWhatsApp(parsed);
        } else {
          setConfigWhatsApp(mockConfigWhatsApp);
        }
      }

      let loadedVisitas: Visita[] = [];
      if (!errVisitas && dbVisitas && dbVisitas.length > 0) {
        loadedVisitas = dbVisitas;
      } else {
        const local = getLocalItem('visitas');
        loadedVisitas = local ? JSON.parse(local) : mockVisitas;
      }

      // Popula referências de Imóvel e Cliente garantindo que NUNCA fiquem vazias
      const populatedVisitas = loadedVisitas.map((v, idx) => {
        // 1. Encontra imóvel principal
        let imovelPrincipal = sortedImoveis.find((i) => i.id === v.imovel_id);
        if (!imovelPrincipal && v.imovel && v.imovel.titulo) {
          imovelPrincipal = sortedImoveis.find((i) => i.titulo === v.imovel?.titulo) || v.imovel;
        }
        if (!imovelPrincipal && sortedImoveis.length > 0) {
          imovelPrincipal = sortedImoveis[idx % sortedImoveis.length];
        }

        // 2. Encontra roteiro de múltiplos imóveis
        let imoveisRoteiro: Imovel[] = [];
        if (v.imoveis_ids && v.imoveis_ids.length > 0) {
          imoveisRoteiro = v.imoveis_ids
            .map((id) => sortedImoveis.find((i) => i.id === id))
            .filter((i): i is Imovel => !!i);
        }
        if (imoveisRoteiro.length === 0 && v.imoveis && v.imoveis.length > 0) {
          imoveisRoteiro = v.imoveis;
        }
        if (imoveisRoteiro.length === 0 && imovelPrincipal) {
          imoveisRoteiro = [imovelPrincipal];
        }

        // 3. Encontra cliente
        let clienteRef = sortedClientes.find((c: Cliente) => c.id === v.cliente_id);
        if (!clienteRef && v.cliente && v.cliente.nome) {
          clienteRef = sortedClientes.find((c: Cliente) => c.nome === v.cliente?.nome) || v.cliente;
        }
        if (!clienteRef && sortedClientes.length > 0) {
          clienteRef = sortedClientes[idx % sortedClientes.length];
        }

        return {
          ...v,
          imovel_id: imovelPrincipal?.id || v.imovel_id,
          imoveis_ids: imoveisRoteiro.map((i) => i.id),
          cliente_id: clienteRef?.id || v.cliente_id,
          imovel: imovelPrincipal,
          imoveis: imoveisRoteiro,
          cliente: clienteRef,
        };
      });

      setVisitas(populatedVisitas);
    } catch (e) {
      console.warn('Usando armazenamento local/mock:', e);
      setImoveis(sortImoveisAlphabetically(mockImoveis));
      setProprietarios(sortProprietariosAlphabetically(mockProprietarios));
      setClientes(sortClientesAlphabetically(mockClientes));
      setVisitas(mockVisitas);
      setConfigWhatsApp(mockConfigWhatsApp);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Persistência local auxiliar
  const persistir = (key: string, data: unknown) => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, JSON.stringify(data));
    } catch {
      // no-op
    }
  };

  // -------------------------------------------------------------
  // CRUD PROPRIETÁRIOS
  // -------------------------------------------------------------
  const adicionarProprietario = async (
    dados: Omit<Proprietario, 'id' | 'criado_em'>
  ): Promise<Proprietario> => {
    const novoProp: Proprietario = {
      ...dados,
      id: crypto.randomUUID ? crypto.randomUUID() : `prop_${Date.now()}`,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    try {
      await supabase.from('proprietarios').insert(novoProp);
    } catch (err) {
      console.warn('Supabase insert proprietario offline:', err);
    }

    const updated = sortProprietariosAlphabetically([novoProp, ...proprietarios]);
    setProprietarios(updated);
    persistir('proprietarios', updated);
    return novoProp;
  };

  const atualizarProprietario = async (id: string, dados: Partial<Proprietario>) => {
    try {
      await supabase.from('proprietarios').update(dados).eq('id', id);
    } catch (err) {
      console.warn('Supabase update proprietario offline:', err);
    }

    const updated = sortProprietariosAlphabetically(
      proprietarios.map((p) => (p.id === id ? { ...p, ...dados, atualizado_em: new Date().toISOString() } : p))
    );
    setProprietarios(updated);
    persistir('proprietarios', updated);

    // Sincroniza dados nos imóveis vinculados
    setImoveis((prev) =>
      sortImoveisAlphabetically(
        prev.map((im) =>
          im.proprietario_id === id
            ? {
                ...im,
                proprietario_nome: dados.nome || im.proprietario_nome,
                proprietario_telefone: dados.telefone || im.proprietario_telefone,
                proprietario_email: dados.email !== undefined ? dados.email : im.proprietario_email,
              }
            : im
        )
      )
    );
  };

  // -------------------------------------------------------------
  // CRUD IMÓVEIS & GATILHO DE EXCLUSÃO INTELIGENTE DE PROPRIETÁRIO
  // -------------------------------------------------------------
  const adicionarImovel = async (dados: Omit<Imovel, 'id' | 'criado_em'>): Promise<Imovel> => {
    let finalPropId = dados.proprietario_id;

    // Se não tem proprietario_id, busca por telefone ou cria um novo proprietário automaticamente
    if (!finalPropId && dados.proprietario_nome && dados.proprietario_telefone) {
      const cleanPhone = dados.proprietario_telefone.trim().toLowerCase();
      const existing = proprietarios.find(
        (p) => p.telefone.trim().toLowerCase() === cleanPhone || p.nome.trim().toLowerCase() === dados.proprietario_nome.trim().toLowerCase()
      );

      if (existing) {
        finalPropId = existing.id;
      } else {
        const criado = await adicionarProprietario({
          nome: dados.proprietario_nome,
          telefone: dados.proprietario_telefone,
          email: dados.proprietario_email,
        });
        finalPropId = criado.id;
      }
    }

    const novoImovel: Imovel = {
      ...dados,
      proprietario_id: finalPropId,
      id: crypto.randomUUID ? crypto.randomUUID() : `imovel_${Date.now()}`,
      criado_em: new Date().toISOString(),
    };

    try {
      await supabase.from('imoveis').insert(novoImovel);
    } catch (err) {
      console.warn('Supabase insert imovel offline:', err);
    }

    const updated = sortImoveisAlphabetically([novoImovel, ...imoveis]);
    setImoveis(updated);
    persistir('imoveis', updated);
    showToast(`Imóvel "${novoImovel.titulo}" cadastrado com sucesso!`, 'success');
    return novoImovel;
  };

  const atualizarImovel = async (id: string, dados: Partial<Imovel>) => {
    try {
      await supabase.from('imoveis').update(dados).eq('id', id);
    } catch (err) {
      console.warn('Supabase update imovel offline:', err);
    }

    const updated = sortImoveisAlphabetically(
      imoveis.map((im) => (im.id === id ? { ...im, ...dados, atualizado_em: new Date().toISOString() } : im))
    );
    setImoveis(updated);
    persistir('imoveis', updated);
    
    // Atualiza referências nas visitas
    setVisitas((prev) =>
      prev.map((v) => (v.imovel_id === id ? { ...v, imovel: { ...v.imovel, ...dados } as Imovel } : v))
    );
    showToast('Imóvel atualizado com sucesso!', 'success');
  };

  const removerImovel = async (id: string) => {
    const imovelParaRemover = imoveis.find((im) => im.id === id);

    try {
      await supabase.from('imoveis').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete imovel offline:', err);
    }

    const updatedImoveis = imoveis.filter((im) => im.id !== id);
    setImoveis(updatedImoveis);
    persistir('imoveis', updatedImoveis);

    // ─── GATILHO DA REGRA 3: Exclusão Automática de Proprietário Órfão ───
    if (imovelParaRemover) {
      const propId = imovelParaRemover.proprietario_id;
      const propPhone = imovelParaRemover.proprietario_telefone?.trim().toLowerCase();

      // Verifica se restou algum OUTRO imóvel desse mesmo proprietário
      const remainingCount = updatedImoveis.filter(
        (im) => (propId && im.proprietario_id === propId) || (propPhone && im.proprietario_telefone?.trim().toLowerCase() === propPhone)
      ).length;

      if (remainingCount === 0) {
        // Exclui o proprietário automaticamente do banco e do estado
        if (propId) {
          try {
            await supabase.from('proprietarios').delete().eq('id', propId);
          } catch (err) {
            console.warn('Supabase delete proprietario orfao offline:', err);
          }
        }
        const updatedProps = proprietarios.filter(
          (p) => (propId ? p.id !== propId : p.telefone?.trim().toLowerCase() !== propPhone)
        );
        setProprietarios(updatedProps);
        persistir('proprietarios', updatedProps);
        showToast('Imóvel excluído. Como era o único imóvel do proprietário, o cadastro dele foi removido automaticamente.', 'info');
        return;
      }
    }

    showToast('Imóvel excluído com sucesso.', 'info');
  };

  // -------------------------------------------------------------
  // CRUD CLIENTES
  // -------------------------------------------------------------
  const adicionarCliente = async (dados: Omit<Cliente, 'id' | 'criado_em'>): Promise<Cliente> => {
    const novoCliente: Cliente = {
      ...dados,
      id: crypto.randomUUID ? crypto.randomUUID() : `cliente_${Date.now()}`,
      criado_em: new Date().toISOString(),
    };

    try {
      await supabase.from('clientes').insert(novoCliente);
    } catch (err) {
      console.warn('Supabase insert cliente offline:', err);
    }

    const updated = sortClientesAlphabetically([novoCliente, ...clientes]);
    setClientes(updated);
    persistir('clientes', updated);
    showToast(`Cliente "${novoCliente.nome}" cadastrado!`, 'success');
    return novoCliente;
  };

  const atualizarCliente = async (id: string, dados: Partial<Cliente>) => {
    try {
      await supabase.from('clientes').update(dados).eq('id', id);
    } catch (err) {
      console.warn('Supabase update cliente offline:', err);
    }

    const updated = sortClientesAlphabetically(
      clientes.map((cl) => (cl.id === id ? { ...cl, ...dados, atualizado_em: new Date().toISOString() } : cl))
    );
    setClientes(updated);
    persistir('clientes', updated);
    
    // Atualiza referências nas visitas
    setVisitas((prev) =>
      prev.map((v) => (v.cliente_id === id ? { ...v, cliente: { ...v.cliente, ...dados } as Cliente } : v))
    );
    showToast('Cliente atualizado!', 'success');
  };

  const removerCliente = async (id: string) => {
    try {
      await supabase.from('clientes').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete cliente offline:', err);
    }

    const updated = clientes.filter((cl) => cl.id !== id);
    setClientes(updated);
    persistir('clientes', updated);
    showToast('Cliente removido.', 'info');
  };

  // -------------------------------------------------------------
  // CRUD VISITAS & AUTOMAÇÕES WHATSAPP
  // -------------------------------------------------------------
  const adicionarVisita = async (
    dados: Omit<Visita, 'id' | 'criado_em'>,
    enviarWhatsApp = true
  ): Promise<Visita> => {
    const visitDate = new Date(dados.data_hora_visita);
    // 1 hora antes para lembrete
    const reminderDate = new Date(visitDate.getTime() - 60 * 60 * 1000);
    // 2 horas depois para pós-visita / feedback
    const posVisitaDate = new Date(visitDate.getTime() + 120 * 60 * 1000);

    const imoveisIds = (dados.imoveis_ids && dados.imoveis_ids.length > 0)
      ? dados.imoveis_ids
      : dados.imovel_id ? [dados.imovel_id] : [];

    const primaryImovelId = imoveisIds[0] || dados.imovel_id;
    const imovelRef = imoveis.find((i) => i.id === primaryImovelId);
    const imoveisRefs = imoveisIds.map((id) => imoveis.find((i) => i.id === id)).filter((i): i is Imovel => !!i);
    const clienteRef = clientes.find((c) => c.id === dados.cliente_id);

    const notificarConfirmacao = dados.notificar_confirmacao !== undefined ? dados.notificar_confirmacao : true;
    const notificarLembrete = dados.notificar_lembrete !== undefined ? dados.notificar_lembrete : true;
    const notificarPosVisita = dados.notificar_pos_visita !== undefined ? dados.notificar_pos_visita : true;

    const createdByUserId = dados.created_by_user_id || user?.id || 'user-admin-master';
    const createdByUserNome = dados.created_by_user_nome || user?.name || 'Roger Vasques Berchembrock';

    const novaVisita: Visita = {
      ...dados,
      id: crypto.randomUUID ? crypto.randomUUID() : `visita_${Date.now()}`,
      imovel_id: primaryImovelId,
      imoveis_ids: imoveisIds,
      created_by_user_id: createdByUserId,
      created_by_user_nome: createdByUserNome,
      lembrete_agendado_para: reminderDate.toISOString(),
      pos_visita_agendado_para: posVisitaDate.toISOString(),
      notificar_confirmacao: notificarConfirmacao,
      notificar_lembrete: notificarLembrete,
      notificar_pos_visita: notificarPosVisita,
      status: dados.status || 'agendada',
      whatsapp_confirmacao_cliente: notificarConfirmacao ? 'pendente' : 'ignorado',
      whatsapp_confirmacao_proprietario: notificarConfirmacao ? 'pendente' : 'ignorado',
      whatsapp_lembrete_cliente: notificarLembrete ? 'pendente' : 'ignorado',
      whatsapp_lembrete_proprietario: notificarLembrete ? 'pendente' : 'ignorado',
      whatsapp_pos_visita_cliente: notificarPosVisita ? 'pendente' : 'ignorado',
      criado_em: new Date().toISOString(),
      imovel: imovelRef,
      imoveis: imoveisRefs.length > 0 ? imoveisRefs : (imovelRef ? [imovelRef] : []),
      cliente: clienteRef,
    };

    // Disparo imediato de confirmação WhatsApp se habilitado e configurado
    if (enviarWhatsApp && notificarConfirmacao && configWhatsApp.ativo) {
      const ctx = buildTemplateContext(novaVisita);
      const visitInstanceName = (novaVisita.created_by_user_id === user?.id ? user?.instance_name : null) || (novaVisita.created_by_user_id ? generateInstanceName(novaVisita.created_by_user_id) : configWhatsApp.instancia_nome || 'easymob');

      // 1. Dispara para o Cliente (com roteiro completo de imóveis)
      if (clienteRef?.telefone) {
        const msgCliente = compileTemplate(configWhatsApp.template_confirmacao_cliente, ctx);
        const resCliente = await sendWhatsAppMessage({
          toPhone: clienteRef.telefone,
          message: msgCliente,
          config: configWhatsApp,
          instanceName: visitInstanceName,
          logInfo: {
            visitaId: novaVisita.id,
            tipoMensagem: 'confirmacao_cliente',
            destinatarioNome: clienteRef.nome,
            tipoDestinatario: 'cliente',
          },
        });
        novaVisita.whatsapp_confirmacao_cliente = resCliente.success ? 'enviado' : 'falha';
      }

      // 2. Dispara confirmação para os proprietários dos imóveis visitados
      let propSuccessCount = 0;
      const uniquePropsTelefones = new Set<string>();

      for (const im of (novaVisita.imoveis || [novaVisita.imovel])) {
        if (!im || !im.proprietario_telefone) continue;
        if (uniquePropsTelefones.has(im.proprietario_telefone.trim())) continue;
        uniquePropsTelefones.add(im.proprietario_telefone.trim());

        const propCtx: TemplateContext = {
          ...ctx,
          imovel_titulo: im.titulo,
          imovel_codigo: im.codigo || '',
          endereco: `${im.endereco}${im.numero ? `, ${im.numero}` : ''} - ${im.bairro}`,
          proprietario_nome: im.proprietario_nome,
          proprietario_telefone: im.proprietario_telefone,
        };

        const msgProp = compileTemplate(configWhatsApp.template_confirmacao_proprietario, propCtx);
        const resProp = await sendWhatsAppMessage({
          toPhone: im.proprietario_telefone,
          message: msgProp,
          config: configWhatsApp,
          instanceName: visitInstanceName,
          logInfo: {
            visitaId: novaVisita.id,
            tipoMensagem: 'confirmacao_proprietario',
            destinatarioNome: im.proprietario_nome,
            tipoDestinatario: 'proprietario',
          },
        });
        if (resProp.success) propSuccessCount++;
      }

      novaVisita.whatsapp_confirmacao_proprietario = propSuccessCount > 0 ? 'enviado' : 'falha';
    }

    try {
      const { imovel: _im, imoveis: _ims, cliente: _cl, ...visitaDataOnly } = novaVisita;
      void _im; void _ims; void _cl;
      await supabase.from('visitas').insert(visitaDataOnly);
    } catch (err) {
      console.warn('Supabase insert visita offline:', err);
    }

    const updated = [novaVisita, ...visitas];
    setVisitas(updated);
    persistir('visitas', updated);

    showToast(
      enviarWhatsApp && notificarConfirmacao
        ? `Visita agendada com roteiro de ${novaVisita.imoveis?.length || 1} imóvel(is) e confirmações via WhatsApp!`
        : `Visita agendada com roteiro de ${novaVisita.imoveis?.length || 1} imóvel(is)!`,
      'success'
    );

    return novaVisita;
  };

  const atualizarStatusVisita = async (id: string, novoStatus: StatusVisita) => {
    try {
      await supabase.from('visitas').update({ status: novoStatus }).eq('id', id);
    } catch (err) {
      console.warn('Supabase update status visita offline:', err);
    }

    const updated = visitas.map((v) => (v.id === id ? { ...v, status: novoStatus, atualizado_em: new Date().toISOString() } : v));
    setVisitas(updated);
    persistir('visitas', updated);
    showToast(`Status da visita alterado para "${novoStatus.toUpperCase()}"`, 'info');
  };

  const atualizarVisita = async (id: string, dados: Partial<Visita>) => {
    try {
      const { imovel: _i, imoveis: _ims, cliente: _c, ...dbData } = dados;
      void _i; void _ims; void _c;
      await supabase.from('visitas').update(dbData).eq('id', id);
    } catch (err) {
      console.warn('Supabase update visita offline:', err);
    }

    const updated = visitas.map((v) => {
      if (v.id === id) {
        const finalImoveisIds = dados.imoveis_ids || v.imoveis_ids || (dados.imovel_id ? [dados.imovel_id] : [v.imovel_id]);
        const primaryImovelId = finalImoveisIds[0] || dados.imovel_id || v.imovel_id;
        const imovelRef = imoveis.find((i) => i.id === primaryImovelId) || v.imovel;
        const imoveisRefs = finalImoveisIds.map((iid) => imoveis.find((i) => i.id === iid)).filter((i): i is Imovel => !!i);
        const clienteRef = dados.cliente_id ? clientes.find((c) => c.id === dados.cliente_id) : v.cliente;

        return {
          ...v,
          ...dados,
          imovel_id: primaryImovelId,
          imoveis_ids: finalImoveisIds,
          imovel: imovelRef,
          imoveis: imoveisRefs.length > 0 ? imoveisRefs : (imovelRef ? [imovelRef] : []),
          cliente: clienteRef,
          atualizado_em: new Date().toISOString(),
        };
      }
      return v;
    });

    setVisitas(updated);
    persistir('visitas', updated);
    showToast('Visita atualizada com sucesso!', 'success');
  };

  const removerVisita = async (id: string) => {
    try {
      await supabase.from('visitas').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete visita offline:', err);
    }

    const updated = visitas.filter((v) => v.id !== id);
    setVisitas(updated);
    persistir('visitas', updated);
    showToast('Visita excluída.', 'info');
  };

  // -------------------------------------------------------------
  // CONFIGURAÇÃO WHATSAPP & DISPARO MANUAL / LEMBRETES / PÓS-VISITA
  // -------------------------------------------------------------
  const atualizarConfigWhatsApp = async (dados: Partial<ConfiguracaoWhatsApp>) => {
    const updated = { ...configWhatsApp, ...dados, atualizado_em: new Date().toISOString() };
    setConfigWhatsApp(updated);
    persistir('config_wa', updated);

    try {
      await supabase.from('configuracoes_whatsapp').upsert(updated);
    } catch (err) {
      console.warn('Supabase upsert config WA offline:', err);
    }

    showToast('Configurações do WhatsApp salvas com sucesso!', 'success');
  };

  const dispararWhatsAppManual = async (
    visitaId: string,
    tipo: 'confirmacao' | 'lembrete' | 'pos_visita',
    destinatario: 'cliente' | 'proprietario' | 'ambos'
  ): Promise<{ success: boolean; message: string }> => {
    const visita = visitas.find((v) => v.id === visitaId);
    if (!visita) {
      return { success: false, message: 'Visita não encontrada' };
    }

    const ctx = buildTemplateContext(visita);
    const visitInstanceName = (visita.created_by_user_id === user?.id ? user?.instance_name : null) || (visita.created_by_user_id ? generateInstanceName(visita.created_by_user_id) : configWhatsApp.instancia_nome || 'easymob');
    let successCount = 0;
    const errors: string[] = [];

    // 1. Envio para o Cliente
    if ((destinatario === 'cliente' || destinatario === 'ambos') && visita.cliente?.telefone) {
      let template = configWhatsApp.template_confirmacao_cliente;
      let tipoMsg: WhatsAppLog['tipo_mensagem'] = 'confirmacao_cliente';

      if (tipo === 'lembrete') {
        template = configWhatsApp.template_lembrete_cliente;
        tipoMsg = 'lembrete_cliente';
      } else if (tipo === 'pos_visita') {
        template = configWhatsApp.template_pos_visita_cliente;
        tipoMsg = 'pos_visita_cliente';
      }

      const msg = compileTemplate(template, ctx);
      const res = await sendWhatsAppMessage({
        toPhone: visita.cliente.telefone,
        message: msg,
        config: configWhatsApp,
        instanceName: visitInstanceName,
        logInfo: {
          visitaId: visita.id,
          tipoMensagem: tipoMsg,
          destinatarioNome: visita.cliente.nome,
          tipoDestinatario: 'cliente',
        },
      });

      if (res.success) {
        successCount++;
        await atualizarVisita(visita.id, {
          ...(tipo === 'confirmacao'
            ? { whatsapp_confirmacao_cliente: 'enviado' }
            : tipo === 'lembrete'
            ? { whatsapp_lembrete_cliente: 'enviado' }
            : { whatsapp_pos_visita_cliente: 'enviado' }),
        });
      } else {
        errors.push(`Cliente: ${res.error}`);
      }
    }

    // 2. Envio para o(s) Proprietário(s) (para confirmação e lembrete)
    if (tipo !== 'pos_visita' && (destinatario === 'proprietario' || destinatario === 'ambos')) {
      const template = tipo === 'confirmacao' ? configWhatsApp.template_confirmacao_proprietario : configWhatsApp.template_lembrete_proprietario;
      const imoveisLista = visita.imoveis && visita.imoveis.length > 0 ? visita.imoveis : [visita.imovel];
      const propsEnviados = new Set<string>();

      for (const im of imoveisLista) {
        if (!im || !im.proprietario_telefone) continue;
        if (propsEnviados.has(im.proprietario_telefone.trim())) continue;
        propsEnviados.add(im.proprietario_telefone.trim());

        const propCtx: TemplateContext = {
          ...ctx,
          imovel_titulo: im.titulo,
          imovel_codigo: im.codigo || '',
          endereco: `${im.endereco}${im.numero ? `, ${im.numero}` : ''} - ${im.bairro}`,
          proprietario_nome: im.proprietario_nome,
          proprietario_telefone: im.proprietario_telefone,
        };

        const msg = compileTemplate(template, propCtx);
        const res = await sendWhatsAppMessage({
          toPhone: im.proprietario_telefone,
          message: msg,
          config: configWhatsApp,
          instanceName: visitInstanceName,
          logInfo: {
            visitaId: visita.id,
            tipoMensagem: tipo === 'confirmacao' ? 'confirmacao_proprietario' : 'lembrete_proprietario',
            destinatarioNome: im.proprietario_nome,
            tipoDestinatario: 'proprietario',
          },
        });

        if (res.success) {
          successCount++;
        } else {
          errors.push(`Proprietário (${im.proprietario_nome}): ${res.error}`);
        }
      }

      if (successCount > 0) {
        await atualizarVisita(visita.id, {
          ...(tipo === 'confirmacao' ? { whatsapp_confirmacao_proprietario: 'enviado' } : { whatsapp_lembrete_proprietario: 'enviado' }),
        });
      }
    }

    if (successCount > 0) {
      const label = tipo === 'confirmacao' ? 'Confirmação' : tipo === 'lembrete' ? 'Lembrete' : 'Pós-visita / Feedback';
      showToast(`${label} disparado via WhatsApp!`, 'success');
      return { success: true, message: `${successCount} mensagem(ns) enviada(s) com sucesso.` };
    }

    showToast(`Erro no envio: ${errors.join(', ')}`, 'error');
    return { success: false, message: errors.join(', ') };
  };

  // -------------------------------------------------------------
  // ROTINA DE AUTOMAÇÕES CRON (LEMBRETES 1H ANTES + PÓS-VISITA 2H DEPOIS)
  // -------------------------------------------------------------
  const executarRotinaLembretes30m = async (): Promise<{ processadas: number; enviadas: number; logs: string[] }> => {
    const logsList: string[] = [];
    const agora = new Date();
    let enviadas = 0;

    // 1. Lembretes (1 hora antes - janela de 0 a 65 min)
    const visitasLembrete = visitas.filter((v) => {
      if (v.status === 'cancelada' || v.notificar_lembrete === false) return false;
      if (v.whatsapp_lembrete_cliente === 'enviado' && v.whatsapp_lembrete_proprietario === 'enviado') return false;
      
      const visitDate = new Date(v.data_hora_visita);
      const diffMinutes = (visitDate.getTime() - agora.getTime()) / (1000 * 60);
      return diffMinutes > 0 && diffMinutes <= 65;
    });

    // 2. Pós-Visita (2 horas após - janela de visitas que ocorreram entre 110 e 200 min atrás)
    const visitasPosVisita = visitas.filter((v) => {
      if (v.status === 'cancelada' || v.notificar_pos_visita === false) return false;
      if (v.whatsapp_pos_visita_cliente === 'enviado' || v.whatsapp_pos_visita_cliente === 'ignorado') return false;

      const visitDate = new Date(v.data_hora_visita);
      const diffMinutesSinceVisit = (agora.getTime() - visitDate.getTime()) / (1000 * 60);
      return diffMinutesSinceVisit >= 110 && diffMinutesSinceVisit <= 200;
    });

    for (const v of visitasLembrete) {
      logsList.push(`[Lembrete 1h] Processando roteiro de ${v.imoveis?.length || 1} imóvel(is) - Cliente: ${v.cliente?.nome}`);
      const res = await dispararWhatsAppManual(v.id, 'lembrete', 'ambos');
      if (res.success) {
        enviadas++;
        logsList.push(`✅ Lembrete enviado para visita ${v.id}`);
      } else {
        logsList.push(`❌ Falha no lembrete da visita ${v.id}: ${res.message}`);
      }
    }

    for (const v of visitasPosVisita) {
      logsList.push(`[Pós-Visita 2h] Enviando pesquisa de feedback para: ${v.cliente?.nome}`);
      const res = await dispararWhatsAppManual(v.id, 'pos_visita', 'cliente');
      if (res.success) {
        enviadas++;
        logsList.push(`✅ Mensagem pós-visita enviada para ${v.cliente?.nome}`);
      } else {
        logsList.push(`❌ Falha pós-visita ${v.id}: ${res.message}`);
      }
    }

    const totalProcessadas = visitasLembrete.length + visitasPosVisita.length;
    showToast(`Automação concluída: ${enviadas} mensagem(ns) disparada(s).`, enviadas > 0 ? 'success' : 'info');
    return {
      processadas: totalProcessadas,
      enviadas,
      logs: logsList,
    };
  };

  // -------------------------------------------------------------
  // MÉTRICAS CALCULADAS PARA O DASHBOARD
  // -------------------------------------------------------------
  const agora = new Date();
  const hojeStr = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

  const visitasHoje = visitas.filter((v) => {
    const vDate = new Date(v.data_hora_visita);
    const vStr = `${vDate.getFullYear()}-${String(vDate.getMonth() + 1).padStart(2, '0')}-${String(vDate.getDate()).padStart(2, '0')}`;
    return vStr === hojeStr;
  });

  const visitasConfirmadasHoje = visitasHoje.filter((v) => v.status === 'confirmada').length;
  const visitasCanceladasHoje = visitasHoje.filter((v) => v.status === 'cancelada').length;
  const visitasPendentesHoje = visitasHoje.filter((v) => v.status === 'agendada').length;
  const totalImoveisAtivos = imoveis.filter((i) => i.status === 'disponivel').length;
  const totalClientesAtivos = clientes.filter((c) => c.status === 'ativo').length;
  const taxaConfirmacao = visitasHoje.length > 0 ? Math.round((visitasConfirmadasHoje / visitasHoje.length) * 100) : 100;

  const metrics: DashboardMetrics = {
    totalVisitasHoje: visitasHoje.length,
    visitasConfirmadasHoje,
    visitasCanceladasHoje,
    visitasPendentesHoje,
    totalImoveisAtivos,
    totalClientesAtivos,
    taxaConfirmacao,
  };


  return (
    <DataContext.Provider
      value={{
        imoveis,
        proprietarios,
        clientes,
        visitas,
        configWhatsApp,
        logs,
        metrics,
        isLoading,
        adicionarImovel,
        atualizarImovel,
        removerImovel,
        adicionarProprietario,
        atualizarProprietario,
        adicionarCliente,
        atualizarCliente,
        removerCliente,
        adicionarVisita,
        atualizarStatusVisita,
        atualizarVisita,
        removerVisita,
        atualizarConfigWhatsApp,
        dispararWhatsAppManual,
        executarRotinaLembretes30m,
        toastMessage,
        showToast,
        clearToast,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
}
