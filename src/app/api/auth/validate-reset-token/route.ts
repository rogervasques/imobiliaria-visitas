import { NextRequest, NextResponse } from 'next/server';
import { validatePasswordResetToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Token de recuperação não fornecido.' },
        { status: 400 }
      );
    }

    const result = await validatePasswordResetToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error || 'Token inválido ou expirado.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: result.email,
      userId: result.userId,
    });
  } catch (err) {
    console.error('Erro ao validar token de recuperação:', err);
    return NextResponse.json(
      { valid: false, error: 'Erro ao validar token.' },
      { status: 500 }
    );
  }
}
