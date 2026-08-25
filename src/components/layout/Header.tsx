'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Building2,
  ChevronDown,
  Check,
  Plus,
  PlusCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EasyMobLogo } from '../ui/EasyMobLogo';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onOpenNovaVisita: () => void;
}

export function Header({ onOpenNovaVisita }: HeaderProps) {
  const { user } = useAuth();
  const { imobiliarias, currentTenant, setCurrentTenant, adicionarImobiliaria } = useTenant();

  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [newTenantNome, setNewTenantNome] = useState('');
  const [isSavingTenant, setIsSavingTenant] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';

  const hoje = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const hojeCapitalizado = hoje.charAt(0).toUpperCase() + hoje.slice(1);

  // Fecha o dropdown mobile ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setIsMobileDropdownOpen(false);
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
    setIsMobileDropdownOpen(false);
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
      setIsMobileDropdownOpen(false);
    } finally {
      setIsSavingTenant(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md bg-white/85 dark:bg-slate-900/85">
        <div className="flex items-center justify-between px-4 sm:px-8 h-16 max-w-7xl mx-auto">
          {/* ─── LADO ESQUERDO ─── */}
          <div className="flex items-center gap-3">
            {/* NO MOBILE: Marca da Imobiliária + Alternador para Admin */}
            <div className="md:hidden">
              {isAdmin ? (
                <div className="relative" ref={mobileDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 shrink-0">
                      {getInitials(currentTenant?.nome || 'EM')}
                    </div>
                    <div className="flex items-center gap-1 min-w-0 max-w-[190px] xs:max-w-[230px]">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-tight line-clamp-2 break-words">
                        {currentTenant?.nome || 'EasyMob Imóveis'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                  </button>

                  {/* Dropdown Mobile */}
                  {isMobileDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                              <div className="flex items-center gap-2 min-w-0">
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
                            setIsMobileDropdownOpen(false);
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
                /* Corretor no mobile */
                <div className="flex items-center gap-2 min-w-0 max-w-[200px] xs:max-w-[240px]">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 shrink-0">
                    {getInitials(currentTenant?.nome || user?.imobiliaria || 'EM')}
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-tight line-clamp-2 break-words">
                    {currentTenant?.nome || user?.imobiliaria || 'EasyMob Imóveis'}
                  </span>
                </div>
              )}
            </div>

            {/* NO PC: Apenas a Data Atual (sem duplicar o nome da imobiliária que já está na sidebar esquerda) */}
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 px-3.5 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>{hojeCapitalizado}</span>
            </div>
          </div>

          {/* ─── LADO DIREITO ─── */}
          <div className="flex items-center gap-3">
            {/* NO MOBILE: Marca d'água discreta 'by EasyMob' */}
            <div className="md:hidden flex items-center">
              <EasyMobLogo variant="watermark" />
            </div>

            {/* NO PC: Botão Agendar Visita */}
            <div className="hidden md:flex">
              <Button
                onClick={onOpenNovaVisita}
                size="sm"
                className="flex items-center shadow-md font-semibold text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Agendar Visita</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal para cadastrar nova imobiliária pelo Admin (acionado no mobile) */}
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
