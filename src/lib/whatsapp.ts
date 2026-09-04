import { ConfiguracaoWhatsApp, Visita, WhatsAppLog } from '@/types';
import { cleanPhoneForWhatsApp, formatDate, formatDateTime, formatTime } from './utils';
import { supabase } from './supabase';

import { getGoogleMapsSearchUrl, getShortMapsUrl, formatEnderecoCompleto } from './maps';

export interface TemplateContext {
  cliente_nome: string;
  nome_cliente?: string;
  cliente_telefone?: string;
  proprietario_nome: string;
  nome_proprietario?: string;
  proprietario_telefone?: string;
  imovel_titulo: string;
  titulo_imovel?: string;
  imovel_codigo?: string;
  endereco: string;
  roteiro_imoveis: string;
  total_imoveis: string;
  data_hora: string;
  horario: string;
  data: string;
  corretor_nome: string;
  corretor_telefone: string;
  link_mapa?: string;
  link_curto_mapa?: string;
}

/**
 * Monta o contexto de variáveis para interpolação nos templates a partir de uma Visita (síncrono)
 */
export function buildTemplateContext(visita: Visita): TemplateContext {
  const dataHora = formatDateTime(visita.data_hora_visita);
  const data = formatDate(visita.data_hora_visita);
  const horario = formatTime(visita.data_hora_visita);

  // Lista de todos os imóveis do roteiro (se houver array imoveis ou fallback para imovel)
  const listaImoveis = visita.imoveis && visita.imoveis.length > 0
    ? visita.imoveis
    : visita.imovel
    ? [visita.imovel]
    : [];

  const roteiroFormatado = listaImoveis.length > 0
    ? listaImoveis
        .map((im, idx) => {
          const end = `${im.endereco}${im.numero ? `, ${im.numero}` : ''}${im.bairro ? ` - ${im.bairro}` : ''}${im.cidade ? ` (${im.cidade})` : ''}`;
          return `${idx + 1}. [${im.titulo}] - [${end}]`;
        })
        .join(' | ')
    : 'Endereço a confirmar';

  const enderecoCompleto = listaImoveis.length > 0
    ? listaImoveis
        .map((im) => `${im.endereco}${im.numero ? `, ${im.numero}` : ''}${im.complemento ? ` (${im.complemento})` : ''} - ${im.bairro}, ${im.cidade}`)
        .join('; ')
    : 'Endereço a confirmar';

  const primeiroImovel = listaImoveis[0];
  const mapsSearchUrl = primeiroImovel ? getGoogleMapsSearchUrl(primeiroImovel) : 'https://www.google.com/maps';

  const titulosCombinados = listaImoveis.length > 0
    ? listaImoveis.map((im) => im.titulo).join(', ')
    : 'Imóvel';

  const codigosCombinados = listaImoveis.length > 0
    ? listaImoveis.map((im) => im.codigo).filter(Boolean).join(', ')
    : '';

  const proprietariosNomes = listaImoveis.length > 0
    ? Array.from(new Set(listaImoveis.map((im) => im.proprietario_nome).filter(Boolean))).join(', ')
    : 'Proprietário';

  const proprietariosTelefones = listaImoveis.length > 0
    ? Array.from(new Set(listaImoveis.map((im) => im.proprietario_telefone).filter(Boolean))).join(', ')
    : '';

  const clienteNome = visita.cliente?.nome || 'Cliente';

  return {
    cliente_nome: clienteNome,
    nome_cliente: clienteNome,
    cliente_telefone: visita.cliente?.telefone || '',
    proprietario_nome: proprietariosNomes || 'Proprietário',
    nome_proprietario: proprietariosNomes || 'Proprietário',
    proprietario_telefone: proprietariosTelefones || '',
    imovel_titulo: titulosCombinados,
    titulo_imovel: titulosCombinados,
    imovel_codigo: codigosCombinados,
    endereco: enderecoCompleto,
    roteiro_imoveis: roteiroFormatado,
    total_imoveis: String(listaImoveis.length || 1),
    data_hora: dataHora,
    horario: horario,
    data: data,
    corretor_nome: visita.corretor_nome || 'Corretor',
    corretor_telefone: visita.corretor_telefone || '',
    link_mapa: mapsSearchUrl,
    link_curto_mapa: mapsSearchUrl,
  };
}

