import { ConfiguracaoWhatsApp, Imovel, Cliente, Visita, WhatsAppLog, Proprietario } from '@/types';
import { generateTestSeedData } from './seedGenerator';
import { DEFAULT_WHATSAPP_TEMPLATES } from './whatsapp';

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
  ativo: false,
  envio_automatico_ativo: false,
  enviar_confirmacao_cliente: true,
  enviar_confirmacao_proprietario: true,
  enviar_lembrete_cliente: true,
  enviar_lembrete_proprietario: true,
  enviar_pos_visita_cliente: true,
  enviar_comprovacao_proprietario: true,
  gravar_logs_cliente: true,
  gravar_logs_proprietario: true,
  ...DEFAULT_WHATSAPP_TEMPLATES,
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
