'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Cliente,
  ConfiguracaoWhatsApp,
  DashboardMetrics,
  EtapaCRM,
  Imovel,
  Proprietario,
  StatusCliente,
  StatusVisita,
  Visita,
  WhatsAppLog,
  LogSistema,
  ItemLixeira,
} from '@/types';
import {
  mockClientes,
  mockConfigWhatsApp,
  mockImoveis,
  mockProprietarios,
  mockLogs,
  mockVisitas,
} from '@/lib/mockData';
import { supabase, RATE_LIMIT_MESSAGE } from '@/lib/supabase';
import { buildTemplateContext, buildTemplateContextAsync, compileTemplate, sendWhatsAppMessage, TemplateContext, delay } from '@/lib/whatsapp';
import { useAuth } from './AuthContext';
import { useTenant } from './TenantContext';
import { generateInstanceName } from '@/lib/auth';

interface DataContextType {
  imoveis: Imovel[];
  proprietarios: Proprietario[];
  clientes: Cliente[];
  visitas: Visita[];
  allImoveis: Imovel[];
  allProprietarios: Proprietario[];
  allClientes: Cliente[];
  allVisitas: Visita[];
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
  
  // Clientes & CRM
  adicionarCliente: (cliente: Omit<Cliente, 'id' | 'criado_em'>) => Promise<Cliente>;
  atualizarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  moverEtapaCRM: (id: string, novaEtapa: EtapaCRM) => Promise<void>;
  removerCliente: (id: string) => Promise<void>;
  
  // Visitas
  adicionarVisita: (visita: Omit<Visita, 'id' | 'criado_em'>, enviarWhatsApp?: boolean) => Promise<Visita>;
  concluirVisita: (id: string, opcoes?: { enviarPosVisitaCliente?: boolean; enviarComprovacaoProprietario?: boolean }) => Promise<void>;
  atualizarStatusVisita: (id: string, novoStatus: StatusVisita) => Promise<void>;
  atualizarVisita: (id: string, visita: Partial<Visita>) => Promise<void>;
  removerVisita: (id: string) => Promise<void>;
  
  // Auditoria, Logs do Sistema & Lixeira
  registrarLogSistema: (acao: string, tabela: 'imoveis' | 'clientes' | 'visitas' | 'proprietarios' | 'usuarios' | 'configuracoes' | 'sistema', registroId?: string, detalhes?: Record<string, any>) => Promise<void>;
  restaurarRegistro: (tabela: 'imoveis' | 'clientes' | 'visitas' | 'proprietarios', id: string) => Promise<void>;
  carregarLixeira: () => Promise<ItemLixeira[]>;
  excluirDefinitivoLixeira: (tabela: 'imoveis' | 'clientes' | 'visitas' | 'proprietarios', id: string) => Promise<void>;
  purgarLixeiraExpirados: () => Promise<{ sucesso: boolean; visitas_purgadas: number; imoveis_purgados: number; clientes_purgados: number }>;
  carregarLogsSistema: (filtros?: { usuarioEmail?: string; acao?: string; tabela?: string; dataInicio?: string; dataFim?: string; limit?: number }) => Promise<LogSistema[]>;

  // WhatsApp
  atualizarConfigWhatsApp: (config: Partial<ConfiguracaoWhatsApp>) => Promise<void>;
  dispararWhatsAppManual: (visitaId: string, tipo: 'confirmacao' | 'lembrete' | 'pos_visita', destinatario: 'cliente' | 'proprietario' | 'ambos') => Promise<{ success: boolean; message: string }>;
  executarRotinaLembretes30m: () => Promise<{ processadas: number; enviadas: number; logs: string[] }>;
  
  // Multi-tenancy
  renomearImobiliariaCascade: (antigoNome: string, novoNome: string) => Promise<void>;

  // Feedback
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  carregarDados: () => Promise<void>;
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

const TENANT_ITEM_MAP_STORAGE_KEY = 'easymob_item_tenants_map';

export const extractTenantFromText = (text?: string | null): string | null => {
  if (!text) return null;
  const match = text.match(/\[tenant:([^\]]+)\]/i);
  return match ? match[1].trim() : null;
};

export const cleanTenantTag = (text?: string | null): string => {
  if (!text) return '';
  return text.replace(/\s*\[tenant:[^\]]+\]/gi, '').trim();
};

