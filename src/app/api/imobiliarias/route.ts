import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import { DEFAULT_IMOBILIARIAS } from '@/context/TenantContext';

export async function GET() {
  try {
    const { data: dbTenants, error } = await supabase
      .from('imobiliarias')
      .select('*')
      .order('nome', { ascending: true });

    if (!error && dbTenants && dbTenants.length > 0) {
      return NextResponse.json({ success: true, imobiliarias: dbTenants });
    }

    return NextResponse.json({ success: true, imobiliarias: DEFAULT_IMOBILIARIAS });
  } catch (err) {
    console.error('Erro ao listar imobiliárias:', err);
    return NextResponse.json({ success: true, imobiliarias: DEFAULT_IMOBILIARIAS });
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
    const { nome, telefone, email, endereco, logo_url } = body;

    if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'O nome da imobiliária é obrigatório.' },
        { status: 400 }
      );
    }

    const trimmedNome = nome.trim();
    const slug = trimmedNome.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const { data, error } = await supabase
      .from('imobiliarias')
      .insert({
        nome: trimmedNome,
        slug,
        telefone: telefone ? telefone.trim() : null,
        email: email ? email.trim() : null,
        endereco: endereco ? endereco.trim() : null,
        logo_url: logo_url || null,
      })
      .select()
      .single();

    if (error) {
      console.warn('Erro ao gravar imobiliária no Supabase:', error);
      return NextResponse.json({
        success: true,
        imobiliaria: {
          id: `tenant-${Date.now()}`,
          nome: trimmedNome,
          slug,
          logo_url,
          criado_em: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ success: true, imobiliaria: data });
  } catch (err) {
    console.error('Erro ao criar imobiliária:', err);
    return NextResponse.json({ success: false, error: 'Erro interno ao cadastrar imobiliária.' }, { status: 500 });
  }
}
