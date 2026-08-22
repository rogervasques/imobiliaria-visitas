import { NextRequest, NextResponse } from 'next/server';
import { setEvolutionWebhook, resolvePublicAppUrl } from '@/lib/evolutionApi';
import { supabase } from '@/lib/supabase';
import { ConfiguracaoWhatsApp } from '@/types';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let config: ConfiguracaoWhatsApp | null = body.config || null;
    const customWebhookUrl = body.webhookUrl || body.publicUrl;

    if (!config || !config.api_url) {
      const { data: dbConfig } = await supabase
        .from('configuracoes_whatsapp')
        .select('*')
        .single();
      config = dbConfig;
    }

    if (!config || !config.api_url) {
      return NextResponse.json(
        { success: false, error: 'Configure as credenciais da Evolution API primeiro' },
        { status: 400 }
      );
    }

    // Se a instância não veio especificada, resolve da sessão do usuário
    if (!config.instancia_nome) {
      const session = await getSessionUser();
      config.instancia_nome = session?.instance_name || 'easymob';
    }

    const publicBaseUrl = resolvePublicAppUrl(customWebhookUrl);
    const finalWebhookUrl = customWebhookUrl && customWebhookUrl.includes('/api/whatsapp/webhook')
      ? customWebhookUrl
      : `${publicBaseUrl}/api/whatsapp/webhook`;

    const result = await setEvolutionWebhook(config, finalWebhookUrl);

    return NextResponse.json(result);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao configurar webhook';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
