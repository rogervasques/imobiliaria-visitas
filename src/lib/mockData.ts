import { ConfiguracaoWhatsApp, Imovel, Cliente, Visita, WhatsAppLog, Proprietario } from '@/types';
import { generateTestSeedData } from './seedGenerator';

const defaultGenerated = generateTestSeedData('user-admin-master', 'Roger Vasques Berchembrock');

export const mockProprietarios: Proprietario[] = defaultGenerated.proprietarios;
export const mockImoveis: Imovel[] = defaultGenerated.imoveis;
export const mockClientes: Cliente[] = defaultGenerated.clientes;
export const mockVisitas: Visita[] = defaultGenerated.visitas;

export const mockConfigWhatsApp: ConfiguracaoWhatsApp = {
  provedor: 'evolution_api',
  api_url: 'http://147.93.9.74:8080',
  api_key: 'easymob_secret_token_2026',
  instancia_nome: 'easymob',
  ativo: true,
  template_confirmacao_cliente:
    'Olá, {cliente_nome}! 👋 Confirmando nossa visita para *{data_hora}*.\n\n📍 *Roteiro de Imóveis:*\n{roteiro_imoveis}\n\n👤 *Corretor:* {corretor_nome} ({corretor_telefone})\n\nQualquer dúvida, conte com a *EasyMob*!',
  template_confirmacao_proprietario:
    'Olá, {proprietario_nome}! Informamos que a equipe *EasyMob* agendou uma visita ao seu imóvel *{imovel_titulo}* ({endereco}) para *{data_hora}* com o cliente {cliente_nome}.\n\n👤 *Corretor:* {corretor_nome}\n*EasyMob - Gestão Imobiliária Inteligente*',
  template_lembrete_cliente:
    '⏰ *Lembrete de Visita (em 1 hora)*\n\nOlá, {cliente_nome}! Lembramos que sua visita aos imóveis acontecerá hoje às *{horario}*.\n\n📍 *Roteiro:*\n{roteiro_imoveis}\n\n👤 *Corretor:* {corretor_nome} ({corretor_telefone})\n\nNos vemos em breve!\n*EasyMob*',
  template_lembrete_proprietario:
    '⏰ *Lembrete de Visita (em 1 hora)*\n\nOlá, {proprietario_nome}! A *EasyMob* lembra que a visita ao seu imóvel *{imovel_titulo}* com o cliente {cliente_nome} acontecerá às *{horario}*.\n\n👤 *Corretor:* {corretor_nome}\n*EasyMob*',
  template_pos_visita_cliente:
    '✨ *Olá, {cliente_nome}! Tudo bem?*\n\nEsperamos que a visita de hoje tenha sido ótima!\n\n🏠 *Imóveis visitados:*\n{roteiro_imoveis}\n\nGostaríamos de saber: o que você achou dos imóveis? Algum deles chamou sua atenção ou despertou interesse para iniciarmos uma proposta?\n\nQualquer dúvida, estamos à sua inteira disposição!\n*EasyMob - Gestão Imobiliária Inteligente*',
};

export const mockLogs: WhatsAppLog[] = [
  {
    id: 'log-1',
    visita_id: 'vis-001',
    tipo_mensagem: 'confirmacao_cliente',
    destinatario_nome: 'Lucas Ferraz Souza',
    destinatario_telefone: '11998887766',
    tipo_destinatario: 'cliente',
    conteudo_mensagem: 'Olá, Lucas Ferraz Souza! Confirmando nossa visita para hoje...',
    status_envio: 'sucesso',
    criado_em: new Date().toISOString(),
  },
];
