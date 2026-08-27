export type TipoImovel = 'apartamento' | 'casa' | 'terreno' | 'comercial' | 'cobertura';
export type FinalidadeImovel = 'venda' | 'locacao' | 'ambos';
export type StatusImovel = 'disponivel' | 'reservado' | 'vendido' | 'alugado' | 'inativo';

export interface Imobiliaria {
  id: string;
  nome: string;
  slug?: string;
  logo_url?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  ativo?: boolean;
  modulo_crm_ativo?: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export interface Proprietario {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  documento?: string;
  chave_pix?: string;
  banco_nome?: string;
  imoveis_count?: number;
  observacoes?: string;
  imobiliaria_id?: string;
  imobiliaria?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface Imovel {
  id: string;
  codigo: string;
  titulo: string;
  tipo: TipoImovel;
  finalidade: FinalidadeImovel;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep?: string;
  valor_venda?: number | null;
  valor_locacao?: number | null;
  valor_condominio?: number | null;
  valor_iptu?: number | null;
  quartos: number;
  suites?: number;
  banheiros: number;
  vagas: number;
  area_util?: number | null;
  area_construida?: number | null;
  area_terreno?: number | null;
  aceita_pet?: boolean;
  descricao_comercial?: string | null;
  caracteristicas?: string[];
  proprietario_id?: string | null;
  proprietario_nome: string;
  proprietario_telefone: string;
  proprietario_email?: string;
  proprietario?: Proprietario;
  observacoes_chaves?: string;
  status: StatusImovel;
  imagem_url?: string;
  fotos_urls?: string[];
  imobiliaria_id?: string;
  imobiliaria?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export type StatusCliente = 'ativo' | 'negociando' | 'fechado' | 'inativo';
export type OrigemLead = 'site' | 'portal' | 'indicacao' | 'instagram' | 'whatsapp' | 'placa';
export type EtapaCRM =
  | 'novos_leads'
  | 'qualificacao'
  | 'agendamento_visita'
  | 'proposta_negociacao'
  | 'documentacao_credito'
  | 'fechamento_contrato'
  | 'venda_concluida';

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  tipo_cliente?: 'comprador_inquilino' | 'proprietario';
  perfil_interesse?: string;
  faixa_orcamento?: string;
  origem_lead?: OrigemLead;
  status: StatusCliente;
  etapa_crm?: EtapaCRM;
  imovel_interesse_id?: string;
  imovel_interesse_titulo?: string;
  imovel_interesse_foto?: string;
  corretor_responsavel_nome?: string;
  corretor_responsavel_id?: string;
  prioridade?: 'alta' | 'media' | 'baixa';
  tempo_parada_texto?: string;
  observacoes?: string;
  imobiliaria_id?: string;
  imobiliaria?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export type StatusVisita = 'agendada' | 'cancelada' | 'reagendada' | 'concluida' | 'nao_compareceu';
export type StatusDisparoWhatsApp =
  | 'pendente'
  | 'enviado'
  | 'entregue'
  | 'lido'
  | 'visualizado'
  | 'falha'
  | 'cancelado'
  | 'ignorado'
  | 'inativo';

export interface Visita {
  id: string;
  imovel_id: string;
  imoveis_ids?: string[]; // IDs de múltiplos imóveis no roteiro
  cliente_id: string;
  corretor_nome?: string;
  corretor_telefone?: string;
  data_hora_visita: string;
  lembrete_agendado_para?: string;
  pos_visita_agendado_para?: string;
  
  // Vínculo de Imobiliária / Tenant
  imobiliaria_id?: string;
  imobiliaria?: string;

  // Vínculo do usuário criador (Multi-Instância)
  created_by_user_id?: string;
  created_by_user_nome?: string;

  // Preferências de Notificação & Comprovante de Atendimento
  notificar_confirmacao?: boolean;
  notificar_confirmacao_cliente?: boolean;
  notificar_confirmacao_proprietario?: boolean;
  notificar_lembrete?: boolean;
  notificar_lembrete_cliente?: boolean;
  notificar_lembrete_proprietario?: boolean;
  notificar_pos_visita?: boolean;
  notificar_comprovacao_proprietario?: boolean;
  gravar_logs?: boolean; // Flag geral de gravação
  gravar_logs_cliente?: boolean; // Gravar histórico do atendimento com o Cliente (Ativo na criação até +48h)
  gravar_logs_proprietario?: boolean; // Gravar histórico do atendimento com o Proprietário (Ativo na criação até +48h)
  fim_gravacao_logs_em?: string; // Data limite da gravação contínua (+48h após conclusão/cancelamento)

  status: StatusVisita;
  whatsapp_confirmacao_cliente: StatusDisparoWhatsApp;
  whatsapp_confirmacao_proprietario: StatusDisparoWhatsApp;
  whatsapp_lembrete_cliente: StatusDisparoWhatsApp;
  whatsapp_lembrete_proprietario: StatusDisparoWhatsApp;
  whatsapp_pos_visita_cliente?: StatusDisparoWhatsApp;
  whatsapp_comprovacao_proprietario?: StatusDisparoWhatsApp;
  feedback_cliente?: string;
  feedback_proprietario?: string;
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
  
  // Relacionamentos carregados
  imovel?: Imovel;
  imoveis?: Imovel[]; // Lista de imóveis do roteiro
  cliente?: Cliente;
  logs_mensagens?: LogMensagem[]; // Histórico de mensagens gravadas (Relatório de Atendimento)
}

export interface LogMensagem {
  id: string;
  visita_id: string;
  imobiliaria_id?: string;
  imobiliaria?: string;
  message_id: string; // ID único retornado pela Meta / Evolution API (ex: wamid.HBgL... / 3EB0...)
  timestamp: string; // Data e hora exatas com fuso horário (ex: 2026-08-24T14:35:10-03:00)
  remetente_tipo: 'CLIENTE' | 'CORRETOR' | 'PROPRIETARIO' | 'SISTEMA';
  remetente_nome?: string;
  remetente_telefone?: string;
  conteudo_texto: string;
  tipo_midia: 'texto' | 'imagem' | 'audio' | 'documento';
  midia_url?: string; // Link público para áudios ou fotos
  criado_em?: string;
}

export type ProvedorWhatsApp = 'evolution_api' | 'zapi' | 'meta_cloud' | 'custom_webhook';

export interface ConfiguracaoWhatsApp {
  id?: string;
  provedor: ProvedorWhatsApp;
  api_url: string;
  api_key: string;
  instancia_nome: string;
  imobiliaria_id?: string;
  imobiliaria?: string;
  ativo: boolean;
  template_confirmacao_cliente: string;
  template_confirmacao_proprietario: string;
  template_lembrete_cliente: string;
  template_lembrete_proprietario: string;
  template_comprovacao_proprietario?: string;
  template_pos_visita_cliente: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface WhatsAppLog {
  id?: string;
  visita_id?: string;
  imobiliaria_id?: string;
  imobiliaria?: string;
  tipo_mensagem: 'confirmacao_cliente' | 'confirmacao_proprietario' | 'lembrete_cliente' | 'lembrete_proprietario' | 'pos_visita_cliente' | 'comprovacao_proprietario' | 'avulsa';
  destinatario_nome: string;
  destinatario_telefone: string;
  tipo_destinatario: 'cliente' | 'proprietario' | 'corretor';
  conteudo_mensagem: string;
  status_envio: 'sucesso' | 'erro' | 'pendente';
  resposta_api?: unknown;
  erro_detalhes?: string;
  criado_em?: string;
}

export interface DashboardMetrics {
  totalVisitasHoje: number;
  visitasAgendadasHoje: number;
  visitasCanceladasHoje: number;
  visitasRealizadasHoje: number;
  totalImoveisAtivos: number;
  totalClientesAtivos: number;
}

export type UserRole = 'admin' | 'gestor' | 'corretor';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  senha_hash?: string;
  role: UserRole;
  imobiliaria: string;
  imobiliaria_id?: string;
  instance_name?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Convite {
  id: string;
  token: string;
  imobiliaria: string;
  imobiliaria_id?: string;
  role?: UserRole;
  expires_at: string;
  used: boolean;
  created_at?: string;
}



