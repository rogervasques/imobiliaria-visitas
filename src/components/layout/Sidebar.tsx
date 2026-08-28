'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Check,
  PlusCircle,
  Kanban,
  Store,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { WhatsAppStatusBadge } from './WhatsAppStatusBadge';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { EasyMobLogo } from '../ui/EasyMobLogo';

export function Sidebar() {
  const pathname = usePathname();
  const { metrics, proprietarios, clientes } = useData();
  const { user, logout } = useAuth();
  const { imobiliarias, currentTenant, setCurrentTenant, adicionarImobiliaria, moduloCrmAtivo } = useTenant();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [newTenantNome, setNewTenantNome] = useState('');
  const [isSavingTenant, setIsSavingTenant] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSelectTenant = (nome: string) => {
    setCurrentTenant(nome);
    setIsDropdownOpen(false);
  };

  const handleCreateNewTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantNome.trim()) return;

    setIsSavingTenant(true);
    try {
      const created = await adicionarImobiliaria(newTenantNome.trim());
      setCurrentTenant(created);
      setNewTenantNome('');
      setIsNewTenantModalOpen(false);
      setIsDropdownOpen(false);
    } finally {
      setIsSavingTenant(false);
    }
  };

  const totalLeadsAtivosCrm = clientes.filter((c) => {
    if (c.etapa_crm) return c.etapa_crm !== 'venda_concluida' && c.etapa_crm !== ('fechado' as any);
    return c.status !== 'fechado' && c.status !== 'inativo';
  }).length;

  const navItems = [
    { label: 'Hoje', href: '/dashboard', icon: LayoutDashboard, badge: metrics.totalVisitasHoje ? `${metrics.totalVisitasHoje}` : undefined },
    { label: 'Agenda', href: '/agenda', icon: CalendarDays },
    ...(moduloCrmAtivo
      ? [{ label: 'CRM', href: '/crm', icon: Kanban, badge: totalLeadsAtivosCrm > 0 ? `${totalLeadsAtivosCrm}` : undefined }]
      : []),
    { label: 'Imóveis', href: '/imoveis', icon: Building2, badge: `${metrics.totalImoveisAtivos}` },
    { label: 'Proprietários', href: '/proprietarios', icon: UserCheck, badge: `${proprietarios.length}` },
    { label: 'Clientes', href: '/clientes', icon: Users, badge: `${metrics.totalClientesAtivos}` },
    ...(user?.role === 'admin'
      ? [
          { label: 'Imobiliárias', href: '/imobiliarias', icon: Store, badge: `${imobiliarias.length}` },
          { label: 'Usuários', href: '/usuarios', icon: UserCog },
          { label: 'Infraestrutura', href: '/infraestrutura', icon: Activity },
        ]
      : []),
    { label: 'Relatórios', href: '/relatorios', icon: BarChart3 },
    { label: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 p-4 justify-between select-none">
        <div className="space-y-6">
          {/* ─── BRAND WHITE LABEL COM SELETOR PARA O ADMIN NO PC ─── */}
          {isAdmin ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left group cursor-pointer min-h-[50px]"
                title="Clique para alternar imobiliária"
              >
                {currentTenant?.logo_url ? (
                  /* COM LOGO: Substituição Completa da Marca */
                  <div className="flex items-center justify-between w-full min-w-0 pr-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentTenant.logo_url}
                      alt={currentTenant.nome || 'Logo'}
                      className="max-h-10 max-w-[180px] w-auto h-auto object-contain shrink-0"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:text-slate-400 shrink-0 transition-transform duration-200 ml-2" />
                  </div>
                ) : (
                  /* SEM LOGO (FALLBACK): [ Ícone com Iniciais ] + [ Nome da Imobiliária em Texto ] */
                  <>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/25 shrink-0">
                        {getInitials(currentTenant?.nome || 'EM')}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-[13px] leading-tight line-clamp-2 break-words">
                            {currentTenant?.nome || 'EasyMob Imóveis'}
                          </span>
                        </div>
                        <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                          Clique para alternar
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:text-slate-400 shrink-0 transition-transform duration-200 ml-1.5" />
                  </>
                )}
              </button>

              {/* Popover Dropdown de Alternância de Imobiliárias */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Alternar Imobiliária
                    </p>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1 space-y-0.5 px-1">
                    {imobiliarias.map((imo) => {
                      const isSelected = imo.nome.toLowerCase() === currentTenant?.nome?.toLowerCase();
                      return (
                        <button
                          key={imo.id}
                          type="button"
                          onClick={() => handleSelectTenant(imo.nome)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer',
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {imo.logo_url ? (
                              <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 flex items-center justify-center shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={imo.logo_url}
                                  alt={imo.nome}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  'w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0',
                                  isSelected
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                )}
                              >
                                {getInitials(imo.nome)}
                              </div>
                            )}
                            <span className="truncate">{imo.nome}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800 px-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsNewTenantModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Cadastrar Nova Imobiliária</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ─── PERFIL CORRETOR: MARCA WHITE LABEL FIXA ─── */
            <div className="flex items-center p-2 min-h-[48px]">
              {currentTenant?.logo_url ? (
                /* COM LOGO: Exibe apenas a imagem da logo enviada */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentTenant.logo_url}
                  alt={currentTenant.nome || user?.imobiliaria || 'Imobiliária'}
                  className="max-h-10 max-w-[190px] w-auto h-auto object-contain"
                />
              ) : (
                /* SEM LOGO (FALLBACK): [ Ícone com Iniciais ] + [ Nome da Imobiliária em Texto ] */
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/25 shrink-0">
                    {getInitials(currentTenant?.nome || user?.imobiliaria || 'EM')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-[13px] leading-tight line-clamp-2 break-words block">
                      {currentTenant?.nome || user?.imobiliaria || 'EasyMob Imóveis'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

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
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Marca d'água discreta EasyMob no rodapé da Sidebar */}
          <div className="pt-2 flex items-center justify-center border-t border-slate-100 dark:border-slate-800/80">
            <EasyMobLogo variant="watermark" />
          </div>
        </div>
      </aside>

      {/* Modal para cadastrar nova imobiliária pelo Admin */}
      <Modal
        isOpen={isNewTenantModalOpen}
        onClose={() => setIsNewTenantModalOpen(false)}
        title="Cadastrar Nova Imobiliária"
      >
        <form onSubmit={handleCreateNewTenant} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Nome da Imobiliária / Empresa <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={newTenantNome}
                onChange={(e) => setNewTenantNome(e.target.value)}
                placeholder="Ex: Prime Imóveis Alphaville"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ao cadastrar, ela ficará disponível para seleção e para vinculação de novos corretores.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewTenantModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSavingTenant}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Salvar e Alternar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
