import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import { getGlobalTenants, saveGlobalTenant } from '@/lib/tenantsStore';

export async function GET() {
  try {
    const list = getGlobalTenants();
    return NextResponse.json({ success: true, imobiliarias: list });
  } catch (err) {
    console.error('Erro ao listar imobiliárias:', err);
    return NextResponse.json({ success: true, imobiliarias: getGlobalTenants() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores podem cadastrar novas imobiliárias.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { nome, telefone, email, endereco, logo_url, modulo_crm_ativo, limite_usuarios } = body;

    if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'O nome da imobiliária é obrigatório.' },
        { status: 400 }
      );
    }

    const trimmedNome = nome.trim();
    const savedTenant = saveGlobalTenant({
      nome: trimmedNome,
      telefone: telefone ? telefone.trim() : undefined,
      email: email ? email.trim() : undefined,
      endereco: endereco ? endereco.trim() : undefined,
      logo_url: logo_url || undefined,
      modulo_crm_ativo: modulo_crm_ativo !== undefined ? Boolean(modulo_crm_ativo) : true,
      limite_usuarios: Number(limite_usuarios) || 10,
    });

    try {
      await supabase
        .from('imobiliarias')
        .insert({
          id: savedTenant.id,
          nome: savedTenant.nome,
          slug: savedTenant.slug,
          telefone: savedTenant.telefone,
          email: savedTenant.email,
          endereco: savedTenant.endereco,
          logo_url: savedTenant.logo_url,
        });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, imobiliaria: savedTenant });
  } catch (err) {
    console.error('Erro ao criar imobiliária:', err);
    return NextResponse.json({ success: false, error: 'Erro interno ao cadastrar imobiliária.' }, { status: 500 });
  }
}
