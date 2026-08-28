import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionUser,
  findUserByEmailForAuth,
  verifyPassword,
  updateUser,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'Sessão expirada ou não autenticada.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { nome, telefone, creci, senha_atual, nova_senha, confirmar_senha } = body;

    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return NextResponse.json(
        { success: false, error: 'O nome completo é obrigatório.' },
        { status: 400 }
      );
    }

    // Se o usuário solicitou alteração de senha
    let newPasswordToSet: string | undefined = undefined;

    if (nova_senha && typeof nova_senha === 'string' && nova_senha.trim().length > 0) {
      if (!senha_atual) {
        return NextResponse.json(
          { success: false, error: 'Informe a senha atual para confirmar a alteração.' },
          { status: 400 }
        );
      }

      if (nova_senha.length < 6) {
        return NextResponse.json(
          { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' },
          { status: 400 }
        );
      }

      if (nova_senha !== confirmar_senha) {
        return NextResponse.json(
          { success: false, error: 'A confirmação de senha não confere com a nova senha informada.' },
          { status: 400 }
        );
      }

      // Valida senha atual no banco
      const userAuthData = await findUserByEmailForAuth(sessionUser.email);
      if (userAuthData && userAuthData.senha_hash) {
        const isCurrentValid = await verifyPassword(senha_atual, userAuthData.senha_hash);
        if (!isCurrentValid) {
          return NextResponse.json(
            { success: false, error: 'A senha atual informada está incorreta.' },
            { status: 400 }
          );
        }
      }

      newPasswordToSet = nova_senha.trim();
    }

    // Atualiza os dados do usuário
    const updatedUser = await updateUser(sessionUser.id, {
      nome: nome.trim(),
      telefone: typeof telefone === 'string' ? telefone.trim() : undefined,
      creci: typeof creci === 'string' ? creci.trim() : undefined,
      password: newPasswordToSet,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Não foi possível atualizar o perfil no momento.' },
        { status: 500 }
      );
    }

    // Atualiza o token de sessão do usuário
    const updatedSession = {
      ...sessionUser,
      name: updatedUser.nome,
      telefone: updatedUser.telefone,
      creci: updatedUser.creci,
    };

    const { token, maxAge } = await createSessionToken(updatedSession, true);

    const response = NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      user: updatedSession,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (err) {
    console.error('Erro na atualização de perfil:', err);
    return NextResponse.json(
      { success: false, error: 'Ocorreu um erro interno ao salvar o perfil.' },
      { status: 500 }
    );
  }
}
