import { NextRequest, NextResponse } from 'next/server';
import { validateInviteToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token do convite não fornecido.' }, { status: 400 });
    }

    const validation = await validateInviteToken(token);

    if (!validation.valid || !validation.invite) {
      return NextResponse.json(
        { valid: false, error: validation.error || 'Convite inválido ou expirado.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      invite: {
        id: validation.invite.id,
        token: validation.invite.token,
        imobiliaria: validation.invite.imobiliaria,
        expires_at: validation.invite.expires_at,
      },
    });
  } catch (err) {
    console.error('Erro ao validar token de convite:', err);
    return NextResponse.json({ valid: false, error: 'Erro ao validar convite.' }, { status: 500 });
  }
}
