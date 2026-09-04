import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioEmail = searchParams.get('usuarioEmail');
    const acao = searchParams.get('acao');
    const tabela = searchParams.get('tabela');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const imobiliaria = searchParams.get('imobiliaria');
    const limit = parseInt(searchParams.get('limit') || '200', 10);

    let query = supabase
      .from('logs_sistema')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(limit);

    if (usuarioEmail) {
      query = query.ilike('usuario_email', `%${usuarioEmail}%`);
    }
    if (acao) {
      query = query.eq('acao', acao);
    }
    if (tabela) {
      query = query.eq('tabela', tabela);
    }
    if (dataInicio) {
      query = query.gte('criado_em', `${dataInicio}T00:00:00.000Z`);
    }
    if (dataFim) {
      query = query.lte('criado_em', `${dataFim}T23:59:59.999Z`);
    }
    if (imobiliaria && imobiliaria !== 'todas') {
      query = query.eq('imobiliaria', imobiliaria);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao consultar logs_sistema:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, logs: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno ao consultar logs';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      usuario_id,
      usuario_email,
      usuario_nome,
      acao,
      tabela,
      registro_id,
      detalhes,
      imobiliaria_id,
      imobiliaria,
    } = body;

    if (!acao || !tabela) {
      return NextResponse.json(
        { success: false, error: 'Ação e tabela são obrigatórias' },
        { status: 400 }
      );
    }

    const newLog = {
      usuario_id: usuario_id || null,
      usuario_email: usuario_email || 'sistema@easymob.com.br',
      usuario_nome: usuario_nome || 'Sistema',
      acao,
      tabela,
      registro_id: registro_id ? String(registro_id) : null,
      detalhes: detalhes || {},
      imobiliaria_id: imobiliaria_id || null,
      imobiliaria: imobiliaria || 'Lagom Imóveis',
      criado_em: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('logs_sistema').insert(newLog).select().single();

    if (error) {
      console.warn('Erro ao inserir log_sistema no Supabase:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, log: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno ao gravar log';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
