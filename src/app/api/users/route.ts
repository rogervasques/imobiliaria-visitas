import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser, getSessionUser, hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    // Apenas Admin pode listar a base de usuários
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado. Apenas administradores podem acessar a lista de usuários.' },
        { status: 403 }
      );
    }

    const users = await getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    return NextResponse.json({ success: false, error: 'Erro ao buscar usuários.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores podem criar usuários diretamente.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { nome, email, telefone, senha, role = 'corretor', imobiliaria } = body;

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { success: false, error: 'Nome, e-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const senhaHash = await hashPassword(senha);
    const newUser = await createUser({
      nome,
      email,
      telefone,
      senha_hash: senhaHash,
      role: role === 'admin' ? 'admin' : 'corretor',
      imobiliaria: imobiliaria || 'EasyMob Imóveis',
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    return NextResponse.json({ success: false, error: 'Erro ao cadastrar usuário.' }, { status: 500 });
  }
}