/**
 * Monta o contexto de variáveis de forma assíncrona, encurtando o link do mapa via TinyURL
 */
export async function buildTemplateContextAsync(visita: Visita): Promise<TemplateContext> {
  const ctx = buildTemplateContext(visita);
  const listaImoveis = visita.imoveis && visita.imoveis.length > 0
    ? visita.imoveis
    : visita.imovel
    ? [visita.imovel]
    : [];

  const primeiroImovel = listaImoveis[0];
  if (primeiroImovel) {
    try {
      const shortUrl = await getShortMapsUrl(primeiroImovel);
      ctx.link_curto_mapa = shortUrl;
      ctx.link_mapa = shortUrl;
    } catch {
      // Fallback já definido
    }
  }

  return ctx;
}

/**
 * Substitui as tags do template com os valores do contexto
 */
export function compileTemplate(template: string | undefined, ctx: TemplateContext | Record<string, unknown>): string {
  if (!template) return '';
  let compiled = template;
  for (const [key, value] of Object.entries(ctx)) {
    const placeholder = new RegExp(`\\{${key}\\}`, 'g');
    compiled = compiled.replace(placeholder, value !== undefined && value !== null ? String(value) : '');
  }
  return compiled;
}

export interface PropertyTemplateContext {
  cliente_nome?: string;
  nome_cliente?: string;
  cliente?: string;
  nome?: string;
  imovel_titulo: string;
  titulo_imovel?: string;
  titulo?: string;
  imovel_codigo: string;
  codigo?: string;
  endereco: string;
  bairro?: string;
  cidade?: string;
  valor: string;
  valor_venda?: string;
  valor_locacao?: string;
  quartos?: string;
  suites?: string;
  banheiros?: string;
  vagas?: string;
  area?: string;
  link_imovel: string;
  link?: string;
  corretor_nome?: string;
  corretor_telefone?: string;
  imobiliaria_nome?: string;
}

/**
 * Substitui as tags de templates de compartilhamento de imóvel e match de leads
 */
export function compilePropertyTemplate(template: string | undefined, ctx: PropertyTemplateContext): string {
  if (!template) return '';
  let compiled = template;

  const fullCtx: Record<string, string> = {
    nome: ctx.nome || ctx.cliente_nome || ctx.cliente || ctx.nome_cliente || '',
    cliente: ctx.cliente || ctx.cliente_nome || ctx.nome_cliente || ctx.nome || '',
    cliente_nome: ctx.cliente_nome || ctx.cliente || ctx.nome_cliente || ctx.nome || '',
    nome_cliente: ctx.nome_cliente || ctx.cliente_nome || ctx.cliente || ctx.nome || '',
    titulo: ctx.titulo || ctx.imovel_titulo || ctx.titulo_imovel || '',
    titulo_imovel: ctx.titulo_imovel || ctx.imovel_titulo || ctx.titulo || '',
    imovel_titulo: ctx.imovel_titulo || ctx.titulo_imovel || ctx.titulo || '',
    codigo: ctx.codigo || ctx.imovel_codigo || '',
    imovel_codigo: ctx.imovel_codigo || ctx.codigo || '',
    link: ctx.link || ctx.link_imovel || '',
    link_imovel: ctx.link_imovel || ctx.link || '',
    endereco: ctx.endereco || '',
    bairro: ctx.bairro || '',
    cidade: ctx.cidade || '',
    valor: ctx.valor || '',
    valor_venda: ctx.valor_venda || '',
    valor_locacao: ctx.valor_locacao || '',
    quartos: ctx.quartos !== undefined && ctx.quartos !== null ? String(ctx.quartos) : '',
    suites: ctx.suites !== undefined && ctx.suites !== null ? String(ctx.suites) : '',
    banheiros: ctx.banheiros !== undefined && ctx.banheiros !== null ? String(ctx.banheiros) : '',
    vagas: ctx.vagas !== undefined && ctx.vagas !== null ? String(ctx.vagas) : '',
    area: ctx.area !== undefined && ctx.area !== null ? String(ctx.area) : '',
    corretor_nome: ctx.corretor_nome || '',
    corretor_telefone: ctx.corretor_telefone || '',
    imobiliaria_nome: ctx.imobiliaria_nome || '',
  };

  for (const [key, value] of Object.entries(fullCtx)) {
    const placeholder = new RegExp(`\\{${key}\\}`, 'g');
    compiled = compiled.replace(placeholder, value !== undefined && value !== null ? String(value) : '');
  }

  // Limpeza de pontuação caso não haja cliente especificado (ex: "Olá, !" -> "Olá!")
  compiled = compiled.replace(/Olá,\s*!/gi, 'Olá!').replace(/Olá\s*!/gi, 'Olá!');

  return compiled;
}

