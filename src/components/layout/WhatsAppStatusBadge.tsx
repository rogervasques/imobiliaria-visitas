'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { QrCode, RefreshCw, Smartphone, CheckCircle2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { generateInstanceName } from '@/lib/auth';

export function WhatsAppStatusBadge({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { configWhatsApp, showToast } = useData();
  const { user } = useAuth();
  const currentInstance = user?.instance_name || (user?.id ? generateInstanceName(user.id) : configWhatsApp.instancia_nome || 'easymob');

  // Estado inicial padrão: 'checking' para eliminar falso alerta de desconexão
  const [connectionState, setConnectionState] = useState<'checking' | 'open' | 'close'>('checking');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Flag que indica se o usuário abriu ativamente o modal de pareamento
  const isActivelyPairingRef = useRef(false);

  // Consulta o estado da conexão na Evolution API para a instância individual do corretor
  const checkConnectionState = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            api_url: configWhatsApp.api_url || 'http://147.93.9.74:8080',
            api_key: configWhatsApp.api_key || 'easymob_secret_token_2026',
            instancia_nome: currentInstance,
            provedor: configWhatsApp.provedor || 'evolution_api',
          },
        }),
      });
      const data = await res.json();
      const newState: 'open' | 'close' = data.state === 'open' ? 'open' : 'close';

      setConnectionState(newState);

      // Notifica com Toast e fecha modal SOMENTE se o usuário estava no fluxo ativo de pareamento
      if (newState === 'open' && isActivelyPairingRef.current) {
        isActivelyPairingRef.current = false;
        showToast(`WhatsApp (${currentInstance}) pareado e conectado com sucesso!`, 'success');
        setIsModalOpen(false);
      }
    } catch {
      setConnectionState('close');
    }
  }, [configWhatsApp, currentInstance, showToast]);

  // Polling a cada 20 segundos em segundo plano (sem disparar toasts)
  useEffect(() => {
    checkConnectionState();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      checkConnectionState();
    }, 20000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkConnectionState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkConnectionState]);

  // Abre modal para reconexão ativa
  const handleOpenReconnectModal = async () => {
    isActivelyPairingRef.current = true;
    setIsModalOpen(true);
    setIsLoadingQr(true);
    setQrCodeBase64(null);
    setPairingCode(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            api_url: configWhatsApp.api_url || 'http://147.93.9.74:8080',
            api_key: configWhatsApp.api_key || 'easymob_secret_token_2026',
            instancia_nome: currentInstance,
            provedor: configWhatsApp.provedor || 'evolution_api',
          },
        }),
      });
      const data = await res.json();

      if (data.base64) {
        setQrCodeBase64(data.base64);
      } else if (data.pairingCode) {
        setPairingCode(data.pairingCode);
        setStatusMessage(`Código de pareamento gerado: ${data.pairingCode}`);
      } else {
        await checkConnectionState();
      }
    } catch {
      setStatusMessage('Falha ao conectar com o servidor da Evolution API.');
    } finally {
      setIsLoadingQr(false);
    }
  };

  return (
    <>
      {/* ─── BADGE COMPACTO (VERSÃO MOBILE / MINI) ─── */}
      {compact ? (
        <div className={className || 'mt-1'}>
          {connectionState === 'checking' && (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-medium"
              title="Consultando estado da conexão..."
            >
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
              </span>
              <span>Verificando conexão...</span>
            </div>
          )}

          {connectionState === 'open' && (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold"
              title="Instância conectada ao WhatsApp"
            >
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span>WhatsApp Conectado</span>
            </div>
          )}

          {connectionState === 'close' && (
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-[11px] font-medium">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                </span>
                <span>WhatsApp Desconectado</span>
              </div>
              <button
                type="button"
                onClick={handleOpenReconnectModal}
                className="px-1.5 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-[9px] shrink-0 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-2 h-2" />
                <span>Reconectar</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ─── BADGE PADRÃO COMPLETO (SIDEBAR DESKTOP) ─── */
        <div className={className || 'mt-2'}>
          <div className="w-full min-h-[38px] flex items-center">
            {connectionState === 'checking' && (
              <div
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 transition-all text-xs"
                title="Consultando estado da instância na Evolution API..."
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="font-semibold text-[12px] truncate animate-pulse">
                  Verificando conexão...
                </span>
              </div>
            )}

            {connectionState === 'open' && (
              <div
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 transition-all text-xs"
                title="Instância conectada à Evolution API"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="font-semibold text-[12px]">WhatsApp Conectado</span>
                </div>
              </div>
            )}

            {connectionState === 'close' && (
              <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 transition-all text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                  <span className="font-semibold text-[12px] truncate">
                    WhatsApp Desconectado
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenReconnectModal}
                  className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-[10px] shrink-0 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Reconectar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL DE RECONEXÃO / QR CODE ─── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          isActivelyPairingRef.current = false;
          setIsModalOpen(false);
        }}
        title="Reconectar WhatsApp"
        subtitle="Escaneie o QR Code para parear seu WhatsApp"
        maxWidth="md"
      >
        <div className="space-y-4 text-center px-1 sm:px-2">
          {/* Container do QR Code */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[260px] space-y-3">
            {isLoadingQr ? (
              <div className="space-y-3 py-8 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                <p className="text-xs font-medium">Gerando QR Code na Evolution API...</p>
              </div>
            ) : qrCodeBase64 ? (
              <div className="space-y-3 w-full flex flex-col items-center">
                <div className="p-2 sm:p-3 rounded-2xl bg-white shadow-md border border-slate-200 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
                    alt="QR Code WhatsApp"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl mx-auto"
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                  Abra o WhatsApp no seu celular: Configurações &gt; Aparelhos Conectados &gt; Conectar Aparelho
                </p>
              </div>
            ) : pairingCode ? (
              <div className="space-y-3 py-6">
                <Smartphone className="w-10 h-10 text-emerald-500 mx-auto" />
                <span className="text-xs text-slate-500">Código de Pareamento:</span>
                <div className="font-mono text-2xl font-black text-emerald-600 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                  {pairingCode}
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-6 text-slate-400">
                <QrCode className="w-12 h-12 mx-auto opacity-40" />
                <p className="text-xs">Clique no botão abaixo para gerar um novo QR Code.</p>
              </div>
            )}

            {statusMessage && !qrCodeBase64 && (
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-xs">
                {statusMessage}
              </p>
            )}
          </div>

          {/* Botões de Ação do Rodapé */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleOpenReconnectModal}
              isLoading={isLoadingQr}
              className="flex-1 w-full text-xs sm:text-sm font-bold h-10"
            >
              <RefreshCw className="w-4 h-4 mr-1.5 shrink-0" />
              <span>Atualizar QR Code</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={async () => {
                await checkConnectionState();
                isActivelyPairingRef.current = false;
                setIsModalOpen(false);
              }}
              className="flex-1 w-full text-xs sm:text-sm font-bold h-10"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />
              <span>Concluir</span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
