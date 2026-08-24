import { NextRequest, NextResponse } from 'next/server';
import {
  validateInviteToken,
  markInviteAsUsed,
  createUser,
  getAllUsers,
  hashPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
  UserSession,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, nome, telefone, email, senha } = body;

    if (!token || !nome || !email || !senha) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos obrigatórios devem ser preenchidos.' },
        { status: 400 }
      );
    }

    // 1. Valida o convite
    const validation = await validateInviteToken(token);
    if (!validation.valid || !validation.invite) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Convite inválido ou expirado.' },
        { status: 400 }
      );
    }

    const invite = validation.invite;
    const normalizedEmail = email.trim().toLowerCase();

    // 2. Verifica se o e-mail já está cadastrado
    const allUsers = await getAllUsers();
    const emailExists = allUsers.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (emailExists) {
      return NextResponse.json(
        { success: false, error: 'Já existe um usuário cadastrado com este e-mail.' },
        { status: 400 }
      );
    }

    // 3. Hasheia a senha com bcrypt
    const senhaHash = await hashPassword(senha);

    // 4. Cria o novo usuário com a role do convite ('corretor' ou 'gestor') e a imobiliária do convite
    const userRole = (invite.role as 'admin' | 'gestor' | 'corretor') || 'corretor';
    const newUser = await createUser({
      nome: nome.trim(),
      email: normalizedEmail,
      telefone: telefone ? telefone.trim() : undefined,
      senha_hash: senhaHash,
      role: userRole,
      imobiliaria: invite.imobiliaria,
    });

    // 5. Marca o convite como utilizado
    await markInviteAsUsed(token);

    // 6. Inicia a sessão de 30 dias automaticamente
    const userSession: UserSession = {
      id: newUser.id,
      name: newUser.nome,
      email: newUser.email,
      role: newUser.role,
      imobiliaria: newUser.imobiliaria,
      instance_name: newUser.instance_name || 'easymob',
    };

    const { token: sessionJwt, maxAge } = await createSessionToken(userSession, true);

    const response = NextResponse.json({
      success: true,
      user: userSession,
      message: 'Cadastro de corretor realizado com sucesso! Bem-vindo à EasyMob.',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionJwt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge, // 30 dias
    });

    return response;
  } catch (err) {
    console.error('Erro ao aceitar convite de cadastro:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar cadastro por convite.' },
      { status: 500 }
    );
  }
}