/**
 * Utilitário de delay assíncrono para espaçamento de requisições
 */
export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Fila sequencial assíncrona com intervalo mínimo de 1,5s (1500ms) entre disparos
 * para garantir proteção contra Rate Limit nas chamadas da API de WhatsApp
 */
let lastDispatchTimestamp = 0;
const MIN_DISPATCH_INTERVAL_MS = 1500;
let whatsappQueue: Promise<unknown> = Promise.resolve();

export function enqueueWhatsAppDispatch<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    whatsappQueue = whatsappQueue
      .then(async () => {
        const now = Date.now();
        const timeSinceLast = now - lastDispatchTimestamp;
        if (lastDispatchTimestamp > 0 && timeSinceLast < MIN_DISPATCH_INTERVAL_MS) {
          const waitTime = MIN_DISPATCH_INTERVAL_MS - timeSinceLast;
          await delay(waitTime);
        }
        const res = await task();
        lastDispatchTimestamp = Date.now();
        return res;
      })
      .then((res) => {
        resolve(res as T);
      })
      .catch((err) => {
        lastDispatchTimestamp = Date.now();
        reject(err);
      });
  });
}

/**
 * Envio de mensagem WhatsApp através do provedor configurado com fila e intervalo mínimo de 1,5s
 */
export async function sendWhatsAppMessage({
  toPhone,
  message,
  config,
  instanceName,
  logInfo,
}: {
  toPhone: string;
  message: string;
  config?: ConfiguracaoWhatsApp;
  instanceName?: string;
  logInfo?: {
    visitaId?: string;
    tipoMensagem: WhatsAppLog['tipo_mensagem'];
    destinatarioNome: string;
    tipoDestinatario: 'cliente' | 'proprietario' | 'corretor';
  };
}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  return enqueueWhatsAppDispatch(async () => {
    const formattedNumber = cleanPhoneForWhatsApp(toPhone);

    if (!formattedNumber) {
      return { success: false, error: 'Telefone inválido ou não informado' };
    }

  // Quando executado no navegador (client-side), roteia via endpoint do Next.js para evitar Mixed Content (HTTP/HTTPS) e CORS
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhone: formattedNumber,
          message,
          instanceName,
          visitaId: logInfo?.visitaId,
          tipoMensagem: logInfo?.tipoMensagem,
          destinatarioNome: logInfo?.destinatarioNome,
          tipoDestinatario: logInfo?.tipoDestinatario,
        }),
      });
      const resData = await res.json();
      return resData;
    } catch (err: unknown) {
      console.warn('Erro ao disparar via /api/whatsapp/send no navegador:', err);
    }
  }

  const effectiveApiUrl = config?.api_url || process.env.EVOLUTION_API_URL || process.env.WHATSAPP_API_URL || 'http://147.93.9.74:8080';
  const effectiveApiKey = config?.api_key || process.env.EVOLUTION_API_KEY || process.env.WHATSAPP_API_KEY || 'easymob_secret_token_2026';
  const isSimulated = !config?.ativo && !process.env.EVOLUTION_API_URL;

  // Se não houver configuração ativa nem servidor Evolution configurado
  if (isSimulated || effectiveApiUrl.includes('exemplo-evolution')) {
    console.log(`[WHATSAPP SIMULADO] Para: ${formattedNumber} (${logInfo?.destinatarioNome}) via Instância: ${instanceName || config?.instancia_nome || 'easymob'}`);
    console.log(`[CONTEÚDO]:\n${message}`);

    // Grava log se houver informações
    if (logInfo && logInfo.visitaId) {
      try {
        await supabase.from('whatsapp_logs').insert({
          visita_id: logInfo.visitaId,
          tipo_mensagem: logInfo.tipoMensagem,
          destinatario_nome: logInfo.destinatarioNome,
          destinatario_telefone: formattedNumber,
          tipo_destinatario: logInfo.tipoDestinatario,
          conteudo_mensagem: message,
          status_envio: 'sucesso',
          resposta_api: { simulated: true, message: 'Disparo simulado no ambiente de teste' },
        });
      } catch (err) {
        console.warn('Erro ao salvar log de WhatsApp:', err);
      }
    }

    return {
      success: true,
      data: { simulated: true, messageId: `mock_${Date.now()}` },
    };
  }

  try {
    let response;
    let url = effectiveApiUrl.trim().replace(/\/$/, '');

    // 1. Evolution API (v1 / v2)
    if (!config?.provedor || config?.provedor === 'evolution_api') {
      const instance = instanceName || config?.instancia_nome || process.env.EVOLUTION_INSTANCE || 'easymob_user_admin_master';
      url = `${url}/message/sendText/${instance}`;

      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: effectiveApiKey,
        },
        body: JSON.stringify({
          number: formattedNumber,
          text: message,
          textMessage: {
            text: message,
          },
          options: {
            delay: 1200,
            presence: 'composing',
            linkPreview: false,
          },
        }),
      });
    }
    // 2. Z-API
    else if (config.provedor === 'zapi') {
      url = `${url}/send-text`;
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': config.api_key,
        },
        body: JSON.stringify({
          phone: formattedNumber,
          message: message,
        }),
      });
    }
    // 3. Custom Webhook / Genérico
    else {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.api_key}`,
        },
        body: JSON.stringify({
          to: formattedNumber,
          message: message,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    const responseData = await response.json();
    const isSuccess = response.ok;

    // Registra log no banco
    if (logInfo && logInfo.visitaId) {
      try {
        await supabase.from('whatsapp_logs').insert({
          visita_id: logInfo.visitaId,
          tipo_mensagem: logInfo.tipoMensagem,
          destinatario_nome: logInfo.destinatarioNome,
          destinatario_telefone: formattedNumber,
          tipo_destinatario: logInfo.tipoDestinatario,
          conteudo_mensagem: message,
          status_envio: isSuccess ? 'sucesso' : 'erro',
          resposta_api: responseData,
          erro_detalhes: isSuccess ? null : JSON.stringify(responseData),
        });
      } catch (logErr) {
        console.warn('Falha ao gravar log no Supabase:', logErr);
      }
    }

    if (!isSuccess) {
      return {
        success: false,
        error: `Erro na API do WhatsApp (${response.status}): ${JSON.stringify(responseData)}`,
      };
    }

    return { success: true, data: responseData };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido ao conectar com API WhatsApp';
    console.error('Erro ao enviar WhatsApp:', errorMsg);

    if (logInfo && logInfo.visitaId) {
      try {
        await supabase.from('whatsapp_logs').insert({
          visita_id: logInfo.visitaId,
          tipo_mensagem: logInfo.tipoMensagem,
          destinatario_nome: logInfo.destinatarioNome,
          destinatario_telefone: formattedNumber,
          tipo_destinatario: logInfo.tipoDestinatario,
          conteudo_mensagem: message,
          status_envio: 'erro',
          erro_detalhes: errorMsg,
        });
      } catch (logErr) {
        console.warn('Falha ao gravar log no Supabase:', logErr);
      }
    }

    return { success: false, error: errorMsg };
  }
  });
}

