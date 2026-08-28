import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser, getSessionUser, hashPassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || (sessionUser.role !== 'admin' && sessionUser.role !== 'gestor' && (sessionUser.role as string) !== 'gerente')) {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado. Apenas administradores e gerentes podem acessar a equipe.' },
        { status: 403 }
      );
    }

    const allUsers = await getAllUsers();
    const filteredUsers =
      sessionUser.role === 'admin'
        ? allUsers
        : allUsers.filter(
            (u) => u.imobiliaria?.toLowerCase() === sessionUser.imobiliaria?.toLowerCase()
          );

    return NextResponse.json({ success: true, users: filteredUsers });
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    return NextResponse.json({ success: false, error: 'Erro ao buscar usuários.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || (sessionUser.role !== 'admin' && sessionUser.role !== 'gestor' && (sessionUser.role as string) !== 'gerente')) {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores e gerentes podem cadastrar membros.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { nome, email, telefone, creci, senha, role = 'corretor' } = body;

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { success: false, error: 'Nome, e-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const targetImobiliaria =
      sessionUser.role === 'admin' && body.imobiliaria
        ? body.imobiliaria
        : sessionUser.imobiliaria || 'EasyMob Imóveis';

    // Checa limite de licenças
    let limiteLicencas = 10;
    try {
      const { data: imoData } = await supabase
        .from('imobiliarias')
        .select('limite_usuarios')
        .ilike('nome', targetImobiliaria)
        .maybeSingle();

      if (imoData && typeof imoData.limite_usuarios === 'number' && imoData.limite_usuarios > 0) {
        limiteLicencas = imoData.limite_usuarios;
      }
    } catch {
      // ignore
    }

    const allUsers = await getAllUsers();
    const usersInTenant = allUsers.filter(
      (u) =>
        u.imobiliaria?.toLowerCase() === targetImobiliaria.toLowerCase() &&
        u.ativo !== false
    );

    if (usersInTenant.length >= limiteLicencas) {
      return NextResponse.json(
        {
          success: false,
          error: `Limite de licenças atingido (${usersInTenant.length}/${limiteLicencas} contratados). Contate o Administrador para contratar novas licenças.`,
        },
        { status: 400 }
      );
    }

    const targetRole =
      sessionUser.role === 'admin' && role === 'admin'
        ? 'admin'
        : role === 'gestor'
        ? 'gestor'
        : 'corretor';

    const senhaHash = await hashPassword(senha);
    const newUser = await createUser({
      nome,
      email,
      telefone,
      creci,
      senha_hash: senhaHash,
      role: targetRole,
      imobiliaria: targetImobiliaria,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    return NextResponse.json({ success: false, error: 'Erro ao cadastrar usuário.' }, { status: 500 });
  }
}
