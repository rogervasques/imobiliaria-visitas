import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ItemLixeira } from '@/types';

export const dynamic = 'force-dynamic';

const RETENTION_DAYS = 60;

function calculateDaysLeft(deletedAtIso: string): number {
  const deletedAt = new Date(deletedAtIso).getTime();
  const expiresAt = deletedAt + RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const diffMs = expiresAt - now;
  const daysLeft = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  return Math.max(0, daysLeft);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imobiliaria = searchParams.get('imobiliaria');
    const tipo = searchParams.get('tipo'); // 'todos' | 'imovel' | 'cliente' | 'visita'

    const items: ItemLixeira[] = [];

    // 1. Imóveis na lixeira
    if (!tipo || tipo === 'todos' || tipo === 'imovel') {
      let query = supabase
        .from('imoveis')
        .select('*')
        .not('deletado_em', 'is', null)
        .order('deletado_em', { ascending: false });

      if (imobiliaria && imobiliaria !== 'todas') {
        query = query.eq('imobiliaria', imobiliaria);
      }

      const { data: delImoveis } = await query;
      if (delImoveis) {
        for (const im of delImoveis) {
          items.push({
            id: im.id,
            tabela: 'imoveis',
            tipo: 'imovel',
            titulo: im.titulo || 'Imóvel sem título',
            subtitulo: `${im.bairro || ''}, ${im.cidade || ''}`,
            codigo: im.codigo || 'SEM-COD',
            deletado_em: im.deletado_em,
            data_expiracao: new Date(new Date(im.deletado_em).getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
            dias_restantes: calculateDaysLeft(im.deletado_em),
            dados_completos: im,
          });
        }
      }
    }

    // 2. Clientes na lixeira
    if (!tipo || tipo === 'todos' || tipo === 'cliente') {
      let query = supabase
        .from('clientes')
        .select('*')
        .not('deletado_em', 'is', null)
        .order('deletado_em', { ascending: false });

      if (imobiliaria && imobiliaria !== 'todas') {
        query = query.eq('imobiliaria', imobiliaria);
      }

      const { data: delClientes } = await query;
      if (delClientes) {
        for (const cl of delClientes) {
          items.push({
            id: cl.id,
            tabela: 'clientes',
            tipo: 'cliente',
            titulo: cl.nome || 'Cliente',
            subtitulo: cl.telefone ? `Tel: ${cl.telefone}` : (cl.email || ''),
            codigo: cl.perfil_interesse || undefined,
            deletado_em: cl.deletado_em,
            data_expiracao: new Date(new Date(cl.deletado_em).getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
            dias_restantes: calculateDaysLeft(cl.deletado_em),
            dados_completos: cl,
          });
        }
      }
    }

    // 3. Visitas na lixeira
    if (!tipo || tipo === 'todos' || tipo === 'visita') {
      let query = supabase
        .from('visitas')
        .select('*')
        .not('deletado_em', 'is', null)
        .order('deletado_em', { ascending: false });

      if (imobiliaria && imobiliaria !== 'todas') {
        query = query.eq('imobiliaria', imobiliaria);
      }

      const { data: delVisitas } = await query;
      if (delVisitas) {
        for (const v of delVisitas) {
          items.push({
            id: v.id,
            tabela: 'visitas',
            tipo: 'visita',
            titulo: v.cliente_nome ? `Visita com ${v.cliente_nome}` : 'Visita Agendada',
            subtitulo: v.data_hora_visita || '',
            codigo: v.codigo || undefined,
            deletado_em: v.deletado_em,
            data_expiracao: new Date(new Date(v.deletado_em).getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
            dias_restantes: calculateDaysLeft(v.deletado_em),
            dados_completos: v,
          });
        }
      }
    }

    // Ordena do mais recente deletado para o mais antigo
    items.sort((a, b) => new Date(b.deletado_em).getTime() - new Date(a.deletado_em).getTime());

    return NextResponse.json({ success: true, items });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno ao consultar lixeira';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, tabela, id, usuario_email, usuario_nome, imobiliaria } = body;

    // 1. Restaurar Registro (Soft Delete Rollback)
    if (action === 'restore') {
      if (!tabela || !id) {
        return NextResponse.json({ success: false, error: 'Tabela e ID são obrigatórios' }, { status: 400 });
      }

      const { error: updateErr } = await supabase
        .from(tabela)
        .update({ deletado_em: null, atualizado_em: new Date().toISOString() })
        .eq('id', id);

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
      }

      // Grava Log de Auditoria da Restauração
      await supabase.from('logs_sistema').insert({
        usuario_email: usuario_email || 'admin@easymob.com.br',
        usuario_nome: usuario_nome || 'Admin',
        acao: `RESTAURAR_${tabela.toUpperCase().slice(0, -1)}`,
        tabela,
        registro_id: id,
        detalhes: { motivo: 'Restauração solicitada via painel da lixeira', restaurado_em: new Date().toISOString() },
        imobiliaria: imobiliaria || 'Lagom Imóveis',
        criado_em: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, message: 'Registro restaurado com sucesso!' });
    }

    // 2. Exclusão Permanente (Hard Delete)
    if (action === 'hard_delete') {
      if (!tabela || !id) {
        return NextResponse.json({ success: false, error: 'Tabela e ID são obrigatórios' }, { status: 400 });
      }

      const { error: deleteErr } = await supabase.from(tabela).delete().eq('id', id);

      if (deleteErr) {
        return NextResponse.json({ success: false, error: deleteErr.message }, { status: 500 });
      }

      // Grava Log de Auditoria
      await supabase.from('logs_sistema').insert({
        usuario_email: usuario_email || 'admin@easymob.com.br',
        usuario_nome: usuario_nome || 'Admin',
        acao: `PURGA_PERMANENTE_${tabela.toUpperCase().slice(0, -1)}`,
        tabela,
        registro_id: id,
        detalhes: { motivo: 'Exclusão definitiva manual pelo administrador', purgado_em: new Date().toISOString() },
        imobiliaria: imobiliaria || 'Lagom Imóveis',
        criado_em: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, message: 'Registro purgado permanentemente!' });
    }

    // 3. Purga Automática de Expirados (> 60 dias)
    if (action === 'purge_now') {
      // Chama a procedure SQL
      const { data: rpcData, error: rpcErr } = await supabase.rpc('purgar_lixeira_60_dias');

      if (rpcErr) {
        console.warn('RPC purgar_lixeira_60_dias falhou ou não existe, executando fallback SQL:', rpcErr);

        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

        const { count: vCount } = await supabase
          .from('visitas')
          .delete({ count: 'exact' })
          .not('deletado_em', 'is', null)
          .lt('deletado_em', sixtyDaysAgo);

        const { count: iCount } = await supabase
          .from('imoveis')
          .delete({ count: 'exact' })
          .not('deletado_em', 'is', null)
          .lt('deletado_em', sixtyDaysAgo);

        const { count: cCount } = await supabase
          .from('clientes')
          .delete({ count: 'exact' })
          .not('deletado_em', 'is', null)
          .lt('deletado_em', sixtyDaysAgo);

        return NextResponse.json({
          success: true,
          summary: {
            visitas_purgadas: vCount || 0,
            imoveis_purgados: iCount || 0,
            clientes_purgados: cCount || 0,
          },
        });
      }

      return NextResponse.json({ success: true, summary: rpcData });
    }

    return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno na lixeira';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