const getItemTenantMap = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(TENANT_ITEM_MAP_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const setItemTenantInMap = (itemId: string, tenantName?: string | null) => {
  if (typeof window === 'undefined' || !itemId || !tenantName) return;
  try {
    const map = getItemTenantMap();
    map[itemId] = tenantName;
    localStorage.setItem(TENANT_ITEM_MAP_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
};

// ─── SANITIZADORES DE PAYLOAD PARA GARANTIR PERSISTÊNCIA 100% NO SUPABASE ───
export const sanitizeImovelForDb = (im: Partial<Imovel>): Record<string, any> => {
  const {
    proprietario, // remove objeto React aninhado
    imovel,       // previne colisão
    ...rest
  } = im as any;

  const fotos = Array.isArray(rest.fotos_urls) && rest.fotos_urls.length > 0
    ? rest.fotos_urls.filter(Boolean)
    : rest.imagem_url ? [rest.imagem_url] : [];

  return {
    ...rest,
    imagem_url: rest.imagem_url || fotos[0] || undefined,
    fotos_urls: fotos,
  };
};

export const sanitizeClienteForDb = (cl: Partial<Cliente>): Record<string, any> => {
  const { ...rest } = cl as any;
  const clean: Record<string, any> = { ...rest };

  if ('orcamento_min' in clean) {
    clean.orcamento_min = typeof clean.orcamento_min === 'number' && !isNaN(clean.orcamento_min) ? clean.orcamento_min : (clean.orcamento_min ? Number(clean.orcamento_min) : null);
  }
  if ('orcamento_max' in clean) {
    clean.orcamento_max = typeof clean.orcamento_max === 'number' && !isNaN(clean.orcamento_max) ? clean.orcamento_max : (clean.orcamento_max ? Number(clean.orcamento_max) : null);
  }
  if ('preferencia_quartos' in clean) {
    clean.preferencia_quartos = typeof clean.preferencia_quartos === 'number' && !isNaN(clean.preferencia_quartos) ? clean.preferencia_quartos : (clean.preferencia_quartos ? parseInt(clean.preferencia_quartos, 10) : 0);
  }

  return clean;
};

export const sanitizeProprietarioForDb = (prop: Partial<Proprietario>): Record<string, any> => {
  const { imoveis_count, ...rest } = prop as any;
  return rest;
};

export const sanitizeVisitaForDb = (visita: Partial<Visita>): Record<string, any> => {
  const {
    imovel,
    imoveis,
    cliente,
    logs_mensagens,
    cliente_nome,
    cliente_telefone,
    data_hora,
    data_hora_fim,
    gravar_logs,
    gravar_logs_cliente,
    gravar_logs_proprietario,
    fim_gravacao_logs_em,
    notificar_confirmacao_cliente,
    notificar_confirmacao_proprietario,
    notificar_lembrete_cliente,
    notificar_lembrete_proprietario,
    notificar_pos_visita_cliente,
    notificar_comprovacao_proprietario,
    whatsapp_comprovacao_proprietario,
    ...rest
  } = visita as any;
  return rest;
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { currentTenant, imobiliarias } = useTenant();
  const [allImoveis, setAllImoveis] = useState<Imovel[]>([]);
  const [allProprietarios, setAllProprietarios] = useState<Proprietario[]>([]);
  const [allClientes, setAllClientes] = useState<Cliente[]>([]);
  const [allVisitas, setAllVisitas] = useState<Visita[]>([]);
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

  // Listener global para capturar erros de Rate Limit HTTP 429 do Supabase
  useEffect(() => {
    const handleRateLimit429 = (event: Event) => {
      const customEvent = event as CustomEvent;
      const msg = customEvent?.detail?.message || RATE_LIMIT_MESSAGE;
      showToast(msg, 'error');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('supabase_rate_limit_429', handleRateLimit429);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('supabase_rate_limit_429', handleRateLimit429);
      }
    };
  }, [showToast]);

  // Filtro de multi-tenant: filtra os dados para exibir exclusivamente os registros da imobiliária selecionada
  const matchesTenant = useCallback(
    (itemImobiliaria?: string | null) => {
      const activeTenantName = (currentTenant?.nome || imobiliarias[0]?.nome || 'Lagom Imóveis').trim().toLowerCase();
      const itemTenant = (itemImobiliaria || '').trim().toLowerCase();

      // 1. Se o registro tiver a mesma imobiliária selecionada
      if (itemTenant && itemTenant === activeTenantName) {
        return true;
      }

      // 2. Registros legados sem imobiliária explícita ou com valor 'easymob imóveis' / 'easymob':
      // Pertencem exclusivamente à imobiliária principal cadastrada (ex: Lagom Imóveis)
      const primaryTenantName = (imobiliarias[0]?.nome || 'Lagom Imóveis').trim().toLowerCase();
      if (!itemTenant || itemTenant === 'easymob imóveis' || itemTenant === 'easymob') {
        return activeTenantName === primaryTenantName;
      }

      return false;
    },
    [currentTenant?.nome, imobiliarias]
  );

  // 1. Carregamento inicial (Supabase com fallback para LocalStorage e Mocks)
  const carregarDados = useCallback(async () => {
    setIsLoading(true);
    try {
      const getLocalItem = (key: string) =>
        localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`) ||
        localStorage.getItem(`imobiliaria_visitas_${key}`);

      const tenantMap = getItemTenantMap();
      const defaultTenantName = imobiliarias[0]?.nome || 'Lagom Imóveis';

      // Tenta buscar no Supabase (apenas registros ativos, ignorando os que estão na lixeira)
      const { data: dbImoveis, error: errImoveis } = await supabase.from('imoveis').select('*').is('deletado_em', null);
      const { data: dbProprietarios, error: errProprietarios } = await supabase.from('proprietarios').select('*').is('deletado_em', null);
      const { data: dbClientes, error: errClientes } = await supabase.from('clientes').select('*').is('deletado_em', null);
      const { data: dbVisitas, error: errVisitas } = await supabase.from('visitas').select('*').is('deletado_em', null);
      const { data: dbConfig, error: errConfig } = await supabase.from('configuracoes_whatsapp').select('*').single();

      let loadedImoveis: Imovel[] = [];
      if (!errImoveis && dbImoveis) {
        loadedImoveis = dbImoveis.map((im) => {
          let fotos: string[] = [];
          if (Array.isArray(im.fotos_urls) && im.fotos_urls.length > 0) {
            fotos = im.fotos_urls.filter(Boolean);
          } else if (typeof im.fotos_urls === 'string' && im.fotos_urls.trim()) {
            try {
              const parsed = JSON.parse(im.fotos_urls);
              if (Array.isArray(parsed)) fotos = parsed.filter(Boolean);
              else if (typeof parsed === 'string') fotos = [parsed];
            } catch {
              fotos = im.fotos_urls.split(',').map((s: string) => s.trim()).filter(Boolean);
            }
          }

          if (fotos.length === 0 && im.imagem_url) {
            fotos = [im.imagem_url];
          }

          const mainImg = im.imagem_url || fotos[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80';
          if (fotos.length === 0) {
            fotos = [mainImg];
          }

          const imoTenant =
            im.imobiliaria ||
            extractTenantFromText(im.observacoes_chaves) ||
            extractTenantFromText(im.descricao_comercial) ||
            tenantMap[im.id] ||
            defaultTenantName;

          return {
            ...im,
            observacoes_chaves: cleanTenantTag(im.observacoes_chaves),
            descricao_comercial: cleanTenantTag(im.descricao_comercial),
            imagem_url: mainImg,
            fotos_urls: fotos,
            imobiliaria: imoTenant,
          };
        });
      } else {
        const local = getLocalItem('imoveis');
        loadedImoveis = local ? JSON.parse(local) : [];
      }
      const sortedImoveis = sortImoveisAlphabetically(loadedImoveis);
      setAllImoveis(sortedImoveis);

      // Proprietários
      let loadedProprietarios: Proprietario[] = [];
      if (!errProprietarios && dbProprietarios) {
        loadedProprietarios = dbProprietarios.map((p) => {
          // Busca tenant direto, via observações, via mapa ou via imóvel associado
          let pTenant = p.imobiliaria || extractTenantFromText(p.observacoes) || tenantMap[p.id];
          if (!pTenant && dbImoveis) {
            const owned = dbImoveis.find((im: any) => im.proprietario_id === p.id);
            if (owned) {
              pTenant = extractTenantFromText(owned.observacoes_chaves) || extractTenantFromText(owned.descricao_comercial) || tenantMap[owned.id];
            }
          }
          return {
            ...p,
            observacoes: cleanTenantTag(p.observacoes),
            imobiliaria: pTenant || defaultTenantName,
          };
        });
      } else {
        const local = getLocalItem('proprietarios');
        if (local) {
          loadedProprietarios = JSON.parse(local);
        } else {
          loadedProprietarios = [];
        }
      }
      const sortedProprietarios = sortProprietariosAlphabetically(loadedProprietarios);
      setAllProprietarios(sortedProprietarios);

      let loadedClientes: Cliente[] = [];
      if (!errClientes && dbClientes) {
        loadedClientes = dbClientes.map((c) => {
          const cliTenant = c.imobiliaria || extractTenantFromText(c.observacoes) || tenantMap[c.id] || defaultTenantName;
          return {
            ...c,
            observacoes: cleanTenantTag(c.observacoes),
            imobiliaria: cliTenant,
          };
        });
      } else {
        const local = getLocalItem('clientes');
        loadedClientes = local ? JSON.parse(local) : [];
      }

      // Normalização de Leads para o CRM
      const enrichedClientes = loadedClientes.map((c) => {
        let etapa: EtapaCRM = c.etapa_crm || 'novos_leads';
        if ((etapa as any) === 'novo') etapa = 'novos_leads';
        else if ((etapa as any) === 'em_atendimento') etapa = 'qualificacao';
        else if ((etapa as any) === 'visita_agendada') etapa = 'agendamento_visita';
        else if ((etapa as any) === 'proposta') etapa = 'proposta_negociacao';
        else if ((etapa as any) === 'fechado') etapa = 'venda_concluida';

        const imovelRef = c.imovel_interesse_id
          ? sortedImoveis.find((im) => im.id === c.imovel_interesse_id)
          : undefined;

        return {
          ...c,
          etapa_crm: etapa,
          imovel_interesse_id: c.imovel_interesse_id || imovelRef?.id,
          imovel_interesse_titulo: c.imovel_interesse_titulo || imovelRef?.titulo,
          imovel_interesse_foto: c.imovel_interesse_foto || imovelRef?.imagem_url,
          prioridade: c.prioridade || 'media',
        };
      });

      const sortedClientes = sortClientesAlphabetically(enrichedClientes);
      setAllClientes(sortedClientes);

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
      if (!errVisitas && dbVisitas) {
        loadedVisitas = dbVisitas;
      } else {
        const local = getLocalItem('visitas');
        loadedVisitas = local ? JSON.parse(local) : [];
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

        const visitaImobiliaria =
          v.imobiliaria ||
          extractTenantFromText(v.observacoes) ||
          tenantMap[v.id] ||
          imovelPrincipal?.imobiliaria ||
          defaultTenantName;

        return {
          ...v,
          observacoes: cleanTenantTag(v.observacoes),
          imobiliaria: visitaImobiliaria,
          imobiliaria_id: v.imobiliaria_id || imovelPrincipal?.imobiliaria_id,
          imovel_id: imovelPrincipal?.id || v.imovel_id,
          imoveis_ids: imoveisRoteiro.map((i) => i.id),
          cliente_id: clienteRef?.id || v.cliente_id,
          imovel: imovelPrincipal,
          imoveis: imoveisRoteiro,
          cliente: clienteRef,
        };
      });

      setAllVisitas(populatedVisitas);
    } catch (e) {
      console.warn('Usando armazenamento local/mock:', e);
      setAllImoveis(sortImoveisAlphabetically(mockImoveis));
      setAllProprietarios(sortProprietariosAlphabetically(mockProprietarios));
      setAllClientes(sortClientesAlphabetically(mockClientes));
      setAllVisitas(mockVisitas);
      setConfigWhatsApp(mockConfigWhatsApp);
    } finally {
      setIsLoading(false);
    }
  }, [imobiliarias]);

  useEffect(() => {
    carregarDados();

    // Supabase Realtime: sincronização em tempo real entre todos os usuários conectados
    const channel = supabase
      .channel('easymob-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'visitas' },
        () => {
          carregarDados();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'imoveis' },
        () => {
          carregarDados();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clientes' },
        () => {
          carregarDados();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [carregarDados]);

  // Persistência local auxiliar
  const persistir = (key: string, data: unknown) => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, JSON.stringify(data));
    } catch {
      // Ignora erro de cota
    }
  };

  // Coleções filtradas para a imobiliária ativa (Multi-tenancy)
  const imoveis = React.useMemo(() => allImoveis.filter((i) => matchesTenant(i.imobiliaria)), [allImoveis, matchesTenant]);
  const proprietarios = React.useMemo(() => allProprietarios.filter((p) => matchesTenant(p.imobiliaria)), [allProprietarios, matchesTenant]);
  const clientes = React.useMemo(() => allClientes.filter((c) => matchesTenant(c.imobiliaria)), [allClientes, matchesTenant]);
  
  // Regra de Acesso à Agenda e Visitas:
  // - Perfil Corretor: visualiza estritamente as visitas que ele mesmo criou ou é responsável
  // - Perfil Gestor: visualiza todas as visitas de toda a sua imobiliária
  // - Perfil Administrador: acesso global com alternância entre imobiliárias
  const visitas = React.useMemo(() => {
    return allVisitas.filter((v) => {
      const matchesTenantFilter = matchesTenant(v.imobiliaria);
      if (!matchesTenantFilter) return false;

      // Se o usuário for Corretor, restringe a agenda apenas para suas próprias visitas
      if (user?.role === 'corretor') {
        if (!user.id) return false;
        const matchesId = v.created_by_user_id === user.id;
        const matchesNome = Boolean(
          (v.corretor_nome && user.name && v.corretor_nome.toLowerCase().trim() === user.name.toLowerCase().trim()) ||
          (v.created_by_user_nome && user.name && v.created_by_user_nome.toLowerCase().trim() === user.name.toLowerCase().trim())
        );
        return matchesId || matchesNome;
      }

      // Gestores e Administradores visualizam todas as visitas da imobiliária
      return true;
    });
  }, [allVisitas, matchesTenant, user]);

  // -------------------------------------------------------------
  // AUDITORIA E LOGS DO SISTEMA (AUDIT TRAIL)
  // -------------------------------------------------------------
  const registrarLogSistema = useCallback(
    async (
      acao: string,
      tabela: 'imoveis' | 'clientes' | 'visitas' | 'proprietarios' | 'usuarios' | 'configuracoes' | 'sistema',
      registroId?: string,
      detalhes: Record<string, any> = {}
    ) => {
      const activeTenantName = (currentTenant?.nome || imobiliarias[0]?.nome || 'Lagom Imóveis').trim();
      const activeTenantId = currentTenant?.id || imobiliarias[0]?.id;

      const newLog: LogSistema = {
        id: crypto.randomUUID ? crypto.randomUUID() : `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        usuario_id: user?.id,
        usuario_email: user?.email || 'sistema@easymob.com.br',
        usuario_nome: user?.name || 'Sistema',
        acao,
        tabela,
        registro_id: registroId ? String(registroId) : undefined,
        detalhes,
        imobiliaria_id: activeTenantId,
        imobiliaria: activeTenantName,
        criado_em: new Date().toISOString(),
      };

      // 1. Grava no Supabase
      try {
        await supabase.from('logs_sistema').insert({
          usuario_id: newLog.usuario_id || null,
          usuario_email: newLog.usuario_email,
          usuario_nome: newLog.usuario_nome,
          acao: newLog.acao,
          tabela: newLog.tabela,
          registro_id: newLog.registro_id || null,
          detalhes: newLog.detalhes,
          imobiliaria_id: newLog.imobiliaria_id || null,
          imobiliaria: newLog.imobiliaria,
          criado_em: newLog.criado_em,
        });
      } catch (err) {
        console.warn('Erro ao persistir log_sistema no Supabase:', err);
      }

      // 2. Grava no LocalStorage para cache/offline
      try {
        const savedLogs = localStorage.getItem('easymob_logs_sistema');
        const parsedLogs: LogSistema[] = savedLogs ? JSON.parse(savedLogs) : [];
        const updatedLogs = [newLog, ...parsedLogs].slice(0, 500);
        localStorage.setItem('easymob_logs_sistema', JSON.stringify(updatedLogs));
      } catch {
        // ignore
      }
    },
    [user?.id, user?.email, user?.name, currentTenant?.nome, currentTenant?.id, imobiliarias]
  );

  // -------------------------------------------------------------
  // CRUD PROPRIETÁRIOS
  // -------------------------------------------------------------
  const adicionarProprietario = async (
    dados: Omit<Proprietario, 'id' | 'criado_em'>
  ): Promise<Proprietario> => {
    const activeTenantName = (currentTenant?.nome || imobiliarias[0]?.nome || 'Lagom Imóveis').trim();
    const activeTenantId = currentTenant?.id || imobiliarias[0]?.id;

    const novoProp: Proprietario = {
      ...dados,
      imobiliaria: dados.imobiliaria || activeTenantName,
      imobiliaria_id: dados.imobiliaria_id || activeTenantId,
      id: crypto.randomUUID ? crypto.randomUUID() : `prop_${Date.now()}`,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    setItemTenantInMap(novoProp.id, novoProp.imobiliaria);

    const dbPayload = sanitizeProprietarioForDb(novoProp);
    const { error: insertErr } = await supabase.from('proprietarios').insert(dbPayload);
    if (insertErr) {
      console.error('Erro no Supabase ao cadastrar proprietário:', insertErr);
      throw new Error(`Falha ao salvar proprietário no banco: ${insertErr.message}`);
    }

    const updated = sortProprietariosAlphabetically([novoProp, ...allProprietarios]);
    setAllProprietarios(updated);
    persistir('proprietarios', updated);

    await registrarLogSistema('CRIAR_PROPRIETARIO', 'proprietarios', novoProp.id, {
      nome: novoProp.nome,
      telefone: novoProp.telefone,
    });

    return novoProp;
  };

  const atualizarProprietario = async (id: string, dados: Partial<Proprietario>) => {
    if (dados.imobiliaria) {
      setItemTenantInMap(id, dados.imobiliaria);
    }

    const dbPayload = sanitizeProprietarioForDb({ ...dados, atualizado_em: new Date().toISOString() });
    const { error: updateErr } = await supabase.from('proprietarios').update(dbPayload).eq('id', id);
    if (updateErr) {
      console.error('Erro no Supabase ao atualizar proprietário:', updateErr);
      throw new Error(`Falha ao atualizar proprietário no banco: ${updateErr.message}`);
    }

    const updated = sortProprietariosAlphabetically(
      allProprietarios.map((p) => (p.id === id ? { ...p, ...dados, atualizado_em: new Date().toISOString() } : p))
    );
    setAllProprietarios(updated);
    persistir('proprietarios', updated);

    // Sincroniza dados nos imóveis vinculados
    setAllImoveis((prev) =>
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

    await registrarLogSistema('ALTERAR_PROPRIETARIO', 'proprietarios', id, dados);
  };

  // -------------------------------------------------------------
  // CRUD IMÓVEIS & GATILHO DE EXCLUSÃO INTELIGENTE DE PROPRIETÁRIO
  // -------------------------------------------------------------
  const adicionarImovel = async (dados: Omit<Imovel, 'id' | 'criado_em'>): Promise<Imovel> => {
    const activeTenantName = (currentTenant?.nome || imobiliarias[0]?.nome || 'Lagom Imóveis').trim();
    const activeTenantId = currentTenant?.id || imobiliarias[0]?.id;
    let finalPropId = dados.proprietario_id;

    // Se não tem proprietario_id, busca por telefone ou cria um novo proprietário automaticamente
    if (!finalPropId && dados.proprietario_nome && dados.proprietario_telefone) {
      const cleanPhone = dados.proprietario_telefone.trim().toLowerCase();
      const existing = allProprietarios.find(
        (p) => p.telefone.trim().toLowerCase() === cleanPhone || p.nome.trim().toLowerCase() === dados.proprietario_nome.trim().toLowerCase()
      );

      if (existing) {
        finalPropId = existing.id;
      } else {
        const criado = await adicionarProprietario({
          nome: dados.proprietario_nome,
          telefone: dados.proprietario_telefone,
          email: dados.proprietario_email,
          imobiliaria: activeTenantName,
          imobiliaria_id: activeTenantId,
        });
        finalPropId = criado.id;
      }
    }

    const novoImovel: Imovel = {
      ...dados,
      imobiliaria: dados.imobiliaria || activeTenantName,
      imobiliaria_id: dados.imobiliaria_id || activeTenantId,
      proprietario_id: finalPropId,
      id: crypto.randomUUID ? crypto.randomUUID() : `imovel_${Date.now()}`,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    setItemTenantInMap(novoImovel.id, novoImovel.imobiliaria);

    const dbPayload = sanitizeImovelForDb(novoImovel);
    const { error: insertErr } = await supabase.from('imoveis').insert(dbPayload);
    if (insertErr) {
      console.error('Erro no Supabase ao cadastrar imóvel:', insertErr);
      throw new Error(`Falha ao salvar imóvel no banco de dados: ${insertErr.message}`);
    }

    const updated = sortImoveisAlphabetically([novoImovel, ...allImoveis]);
    setAllImoveis(updated);
    persistir('imoveis', updated);

    await registrarLogSistema('CRIAR_IMOVEL', 'imoveis', novoImovel.id, {
      titulo: novoImovel.titulo,
      codigo: novoImovel.codigo,
      valor_venda: novoImovel.valor_venda,
      valor_locacao: novoImovel.valor_locacao,
      endereco: `${novoImovel.bairro}, ${novoImovel.cidade}`,
    });

    showToast(`Imóvel "${novoImovel.titulo}" cadastrado com sucesso!`, 'success');
    return novoImovel;
  };

  const atualizarImovel = async (id: string, dados: Partial<Imovel>) => {
    const existing = allImoveis.find((i) => i.id === id);

    if (dados.imobiliaria) {
      setItemTenantInMap(id, dados.imobiliaria);
    }

    const dbPayload = sanitizeImovelForDb({ ...dados, atualizado_em: new Date().toISOString() });
    const { error: updateErr } = await supabase.from('imoveis').update(dbPayload).eq('id', id);
    if (updateErr) {
      console.error('Erro no Supabase ao atualizar imóvel:', updateErr);
      throw new Error(`Falha ao atualizar imóvel no banco de dados: ${updateErr.message}`);
    }

    const updated = sortImoveisAlphabetically(
      allImoveis.map((im) => (im.id === id ? { ...im, ...dados, atualizado_em: new Date().toISOString() } : im))
    );
    setAllImoveis(updated);
    persistir('imoveis', updated);
    
    // Atualiza referências nas visitas
    setAllVisitas((prev) =>
      prev.map((v) => (v.imovel_id === id ? { ...v, imovel: { ...v.imovel, ...dados } as Imovel } : v))
    );

    // Auditoria: Verificação de Mudança de Preço
    const precoAlterado =
      (dados.valor_venda !== undefined && dados.valor_venda !== existing?.valor_venda) ||
      (dados.valor_locacao !== undefined && dados.valor_locacao !== existing?.valor_locacao);

    if (precoAlterado) {
      await registrarLogSistema('ALTERAR_VALOR_IMOVEL', 'imoveis', id, {
        titulo: existing?.titulo,
        codigo: existing?.codigo,
        valor_venda_anterior: existing?.valor_venda,
        valor_venda_novo: dados.valor_venda,
        valor_locacao_anterior: existing?.valor_locacao,
        valor_locacao_novo: dados.valor_locacao,
      });
    }

    // Auditoria: Verificação de Mudança de Status
    if (dados.status && dados.status !== existing?.status) {
      await registrarLogSistema('ALTERAR_STATUS_IMOVEL', 'imoveis', id, {
        titulo: existing?.titulo,
        codigo: existing?.codigo,
        status_anterior: existing?.status,
        status_novo: dados.status,
      });
    }

    showToast('Imóvel atualizado com sucesso!', 'success');
  };

  const removerImovel = async (id: string) => {
    const imovelParaRemover = allImoveis.find((im) => im.id === id);
    const deletedAt = new Date().toISOString();

    // 1. Soft Delete no Supabase (coluna deletado_em)
    const { error: deleteErr } = await supabase
      .from('imoveis')
      .update({ deletado_em: deletedAt, atualizado_em: deletedAt })
      .eq('id', id);

    if (deleteErr) {
      console.error('Erro no Supabase ao mover imóvel para lixeira:', deleteErr);
      throw new Error(`Falha ao remover imóvel no banco de dados: ${deleteErr.message}`);
    }

    // 2. Grava log de auditoria
    await registrarLogSistema('EXCLUIR_IMOVEL', 'imoveis', id, {
      titulo: imovelParaRemover?.titulo,
      codigo: imovelParaRemover?.codigo,
      valor_venda: imovelParaRemover?.valor_venda,
      valor_locacao: imovelParaRemover?.valor_locacao,
      endereco: imovelParaRemover ? `${imovelParaRemover.bairro}, ${imovelParaRemover.cidade}` : '',
      deletado_em: deletedAt,
    });

    const updatedImoveis = allImoveis.filter((im) => im.id !== id);
    setAllImoveis(updatedImoveis);
    persistir('imoveis', updatedImoveis);

    // ─── GATILHO DA REGRA 3: Exclusão Automática de Proprietário Órfão ───
    if (imovelParaRemover) {
      const propId = imovelParaRemover.proprietario_id;
      const propPhone = imovelParaRemover.proprietario_telefone?.trim().toLowerCase();

      // Verifica se restou algum OUTRO imóvel desse mesmo proprietário
      const remainingCount = updatedImoveis.filter(
        (im) => !im.deletado_em && ((propId && im.proprietario_id === propId) || (propPhone && im.proprietario_telefone?.trim().toLowerCase() === propPhone))
      ).length;

      if (remainingCount === 0) {
        // Move o proprietário para a lixeira também
        if (propId) {
          try {
            await supabase.from('proprietarios').update({ deletado_em: deletedAt, atualizado_em: deletedAt }).eq('id', propId);
          } catch (err) {
            console.warn('Supabase soft delete proprietario orfao offline:', err);
          }
        }
        const updatedProps = allProprietarios.filter(
          (p) => (propId ? p.id !== propId : p.telefone?.trim().toLowerCase() !== propPhone)
        );
        setAllProprietarios(updatedProps);
        persistir('proprietarios', updatedProps);
        showToast('Imóvel excluído com sucesso!', 'success');
        return;
      }
    }

    showToast('Imóvel excluído com sucesso!', 'success');
  };

  // -------------------------------------------------------------
  // CRUD CLIENTES
  // -------------------------------------------------------------
  const adicionarCliente = async (dados: Omit<Cliente, 'id' | 'criado_em'>): Promise<Cliente> => {
    const activeTenantName = (currentTenant?.nome || imobiliarias[0]?.nome || 'Lagom Imóveis').trim();
    const activeTenantId = currentTenant?.id || imobiliarias[0]?.id;

    const novoCliente: Cliente = {
      ...dados,
      imobiliaria: dados.imobiliaria || activeTenantName,
      imobiliaria_id: dados.imobiliaria_id || activeTenantId,
      id: crypto.randomUUID ? crypto.randomUUID() : `cliente_${Date.now()}`,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    setItemTenantInMap(novoCliente.id, novoCliente.imobiliaria);

    const dbPayload = sanitizeClienteForDb(novoCliente);
    const { error: insertErr } = await supabase.from('clientes').insert(dbPayload);
    if (insertErr) {
      console.error('Erro no Supabase ao cadastrar cliente:', insertErr);
      throw new Error(`Falha ao salvar cliente no banco de dados: ${insertErr.message}`);
    }

    const updated = sortClientesAlphabetically([novoCliente, ...allClientes]);
    setAllClientes(updated);
    persistir('clientes', updated);

    await registrarLogSistema('CRIAR_CLIENTE', 'clientes', novoCliente.id, {
      nome: novoCliente.nome,
      telefone: novoCliente.telefone,
      perfil_interesse: novoCliente.perfil_interesse,
      etapa_crm: novoCliente.etapa_crm,
    });

    showToast(`Cliente "${novoCliente.nome}" cadastrado!`, 'success');
    return novoCliente;
  };

  const atualizarCliente = async (id: string, dados: Partial<Cliente>) => {
    const existing = allClientes.find((c) => c.id === id);

    if (dados.imobiliaria) {
      setItemTenantInMap(id, dados.imobiliaria);
    }

    const dbPayload = sanitizeClienteForDb({ ...dados, atualizado_em: new Date().toISOString() });
    const { error: updateErr } = await supabase.from('clientes').update(dbPayload).eq('id', id);
    if (updateErr) {
      console.error('Erro no Supabase ao atualizar cliente:', updateErr);
      throw new Error(`Falha ao atualizar cliente no banco: ${updateErr.message}`);
    }

    const updated = sortClientesAlphabetically(
      allClientes.map((cl) => (cl.id === id ? { ...cl, ...dados, atualizado_em: new Date().toISOString() } : cl))
    );
    setAllClientes(updated);
    persistir('clientes', updated);
    
    // Atualiza referências nas visitas
    setAllVisitas((prev) =>
      prev.map((v) => (v.cliente_id === id ? { ...v, cliente: { ...v.cliente, ...dados } as Cliente } : v))
    );

    await registrarLogSistema('ALTERAR_CLIENTE', 'clientes', id, {
      nome: existing?.nome,
      campos_alterados: Object.keys(dados),
      dados_novos: dados,
    });

    showToast('Cliente atualizado!', 'success');
  };

  const moverEtapaCRM = async (id: string, novaEtapa: EtapaCRM) => {
    const target = allClientes.find((c) => c.id === id);
    if (!target) return;

    let novoStatus: StatusCliente = target.status;
    if (novaEtapa === 'venda_concluida') {
      novoStatus = 'fechado';
    } else if (
      novaEtapa === 'proposta_negociacao' ||
      novaEtapa === 'documentacao_credito' ||
      novaEtapa === 'fechamento_contrato'
    ) {
      novoStatus = 'negociando';
    } else if (target.status === 'fechado' || target.status === 'inativo') {
      novoStatus = 'ativo';
    }

    const etapaNomes: Record<EtapaCRM, string> = {
      novos_leads: 'Novos Leads',
      qualificacao: 'Qualificação',
      agendamento_visita: 'Agendamento de Visita',
      proposta_negociacao: 'Proposta / Negociação',
      documentacao_credito: 'Documentação / Análise de Crédito',
      fechamento_contrato: 'Fechamento / Contrato',
      venda_concluida: 'Venda Concluída',
    };

    const { error: updateErr } = await supabase
      .from('clientes')
      .update({ etapa_crm: novaEtapa, status: novoStatus, atualizado_em: new Date().toISOString() })
      .eq('id', id);
    if (updateErr) {
      console.error('Erro no Supabase ao mover etapa CRM:', updateErr);
      throw new Error(`Falha ao atualizar etapa no banco: ${updateErr.message}`);
    }

    const updated = sortClientesAlphabetically(
      allClientes.map((cl) => (cl.id === id ? { ...cl, etapa_crm: novaEtapa, status: novoStatus, atualizado_em: new Date().toISOString() } : cl))
    );
    setAllClientes(updated);
    persistir('clientes', updated);

    // Atualiza referências nas visitas
    setAllVisitas((prev) =>
      prev.map((v) => (v.cliente_id === id ? { ...v, cliente: { ...v.cliente, etapa_crm: novaEtapa, status: novoStatus } as Cliente } : v))
    );

    await registrarLogSistema('MOVER_ETAPA_CRM', 'clientes', id, {
      nome: target.nome,
      etapa_anterior: target.etapa_crm,
      etapa_nova: novaEtapa,
      etapa_nome: etapaNomes[novaEtapa],
      status_anterior: target.status,
      status_novo: novoStatus,
    });

    showToast(`Lead movido para "${etapaNomes[novaEtapa]}".`, 'success');
  };

  const removerCliente = async (id: string) => {
    const clienteParaRemover = allClientes.find((cl) => cl.id === id);
    const deletedAt = new Date().toISOString();

    // Soft Delete no Supabase
    const { error: deleteErr } = await supabase
      .from('clientes')
      .update({ deletado_em: deletedAt, atualizado_em: deletedAt })
      .eq('id', id);

    if (deleteErr) {
      console.error('Erro no Supabase ao remover cliente:', deleteErr);
      throw new Error(`Falha ao mover cliente para a lixeira: ${deleteErr.message}`);
    }

    await registrarLogSistema('EXCLUIR_CLIENTE', 'clientes', id, {
      nome: clienteParaRemover?.nome,
      telefone: clienteParaRemover?.telefone,
      etapa_crm: clienteParaRemover?.etapa_crm,
      status: clienteParaRemover?.status,
      deletado_em: deletedAt,
    });

    const updated = allClientes.filter((cl) => cl.id !== id);
    setAllClientes(updated);
    persistir('clientes', updated);
    showToast('Cliente excluído com sucesso!', 'success');
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
    const notificarConfirmacaoCliente = dados.notificar_confirmacao_cliente !== undefined ? dados.notificar_confirmacao_cliente : notificarConfirmacao;
    const notificarConfirmacaoProprietario = dados.notificar_confirmacao_proprietario !== undefined ? dados.notificar_confirmacao_proprietario : notificarConfirmacao;
    const notificarLembrete = dados.notificar_lembrete !== undefined ? dados.notificar_lembrete : true;
    const notificarLembreteCliente = dados.notificar_lembrete_cliente !== undefined ? dados.notificar_lembrete_cliente : notificarLembrete;
    const notificarLembreteProprietario = dados.notificar_lembrete_proprietario !== undefined ? dados.notificar_lembrete_proprietario : notificarLembrete;
    const notificarPosVisita = dados.notificar_pos_visita !== undefined ? dados.notificar_pos_visita : true;

    const createdByUserId = dados.created_by_user_id || user?.id || 'user-admin-master';
    const createdByUserNome = dados.created_by_user_nome || user?.name || 'Roger Vasques Berchembrock';
    const activeTenantName = (currentTenant?.nome || imobiliarias[0]?.nome || 'Lagom Imóveis').trim();
    const activeTenantId = currentTenant?.id || imobiliarias[0]?.id;

    const novaVisita: Visita = {
      ...dados,
      imobiliaria: dados.imobiliaria || activeTenantName,
      imobiliaria_id: dados.imobiliaria_id || activeTenantId,
      id: crypto.randomUUID ? crypto.randomUUID() : `visita_${Date.now()}`,
      imovel_id: primaryImovelId,
      imoveis_ids: imoveisIds,
      created_by_user_id: createdByUserId,
      created_by_user_nome: createdByUserNome,
      lembrete_agendado_para: reminderDate.toISOString(),
      pos_visita_agendado_para: posVisitaDate.toISOString(),
      notificar_confirmacao: notificarConfirmacao,
      notificar_confirmacao_cliente: notificarConfirmacaoCliente,
      notificar_confirmacao_proprietario: notificarConfirmacaoProprietario,
      notificar_lembrete: notificarLembrete,
      notificar_lembrete_cliente: notificarLembreteCliente,
      notificar_lembrete_proprietario: notificarLembreteProprietario,
      notificar_pos_visita: notificarPosVisita,
      gravar_logs: dados.gravar_logs !== undefined ? dados.gravar_logs : true,
      gravar_logs_cliente: dados.gravar_logs_cliente !== undefined ? dados.gravar_logs_cliente : (dados.gravar_logs !== false),
      gravar_logs_proprietario: dados.gravar_logs_proprietario !== undefined ? dados.gravar_logs_proprietario : (dados.gravar_logs !== false),
      status: dados.status || 'agendada',
      whatsapp_confirmacao_cliente: notificarConfirmacaoCliente ? 'pendente' : 'ignorado',
      whatsapp_confirmacao_proprietario: notificarConfirmacaoProprietario ? 'pendente' : 'ignorado',
      whatsapp_lembrete_cliente: notificarLembreteCliente ? 'pendente' : 'ignorado',
      whatsapp_lembrete_proprietario: notificarLembreteProprietario ? 'pendente' : 'ignorado',
      whatsapp_pos_visita_cliente: notificarPosVisita ? 'pendente' : 'ignorado',
      criado_em: new Date().toISOString(),
      imovel: imovelRef,
      imoveis: imoveisRefs.length > 0 ? imoveisRefs : (imovelRef ? [imovelRef] : []),
      cliente: clienteRef,
    };

    setItemTenantInMap(novaVisita.id, novaVisita.imobiliaria);

    // Disparo imediato de confirmação WhatsApp se habilitado e configurado
    if (enviarWhatsApp && notificarConfirmacao && configWhatsApp.ativo) {
      const ctx = await buildTemplateContextAsync(novaVisita);
      const visitInstanceName = (novaVisita.created_by_user_id === user?.id ? user?.instance_name : null) || (novaVisita.created_by_user_id ? generateInstanceName(novaVisita.created_by_user_id) : configWhatsApp.instancia_nome || 'easymob');

      // 1. Dispara para o Cliente (se opção de confirmação do cliente estiver ativa)
      if (notificarConfirmacaoCliente && clienteRef?.telefone) {
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
        // Intervalo de segurança para fila de WhatsApp
        await delay(1500);
      }

      // 2. Dispara confirmação para os proprietários dos imóveis visitados (se opção estiver ativa)
      if (notificarConfirmacaoProprietario) {
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

          // Intervalo de 1.5s entre proprietários
          await delay(1500);
        }

        novaVisita.whatsapp_confirmacao_proprietario = propSuccessCount > 0 ? 'enviado' : 'falha';
      }
    }

    const dbPayload = sanitizeVisitaForDb(novaVisita);
    const { error: insertErr } = await supabase.from('visitas').insert(dbPayload);
    if (insertErr) {
      console.error('Erro no Supabase ao cadastrar visita:', insertErr);
      throw new Error(`Falha ao salvar visita no banco de dados: ${insertErr.message}`);
    }

    const updated = [novaVisita, ...allVisitas];
    setAllVisitas(updated);
    persistir('visitas', updated);

    await registrarLogSistema('CRIAR_VISITA', 'visitas', novaVisita.id, {
      cliente_nome: novaVisita.cliente_nome || clienteRef?.nome,
      cliente_id: novaVisita.cliente_id,
      imovel_titulo: imovelRef?.titulo,
      data_hora_visita: novaVisita.data_hora_visita,
      status: novaVisita.status,
      corretor_nome: novaVisita.corretor_nome,
    });

    showToast(
      enviarWhatsApp && notificarConfirmacao
        ? `Visita agendada com roteiro de ${novaVisita.imoveis?.length || 1} imóvel(is) e confirmações via WhatsApp!`
        : `Visita agendada com roteiro de ${novaVisita.imoveis?.length || 1} imóvel(is)!`,
      'success'
    );

    return novaVisita;
  };

  const concluirVisita = async (
    id: string,
    opcoes?: { enviarPosVisitaCliente?: boolean; enviarComprovacaoProprietario?: boolean }
  ) => {
    const visita = allVisitas.find((v) => v.id === id);
    if (!visita) return;

    const agora = new Date();
    // 48 horas contínuas de gravação de log após a conclusão
    const fimGravacaoLogs = new Date(agora.getTime() + 48 * 60 * 60 * 1000).toISOString();

    const visitInstanceName =
      (visita.created_by_user_id === user?.id ? user?.instance_name : null) ||
      (visita.created_by_user_id ? generateInstanceName(visita.created_by_user_id) : configWhatsApp.instancia_nome || 'easymob');

    let statusPosVisita = visita.whatsapp_pos_visita_cliente;
    let statusComprovacao = visita.whatsapp_comprovacao_proprietario;

    const ctx = await buildTemplateContextAsync(visita);

    // 1. Enviar mensagem pós-visita ao Cliente (Pedir feedback)
    const deveEnviarCliente =
      opcoes?.enviarPosVisitaCliente !== undefined
        ? opcoes.enviarPosVisitaCliente
        : configWhatsApp.enviar_pos_visita_cliente !== false;

    if (deveEnviarCliente && visita.cliente?.telefone && configWhatsApp.ativo) {
      const templatePos = configWhatsApp.template_pos_visita_cliente ||
        '✨ *Olá, {cliente_nome}! Tudo bem?*\n\nEsperamos que a visita de hoje tenha sido ótima!\n\n🏠 *Imóveis visitados:*\n{roteiro_imoveis}\n\nGostaríamos de saber: o que você achou dos imóveis? Algum deles chamou sua atenção ou despertou interesse para iniciarmos uma proposta?\n\nQualquer dúvida, estamos à sua inteira disposição!\n*{corretor_nome}*';

      const msgCliente = compileTemplate(templatePos, ctx);
      const resCliente = await sendWhatsAppMessage({
        toPhone: visita.cliente.telefone,
        message: msgCliente,
        config: configWhatsApp,
        instanceName: visitInstanceName,
        logInfo: {
          visitaId: visita.id,
          tipoMensagem: 'pos_visita_cliente',
          destinatarioNome: visita.cliente.nome,
          tipoDestinatario: 'cliente',
        },
      });
      statusPosVisita = resCliente.success ? 'enviado' : 'falha';
      // Intervalo de segurança para fila de WhatsApp
      await delay(1500);
    }

    // 2. Enviar mensagem de comprovação ao Proprietário
    const deveEnviarProprietario =
      opcoes?.enviarComprovacaoProprietario !== undefined
        ? opcoes.enviarComprovacaoProprietario
        : configWhatsApp.enviar_comprovacao_proprietario !== false;

    if (deveEnviarProprietario && configWhatsApp.ativo) {
      const imoveisVisita = visita.imoveis && visita.imoveis.length > 0
        ? visita.imoveis
        : visita.imovel ? [visita.imovel] : [];

      let propSuccessCount = 0;
      const uniquePropsTelefones = new Set<string>();

      const templateComprovacao = configWhatsApp.template_comprovacao_proprietario ||
        'Olá, {proprietario_nome}! Confirmamos que a visita ao seu imóvel *{imovel_titulo}* foi realizada com sucesso nesta data por intermédio do corretor *{corretor_nome}*, acompanhado do(a) cliente *{cliente_nome}*. Qualquer novidade sobre proposta, entraremos em contato!';

      for (const im of imoveisVisita) {
        if (!im || !im.proprietario_telefone) continue;
        if (uniquePropsTelefones.has(im.proprietario_telefone.trim())) continue;
        uniquePropsTelefones.add(im.proprietario_telefone.trim());

        const propCtx: TemplateContext = {
          ...ctx,
          imovel_titulo: im.titulo,
          imovel_codigo: im.codigo || '',
          endereco: `${im.endereco}${im.numero ? `, ${im.numero}` : ''} - ${im.bairro}`,
          proprietario_nome: im.proprietario_nome || 'Proprietário',
          proprietario_telefone: im.proprietario_telefone,
        };

        const msgProp = compileTemplate(templateComprovacao, propCtx);

        const resProp = await sendWhatsAppMessage({
          toPhone: im.proprietario_telefone,
          message: msgProp,
          config: configWhatsApp,
          instanceName: visitInstanceName,
          logInfo: {
            visitaId: visita.id,
            tipoMensagem: 'comprovacao_proprietario',
            destinatarioNome: im.proprietario_nome || 'Proprietário',
            tipoDestinatario: 'proprietario',
          },
        });
        if (resProp.success) propSuccessCount++;

        // Intervalo de segurança entre proprietários
        await delay(1500);
      }
      statusComprovacao = propSuccessCount > 0 ? 'enviado' : 'falha';
    }

    const updates: Partial<Visita> = {
      status: 'concluida',
      fim_gravacao_logs_em: fimGravacaoLogs,
      whatsapp_pos_visita_cliente: statusPosVisita,
      whatsapp_comprovacao_proprietario: statusComprovacao,
      atualizado_em: agora.toISOString(),
    };

    const dbPayload = sanitizeVisitaForDb(updates);
    const { error: updateErr } = await supabase.from('visitas').update(dbPayload).eq('id', id);
    if (updateErr) {
      console.error('Erro no Supabase ao concluir visita:', updateErr);
      throw new Error(`Falha ao concluir visita no banco: ${updateErr.message}`);
    }

    const updated = allVisitas.map((v) => (v.id === id ? { ...v, ...updates } : v));
    setAllVisitas(updated);
    persistir('visitas', updated);

    await registrarLogSistema('CONCLUIR_VISITA', 'visitas', id, {
      cliente_nome: visita.cliente_nome || visita.cliente?.nome,
      imovel_titulo: visita.imovel?.titulo,
      data_hora_visita: visita.data_hora_visita,
      concluido_em: agora.toISOString(),
    });

    showToast('Visita concluída com sucesso! Histórico ativo por +48h.', 'success');
  };

  const atualizarStatusVisita = async (id: string, novoStatus: StatusVisita) => {
    const visita = allVisitas.find((v) => v.id === id);
    const agora = new Date();
    const isEncerramento = novoStatus === 'concluida' || novoStatus === 'cancelada';
    const fimGravacaoLogs = isEncerramento
      ? new Date(agora.getTime() + 48 * 60 * 60 * 1000).toISOString()
      : undefined;

    const updates: { status: StatusVisita; atualizado_em: string; fim_gravacao_logs_em?: string } = {
      status: novoStatus,
      atualizado_em: agora.toISOString(),
    };
    if (fimGravacaoLogs) {
      updates.fim_gravacao_logs_em = fimGravacaoLogs;
    }

    const dbPayload = sanitizeVisitaForDb(updates);
    const { error: updateErr } = await supabase.from('visitas').update(dbPayload).eq('id', id);
    if (updateErr) {
      console.error('Erro no Supabase ao atualizar status da visita:', updateErr);
      throw new Error(`Falha ao atualizar status no banco: ${updateErr.message}`);
    }

    const updated = allVisitas.map((v) => (v.id === id ? { ...v, ...updates } : v));
    setAllVisitas(updated);
    persistir('visitas', updated);

    await registrarLogSistema('ALTERAR_STATUS_VISITA', 'visitas', id, {
      cliente_nome: visita?.cliente_nome || visita?.cliente?.nome,
      imovel_titulo: visita?.imovel?.titulo,
      status_anterior: visita?.status,
      status_novo: novoStatus,
    });

    showToast(`Status da visita alterado para "${novoStatus.toUpperCase()}"`, 'info');
  };

  const atualizarVisita = async (id: string, dados: Partial<Visita>) => {
    const existing = allVisitas.find((v) => v.id === id);
    const dbPayload = sanitizeVisitaForDb({ ...dados, atualizado_em: new Date().toISOString() });
    const { error: updateErr } = await supabase.from('visitas').update(dbPayload).eq('id', id);
    if (updateErr) {
      console.error('Erro no Supabase ao atualizar visita:', updateErr);
      throw new Error(`Falha ao atualizar visita no banco de dados: ${updateErr.message}`);
    }

    const updated = allVisitas.map((v) => {
      if (v.id === id) {
        const finalImoveisIds = dados.imoveis_ids || v.imoveis_ids || (dados.imovel_id ? [dados.imovel_id] : [v.imovel_id]);
        const primaryImovelId = finalImoveisIds[0] || dados.imovel_id || v.imovel_id;
        const imovelRef = allImoveis.find((i) => i.id === primaryImovelId) || v.imovel;
        const imoveisRefs = finalImoveisIds.map((iid) => allImoveis.find((i) => i.id === iid)).filter((i): i is Imovel => !!i);
        const clienteRef = dados.cliente_id ? allClientes.find((c) => c.id === dados.cliente_id) : v.cliente;

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

    setAllVisitas(updated);
    persistir('visitas', updated);

    await registrarLogSistema('ALTERAR_VISITA', 'visitas', id, {
      cliente_nome: existing?.cliente_nome || existing?.cliente?.nome,
      campos_alterados: Object.keys(dados),
    });

    showToast('Visita atualizada com sucesso!', 'success');
  };

  const removerVisita = async (id: string) => {
    const visitaParaRemover = allVisitas.find((v) => v.id === id);
    const deletedAt = new Date().toISOString();

    // Soft Delete no Supabase (coluna deletado_em)
    const { error: deleteErr } = await supabase
      .from('visitas')
      .update({ deletado_em: deletedAt, atualizado_em: deletedAt })
      .eq('id', id);

    if (deleteErr) {
      console.error('Erro no Supabase ao mover visita para lixeira:', deleteErr);
      throw new Error(`Falha ao remover visita no banco de dados: ${deleteErr.message}`);
    }

    await registrarLogSistema('EXCLUIR_VISITA', 'visitas', id, {
      cliente_nome: visitaParaRemover?.cliente_nome || visitaParaRemover?.cliente?.nome,
      data_hora_visita: visitaParaRemover?.data_hora_visita,
      status: visitaParaRemover?.status,
      imovel_titulo: visitaParaRemover?.imovel?.titulo,
      deletado_em: deletedAt,
    });

    const updated = allVisitas.filter((v) => v.id !== id);
    setAllVisitas(updated);
    persistir('visitas', updated);
    showToast('Visita excluída com sucesso!', 'success');
  };

  // -------------------------------------------------------------
  // RESTAURAÇÃO, LIXEIRA & PURGA DEFINITIVA DE 60 DIAS
  // -------------------------------------------------------------
  const restaurarRegistro = async (tabela: 'imoveis' | 'clientes' | 'visitas' | 'proprietarios', id: string) => {
    try {
      const res = await fetch('/api/admin/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          tabela,
          id,
          usuario_email: user?.email,
          usuario_nome: user?.name,
          imobiliaria: currentTenant?.nome,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao restaurar registro');
      }

      await carregarDados();
      showToast('Registro restaurado com sucesso para a lista ativa!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Falha ao restaurar registro', 'error');
      throw err;
    }
  };

  const carregarLixeira = async (): Promise<ItemLixeira[]> => {
    try {
      const activeTenant = currentTenant?.nome || 'todas';
      const res = await fetch(`/api/admin/trash?imobiliaria=${encodeURIComponent(activeTenant)}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.items) {
        return data.items;
      }
    } catch (err) {
      console.warn('Erro ao carregar itens da lixeira:', err);
    }
    return [];
  };

  const excluirDefinitivoLixeira = async (tabela: 'imoveis' | 'clientes' | 'visitas' | 'proprietarios', id: string) => {
    try {
      const res = await fetch('/api/admin/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'hard_delete',
          tabela,
          id,
          usuario_email: user?.email,
          usuario_nome: user?.name,
          imobiliaria: currentTenant?.nome,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao purgar registro');
      }

      showToast('Registro excluído permanentemente da lixeira.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Falha ao excluir definitivamente', 'error');
      throw err;
    }
  };

  const purgarLixeiraExpirados = async () => {
    try {
      const res = await fetch('/api/admin/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purge_now' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Purga de registros com mais de 60 dias executada!', 'success');
        return data.summary;
      } else {
        throw new Error(data.error || 'Erro ao executar purga');
      }
    } catch (err: any) {
      showToast(err.message || 'Falha ao purgar registros expirados', 'error');
      throw err;
    }
  };

  const carregarLogsSistema = async (filtros?: {
    usuarioEmail?: string;
    acao?: string;
    tabela?: string;
    dataInicio?: string;
    dataFim?: string;
    limit?: number;
  }): Promise<LogSistema[]> => {
    try {
      const params = new URLSearchParams();
      if (filtros?.usuarioEmail) params.append('usuarioEmail', filtros.usuarioEmail);
      if (filtros?.acao) params.append('acao', filtros.acao);
      if (filtros?.tabela) params.append('tabela', filtros.tabela);
      if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros?.dataFim) params.append('dataFim', filtros.dataFim);
      if (filtros?.limit) params.append('limit', String(filtros.limit));
      if (currentTenant?.nome) params.append('imobiliaria', currentTenant.nome);

      const res = await fetch(`/api/admin/logs?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.logs) {
        return data.logs;
      }
    } catch (err) {
      console.warn('Erro ao carregar logs via API, usando fallback local:', err);
    }

    try {
      const saved = localStorage.getItem('easymob_logs_sistema');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
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

    const ctx = await buildTemplateContextAsync(visita);
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
        // Intervalo antes de enviar para os proprietários
        await delay(1500);
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

        // Intervalo de segurança entre proprietários
        await delay(1500);
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

    // 1. Lembretes (1 hora antes - janela de 0 a 65 min) - Trava estrita: SOMENTE 'agendada'
    const visitasLembrete = visitas.filter((v) => {
      if (v.status !== 'agendada') return false;
      if (v.notificar_lembrete === false) return false;
      if (v.whatsapp_lembrete_cliente === 'enviado' && v.whatsapp_lembrete_proprietario === 'enviado') return false;
      
      const visitDate = new Date(v.data_hora_visita);
      const diffMinutes = (visitDate.getTime() - agora.getTime()) / (1000 * 60);
      return diffMinutes > 0 && diffMinutes <= 65;
    });

    // 2. Pós-Visita (2 horas após - janela de visitas que ocorreram entre 110 e 200 min atrás)
    const visitasPosVisita = visitas.filter((v) => {
      if (v.status === 'cancelada' || v.status === 'nao_compareceu' || v.notificar_pos_visita === false) return false;
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
      await delay(1500);
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
      await delay(1500);
    }

    const totalProcessadas = visitasLembrete.length + visitasPosVisita.length;
    showToast(`Automação concluída: ${enviadas} mensagem(ns) disparada(s).`, enviadas > 0 ? 'success' : 'info');
    return {
      processadas: totalProcessadas,
      enviadas,
      logs: logsList,
    };
  };

  // Sincroniza em cascata o novo nome da imobiliária em todas as coleções e banco de dados
  const renomearImobiliariaCascade = useCallback(
    async (antigoNome: string, novoNome: string) => {
      if (!antigoNome || !novoNome || antigoNome.toLowerCase() === novoNome.toLowerCase()) return;

      const antigoClean = antigoNome.trim().toLowerCase();
      const novoClean = novoNome.trim();

      // 1. Atualiza na tabela users do Supabase
      try {
        await supabase
          .from('users')
          .update({ imobiliaria: novoClean })
          .ilike('imobiliaria', antigoClean);
      } catch (err) {
        console.warn('Supabase update users offline:', err);
      }

      // 2. Atualiza tenantMap persistido
      const tenantMap = getItemTenantMap();
      let mapChanged = false;
      Object.keys(tenantMap).forEach((id) => {
        if (tenantMap[id]?.trim().toLowerCase() === antigoClean) {
          tenantMap[id] = novoClean;
          mapChanged = true;
        }
      });
      if (mapChanged && typeof window !== 'undefined') {
        localStorage.setItem(TENANT_ITEM_MAP_STORAGE_KEY, JSON.stringify(tenantMap));
      }

      // 3. Atualiza em memória e no localStorage todas as coleções
      setAllImoveis((prev) => {
        const next = prev.map((im) => {
          if (im.imobiliaria && im.imobiliaria.trim().toLowerCase() === antigoClean) {
            return { ...im, imobiliaria: novoClean };
          }
          return im;
        });
        persistir('imoveis', next);
        return next;
      });

      setAllClientes((prev) => {
        const next = prev.map((cl) => {
          if (cl.imobiliaria && cl.imobiliaria.trim().toLowerCase() === antigoClean) {
            return { ...cl, imobiliaria: novoClean };
          }
          return cl;
        });
        persistir('clientes', next);
        return next;
      });

      setAllProprietarios((prev) => {
        const next = prev.map((pr) => {
          if (pr.imobiliaria && pr.imobiliaria.trim().toLowerCase() === antigoClean) {
            return { ...pr, imobiliaria: novoClean };
          }
          return pr;
        });
        persistir('proprietarios', next);
        return next;
      });

      setAllVisitas((prev) => {
        const next = prev.map((vs) => {
          if (vs.imobiliaria && vs.imobiliaria.trim().toLowerCase() === antigoClean) {
            return { ...vs, imobiliaria: novoClean };
          }
          return vs;
        });
        persistir('visitas', next);
        return next;
      });
    },
    []
  );

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

  const visitasAgendadasHoje = visitasHoje.filter((v) => v.status === 'agendada').length;
  const visitasRealizadasHoje = visitasHoje.filter((v) => v.status === 'concluida' || v.status === 'reagendada').length;
  const visitasCanceladasHoje = visitasHoje.filter((v) => v.status === 'cancelada').length;
  const totalImoveisAtivos = imoveis.filter((i) => i.status === 'disponivel').length;
  const totalClientesAtivos = clientes.filter((c) => c.status === 'ativo').length;

  const metrics: DashboardMetrics = {
    totalVisitasHoje: visitasHoje.length,
    visitasAgendadasHoje,
    visitasCanceladasHoje,
    visitasRealizadasHoje,
    totalImoveisAtivos,
    totalClientesAtivos,
  };

  return (
    <DataContext.Provider
      value={{
        imoveis,
        proprietarios,
        clientes,
        visitas,
        allImoveis,
        allProprietarios,
        allClientes,
        allVisitas,
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
        moverEtapaCRM,
        removerCliente,
        adicionarVisita,
        concluirVisita,
        atualizarStatusVisita,
        atualizarVisita,
        removerVisita,
        atualizarConfigWhatsApp,
        dispararWhatsAppManual,
        executarRotinaLembretes30m,
        renomearImobiliariaCascade,
        toastMessage,
        showToast,
        clearToast,
        registrarLogSistema,
        restaurarRegistro,
        carregarLixeira,
        excluirDefinitivoLixeira,
        purgarLixeiraExpirados,
        carregarLogsSistema,
        carregarDados,
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
