import { NextRequest, NextResponse } from 'next/server';
import { createInvite, deleteInvite, getAllInvites, getAllUsers, getSessionUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || (sessionUser.role !== 'admin' && sessionUser.role !== 'gestor' && (sessionUser.role as string) !== 'gerente')) {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores e gerentes podem visualizar convites.' },
        { status: 403 }
      );
    }

    const allInvites = await getAllInvites();
    const filteredInvites =
      sessionUser.role === 'admin'
        ? allInvites
        : allInvites.filter(
            (inv) => inv.imobiliaria?.toLowerCase() === sessionUser.imobiliaria?.toLowerCase()
          );

    return NextResponse.json({ success: true, invites: filteredInvites });
  } catch (err) {
    console.error('Erro ao listar convites:', err);
    return NextResponse.json({ success: false, error: 'Erro ao buscar convites.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || (sessionUser.role !== 'admin' && sessionUser.role !== 'gestor' && (sessionUser.role as string) !== 'gerente')) {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores e gerentes podem gerar novos convites de equipe.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { role } = body;

    // Se for gerente, vincula obrigatoriamente à imobiliária do gerente
    const targetImobiliaria =
      sessionUser.role === 'admin' && body.imobiliaria
        ? body.imobiliaria
        : sessionUser.imobiliaria || 'EasyMob Imóveis';

    // 1. Checa limite de licenças da imobiliária
    let limiteLicencas = 10;
    try {
      const { data: imoData } = await supabase
        .from('imobiliarias')
        .select('limite_usuarios')
        .ilike('nome', targetImobiliaria)
        .maybeSingle();

      if (imoData && typeof imoData.limite_usuarios === 'number' && imoData.limite_usuarios > 0) {
        limiteLicencas = imoData.limite_usuarios;
      }
    } catch {
      // ignore
    }

    const allUsers = await getAllUsers();
    const usersInTenant = allUsers.filter(
      (u) =>
        u.imobiliaria?.toLowerCase() === targetImobiliaria.toLowerCase() &&
        u.ativo !== false
    );

    if (usersInTenant.length >= limiteLicencas) {
      return NextResponse.json(
        {
          success: false,
          error: `Limite de licenças atingido (${usersInTenant.length}/${limiteLicencas} contratados). Contate o Administrador para contratar novas licenças.`,
        },
        { status: 400 }
      );
    }

    const targetRole = role === 'gestor' ? 'gestor' : 'corretor';
    const newInvite = await createInvite(targetImobiliaria, targetRole);

    // Monta o link completo do convite
    const origin = req.nextUrl.origin;
    const inviteUrl = `${origin}/cadastrar?token=${newInvite.token}`;

    return NextResponse.json({
      success: true,
      invite: newInvite,
      inviteUrl,
      message: `Convite de ${targetRole === 'gestor' ? 'gerente' : 'corretor'} gerado com sucesso (validade: 24h)!`,
    });
  } catch (err) {
    console.error('Erro ao criar convite:', err);
    return NextResponse.json({ success: false, error: 'Erro ao gerar convite.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    if (
      !sessionUser ||
      (sessionUser.role !== 'admin' &&
        sessionUser.role !== 'gestor' &&
        (sessionUser.role as string) !== 'gerente')
    ) {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores e gerentes podem apagar convites.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const id = body.id || req.nextUrl.searchParams.get('id');
    const token = body.token || req.nextUrl.searchParams.get('token');
    const action = body.action || req.nextUrl.searchParams.get('action');

    // Opção de limpeza em lote: apagar todos os convites expirados ou utilizados
    if (action === 'clean_expired_or_used') {
      const allInvites = await getAllInvites();
      const now = Date.now();
      const toDelete = allInvites.filter((inv) => {
        const isExp = new Date(inv.expires_at).getTime() < now;
        const belongs =
          sessionUser.role === 'admin' ||
          inv.imobiliaria?.toLowerCase() === sessionUser.imobiliaria?.toLowerCase();
        return belongs && (isExp || inv.used);
      });

      for (const inv of toDelete) {
        await deleteInvite(inv.id);
      }

      return NextResponse.json({
        success: true,
        message: `${toDelete.length} convite(s) expirado(s) ou utilizado(s) removido(s) com sucesso.`,
        deletedCount: toDelete.length,
      });
    }

    const targetId = id || token;
    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'ID ou token do convite é obrigatório para exclusão.' },
        { status: 400 }
      );
    }

    await deleteInvite(targetId);

    return NextResponse.json({
      success: true,
      message: 'Convite removido com sucesso!',
      id: targetId,
    });
  } catch (err) {
    console.error('Erro ao excluir convite:', err);
    return NextResponse.json({ success: false, error: 'Erro ao excluir convite.' }, { status: 500 });
  }
}
