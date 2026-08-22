import { NextRequest, NextResponse } from 'next/server';
import { sendEvolutionTextMessage } from '@/lib/evolutionApi';
import { supabase } from '@/lib/supabase';
import { ConfiguracaoWhatsApp } from '@/types';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toPhone, message, config: overrideConfig } = body;

    if (!toPhone) {
      return NextResponse.json({ success: false, error: 'Informe o telefone de teste' }, { status: 400 });
    }

    let config: ConfiguracaoWhatsApp | null = overrideConfig || null;

    if (!config || !config.api_url) {
      const { data: dbConfig } = await supabase
        .from('configuracoes_whatsapp')
        .select('*')
        .single();
      config = dbConfig;
    }

    if (!config || !config.api_url) {
      return NextResponse.json(
        { success: false, error: 'Configure os dados da Evolution API antes de testar' },
        { status: 400 }
      );
    }

    // Se a instância não veio especificada, resolve da sessão do usuário
    if (!config.instancia_nome) {
      const session = await getSessionUser();
      config.instancia_nome = session?.instance_name || 'easymob';
    }

    const textToSend = message || '🚀 *EasyMob - Teste de Envio WhatsApp*\n\nSua conexão com a Evolution API v2 está funcionando com sucesso!';
    const result = await sendEvolutionTextMessage({
      config,
      toPhone,
      message: textToSend,
    });

    return NextResponse.json(result);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao testar envio';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
