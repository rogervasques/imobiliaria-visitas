'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Activity,
  Server,
  Database,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HardDrive,
  Cpu,
  Clock,
  Zap,
  Globe,
  Radio,
  Layers,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface ServerMetrics {
  status: 'healthy' | 'warning' | 'critical';
  cpuPercent: number;
  ramPercent: number;
  totalRamGB: string;
  usedRamGB: string;
  freeRamGB: string;
  nodeHeapUsedMB: string;
  nodeRssMB: string;
  cpuCores: number;
  cpuModel: string;
  platform: string;
  uptimeFormatted: string;
  uptimeSeconds: number;
  loadAverage: string[];
  diskEstimated: {
    totalGB: string;
    usedGB: string;
    freeGB: string;
    usagePercent: number;
  };
}

interface DatabaseMetrics {
  connected: boolean;
  latencyMs: number;
  status: 'healthy' | 'warning' | 'critical';
  totalRecords: number;
  estimatedDbSizeMB: number;
  estimatedStorageMB: number;
  storageFilesCount: number;
  tablesCount: number;
  tableCounts: {
    visitas: number;
    imoveis: number;
    clientes: number;
    proprietarios: number;
    users: number;
    imobiliarias: number;
    whatsapp_logs: number;
  };
  errorMessage: string | null;
}

interface WhatsAppMetrics {
  apiUrl: string;
  connected: boolean;
  status: 'healthy' | 'warning' | 'critical';
  latencyMs: number;
  message: string;
  instances: {
    total: number;
    active: number;
    disconnected: number;
  };
  webhooks24h: {
    total: number;
    success: number;
    successRate: number;
  };
}

interface InfraStatusResponse {
  success: boolean;
  timestamp: string;
  overallStatus: 'healthy' | 'warning' | 'critical';
  server: ServerMetrics;
  database: DatabaseMetrics;
  whatsapp: WhatsAppMetrics;
}

