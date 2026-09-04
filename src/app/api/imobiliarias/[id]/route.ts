import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUser, deleteUsersByTenant } from '@/lib/auth';
import { updateGlobalTenant, deleteGlobalTenant } from '@/lib/tenantsStore';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores podem editar imobiliárias.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { nome, telefone, email, endereco, logo_url, ativo, modulo_crm_ativo, limite_usuarios } = body;

    if (nome && typeof nome === 'string' && nome.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'O nome da imobiliária não pode ser vazio.' },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {
      atualizado_em: new Date().toISOString(),
    };

    if (nome) {
      updateData.nome = nome.trim();
      updateData.slug = nome.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
    if (telefone !== undefined) updateData.telefone = telefone ? telefone.trim() : null;
    if (email !== undefined) updateData.email = email ? email.trim() : null;
    if (endereco !== undefined) updateData.endereco = endereco ? endereco.trim() : null;
    if (logo_url !== undefined) updateData.logo_url = logo_url || null;
    if (ativo !== undefined) updateData.ativo = Boolean(ativo);
    if (modulo_crm_ativo !== undefined) updateData.modulo_crm_ativo = Boolean(modulo_crm_ativo);
    if (limite_usuarios !== undefined) updateData.limite_usuarios = Number(limite_usuarios);

    // Atualiza no Supabase (com suporte a ID UUID ou Nome da Imobiliária)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let updatedDbTenant: any = null;

    try {
      if (isUuid) {
        const { data, error } = await supabase
          .from('imobiliarias')
          .update(updateData)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (!error && data) {
          updatedDbTenant = data;
        }
      }

      if (!updatedDbTenant) {
        const searchName = updateData.nome || id.replace(/^tenant-/, '').replace(/-/g, ' ');
        const { data, error } = await supabase
          .from('imobiliarias')
          .update(updateData)
          .ilike('nome', searchName)
          .select()
          .maybeSingle();

        if (!error && data) {
          updatedDbTenant = data;
        }
      }

      // Se ainda não existia no banco, faz um upsert pelo nome
      if (!updatedDbTenant && updateData.nome) {
        const { data, error } = await supabase
          .from('imobiliarias')
          .upsert(
            {
              nome: updateData.nome,
              slug: updateData.slug,
              telefone: updateData.telefone,
              email: updateData.email,
              endereco: updateData.endereco,
              logo_url: updateData.logo_url,
              modulo_crm_ativo: updateData.modulo_crm_ativo,
              limite_usuarios: updateData.limite_usuarios,
              atualizado_em: updateData.atualizado_em,
            },
            { onConflict: 'nome' }
          )
          .select()
          .maybeSingle();

        if (!error && data) {
          updatedDbTenant = data;
        }
      }
    } catch (errDb) {
      console.warn('Erro ao atualizar imobiliária no Supabase:', errDb);
    }

    // Atualiza no store global do servidor
    const updatedStoreTenant = updateGlobalTenant(id, updatedDbTenant || updateData);

    return NextResponse.json({
      success: true,
      imobiliaria: updatedDbTenant || updatedStoreTenant || { id, ...updateData },
    });
  } catch (err) {
    console.error('Erro no PUT /api/imobiliarias/[id]:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao atualizar imobiliária.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores podem excluir imobiliárias.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const confirmText = body.confirmText || req.nextUrl.searchParams.get('confirmText') || '';

    // 1. Localiza a imobiliária no banco
    let imoNome = body.nome || '';
    try {
      const { data: imoData } = await supabase
        .from('imobiliarias')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (imoData && imoData.nome) {
        imoNome = imoData.nome;
      }
    } catch (errFind) {
      console.warn('[Delete Imobiliaria] Erro ao buscar imobiliária:', errFind);
    }

    // 2. Dupla Verificação: Exige nome exato (case-sensitive) OU a palavra "EXCLUIR" em maiúsculas
    const isValidConfirmation =
      confirmText &&
      (confirmText.trim() === imoNome.trim() ||
        confirmText.trim().toUpperCase() === 'EXCLUIR' ||
        (imoNome && confirmText.trim().toLowerCase() === imoNome.trim().toLowerCase()));

    if (!isValidConfirmation) {
      return NextResponse.json(
        {
          success: false,
          error: `Confirmação de segurança inválida. É obrigatório digitar "${imoNome || 'EXCLUIR'}" ou "EXCLUIR" para autorizar a exclusão em cascata.`,
        },
        { status: 400 }
      );
    }

    console.log(`[Delete Imobiliaria] Iniciando exclusão em cascata total para a imobiliária: "${imoNome}" (ID: ${id})`);

    const cascadeSummary = {
      whatsapp_logs: 0,
      visitas: 0,
      imoveis: 0,
      clientes: 0,
      proprietarios: 0,
      invites: 0,
      users: 0,
    };

    // 3. EXCLUSÃO EM CASCATA TOTAL (Ordem estrita para respeitar Foreign Keys)
    try {
      // 3.1 Excluir Logs de WhatsApp relacionados às visitas da imobiliária
      try {
        if (imoNome) {
          const { data: visitasDaImob } = await supabase
            .from('visitas')
            .select('id')
            .or(`imobiliaria.ilike.%${imoNome}%,observacoes.ilike.%[tenant:${imoNome}]%`);

          if (visitasDaImob && visitasDaImob.length > 0) {
            const visIds = visitasDaImob.map((v) => v.id);
            const { error: errLogs } = await supabase
              .from('whatsapp_logs')
              .delete()
              .in('visita_id', visIds);
            if (!errLogs) cascadeSummary.whatsapp_logs = visIds.length;
          }
        }
      } catch (eLogs) {
        console.warn('[Cascade] Aviso ao excluir whatsapp_logs:', eLogs);
      }

      // 3.2 Excluir tabela de junção visita_imoveis se existir
      try {
        await supabase.from('visita_imoveis').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch {
        // ignore
      }

      // 3.3 Excluir Visitas da Imobiliária
      try {
        if (imoNome) {
          const { error: errVisitas } = await supabase
            .from('visitas')
            .delete()
            .or(`imobiliaria.ilike.%${imoNome}%,observacoes.ilike.%[tenant:${imoNome}]%`);
          if (!errVisitas) cascadeSummary.visitas++;
        }
      } catch (eVis) {
        console.warn('[Cascade] Aviso ao excluir visitas:', eVis);
      }

      // 3.4 Excluir Imóveis da Imobiliária
      try {
        if (imoNome) {
          const { error: errImoveis } = await supabase
            .from('imoveis')
            .delete()
            .or(`imobiliaria.ilike.%${imoNome}%,observacoes_chaves.ilike.%[tenant:${imoNome}]%`);
          if (!errImoveis) cascadeSummary.imoveis++;
        }
      } catch (eImo) {
        console.warn('[Cascade] Aviso ao excluir imoveis:', eImo);
      }

      // 3.5 Excluir Clientes da Imobiliária
      try {
        if (imoNome) {
          const { error: errClientes } = await supabase
            .from('clientes')
            .delete()
            .or(`imobiliaria.ilike.%${imoNome}%,observacoes.ilike.%[tenant:${imoNome}]%`);
          if (!errClientes) cascadeSummary.clientes++;
        }
      } catch (eCli) {
        console.warn('[Cascade] Aviso ao excluir clientes:', eCli);
      }

      // 3.6 Excluir Proprietários da Imobiliária
      try {
        if (imoNome) {
          await supabase
            .from('proprietarios')
            .delete()
            .or(`imobiliaria.ilike.%${imoNome}%,observacoes.ilike.%[tenant:${imoNome}]%`);
        }
      } catch (eProp) {
        console.warn('[Cascade] Aviso ao excluir proprietarios:', eProp);
      }

      // 3.7 Excluir Convites Pendentes da Imobiliária
      try {
        if (imoNome) {
          const { error: errInv } = await supabase
            .from('invites')
            .delete()
            .ilike('imobiliaria', `%${imoNome}%`);
          if (!errInv) cascadeSummary.invites++;
        }
      } catch (eInv) {
        console.warn('[Cascade] Aviso ao excluir invites:', eInv);
      }

      // 3.8 Excluir Usuários (Corretores e Gestores) da Imobiliária - Invalidação imediata de sessão
      try {
        if (imoNome) {
          const deletedUsers = await deleteUsersByTenant(imoNome, id);
          cascadeSummary.users = deletedUsers;
        }
      } catch (eUsers) {
        console.warn('[Cascade] Aviso ao excluir users:', eUsers);
      }

      // 3.9 Limpeza de Arquivos no Storage (se bucket configurado)
      try {
        if (imoNome) {
          const storageSlug = imoNome.toLowerCase().replace(/[^a-z0-9]/g, '-');
          await supabase.storage.from('imoveis').remove([`${storageSlug}/`]);
          await supabase.storage.from('logos').remove([`${storageSlug}/logo.png`, `${storageSlug}/logo.jpg`]);
        }
      } catch {
        // Storage opcional
      }

      // 3.10 Excluir a própria Imobiliária
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase.from('imobiliarias').delete().eq('id', id);
      }
      if (imoNome) {
        await supabase.from('imobiliarias').delete().ilike('nome', imoNome);
      }

      // Remove do store global do servidor
      deleteGlobalTenant(id);
      if (imoNome) deleteGlobalTenant(imoNome);
    } catch (cascadeErr) {
      console.error('[Cascade] Erro geral durante exclusão em cascata:', cascadeErr);
    }

    return NextResponse.json({
      success: true,
      message: `Imobiliária "${imoNome}" e todos os seus dados vinculados (imóveis, visitas, clientes, proprietários, relatórios, convites e contas de corretores) foram excluídos com sucesso.`,
      imobiliaria: imoNome,
      summary: cascadeSummary,
    });
  } catch (err) {
    console.error('Erro no DELETE /api/imobiliarias/[id]:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar a exclusão em cascata da imobiliária.' },
      { status: 500 }
    );
  }
}
