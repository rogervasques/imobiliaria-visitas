import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um número para o padrão monetário BRL (R$ 1.500.000,00)
 */
export function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null) return 'Sob consulta';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formata um número de telefone brasileiro para (11) 98765-4321 ou (11) 8765-4321
 */
export function formatPhone(phone?: string | null): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    const ddd = cleaned.slice(2, 4);
    const rest = cleaned.slice(4);
    if (rest.length === 9) {
      return `+55 (${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
    }
  }
  return phone;
}

/**
 * Limpa o telefone para o formato padrão do WhatsApp (com código do país 55)
 */
export function cleanPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) {
    return digits;
  }
  if (digits.length >= 10) {
    return `55${digits}`;
  }
  return digits;
}

/**
 * Retorna link direto para conversar no WhatsApp Web / App
 */
export function getWhatsAppDirectLink(phone: string, text?: string): string {
  const clean = cleanPhoneForWhatsApp(phone);
  const encodedText = text ? `&text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${clean}?text=${encodedText ? encodedText.slice(6) : ''}`;
}

/**
 * Formata uma data ISO para o formato pt-BR (ex: "20/08/2026 às 15:30")
 */
export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} às ${hours}:${minutes}`;
}

/**
 * Formata apenas a data (ex: "20/08/2026")
 */
export function formatDate(isoString?: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formata apenas o horário (ex: "15:30")
 */
export function formatTime(isoString?: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

export const FOTOS_IMOVEIS_PADRAO = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200&auto=format&fit=crop&q=80'
];

/**
 * Retorna sempre uma lista de 5 fotos de alta resolução para qualquer imóvel
 */
export function getImovelFotosList(imovel?: { imagem_url?: string | null; fotos_urls?: string[] | null; id?: string; codigo?: string } | null): string[] {
  if (!imovel) return FOTOS_IMOVEIS_PADRAO.slice(0, 5);

  const existing = (imovel.fotos_urls || []).filter(Boolean);
  if (existing.length >= 5) {
    return existing.slice(0, 5);
  }

  const main = imovel.imagem_url || existing[0] || FOTOS_IMOVEIS_PADRAO[0];
  const seed = (imovel.id || imovel.codigo || 'imovel').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const startIdx = Math.abs(seed) % (FOTOS_IMOVEIS_PADRAO.length - 5);
  const extraPool = FOTOS_IMOVEIS_PADRAO.slice(startIdx, startIdx + 8).filter(url => url !== main && !existing.includes(url));

  const combined = [main, ...existing.filter(u => u !== main), ...extraPool];
  return combined.slice(0, 5);
}

/**
 * Retorna data legível amigável (Hoje, Amanhã, Ontem ou 20 de Agosto)
 */
export function formatFriendlyDate(isoString?: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return `Hoje às ${formatTime(isoString)}`;
  if (diffDays === 1) return `Amanhã às ${formatTime(isoString)}`;
  if (diffDays === -1) return `Ontem às ${formatTime(isoString)}`;

  return formatDateTime(isoString);
}

/**
 * Gera iniciais do nome para avatares
 */
export function getInitials(name?: string | null): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Gera o identificador dinâmico de instância do corretor/usuário
 */
export function generateInstanceName(userId?: string | null): string {
  if (!userId) return 'easymob';
  const sanitized = String(userId).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  return `easymob_${sanitized}`;
}

