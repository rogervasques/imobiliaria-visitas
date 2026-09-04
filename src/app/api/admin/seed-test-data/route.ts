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

    // 2. Extrai imobiliária ativa do payload (se informado)
    let targetImobiliariaNome = 'Lagom Imóveis';
    let targetImobiliariaId: string | undefined = undefined;

    try {
      const body = await req.json().catch(() => ({}));
      if (body && body.imobiliaria) targetImobiliariaNome = String(body.imobiliaria).trim();
      if (body && body.imobiliaria_id) targetImobiliariaId = String(body.imobiliaria_id).trim();
    } catch {
      // ignore
    }

    // 3. Gera todos os dados operacionais sintéticos e verossímeis vinculados ao tenant
    const seedData = generateTestSeedData(adminUserId, adminUserNome, targetImobiliariaNome, targetImobiliariaId);

    // 4. Limpeza de dados operacionais antigos no Supabase (Preservando users e invites)
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

    // 5. Inserção em massa no Supabase (em lotes estruturados)
    try {
      // 5.1 Inserir Proprietários (dados limpos e essenciais)
      const dbProprietarios = seedData.proprietarios.map((p) => ({
        id: crypto.randomUUID(),
        nome: p.nome,
        telefone: p.telefone,
        email: p.email,
        imobiliaria: targetImobiliariaNome,
        imobiliaria_id: targetImobiliariaId,
        criado_em: p.criado_em,
      }));

      const { data: insertedProp, error: errProp } = await supabase
        .from('proprietarios')
        .insert(dbProprietarios)
        .select('id, nome, telefone, email');

      if (errProp) console.warn('[Seed] Aviso insert proprietarios:', errProp.message);

      const propList = insertedProp && insertedProp.length > 0 ? insertedProp : dbProprietarios;

      // 5.2 Inserir Imóveis (com fotos_urls completo, áreas, características e tenant)
      const dbImoveis = seedData.imoveis.map((imo, idx) => {
        const prop = propList[idx % propList.length];
        return {
          id: crypto.randomUUID(),
          codigo: imo.codigo,
          titulo: imo.titulo,
          tipo: imo.tipo,
          finalidade: imo.finalidade,
          endereco: imo.endereco,
          numero: imo.numero,
          complemento: imo.complemento,
          bairro: imo.bairro,
          cidade: imo.cidade,
          estado: imo.estado,
          cep: imo.cep || '37000-000',
          valor_venda: imo.valor_venda,
          valor_locacao: imo.valor_locacao,
          valor_condominio: imo.valor_condominio,
          valor_iptu: imo.valor_iptu,
          quartos: imo.quartos,
          suites: imo.suites || 0,
          banheiros: imo.banheiros,
          vagas: imo.vagas,
          area_construida: imo.area_construida,
          area_util: imo.area_util,
          area_terreno: imo.area_terreno,
          aceita_pet: imo.aceita_pet ?? true,
          descricao_comercial: imo.descricao_comercial,
          caracteristicas: imo.caracteristicas || [],
          observacoes_chaves: imo.observacoes_chaves,
          status: imo.status,
          imagem_url: imo.imagem_url,
          fotos_urls: imo.fotos_urls || [imo.imagem_url],
          proprietario_id: prop.id,
          proprietario_nome: prop.nome,
          proprietario_telefone: prop.telefone,
          proprietario_email: prop.email,
          imobiliaria: targetImobiliariaNome,
          imobiliaria_id: targetImobiliariaId,
          criado_em: imo.criado_em,
        };
      });

      const insertedImoList: any[] = [];
      const batchSize = 25;
      for (let i = 0; i < dbImoveis.length; i += batchSize) {
        const batch = dbImoveis.slice(i, i + batchSize);
        const { data: imoData, error: errImo } = await supabase
          .from('imoveis')
          .insert(batch)
          .select('id, codigo, titulo, tipo, finalidade, bairro, imagem_url, fotos_urls');
        if (errImo) console.warn('[Seed] Aviso insert imoveis batch:', errImo.message);
        if (imoData) insertedImoList.push(...imoData);
      }

      const imoList = insertedImoList.length > 0 ? insertedImoList : dbImoveis;

      // 5.3 Inserir Clientes (com orcamento_min/max, preferencias estruturadas, etapa_crm e imovel_interesse)
      const dbClientes = seedData.clientes.map((c, idx) => {
        const matchingImo = imoList[idx % imoList.length];
        return {
          id: crypto.randomUUID(),
          nome: c.nome,
          telefone: c.telefone,
          email: c.email,
          tipo_cliente: c.tipo_cliente || 'comprador_inquilino',
          orcamento_min: c.orcamento_min,
          orcamento_max: c.orcamento_max,
          preferencia_tipo: c.preferencia_tipo || 'todos',
          preferencia_quartos: c.preferencia_quartos ?? 0,
          preferencia_finalidade: c.preferencia_finalidade || 'ambos',
          perfil_interesse: c.perfil_interesse || 'Imóvel em Varginha',
          faixa_orcamento: c.faixa_orcamento || 'Sob Consulta',
          origem_lead: c.origem_lead || 'site',
          status: c.status || 'ativo',
          etapa_crm: c.etapa_crm || 'novos_leads',
          imovel_interesse_id: matchingImo?.id,
          imovel_interesse_titulo: matchingImo?.titulo || c.imovel_interesse_titulo,
          imovel_interesse_foto: matchingImo?.imagem_url || c.imovel_interesse_foto,
          corretor_responsavel_nome: c.corretor_responsavel_nome || adminUserNome,
          corretor_responsavel_id: c.corretor_responsavel_id || adminUserId,
          prioridade: c.prioridade || 'media',
          tempo_parada_texto: c.tempo_parada_texto || 'Hoje',
          observacoes: c.observacoes,
          imobiliaria: targetImobiliariaNome,
          imobiliaria_id: targetImobiliariaId,
          criado_em: c.criado_em,
        };
      });

      const insertedCliList: any[] = [];
      for (let i = 0; i < dbClientes.length; i += batchSize) {
        const batch = dbClientes.slice(i, i + batchSize);
        const { data: cliData, error: errCli } = await supabase
          .from('clientes')
          .insert(batch)
          .select('id, nome, telefone, email, etapa_crm');
        if (errCli) console.warn('[Seed] Aviso insert clientes batch:', errCli.message);
        if (cliData) insertedCliList.push(...cliData);
      }

      const cliList = insertedCliList.length > 0 ? insertedCliList : dbClientes;

      // 5.4 Inserir Visitas (com imovel_id, imoveis_ids múltiplos, cliente_id e sem campos gravar_logs)
      if (imoList.length > 0 && cliList.length > 0) {
        const dbVisitas = seedData.visitas.map((v, idx) => {
          const primaryImo = imoList[idx % imoList.length];
          const cli = cliList[idx % cliList.length];
          const qtdMulti = (idx % 3 === 0) ? 3 : (idx % 2 === 0 ? 2 : 1);
          const multiIds: string[] = [];
          for (let m = 0; m < qtdMulti; m++) {
            multiIds.push(imoList[(idx + m) % imoList.length].id);
          }

          return {
            id: crypto.randomUUID(),
            imovel_id: primaryImo.id,
            cliente_id: cli.id,
            imoveis_ids: multiIds,
            corretor_nome: v.corretor_nome || adminUserNome,
            corretor_telefone: v.corretor_telefone || '35999999999',
            data_hora_visita: v.data_hora_visita,
            lembrete_agendado_para: v.lembrete_agendado_para,
            pos_visita_agendado_para: v.pos_visita_agendado_para,
            status: v.status,
            notificar_confirmacao: v.notificar_confirmacao ?? true,
            notificar_lembrete: v.notificar_lembrete ?? true,
            notificar_pos_visita: v.notificar_pos_visita ?? true,
            whatsapp_confirmacao_cliente: v.whatsapp_confirmacao_cliente,
            whatsapp_confirmacao_proprietario: v.whatsapp_confirmacao_proprietario,
            whatsapp_lembrete_cliente: v.whatsapp_lembrete_cliente,
            whatsapp_lembrete_proprietario: v.whatsapp_lembrete_proprietario,
            whatsapp_pos_visita_cliente: v.whatsapp_pos_visita_cliente,
            feedback_cliente: v.feedback_cliente,
            feedback_proprietario: v.feedback_proprietario,
            observacoes: v.observacoes,
            imobiliaria: targetImobiliariaNome,
            imobiliaria_id: targetImobiliariaId,
            created_by_user_id: adminUserId,
            created_by_user_nome: adminUserNome,
            criado_em: v.criado_em,
          };
        });

        for (let b = 0; b < dbVisitas.length; b += 20) {
          const batch = dbVisitas.slice(b, b + 20);
          const { error: errVis } = await supabase.from('visitas').insert(batch);
          if (errVis) console.warn('[Seed] Aviso insert visitas batch:', errVis.message);
        }
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
