export type TipoImovel = 'apartamento' | 'casa' | 'terreno' | 'comercial' | 'cobertura';
export type FinalidadeImovel = 'venda' | 'locacao' | 'ambos';
export type StatusImovel = 'disponivel' | 'reservado' | 'vendido' | 'alugado' | 'inativo';

export interface Proprietario {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
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
  criado_em?: string;
  atualizado_em?: string;
}

export type StatusCliente = 'ativo' | 'negociando' | 'fechado' | 'inativo';
export type OrigemLead = 'site' | 'portal' | 'indicacao' | 'instagram' | 'whatsapp' | 'placa';

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  perfil_interesse?: string;
  faixa_orcamento?: string;
  origem_lead?: OrigemLead;
  status: StatusCliente;
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export type StatusVisita = 'agendada' | 'confirmada' | 'cancelada' | 'reagendada';
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
  
  // Vínculo do usuário criador (Multi-Instância)
  created_by_user_id?: string;
  created_by_user_nome?: string;

  // Preferências de Notificação (Checkboxes)
  notificar_confirmacao?: boolean;
  notificar_lembrete?: boolean;
  notificar_pos_visita?: boolean;

  status: StatusVisita;
  whatsapp_confirmacao_cliente: StatusDisparoWhatsApp;
  whatsapp_confirmacao_proprietario: StatusDisparoWhatsApp;
  whatsapp_lembrete_cliente: StatusDisparoWhatsApp;
  whatsapp_lembrete_proprietario: StatusDisparoWhatsApp;
  whatsapp_pos_visita_cliente?: StatusDisparoWhatsApp;
  feedback_cliente?: string;
  feedback_proprietario?: string;
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
  
  // Relacionamentos carregados
  imovel?: Imovel;
  imoveis?: Imovel[]; // Lista de imóveis do roteiro
  cliente?: Cliente;
}

export type ProvedorWhatsApp = 'evolution_api' | 'zapi' | 'meta_cloud' | 'custom_webhook';

export interface ConfiguracaoWhatsApp {
  id?: string;
  provedor: ProvedorWhatsApp;
  api_url: string;
  api_key: string;
  instancia_nome: string;
  ativo: boolean;
  template_confirmacao_cliente: string;
  template_confirmacao_proprietario: string;
  template_lembrete_cliente: string;
  template_lembrete_proprietario: string;
  template_pos_visita_cliente: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface WhatsAppLog {
  id?: string;
  visita_id?: string;
  tipo_mensagem: 'confirmacao_cliente' | 'confirmacao_proprietario' | 'lembrete_cliente' | 'lembrete_proprietario' | 'pos_visita_cliente' | 'avulsa';
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
  visitasConfirmadasHoje: number;
  visitasCanceladasHoje: number;
  visitasPendentesHoje: number;
  totalImoveisAtivos: number;
  totalClientesAtivos: number;
  taxaConfirmacao: number;
}

export type UserRole = 'admin' | 'corretor';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  senha_hash?: string;
  role: UserRole;
  imobiliaria: string;
  instance_name?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Convite {
  id: string;
  token: string;
  imobiliaria: string;
  expires_at: string;
  used: boolean;
  created_at?: string;
}


