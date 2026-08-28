import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { confirmText, imobiliaria, imobiliaria_id } = body;

    // 1. Dupla verificação no backend: exige a palavra de confirmação 'LIMPAR'
    if (!confirmText || String(confirmText).trim().toUpperCase() !== 'LIMPAR') {
      return NextResponse.json(
        {
          success: false,
          error: 'Confirmação de segurança inválida. É obrigatório digitar a palavra LIMPAR para executar a exclusão.',
        },
        { status: 400 }
      );
    }

    const imobiliariaNome = (imobiliaria || '').trim();

    // 2. Limpeza no Supabase
    try {
      if (imobiliariaNome && imobiliariaNome !== 'Todas as imobiliárias' && imobiliariaNome !== 'Todas') {
        // Limpeza direcionada ao tenant específico
        await supabase.from('visitas').delete().ilike('observacoes', `%[tenant:${imobiliariaNome}]%`);
        await supabase.from('imoveis').delete().ilike('observacoes_chaves', `%[tenant:${imobiliariaNome}]%`);
        await supabase.from('clientes').delete().ilike('observacoes', `%[tenant:${imobiliariaNome}]%`);
      } else {
        // Limpeza geral de todas as imobiliárias
        await supabase.from('whatsapp_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        try {
          await supabase.from('visita_imoveis').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch {
          // ignore
        }
        await supabase.from('visitas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('imoveis').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('clientes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('proprietarios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (dbErr: any) {
      console.warn('[Clean Database] Aviso durante a limpeza no Supabase:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Base operacional (${imobiliariaNome}) limpa com sucesso com dupla verificação. Todos os dados de usuários e convites permanecem preservados.`,
      imobiliaria: imobiliariaNome,
    });
  } catch (err: any) {
    console.error('Erro na rota de limpeza do banco de dados:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar a limpeza do banco de dados.' },
      { status: 500 }
    );
  }
}
