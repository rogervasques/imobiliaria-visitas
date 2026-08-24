import { NextRequest, NextResponse } from 'next/server';
import { createInvite, getAllInvites, getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    if (sessionUser && sessionUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores podem visualizar os convites gerados.' },
        { status: 403 }
      );
    }

    const invites = await getAllInvites();
    return NextResponse.json({ success: true, invites });
  } catch (err) {
    console.error('Erro ao listar convites:', err);
    return NextResponse.json({ success: false, error: 'Erro ao buscar convites.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores podem gerar novos convites de corretor.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { imobiliaria, role } = body;

    const targetRole = role === 'gestor' ? 'gestor' : 'corretor';
    const newInvite = await createInvite(
      imobiliaria || sessionUser.imobiliaria || 'EasyMob Imóveis',
      targetRole
    );

    // Monta o link completo do convite
    const origin = req.nextUrl.origin;
    const inviteUrl = `${origin}/cadastrar?token=${newInvite.token}`;

    return NextResponse.json({
      success: true,
      invite: newInvite,
      inviteUrl,
      message: `Convite de ${targetRole === 'gestor' ? 'gestor' : 'corretor'} gerado com sucesso (validade: 24h)!`,
    });
  } catch (err) {
    console.error('Erro ao criar convite:', err);
    return NextResponse.json({ success: false, error: 'Erro ao gerar convite.' }, { status: 500 });
  }
}
