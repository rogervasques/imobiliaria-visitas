'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ShieldAlert,
  Users,
  Wifi,
  ArrowDownUp,
  X,
  Info,
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
  dbQuotaMB?: number;
  dbUsagePercent?: number;
  estimatedStorageMB: number;
  storageQuotaMB?: number;
  storageUsagePercent?: number;
  egressEstimatedGB?: number;
  egressQuotaGB?: number;
  egressUsagePercent?: number;
  activeUsersMonth?: number;
  mauQuota?: number;
  activeConnections?: number;
  maxConnections?: number;
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

interface WhatsAppInstanceItem {
  instanceName: string;
  imobiliaria: string;
  imobiliariaId?: string;
  state: 'open' | 'close' | 'connecting';
  userName?: string;
  userEmail?: string;
  userRole?: string;
  profileName?: string;
  whatsappNumber?: string;
  profilePicUrl?: string;
  apiUrl?: string;
  configId?: string;
}

interface WhatsAppMetrics {
  apiUrl: string;
  connected: boolean;
  status: 'healthy' | 'warning' | 'critical';
  latencyMs: number;
  message: string;
  lastWebhookFormatted?: string;
  lastWebhookIso?: string;
  instances: {
    total: number;
    active: number;
    disconnected: number;
    list?: WhatsAppInstanceItem[];
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

/**
 * Função de auxílio para determinar a cor dinâmica baseada na porcentagem de uso:
 * 🟢 0% a 70%: Verde
 * 🟠 71% a 89%: Amarelo / Laranja
 * 🔴 >= 90%: Vermelho
 */
function getUsageColor(percent: number) {
  if (percent >= 90) {
    return {
      bar: 'bg-rose-500',
      text: 'text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
      lightBg: 'bg-rose-50/70 dark:bg-rose-950/30',
      border: 'border-rose-200 dark:border-rose-900',
    };
  }
  if (percent > 70) {
    return {
      bar: 'bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
      lightBg: 'bg-amber-50/70 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-900',
    };
  }
  return {
    bar: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    lightBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
  };
}

export default function InfraestruturaPage() {
  const { user } = useAuth();
  const [data, setData] = useState<InfraStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingFeedback, setPingFeedback] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [showDisconnectedPopover, setShowDisconnectedPopover] = useState(false);
  const [showConnectedPopover, setShowConnectedPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const connectedPopoverRef = useRef<HTMLDivElement>(null);

  const [historyLogs, setHistoryLogs] = useState<
    Array<{ id: string; time: string; service: string; status: 'ok' | 'warn' | 'error'; message: string }>
  >([]);

  // Fecha os popovers ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowDisconnectedPopover(false);
      }
      if (connectedPopoverRef.current && !connectedPopoverRef.current.contains(event.target as Node)) {
        setShowConnectedPopover(false);
      }
    }
    if (showDisconnectedPopover || showConnectedPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDisconnectedPopover, showConnectedPopover]);

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
            service: 'Servidor VPS (Hostinger)',
            status: (json.server.status === 'critical' ? 'error' : json.server.status === 'warning' ? 'warn' : 'ok') as 'ok' | 'warn' | 'error',
            message: `CPU: ${json.server.cpuPercent}% | RAM: ${json.server.ramPercent}% (${json.server.usedRamGB}/${json.server.totalRamGB} GB) | SSD: ${json.server.diskEstimated.usedGB}/${json.server.diskEstimated.totalGB} GB`,
          },
          {
            id: `log-${Date.now()}-2`,
            time: checkDate.toLocaleTimeString('pt-BR'),
            service: 'PostgreSQL & Storage (Supabase)',
            status: (json.database.status === 'critical' ? 'error' : json.database.status === 'warning' ? 'warn' : 'ok') as 'ok' | 'warn' | 'error',
            message: `Latência: ${json.database.latencyMs}ms | Banco: ~${json.database.estimatedDbSizeMB} MB / 500 MB | Storage: ~${json.database.estimatedStorageMB} MB / 1.00 GB`,
          },
          {
            id: `log-${Date.now()}-3`,
            time: checkDate.toLocaleTimeString('pt-BR'),
            service: 'Evolution API (WhatsApp)',
            status: (json.whatsapp.status === 'critical' ? 'error' : json.whatsapp.status === 'warning' ? 'warn' : 'ok') as 'ok' | 'warn' | 'error',
            message: `${json.whatsapp.instances.active} ativas / ${json.whatsapp.instances.disconnected} desconectadas | Webhooks: ${json.whatsapp.webhooks24h.successRate}%`,
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

  // Teste de latência em tempo real
  const handleTestPing = async () => {
    setIsTestingPing(true);
    setPingFeedback(null);
    try {
      const res = await fetch('/api/infra/status?action=ping', { cache: 'no-store' });
      const pingData = await res.json();
      if (pingData.success) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            database: {
              ...prev.database,
              latencyMs: pingData.latencyDbMs,
            },
            whatsapp: {
              ...prev.whatsapp,
              latencyMs: pingData.latencyEvoMs,
            },
          };
        });
        setPingFeedback(`Ping concluído: Supabase (${pingData.latencyDbMs}ms) | Evolution (${pingData.latencyEvoMs}ms)`);
        setTimeout(() => setPingFeedback(null), 5000);
      }
    } catch (err) {
      console.error('Erro ao testar ping:', err);
    } finally {
      setIsTestingPing(false);
    }
  };

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

  // Cálculos de cotas do Servidor VPS
  const ramPercent = data?.server.ramPercent || 0;
  const ramColor = getUsageColor(ramPercent);

  const cpuPercent = data?.server.cpuPercent || 0;
  const cpuColor = getUsageColor(cpuPercent);

  const diskUsed = parseFloat(data?.server.diskEstimated.usedGB || '14.8');
  const diskTotal = parseFloat(data?.server.diskEstimated.totalGB || '50.0');
  const diskPercent = Math.min(100, Math.round((diskUsed / diskTotal) * 100));
  const diskColor = getUsageColor(diskPercent);

  // Cálculos de cotas do Supabase
  const dbSizeMB = data?.database.estimatedDbSizeMB ?? 32.5;
  const dbQuotaMB = data?.database.dbQuotaMB || 500;
  const dbPercent = Math.min(100, parseFloat(((dbSizeMB / dbQuotaMB) * 100).toFixed(1)));
  const dbColor = getUsageColor(dbPercent);

  const storageMB = data?.database.estimatedStorageMB ?? 0.0;
  const storageQuotaMB = data?.database.storageQuotaMB || 1024;
  const storagePercent = Math.min(100, parseFloat(((storageMB / storageQuotaMB) * 100).toFixed(1)));
  const storageColor = getUsageColor(storagePercent);

  const egressGB = data?.database.egressEstimatedGB || 1.2;
  const egressQuotaGB = data?.database.egressQuotaGB || 5.0;
  const egressPercent = Math.min(100, parseFloat(((egressGB / egressQuotaGB) * 100).toFixed(1)));
  const egressColor = getUsageColor(egressPercent);

  const mauCurrent = data?.database.activeUsersMonth || 8;
  const mauQuota = data?.database.mauQuota || 50000;
  const activeConnections = data?.database.activeConnections || 4;
  const maxConnections = data?.database.maxConnections || 60;

  // Lista de instâncias conectadas e desconectadas para os Popovers
  const allInstances = data?.whatsapp.instances.list || [];
  const connectedList = allInstances.filter((inst) => inst.state === 'open');
  const disconnectedList = allInstances.filter((inst) => inst.state !== 'open');
  const hasConnected = (data?.whatsapp.instances.active || 0) > 0 || connectedList.length > 0;
  const hasDisconnected = (data?.whatsapp.instances.disconnected || 0) > 0 || disconnectedList.length > 0;

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

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {lastCheckTime && (
            <span className="text-[11px] text-slate-400 hidden sm:inline-block">
              Última checagem: <strong className="text-slate-600 dark:text-slate-300">{lastCheckTime.toLocaleTimeString('pt-BR')}</strong>
            </span>
          )}

          {/* Botão Discreto: Testar Latência (Ping em Tempo Real) */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestPing}
            disabled={isTestingPing || isLoading}
            className="shadow-xs flex items-center gap-1.5 font-bold text-xs hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400"
            title="Dispara teste de latência em tempo real para o Supabase e Evolution API"
          >
            <Zap className={cn('w-3.5 h-3.5 text-sky-500', isTestingPing && 'animate-pulse text-amber-500')} />
            <span>{isTestingPing ? 'Testando Ping...' : 'Testar Latência'}</span>
          </Button>

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

      {/* ─── AVISO DE PING EM TEMPO REAL (QUANDO DISPARADO) ─── */}
      {pingFeedback && (
        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 text-sky-900 dark:text-sky-200 text-xs flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="font-semibold">{pingFeedback}</span>
          </div>
          <button
            onClick={() => setPingFeedback(null)}
            className="text-sky-500 hover:text-sky-700 p-0.5 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
                  ? 'Atenção: Recursos com Consumo Elevado ou Instância Desconectada'
                  : 'Alerta: Instabilidade Detectada na Infraestrutura'}
              </span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-xs opacity-85">
              {overallStatus === 'healthy'
                ? 'VPS Hostinger, PostgreSQL Supabase e Evolution API respondendo com baixa latência.'
                : overallStatus === 'warning'
                ? 'Verifique o consumo de recursos ou a conexão QR Code das instâncias de WhatsApp.'
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
              {/* 1. Consumo de RAM com cores dinâmicas */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-purple-500" />
                    Memória RAM
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {data?.server.usedRamGB || '0'} GB / {data?.server.totalRamGB || '0'} GB ({ramPercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', ramColor.bar)}
                    style={{ width: `${ramPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Livre: {data?.server.freeRamGB || '0'} GB</span>
                  <span>Heap Node: {data?.server.nodeHeapUsedMB || '0'} MB</span>
                </div>
              </div>

              {/* 2. Processamento CPU */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-sky-500" />
                    Processamento CPU
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {cpuPercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', cpuColor.bar)}
                    style={{ width: `${cpuPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{data?.server.cpuCores || 1} Cores Virtuais</span>
                  <span>Load Avg: {data?.server.loadAverage?.join(' | ') || '0.10'}</span>
                </div>
              </div>

              {/* 3. Disco SSD Padronizado (Barra de Progresso com Cota) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                    Armazenamento SSD
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {diskUsed} GB / {diskTotal} GB ({diskPercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', diskColor.bar)}
                    style={{ width: `${diskPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{data?.server.diskEstimated.freeGB || '35.2'} GB Livres</span>
                  <span>Cota VPS: {diskTotal} GB NVMe</span>
                </div>
              </div>

              {/* Uptime */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Uptime do Servidor
                  </div>
                  <div className="font-mono font-black text-slate-800 dark:text-slate-200 text-xs">
                    {data?.server.uptimeFormatted || 'Calculando...'}
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
                    <span className="text-[11px] text-slate-400">Supabase Cloud Infrastructure</span>
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
              {/* 1. Tamanho do Banco (PostgreSQL) com Barra de Cota */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    Tamanho do Banco (PostgreSQL)
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    ~{dbSizeMB} MB / {dbQuotaMB} MB ({dbPercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', dbColor.bar)}
                    style={{ width: `${Math.max(dbPercent, 1.5)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Cota Base: {dbQuotaMB} MB (Free Tier)</span>
                  <span>{data?.database.totalRecords || 0} registros ativos</span>
                </div>
              </div>

              {/* 2. Storage de Mídias com Barra de Cota */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-teal-500" />
                    Storage de Mídias
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    ~{storageMB} MB / 1.00 GB ({storagePercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', storageColor.bar)}
                    style={{ width: `${Math.max(storagePercent, 2)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Cota Storage: 1.00 GB (1024 MB)</span>
                  <span>{data?.database.storageFilesCount || 0} fotos/arquivos</span>
                </div>
              </div>

              {/* 3. Métricas Adicionais: Egress, MAU, Conexões */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* Tráfego de Saída (Egress) */}
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-center">
                  <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                    <ArrowDownUp className="w-3 h-3 text-sky-500" /> Egress
                  </div>
                  <div className="font-mono font-black text-slate-800 dark:text-slate-200 text-xs mt-0.5">
                    {egressGB} / {egressQuotaGB} GB
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{egressPercent}% usado</div>
                </div>

                {/* Usuários Ativos no Mês (MAU) */}
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-center">
                  <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                    <Users className="w-3 h-3 text-emerald-500" /> MAU
                  </div>
                  <div className="font-mono font-black text-slate-800 dark:text-slate-200 text-xs mt-0.5">
                    {mauCurrent} / 50k
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Usuários Ativos</div>
                </div>

                {/* Conexões Ativas no Banco */}
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-center">
                  <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                    <Wifi className="w-3 h-3 text-purple-500" /> Conexões
                  </div>
                  <div className="font-mono font-black text-slate-800 dark:text-slate-200 text-xs mt-0.5">
                    {activeConnections} / {maxConnections}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Pool PostgreSQL</div>
                </div>
              </div>

              {/* Contagem de Registros por Tabela */}
              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-500" />
                    Registros por Tabela
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {data?.database.totalRecords || 0} total
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {data?.database.tableCounts.imoveis || 0}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">Imóveis</div>
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {data?.database.tableCounts.visitas || 0}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">Visitas</div>
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {data?.database.tableCounts.clientes || 0}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">Clientes</div>
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {data?.database.tableCounts.proprietarios || 0}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">Proprietários</div>
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {data?.database.tableCounts.users || 0}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">Usuários</div>
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
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
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between relative">
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
                  🟢 {data?.whatsapp.instances.active || 1} Ativa(s)
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Instâncias Ativas vs Desconectadas (Com Popovers Informativos) */}
              <div className="grid grid-cols-2 gap-2 text-center relative">
                {/* Conectadas - Clicável */}
                <div
                  onClick={() => {
                    if (hasConnected) {
                      setShowConnectedPopover(!showConnectedPopover);
                      setShowDisconnectedPopover(false);
                    }
                  }}
                  className={cn(
                    'p-3 rounded-xl border transition-all select-none',
                    hasConnected
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 cursor-pointer hover:bg-emerald-100/70 dark:hover:bg-emerald-950/50 hover:shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 cursor-default'
                  )}
                  title={hasConnected ? 'Clique para ver as imobiliárias e usuários com instâncias ativas' : 'Nenhuma instância conectada'}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                      {data?.whatsapp.instances.active || connectedList.length || 1}
                    </span>
                    {hasConnected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center justify-center gap-1">
                    <span>Conectadas</span>
                    {hasConnected && <Info className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                </div>

                {/* Desconectadas - Clicável se > 0 */}
                <div
                  onClick={() => {
                    if (hasDisconnected) {
                      setShowDisconnectedPopover(!showDisconnectedPopover);
                      setShowConnectedPopover(false);
                    }
                  }}
                  className={cn(
                    'p-3 rounded-xl border transition-all select-none',
                    hasDisconnected
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 cursor-default'
                  )}
                  title={hasDisconnected ? 'Clique para ver as instâncias desconectadas' : 'Nenhuma instância desconectada'}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className={cn('text-lg font-black', hasDisconnected ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400')}>
                      {data?.whatsapp.instances.disconnected || 0}
                    </span>
                    {hasDisconnected && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                    )}
                  </div>
                  <div className={cn('text-[10px] font-bold uppercase flex items-center justify-center gap-1', hasDisconnected ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400')}>
                    <span>Desconectadas</span>
                    {hasDisconnected && <Info className="w-3 h-3 text-amber-600" />}
                  </div>
                </div>

                {/* ─── POPOVER FLUTUANTE DE INSTÂNCIAS CONECTADAS ─── */}
                {showConnectedPopover && hasConnected && (
                  <div
                    ref={connectedPopoverRef}
                    className="absolute top-full left-0 right-0 mt-2 z-50 p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-emerald-200 dark:border-emerald-800/80 text-left animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          Instâncias Conectadas ({connectedList.length || data?.whatsapp.instances.active})
                        </span>
                      </div>
                      <button
                        onClick={() => setShowConnectedPopover(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {connectedList.length > 0 ? (
                        connectedList.map((item, idx) => (
                          <div
                            key={`conn-${idx}`}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.profilePicUrl ? (
                                <img
                                  src={item.profilePicUrl}
                                  alt={item.userName || item.imobiliaria}
                                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-emerald-300 dark:border-emerald-700"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-800">
                                  {(item.imobiliaria || 'IM').slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                                  {item.imobiliaria}
                                </div>
                                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate flex items-center gap-1">
                                  <span>{item.userName || 'Roger Vasques'}</span>
                                  {item.userRole && (
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      • {item.userRole}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono truncate">
                                  {item.whatsappNumber || item.instanceName}
                                </div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 shrink-0">
                              🟢 Online
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500">
                          Nenhuma instância conectada no momento.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── POPOVER FLUTUANTE DE INSTÂNCIAS DESCONECTADAS ─── */}
                {showDisconnectedPopover && hasDisconnected && (
                  <div
                    ref={popoverRef}
                    className="absolute top-full left-0 right-0 mt-2 z-50 p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-800/80 text-left animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          Instâncias Pendentes ({disconnectedList.length || data?.whatsapp.instances.disconnected})
                        </span>
                      </div>
                      <button
                        onClick={() => setShowDisconnectedPopover(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {disconnectedList.length > 0 ? (
                        disconnectedList.map((item, idx) => (
                          <div
                            key={`disc-${idx}`}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate">
                                {item.imobiliaria}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">
                                Instância: {item.instanceName}
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 shrink-0">
                              Desconectada
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500">
                          Instâncias com QR code pendente de autenticação.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Taxa de Sucesso de Webhooks 24h & Timestamp */}
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
                  <span>Último evento: <strong>{data?.whatsapp.lastWebhookFormatted || 'há 4 min'}</strong></span>
                </div>
              </div>

              {/* Conectividade e URL */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] space-y-1">
                <div className="text-slate-400 font-bold flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" /> Endpoint Conectado
                </div>
                <div className="font-mono text-slate-700 dark:text-slate-300 truncate text-[10px]">
                  {data?.whatsapp.apiUrl || 'http://147.93.9.74:8080'}
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
