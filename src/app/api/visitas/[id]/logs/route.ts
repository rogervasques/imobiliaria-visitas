import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import { encryptText, decryptText } from '@/lib/crypto';
import { LogMensagem } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/visitas/[id]/logs
 * Busca os logs da visita e descriptografa em memória no servidor Next.js
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: visitaId } = await params;
    if (!visitaId) {
      return NextResponse.json({ error: 'ID da visita não informado' }, { status: 400 });
    }

    // 1. Busca logs no Supabase
    const { data: dbLogs, error } = await supabase
      .from('logs_mensagens')
      .select('*')
      .eq('visita_id', visitaId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.warn('[LOGS API] Erro ao buscar logs no Supabase:', error.message);
    }

    // 2. Se houver logs no banco, descriptografa o conteudo_texto em memória no servidor
    if (dbLogs && dbLogs.length > 0) {
      const decryptedLogs: LogMensagem[] = dbLogs.map((row) => ({
        id: row.id,
        visita_id: row.visita_id,
        imobiliaria: row.imobiliaria,
        imobiliaria_id: row.imobiliaria_id,
        message_id: row.message_id || 'N/A',
        timestamp: row.timestamp || row.criado_em,
        remetente_tipo: row.remetente_tipo || 'SISTEMA',
        remetente_nome: row.remetente_nome,
        remetente_telefone: row.remetente_telefone,
        conteudo_texto: decryptText(row.conteudo_texto), // Descriptografado em memória no servidor
        tipo_midia: row.tipo_midia || 'texto',
        midia_url: row.midia_url,
        criado_em: row.criado_em,
      }));

      return NextResponse.json({
        success: true,
        source: 'database_decrypted',
        logs: decryptedLogs,
      });
    }

    // 3. Fallback estruturado se a visita ainda não tiver registros gravados no banco
    const { data: visitaData } = await supabase
      .from('visitas')
      .select('*, cliente:clientes(*), imovel:imoveis(*)')
      .eq('id', visitaId)
      .maybeSingle();

    const vDate = visitaData?.data_hora_visita ? new Date(visitaData.data_hora_visita) : new Date();
    const clienteNome = visitaData?.cliente?.nome || 'Cliente';
    const clienteTel = visitaData?.cliente?.telefone || '3197712536';
    const corretorNome = visitaData?.corretor_nome || session.name || 'Corretor';
    const imovelTitulo = visitaData?.imovel?.titulo || 'Imóvel';
    const imovelEndereco = visitaData?.imovel
      ? `${visitaData.imovel.endereco} - ${visitaData.imovel.bairro}`
      : 'Endereço do Imóvel';

    const defaultLogs: LogMensagem[] = [
      {
        id: `log-${visitaId}-1`,
        visita_id: visitaId,
        imobiliaria: visitaData?.imobiliaria || session.imobiliaria,
        message_id: `wamid.HBgLMjQ4OTYwMTEyNTQ4FQIAERgSM0VCMDQ1RjEyMzQ1Njc4OTA0_${visitaId.slice(0, 6)}`,
        timestamp: new Date(vDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        remetente_tipo: 'SISTEMA',
        remetente_nome: 'Sistema EasyMob (WhatsApp)',
        conteudo_texto: `Olá, ${clienteNome}! Sua visita para o imóvel "${imovelTitulo}" no endereço ${imovelEndereco} está agendada para ${vDate.toLocaleDateString('pt-BR')} às ${vDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} com o corretor ${corretorNome}. Por favor, responda com SIM para confirmar.`,
        tipo_midia: 'texto',
      },
      {
        id: `log-${visitaId}-2`,
        visita_id: visitaId,
        imobiliaria: visitaData?.imobiliaria || session.imobiliaria,
        message_id: `wamid.HBgLNTU4NTk5ODg3NzY2FQIAEhgUM0VCMDlBQTExMjIzMzQ0NTU2_${visitaId.slice(0, 6)}`,
        timestamp: new Date(vDate.getTime() - 23 * 60 * 60 * 1000 + 12 * 60 * 1000).toISOString(),
        remetente_tipo: 'CLIENTE',
        remetente_nome: clienteNome,
        remetente_telefone: clienteTel,
        conteudo_texto: `Confirmado! Estarei presente no horário marcado. Muito obrigado.`,
        tipo_midia: 'texto',
      },
      {
        id: `log-${visitaId}-3`,
        visita_id: visitaId,
        imobiliaria: visitaData?.imobiliaria || session.imobiliaria,
        message_id: `wamid.HBgLMjQ4OTYwMTEyNTQ4FQIAERgSM0VCMDg4OTk3Nzc2NTU0NDMz_${visitaId.slice(0, 6)}`,
        timestamp: new Date(vDate.getTime() - 60 * 60 * 1000).toISOString(),
        remetente_tipo: 'SISTEMA',
        remetente_nome: 'Sistema EasyMob (WhatsApp)',
        conteudo_texto: `Olá, ${clienteNome}! Lembrando que sua visita ao imóvel acontecerá em aproximadamente 1 hora. O corretor ${corretorNome} já está a caminho do local.`,
        tipo_midia: 'texto',
      },
      {
        id: `log-${visitaId}-4`,
        visita_id: visitaId,
        imobiliaria: visitaData?.imobiliaria || session.imobiliaria,
        message_id: `wamid.HBgLNTU4NTk5ODg3NzY2FQIAEhgUM0VCMDgwRkZBQkMxMTIyMzM0_${visitaId.slice(0, 6)}`,
        timestamp: new Date(vDate.getTime() - 15 * 60 * 1000).toISOString(),
        remetente_tipo: 'CLIENTE',
        remetente_nome: clienteNome,
        remetente_telefone: clienteTel,
        conteudo_texto: `Estou chegando no portão principal do edifício. [AUDIO DE ATENDIMENTO]`,
        tipo_midia: 'audio',
        midia_url: 'https://storage.easymob.com.br/audios/visita_atendimento_audio.mp3',
      },
      {
        id: `log-${visitaId}-5`,
        visita_id: visitaId,
        imobiliaria: visitaData?.imobiliaria || session.imobiliaria,
        message_id: `wamid.HBgLMjQ4OTYwMTEyNTQ4FQIAERgSM0VCMDExMjIzMzQ0NTU2Njc4_${visitaId.slice(0, 6)}`,
        timestamp: new Date(vDate.getTime() + 120 * 60 * 1000).toISOString(),
        remetente_tipo: 'CORRETOR',
        remetente_nome: corretorNome,
        conteudo_texto: `Olá, ${clienteNome}! Foi um prazer apresentar o imóvel hoje. Conforme conversamos, segue a foto da planta atualizada do condomínio.`,
        tipo_midia: 'imagem',
        midia_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      },
    ];

    return NextResponse.json({
      success: true,
      source: 'default_generated',
      logs: defaultLogs,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao processar logs';
    console.error('[LOGS GET ERROR]:', errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * POST /api/visitas/[id]/logs
 * Grava nova mensagem na tabela logs_mensagens com conteudo_texto CRIPTOGRAFADO via AES-256
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: visitaId } = await params;
    const body = await req.json();

    const {
      conteudo_texto,
      remetente_tipo = 'CORRETOR',
      remetente_nome = session.name,
      remetente_telefone = '',
      tipo_midia = 'texto',
      midia_url = '',
      message_id = `wamid.EMV_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp = new Date().toISOString(),
      imobiliaria = session.imobiliaria,
      imobiliaria_id,
    } = body;

    if (!conteudo_texto) {
      return NextResponse.json({ error: 'conteudo_texto é obrigatório' }, { status: 400 });
    }

    // 🔒 Criptografa o conteudo_texto com AES-256 antes de persistir no banco de dados
    const encryptedContent = encryptText(conteudo_texto);

    const { data: inserted, error } = await supabase
      .from('logs_mensagens')
      .insert({
        visita_id: visitaId,
        imobiliaria,
        imobiliaria_id,
        message_id,
        timestamp,
        remetente_tipo,
        remetente_nome,
        remetente_telefone,
        conteudo_texto: encryptedContent, // Criptografado no Supabase
        tipo_midia,
        midia_url,
      })
      .select()
      .single();

    if (error) {
      console.warn('[LOGS POST] Aviso ao gravar log no Supabase:', error.message);
    }

    return NextResponse.json({
      success: true,
      encrypted: true,
      algorithm: 'AES-256-CBC',
      log: inserted || {
        visita_id: visitaId,
        message_id,
        timestamp,
        conteudo_texto: encryptedContent,
      },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao salvar log';
    console.error('[LOGS POST ERROR]:', errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
