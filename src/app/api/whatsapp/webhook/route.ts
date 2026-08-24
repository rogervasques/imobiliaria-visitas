import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { StatusDisparoWhatsApp } from '@/types';

/**
 * Endpoint de Webhook da Evolution API v2
 * POST /api/whatsapp/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const event = (payload.event || payload.type || '').toUpperCase();
    const data = payload.data || payload;

    console.log(`[EVOLUTION WEBHOOK] Evento recebido: ${event}`);

    // 1. Evento de Conexão: CONNECTION_UPDATE
    if (event === 'CONNECTION_UPDATE' || event === 'CONNECTION.UPDATE') {
      const state = data.state || data.status;
      console.log(`[EVOLUTION WEBHOOK] Estado da conexão atualizado: ${state}`);

      // Atualiza na tabela configuracoes_whatsapp se open
      if (state === 'open' || state === 'connected') {
        await supabase
          .from('configuracoes_whatsapp')
          .update({ ativo: true })
          .neq('id', '00000000-0000-0000-0000-000000000000');
      }

      return NextResponse.json({ success: true, processed: 'CONNECTION_UPDATE', state });
    }

    // 2. Evento de Atualização de Mensagem: MESSAGES_UPDATE
    if (event === 'MESSAGES_UPDATE' || event === 'MESSAGES.UPDATE') {
      const updates = Array.isArray(data) ? data : [data];

      for (const update of updates) {
        const rawStatus = (update.status || update.update?.status || '').toUpperCase();
        const messageId = update.key?.id || update.id;
        const remoteJid = update.key?.remoteJid || update.remoteJid || '';
        const phone = remoteJid.replace(/@.+/, '');

        // Mapeamento oficial solicitado
        let mappedStatus: StatusDisparoWhatsApp | null = null;
        if (rawStatus === 'PENDING') {
          mappedStatus = 'pendente';
        } else if (rawStatus === 'SERVER_ACK' || rawStatus === 'SENT') {
          mappedStatus = 'enviado';
        } else if (rawStatus === 'DELIVERY_ACK' || rawStatus === 'DELIVERED') {
          mappedStatus = 'entregue';
        } else if (rawStatus === 'READ' || rawStatus === 'PLAYED') {
          mappedStatus = 'visualizado';
        }

        if (mappedStatus && phone) {
          console.log(`[EVOLUTION WEBHOOK] Mensagem ${messageId} para ${phone} atualizada para: ${mappedStatus}`);

          // Atualiza registro no whatsapp_logs
          if (messageId) {
            await supabase
              .from('whatsapp_logs')
              .update({
                resposta_api: { ...update, deliveryStatus: mappedStatus },
              })
              .filter('resposta_api->key->id', 'eq', messageId);
          }

          // Atualiza visita associada mais recente para esse número
          const cleanPhone = phone.replace(/\D/g, '');
          const { data: clientes } = await supabase
            .from('clientes')
            .select('id')
            .ilike('telefone', `%${cleanPhone.slice(-8)}%`);

          if (clientes && clientes.length > 0) {
            const clienteIds = clientes.map((c) => c.id);
            const { data: visitas } = await supabase
              .from('visitas')
              .select('id, whatsapp_confirmacao_cliente, whatsapp_lembrete_cliente, whatsapp_pos_visita_cliente')
              .in('cliente_id', clienteIds)
              .order('data_hora_visita', { ascending: false })
              .limit(1);

            if (visitas && visitas.length > 0) {
              const v = visitas[0];
              // Atualiza o status mais recente relevante
              if (v.whatsapp_confirmacao_cliente !== 'visualizado') {
                await supabase
                  .from('visitas')
                  .update({ whatsapp_confirmacao_cliente: mappedStatus })
                  .eq('id', v.id);
              }
            }
          }
        }
      }

      return NextResponse.json({ success: true, processed: 'MESSAGES_UPDATE' });
    }

    // 3. Evento de Nova Mensagem Recebida/Enviada: MESSAGES_UPSERT (Gravação de Logs com Criptografia AES-256)
    if (event === 'MESSAGES_UPSERT' || event === 'MESSAGES.UPSERT' || event === 'messages.upsert') {
      const messages = Array.isArray(data) ? data : data?.messages || [data];

      for (const msg of messages) {
        const key = msg.key || {};
        const fromMe = Boolean(key.fromMe);
        const remoteJid = key.remoteJid || msg.remoteJid || '';
        const phone = remoteJid.replace(/@.+/, '').replace(/\D/g, '');
        const messageId = key.id || msg.id || `msg_${Date.now()}`;

        // Extrai texto e mídia
        let texto = '';
        let tipoMidia: 'texto' | 'imagem' | 'audio' | 'documento' = 'texto';
        let midiaUrl = '';

        const m = msg.message || {};
        if (m.conversation) {
          texto = m.conversation;
        } else if (m.extendedTextMessage?.text) {
          texto = m.extendedTextMessage.text;
        } else if (m.imageMessage) {
          tipoMidia = 'imagem';
          texto = m.imageMessage.caption || '[FOTO DA VISITA / IMOVEL]';
          midiaUrl = m.imageMessage.url || '';
        } else if (m.audioMessage) {
          tipoMidia = 'audio';
          texto = '[AUDIO DE ATENDIMENTO]';
          midiaUrl = m.audioMessage.url || '';
        } else if (m.documentMessage) {
          tipoMidia = 'documento';
          texto = m.documentMessage.fileName || '[DOCUMENTO ANEXO]';
          midiaUrl = m.documentMessage.url || '';
        }

        if (phone && texto) {
          // Busca visitas ativas para esse telefone que tenham gravar_logs === true
          const { data: clientes } = await supabase
            .from('clientes')
            .select('id, nome, telefone')
            .ilike('telefone', `%${phone.slice(-8)}%`);

          if (clientes && clientes.length > 0) {
            const clienteIds = clientes.map((c) => c.id);
            const { data: visitas } = await supabase
              .from('visitas')
              .select('id, imobiliaria, gravar_logs')
              .in('cliente_id', clienteIds)
              .order('data_hora_visita', { ascending: false })
              .limit(1);

            if (visitas && visitas.length > 0 && visitas[0].gravar_logs !== false) {
              const v = visitas[0];
              const { encryptText } = await import('@/lib/crypto');
              const encryptedText = encryptText(texto);

              try {
                await supabase.from('logs_mensagens').insert({
                  visita_id: v.id,
                  imobiliaria: v.imobiliaria,
                  message_id: messageId,
                  timestamp: new Date().toISOString(),
                  remetente_tipo: fromMe ? 'CORRETOR' : 'CLIENTE',
                  remetente_nome: fromMe ? 'Corretor' : clientes[0].nome,
                  remetente_telefone: phone,
                  conteudo_texto: encryptedText,
                  tipo_midia: tipoMidia,
                  midia_url: midiaUrl,
                });
              } catch {
                // Silencia falha se tabela ainda não criada
              }
            }
          }
        }
      }

      return NextResponse.json({ success: true, processed: 'MESSAGES_UPSERT' });
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao processar webhook';
    console.error('[EVOLUTION WEBHOOK ERROR]:', errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

// Suporte a GET para verificação do webhook
export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'EasyMob WhatsApp Evolution Webhook',
    timestamp: new Date().toISOString(),
  });
}
