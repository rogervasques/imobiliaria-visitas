'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Sparkles, MessageSquare } from 'lucide-react';

function RecuperarSenhaForm() {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setIsSuccess(true);
          setFeedbackMessage(data.message);
          setMaskedPhone(data.maskedPhone || null);
        } else {
          setErrorMessage(data.error || 'Não foi possível encontrar uma conta com este e-mail.');
        }
      } catch {
        setErrorMessage('Erro de conexão ao solicitar recuperação. Tente novamente.');
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/60 relative overflow-hidden select-none">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Card Principal */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white/10 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/10 dark:border-slate-800 shadow-2xl space-y-6">
          {/* Logo e Título */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-2xl shadow-xl shadow-emerald-500/30 mb-2">
              EM
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Recuperar <span className="text-emerald-400">Senha</span>
            </h1>
            <p className="text-xs font-medium text-slate-300">
              Informe seu e-mail para receber o link seguro de redefinição via WhatsApp
            </p>
          </div>

          {/* Feedback de Erro */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sucesso */}
          {isSuccess ? (
            <div className="space-y-4 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-white">
                  Instruções enviadas via WhatsApp!
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {feedbackMessage}
                </p>
                {maskedPhone && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-mono mt-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp: {maskedPhone}</span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o Login
                </Link>
              </div>
            </div>
          ) : (
            /* Formulário */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  E-mail cadastrado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@imobiliaria.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verificando e enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Link de Recuperação</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar para a tela de login
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Rodapé */}
        <div className="text-center space-y-1 text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>EasyMob © {new Date().getFullYear()} — Recuperação Segura</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RecuperarSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      }
    >
      <RecuperarSenhaForm />
    </Suspense>
  );
}
