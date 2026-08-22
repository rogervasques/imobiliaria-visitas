import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordWithToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Token de recuperação não fornecido.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    const result = await resetPasswordWithToken(token, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Falha ao redefinir a senha.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode fazer login com sua nova credencial.',
    });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao redefinir senha.' },
      { status: 500 }
    );
  }
}
