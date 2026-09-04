import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import { getGlobalTenants, saveGlobalTenant, setGlobalTenants } from '@/lib/tenantsStore';

export async function GET() {
  try {
    // 1. Busca sempre no Supabase como fonte da verdade
    const { data: dbTenants, error } = await supabase
      .from('imobiliarias')
      .select('*')
      .order('nome', { ascending: true });

    if (!error && dbTenants && dbTenants.length > 0) {
      setGlobalTenants(dbTenants);
      return NextResponse.json({ success: true, imobiliarias: dbTenants });
    }

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
    const slug = trimmedNome.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // 1. Grava no Supabase
    let finalTenant = null;
    try {
      const { data: dbData, error: dbError } = await supabase
        .from('imobiliarias')
        .insert({
          nome: trimmedNome,
          slug,
          telefone: telefone ? telefone.trim() : null,
          email: email ? email.trim() : null,
          endereco: endereco ? endereco.trim() : null,
          logo_url: logo_url || null,
          modulo_crm_ativo: modulo_crm_ativo !== undefined ? Boolean(modulo_crm_ativo) : true,
          limite_usuarios: Number(limite_usuarios) || 10,
        })
        .select()
        .single();

      if (!dbError && dbData) {
        finalTenant = dbData;
      }
    } catch (errDb) {
      console.warn('Erro ao inserir imobiliária no Supabase:', errDb);
    }

    if (!finalTenant) {
      finalTenant = saveGlobalTenant({
        nome: trimmedNome,
        telefone: telefone ? telefone.trim() : undefined,
        email: email ? email.trim() : undefined,
        endereco: endereco ? endereco.trim() : undefined,
        logo_url: logo_url || undefined,
        modulo_crm_ativo: modulo_crm_ativo !== undefined ? Boolean(modulo_crm_ativo) : true,
        limite_usuarios: Number(limite_usuarios) || 10,
      });
    } else {
      saveGlobalTenant(finalTenant);
    }

    return NextResponse.json({ success: true, imobiliaria: finalTenant });
  } catch (err) {
    console.error('Erro ao criar imobiliária:', err);
    return NextResponse.json({ success: false, error: 'Erro interno ao cadastrar imobiliária.' }, { status: 500 });
  }
}

