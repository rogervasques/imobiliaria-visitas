import { NextRequest, NextResponse } from 'next/server';
import { getEvolutionConnectionState } from '@/lib/evolutionApi';
import { supabase } from '@/lib/supabase';
import { ConfiguracaoWhatsApp } from '@/types';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let config: ConfiguracaoWhatsApp | null = body.config || null;

    if (!config || !config.api_url) {
      const { data: dbConfig } = await supabase
        .from('configuracoes_whatsapp')
        .select('*')
        .single();
      config = dbConfig;
    }

    if (!config || !config.api_url) {
      return NextResponse.json({ state: 'close', error: 'Nenhuma configuração cadastrada' });
    }

    // Se a instância não veio especificada, resolve da sessão do usuário
    if (!config.instancia_nome) {
      const session = await getSessionUser();
      config.instancia_nome = session?.instance_name || 'easymob';
    }

    const result = await getEvolutionConnectionState(config);
    return NextResponse.json({ ...result, instance: config.instancia_nome });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao consultar status';
    return NextResponse.json({ state: 'close', error: errorMsg }, { status: 500 });
  }
}
