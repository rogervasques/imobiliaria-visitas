import { NextResponse } from 'next/server';
import { getSessionUser, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  try {
    // Valida no banco de dados se o usuário ainda existe e busca dados atualizados (cargo, nome, imobiliária, etc.)
    const user = await getSessionUser(true);

    if (!user) {
      const res = NextResponse.json({ authenticated: false, user: null }, { status: 401 });
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }

    const { token, maxAge } = await createSessionToken(user, true);
    const res = NextResponse.json({ authenticated: true, user });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return res;
  } catch (err) {
    console.error('Erro ao verificar sessão do usuário:', err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}

