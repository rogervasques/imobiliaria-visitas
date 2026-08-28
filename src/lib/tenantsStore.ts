import { Imobiliaria } from '@/types';

export const INITIAL_DEFAULT_IMOBILIARIAS: Imobiliaria[] = [
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
  {
    id: 'tenant-imobiliaria-teste',
    nome: 'Imobiliaria Teste',
    slug: 'imobiliaria-teste',
    telefone: '11999998888',
    email: 'contato@imobiliariateste.com.br',
    modulo_crm_ativo: true,
    limite_usuarios: 10,
    criado_em: new Date().toISOString(),
  },
];

// Store global de tenants compartilhado em memória no servidor
let globalTenantsStore: Imobiliaria[] = [...INITIAL_DEFAULT_IMOBILIARIAS];

export function getGlobalTenants(): Imobiliaria[] {
  return globalTenantsStore;
}

export function findGlobalTenant(idOrNome: string): Imobiliaria | null {
  const norm = idOrNome.trim().toLowerCase();
  return (
    globalTenantsStore.find(
      (t) => t.id.toLowerCase() === norm || t.nome.trim().toLowerCase() === norm
    ) || null
  );
}

export function saveGlobalTenant(tenant: Partial<Imobiliaria> & { nome: string }): Imobiliaria {
  const existingIdx = globalTenantsStore.findIndex(
    (t) =>
      (tenant.id && t.id === tenant.id) ||
      t.nome.trim().toLowerCase() === tenant.nome.trim().toLowerCase()
  );

  const now = new Date().toISOString();
  const slug = tenant.nome.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');

  if (existingIdx >= 0) {
    const updated: Imobiliaria = {
      ...globalTenantsStore[existingIdx],
      ...tenant,
      slug: slug || globalTenantsStore[existingIdx].slug,
      atualizado_em: now,
    };
    globalTenantsStore[existingIdx] = updated;
    return updated;
  }

  const newTenant: Imobiliaria = {
    id: tenant.id || `tenant-${Date.now()}-${slug}`,
    nome: tenant.nome.trim(),
    slug,
    telefone: tenant.telefone,
    email: tenant.email,
    endereco: tenant.endereco,
    logo_url: tenant.logo_url,
    modulo_crm_ativo: tenant.modulo_crm_ativo !== undefined ? tenant.modulo_crm_ativo : true,
    limite_usuarios: tenant.limite_usuarios || 10,
    criado_em: now,
  };

  globalTenantsStore.push(newTenant);
  return newTenant;
}

export function updateGlobalTenant(id: string, updates: Partial<Imobiliaria>): Imobiliaria | null {
  const idx = globalTenantsStore.findIndex((t) => t.id === id || t.nome.toLowerCase() === id.toLowerCase());
  if (idx < 0) {
    // Se não encontrou por ID, mas tem nome nos updates
    if (updates.nome) {
      return saveGlobalTenant({ id, ...updates } as any);
    }
    return null;
  }

  const updated: Imobiliaria = {
    ...globalTenantsStore[idx],
    ...updates,
    atualizado_em: new Date().toISOString(),
  };

  if (updates.nome) {
    updated.slug = updates.nome.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  globalTenantsStore[idx] = updated;
  return updated;
}

export function deleteGlobalTenant(idOrNome: string): boolean {
  const norm = idOrNome.trim().toLowerCase();
  const initialLength = globalTenantsStore.length;
  globalTenantsStore = globalTenantsStore.filter(
    (t) => t.id.toLowerCase() !== norm && t.nome.trim().toLowerCase() !== norm
  );
  return globalTenantsStore.length < initialLength;
}
