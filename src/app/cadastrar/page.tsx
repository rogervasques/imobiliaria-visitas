'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function CadastrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const { refreshUser } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [imobiliariaNome, setImobiliariaNome] = useState('');

  // Formulário de Cadastro
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Validação do Token ao carregar
  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setTokenValid(false);
      setTokenError('Link de convite inválido ou token não fornecido.');
      return;
    }

    const checkToken = async () => {
      try {
        const res = await fetch(`/api/invites/validate?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok && data.valid && data.invite) {
          setTokenValid(true);
          setImobiliariaNome(data.invite.imobiliaria || 'EasyMob Imóveis');
        } else {
          setTokenValid(false);
          setTokenError(data.error || 'Este convite expirou ou já foi utilizado.');
        }
      } catch {
        setTokenValid(false);
        setTokenError('Erro ao validar convite com o servidor.');
      } finally {
        setIsValidating(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nome.trim() || !email.trim() || !senha) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (senha.length < 6) {
      setFormError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setFormError('As senhas digitadas não coincidem.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/invites/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            nome: nome.trim(),
            telefone: telefone.trim(),
            email: email.trim(),
            senha,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          await refreshUser();
          router.push('/');
          router.refresh();
        } else {
          setFormError(data.error || 'Erro ao concluir cadastro.');
        }
      } catch {
        setFormError('Erro de conexão ao enviar cadastro.');
      }
    });
  };

  if (isValidating) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/60">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-300 font-medium">Validando convite de corretor...</p>
        </div>
      </div>
    );
  }

  // Se o token for inválido ou expirado
  if (!tokenValid) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/60 select-none">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white/10 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/10 dark:border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white">Convite Expirado ou Inválido</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {tokenError || 'Este link de convite expirou (validade de 24 horas excedida) ou já foi utilizado por outro usuário.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
            Solicite um novo link de convite ao Administrador da sua Imobiliária.
          </div>

          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <span>Ir para a Tela de Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/60 relative overflow-hidden select-none py-10">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-white/10 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/10 dark:border-slate-800 shadow-2xl space-y-6">
          {/* Logo e Título */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-xl shadow-xl shadow-emerald-500/30 mb-1">
              EM
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Cadastro de <span className="text-emerald-400">Corretor</span>
            </h1>
            <p className="text-xs font-medium text-slate-300">
              Você foi convidado para fazer parte da equipe no EasyMob
            </p>
          </div>

          {/* Feedback de Erro */}
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Imobiliária (Bloqueada / Somente Leitura) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Imobiliária Vinculada</span>
                <span className="text-[10px] text-emerald-400 font-normal">Vinculada ao convite</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  disabled
                  value={imobiliariaNome}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 text-sm font-bold text-emerald-300 cursor-not-allowed opacity-90 shadow-inner"
                />
              </div>
            </div>

            {/* Nome Completo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">
                Nome Completo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Telefone / WhatsApp */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  WhatsApp / Celular
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* E-mail */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  E-mail de Login *
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
                    placeholder="carlos@imoveis.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Senha e Confirmar Senha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Senha de Acesso *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita sua senha"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Botão Concluir Cadastro */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Cadastrando Corretor...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Criar Conta e Acessar EasyMob</span>
                </>
              )}
            </button>
          </form>

          {/* Link para Login */}
          <div className="text-center pt-2 text-xs text-slate-400">
            <span>Já possui uma conta? </span>
            <Link href="/login" className="font-bold text-emerald-400 hover:underline">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CadastrarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      }
    >
      <CadastrarForm />
    </Suspense>
  );
}
