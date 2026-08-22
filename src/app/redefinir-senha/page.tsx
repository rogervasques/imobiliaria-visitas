'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [targetEmail, setTargetEmail] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Validação do Token no carregamento
  useEffect(() => {
    async function validate() {
      if (!token) {
        setTokenValid(false);
        setTokenError('Link de recuperação inválido ou incompleto.');
        setIsValidating(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok && data.valid) {
          setTokenValid(true);
          setTargetEmail(data.email || null);
        } else {
          setTokenValid(false);
          setTokenError(data.error || 'O link de recuperação expirou ou é inválido.');
        }
      } catch {
        setTokenValid(false);
        setTokenError('Erro ao validar o link de recuperação. Tente novamente.');
      } finally {
        setIsValidating(false);
      }
    }

    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password || password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword: password }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setIsSuccess(true);
        } else {
          setErrorMessage(data.error || 'Erro ao redefinir a senha.');
        }
      } catch {
        setErrorMessage('Erro de conexão ao salvar nova senha.');
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
              Nova <span className="text-emerald-400">Senha</span>
            </h1>
            <p className="text-xs font-medium text-slate-300">
              {targetEmail ? `Redefinindo senha para ${targetEmail}` : 'Crie uma nova senha segura para sua conta'}
            </p>
          </div>

          {/* Estado de Validação do Token */}
          {isValidating ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Validando link de segurança...</p>
            </div>
          ) : !tokenValid ? (
            /* Token Inválido ou Expirado */
            <div className="space-y-4 text-center py-2 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-white">Link Inválido ou Expirado</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tokenError || 'Este link de recuperação expirou ou já foi utilizado.'}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/recuperar-senha"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  Solicitar Novo Link de Recuperação
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            /* Sucesso ao redefinir */
            <div className="space-y-4 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-white">Senha alterada com sucesso!</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sua conta foi atualizada. Agora você já pode acessar o sistema com sua nova senha.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Fazer Login Agora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Formulário de Nova Senha */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Feedback de Erro */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Campo Nova Senha */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Nova Senha (mínimo 6 dígitos)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950/60 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Campo Confirmar Senha */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Botão Salvar */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Salvando nova senha...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Redefinir e Salvar Senha</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Rodapé */}
        <div className="text-center space-y-1 text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>EasyMob © {new Date().getFullYear()} — Plataforma de Gestão Imobiliária</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      }
    >
      <RedefinirSenhaForm />
    </Suspense>
  );
}
