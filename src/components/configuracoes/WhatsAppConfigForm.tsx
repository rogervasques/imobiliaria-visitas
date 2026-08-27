'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import {
  MessageSquare,
  Sparkles,
  Save,
  Play,
  HelpCircle,
  Clock,
  Terminal,
  Bell,
  QrCode,
  RefreshCw,
  LogOut,
  Send,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Smartphone,
  Radio,
  Database,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Mic,
  UserCheck,
  User,
} from 'lucide-react';
import { ProvedorWhatsApp } from '@/types';
import { compileTemplate } from '@/lib/whatsapp';
import { useAuth } from '@/context/AuthContext';
import { generateInstanceName } from '@/lib/auth';

/**
 * Renderiza o texto formatado no estilo do WhatsApp (negrito, itálico, riscado e quebras de linha)
 */
function renderWhatsAppFormattedHtml(rawText: string) {
  if (!rawText) return null;
  const lines = rawText.split('\n');
  return lines.map((line, idx) => {
    const formatted = line
      .replace(/\*(.*?)\*/g, '<strong class="font-bold text-slate-950 dark:text-white">$1</strong>')
      .replace(/_(.*?)_/g, '<em class="italic">$1</em>')
      .replace(/~(.*?)~/g, '<del class="line-through opacity-75">$1</del>');

    return (
      <span
        key={idx}
        className="block min-h-[1.25em]"
        dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }}
      />
    );
  });
}

