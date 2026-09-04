import { Cliente, Imovel } from '@/types';

/**
 * Normaliza string removendo acentos e convertendo para minúsculas
 */
function normalize(str?: string | null): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Tenta extrair valores numéricos de texto legado de faixa de orçamento (ex: "800k a 1.2M", "500.000")
 */
function parseLegacyBudget(text?: string | null): { min: number; max: number } {
  if (!text) return { min: 0, max: 0 };
  const clean = text.toLowerCase().replace(/\./g, '').replace(/,/g, '.');
  
  // Ex: "500k" -> 500000, "1.2m" -> 1200000
  const kMatches = clean.match(/(\d+(?:\.\d+)?)\s*(k|mil|m|milh[a-z]*)/gi);
  if (kMatches && kMatches.length > 0) {
    const nums = kMatches.map((m) => {
      const val = parseFloat(m);
      if (m.includes('m')) return val * 1000000;
      return val * 1000;
    });
    if (nums.length === 1) return { min: 0, max: nums[0] };
    return { min: Math.min(...nums), max: Math.max(...nums) };
  }

  const rawNums = clean.match(/\d+/g);
  if (rawNums && rawNums.length > 0) {
    const parsed = rawNums.map((n) => parseInt(n, 10)).filter((n) => n > 1000);
    if (parsed.length === 1) return { min: 0, max: parsed[0] };
    if (parsed.length >= 2) return { min: Math.min(...parsed), max: Math.max(...parsed) };
  }

  return { min: 0, max: 0 };
}

/**
 * Verifica se o cliente possui critérios mínimos de match preenchidos
 */
export function hasCriteriosDeMatch(cliente?: Cliente | null): boolean {
  if (!cliente) return false;

  const hasBudgetMin = typeof cliente.orcamento_min === 'number' && cliente.orcamento_min > 0;
  const hasBudgetMax = typeof cliente.orcamento_max === 'number' && cliente.orcamento_max > 0;
  const hasType = !!cliente.preferencia_tipo && cliente.preferencia_tipo !== 'todos';
  const hasRooms = typeof cliente.preferencia_quartos === 'number' && cliente.preferencia_quartos > 0;
  const hasPurpose = !!cliente.preferencia_finalidade && cliente.preferencia_finalidade !== 'ambos';
  const hasDirectInterest = !!cliente.imovel_interesse_id;

  if (hasBudgetMin || hasBudgetMax || hasType || hasRooms || hasPurpose || hasDirectInterest) {
    return true;
  }

  // Checagem de compatibilidade para dados legados
  const legacyBudget = parseLegacyBudget(cliente.faixa_orcamento);
  if (legacyBudget.min > 0 || legacyBudget.max > 0) return true;

  const legacyText = normalize(cliente.perfil_interesse);
  const legacyKeywords = ['apto', 'apartamento', 'casa', 'sobrado', 'terreno', 'comercial', 'cobertura', 'quarto', 'dorm'];
  if (legacyKeywords.some((k) => legacyText.includes(k))) return true;

  return false;
}

/**
 * Calcula os imóveis compatíveis com o perfil estruturado e orçamento do cliente
 */
export function getImoveisCompativeis(cliente: Cliente, todosImoveis: Imovel[]): Imovel[] {
  if (!cliente || !todosImoveis || todosImoveis.length === 0) return [];

  // 1. TRAVA DE SEGURANÇA: Se não houver critérios ou orçamento, retorna vazio []
  if (!hasCriteriosDeMatch(cliente)) {
    return [];
  }

  // Orçamento efetivo (prioriza campos estruturados, fallback para legado)
  let orcMin = typeof cliente.orcamento_min === 'number' ? cliente.orcamento_min : 0;
  let orcMax = typeof cliente.orcamento_max === 'number' ? cliente.orcamento_max : 0;

  if (orcMin === 0 && orcMax === 0 && cliente.faixa_orcamento) {
    const parsedLegacy = parseLegacyBudget(cliente.faixa_orcamento);
    orcMin = parsedLegacy.min;
    orcMax = parsedLegacy.max;
  }

  // Preferências
  const prefTipo = normalize(cliente.preferencia_tipo || '');
  const prefQuartos = typeof cliente.preferencia_quartos === 'number' ? cliente.preferencia_quartos : 0;
  const prefFinalidade = cliente.preferencia_finalidade || 'ambos';

  const imoveisDisponiveis = todosImoveis.filter(
    (i) => i.status === 'disponivel' || i.status === 'reservado'
  );

  const matched: Imovel[] = [];

  for (const imovel of imoveisDisponiveis) {
    // 1. Imóvel explicitamente vinculado tem match imediato
    if (cliente.imovel_interesse_id && imovel.id === cliente.imovel_interesse_id) {
      matched.push(imovel);
      continue;
    }

    // 2. Filtro Rígido de Finalidade (Venda / Locação)
    if (prefFinalidade === 'venda' && imovel.finalidade === 'locacao') {
      continue;
    }
    if (prefFinalidade === 'locacao' && imovel.finalidade === 'venda') {
      continue;
    }

    // 3. Determina o valor do imóvel aplicável
    let valorImovel: number | null = null;
    if (prefFinalidade === 'venda') {
      valorImovel = imovel.valor_venda ?? null;
    } else if (prefFinalidade === 'locacao') {
      valorImovel = imovel.valor_locacao ?? null;
    } else {
      // Ambos ou não especificado: usa o valor disponível
      valorImovel = imovel.valor_venda || imovel.valor_locacao || null;
    }

    // 4. Filtro Rígido de Orçamento (Valor Mínimo e Máximo)
    if (orcMin > 0 || orcMax > 0) {
      if (valorImovel === null || valorImovel <= 0) {
        // Se o cliente definiu orçamento e o imóvel não tem preço informado, descarta
        continue;
      }
      if (orcMin > 0 && valorImovel < orcMin) {
        continue;
      }
      if (orcMax > 0 && valorImovel > orcMax) {
        continue;
      }
    }

    // 5. Filtro Rígido de Tipo de Imóvel
    if (prefTipo && prefTipo !== 'todos' && prefTipo !== 'qualquer') {
      const imovelTipoNorm = normalize(imovel.tipo);
      const isTipoCompativel =
        imovelTipoNorm === prefTipo ||
        (prefTipo === 'casa' && imovelTipoNorm === 'sobrado') ||
        (prefTipo === 'sobrado' && imovelTipoNorm === 'casa') ||
        (prefTipo === 'apartamento' && (imovelTipoNorm === 'studio' || imovelTipoNorm === 'cobertura'));

      if (!isTipoCompativel) {
        continue;
      }
    }

    // 6. Filtro Rígido de Mínimo de Quartos
    if (prefQuartos > 0) {
      const quartosImovel = imovel.quartos || 0;
      if (quartosImovel < prefQuartos) {
        continue;
      }
    }

    matched.push(imovel);
  }

  // Ordena com o imóvel de interesse prioritário no topo
  return matched.sort((a, b) => {
    if (a.id === cliente.imovel_interesse_id) return -1;
    if (b.id === cliente.imovel_interesse_id) return 1;
    return 0;
  });
}
