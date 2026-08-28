'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Imobiliaria } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface TenantContextType {
  imobiliarias: Imobiliaria[];
  currentTenant: Imobiliaria;
  isAllTenantsSelected: boolean;
  moduloCrmAtivo: boolean;
  setCurrentTenant: (tenantOrNome: Imobiliaria | string) => void;
  adicionarImobiliaria: (dados: Partial<Imobiliaria> | string, logoUrl?: string) => Promise<Imobiliaria>;
  atualizarImobiliaria: (id: string, dados: Partial<Imobiliaria>) => Promise<Imobiliaria>;
  removerImobiliaria: (id: string, nome?: string, confirmText?: string) => Promise<void>;
  isLoadingTenants: boolean;
  refreshTenants: () => Promise<void>;
}

export const DEFAULT_IMOBILIARIAS: Imobiliaria[] = [
  {
    id: 'tenant-lagom-default',
    nome: 'Lagom Imóveis',
    slug: 'lagom-imoveis',
    telefone: '11999999999',
    email: 'contato@lagomimoveis.com.br',
    modulo_crm_ativo: true,
    limite_usuarios: 10,
    criado_em: new Date().toISOString(),
  },
  {
    id: 'tenant-prime',
    nome: 'Imobiliária Prime',
    slug: 'prime',
    telefone: '11988887777',
    email: 'contato@primeimoveis.com.br',
    modulo_crm_ativo: true,
    limite_usuarios: 10,
    criado_em: new Date().toISOString(),
  },
  {
    id: 'tenant-nova-era',
    nome: 'Nova Era Imóveis',
    slug: 'nova-era',
    telefone: '11977776666',
    email: 'atendimento@novaera.com.br',
    modulo_crm_ativo: true,
    limite_usuarios: 10,
    criado_em: new Date().toISOString(),
  },
];

