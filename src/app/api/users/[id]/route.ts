import { NextRequest, NextResponse } from 'next/server';
import { deleteUser, updateUser, getSessionUser, getUserById } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || (sessionUser.role !== 'admin' && sessionUser.role !== 'gestor' && (sessionUser.role as string) !== 'gerente')) {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado. Apenas administradores e gerentes podem gerenciar membros.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do usuário não fornecido.' }, { status: 400 });
    }

    // Se for gerente, verifica se o usuário alvo pertence à mesma imobiliária
    if (sessionUser.role !== 'admin') {
      const targetUser = await getUserById(id);
      if (targetUser && targetUser.imobiliaria?.toLowerCase() !== sessionUser.imobiliaria?.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: 'Você só pode gerenciar membros da sua própria imobiliária.' },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { nome, email, telefone, creci, imobiliaria, role, password, nova_senha, ativo } = body;

    const newPass = password || nova_senha;

    let targetRole: 'admin' | 'gestor' | 'corretor' | undefined = undefined;
    if (role === 'admin' && sessionUser.role === 'admin') {
      targetRole = 'admin';
    } else if (role === 'gestor') {
      targetRole = 'gestor';
    } else if (role === 'corretor') {
      targetRole = 'corretor';
    }

    const updatedUser = await updateUser(id, {
      nome: typeof nome === 'string' ? nome.trim() : undefined,
      email: typeof email === 'string' ? email.trim() : undefined,
      telefone: typeof telefone === 'string' ? telefone.trim() : undefined,
      creci: typeof creci === 'string' ? creci.trim() : undefined,
      imobiliaria: sessionUser.role === 'admin' && typeof imobiliaria === 'string' ? imobiliaria.trim() : undefined,
      role: targetRole,
      ativo: typeof ativo === 'boolean' ? ativo : undefined,
      password: typeof newPass === 'string' && newPass.trim().length > 0 ? newPass.trim() : undefined,
    });

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Dados do membro atualizados com sucesso.',
    });
  } catch (err) {
    console.error('Erro ao editar usuário:', err);
    return NextResponse.json({ success: false, error: 'Erro ao editar dados do usuário.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || (sessionUser.role !== 'admin' && sessionUser.role !== 'gestor' && (sessionUser.role as string) !== 'gerente')) {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado. Apenas administradores e gerentes podem remover membros.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do usuário não fornecido.' }, { status: 400 });
    }

    // Impede o usuário de excluir sua própria conta
    if (sessionUser.id === id) {
      return NextResponse.json(
        { success: false, error: 'Você não pode excluir sua própria conta ativa.' },
        { status: 400 }
      );
    }

    if (sessionUser.role !== 'admin') {
      const targetUser = await getUserById(id);
      if (targetUser && targetUser.imobiliaria?.toLowerCase() !== sessionUser.imobiliaria?.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: 'Você só pode excluir membros da sua própria imobiliária.' },
          { status: 403 }
        );
      }
    }

    await deleteUser(id);
    return NextResponse.json({ success: true, message: 'Usuário removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    return NextResponse.json({ success: false, error: 'Erro ao excluir usuário.' }, { status: 500 });
  }
}

