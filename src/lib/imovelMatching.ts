import { Cliente, Imovel } from '@/types';

/**
 * Normaliza string removendo acentos e convertendo para minúsculas
 */
function normalize(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Calcula os imóveis compatíveis com o perfil e orçamento do cliente
 */
export function getImoveisCompativeis(cliente: Cliente, todosImoveis: Imovel[]): Imovel[] {
  if (!cliente || !todosImoveis || todosImoveis.length === 0) return [];

  const imoveisDisponiveis = todosImoveis.filter((i) => i.status === 'disponivel' || i.status === 'reservado');
  const matched = new Set<string>();
  const results: Imovel[] = [];

  // 1. Imóvel explicitamente vinculado
  if (cliente.imovel_interesse_id) {
    const imovelDireto = imoveisDisponiveis.find((i) => i.id === cliente.imovel_interesse_id);
    if (imovelDireto) {
      matched.add(imovelDireto.id);
      results.push(imovelDireto);
    }
  }

  // 2. Extração de palavras-chave do perfil de interesse
  const perfilTexto = normalize(cliente.perfil_interesse || '');

  // Detecta tipo de imóvel procurado
  const tipos = ['apartamento', 'casa', 'cobertura', 'comercial', 'terreno', 'studio', 'sobrado'];
  const tiposEncontrados = tipos.filter((t) => perfilTexto.includes(t));

  // Detecta número de quartos
  let quartosBuscados: number | null = null;
  const matchQuartos = perfilTexto.match(/(\d+)\s*(?:dorms?|quartos?|suites?)/i);
  if (matchQuartos) {
    quartosBuscados = parseInt(matchQuartos[1], 10);
  }

  for (const imovel of imoveisDisponiveis) {
    if (matched.has(imovel.id)) continue;

    let score = 0;
    const imovelTexto = normalize(`${imovel.titulo} ${imovel.bairro} ${imovel.cidade} ${imovel.descricao_comercial || ''} ${imovel.tipo}`);

    // Match por tipo
    if (tiposEncontrados.length > 0) {
      if (tiposEncontrados.includes(imovel.tipo) || tiposEncontrados.some((t) => imovelTexto.includes(t))) {
        score += 3;
      }
    }

    // Match por bairro ou localização
    const bairrosConhecidos = [
      'moema', 'pinheiros', 'jardins', 'itaim', 'vila mariana', 'bela vista', 'perdizes',
      'alphaville', 'granja viana', 'barra', 'jurere', 'florianopolis', 'porto alegre',
      'petropolis', 'centro', 'flamboyant', 'beira-mar', 'santana', 'botafogo', 'flamengo',
      'savassi', 'lourdes', 'cabral', 'bueno', 'marista', 'taquaral'
    ];
    for (const b of bairrosConhecidos) {
      if (perfilTexto.includes(b) && imovelTexto.includes(b)) {
        score += 4;
        break;
      }
    }

    // Match por número de quartos
    if (quartosBuscados !== null && imovel.quartos) {
      if (imovel.quartos === quartosBuscados || imovel.quartos >= quartosBuscados) {
        score += 2;
      }
    }

    if (score >= 3) {
      matched.add(imovel.id);
      results.push(imovel);
    }
  }

  // Se houver poucos matches específicos, complementa com os primeiros imóveis do mesmo tenant para garantir relevância
  if (results.length === 0 && imoveisDisponiveis.length > 0) {
    return imoveisDisponiveis.slice(0, 3);
  }

  return results;
}