const TENANT_STORAGE_KEY = 'easymob_active_tenant_nome';
const TENANT_LIST_STORAGE_KEY = 'easymob_imobiliarias_list';

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [imobiliarias, setImobiliarias] = useState<Imobiliaria[]>(DEFAULT_IMOBILIARIAS);
  const [currentTenant, setCurrentTenantState] = useState<Imobiliaria>(DEFAULT_IMOBILIARIAS[0]);
  const [isLoadingTenants, setIsLoadingTenants] = useState<boolean>(true);

  // Busca lista de imobiliárias no Supabase / API
  const refreshTenants = useCallback(async () => {
    try {
      // 1. Tenta carregar do localStorage primeiro se houver lista customizada salva
      const savedListStr = typeof window !== 'undefined' ? localStorage.getItem(TENANT_LIST_STORAGE_KEY) : null;
      let localList: Imobiliaria[] | null = null;
      if (savedListStr) {
        try {
          localList = JSON.parse(savedListStr);
        } catch {
          // ignore
        }
      }

      // 2. Tenta carregar da tabela 'imobiliarias'
      const { data: dbTenants, error } = await supabase
        .from('imobiliarias')
        .select('*')
        .order('nome', { ascending: true });

      if (!error && dbTenants && dbTenants.length > 0) {
        setImobiliarias(dbTenants);
        if (typeof window !== 'undefined') {
          localStorage.setItem(TENANT_LIST_STORAGE_KEY, JSON.stringify(dbTenants));
        }
        return;
      }

      if (localList && localList.length > 0) {
        setImobiliarias(localList);
        return;
      }

      // 3. Se a tabela não tiver dados, busca imobiliárias distintas de users
      const { data: usersData } = await supabase.from('users').select('imobiliaria');
      const uniqueNames = new Set<string>();
      
      if (usersData) {
        usersData.forEach((u) => {
          if (u.imobiliaria && typeof u.imobiliaria === 'string' && u.imobiliaria.trim().length > 0 && u.imobiliaria.trim() !== 'Administração') {
            uniqueNames.add(u.imobiliaria.trim());
          }
        });
      }

      DEFAULT_IMOBILIARIAS.forEach((i) => uniqueNames.add(i.nome));

      const mergedList: Imobiliaria[] = Array.from(uniqueNames).map((nome, idx) => {
        const found = DEFAULT_IMOBILIARIAS.find((i) => i.nome.toLowerCase() === nome.toLowerCase());
        if (found) return found;
        return {
          id: `tenant-${idx + 1}-${nome.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          nome: nome,
          slug: nome.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          criado_em: new Date().toISOString(),
        };
      });

      setImobiliarias(mergedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem(TENANT_LIST_STORAGE_KEY, JSON.stringify(mergedList));
      }
    } catch {
      const savedListStr = typeof window !== 'undefined' ? localStorage.getItem(TENANT_LIST_STORAGE_KEY) : null;
      if (savedListStr) {
        try {
          setImobiliarias(JSON.parse(savedListStr));
          return;
        } catch {
          // ignore
        }
      }
      setImobiliarias(DEFAULT_IMOBILIARIAS);
    } finally {
      setIsLoadingTenants(false);
    }
  }, []);

  useEffect(() => {
    refreshTenants();
  }, [refreshTenants]);

  // Sincroniza tenant com o perfil do usuário ou preferência salva
  useEffect(() => {
    if (!user) return;

    // Se o usuário for Corretor ou Gestor, ele é ESTRITAMENTE restrito à sua imobiliária
    if (user.role === 'corretor' || user.role === 'gestor') {
      const userTenantName = (user.imobiliaria || '').trim();
      if (!isLoadingTenants && imobiliarias.length > 0) {
        const match = imobiliarias.find(
          (i) => i.nome.toLowerCase() === userTenantName.toLowerCase()
        );
        if (match) {
          setCurrentTenantState(match);
        } else {
          // Imobiliária não existe mais / foi excluída -> Desconecta imediatamente
          console.warn(`[TenantContext] Imobiliária "${userTenantName}" do usuário não encontrada. Encerrando sessão.`);
          if (typeof window !== 'undefined') {
            alert('Aviso de Segurança: A imobiliária vinculada à sua conta foi desativada ou excluída pelo administrador.');
            window.location.href = '/api/auth/logout';
          }
        }
      }
      return;
    }

    // Se o usuário for Admin, recupera a última imobiliária selecionada ou usa a padrão
    if (user.role === 'admin') {
      const savedTenantName = typeof window !== 'undefined' ? localStorage.getItem(TENANT_STORAGE_KEY) : null;
      if (savedTenantName && savedTenantName !== 'Administração' && savedTenantName !== 'Todas') {
        const match = imobiliarias.find(
          (i) => i.nome.toLowerCase() === savedTenantName.toLowerCase()
        );
        if (match) {
          setCurrentTenantState(match);
          return;
        }
      }

      // Se o admin tiver uma imobiliária definida no perfil (e não for Administração)
      if (user.imobiliaria && user.imobiliaria !== 'Administração') {
        const match = imobiliarias.find(
          (i) => i.nome.toLowerCase() === user.imobiliaria.toLowerCase()
        );
        if (match) {
          setCurrentTenantState(match);
          return;
        }
      }

      // Fallback para a primeira imobiliária da lista
      if (imobiliarias.length > 0) {
        setCurrentTenantState(imobiliarias[0]);
      }
    }
  }, [user, imobiliarias]);

  // Altera a imobiliária ativa (Super Admin)
  const setCurrentTenant = useCallback(
    (tenantOrNome: Imobiliaria | string) => {
      let targetTenant: Imobiliaria;

      if (typeof tenantOrNome === 'string') {
        const match = imobiliarias.find(
          (i) => i.nome.toLowerCase() === tenantOrNome.toLowerCase()
        );
        targetTenant =
          match || {
            id: `tenant-${tenantOrNome.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            nome: tenantOrNome,
            criado_em: new Date().toISOString(),
          };
      } else {
        targetTenant = tenantOrNome;
      }

      setCurrentTenantState(targetTenant);
      if (typeof window !== 'undefined') {
        localStorage.setItem(TENANT_STORAGE_KEY, targetTenant.nome);
      }
    },
    [imobiliarias]
  );

  // Adiciona uma nova imobiliária dinamicamente
  const adicionarImobiliaria = useCallback(
    async (dados: Partial<Imobiliaria> | string, logoUrl?: string): Promise<Imobiliaria> => {
      const nome = typeof dados === 'string' ? dados : dados.nome || '';
      const trimmedNome = nome.trim();
      const customLogo = typeof dados === 'string' ? logoUrl : (dados.logo_url || logoUrl);
      const email = typeof dados === 'object' ? dados.email : undefined;
      const telefone = typeof dados === 'object' ? dados.telefone : undefined;
      const endereco = typeof dados === 'object' ? dados.endereco : undefined;
      const modulo_crm_ativo = typeof dados === 'object' && dados.modulo_crm_ativo !== undefined ? dados.modulo_crm_ativo : true;

      const newTenant: Imobiliaria = {
        id: `tenant-${Date.now()}`,
        nome: trimmedNome,
        slug: trimmedNome.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        logo_url: customLogo,
        email,
        telefone,
        endereco,
        modulo_crm_ativo,
        criado_em: new Date().toISOString(),
      };

      try {
        const { data, error } = await supabase
          .from('imobiliarias')
          .insert({
            nome: newTenant.nome,
            slug: newTenant.slug,
            logo_url: newTenant.logo_url,
            email: newTenant.email,
            telefone: newTenant.telefone,
            endereco: newTenant.endereco,
          })
          .select()
          .single();

        if (!error && data) {
          newTenant.id = data.id;
        }
      } catch {
        // Fallback local
      }

      setImobiliarias((prev) => {
        let next: Imobiliaria[];
        if (prev.some((i) => i.nome.toLowerCase() === trimmedNome.toLowerCase())) {
          next = prev.map((i) => (i.nome.toLowerCase() === trimmedNome.toLowerCase() ? { ...i, ...newTenant } : i));
        } else {
          next = [...prev, newTenant];
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem(TENANT_LIST_STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });

      return newTenant;
    },
    []
  );

  // Atualiza uma imobiliária existente
  const atualizarImobiliaria = useCallback(
    async (id: string, dados: Partial<Imobiliaria>): Promise<Imobiliaria> => {
      const updatedData = {
        ...dados,
        atualizado_em: new Date().toISOString(),
      };

      if (dados.nome) {
        updatedData.slug = dados.nome.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      }

      const newName = dados.nome?.trim();
      let oldName: string | undefined;

      try {
        await supabase
          .from('imobiliarias')
          .update(updatedData)
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase update imobiliaria offline:', err);
      }

      let updatedTenant: Imobiliaria | undefined;

      setImobiliarias((prev) => {
        const found = prev.find((i) => i.id === id);
        if (found) {
          oldName = found.nome;
        }

        const nextList = prev.map((i) => {
          if (i.id === id || (oldName && i.nome.toLowerCase() === oldName.toLowerCase())) {
            updatedTenant = { ...i, ...updatedData };
            return updatedTenant;
          }
          return i;
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem(TENANT_LIST_STORAGE_KEY, JSON.stringify(nextList));
        }
        return nextList;
      });

      // Se o nome mudou, sincroniza usuários vinculados no Supabase
      if (oldName && newName && oldName.toLowerCase() !== newName.toLowerCase()) {
        try {
          await supabase
            .from('users')
            .update({ imobiliaria: newName })
            .ilike('imobiliaria', oldName);
        } catch {
          // ignore
        }
      }

      // Se a imobiliária atualizada for a ativa, sincroniza o estado
      setCurrentTenantState((current) => {
        if ((current.id === id || (oldName && current.nome.toLowerCase() === oldName.toLowerCase())) && updatedTenant) {
          if (typeof window !== 'undefined' && updatedTenant.nome) {
            localStorage.setItem(TENANT_STORAGE_KEY, updatedTenant.nome);
          }
          return updatedTenant;
        }
        return current;
      });

      return updatedTenant || ({ id, ...dados } as Imobiliaria);
    },
    []
  );

  // Remove uma imobiliária com exclusão em cascata completa
  const removerImobiliaria = useCallback(
    async (id: string, nome?: string, confirmText: string = 'EXCLUIR'): Promise<void> => {
      try {
        const res = await fetch(`/api/imobiliarias/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirmText, nome }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Erro ao excluir imobiliária.');
        }
      } catch (err: any) {
        console.warn('API delete imobiliaria cascade:', err);
        // Fallback direto no Supabase caso a rota falhe
        try {
          await supabase.from('imobiliarias').delete().eq('id', id);
        } catch {
          // ignore
        }
      }

      setImobiliarias((prev) => {
        const remaining = prev.filter((i) => i.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem(TENANT_LIST_STORAGE_KEY, JSON.stringify(remaining));
        }
        // Se a imobiliária excluída for a ativa, altera para a primeira disponível
        if (currentTenant.id === id && remaining.length > 0) {
          setCurrentTenantState(remaining[0]);
          if (typeof window !== 'undefined') {
            localStorage.setItem(TENANT_STORAGE_KEY, remaining[0].nome);
          }
        }
        return remaining;
      });
    },
    [currentTenant.id]
  );

  const moduloCrmAtivo = currentTenant?.modulo_crm_ativo !== false;

  return (
    <TenantContext.Provider
      value={{
        imobiliarias,
        currentTenant,
        isAllTenantsSelected: false,
        moduloCrmAtivo,
        setCurrentTenant,
        adicionarImobiliaria,
        atualizarImobiliaria,
        removerImobiliaria,
        isLoadingTenants,
        refreshTenants,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant deve ser usado dentro de um TenantProvider');
  }
  return context;
}
