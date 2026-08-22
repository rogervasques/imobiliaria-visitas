import { ConfiguracaoWhatsApp, Visita, WhatsAppLog } from '@/types';
import { cleanPhoneForWhatsApp, formatDate, formatDateTime, formatTime } from './utils';
import { supabase } from './supabase';

export interface TemplateContext {
  cliente_nome: string;
  cliente_telefone?: string;
  proprietario_nome: string;
  proprietario_telefone?: string;
  imovel_titulo: string;
  imovel_codigo?: string;
  endereco: string;
  roteiro_imoveis: string;
  total_imoveis: string;
  data_hora: string;
  horario: string;
  data: string;
  corretor_nome: string;
  corretor_telefone: string;
}

/**
 * Monta o contexto de variáveis para interpolação nos templates a partir de uma Visita
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

  return {
    cliente_nome: visita.cliente?.nome || 'Cliente',
    cliente_telefone: visita.cliente?.telefone || '',
    proprietario_nome: proprietariosNomes || 'Proprietário',
    proprietario_telefone: proprietariosTelefones || '',
    imovel_titulo: titulosCombinados,
    imovel_codigo: codigosCombinados,
    endereco: enderecoCompleto,
    roteiro_imoveis: roteiroFormatado,
    total_imoveis: String(listaImoveis.length || 1),
    data_hora: dataHora,
    horario: horario,
    data: data,
    corretor_nome: visita.corretor_nome || 'Corretor',
    corretor_telefone: visita.corretor_telefone || '',
  };
}

/**
 * Substitui as tags do template com os valores do contexto
 */
export function compileTemplate(template: string, ctx: TemplateContext): string {
  let compiled = template;
  for (const [key, value] of Object.entries(ctx)) {
    const placeholder = new RegExp(`\\{${key}\\}`, 'g');
    compiled = compiled.replace(placeholder, value || '');
  }
  return compiled;
}

/**
 * Envio de mensagem WhatsApp através do provedor configurado
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
  const formattedNumber = cleanPhoneForWhatsApp(toPhone);

  if (!formattedNumber) {
    return { success: false, error: 'Telefone inválido ou não informado' };
  }

  // Se não houver configuração ativa ou URLs de mock, operamos em modo simulado
  if (!config || !config.ativo || !config.api_url || config.api_url.includes('exemplo-evolution')) {
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
    let url = config.api_url.trim().replace(/\/$/, '');

    // 1. Evolution API (v1 / v2)
    if (config.provedor === 'evolution_api') {
      const instance = instanceName || config.instancia_nome || 'easymob';
      url = `${url}/message/sendText/${instance}`;

      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: config.api_key,
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
}
