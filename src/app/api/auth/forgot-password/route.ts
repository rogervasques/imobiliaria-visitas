import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Informe um e-mail válido.' },
        { status: 400 }
      );
    }

    const resetData = await createPasswordResetToken(email.trim());

    if (!resetData) {
      return NextResponse.json(
        { success: false, error: 'Nenhum usuário cadastrado foi encontrado com este e-mail.' },
        { status: 404 }
      );
    }

    const { token, user } = resetData;

    // Constrói a URL base
    const origin = req.headers.get('origin') || req.nextUrl.origin || 'http://localhost:3000';
    const resetUrl = `${origin}/redefinir-senha?token=${encodeURIComponent(token)}`;

    // Dispara via WhatsApp se o usuário tiver telefone
    let whatsappSent = false;
    let whatsappError: string | undefined;

    if (user.telefone) {
      try {
        const { data: config } = await supabase
          .from('configuracoes_whatsapp')
          .select('*')
          .single();

        const mensagem = `🔐 *EasyMob - Recuperação de Senha*\n\nOlá, *${user.nome}*!\n\nRecebemos uma solicitação para redefinir sua senha de acesso ao EasyMob.\n\nClique no link seguro abaixo para criar sua nova senha (válido por 1 hora):\n🔗 ${resetUrl}\n\n_Se você não solicitou a redefinição, apenas ignore este aviso._`;

        const waResult = await sendWhatsAppMessage({
          toPhone: user.telefone,
          message: mensagem,
          instanceName: user.instance_name || 'easymob',
          config: config || undefined,
        });

        whatsappSent = waResult.success;
        if (!waResult.success) {
          whatsappError = waResult.error;
        }
      } catch (waErr) {
        console.warn('[Forgot Password] Erro ao disparar WhatsApp:', waErr);
        whatsappError = 'Falha no envio via WhatsApp';
      }
    }

    // Mascara o telefone para exibição segura (ex: (11) *****-9999)
    let maskedPhone: string | undefined;
    if (user.telefone) {
      const clean = user.telefone.replace(/\D/g, '');
      if (clean.length >= 8) {
        maskedPhone = `(${clean.slice(0, 2)}) *****-${clean.slice(-4)}`;
      } else {
        maskedPhone = user.telefone;
      }
    }

    return NextResponse.json({
      success: true,
      message: user.telefone
        ? `Link de recuperação enviado com sucesso via WhatsApp para ${maskedPhone || user.telefone}.`
        : 'Token gerado com sucesso. Cadastre um telefone no seu perfil para receber alertas automáticos.',
      token,
      resetUrl,
      whatsappSent,
      whatsappError,
      maskedPhone,
    });
  } catch (err) {
    console.error('Erro na recuperação de senha:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar recuperação de senha.' },
      { status: 500 }
    );
  }
}
