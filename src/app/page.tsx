'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  CalendarDays,
  MessageSquare,
  MapPin,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Building2,
  Zap,
  Lock,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  HelpCircle,
  Award,
  Layers,
  Scale,
  TrendingUp,
  Flame,
  Check,
  PhoneCall,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { EasyMobLogo } from '@/components/ui/EasyMobLogo';

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Redirecionamento de Usuário Autenticado: se já houver sessão ativa, vai direto para a rota principal (/dashboard - Hoje)
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const WHATSAPP_SUPPORT_URL =
    'https://wa.me/5535991179596?text=Ol%C3%A1%21+Gostaria+de+saber+mais+sobre+o+EasyMob+e+agendar+uma+demonstra%C3%A7%C3%A3o.';

  const faqs = [
    {
      q: 'Como funciona a conexão com o WhatsApp?',
      a: 'É extremamente simples e rápida: basta escanear um QR Code diretamente na tela de configurações com o seu aplicativo do WhatsApp, exatamente como você faz no WhatsApp Web. Não é necessário CNPJ de desenvolvedor nem aprovações burocráticas da Meta.',
    },
    {
      q: 'Como o Relatório de Atendimento em PDF protege minhas comissões (Art. 727 do Código Civil)?',
      a: 'O EasyMob registra e carimba com data, hora e IP todo o histórico de interações, confirmações de visita, localização enviada e logs de mensagens trocadas com o cliente. O Relatório de Atendimento em PDF gerado serve como robusto meio de comprovação da aproximação útil entre comprador e imóvel realizada pelo corretor.',
    },
    {
      q: 'Posso usar o EasyMob sozinho ou com minha equipe de corretores?',
      a: 'Ambos! O Plano Essencial e o Plano Pro (até 3 corretores) são ideais para corretores autônomos e equipes enxutas que buscam máxima produtividade e blindagem jurídica. Já o Plano Imobiliária (até 10 corretores) permite gerenciar equipes maiores com múltiplos corretores e painel multi-tenant com relatórios consolidados.',
    },
    {
      q: 'Os lembretes de visita automáticos realmente reduzem os no-shows (bolos)?',
      a: 'Sim! Nossos clientes relatam uma redução média de mais de 75% em faltas e atrasos. O envio imediato dos dados da visita com link do Google Maps somado ao lembrete 1 hora antes garante que o cliente se planeje e confirme a presença.',
    },
    {
      q: 'Preciso instalar algum aplicativo pesado no computador?',
      a: 'Não. O EasyMob é 100% web e na nuvem, acessível de qualquer computador, tablet ou smartphone. Ele também é um Progressive Web App (PWA), permitindo ser instalado na tela inicial do seu celular com 1 clique.',
    },
  ];

  // Se estiver verificando a sessão ou já autenticado, exibe tela de transição suave
  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Acessando o sistema...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white antialiased overflow-x-hidden font-sans">
      {/* ─── BACKGROUND SUBTLE GLOWS (LIGHT THEME) ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/5 blur-[140px] rounded-full" />
        <div className="absolute top-[35%] -left-60 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
        <div className="absolute top-[70%] -right-60 w-[600px] h-[600px] bg-emerald-600/5 blur-[160px] rounded-full" />
      </div>

      {/* ─── NAVBAR PÚBLICA (LIGHT THEME) ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-slate-200/80 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <EasyMobLogo variant="horizontal" size="md" />
          </Link>

          {/* Links desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#operacao" className="hover:text-emerald-600 transition-colors">
              Operação 360°
            </a>
            <a href="#rastreabilidade" className="hover:text-emerald-600 transition-colors">
              Rastreabilidade &amp; Automação
            </a>
            <a href="#planos" className="hover:text-emerald-600 transition-colors">
              Planos &amp; Preços
            </a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">
              Dúvidas
            </a>
          </nav>

          {/* Botões de Ação */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-xs"
            >
              Acessar Plataforma
            </Link>
            <a
              href="#planos"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Testar Grátis</span>
            </a>
          </div>
        </div>
      </header>

      {/* ─── 1. HERO SECTION (LIGHT THEME) ─── */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold shadow-xs mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>EasyMob — Gestão Inteligente e Proteção Completa para Suas Visitas</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-5xl mx-auto">
          A plataforma intuitiva que organiza a rotina da sua imobiliária,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
            gera relatórios de desempenho
          </span>{' '}
          e ajuda a proteger suas comissões.
        </h1>

        {/* Subtítulo */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
          O EasyMob acaba com o caos das planilhas e cadernos. Uma solução completa e visual para gerenciar seus imóveis, proprietários e clientes em um só lugar.
        </p>

        {/* Botões do Hero */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <a
            href="#planos"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-extrabold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-2xl shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Ver Planos &amp; Testar Grátis</span>
            <ArrowRight className="w-5 h-5" />
          </a>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl transition-all hover:text-slate-900 shadow-xs"
          >
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Acessar Plataforma</span>
          </Link>
        </div>

        {/* Micro Provas Sociais / Garantias */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Sem necessidade de instalação</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>QR Code Instantâneo via WhatsApp</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Amparo ao Art. 727 do Código Civil</span>
          </div>
        </div>

        {/* ─── Hero UI Mockup Visual Interativo (Light Mode) ─── */}
        <div className="mt-16 relative mx-auto max-w-5xl rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-slate-200/70 via-slate-100/60 to-slate-200/40 border border-slate-200 shadow-2xl shadow-slate-300/50">
          <div className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-8 overflow-hidden text-left relative shadow-sm">
            {/* Barra superior de janela de app */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-slate-500 ml-2">EasyMob Suite — Painel Operacional</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>WhatsApp Conectado &amp; Operando</span>
              </div>
            </div>

            {/* Grid interna do mockup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Próxima Visita */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Próxima Visita</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Hoje 15:30</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-slate-900">Cobertura Duplex Jardins</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Rua Oscar Freire, 1420</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Cliente: <strong className="text-slate-800">Carlos Eduardo</strong></span>
                  <span className="text-emerald-700 font-bold">Agendada</span>
                </div>
              </div>

              {/* Card 2: Automação Ativa */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/60 border border-emerald-200/70 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Automação de WhatsApp</span>
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-slate-700 font-medium">Lembrete disparado 1h antes com link do Maps:</p>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-700 font-mono shadow-xs">
                    💬 &quot;Olá Carlos! Sua visita é às 15:30. Veja a rota no Maps: bit.ly/visita-391&quot;
                  </div>
                </div>
              </div>

              {/* Card 3: Relatório de Atendimento */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Comprovante de Atendimento</span>
                  <Scale className="w-4 h-4 text-teal-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-800 font-semibold">Relatório de Atendimento em PDF</p>
                  <p className="text-[11px] text-slate-500">Comprovação de aproximação útil (Art. 727 CC) com logs auditáveis.</p>
                </div>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700">
                    <FileText className="w-3.5 h-3.5" /> PDF Gerado com 1 Clique
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. MÓDULO: ORGANIZAÇÃO TOTAL DA SUA OPERAÇÃO (LIGHT THEME) ─── */}
      <section id="operacao" className="relative z-10 py-24 bg-slate-100/70 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho da Seção */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider shadow-xs">
              <Layers className="w-3.5 h-3.5" />
              <span>Módulo de Gestão Operacional</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Organização Total da Sua Operação Imobiliária
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Controle cada detalhe do dia a dia dos corretores, imóveis e clientes sem complicação e com total agilidade.
            </p>
          </div>

          {/* Grid de Funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/40 transition-all group space-y-4 hover:shadow-xl hover:shadow-emerald-500/5 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Visão 360° por Cliente e Imóvel</h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong className="text-slate-900">No Perfil do Cliente:</strong> Histórico completo e detalhado de todos os imóveis já visitados.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong className="text-slate-900">No Perfil do Imóvel:</strong> Quantidade de visitas recebidas e o feedback/retorno de cada uma.</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/40 transition-all group space-y-4 hover:shadow-xl hover:shadow-emerald-500/5 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Agenda Visual e Intuitiva</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Acompanhe o fluxo de compromissos por <strong className="text-slate-900">dia, semana ou mês</strong> em um painel moderno com linha do tempo e status codificados por cores (Agendada, Realizada, Cancelada).
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-teal-700">
                <Clock className="w-4 h-4" />
                <span>Contagem regressiva em tempo real para a próxima visita</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/40 transition-all group space-y-4 hover:shadow-xl hover:shadow-emerald-500/5 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Recursos Rápidos de Campo</h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
                  <span><strong className="text-slate-900">Navegação via Google Maps:</strong> Botão de 1 clique no imóvel ou visita para abrir a rota direta no GPS.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
                  <span><strong className="text-slate-900">Agilidade no WhatsApp:</strong> Início de conversa imediato sem precisar salvar o número na agenda.</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/40 transition-all group space-y-4 hover:shadow-xl hover:shadow-emerald-500/5 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Relatórios de Desempenho</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Métricas completas de atendimentos realizados, taxa de conversão, índice de pontualidade e desempenho individual por corretor ou geral da imobiliária.
              </p>
            </div>

            {/* Feature 5 (Ficha Pública do Imóvel - Copywriting Atualizado) */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/40 transition-all group space-y-4 hover:shadow-xl hover:shadow-emerald-500/5 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Ficha Pública do Imóvel</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Envie com 1 clique o link público e responsivo do imóvel diretamente para o WhatsApp do cliente, com fotos em alta definição e a marca da sua imobiliária.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/40 transition-all group space-y-4 hover:shadow-xl hover:shadow-emerald-500/5 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Multiplataforma &amp; PWA Mobile</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Acesse do celular, tablet ou computador. Interface otimizada com suporte a modo escuro/claro e navegação fluida em campo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. MÓDULO: CONEXÃO INSTANTÂNEA E AJUDA NA PROTEÇÃO JURÍDICA (LIGHT THEME) ─── */}
      <section id="rastreabilidade" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Lado Esquerdo: Textos e Benefícios */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-extrabold uppercase tracking-wider shadow-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>Automação &amp; Rastreabilidade</span>
            </div>

            {/* Headline Atualizada conforme requisito */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Conexão Instantânea e Ajuda na Proteção Jurídica para Suas Comissões
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              O EasyMob cuida da comunicação com o cliente e constrói uma esteira de evidências auditável de todos os seus atendimentos.
            </p>

            {/* Lista com destaques */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Conexão via QR Code sem Burocracia</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Conecte o número de WhatsApp da sua imobiliária em menos de 30 segundos escaneando o QR Code, sem precisar de aprovação complexa da Meta.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Notificações e Lembretes Automáticos</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Envio automático dos dados do imóvel + link de localização do Maps no momento do agendamento, e lembrete disparado <strong className="text-slate-900">1 hora antes da visita</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-200">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Histórico e Retenção de Logs</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Captura e retenção segura de todos os logs da conversa desde o agendamento até 48 horas após a visita.
                  </p>
                </div>
              </div>

              {/* Nomenclatura atualizada: Relatório de Atendimento em PDF */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm sm:text-base">Relatório de Atendimento em PDF (Art. 727 do Código Civil)</h4>
                  <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
                    Gere em 1 clique um relatório consolidado com data, hora, mensagens trocadas e imóveis visitados para comprovação de aproximação útil e suporte ao departamento jurídico em caso de disputa de honorários.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: Preview do Relatório de Atendimento em PDF (Light Mode) */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-white border border-emerald-200/90 p-6 sm:p-8 shadow-xl shadow-slate-200/70 space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Relatório de Atendimento &amp; Aproximação Útil</h4>
                    <p className="text-[11px] text-slate-500">Documento Oficial Auditável — Art. 727 CC</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Relatório Auditável em PDF
                </span>
              </div>

              {/* Corpo Simulado do Relatório de Atendimento */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Corretor Responsável:</span>
                    <strong className="text-slate-900">Roger Vasques Berchembrock</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Cliente Comprador:</span>
                    <strong className="text-slate-900">Carlos Eduardo Menezes</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Imóvel Visitado:</span>
                    <strong className="text-slate-900">Apartamento 802 — Reserva Bela Vista</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Data e Hora:</span>
                    <strong className="text-emerald-700 font-bold">24/08/2026 às 15:30h</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Trilha de Auditoria &amp; Registro de Conversas:
                  </span>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-slate-700 space-y-1 shadow-xs">
                    <p className="text-emerald-700 font-semibold">[14:30] Sistema: Disparo de lembrete com link de localização Maps enviado.</p>
                    <p className="text-slate-700">[14:32] Cliente: &quot;Confirmadíssimo! Estou chegando no endereço.&quot;</p>
                    <p className="text-slate-700">[15:30] Corretor: Visita iniciada e registrada no sistema.</p>
                  </div>
                </div>
              </div>

              {/* Rodapé do Card */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Proteção garantida contra bypass de comissão</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1">
                  Ver modelo completo <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. SEÇÃO DE PLANOS E PREÇOS (TABELA DE PRECIFICAÇÃO ATUALIZADA) ─── */}
      <section id="planos" className="relative z-10 py-24 bg-slate-100/70 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Planos Transparentes</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Invista no crescimento e segurança da sua imobiliária
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Escolha o plano ideal para o momento da sua carreira ou imobiliária. Cancele quando quiser, sem fidelidade.
            </p>

            {/* Toggle Mensal / Anual */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <div className="p-1 rounded-2xl bg-white border border-slate-200 inline-flex items-center shadow-xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle('mensal')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    billingCycle === 'mensal'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('anual')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                    billingCycle === 'anual'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Anual</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    2 meses grátis
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Cards de Preços Atualizados */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* 1. Plano Essencial: R$ 78,00 /mês */}
            <div className="rounded-3xl p-8 bg-white border border-slate-200/90 flex flex-col justify-between hover:border-slate-300 transition-all space-y-6 shadow-sm hover:shadow-md">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Plano Essencial</h3>
                  <p className="text-xs text-slate-500 mt-1">Para quem quer organizar a casa e abandonar de vez as planilhas.</p>
                </div>

                <div className="py-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-500">R$</span>
                    <span className="text-4xl font-black text-slate-900">
                      {billingCycle === 'mensal' ? '78' : '65'}
                    </span>
                    <span className="text-slate-500 text-xs font-medium">/ mês</span>
                  </div>
                  {billingCycle === 'anual' && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">Cobrado anualmente (R$ 780/ano)</p>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100 text-sm text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Cadastros ilimitados de imóveis, proprietários e clientes</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Agenda visual (Dia / Semana / Mês) e histórico de visitas</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Link direto para navegação no Google Maps</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Atalho para iniciar conversas no WhatsApp com 1 clique</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Relatórios de desempenho de visitas</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full py-3.5 px-4 text-center rounded-2xl text-sm font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:text-slate-900 transition-all block"
              >
                Começar com Essencial
              </Link>
            </div>

            {/* 2. Plano Pro (Campeão): R$ 168,00 /mês (até 3 corretores) */}
            <div className="rounded-3xl p-8 bg-gradient-to-b from-emerald-50/70 via-white to-white border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 flex flex-col justify-between relative transform lg:-translate-y-2 transition-all space-y-6">
              {/* Badge de Campeão */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-white text-white" />
                <span>Mais Escolhido (Campeão)</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-slate-900">Plano Pro</h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Até 3 corretores
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Organização total + Notificações automáticas + Relatório de Atendimento em PDF.</p>
                </div>

                <div className="py-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-500">R$</span>
                    <span className="text-5xl font-black text-slate-900">
                      {billingCycle === 'mensal' ? '168' : '140'}
                    </span>
                    <span className="text-slate-500 text-xs font-medium">/ mês</span>
                  </div>
                  {billingCycle === 'anual' && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">Cobrado anualmente (R$ 1.680/ano)</p>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200/80 text-sm text-slate-700">
                  <div className="flex items-start gap-2.5 font-bold text-emerald-700">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Tudo do Plano Essencial, mais:</span>
                  </div>
                  <div className="flex items-start gap-2.5 font-semibold text-slate-900">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Voltado para até 3 corretores da equipe</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Conexão simplificada de WhatsApp via QR Code</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Envio automático dos dados da visita</strong> com link de localização</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Lembretes automáticos</strong> (Agendamento + 1 hora antes)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Salvamento de logs de conversa</strong> (do agendamento até 48h pós-visita)</span>
                  </div>
                  <div className="flex items-start gap-2.5 font-semibold text-emerald-800">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Gerador de Relatório de Atendimento em PDF</strong> (Art. 727 CC)</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full py-4 px-4 text-center rounded-2xl text-sm font-black text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all block"
              >
                Assinar Plano Pro Agora
              </Link>
            </div>

            {/* 3. Plano Imobiliária: R$ 284,00 /mês (até 10 corretores) */}
            <div className="rounded-3xl p-8 bg-white border border-slate-200/90 flex flex-col justify-between hover:border-slate-300 transition-all space-y-6 shadow-sm hover:shadow-md">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">Plano Imobiliária</h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Até 10 corretores
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Para equipes médias e grandes com múltiplos corretores.</p>
                </div>

                <div className="py-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-500">R$</span>
                    <span className="text-4xl font-black text-slate-900">
                      {billingCycle === 'mensal' ? '284' : '236'}
                    </span>
                    <span className="text-slate-500 text-xs font-medium">/ mês</span>
                  </div>
                  {billingCycle === 'anual' && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">Cobrado anualmente (R$ 2.840/ano)</p>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100 text-sm text-slate-600">
                  <div className="flex items-start gap-2.5 font-bold text-emerald-700">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Tudo do Plano Pro para até 10 corretores</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Relatórios consolidados por equipe e corretor</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Gestão Multi-Tenant de Imobiliárias e Permissões</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Acompanhamento de metas de visitas da equipe</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Suporte prioritário via WhatsApp</span>
                  </div>
                </div>
              </div>

              <a
                href={WHATSAPP_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 text-center rounded-2xl text-sm font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:text-slate-900 transition-all block"
              >
                Falar com Especialista
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ (DÚVIDAS FREQUENTES - LIGHT THEME) ─── */}
      <section id="faq" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider shadow-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tire Suas Dúvidas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Perguntas Frequentes sobre o EasyMob
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <span className="text-base sm:text-lg">{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. CHAMADA PARA AÇÃO FINAL (CTA) ─── */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 text-center space-y-8 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Evolua a gestão da sua imobiliária hoje mesmo!
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Junte-se a corretores e imobiliárias que transformaram visitas em fechamentos seguros, eliminaram faltas e blindaram juridicamente suas comissões com o EasyMob.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-extrabold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-2xl shadow-xl shadow-emerald-950/80 hover:shadow-emerald-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Criar Minha Conta / Começar Agora</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={WHATSAPP_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-bold text-slate-200 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all hover:text-white"
            >
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>Falar com Suporte no WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER (LIGHT THEME) ─── */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-2">
            <EasyMobLogo variant="horizontal" size="sm" />
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Plataforma de gestão imobiliária inteligente, automação de WhatsApp e blindagem de comissões para corretores e imobiliárias.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#operacao" className="hover:text-emerald-600 transition-colors">
              Operação
            </a>
            <a href="#rastreabilidade" className="hover:text-emerald-600 transition-colors">
              Rastreabilidade
            </a>
            <a href="#planos" className="hover:text-emerald-600 transition-colors">
              Planos
            </a>
            <Link href="/login" className="hover:text-emerald-600 transition-colors">
              Login
            </Link>
            <a href={WHATSAPP_SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors">
              Atendimento WhatsApp
            </a>
          </div>

          <div className="text-xs text-slate-500">
            <p>© {new Date().getFullYear()} EasyMob. Todos os direitos reservados.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Amparo técnico e rastreabilidade conforme o Art. 727 do Código Civil Brasileiro.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
