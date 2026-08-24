import { Imovel } from '@/types';

// Cache em memória para evitar requisições redundantes ao encurtador
const urlShortCache = new Map<string, string>();

/**
 * Formata o endereço completo do imóvel para busca precisa no Google Maps
 */
export function formatEnderecoCompleto(imovel?: Partial<Imovel> | null | undefined): string {
  if (!imovel) return '';
  const partes: string[] = [];

  if (imovel.endereco) {
    let ruaNum = imovel.endereco;
    if (imovel.numero) ruaNum += `, ${imovel.numero}`;
    partes.push(ruaNum);
  }

  if (imovel.bairro) {
    partes.push(imovel.bairro);
  }

  const cidadeEstado = [imovel.cidade, imovel.estado].filter(Boolean).join(' - ');
  if (cidadeEstado) {
    partes.push(cidadeEstado);
  }

  if (imovel.cep) {
    partes.push(`CEP ${imovel.cep}`);
  }

  return partes.join(', ') || 'Local a confirmar';
}

/**
 * Retorna a URL pública de busca do Google Maps para o endereço fornecido
 * https://www.google.com/maps/search/?api=1&query=ENDERECO
 */
export function getGoogleMapsSearchUrl(enderecoOuImovel?: string | Partial<Imovel> | null | undefined): string {
  if (!enderecoOuImovel) {
    return 'https://www.google.com/maps';
  }

  const enderecoTexto =
    typeof enderecoOuImovel === 'string'
      ? enderecoOuImovel
      : formatEnderecoCompleto(enderecoOuImovel);

  if (!enderecoTexto || enderecoTexto === 'Local a confirmar') {
    return 'https://www.google.com/maps';
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoTexto)}`;
}

/**
 * Retorna a URL de direções/rotas do Google Maps a partir da localização atual até o imóvel
 * https://www.google.com/maps/dir/?api=1&destination=ENDERECO
 */
export function getGoogleMapsDirectionsUrl(enderecoOuImovel?: string | Partial<Imovel> | null | undefined): string {
  if (!enderecoOuImovel) {
    return 'https://www.google.com/maps';
  }

  const enderecoTexto =
    typeof enderecoOuImovel === 'string'
      ? enderecoOuImovel
      : formatEnderecoCompleto(enderecoOuImovel);

  if (!enderecoTexto || enderecoTexto === 'Local a confirmar') {
    return 'https://www.google.com/maps';
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(enderecoTexto)}`;
}

/**
 * Retorna o link curto encurtado do Google Maps para o imóvel/endereço
 */
export async function getShortMapsUrl(enderecoOuImovel?: string | Partial<Imovel> | null | undefined): Promise<string> {
  const mapsUrl = getGoogleMapsSearchUrl(enderecoOuImovel);
  return await shortenUrl(mapsUrl);
}

/**
 * Encurta uma URL longa usando TinyURL com fallback para is.gd
 * Retorna link curto como https://tinyurl.com/xyz123
 */
export async function shortenUrl(longUrl: string): Promise<string> {
  if (!longUrl || longUrl.length < 30) return longUrl;

  // 1. Checa cache em memória
  if (urlShortCache.has(longUrl)) {
    return urlShortCache.get(longUrl)!;
  }

  try {
    // 2. Tenta TinyURL com timeout de 3 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'EasyMob/1.0' },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const shortUrl = (await response.text()).trim();
      if (shortUrl.startsWith('http://') || shortUrl.startsWith('https://')) {
        urlShortCache.set(longUrl, shortUrl);
        return shortUrl;
      }
    }
  } catch {
    // Falha silenciosa no TinyURL, tenta fallback
  }

  try {
    // 3. Fallback: is.gd
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'EasyMob/1.0' },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const shortUrl = (await response.text()).trim();
      if (shortUrl.startsWith('http://') || shortUrl.startsWith('https://')) {
        urlShortCache.set(longUrl, shortUrl);
        return shortUrl;
      }
    }
  } catch {
    // Falha silenciosa
  }

  // 4. Retorna a URL original se nenhum encurtador respondeu
  return longUrl;
}