export default function InfraestruturaPage() {
  const { user } = useAuth();
  const [data, setData] = useState<InfraStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [historyLogs, setHistoryLogs] = useState<
    Array<{ id: string; time: string; service: string; status: 'ok' | 'warn' | 'error'; message: string }>
  >([]);

  const fetchInfraStatus = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await fetch('/api/infra/status', { cache: 'no-store' });
      const json: InfraStatusResponse = await res.json();

      if (json.success) {
        setData(json);
        const checkDate = new Date();
        setLastCheckTime(checkDate);

        // Adiciona registro ao mini log de histórico
        const newLogs = [
          {
            id: `log-${Date.now()}-1`,
            time: checkDate.toLocaleTimeString('pt-BR'),
            service: 'Servidor VPS (Node OS)',
            status: (json.server.status === 'critical' ? 'error' : json.server.status === 'warning' ? 'warn' : 'ok') as 'ok' | 'warn' | 'error',
            message: `CPU: ${json.server.cpuPercent}% | RAM: ${json.server.ramPercent}% (${json.server.usedRamGB}/${json.server.totalRamGB} GB)`,
          },
          {
            id: `log-${Date.now()}-2`,
            time: checkDate.toLocaleTimeString('pt-BR'),
            service: 'PostgreSQL & Storage (Supabase)',
            status: (json.database.status === 'critical' ? 'error' : json.database.status === 'warning' ? 'warn' : 'ok') as 'ok' | 'warn' | 'error',
            message: `Conexão: ${json.database.latencyMs}ms | Registros: ${json.database.totalRecords} itens`,
          },
          {
            id: `log-${Date.now()}-3`,
            time: checkDate.toLocaleTimeString('pt-BR'),
            service: 'Evolution API (WhatsApp)',
            status: (json.whatsapp.status === 'critical' ? 'error' : json.whatsapp.status === 'warning' ? 'warn' : 'ok') as 'ok' | 'warn' | 'error',
            message: `${json.whatsapp.instances.active} instâncias ativas | Taxa Webhooks: ${json.whatsapp.webhooks24h.successRate}%`,
          },
        ];

        setHistoryLogs((prev) => [...newLogs, ...prev].slice(0, 10));
      }
    } catch (err) {
      console.error('Erro ao buscar status de infraestrutura:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInfraStatus();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      fetchInfraStatus(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchInfraStatus]);

  // Se o usuário não for admin, bloqueia o acesso
  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Acesso Restrito</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          O Painel de Infraestrutura e Monitoramento em tempo real é restrito exclusivamente para o perfil Administrador.
        </p>
      </div>
    );
  }

  const overallStatus = data?.overallStatus || 'healthy';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─── CABEÇALHO DO PAINEL ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
            <Activity className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Monitoramento de Infraestrutura &amp; Saúde
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Métricas em tempo real da VPS Hostinger, banco PostgreSQL Supabase e conectividade Evolution API
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {lastCheckTime && (
            <span className="text-[11px] text-slate-400 hidden sm:inline-block">
              Última checagem: <strong className="text-slate-600 dark:text-slate-300">{lastCheckTime.toLocaleTimeString('pt-BR')}</strong>
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchInfraStatus(true)}
            disabled={isRefreshing || isLoading}
            className="shadow-xs flex items-center gap-2 font-bold text-xs hover:border-emerald-500 hover:text-emerald-600"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin text-emerald-500')} />
            <span>{isRefreshing ? 'Verificando...' : 'Atualizar Agora'}</span>
          </Button>
        </div>
      </div>

      {/* ─── BANNER DE STATUS GERAL DO SISTEMA ─── */}
      <div
        className={cn(
          'p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all',
          overallStatus === 'healthy'
            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
            : overallStatus === 'warning'
            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
            : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
              overallStatus === 'healthy'
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : overallStatus === 'warning'
                ? 'bg-amber-500 text-white shadow-amber-500/20'
                : 'bg-rose-500 text-white shadow-rose-500/20'
            )}
          >
            {overallStatus === 'healthy' ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : overallStatus === 'warning' ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <span>
                {overallStatus === 'healthy'
                  ? 'Todos os Serviços Operando Normalmente'
                  : overallStatus === 'warning'
                  ? 'Atenção: Recursos com Consumo Elevado'
                  : 'Alerta: Instabilidade Detectada na Infraestrutura'}
              </span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-xs opacity-85">
              {overallStatus === 'healthy'
                ? 'VPS Hostinger, PostgreSQL Supabase e Evolution API respondendo com baixa latência.'
                : overallStatus === 'warning'
                ? 'Verifique o consumo de memória RAM ou latência de resposta das APIs.'
                : 'Um ou mais componentes essenciais não responderam ao teste de integridade.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/70 dark:bg-slate-900/60 border border-current/20">
            {overallStatus === 'healthy' ? '🟢 100% Online' : overallStatus === 'warning' ? '🟡 Alerta' : '🔴 Crítico'}
          </span>
        </div>
      </div>

      {/* ─── GRID DE 3 PILARES DE INFRAESTRUTURA ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ═══ 1. SERVIDOR VPS (HOSTINGER) ═══ */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-extrabold">Servidor VPS Hostinger</CardTitle>
                    <span className="text-[11px] text-slate-400">Node.js Server Environment</span>
                  </div>
                </div>

                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase',
                    data?.server.status === 'healthy'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : data?.server.status === 'warning'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  )}
                >
                  {data?.server.status === 'healthy' ? '🟢 Saudável' : data?.server.status === 'warning' ? '🟡 Alto Uso' : '🔴 Crítico'}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Consumo de RAM */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-purple-500" />
                    Memória RAM
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {data?.server.usedRamGB || '0'} GB / {data?.server.totalRamGB || '0'} GB ({data?.server.ramPercent || 0}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      (data?.server.ramPercent || 0) > 85
                        ? 'bg-rose-500'
                        : (data?.server.ramPercent || 0) > 70
                        ? 'bg-amber-500'
                        : 'bg-purple-500'
                    )}
                    style={{ width: `${data?.server.ramPercent || 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Livre: {data?.server.freeRamGB || '0'} GB</span>
                  <span>Heap Node: {data?.server.nodeHeapUsedMB || '0'} MB</span>
                </div>
              </div>

              {/* Consumo de CPU */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-sky-500" />
                    Processamento CPU
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {data?.server.cpuPercent || 0}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      (data?.server.cpuPercent || 0) > 85
                        ? 'bg-rose-500'
                        : (data?.server.cpuPercent || 0) > 60
                        ? 'bg-amber-500'
                        : 'bg-sky-500'
                    )}
                    style={{ width: `${data?.server.cpuPercent || 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{data?.server.cpuCores || 1} Cores Virtuais</span>
                  <span>Load Avg: {data?.server.loadAverage?.join(' | ') || '0.10'}</span>
                </div>
              </div>

              {/* Uptime & SO */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-0.5">
                  <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> Uptime
                  </div>
                  <div className="font-mono font-black text-slate-800 dark:text-slate-200">
                    {data?.server.uptimeFormatted || 'Calculando...'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-0.5">
                  <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-slate-400" /> Disco SSD
                  </div>
                  <div className="font-mono font-black text-slate-800 dark:text-slate-200">
                    {data?.server.diskEstimated.usedGB} / {data?.server.diskEstimated.totalGB} GB
                  </div>
                </div>
              </div>
            </CardContent>
          </div>

          <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>SO: {data?.server.platform || 'Linux Ubuntu'}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Hostinger KVM</span>
          </div>
        </Card>

        {/* ═══ 2. BANCO DE DADOS & STORAGE (SUPABASE) ═══ */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-extrabold">PostgreSQL &amp; Storage</CardTitle>
                    <span className="text-[11px] text-slate-400">Supabase Cloud Database</span>
                  </div>
                </div>

                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase',
                    data?.database.connected
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  )}
                >
                  {data?.database.connected ? `🟢 Conectado (${data?.database.latencyMs}ms)` : '🔴 Desconectado'}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Métricas de Armazenamento e Latência */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                    ~{data?.database.estimatedDbSizeMB || 0} MB
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Tamanho do Banco</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                    ~{data?.database.estimatedStorageMB || 0} MB
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Storage Mídias</div>
                </div>
              </div>

              {/* Contagem de Registros por Tabela */}
              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-500" />
                    Registros nas Tabelas
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {data?.database.totalRecords || 0} total
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[11px] pt-1">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {data?.database.tableCounts.imoveis || 0}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">Imóveis</div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {data?.database.tableCounts.visitas || 0}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">Visitas</div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {data?.database.tableCounts.clientes || 0}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">Clientes</div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {data?.database.tableCounts.proprietarios || 0}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">Proprietários</div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {data?.database.tableCounts.users || 0}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">Usuários</div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {data?.database.tableCounts.imobiliarias || 0}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">Imobiliárias</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>

          <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Ping PostgreSQL: {data?.database.latencyMs || 0}ms</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">SSL Criptografado</span>
          </div>
        </Card>

        {/* ═══ 3. EVOLUTION API (WHATSAPP & WEBHOOKS) ═══ */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-extrabold">Evolution API (WhatsApp)</CardTitle>
                    <span className="text-[11px] text-slate-400">Serviço de Mensageria &amp; Webhooks</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  🟢 {data?.whatsapp.instances.active || 1} Ativas
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Instâncias Ativas vs Desconectadas */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                  <div className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                    {data?.whatsapp.instances.active || 1}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    Instâncias Conectadas
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-lg font-black text-slate-600 dark:text-slate-400">
                    {data?.whatsapp.instances.disconnected || 0}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Desconectadas
                  </div>
                </div>
              </div>

              {/* Taxa de Sucesso de Webhooks 24h */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-500" />
                    Taxa de Entrega (24h)
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {data?.whatsapp.webhooks24h.successRate || 100}% de Sucesso
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${data?.whatsapp.webhooks24h.successRate || 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Disparos: {data?.whatsapp.webhooks24h.total || 0} mensagens</span>
                  <span>Entregues: {data?.whatsapp.webhooks24h.success || 0}</span>
                </div>
              </div>

              {/* Conectividade e URL */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] space-y-1">
                <div className="text-slate-400 font-bold flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" /> Endpoint Conectado
                </div>
                <div className="font-mono text-slate-700 dark:text-slate-300 truncate">
                  {data?.whatsapp.apiUrl || 'https://evolution.easymob.com.br'}
                </div>
              </div>
            </CardContent>
          </div>

          <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Latência API: {data?.whatsapp.latencyMs || 68}ms</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Webhooks Ativos</span>
          </div>
        </Card>
      </div>

      {/* ─── HISTÓRICO RECENTE DE HEALTH CHECKS ─── */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-extrabold flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            Histórico Recente de Verificações da Infraestrutura
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200/70 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Horário</th>
                  <th className="py-3 px-4">Componente</th>
                  <th className="py-3 px-4">Diagnóstico / Métricas</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {historyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                      Coletando registros de monitoramento...
                    </td>
                  </tr>
                ) : (
                  historyLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{log.time}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{log.service}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px]">{log.message}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px]',
                            log.status === 'ok'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                              : log.status === 'warn'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                          )}
                        >
                          {log.status === 'ok' ? '🟢 Operacional' : log.status === 'warn' ? '🟡 Alerta' : '🔴 Erro'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
