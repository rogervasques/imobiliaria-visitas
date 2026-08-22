import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { buildTemplateContext, compileTemplate, sendWhatsAppMessage } from '@/lib/whatsapp';
import { Visita } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const agora = new Date();
    // Limite de 65 minutos para capturar a janela de 1h de antecedência com margem
    const limiteFuturoLembrete = new Date(agora.getTime() + 65 * 60 * 1000);

    // Janela de pós-visita: Visitas que aconteceram entre 110 e 200 minutos atrás (aprox. 2h após)
    const limitePassadoPosInicio = new Date(agora.getTime() - 200 * 60 * 1000);
    const limitePassadoPosFim = new Date(agora.getTime() - 110 * 60 * 1000);

    // 1. Busca configurações ativas
    const { data: config } = await supabase
      .from('configuracoes_whatsapp')
      .select('*')
      .single();

    if (!config || !config.ativo) {
      return NextResponse.json({
        success: false,
        message: 'Automação de WhatsApp desativada nas configurações.',
      });
    }

    let enviados = 0;
    const logs: string[] = [];

    // 2. Busca visitas pendentes de lembrete (1h antes)
    const { data: visitasLembrete, error: errVisitas } = await supabase
      .from('visitas')
      .select(`
        *,
        imovel:imoveis(*),
        cliente:clientes(*)
      `)
      .neq('status', 'cancelada')
      .neq('notificar_lembrete', false)
      .eq('whatsapp_lembrete_cliente', 'pendente')
      .lte('data_hora_visita', limiteFuturoLembrete.toISOString())
      .gte('data_hora_visita', agora.toISOString());

    if (errVisitas) {
      console.warn('Erro ao consultar visitas lembrete:', errVisitas);
    }

    if (visitasLembrete && visitasLembrete.length > 0) {
      for (const visita of visitasLembrete as unknown as Visita[]) {
        const ctx = buildTemplateContext(visita);

        // Disparo para o Cliente
        if (visita.cliente?.telefone) {
          const msg = compileTemplate(config.template_lembrete_cliente, ctx);
          const res = await sendWhatsAppMessage({
            toPhone: visita.cliente.telefone,
            message: msg,
            config,
            logInfo: {
              visitaId: visita.id,
              tipoMensagem: 'lembrete_cliente',
              destinatarioNome: visita.cliente.nome,
              tipoDestinatario: 'cliente',
            },
          });

          if (res.success) {
            enviados++;
            await supabase
              .from('visitas')
              .update({ whatsapp_lembrete_cliente: 'enviado' })
              .eq('id', visita.id);
            logs.push(`Lembrete 1h cliente enviado: ${visita.cliente.nome}`);
          }
        }

        // Disparo para o Proprietário
        if (visita.imovel?.proprietario_telefone) {
          const msg = compileTemplate(config.template_lembrete_proprietario, ctx);
          const res = await sendWhatsAppMessage({
            toPhone: visita.imovel.proprietario_telefone,
            message: msg,
            config,
            logInfo: {
              visitaId: visita.id,
              tipoMensagem: 'lembrete_proprietario',
              destinatarioNome: visita.imovel.proprietario_nome,
              tipoDestinatario: 'proprietario',
            },
          });

          if (res.success) {
            await supabase
              .from('visitas')
              .update({ whatsapp_lembrete_proprietario: 'enviado' })
              .eq('id', visita.id);
            logs.push(`Lembrete 1h proprietário enviado: ${visita.imovel.proprietario_nome}`);
          }
        }
      }
    }

    // 3. Busca visitas pendentes de pós-visita / feedback (2h depois)
    const { data: visitasPosVisita } = await supabase
      .from('visitas')
      .select(`
        *,
        imovel:imoveis(*),
        cliente:clientes(*)
      `)
      .neq('status', 'cancelada')
      .neq('notificar_pos_visita', false)
      .eq('whatsapp_pos_visita_cliente', 'pendente')
      .gte('data_hora_visita', limitePassadoPosInicio.toISOString())
      .lte('data_hora_visita', limitePassadoPosFim.toISOString());

    if (visitasPosVisita && visitasPosVisita.length > 0) {
      for (const visita of visitasPosVisita as unknown as Visita[]) {
        if (visita.cliente?.telefone && config.template_pos_visita_cliente) {
          const ctx = buildTemplateContext(visita);
          const msg = compileTemplate(config.template_pos_visita_cliente, ctx);
          const res = await sendWhatsAppMessage({
            toPhone: visita.cliente.telefone,
            message: msg,
            config,
            logInfo: {
              visitaId: visita.id,
              tipoMensagem: 'pos_visita_cliente',
              destinatarioNome: visita.cliente.nome,
              tipoDestinatario: 'cliente',
            },
          });

          if (res.success) {
            enviados++;
            await supabase
              .from('visitas')
              .update({ whatsapp_pos_visita_cliente: 'enviado' })
              .eq('id', visita.id);
            logs.push(`Pós-visita 2h feedback enviado: ${visita.cliente.nome}`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      visitasLembreteProcessadas: visitasLembrete?.length || 0,
      visitasPosVisitaProcessadas: visitasPosVisita?.length || 0,
      mensagensEnviadas: enviados,
      logs,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro interno no cron de lembretes';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