export function WhatsAppConfigForm() {
  const { configWhatsApp, atualizarConfigWhatsApp, executarRotinaLembretes30m, showToast } = useData();
  const { user } = useAuth();
  const userDynamicInstance = user?.instance_name || (user?.id ? generateInstanceName(user.id) : 'easymob');

  const provedor: ProvedorWhatsApp = configWhatsApp.provedor || 'evolution_api';
  const [apiUrl, setApiUrl] = useState(
    configWhatsApp.api_url && !configWhatsApp.api_url.includes('exemplo-evolution')
      ? configWhatsApp.api_url
      : 'http://147.93.9.74:8080'
  );
  const [apiKey, setApiKey] = useState(
    configWhatsApp.api_key && !configWhatsApp.api_key.includes('MINHA_CHAVE')
      ? configWhatsApp.api_key
      : 'easymob_secret_token_2026'
  );
  const [instanciaNome, setInstanciaNome] = useState(userDynamicInstance);
  const [ativo, setAtivo] = useState(configWhatsApp.ativo);

  useEffect(() => {
    if (userDynamicInstance) {
      setInstanciaNome(userDynamicInstance);
    }
  }, [userDynamicInstance]);

  // Estados da Conexão e QR Code
  const [connectionState, setConnectionState] = useState<'open' | 'close' | 'connecting' | 'idle'>('idle');
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Estados de Teste de Envio
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste enviada pela EasyMob via Evolution API v2.');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Estados do Webhook Público
  const [publicAppUrl, setPublicAppUrl] = useState('https://app.easymob.com.br');
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const [webhookFeedback, setWebhookFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Define URL pública inicial baseada no navegador (se não for localhost)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
      setPublicAppUrl(window.location.origin);
    }
  }, []);

  // Templates
  const [templateConfCliente, setTemplateConfCliente] = useState(configWhatsApp.template_confirmacao_cliente);
  const [templateConfProp, setTemplateConfProp] = useState(configWhatsApp.template_confirmacao_proprietario);
  const [templateLembCliente, setTemplateLembCliente] = useState(configWhatsApp.template_lembrete_cliente);
  const [templateLembProp, setTemplateLembProp] = useState(configWhatsApp.template_lembrete_proprietario);
  const [templateComprovacaoProp, setTemplateComprovacaoProp] = useState(
    configWhatsApp.template_comprovacao_proprietario ||
    'Olá, {proprietario_nome}! Confirmamos que a visita ao seu imóvel *{imovel_titulo}* foi realizada com sucesso nesta data por intermédio do corretor *{corretor_nome}*, acompanhado do(a) cliente *{cliente_nome}*. Qualquer novidade sobre proposta, entraremos em contato!'
  );
  const [templatePosVisita, setTemplatePosVisita] = useState(
    configWhatsApp.template_pos_visita_cliente ||
    '✨ *Olá, {cliente_nome}! Tudo bem?*\n\nEsperamos que a visita de hoje tenha sido ótima!\n\n🏠 *Imóveis visitados:*\n{roteiro_imoveis}\n\nGostaríamos de saber: o que você achou dos imóveis? Algum deles chamou sua atenção ou despertou interesse para iniciarmos uma proposta?\n\nQualquer dúvida, estamos à sua inteira disposição!\n*EasyMob - Gestão Imobiliária Inteligente*'
  );

  // Preferências Globais de Notificações WhatsApp
  const [enviarPosVisitaCliente, setEnviarPosVisitaCliente] = useState(
    configWhatsApp.enviar_pos_visita_cliente !== false
  );
  const [enviarComprovacaoProprietario, setEnviarComprovacaoProprietario] = useState(
    configWhatsApp.enviar_comprovacao_proprietario !== false
  );

  const [activeTab, setActiveTab] = useState<'api' | 'templates' | 'automacao'>('api');
  const [selectedTemplateTab, setSelectedTemplateTab] = useState<
    'conf_cliente' | 'conf_prop' | 'lemb_cliente' | 'lemb_prop' | 'comprovacao_prop' | 'pos_visita'
  >('conf_cliente');
  const templateTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const [isExecutingCron, setIsExecutingCron] = useState(false);
  const [cronLogs, setCronLogs] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Inserção inteligente de tags na posição do cursor
  const handleInsertTag = (tag: string) => {
    const textarea = templateTextareaRef.current;
    let currentText = '';
    let setTextFn: (v: string) => void = () => {};

    if (selectedTemplateTab === 'conf_cliente') {
      currentText = templateConfCliente;
      setTextFn = setTemplateConfCliente;
    } else if (selectedTemplateTab === 'conf_prop') {
      currentText = templateConfProp;
      setTextFn = setTemplateConfProp;
    } else if (selectedTemplateTab === 'lemb_cliente') {
      currentText = templateLembCliente;
      setTextFn = setTemplateLembCliente;
    } else if (selectedTemplateTab === 'lemb_prop') {
      currentText = templateLembProp;
      setTextFn = setTemplateLembProp;
    } else if (selectedTemplateTab === 'comprovacao_prop') {
      currentText = templateComprovacaoProp;
      setTextFn = setTemplateComprovacaoProp;
    } else if (selectedTemplateTab === 'pos_visita') {
      currentText = templatePosVisita;
      setTextFn = setTemplatePosVisita;
    }

    if (textarea) {
      const start = textarea.selectionStart ?? currentText.length;
      const end = textarea.selectionEnd ?? currentText.length;
      const before = currentText.substring(0, start);
      const after = currentText.substring(end);
      const newText = `${before}${tag}${after}`;
      setTextFn(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 50);
    } else {
      setTextFn(`${currentText} ${tag}`);
    }
  };

  const isAdmin = user?.role === 'admin';

  // Bloqueio de acesso para corretores na aba automacao
  useEffect(() => {
    if (!isAdmin && activeTab === 'automacao') {
      setActiveTab('api');
    }
  }, [isAdmin, activeTab]);

  const checkStatus = React.useCallback(async () => {
    setIsCheckingStatus(true);
    setStatusFeedback(null);
    try {
      const res = await fetch('/api/whatsapp/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            api_url: apiUrl,
            api_key: apiKey,
            instancia_nome: instanciaNome,
            provedor,
          },
        }),
      });
      const data = await res.json();
      setConnectionState(data.state === 'open' ? 'open' : data.state === 'connecting' ? 'connecting' : 'close');
      if (data.state === 'open') {
        setQrCodeBase64(null);
        setStatusFeedback('🟢 Instância conectada e pronta para envio!');
      } else if (data.state === 'connecting') {
        setStatusFeedback('🟡 Instância conectando. Gere o QR Code para parear.');
      } else {
        setStatusFeedback('🔴 Instância desconectada. Clique em "Conectar / Gerar QR Code".');
      }
    } catch {
      setConnectionState('close');
      setStatusFeedback('⚠️ Não foi possível verificar o status da Evolution API.');
    } finally {
      setIsCheckingStatus(false);
    }
  }, [apiUrl, apiKey, instanciaNome, provedor]);

  // Checa status ao carregar ou trocar de credencial
  useEffect(() => {
    if (apiUrl && apiKey) {
      checkStatus();
    }
  }, [apiUrl, apiKey, checkStatus]);

  const handleConnectQr = async () => {
    setIsLoadingQr(true);
    setStatusFeedback(null);
    setQrCodeBase64(null);
    setPairingCode(null);
    try {
      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            api_url: apiUrl,
            api_key: apiKey,
            instancia_nome: instanciaNome,
            provedor,
          },
          publicUrl: publicAppUrl,
        }),
      });
      const data = await res.json();

      if (data.base64) {
        setQrCodeBase64(data.base64);
        setConnectionState('connecting');
        setStatusFeedback('Escaneie o QR Code no seu WhatsApp: Menu > Aparelhos Conectados');
      } else if (data.pairingCode) {
        setPairingCode(data.pairingCode);
        setConnectionState('connecting');
        setStatusFeedback(`Código de pareamento gerado: ${data.pairingCode}`);
      } else {
        await checkStatus();
      }
    } catch {
      setStatusFeedback('Erro ao solicitar QR Code da Evolution API.');
    } finally {
      setIsLoadingQr(false);
    }
  };

  const handleConfigureWebhook = async () => {
    setIsSettingWebhook(true);
    setWebhookFeedback(null);
    try {
      const finalUrl = `${publicAppUrl.replace(/\/$/, '')}/api/whatsapp/webhook`;
      const res = await fetch('/api/whatsapp/webhook/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            api_url: apiUrl,
            api_key: apiKey,
            instancia_nome: instanciaNome,
            provedor,
          },
          webhookUrl: finalUrl,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setWebhookFeedback({
          success: true,
          message: `Webhook configurado com sucesso na Evolution API! (${data.webhookUrl || finalUrl})`,
        });
      } else {
        setWebhookFeedback({
          success: false,
          message: data.error || 'Falha ao registrar webhook na Evolution API.',
        });
      }
    } catch {
      setWebhookFeedback({
        success: false,
        message: 'Erro na requisição ao configurar webhook.',
      });
    } finally {
      setIsSettingWebhook(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Deseja realmente desconectar a instância do WhatsApp?')) return;
    setIsLoggingOut(true);
    setStatusFeedback(null);
    try {
      await fetch('/api/whatsapp/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            api_url: apiUrl,
            api_key: apiKey,
            instancia_nome: instanciaNome,
          },
        }),
      });
      setConnectionState('close');
      setQrCodeBase64(null);
      setPairingCode(null);
      setStatusFeedback('Instância desconectada com sucesso.');
    } catch {
      setStatusFeedback('Erro ao desconectar instância.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;
    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhone: testPhone,
          message: testMessage,
          config: {
            api_url: apiUrl,
            api_key: apiKey,
            instancia_nome: instanciaNome,
            provedor,
          },
        }),
      });
      const data = await res.json();

      if (data.success) {
        setTestResult({ success: true, message: 'Mensagem de teste enviada com sucesso!' });
      } else {
        setTestResult({ success: false, message: data.error || 'Falha ao enviar mensagem de teste.' });
      }
    } catch {
      setTestResult({ success: false, message: 'Erro na requisição de teste.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleCopyWebhook = () => {
    const finalUrl = `${publicAppUrl.replace(/\/$/, '')}/api/whatsapp/webhook`;
    navigator.clipboard.writeText(finalUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await atualizarConfigWhatsApp({
        provedor,
        api_url: apiUrl,
        api_key: apiKey,
        instancia_nome: instanciaNome,
        ativo,
        enviar_pos_visita_cliente: enviarPosVisitaCliente,
        enviar_comprovacao_proprietario: enviarComprovacaoProprietario,
        template_confirmacao_cliente: templateConfCliente,
        template_confirmacao_proprietario: templateConfProp,
        template_lembrete_cliente: templateLembCliente,
        template_lembrete_proprietario: templateLembProp,
        template_comprovacao_proprietario: templateComprovacaoProp,
        template_pos_visita_cliente: templatePosVisita,
      });
      await checkStatus();
      showToast('Configurações salvas com sucesso!', 'success');
    } catch {
      showToast('Erro ao salvar configurações do WhatsApp.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecutarLembretesAgora = async () => {
    setIsExecutingCron(true);
    try {
      const res = await executarRotinaLembretes30m();
      setCronLogs(res.logs);
    } finally {
      setIsExecutingCron(false);
    }
  };

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSeedData = async () => {
    if (!confirm('Deseja realmente limpar as tabelas operacionais (visitas, imóveis, clientes, proprietários) e popular 30 proprietários, 80 imóveis, 50 clientes e ~38 visitas? As contas de usuários (users/invites) serão preservadas.')) {
      return;
    }

    setIsSeeding(true);
    setSeedResult(null);

    try {
      const res = await fetch('/api/admin/seed-test-data', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        // Limpa caches antigos do localStorage para sincronizar imediatamente
        try {
          localStorage.removeItem('easymob_visitas_visitas');
          localStorage.removeItem('easymob_visitas_imoveis');
          localStorage.removeItem('easymob_visitas_clientes');
          localStorage.removeItem('easymob_visitas_proprietarios');
          localStorage.removeItem('imobiliaria_visitas_visitas');
          localStorage.removeItem('imobiliaria_visitas_imoveis');
          localStorage.removeItem('imobiliaria_visitas_clientes');
          localStorage.removeItem('imobiliaria_visitas_proprietarios');

          if (data.data) {
            localStorage.setItem('easymob_visitas_proprietarios', JSON.stringify(data.data.proprietarios));
            localStorage.setItem('easymob_visitas_imoveis', JSON.stringify(data.data.imoveis));
            localStorage.setItem('easymob_visitas_clientes', JSON.stringify(data.data.clientes));
            localStorage.setItem('easymob_visitas_visitas', JSON.stringify(data.data.visitas));
          }
        } catch {
          // ignore
        }

        showToast('Base operacional reinicializada e populada com sucesso!', 'success');
        setSeedResult(`✅ Sucesso: ${data.summary.proprietarios} proprietários, ${data.summary.imoveis} imóveis, ${data.summary.clientes} clientes e ${data.summary.visitas} visitas geradas.`);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        showToast(data.error || 'Erro ao executar rotina de seed.', 'error');
        setSeedResult(`❌ Erro: ${data.error || 'Falha ao processar seed.'}`);
      }
    } catch {
      showToast('Erro de conexão ao executar seed.', 'error');
      setSeedResult('❌ Erro de conexão com o servidor.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Variáveis para Live Preview
  const sampleContext = {
    cliente_nome: 'Lucas Ferraz Souza',
    cliente_telefone: '11998887766',
    proprietario_nome: 'Carlos Eduardo Mendonça',
    proprietario_telefone: '11987654321',
    imovel_titulo: 'Apartamento em Moema, Casa em Pinheiros',
    imovel_codigo: 'AP-1024, CA-2048',
    endereco: 'Av. Paulista, 1500 - Bela Vista; R. dos Pinheiros, 400 - Pinheiros',
    roteiro_imoveis: '1. [Apartamento em Moema] - [Av. Paulista, 1500 - Bela Vista] | 2. [Casa em Pinheiros] - [R. dos Pinheiros, 400 - Pinheiros]',
    total_imoveis: '2',
    data_hora: '20/08/2026 às 14:30',
    horario: '14:30',
    data: '20/08/2026',
    corretor_nome: 'Rogério Silva',
    corretor_telefone: '(11) 98999-0000',
    link_curto_mapa: 'https://tinyurl.com/maps-easymob',
    link_mapa: 'https://www.google.com/maps/search/?api=1&query=Av+Paulista+1500',
  };

  const tagsDisponiveis = [
    '{cliente_nome}',
    '{proprietario_nome}',
    '{roteiro_imoveis}',
    '{link_curto_mapa}',
    '{link_mapa}',
    '{total_imoveis}',
    '{imovel_titulo}',
    '{imovel_codigo}',
    '{endereco}',
    '{data_hora}',
    '{horario}',
    '{data}',
    '{corretor_nome}',
    '{corretor_telefone}',
  ];

  return (
    <div className="space-y-6">
      {/* Abas de Navegação */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'api'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Conexão Whatsapp
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Templates WhatsApp
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('automacao')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'automacao'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Automação &amp; Cron
          </button>
        )}
      </div>

      {/* ABA 1: CONEXÃO WHATSAPP */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          {!isAdmin ? (
            /* VISÃO EXCLUSIVA DO CORRETOR (Apenas Status & Pareamento e Teste de Envio) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Coluna 1: Pareamento por QR Code & Status */}
              <div className="lg:col-span-6 space-y-6">
                <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-emerald-500" />
                        Status &amp; Pareamento
                      </span>
                      {/* Badge de Status */}
                      {connectionState === 'open' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-800">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          🟢 Conectado
                        </span>
                      ) : connectionState === 'connecting' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-black border border-amber-300 dark:border-amber-800">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          🟡 Conectando
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs font-black border border-rose-300 dark:border-rose-800">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          🔴 Desconectado
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Container Dinâmico do QR Code */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[260px] text-center space-y-3">
                      {connectionState === 'open' ? (
                        <div className="space-y-3 py-4">
                          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                              WhatsApp Conectado com Sucesso!
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                              Sua conta de WhatsApp está conectada à sua instância exclusiva.
                            </p>
                          </div>
                        </div>
                      ) : qrCodeBase64 ? (
                        <div className="space-y-2">
                          <div className="p-2 rounded-2xl bg-white shadow-md border border-slate-200 inline-block">
                            <img
                              src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
                              alt="QR Code WhatsApp"
                              className="w-52 h-52 object-contain rounded-xl"
                            />
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
                            Abra o WhatsApp no seu celular: Configurações &gt; Aparelhos Conectados &gt; Conectar Aparelho
                          </p>
                        </div>
                      ) : pairingCode ? (
                        <div className="space-y-2 py-4">
                          <Smartphone className="w-10 h-10 text-emerald-500 mx-auto" />
                          <span className="text-xs text-slate-500">Código de Pareamento:</span>
                          <div className="font-mono text-2xl font-black text-emerald-600 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                            {pairingCode}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 py-6 text-slate-400 dark:text-slate-500">
                          <QrCode className="w-16 h-16 mx-auto opacity-40" />
                          <div>
                            <p className="text-xs font-medium">
                              Nenhum QR Code ativo no momento.
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Clique no botão abaixo para gerar o código de conexão do seu WhatsApp.
                            </p>
                          </div>
                        </div>
                      )}

                      {statusFeedback && !qrCodeBase64 && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-xs">
                          {statusFeedback}
                        </p>
                      )}
                    </div>

                    {/* Botões de Ação do Pareamento */}
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleConnectQr}
                        isLoading={isLoadingQr}
                        className="w-full text-xs font-bold"
                      >
                        <QrCode className="w-4 h-4 mr-1.5" />
                        Conectar / Gerar QR Code
                      </Button>

                      {connectionState === 'open' && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleLogout}
                          isLoading={isLoggingOut}
                          className="w-full text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200"
                        >
                          <LogOut className="w-4 h-4 mr-1.5" />
                          Desconectar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Coluna 2: Testar Disparo de Mensagem */}
              <div className="lg:col-span-6 space-y-6">
                <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Send className="w-4 h-4 text-emerald-500" />
                      Testar Disparo de Mensagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSendTest} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Telefone com DDD *"
                          value={testPhone}
                          onChange={(e) => setTestPhone(e.target.value)}
                          placeholder="11999998888"
                          helperText="Apenas números ou formato padrão"
                          required
                        />
                        <div className="flex flex-col justify-end pb-1">
                          <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={isSendingTest}
                            className="w-full text-xs font-bold"
                          >
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            Disparar Teste
                          </Button>
                        </div>
                      </div>

                      <Textarea
                        label="Mensagem de Teste"
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        rows={3}
                      />

                      {testResult && (
                        <div
                          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                            testResult.success
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {testResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span>{testResult.message}</span>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* VISÃO COMPLETA DO ADMIN: 12 Colunas com Credenciais e Webhook */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Coluna 1: Formulário de Credenciais Evolution API */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-emerald-500" />
                        Credenciais da Evolution API v2
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Integração Nativa
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Switch Ativar Automação */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          Disparo Automático de Mensagens
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Habilita a régua de confirmação, lembrete e pós-visita
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ativo}
                          onChange={(e) => setAtivo(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600" />
                      </label>
                    </div>

                    {/* URL da API */}
                    <Input
                      label="URL da API (Evolution API v2) *"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="https://wa.easymob.com.br"
                      helperText="URL base do servidor onde sua Evolution API está hospedada"
                      required
                    />

                    {/* API Key Global e Nome da Instância */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="API Key Global (Token) *"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="••••••••••••••••"
                        helperText="Chave de autenticação configurada na Evolution API"
                        required
                      />
                      <Input
                        label="Nome da Instância *"
                        value={instanciaNome}
                        onChange={(e) => setInstanciaNome(e.target.value)}
                        placeholder="easymob"
                        helperText="Identificador único da instância (Padrão: easymob)"
                        required
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={checkStatus}
                        isLoading={isCheckingStatus}
                        className="text-xs font-bold"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        Verificar Conexão
                      </Button>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        isLoading={isSaving}
                        className="text-xs font-bold"
                      >
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Salvar Credenciais
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* ─── Card: Notificações via WhatsApp (Pós-Visita) ─── */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-500" />
                        Notificações via WhatsApp
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Disparo Pós-Visita
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configure os disparos automáticos ao marcar o desfecho da visita como <strong>Realizada</strong>:
                    </p>

                    <div className="space-y-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      {/* Checkbox 1: Cliente pós-visita */}
                      <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                        <input
                          type="checkbox"
                          checked={enviarPosVisitaCliente}
                          onChange={(e) => setEnviarPosVisitaCliente(e.target.checked)}
                          className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="leading-snug flex-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors block">
                            Enviar WhatsApp ao Cliente após concluir visita
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Disparo automático solicitando feedback sobre a visita realizada.
                          </p>
                        </div>
                      </label>

                      <div className="border-t border-slate-200 dark:border-slate-800" />

                      {/* Checkbox 2: Proprietário pós-visita */}
                      <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                        <input
                          type="checkbox"
                          checked={enviarComprovacaoProprietario}
                          onChange={(e) => setEnviarComprovacaoProprietario(e.target.checked)}
                          className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="leading-snug flex-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors block">
                            Enviar WhatsApp ao Proprietário após concluir visita
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Notifica o proprietário confirmando a realização da visita em seu imóvel.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleSave()}
                        isLoading={isSaving}
                        className="text-xs font-bold"
                      >
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Salvar Preferências
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Teste de Envio Rápido */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Send className="w-4 h-4 text-emerald-500" />
                      Testar Disparo de Mensagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSendTest} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Telefone com DDD *"
                          value={testPhone}
                          onChange={(e) => setTestPhone(e.target.value)}
                          placeholder="11999998888"
                          helperText="Apenas números ou formato padrão"
                          required
                        />
                        <div className="flex flex-col justify-end pb-1">
                          <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={isSendingTest}
                            className="w-full text-xs font-bold"
                          >
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            Disparar Mensagem de Teste
                          </Button>
                        </div>
                      </div>

                      <Textarea
                        label="Mensagem de Teste"
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        rows={2}
                      />

                      {testResult && (
                        <div
                          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                            testResult.success
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {testResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span>{testResult.message}</span>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Coluna 2: Pareamento por QR Code & Status */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-emerald-500" />
                        Status &amp; Pareamento
                      </span>
                      {/* Badge de Status */}
                      {connectionState === 'open' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-800">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          🟢 Conectado
                        </span>
                      ) : connectionState === 'connecting' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-black border border-amber-300 dark:border-amber-800">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          🟡 Conectando
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs font-black border border-rose-300 dark:border-rose-800">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          🔴 Desconectado
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Container Dinâmico do QR Code */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[260px] text-center space-y-3">
                      {connectionState === 'open' ? (
                        <div className="space-y-3 py-4">
                          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                              WhatsApp Pareado com Sucesso!
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                              A instância <strong>{instanciaNome}</strong> está ativa e conectada ao servidor da Evolution API.
                            </p>
                          </div>
                        </div>
                      ) : qrCodeBase64 ? (
                        <div className="space-y-2">
                          <div className="p-2 rounded-2xl bg-white shadow-md border border-slate-200 inline-block">
                            <img
                              src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
                              alt="QR Code WhatsApp"
                              className="w-52 h-52 object-contain rounded-xl"
                            />
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                            Abra o WhatsApp &gt; Aparelhos Conectados &gt; Conectar Aparelho
                          </p>
                        </div>
                      ) : pairingCode ? (
                        <div className="space-y-2 py-4">
                          <Smartphone className="w-10 h-10 text-emerald-500 mx-auto" />
                          <span className="text-xs text-slate-500">Código de Pareamento:</span>
                          <div className="font-mono text-2xl font-black text-emerald-600 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                            {pairingCode}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 py-6 text-slate-400 dark:text-slate-500">
                          <QrCode className="w-16 h-16 mx-auto opacity-40" />
                          <div>
                            <p className="text-xs font-medium">
                              Nenhum QR Code ativo no momento.
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Clique no botão abaixo para gerar o código de conexão.
                            </p>
                          </div>
                        </div>
                      )}

                      {statusFeedback && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-xs">
                          {statusFeedback}
                        </p>
                      )}
                    </div>

                    {/* Botões de Ação do Pareamento */}
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleConnectQr}
                        isLoading={isLoadingQr}
                        className="w-full text-xs font-bold"
                      >
                        <QrCode className="w-4 h-4 mr-1.5" />
                        Conectar / Gerar QR Code
                      </Button>

                      {connectionState === 'open' && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleLogout}
                          isLoading={isLoggingOut}
                          className="w-full text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200"
                        >
                          <LogOut className="w-4 h-4 mr-1.5" />
                          Desconectar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Webhook e Rastreamento */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-emerald-500" />
                        Webhook de Rastreamento Automático
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                        POST /webhook/set
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    <p>
                      Configura o Webhook da Evolution API v2 para enviar as notificações de conexão e status de entrega em tempo real para o EasyMob:
                    </p>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        URL Pública do EasyMob
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={publicAppUrl}
                          onChange={(e) => setPublicAppUrl(e.target.value)}
                          placeholder="https://app.easymob.com.br"
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleCopyWebhook}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 shrink-0"
                          title="Copiar URL completa do Webhook"
                        >
                          {copiedWebhook ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        Webhook: {publicAppUrl.replace(/\/$/, '')}/api/whatsapp/webhook
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleConfigureWebhook}
                      isLoading={isSettingWebhook}
                      className="w-full text-xs font-bold border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                    >
                      <Radio className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      Configurar Webhook na Evolution API
                    </Button>

                    {webhookFeedback && (
                      <div
                        className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                          webhookFeedback.success
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                        }`}
                      >
                        {webhookFeedback.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{webhookFeedback.message}</span>
                      </div>
                    )}

                    <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div>• <code>CONNECTION_UPDATE</code>: Atualiza estado da conexão (open, close).</div>
                      <div>• <code>MESSAGES_UPDATE</code>: Atualiza status de entrega e visualização.</div>
                      <div>• <code>SEND_MESSAGE</code>: Notificações de confirmação de envio.</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: TEMPLATES DE MENSAGENS (SPLIT SCREEN: EDITOR + PRÉVIA WHATSAPP) */}
      {activeTab === 'templates' && (
        <form onSubmit={handleSave} className="space-y-5">
          {/* Tags Dinâmicas Clicáveis */}
          <Card className="border-slate-200/90 dark:border-slate-800">
            <CardContent className="p-4 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Tags Dinâmicas (Clique para inserir no cursor):</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  💡 Clique em qualquer tag para adicioná-la instantaneamente ao texto
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {tagsDisponiveis.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleInsertTag(tag)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:bg-slate-800 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                    title={`Inserir ${tag} na posição do cursor`}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seletor de Templates (Abas no Topo do Editor) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'conf_cliente' as const, label: '1. Confirmação Cliente', icon: Bell },
              { id: 'conf_prop' as const, label: '2. Confirmação Proprietário', icon: Bell },
              { id: 'lemb_cliente' as const, label: '3. Lembrete Cliente', icon: Clock },
              { id: 'lemb_prop' as const, label: '4. Lembrete Proprietário', icon: Clock },
              { id: 'comprovacao_prop' as const, label: '5. Comprovação de Visita (Proprietário)', icon: CheckCircle2 },
              { id: 'pos_visita' as const, label: '6. Pós-Visita Feedback (Cliente)', icon: Sparkles },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = selectedTemplateTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplateTab(t.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Layout Split-Screen: Editor (Esquerda) + Prévia WhatsApp (Direita) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LADO ESQUERDO: EDITOR */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {selectedTemplateTab === 'conf_cliente' && (
                          <>
                            <Bell className="w-4 h-4 text-emerald-500" />
                            1. Confirmação Imediata (Cliente - Roteiro de Imóveis)
                          </>
                        )}
                        {selectedTemplateTab === 'conf_prop' && (
                          <>
                            <Bell className="w-4 h-4 text-emerald-500" />
                            2. Confirmação Imediata (Proprietário)
                          </>
                        )}
                        {selectedTemplateTab === 'lemb_cliente' && (
                          <>
                            <Clock className="w-4 h-4 text-sky-500" />
                            3. Lembrete 1 Hora Antes (Cliente - Roteiro)
                          </>
                        )}
                        {selectedTemplateTab === 'lemb_prop' && (
                          <>
                            <Clock className="w-4 h-4 text-sky-500" />
                            4. Lembrete 1 Hora Antes (Proprietário)
                          </>
                        )}
                        {selectedTemplateTab === 'comprovacao_prop' && (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            5. Comprovação de Visita Realizada (Proprietário)
                          </>
                        )}
                        {selectedTemplateTab === 'pos_visita' && (
                          <>
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            6. Pós-Visita / Feedback (Cliente - 2 Horas Após)
                          </>
                        )}
                      </CardTitle>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedTemplateTab === 'conf_cliente' &&
                          'Disparado para o cliente visitante assim que o agendamento da visita ou roteiro é concluído.'}
                        {selectedTemplateTab === 'conf_prop' &&
                          'Disparado para o proprietário do imóvel notificando que haverá uma visita com cliente interessado.'}
                        {selectedTemplateTab === 'lemb_cliente' &&
                          'Disparado automaticamente para o cliente 1 hora antes do horário marcado.'}
                        {selectedTemplateTab === 'lemb_prop' &&
                          'Disparado automaticamente para o proprietário 1 hora antes do horário marcado.'}
                        {selectedTemplateTab === 'comprovacao_prop' &&
                          'Disparado para o proprietário após a visita confirmando formalmente a realização do atendimento intermediado pelo corretor.'}
                        {selectedTemplateTab === 'pos_visita' &&
                          'Disparado para o cliente 2 horas após a visita para colher feedback e engajar nova proposta.'}
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800 shrink-0">
                      {selectedTemplateTab.includes('prop') ? 'Proprietário' : 'Cliente'}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Mensagem do Template:
                    </label>
                    <textarea
                      ref={templateTextareaRef}
                      rows={14}
                      value={
                        selectedTemplateTab === 'conf_cliente'
                          ? templateConfCliente
                          : selectedTemplateTab === 'conf_prop'
                          ? templateConfProp
                          : selectedTemplateTab === 'lemb_cliente'
                          ? templateLembCliente
                          : selectedTemplateTab === 'lemb_prop'
                          ? templateLembProp
                          : selectedTemplateTab === 'comprovacao_prop'
                          ? templateComprovacaoProp
                          : templatePosVisita
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (selectedTemplateTab === 'conf_cliente') setTemplateConfCliente(val);
                        else if (selectedTemplateTab === 'conf_prop') setTemplateConfProp(val);
                        else if (selectedTemplateTab === 'lemb_cliente') setTemplateLembCliente(val);
                        else if (selectedTemplateTab === 'lemb_prop') setTemplateLembProp(val);
                        else if (selectedTemplateTab === 'comprovacao_prop') setTemplateComprovacaoProp(val);
                        else if (selectedTemplateTab === 'pos_visita') setTemplatePosVisita(val);
                      }}
                      className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-sans leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-y"
                      placeholder="Digite o texto da mensagem..."
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>💡 Formatação WhatsApp: <code>*negrito*</code>, <code>_itálico_</code>, <code>~riscado~</code></span>
                    <span>Modo de edição contínua</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSaving}
                      className="w-full sm:w-auto shadow-md font-bold text-xs"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Templates WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* LADO DIREITO: PRÉVIA EM TEMPO REAL (WHATSAPP MOCKUP) */}
            <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  Prévia em Tempo Real (WhatsApp)
                </span>
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Live Sync
                </span>
              </div>

              {/* Mockup do WhatsApp */}
              <div className="rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-xl bg-[#efeae2] dark:bg-[#0b141a] flex flex-col min-h-[480px]">
                {/* Header do WhatsApp */}
                <div className="bg-[#008069] dark:bg-[#1f2c34] text-white p-3.5 flex items-center justify-between shadow-md shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-white/20 text-white font-bold flex items-center justify-center text-xs shrink-0 border border-white/30">
                      {selectedTemplateTab.includes('prop') ? 'CE' : 'LF'}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs leading-tight truncate text-white">
                        {selectedTemplateTab.includes('prop')
                          ? sampleContext.proprietario_nome
                          : sampleContext.cliente_nome}
                      </h5>
                      <span className="text-[10px] text-emerald-100 dark:text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                        online
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-white/80 shrink-0">
                    <Video className="w-4 h-4" />
                    <Phone className="w-3.5 h-3.5" />
                    <MoreVertical className="w-4 h-4" />
                  </div>
                </div>

                {/* Área de Mensagens com Fundo WhatsApp */}
                <div className="flex-1 p-3.5 flex flex-col justify-between space-y-3 overflow-y-auto">
                  {/* Badge de Data */}
                  <div className="self-center my-1 px-3 py-0.5 rounded-lg bg-white/80 dark:bg-slate-900/80 text-[10px] font-bold text-slate-500 dark:text-slate-400 shadow-2xs border border-black/5 dark:border-white/5">
                    HOJE
                  </div>

                  {/* Balão de Mensagem Enviada */}
                  <div className="self-end max-w-[94%] sm:max-w-[88%] rounded-2xl rounded-tr-xs bg-[#dcf8c6] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] p-3.5 shadow-sm border border-[#c3e6b5] dark:border-[#025144] space-y-1.5 relative">
                    <div className="font-sans text-xs leading-relaxed break-words">
                      {renderWhatsAppFormattedHtml(
                        compileTemplate(
                          selectedTemplateTab === 'conf_cliente'
                            ? templateConfCliente
                            : selectedTemplateTab === 'conf_prop'
                            ? templateConfProp
                            : selectedTemplateTab === 'lemb_cliente'
                            ? templateLembCliente
                            : selectedTemplateTab === 'lemb_prop'
                            ? templateLembProp
                            : selectedTemplateTab === 'comprovacao_prop'
                            ? templateComprovacaoProp
                            : templatePosVisita,
                          sampleContext
                        )
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-1 text-[10px] text-[#667781] dark:text-emerald-200/70 pt-0.5">
                      <span>{selectedTemplateTab === 'pos_visita' ? '16:30' : '14:30'}</span>
                      <span className="text-[#53bdeb] font-extrabold text-xs">✓✓</span>
                    </div>
                  </div>

                  {/* Barra Simulada de Envio */}
                  <div className="pt-2">
                    <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Smile className="w-4 h-4 text-slate-400" />
                        <span className="text-[11px]">Mensagem...</span>
                      </div>
                      <Mic className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ABA 3: AUTOMAÇÃO CRON (LEMBRETES & PÓS-VISITA) */}
      {activeTab === 'automacao' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                Automação de Lembretes (1h antes) e Pós-Visita (2h depois)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                O sistema possui uma rotina de verificação contínua que identifica visitas agendadas para a próxima 1 hora (lembrete) e visitas realizadas há 2 horas (pesquisa de pós-visita/feedback), disparando automaticamente as notificações.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Executar Rotina de Automação Agora
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Testa a lógica do Cron Job e dispara mensagens pendentes.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleExecutarLembretesAgora}
                  isLoading={isExecutingCron}
                  variant="primary"
                  size="sm"
                  className="shrink-0"
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  Executar Verificação
                </Button>
              </div>

              {/* Console de Logs */}
              {cronLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Resultado da Execução:
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black text-emerald-400 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
                    {cronLogs.map((log, idx) => (
                      <div key={idx}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações da Edge Function / Cron Supabase */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Configuração de Cron no Supabase (pg_cron)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Para habilitar o disparo automático no Supabase a cada 5 minutos, você pode chamar o endpoint HTTP:
              </p>
              <code className="block p-3 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 break-all select-all whitespace-pre">
{`SELECT cron.schedule('verificar-notificacoes-easymob', '*/5 * * * *', $$
  SELECT net.http_post(
    url:='https://SEU-DOMINIO.com/api/cron/lembretes',
    headers:='{"Content-Type": "application/json"}'::jsonb
  );
$$);`}
              </code>
            </CardContent>
          </Card>

          {/* Card de Reset Operacional & Seeding */}
          <Card className="border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Reset Operacional &amp; População de Dados de Teste (Seed)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Esta rotina limpa as tabelas operacionais (visitas, imóveis, clientes, proprietários e logs) e popula automaticamente <strong>30 proprietários</strong>, <strong>80 imóveis variados</strong>, <strong>50 clientes</strong> e <strong>~38 agendamentos de visitas</strong> distribuídos nos próximos 30 dias (sendo 18 com múltiplos imóveis no roteiro). Todas as contas de usuários e convites são mantidas intactas.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Executar Seed de Dados de Teste
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Endpoint: <code className="font-mono text-emerald-600 dark:text-emerald-400">POST /api/admin/seed-test-data</code>
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleSeedData}
                  isLoading={isSeeding}
                  variant="primary"
                  size="sm"
                  className="shrink-0 font-bold shadow-md"
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  Limpar e Popular Base
                </Button>
              </div>

              {seedResult && (
                <div className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs border border-emerald-800">
                  {seedResult}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

