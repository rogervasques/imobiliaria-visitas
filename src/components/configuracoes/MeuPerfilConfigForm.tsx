'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  User,
  Mail,
  Phone,
  Award,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  Building2,
  Lock,
} from 'lucide-react';

export function MeuPerfilConfigForm() {
  const { user, refreshUser } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [creci, setCreci] = useState('');

  // Troca de Senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setNome(user.name || '');
      setEmail(user.email || '');
      setTelefone(user.telefone || '');
      setCreci(user.creci || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!nome.trim()) {
      setErrorMessage('O nome completo é obrigatório.');
      return;
    }

    if (novaSenha || confirmarSenha || senhaAtual) {
      if (!senhaAtual) {
        setErrorMessage('Informe a senha atual para confirmar a troca de senha.');
        return;
      }
      if (novaSenha.length < 6) {
        setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (novaSenha !== confirmarSenha) {
        setErrorMessage('A confirmação de senha não coincide com a nova senha.');
        return;
      }
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.trim() || undefined,
          creci: creci.trim() || undefined,
          senha_atual: senhaAtual || undefined,
          nova_senha: novaSenha || undefined,
          confirmar_senha: confirmarSenha || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao salvar alterações do perfil.');
      }

      setSuccessMessage('Seu perfil e configurações foram salvos com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');

      await refreshUser();

      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar perfil.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleLabel = (role?: string) => {
    if (role === 'admin') return 'Administrador Master';
    if (role === 'gestor' || role === 'gerente') return 'Gerente / Gestor';
    return 'Corretor de Imóveis';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card 1: Dados Pessoais e Profissionais */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <User className="w-5 h-5 text-emerald-500" />
              Informações do Meu Perfil
            </CardTitle>
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              {getRoleLabel(user?.role)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Seus dados são utilizados nas mensagens automáticas de confirmação e contato direto com clientes e proprietários.
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Roger Berchembrock"
              icon={<User className="w-4 h-4" />}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                E-mail de Acesso (Login)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  title="O e-mail de login da conta é gerenciado pelo administrador"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
                />
              </div>
              <span className="text-[10px] text-slate-400">Identificador único da sua conta de acesso.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Telefone / WhatsApp Comercial"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Ex: (11) 99999-9999"
              icon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="CRECI Físico (F) - Opcional"
              value={creci}
              onChange={(e) => setCreci(e.target.value)}
              placeholder="Ex: 123456-F"
              icon={<Award className="w-4 h-4" />}
            />
          </div>

          {/* Imobiliária Vinculada */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Imobiliária / Franquia Ativa
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {user?.imobiliaria || 'EasyMob Imóveis'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">
              Instância: {user?.instance_name || 'easymob_user'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Segurança & Troca de Senha */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <KeyRound className="w-5 h-5 text-emerald-500" />
            Segurança &amp; Alteração de Senha
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Preencha os campos abaixo apenas se desejar atualizar sua senha de acesso.
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="max-w-md space-y-4">
            <Input
              label="Senha Atual"
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="Digite sua senha atual"
              icon={<Lock className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nova Senha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                icon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="Confirmar Nova Senha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a nova senha"
                icon={<Lock className="w-4 h-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barra de Ações e Feedback */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          {successMessage && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4" />
              {successMessage}
            </span>
          )}
          {errorMessage && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </span>
          )}
        </div>

        <Button type="submit" variant="primary" isLoading={isSaving} className="shadow-md">
          <Save className="w-4 h-4 mr-1.5" />
          Salvar Meu Perfil
        </Button>
      </div>
    </form>
  );
}
