'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Target,
  Search,
  Download,
  Share2,
  Compass,
  Pencil,
  Sliders,
} from 'lucide-react';
import { EasyMobLogo } from '@/components/ui/EasyMobLogo';

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
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
      q: 'Como funcionam os disparos de WhatsApp (com 1 clique ou automáticos)?',
      a: 'Você tem total flexibilidade: o EasyMob pode disparar lembretes automáticos e links de mapa diretamente pela integração conectada, ou você pode usar o botão de 1 clique que abre a mensagem pronta no próprio aplicativo do WhatsApp do corretor para envio imediato sem precisar salvar o contato na agenda.',
    },
    {
      q: 'Como o Relatório de Atendimento em PDF protege minhas comissões (Art. 727 do Código Civil)?',
      a: 'O EasyMob registra e carimba com data, hora e IP todo o histórico de interações, confirmações de visita, localização enviada e logs de mensagens trocadas com o cliente. O Relatório de Atendimento em PDF gerado serve como robusto meio de comprovação da aproximação útil entre comprador e imóvel realizada pelo corretor.',
    },
    {
      q: 'Posso personalizar o texto dos lembretes e mensagens de WhatsApp?',
      a: 'Sim! No painel de configurações da imobiliária, você tem um editor completo de templates para personalizar as saudações, variáveis dinâmicas (nome do cliente, horário, endereço do imóvel) e tom de voz dos disparos da sua equipe.',
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
          <nav className="hidden xl:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#operacao" className="hover:text-emerald-600 transition-colors">
              Operação 360°
            </a>
            <a href="#match" className="hover:text-emerald-600 transition-colors">
              Match de Imóveis
            </a>
            <a href="#whatsapp" className="hover:text-emerald-600 transition-colors">
              Automação WhatsApp
            </a>
            <a href="#rastreabilidade" className="hover:text-emerald-600 transition-colors">
              Rastreabilidade &amp; PDF
            </a>
            <a href="#mobile" className="hover:text-emerald-600 transition-colors">
              Ficha Pública
            </a>
            <a href="#planos" className="hover:text-emerald-600 transition-colors">
              Planos
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
              <span>Conhecer Planos</span>
            </a>
          </div>
        </div>
      </header>

      {/* ─── 1. HERO SECTION (COM MOCKUP REAL DO DASHBOARD) ─── */}
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
            <span>Conhecer os Planos</span>
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

        {/* ─── Hero UI Mockup com Print Real do Dashboard (1024x527) ─── */}
        <div className="mt-16 relative mx-auto max-w-5xl rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-slate-200/80 via-slate-100/60 to-slate-200/50 border border-slate-200/90 shadow-2xl shadow-slate-300/60">
          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden text-left relative shadow-sm">
            {/* Barra superior de janela estilo macOS/App */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="hidden sm:flex items-center gap-1.5 ml-3 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-400 text-xs font-mono">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>app.easymob.com.br/dashboard</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>WhatsApp Conectado &amp; Operando</span>
              </div>
            </div>

            {/* Imagem Real do Dashboard da Plataforma */}
            <div className="relative aspect-[1024/527] w-full bg-slate-100 overflow-hidden group">
              <Image
                src="/mockups/mockup-dashboard.png"
                alt="Dashboard EasyMob - Gestão do Dia e Agenda de Visitas"
                fill
                priority
                className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Badges Flutuantes Informativas */}
            <div className="p-4 bg-slate-50/90 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Gestão do Dia</h5>
                  <p className="text-[10px] text-slate-500">Linha do tempo de visitas e status em tempo real</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Automação WhatsApp</h5>
                  <p className="text-[10px] text-slate-500">Lembretes automáticos 1h antes com link do Maps</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Proteção Jurídica</h5>
                  <p className="text-[10px] text-slate-500">Relatório de Atendimento em PDF (Art. 727 CC)</p>
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

      {/* ─── 3. BLOCO VISUAL: MATCH INTELIGENTE DE IMÓVEIS COMPATÍVEIS ─── */}
      <section id="match" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Lado Esquerdo: Benefícios do Match */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider shadow-xs">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>Inteligência Comercial &amp; CRM</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Match Inteligente: Conecte o Cliente Certo ao Imóvel Ideal
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              O EasyMob cruza automaticamente o perfil de busca do comprador (bairros de interesse, faixa de valor, número de quartos e tipo de imóvel) com toda a carteira de imóveis da sua imobiliária.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Sugestões Instantâneas no Card do Cliente</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Ao abrir o cadastro do cliente, veja de imediato a lista de imóveis 100% compatíveis com o orçamento e as preferências dele.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Envio Direto no WhatsApp com 1 Clique</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Envie a ficha do imóvel compatível diretamente para o WhatsApp do cliente sem precisar copiar links ou digitar mensagens do zero.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-200">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Aceleração de Visitas &amp; Fechamentos</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Aumente o índice de conversão aproveitando o momento quente do lead com recomendações assertivas e personalizadas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: Print Real do Match de Imóveis */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-white border border-emerald-200 p-3 sm:p-4 shadow-xl shadow-slate-200/80 relative">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-3 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>Card do Cliente &bull; Imóveis Compatíveis</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Match Automático
                </span>
              </div>
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-2xs group">
                <Image
                  src="/mockups/mockup-match-imoveis.png"
                  alt="Match de Imóveis Compatíveis - EasyMob"
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 mt-3 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-semibold">Cruzamento instantâneo por valor, dormitórios e localização.</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  100% Automático <Check className="w-3.5 h-3.5 text-emerald-600" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. NOVO BLOCO VISUAL: DISPARO E AUTOMAÇÃO DE WHATSAPP ─── */}
      <section id="whatsapp" className="relative z-10 py-24 bg-slate-100/70 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho da Seção */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider shadow-xs">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Disparo e Automação de WhatsApp</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Comunicação Direta pelo WhatsApp do Corretor
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Notificações de visitas, fichas de imóveis e lembretes disparados com total controle e praticidade.
            </p>
          </div>

          {/* Grid com 4 Cards de Destaque */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Disparo com 1 Clique */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/40 transition-all group space-y-4 hover:shadow-xl hover:shadow-emerald-500/5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Disparo com 1 Clique</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Opção de abrir a mensagem pré-formatada diretamente no aplicativo do WhatsApp do próprio corretor para envio manual instantâneo, sem complicações.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1 border-t border-slate-100">
                <Check className="w-3.5 h-3.5" /> Envio rápido e sem salvar contato
              </div>
            </div>

            {/* Card 2: Notificações e Lembretes Automatizados */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/40 transition-all group space-y-4 hover:shadow-xl hover:shadow-emerald-500/5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Notificações e Lembretes</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Envio automático do link do Google Maps no agendamento e disparo de lembrete preventivo <strong className="text-slate-900">1 hora antes da visita</strong> para eliminar faltas.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-teal-700 flex items-center gap-1 border-t border-slate-100">
                <Check className="w-3.5 h-3.5" /> Reduz 75%+ dos cancelamentos
              </div>
            </div>

            {/* Card 3: Envio de Fichas de Imóveis */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/40 transition-all group space-y-4 hover:shadow-xl hover:shadow-emerald-500/5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Envio de Fichas de Imóveis</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Compartilhamento direto de imóveis com fotos em alta definição e link público personalizado, sem precisar cadastrar o número do lead na agenda telefônica.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-cyan-700 flex items-center gap-1 border-t border-slate-100">
                <Check className="w-3.5 h-3.5" /> Link público responsivo
              </div>
            </div>

            {/* Card 4: Templates Editáveis */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/40 transition-all group space-y-4 hover:shadow-xl hover:shadow-emerald-500/5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Pencil className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Templates Editáveis</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Editor de mensagens predefinidas nas configurações da imobiliária para você personalizar o tom de voz, saudações, variáveis e formato dos textos de disparo.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1 border-t border-slate-100">
                <Check className="w-3.5 h-3.5" /> 100% Customizável pela gestão
              </div>
            </div>
          </div>

          {/* Destaque Visual / Simulação de Conversa com QR Code Real */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200/90 shadow-xl shadow-slate-200/70 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Lado Esquerdo: Print do QR Code de Conexão */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative aspect-[4/3] w-full max-w-sm rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm group">
                <Image
                  src="/mockups/mockup-whatsapp-qrcode.png"
                  alt="Conexão Instantânea de WhatsApp via QR Code - EasyMob"
                  fill
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 mt-2.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Conexão segura via QR Code em menos de 30 segundos
              </span>
            </div>

            {/* Lado Direito: Preview de Mensagens Reais Disparadas */}
            <div className="lg:col-span-7 space-y-3 text-left">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                Exemplos de Mensagens Formatadas
              </span>

              {/* Balão 1: Agendamento */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800 space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                  <span>📅 Agendamento de Visita</span>
                  <span className="text-slate-400 font-normal">Disparo imediato</span>
                </div>
                <p className="font-mono text-[11px] text-slate-700 leading-relaxed">
                  &quot;Olá Carlos! Sua visita ao imóvel *Cobertura Duplex Jardins* foi agendada para hoje às 15:30 com o corretor Roger. Veja a rota no Maps: maps.google.com/?q=...&quot;
                </p>
              </div>

              {/* Balão 2: Lembrete 1h antes */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-slate-800 space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-teal-900">
                  <span>⏰ Lembrete Automático (1h antes)</span>
                  <span className="text-slate-400 font-normal">14:30</span>
                </div>
                <p className="font-mono text-[11px] text-slate-700 leading-relaxed">
                  &quot;Passando para lembrar que sua visita começa em 1 hora (às 15:30). O corretor já está a caminho. Confirma sua presença respondendo esta mensagem!&quot;
                </p>
              </div>

              {/* Balão 3: Envio de Ficha Pública */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                  <span>🏠 Ficha Pública Compartilhada</span>
                  <span className="text-slate-400 font-normal">1 clique</span>
                </div>
                <p className="font-mono text-[11px] text-slate-700 leading-relaxed">
                  &quot;Veja todos os detalhes e fotos em alta definição do imóvel que separamos para você: easymob.com.br/p/cobertura-jardins&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. MÓDULO: RASTREABILIDADE & RELATÓRIO AUDITÁVEL EM PDF (COM PRINT REAL) ─── */}
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

          {/* Lado Direito: Preview Real do Relatório de Atendimento em PDF */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-white border border-emerald-200/90 p-4 sm:p-6 shadow-xl shadow-slate-200/80 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Relatório de Atendimento Oficial</h4>
                    <p className="text-[11px] text-slate-500">Documento Auditável — Art. 727 CC</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  PDF Pronto para Download
                </span>
              </div>

              {/* Print Real do Documento em PDF */}
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-md group">
                <Image
                  src="/mockups/mockup-relatorio-pdf.png"
                  alt="Preview do Relatório de Atendimento em PDF Art 727 CC"
                  fill
                  className="object-contain p-2 bg-slate-100/50 transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Proteção garantida contra bypass de comissão</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1">
                  Documento Oficial com Carimbo <Check className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. BLOCO VISUAL: MOBILE / FICHA PÚBLICA DO IMÓVEL (SMARTPHONE MOCKUP) ─── */}
      <section id="mobile" className="relative z-10 py-24 bg-slate-100/70 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Lado Esquerdo: Print Real na Tela de Smartphone */}
          <div className="lg:col-span-5 flex justify-center">
            {/* Moldura de Smartphone Estilizada */}
            <div className="relative w-[300px] sm:w-[320px] rounded-[44px] bg-slate-900 p-3 shadow-2xl shadow-slate-400/50 border-4 border-slate-800">
              {/* Notch superior */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-20" />
              
              {/* Tela do Celular com a Imagem Real */}
              <div className="relative aspect-[9/18.5] w-full rounded-[34px] overflow-hidden bg-white border border-slate-800">
                <Image
                  src="/mockups/mockup-ficha-publica.png"
                  alt="Ficha Pública do Imóvel no Smartphone com Logo e Carrossel"
                  fill
                  className="object-cover object-top"
                />
              </div>

              {/* Botão Home Bar inferior */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>

          {/* Lado Direito: Textos e Benefícios da Ficha Pública */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-extrabold uppercase tracking-wider shadow-xs">
              <Smartphone className="w-3.5 h-3.5 text-teal-600" />
              <span>Experiência Mobile &amp; White Label</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Apresentação Impecável no Smartphone do Seu Cliente
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              Envie com 1 clique o link público e responsivo do imóvel diretamente para o WhatsApp do cliente, com fotos em alta definição e a marca da sua imobiliária.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">White Label com a Marca da Sua Imobiliária</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    O logotipo e as cores da sua imobiliária aparecem no topo da página, reforçando a autoridade e o profissionalismo da sua equipe.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Carrossel de Fotos em Alta Definição &amp; Tour</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Galeria de fotos fluida, detalhes de cômodos, mapa com localização e tour visual otimizado para carregar instantaneamente em qualquer conexão 4G/5G.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-200">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Botão Direto de Agendamento pelo WhatsApp</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    O cliente visualiza o imóvel e clica no botão principal para agendar a visita diretamente com o corretor responsável pelo anúncio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. SEÇÃO DE PLANOS E SOLUÇÕES ─── */}
      <section id="planos" className="relative z-10 py-24 bg-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Planos Sob Medida</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Soluções ideais para o tamanho da sua operação
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Escolha a estrutura ideal para corretores autônomos ou imobiliárias completas. Fale com nossa equipe para condições e demonstração personalizada.
            </p>
          </div>

          {/* Cards de Planos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* 1. Plano Essencial */}
            <div className="rounded-3xl p-8 bg-slate-50 border border-slate-200/90 flex flex-col justify-between hover:border-slate-300 transition-all space-y-6 shadow-sm hover:shadow-md">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Plano Essencial</h3>
                  <p className="text-xs text-slate-500 mt-1">Para quem quer organizar a casa e abandonar de vez as planilhas.</p>
                </div>

                <div className="py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">Sob consulta</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">Condições especiais para corretor autônomo</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200/70 text-sm text-slate-600">
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

              <a
                href={WHATSAPP_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 text-center rounded-2xl text-sm font-extrabold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 hover:text-slate-900 transition-all block shadow-xs"
              >
                Consultar Condições
              </a>
            </div>

            {/* 2. Plano Pro (Mais Escolhido) */}
            <div className="rounded-3xl p-8 bg-gradient-to-b from-emerald-50/70 via-white to-white border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 flex flex-col justify-between relative transform lg:-translate-y-2 transition-all space-y-6">
              {/* Badge de Destaque */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-white text-white" />
                <span>Mais Escolhido</span>
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
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-800">Sob consulta</span>
                  </div>
                  <p className="text-xs text-emerald-700 font-medium mt-1">Solução completa com automação de WhatsApp</p>
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

              <a
                href={WHATSAPP_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-4 text-center rounded-2xl text-sm font-black text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all block"
              >
                Falar com Especialista
              </a>
            </div>

            {/* 3. Plano Imobiliária */}
            <div className="rounded-3xl p-8 bg-slate-50 border border-slate-200/90 flex flex-col justify-between hover:border-slate-300 transition-all space-y-6 shadow-sm hover:shadow-md">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">Plano Imobiliária</h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                      Até 10 corretores
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Para equipes médias e grandes com múltiplos corretores.</p>
                </div>

                <div className="py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">Sob consulta</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">Projetos customizados para imobiliárias em escala</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200/70 text-sm text-slate-600">
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
                className="w-full py-3.5 px-4 text-center rounded-2xl text-sm font-extrabold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 hover:text-slate-900 transition-all block shadow-xs"
              >
                Falar com Especialista
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ (DÚVIDAS FREQUENTES - LIGHT THEME) ─── */}
      <section id="faq" className="relative z-10 py-24 bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
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

      {/* ─── 8. CHAMADA PARA AÇÃO FINAL (CTA) ─── */}
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
            <a href="#match" className="hover:text-emerald-600 transition-colors">
              Match de Imóveis
            </a>
            <a href="#whatsapp" className="hover:text-emerald-600 transition-colors">
              WhatsApp
            </a>
            <a href="#rastreabilidade" className="hover:text-emerald-600 transition-colors">
              Rastreabilidade
            </a>
            <a href="#mobile" className="hover:text-emerald-600 transition-colors">
              Ficha Pública
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
