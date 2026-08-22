import { ConfiguracaoWhatsApp } from '@/types';
import { cleanPhoneForWhatsApp } from './utils';

export interface EvolutionConnectionStateResponse {
  instance?: {
    instanceName?: string;
    state?: 'open' | 'close' | 'connecting' | string;
  };
  state?: 'open' | 'close' | 'connecting' | string;
  status?: string;
}

export interface EvolutionConnectResponse {
  pairingCode?: string;
  code?: string;
  base64?: string;
  qrcode?: {
    base64?: string;
    code?: string;
  };
  count?: number;
}

/**
 * Normaliza a URL base da Evolution API
 */
export function getBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, '');
}

/**
 * Consulta o estado atual da conexão da instância
 * GET /instance/connectionState/{instance}
 */
export async function getEvolutionConnectionState(
  config: ConfiguracaoWhatsApp
): Promise<{ state: 'open' | 'close' | 'connecting' | 'desconhecido'; raw?: unknown }> {
  if (!config.api_url || !config.api_key) {
    return { state: 'close' };
  }

  // Se URL for mock/demo, simula estado
  if (config.api_url.includes('exemplo-evolution')) {
    return { state: config.ativo ? 'open' : 'close' };
  }

  const baseUrl = getBaseUrl(config.api_url);
  const instance = config.instancia_nome || 'easymob';
  const url = `${baseUrl}/instance/connectionState/${instance}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: config.api_key,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return { state: 'close', raw: await res.text() };
    }

    const data: EvolutionConnectionStateResponse = await res.json();
    const rawState = data.instance?.state || data.state || data.status || '';

    if (rawState === 'open' || rawState === 'connected') return { state: 'open', raw: data };
    if (rawState === 'connecting') return { state: 'connecting', raw: data };
    return { state: 'close', raw: data };
  } catch (err) {
    console.error('Erro ao consultar connectionState na Evolution API:', err);
    return { state: 'close', raw: String(err) };
  }
}

/**
 * Resolve a URL pública oficial da aplicação EasyMob
 */
export function resolvePublicAppUrl(customUrl?: string): string {
  if (customUrl && customUrl.trim() && !customUrl.includes('localhost') && !customUrl.includes('127.0.0.1')) {
    return customUrl.trim().replace(/\/$/, '');
  }

  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, '');
  }

  if (process.env.APP_URL && !process.env.APP_URL.includes('localhost')) {
    return process.env.APP_URL.trim().replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    const proto = process.env.VERCEL_URL.startsWith('http') ? '' : 'https://';
    return `${proto}${process.env.VERCEL_URL}`.replace(/\/$/, '');
  }

  return 'https://app.easymob.com.br';
}

/**
 * Cria a instância na Evolution API caso ainda não exista
 * POST /instance/create
 */
export async function createEvolutionInstance(
  config: ConfiguracaoWhatsApp
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  if (!config.api_url || !config.api_key) {
    return { success: false, error: 'Configuração incompleta' };
  }

  const baseUrl = getBaseUrl(config.api_url);
  const instance = config.instancia_nome || 'easymob';
  const url = `${baseUrl}/instance/create`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.api_key,
      },
      body: JSON.stringify({
        instanceName: instance,
        token: '',
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      }),
    });

    const data = await res.json().catch(() => ({}));

    // Ao criar a instância, tenta configurar o webhook automaticamente
    if (res.ok) {
      const publicUrl = resolvePublicAppUrl();
      await setEvolutionWebhook(config, `${publicUrl}/api/whatsapp/webhook`).catch(() => {});
    }

    return {
      success: res.ok,
      data,
      error: res.ok ? undefined : JSON.stringify(data),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro ao criar instância',
    };
  }
}

/**
 * Registra a URL de Webhook do EasyMob na Evolution API v2
 * POST /webhook/set/{instance}
 */
export async function setEvolutionWebhook(
  config: ConfiguracaoWhatsApp,
  webhookUrl?: string
): Promise<{ success: boolean; data?: unknown; webhookUrl?: string; error?: string }> {
  if (!config.api_url || !config.api_key) {
    return { success: false, error: 'Configuração incompleta' };
  }

  const baseUrl = getBaseUrl(config.api_url);
  const instance = config.instancia_nome || 'easymob';
  const url = `${baseUrl}/webhook/set/${instance}`;

  const resolvedWebhookUrl = webhookUrl && webhookUrl.trim()
    ? webhookUrl.trim()
    : `${resolvePublicAppUrl()}/api/whatsapp/webhook`;

  const payload = {
    webhook: {
      enabled: true,
      url: resolvedWebhookUrl,
      byEvents: false,
      base64: false,
      events: [
        'CONNECTION_UPDATE',
        'MESSAGES_UPDATE',
        'SEND_MESSAGE',
      ],
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.api_key,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    return {
      success: res.ok,
      data,
      webhookUrl: resolvedWebhookUrl,
      error: res.ok ? undefined : JSON.stringify(data),
    };
  } catch (err) {
    return {
      success: false,
      webhookUrl: resolvedWebhookUrl,
      error: err instanceof Error ? err.message : 'Erro ao configurar webhook na Evolution API',
    };
  }
}

/**
 * Solicita o QR Code para pareamento
 * GET /instance/connect/{instance}
 */
export async function getEvolutionConnectQr(
  config: ConfiguracaoWhatsApp
): Promise<{ success: boolean; base64?: string; pairingCode?: string; error?: string }> {
  if (!config.api_url || !config.api_key) {
    return { success: false, error: 'URL e API Key da Evolution API são obrigatórias' };
  }

  const baseUrl = getBaseUrl(config.api_url);
  const instance = config.instancia_nome || 'easymob';
  const url = `${baseUrl}/instance/connect/${instance}`;

  try {
    let res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: config.api_key,
      },
      cache: 'no-store',
    });

    // Se instância não foi encontrada (404), tenta criar automaticamente
    if (res.status === 404 || !res.ok) {
      const createRes = await createEvolutionInstance(config);
      if (createRes.success && createRes.data) {
        const createData = createRes.data as EvolutionConnectResponse;
        const base64Img = createData.base64 || createData.qrcode?.base64;
        const pairing = createData.pairingCode || createData.code;
        if (base64Img || pairing) {
          return {
            success: true,
            base64: base64Img,
            pairingCode: pairing,
          };
        }
      }

      // Tenta novamente a rota connect após a criação
      res = await fetch(url, {
        method: 'GET',
        headers: {
          apikey: config.api_key,
        },
        cache: 'no-store',
      });
    }

    const data: EvolutionConnectResponse = await res.json().catch(() => ({}));

    const base64Img = data.base64 || data.qrcode?.base64;
    const pairing = data.pairingCode || data.code;

    if (base64Img || pairing) {
      return {
        success: true,
        base64: base64Img,
        pairingCode: pairing,
      };
    }

    return {
      success: res.ok,
      base64: base64Img,
      pairingCode: pairing,
      error: res.ok ? undefined : 'Não foi possível obter o QR Code da Evolution API.',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao conectar com a Evolution API',
    };
  }
}

/**
 * Desconecta a instância (Logout)
 * DELETE /instance/logout/{instance}
 */
export async function logoutEvolutionInstance(
  config: ConfiguracaoWhatsApp
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!config.api_url || !config.api_key) {
    return { success: false, error: 'Configurações incompletas' };
  }

  const baseUrl = getBaseUrl(config.api_url);
  const instance = config.instancia_nome || 'easymob';
  const url = `${baseUrl}/instance/logout/${instance}`;

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        apikey: config.api_key,
      },
    });

    const data = await res.json().catch(() => ({}));
    return {
      success: res.ok,
      message: 'Instância desconectada com sucesso',
      error: res.ok ? undefined : JSON.stringify(data),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro ao desconectar instância',
    };
  }
}

/**
 * Envia mensagem de texto via Evolution API v2
 * POST /message/sendText/{instance}
 */
export async function sendEvolutionTextMessage({
  config,
  toPhone,
  message,
}: {
  config: ConfiguracaoWhatsApp;
  toPhone: string;
  message: string;
}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const formattedNumber = cleanPhoneForWhatsApp(toPhone);
  if (!formattedNumber) {
    return { success: false, error: 'Número de telefone inválido' };
  }

  const baseUrl = getBaseUrl(config.api_url);
  const instance = config.instancia_nome || 'easymob';
  const url = `${baseUrl}/message/sendText/${instance}`;

  // Payload padrão Evolution API v2
  const payload = {
    number: formattedNumber,
    text: message,
    delay: 1200,
    linkPreview: false,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.api_key,
      },
      body: JSON.stringify(payload),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: `Erro Evolution API (${res.status}): ${JSON.stringify(resData)}`,
      };
    }

    return {
      success: true,
      data: resData,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro ao enviar mensagem via Evolution API',
    };
  }
}
