import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  ensureInitialAdminUser,
  findUserByEmailForAuth,
  verifyPassword,
  updateUser,
  createSessionToken,
  SESSION_COOKIE_NAME,
  UserSession,
  INITIAL_ADMIN_EMAIL,
  INITIAL_ADMIN_PASSWORD_RAW,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, rememberMe = true } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const rawPassword = String(password);

    console.log(`[Auth Login] Tentativa de login para o e-mail: "${normalizedEmail}"`);

    // 1. Garante que o administrador inicial exista
    await ensureInitialAdminUser().catch((err) => {
      console.warn('[Auth Login] Aviso ao inicializar admin seed:', err);
    });

    // 2. Busca o usuário com sua senha_hash
    const user = await findUserByEmailForAuth(normalizedEmail);

    if (!user) {
      console.error(`[Auth Login Falha] Usuário não encontrado: "${normalizedEmail}"`);
      return NextResponse.json(
        { success: false, error: 'E-mail ou senha incorretos. Verifique suas credenciais.' },
        { status: 401 }
      );
    }

    // 3. Validação da Senha (com suporte a hash bcrypt e credencial mestre do Admin)
    let isPasswordValid = false;

    if (
      normalizedEmail === INITIAL_ADMIN_EMAIL.toLowerCase().trim() &&
      rawPassword === INITIAL_ADMIN_PASSWORD_RAW
    ) {
      isPasswordValid = true;
    } else if (user.senha_hash) {
      isPasswordValid = await verifyPassword(rawPassword, user.senha_hash);
    }

    if (!isPasswordValid) {
      console.error(`[Auth Login Falha] Senha incorreta para o e-mail: "${normalizedEmail}"`);
      return NextResponse.json(
        { success: false, error: 'E-mail ou senha incorretos. Verifique suas credenciais.' },
        { status: 401 }
      );
    }

    // 3.1 Verifica se o usuário está ativo
    if (user.ativo === false) {
      console.warn(`[Auth Login Bloqueado] Usuário inativo: "${normalizedEmail}"`);
      return NextResponse.json(
        {
          success: false,
          error: 'Sua conta de usuário está desativada. Entre em contato com a gestão da imobiliária ou administrador.',
        },
        { status: 403 }
      );
    }

    // 3.2 Registra último acesso
    const nowIso = new Date().toISOString();
    updateUser(user.id, { ultimo_acesso: nowIso }).catch(() => {});

    // 4. Monta a sessão autenticada do usuário
    const authenticatedUser: UserSession = {
      id: user.id,
      name: user.nome || 'Usuário',
      email: user.email,
      telefone: user.telefone,
      creci: user.creci,
      role: user.role || 'corretor',
      avatar: user.avatar_url,
      imobiliaria: user.imobiliaria || 'EasyMob Imóveis',
      instance_name: user.instance_name || 'easymob',
    };

    console.log(`[Auth Login Sucesso] Usuário autenticado: "${normalizedEmail}" (Perfil: ${authenticatedUser.role}, Imobiliária: ${authenticatedUser.imobiliaria}, Instância: ${authenticatedUser.instance_name})`);

    // 3. Cria token JWT seguro com validade de 30 dias (ou 1 dia se rememberMe = false)
    const { token, maxAge } = await createSessionToken(authenticatedUser, Boolean(rememberMe));

    // 4. Salva a sessão em um cookie seguro (httpOnly, SameSite=Lax)
    const response = NextResponse.json({
      success: true,
      user: authenticatedUser,
      message: 'Login realizado com sucesso!',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge, // 30 dias (2592000 segundos)
    });

    return response;
  } catch (err) {
    console.error('Erro no endpoint de login:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno no servidor de autenticação.' },
      { status: 500 }
    );
  }
}
