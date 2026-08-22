import { NextResponse } from 'next/server';
import { upsertAdminSeedUser } from '@/lib/auth';

export async function GET() {
  try {
    const result = await upsertAdminSeedUser();
    if (result.success && result.user) {
      return NextResponse.json({
        success: true,
        message: 'Administrador inicial Roger Vasques Berchembrock sincronizado com sucesso com a senha @Asenha12.',
        user: {
          id: result.user.id,
          nome: result.user.nome,
          email: result.user.email,
          role: result.user.role,
          imobiliaria: result.user.imobiliaria,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || 'Falha ao executar seed.' },
      { status: 500 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar seed';
    console.error('[Auth Seed Route] Erro:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
