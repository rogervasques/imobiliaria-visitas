import { NextRequest, NextResponse } from 'next/server';
import { deleteUser, updateUser, getSessionUser } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado. Apenas administradores podem editar usuários.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do usuário não fornecido.' }, { status: 400 });
    }

    const body = await req.json();
    const { nome, email, telefone, imobiliaria, role, password, nova_senha } = body;

    const newPass = password || nova_senha;

    const updatedUser = await updateUser(id, {
      nome: typeof nome === 'string' ? nome.trim() : undefined,
      email: typeof email === 'string' ? email.trim() : undefined,
      telefone: typeof telefone === 'string' ? telefone.trim() : undefined,
      imobiliaria: typeof imobiliaria === 'string' ? imobiliaria.trim() : undefined,
      role: role === 'admin' || role === 'corretor' ? role : undefined,
      password: typeof newPass === 'string' && newPass.trim().length > 0 ? newPass.trim() : undefined,
    });

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Usuário atualizado com sucesso.',
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

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado. Apenas administradores podem excluir usuários.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do usuário não fornecido.' }, { status: 400 });
    }

    // Impede o administrador de excluir sua própria conta
    if (sessionUser.id === id) {
      return NextResponse.json(
        { success: false, error: 'Você não pode excluir sua própria conta de administrador ativa.' },
        { status: 400 }
      );
    }

    await deleteUser(id);
    return NextResponse.json({ success: true, message: 'Usuário excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    return NextResponse.json({ success: false, error: 'Erro ao excluir usuário.' }, { status: 500 });
  }
}

