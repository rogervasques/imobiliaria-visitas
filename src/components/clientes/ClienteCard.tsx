'use client';

import React from 'react';
import { Cliente } from '@/types';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { User, Phone, Mail, MessageSquare, Tag, DollarSign, CalendarCheck } from 'lucide-react';
import { formatPhone, getInitials, getWhatsAppDirectLink } from '@/lib/utils';
import { useData } from '@/context/DataContext';

interface ClienteCardProps {
  cliente: Cliente;
  onClick?: (cliente: Cliente) => void;
  onEdit?: (cliente: Cliente) => void;
}

export function ClienteCard({ cliente, onClick, onEdit }: ClienteCardProps) {
  const { visitas } = useData();

  const statusVariants = {
    ativo: 'success' as const,
    negociando: 'warning' as const,
    fechado: 'purple' as const,
    inativo: 'default' as const,
  };

  const directWhatsApp = getWhatsAppDirectLink(
    cliente.telefone,
    `Olá, ${cliente.nome}! Tudo bem? Sou da EasyMob e gostaria de falar sobre as opções de imóveis para você.`
  );

  const totalVisitasCliente = visitas.filter((v) => v.cliente_id === cliente.id).length;

  return (
    <Card
      onClick={() => onClick?.(cliente)}
      className="hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col justify-between"
    >
      <CardContent className="p-4 sm:p-5 space-y-3.5">
        {/* Topo: Avatar, Nome e Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-emerald-600/20 shrink-0 group-hover:scale-105 transition-transform">
              {getInitials(cliente.nome)}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {cliente.nome}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span className="font-mono">{formatPhone(cliente.telefone)}</span>
              </div>
            </div>
          </div>

          <Badge variant={statusVariants[cliente.status] || 'default'} size="sm">
            {cliente.status.toUpperCase()}
          </Badge>
        </div>

        {/* Informações de Perfil e Orçamento */}
        <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
          {cliente.perfil_interesse && (
            <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
              <Tag className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="font-medium line-clamp-1">{cliente.perfil_interesse}</span>
            </div>
          )}

          {cliente.faixa_orcamento && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Orçamento: <strong>{cliente.faixa_orcamento}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800">
            <CalendarCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>{totalVisitasCliente} visita{totalVisitasCliente === 1 ? '' : 's'} no histórico</span>
          </div>
        </div>

        {/* Contato & Botão WhatsApp */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
            Ver detalhes do cliente →
          </span>

          <a
            href={directWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="whatsapp" size="sm" className="text-xs font-semibold shadow-xs">
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              WhatsApp
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
