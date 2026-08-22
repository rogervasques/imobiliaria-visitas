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

