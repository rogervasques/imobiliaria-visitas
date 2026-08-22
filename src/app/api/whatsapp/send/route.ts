import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';
import { getSessionUser, generateInstanceName } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toPhone, message, visitaId, tipoMensagem, destinatarioNome, tipoDestinatario, instanceName: customInstance } = body;

    if (!toPhone || !message) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros obrigatórios ausentes (toPhone, message)' },
        { status: 400 }
      );
    }

    // Busca configuração no Supabase
    const { data: config } = await supabase
      .from('configuracoes_whatsapp')
      .select('*')
      .single();

    // 1. Descobre a instância correta para o disparo
    let resolvedInstanceName = customInstance;

    // Se a mensagem for referente a uma visita, busca o criador da visita
    if (!resolvedInstanceName && visitaId) {
      try {
        const { data: visita } = await supabase
          .from('visitas')
          .select('created_by_user_id')
          .eq('id', visitaId)
          .single();

        if (visita?.created_by_user_id) {
          // Busca o instance_name do usuário dono da visita
          const { data: creatorUser } = await supabase
            .from('users')
            .select('instance_name')
            .eq('id', visita.created_by_user_id)
            .single();

          if (creatorUser?.instance_name) {
            resolvedInstanceName = creatorUser.instance_name;
          } else {
            resolvedInstanceName = generateInstanceName(visita.created_by_user_id);
          }
        }
      } catch {
        // Ignora erro de consulta e segue para fallback
      }
    }

    // Se ainda não tiver instância, tenta a do usuário logado
    if (!resolvedInstanceName) {
      const session = await getSessionUser();
      if (session?.instance_name) {
        resolvedInstanceName = session.instance_name;
      }
    }

    // Fallback final: instância geral configurada
    if (!resolvedInstanceName) {
      resolvedInstanceName = config?.instancia_nome || 'easymob';
    }

    const result = await sendWhatsAppMessage({
      toPhone,
      message,
      config: config || undefined,
      instanceName: resolvedInstanceName,
      logInfo: visitaId
        ? {
            visitaId,
            tipoMensagem: tipoMensagem || 'avulsa',
            destinatarioNome: destinatarioNome || 'Destinatário',
            tipoDestinatario: tipoDestinatario || 'cliente',
          }
        : undefined,
    });

    return NextResponse.json({ ...result, instanceUsed: resolvedInstanceName });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro interno ao processar envio';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
