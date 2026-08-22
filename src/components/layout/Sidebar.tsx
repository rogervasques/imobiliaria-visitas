'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  UserCheck,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { WhatsAppStatusBadge } from './WhatsAppStatusBadge';

export function Sidebar() {
  const pathname = usePathname();
  const { metrics, proprietarios } = useData();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Hoje', href: '/', icon: LayoutDashboard, badge: metrics.totalVisitasHoje ? `${metrics.totalVisitasHoje}` : undefined },
    { label: 'Agenda', href: '/agenda', icon: CalendarDays },
    { label: 'Imóveis', href: '/imoveis', icon: Building2, badge: `${metrics.totalImoveisAtivos}` },
    { label: 'Proprietários', href: '/proprietarios', icon: UserCheck, badge: `${proprietarios.length}` },
    { label: 'Clientes', href: '/clientes', icon: Users, badge: `${metrics.totalClientesAtivos}` },
    ...(user?.role === 'admin' ? [{ label: 'Usuários', href: '/usuarios', icon: UserCog }] : []),
    { label: 'Relatórios', href: '/relatorios', icon: BarChart3 },
    { label: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 p-4 justify-between select-none">
      <div className="space-y-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/25">
            EM
          </div>
          <div>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-lg tracking-tight">
              Easy<span className="text-emerald-600 dark:text-emerald-400">Mob</span>
            </span>
            <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Gestão &amp; Automação
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={`${item.href}-${idx}`}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-bold transition-colors',
                      isActive
                        ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Indicador de Status do WhatsApp fixado diretamente abaixo de Configurações */}
          <div className="pt-2">
            <WhatsAppStatusBadge />
          </div>
        </nav>
      </div>

      {/* Perfil do Usuário e Botão Logout */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RB'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                {user?.name || 'Roger Berchembrock'}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="capitalize">{user?.role || 'Administrador'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Deseja realmente sair do sistema?')) {
                logout();
              }
            }}
            title="Sair / Logout do Sistema"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
