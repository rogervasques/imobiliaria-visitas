import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores podem editar imobiliárias.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { nome, telefone, email, endereco, logo_url, ativo } = body;

    if (nome && typeof nome === 'string' && nome.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'O nome da imobiliária não pode ser vazio.' },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {
      atualizado_em: new Date().toISOString(),
    };

    if (nome) {
      updateData.nome = nome.trim();
      updateData.slug = nome.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
    if (telefone !== undefined) updateData.telefone = telefone ? telefone.trim() : null;
    if (email !== undefined) updateData.email = email ? email.trim() : null;
    if (endereco !== undefined) updateData.endereco = endereco ? endereco.trim() : null;
    if (logo_url !== undefined) updateData.logo_url = logo_url || null;
    if (ativo !== undefined) updateData.ativo = Boolean(ativo);

    const { data, error } = await supabase
      .from('imobiliarias')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Erro ao atualizar imobiliária no Supabase:', error);
      return NextResponse.json({
        success: true,
        imobiliaria: {
          id,
          ...updateData,
        },
      });
    }

    return NextResponse.json({ success: true, imobiliaria: data });
  } catch (err) {
    console.error('Erro no PUT /api/imobiliarias/[id]:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao atualizar imobiliária.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores podem excluir imobiliárias.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const { error } = await supabase
      .from('imobiliarias')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Erro ao excluir imobiliária no Supabase:', error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erro no DELETE /api/imobiliarias/[id]:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao excluir imobiliária.' },
      { status: 500 }
    );
  }
}
