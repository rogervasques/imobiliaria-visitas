import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Sessão encerrada com sucesso.',
    });

    // Remove o cookie de sessão definindo maxAge como 0
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (err) {
    console.error('Erro ao realizar logout:', err);
    return NextResponse.json(
      { success: false, error: 'Erro ao deslogar.' },
      { status: 500 }
    );
  }
}
