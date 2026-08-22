import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { findUserByEmailForAuth, INITIAL_ADMIN_EMAIL } from '@/lib/auth';
import { generateTestSeedData } from '@/lib/seedGenerator';

export async function POST(req: NextRequest) {
  try {
    // 1. Identifica o usuário Administrador
    let adminUserId = 'user-admin-master';
    let adminUserNome = 'Roger Vasques Berchembrock';

    try {
      const adminUser = await findUserByEmailForAuth(INITIAL_ADMIN_EMAIL);
      if (adminUser) {
        adminUserId = adminUser.id;
        adminUserNome = adminUser.nome;
      }
    } catch (e) {
      console.warn('[Seed] Aviso ao buscar admin:', e);
    }

    // 2. Gera todos os dados operacionais sintéticos e verossímeis
    const seedData = generateTestSeedData(adminUserId, adminUserNome);

    // 3. Limpeza de dados operacionais antigos no Supabase (Preservando users e invites)
    try {
      // Limpa logs
      await supabase.from('whatsapp_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // Limpa tabela de junção se existir
      try {
        await supabase.from('visita_imoveis').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch {
        // Ignora se não existir
      }
      // Limpa visitas
      await supabase.from('visitas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // Limpa imóveis
      await supabase.from('imoveis').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // Limpa clientes
      await supabase.from('clientes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // Limpa proprietários
      await supabase.from('proprietarios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (cleanErr) {
      console.warn('[Seed] Aviso durante a limpeza das tabelas:', cleanErr);
    }

    // 4. Inserção em massa no Supabase (em lotes)
    try {
      // 4.1 Inserir Proprietários
      if (seedData.proprietarios.length > 0) {
        const { error: errProp } = await supabase.from('proprietarios').insert(seedData.proprietarios);
        if (errProp) console.warn('[Seed] Aviso insert proprietarios:', errProp.message);
      }

      // 4.2 Inserir Imóveis
      if (seedData.imoveis.length > 0) {
        // Remove referências complexas não mapeadas na tabela imoveis
        const dbImoveis = seedData.imoveis.map(({ proprietario: _p, ...imo }) => imo);
        const batchSize = 40;
        for (let i = 0; i < dbImoveis.length; i += batchSize) {
          const batch = dbImoveis.slice(i, i + batchSize);
          const { error: errImo } = await supabase.from('imoveis').insert(batch);
          if (errImo) console.warn('[Seed] Aviso insert imoveis batch:', errImo.message);
        }
      }

      // 4.3 Inserir Clientes
      if (seedData.clientes.length > 0) {
        const { error: errCli } = await supabase.from('clientes').insert(seedData.clientes);
        if (errCli) console.warn('[Seed] Aviso insert clientes:', errCli.message);
      }

      // 4.4 Inserir Visitas
      if (seedData.visitas.length > 0) {
        const dbVisitas = seedData.visitas.map(({ imovel: _i, imoveis: _ims, cliente: _c, ...v }) => v);
        const { error: errVis } = await supabase.from('visitas').insert(dbVisitas);
        if (errVis) console.warn('[Seed] Aviso insert visitas:', errVis.message);
      }
    } catch (dbInsertErr) {
      console.warn('[Seed] Aviso ao inserir registros no Supabase:', dbInsertErr);
    }

    const multiCount = seedData.visitas.filter((v) => v.imoveis_ids && v.imoveis_ids.length > 1).length;

    return NextResponse.json({
      success: true,
      message: 'Base operacional reinicializada e populada com dados de teste com sucesso!',
      summary: {
        proprietarios: seedData.proprietarios.length,
        imoveis: seedData.imoveis.length,
        clientes: seedData.clientes.length,
        visitas: seedData.visitas.length,
        visitasComRoteiroMultiplo: multiCount,
        adminResponsavel: `${adminUserNome} (${adminUserId})`,
      },
      data: seedData,
    });
  } catch (err) {
    console.error('Erro na rota de seed de dados operacionais:', err);
    return NextResponse.json(
      { success: false, error: 'Erro ao executar rotina de seed de dados.' },
      { status: 500 }
    );
  }
}

// Suporte também para GET (para chamada rápida no navegador ou testes)
export async function GET(req: NextRequest) {
  return POST(req);
}
