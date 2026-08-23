import { NextResponse } from 'next/server';
import { getSessionUser, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  try {
    // Valida no banco de dados se o usuário ainda existe e está ativo
    const user = await getSessionUser(true);

    if (!user) {
      const res = NextResponse.json({ authenticated: false, user: null }, { status: 401 });
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (err) {
    console.error('Erro ao verificar sessão do usuário:', err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
