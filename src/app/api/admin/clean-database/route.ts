import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { confirmText, imobiliaria, imobiliaria_id, usuario_email, usuario_nome } = body;

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
    const isGeral = !imobiliariaNome || imobiliariaNome === 'Todas as imobiliárias' || imobiliariaNome === 'Todas';

    // 2. Limpeza no Supabase
    try {
      if (!isGeral) {
        // ─── LIMPEZA DIRECIONADA AO TENANT ESPECÍFICO ───
        
        // 2.1. Visitas e tabelas filhas (visita_imoveis, logs_mensagens, whatsapp_logs)
        try {
          await supabase.from('visitas').delete().eq('imobiliaria', imobiliariaNome);
          await supabase.from('visitas').delete().ilike('observacoes', `%[tenant:${imobiliariaNome}]%`);
          if (imobiliaria_id) {
            await supabase.from('visitas').delete().eq('imobiliaria_id', imobiliaria_id);
          }
        } catch (e: any) {
          console.warn('[Clean Database] Aviso ao limpar visitas:', e.message);
        }

        // 2.2. Imóveis
        try {
          await supabase.from('imoveis').delete().eq('imobiliaria', imobiliariaNome);
          await supabase.from('imoveis').delete().ilike('observacoes_chaves', `%[tenant:${imobiliariaNome}]%`);
          await supabase.from('imoveis').delete().ilike('observacoes', `%[tenant:${imobiliariaNome}]%`);
          if (imobiliaria_id) {
            await supabase.from('imoveis').delete().eq('imobiliaria_id', imobiliaria_id);
          }
        } catch (e: any) {
          console.warn('[Clean Database] Aviso ao limpar imóveis:', e.message);
        }

        // 2.3. Clientes
        try {
          await supabase.from('clientes').delete().eq('imobiliaria', imobiliariaNome);
          await supabase.from('clientes').delete().ilike('observacoes', `%[tenant:${imobiliariaNome}]%`);
          if (imobiliaria_id) {
            await supabase.from('clientes').delete().eq('imobiliaria_id', imobiliaria_id);
          }
        } catch (e: any) {
          console.warn('[Clean Database] Aviso ao limpar clientes:', e.message);
        }

        // 2.4. Proprietários (completamente limpos para o tenant)
        try {
          await supabase.from('proprietarios').delete().eq('imobiliaria', imobiliariaNome);
          await supabase.from('proprietarios').delete().ilike('observacoes', `%[tenant:${imobiliariaNome}]%`);
          if (imobiliaria_id) {
            await supabase.from('proprietarios').delete().eq('imobiliaria_id', imobiliaria_id);
          }
        } catch (e: any) {
          console.warn('[Clean Database] Aviso ao limpar proprietários:', e.message);
        }

        // 2.5. Logs de WhatsApp da imobiliária
        try {
          await supabase.from('whatsapp_logs').delete().eq('imobiliaria', imobiliariaNome);
          if (imobiliaria_id) {
            await supabase.from('whatsapp_logs').delete().eq('imobiliaria_id', imobiliaria_id);
          }
        } catch (e: any) {
          console.warn('[Clean Database] Aviso ao limpar whatsapp_logs:', e.message);
        }

      } else {
        // ─── LIMPEZA GLOBAL DE TODAS AS IMOBILIÁRIAS ───
        try {
          await supabase.from('whatsapp_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch {}
        try {
          await supabase.from('visita_imoveis').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch {}
        try {
          await supabase.from('visitas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch {}
        try {
          await supabase.from('imoveis').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch {}
        try {
          await supabase.from('clientes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch {}
        try {
          await supabase.from('proprietarios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch {}
      }

      // Registra log de auditoria
      try {
        await supabase.from('logs_sistema').insert({
          id: crypto.randomUUID(),
          usuario_email: usuario_email || 'admin@sistema.com',
          usuario_nome: usuario_nome || 'Administrador',
          acao: 'LIMPAR_BASE_DADOS',
          tabela: 'sistema',
          imobiliaria: imobiliariaNome || 'Todas',
          detalhes: {
            tipo: isGeral ? 'GERAL_TODAS_IMOBILIARIAS' : 'TENANT_ESPECIFICO',
            imobiliaria_limpa: imobiliariaNome,
            executado_em: new Date().toISOString(),
          },
        });
      } catch {}

    } catch (dbErr: any) {
      console.warn('[Clean Database] Aviso durante a limpeza no Supabase:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Base operacional (${imobiliariaNome || 'Geral'}) limpa com sucesso. Todos os dados de usuários e convites permanecem preservados.`,
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
