'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Plus,
  Building2,
  Menu,
  X,
  UserCheck,
  Users,
  BarChart3,
  Settings,
  ChevronRight,
  LogOut,
  UserCog,
  Store,
  Activity,
  Kanban,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { WhatsAppStatusBadge } from './WhatsAppStatusBadge';

interface BottomNavProps {
  onOpenNovaVisita: () => void;
}

export function BottomNav({ onOpenNovaVisita }: BottomNavProps) {
  const pathname = usePathname();
  const { metrics, proprietarios, clientes } = useData();
  const { user, logout } = useAuth();
  const { moduloCrmAtivo, imobiliarias } = useTenant();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const totalLeadsAtivosCrm = clientes.filter((c) => {
    if (c.etapa_crm) return c.etapa_crm !== 'venda_concluida' && c.etapa_crm !== ('fechado' as any);
    return c.status !== 'fechado' && c.status !== 'inativo';
  }).length;

  const podeVerEquipe = user?.role === 'admin' || user?.role === 'gestor' || (user?.role as string) === 'gerente';
  const isAdmin = user?.role === 'admin';

  // ─── LISTA COMPLETA DE TODAS AS ABAS/MÓDULOS PERMITIDOS AO PERFIL ATUAL ───
  const allNavItems = [
    {
      label: 'Hoje',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: metrics.totalVisitasHoje ? `${metrics.totalVisitasHoje}` : undefined,
      description: 'Visitas agendadas e métricas do dia',
    },
    {
      label: 'Agenda',
      href: '/agenda',
      icon: CalendarDays,
      description: 'Calendário completo e horários',
    },
    ...(moduloCrmAtivo
      ? [
          {
            label: 'CRM (Kanban de Leads)',
            href: '/crm',
            icon: Kanban,
            badge: totalLeadsAtivosCrm > 0 ? `${totalLeadsAtivosCrm}` : undefined,
            description: 'Funil visual e gestão de negociações',
          },
        ]
      : []),
    {
      label: 'Imóveis',
      href: '/imoveis',
      icon: Building2,
      badge: `${metrics.totalImoveisAtivos}`,
      description: 'Catálogo de imóveis e fichas públicas',
    },
    {
      label: 'Proprietários',
      href: '/proprietarios',
      icon: UserCheck,
      badge: `${proprietarios.length}`,
      description: 'Gestão de proprietários e chaves',
    },
    {
      label: 'Clientes',
      href: '/clientes',
      icon: Users,
      badge: `${metrics.totalClientesAtivos}`,
      description: 'Base de compradores e locatários',
    },
    ...(podeVerEquipe
      ? [
          {
            label: 'Equipe',
            href: '/equipe',
            icon: UserCog,
            description: 'Gestão de corretores, gerentes e convites',
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            label: 'Imobiliárias',
            href: '/imobiliarias',
            icon: Store,
            badge: `${imobiliarias.length}`,
            description: 'Gestão multi-tenant de empresas',
          },
          {
            label: 'Infraestrutura',
            href: '/infraestrutura',
            icon: Activity,
            description: 'Monitoramento de servidores e APIs',
          },
          {
            label: 'Auditoria & Logs',
            href: '/logs',
            icon: ShieldCheck,
            description: 'Rastro de atividades e lixeira com 60 dias de retenção',
          },
        ]
      : []),
    {
      label: 'Relatórios',
      href: '/relatorios',
      icon: BarChart3,
      description: 'Métricas de conversão e visitas',
    },
    {
      label: 'Configurações',
      href: '/configuracoes',
      icon: Settings,
      description: 'WhatsApp, instâncias e sistema',
    },
  ];

  const isBottomBarRoute = pathname === '/dashboard' || pathname === '/' || pathname === '/agenda' || pathname === '/imoveis';
  const isMoreActive = !isBottomBarRoute && allNavItems.some((item) => pathname === item.href);

  return (
    <>
      {/* ─── BARRA INFERIOR FIXA (5 ATALHOS RÁPIDOS) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 bottom-safe shadow-lg">
        <div className="flex items-center justify-around relative">
          {/* 1. Hoje */}
          <Link
            href="/dashboard"
            onClick={() => setIsMoreOpen(false)}
            className={cn(
              'flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all',
              pathname === '/dashboard' || pathname === '/'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1">Hoje</span>
          </Link>

          {/* 2. Agenda */}
          <Link
            href="/agenda"
            onClick={() => setIsMoreOpen(false)}
            className={cn(
              'flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all',
              pathname === '/agenda'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            )}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[10px] mt-1">Agenda</span>
          </Link>

          {/* 3. Botão Central Flutuante: (+) Agendar */}
          <div className="relative -top-5 flex flex-col items-center justify-center">
            <button
              onClick={() => {
                setIsMoreOpen(false);
                onOpenNovaVisita();
              }}
              aria-label="Agendar Visita"
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-600/40 active:scale-95 transition-transform border-4 border-slate-50 dark:border-slate-900 focus:outline-none cursor-pointer"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Agendar
            </span>
          </div>

          {/* 4. Imóveis */}
          <Link
            href="/imoveis"
            onClick={() => setIsMoreOpen(false)}
            className={cn(
              'flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all',
              pathname === '/imoveis'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            )}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-[10px] mt-1">Imóveis</span>
          </Link>

          {/* 5. Mais (Menu Global Completo) */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={cn(
              'flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all cursor-pointer',
              isMoreOpen || isMoreActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            )}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1">Mais</span>
          </button>
        </div>
      </nav>

      {/* ─── BOTTOM SHEET DA ABA "MAIS" (MENU GLOBAL COMPLETO) ─── */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMoreOpen(false)}
            aria-hidden="true"
          />

          {/* Painel Inferior Deslizante */}
          <div className="relative w-full max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl shadow-2xl z-10 p-5 space-y-4 animate-in slide-in-from-bottom duration-250 bottom-safe">
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto shrink-0" />

            {/* Cabeçalho do Bottom Sheet */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  Menu de Navegação
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Acesso rápido a todos os módulos do EasyMob
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista Completa de Opções Permitidas (Scrollable) */}
            <div className="overflow-y-auto no-scrollbar space-y-2 pr-0.5 max-h-[calc(85vh-180px)]">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-2xl border transition-all duration-200',
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  </Link>
                );
              })}

              {/* Status do WhatsApp abaixo de Configurações no Mobile */}
              <div className="pt-2">
                <WhatsAppStatusBadge />
              </div>

              {/* Botão Sair / Logout no Mobile */}
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja realmente sair do sistema?')) {
                    setIsMoreOpen(false);
                    logout();
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors font-bold text-xs cursor-pointer mt-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span>Sair do Sistema</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
