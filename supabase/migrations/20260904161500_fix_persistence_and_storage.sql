-- ==============================================================================
-- MIGRATION: 20260904161500_fix_persistence_and_storage.sql
-- Descrição: Ajustes de persistência, multi-tenancy, matching de clientes, 
--            auditoria de WhatsApp (logs_mensagens com criptografia) e buckets de storage.
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABELA DE IMOBILIÁRIAS (TENANTS)
CREATE TABLE IF NOT EXISTS public.imobiliarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE,
  razao_social VARCHAR(255),
  cnpj VARCHAR(30),
  creci_j VARCHAR(50),
  site_oficial VARCHAR(255),
  logo_url TEXT,
  telefone VARCHAR(30),
  email VARCHAR(255),
  endereco TEXT,
  logradouro VARCHAR(255),
  numero VARCHAR(30),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(15),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  modulo_crm_ativo BOOLEAN NOT NULL DEFAULT TRUE,
  limite_usuarios INTEGER NOT NULL DEFAULT 10,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.imobiliarias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total imobiliarias" ON public.imobiliarias;
CREATE POLICY "Acesso total imobiliarias" ON public.imobiliarias FOR ALL USING (true) WITH CHECK (true);

-- Seed de Imobiliárias Padrão
INSERT INTO public.imobiliarias (nome, slug, email, telefone)
VALUES
  ('Lagom Imóveis', 'lagom-imoveis', 'contato@lagomimoveis.com.br', '11999999999'),
  ('EasyMob Imóveis', 'easymob', 'contato@easymob.com.br', '11999999999'),
  ('Imobiliária Prime', 'prime', 'contato@primeimoveis.com.br', '11988887777'),
  ('Nova Era Imóveis', 'nova-era', 'atendimento@novaera.com.br', '11977776666')
ON CONFLICT (nome) DO NOTHING;

-- 3. AJUSTES NA TABELA: IMOVEIS
CREATE TABLE IF NOT EXISTS public.imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'apartamento',
  finalidade VARCHAR(50) NOT NULL DEFAULT 'venda',
  endereco VARCHAR(255) NOT NULL,
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL DEFAULT 'São Paulo',
  estado VARCHAR(2) NOT NULL DEFAULT 'SP',
  cep VARCHAR(10),
  valor_venda NUMERIC(12, 2),
  valor_locacao NUMERIC(12, 2),
  quartos INT DEFAULT 0,
  banheiros INT DEFAULT 0,
  vagas INT DEFAULT 0,
  area_util NUMERIC(8, 2),
  proprietario_nome VARCHAR(255) NOT NULL,
  proprietario_telefone VARCHAR(30) NOT NULL,
  proprietario_email VARCHAR(255),
  observacoes_chaves TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'disponivel',
  imagem_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS fotos_urls TEXT[] DEFAULT '{}';
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'Lagom Imóveis';
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS imobiliaria_id TEXT;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS proprietario_id UUID;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS valor_condominio NUMERIC(12,2);
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS valor_iptu NUMERIC(12,2);
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS area_construida NUMERIC(10,2);
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS area_terreno NUMERIC(10,2);
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS suites INTEGER DEFAULT 0;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS aceita_pet BOOLEAN DEFAULT TRUE;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS descricao_comercial TEXT;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS caracteristicas TEXT[] DEFAULT '{}';

ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total imoveis" ON public.imoveis;
CREATE POLICY "Acesso total imoveis" ON public.imoveis FOR ALL USING (true) WITH CHECK (true);

-- 4. AJUSTES NA TABELA: CLIENTES
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  perfil_interesse TEXT,
  faixa_orcamento TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'ativo',
  origem_lead VARCHAR(50) DEFAULT 'portal',
  etapa_crm VARCHAR(50) DEFAULT 'novos_leads',
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS orcamento_min NUMERIC(14,2);
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS orcamento_max NUMERIC(14,2);
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS preferencia_tipo VARCHAR(50) DEFAULT 'todos';
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS preferencia_quartos INTEGER DEFAULT 0;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS preferencia_finalidade VARCHAR(20) DEFAULT 'ambos';
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS imovel_interesse_id UUID;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS imovel_interesse_titulo TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'Lagom Imóveis';
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS imobiliaria_id TEXT;

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total clientes" ON public.clientes;
CREATE POLICY "Acesso total clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);

-- 5. AJUSTES NA TABELA: PROPRIETARIOS
CREATE TABLE IF NOT EXISTS public.proprietarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  documento VARCHAR(30),
  observacoes TEXT,
  imobiliaria TEXT DEFAULT 'Lagom Imóveis',
  imobiliaria_id TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.proprietarios ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'Lagom Imóveis';
ALTER TABLE public.proprietarios ADD COLUMN IF NOT EXISTS imobiliaria_id TEXT;

ALTER TABLE public.proprietarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total proprietarios" ON public.proprietarios;
CREATE POLICY "Acesso total proprietarios" ON public.proprietarios FOR ALL USING (true) WITH CHECK (true);

-- 6. AJUSTES NA TABELA: VISITAS
CREATE TABLE IF NOT EXISTS public.visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID REFERENCES public.imoveis(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  data_hora_visita TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'agendada',
  feedback_cliente TEXT,
  feedback_corretor TEXT,
  corretor_nome VARCHAR(255) NOT NULL DEFAULT 'Corretor Responsável',
  corretor_telefone VARCHAR(30) NOT NULL DEFAULT '11999998888',
  created_by_user_id TEXT,
  notificar_confirmacao BOOLEAN NOT NULL DEFAULT TRUE,
  notificar_confirmacao_cliente BOOLEAN NOT NULL DEFAULT TRUE,
  notificar_confirmacao_proprietario BOOLEAN NOT NULL DEFAULT TRUE,
  notificar_lembrete BOOLEAN NOT NULL DEFAULT TRUE,
  notificar_lembrete_cliente BOOLEAN NOT NULL DEFAULT TRUE,
  notificar_lembrete_proprietario BOOLEAN NOT NULL DEFAULT TRUE,
  notificar_pos_visita BOOLEAN NOT NULL DEFAULT TRUE,
  notificar_comprovacao_proprietario BOOLEAN NOT NULL DEFAULT TRUE,
  gravar_logs_cliente BOOLEAN NOT NULL DEFAULT TRUE,
  gravar_logs_proprietario BOOLEAN NOT NULL DEFAULT TRUE,
  whatsapp_confirmacao_cliente VARCHAR(50) DEFAULT 'pendente',
  whatsapp_confirmacao_proprietario VARCHAR(50) DEFAULT 'pendente',
  whatsapp_lembrete_cliente VARCHAR(50) DEFAULT 'pendente',
  whatsapp_lembrete_proprietario VARCHAR(50) DEFAULT 'pendente',
  whatsapp_pos_visita_cliente VARCHAR(50) DEFAULT 'pendente',
  whatsapp_comprovacao_proprietario VARCHAR(50) DEFAULT 'pendente',
  imoveis_ids UUID[] DEFAULT '{}',
  imobiliaria TEXT DEFAULT 'Lagom Imóveis',
  imobiliaria_id TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS imoveis_ids UUID[] DEFAULT '{}';
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'Lagom Imóveis';
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS imobiliaria_id TEXT;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS created_by_user_id TEXT;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS notificar_confirmacao_cliente BOOLEAN DEFAULT TRUE;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS notificar_confirmacao_proprietario BOOLEAN DEFAULT TRUE;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS notificar_lembrete_cliente BOOLEAN DEFAULT TRUE;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS notificar_lembrete_proprietario BOOLEAN DEFAULT TRUE;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS notificar_comprovacao_proprietario BOOLEAN DEFAULT TRUE;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS gravar_logs_cliente BOOLEAN DEFAULT TRUE;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS gravar_logs_proprietario BOOLEAN DEFAULT TRUE;

ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total visitas" ON public.visitas;
CREATE POLICY "Acesso total visitas" ON public.visitas FOR ALL USING (true) WITH CHECK (true);

-- 7. AJUSTES NA TABELA: CONFIGURACOES_WHATSAPP
CREATE TABLE IF NOT EXISTS public.configuracoes_whatsapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provedor VARCHAR(50) NOT NULL DEFAULT 'evolution_api',
  api_url TEXT NOT NULL DEFAULT 'http://147.93.9.74:8080',
  api_key TEXT NOT NULL DEFAULT 'easymob_secret_token_2026',
  instancia_nome VARCHAR(100) NOT NULL DEFAULT 'easymob',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  enviar_confirmacao_cliente BOOLEAN NOT NULL DEFAULT TRUE,
  enviar_confirmacao_proprietario BOOLEAN NOT NULL DEFAULT TRUE,
  enviar_lembrete_cliente BOOLEAN NOT NULL DEFAULT TRUE,
  enviar_lembrete_proprietario BOOLEAN NOT NULL DEFAULT TRUE,
  enviar_pos_visita_cliente BOOLEAN NOT NULL DEFAULT TRUE,
  enviar_comprovacao_proprietario BOOLEAN NOT NULL DEFAULT TRUE,
  gravar_logs_cliente BOOLEAN NOT NULL DEFAULT TRUE,
  gravar_logs_proprietario BOOLEAN NOT NULL DEFAULT TRUE,
  template_confirmacao_cliente TEXT,
  template_confirmacao_proprietario TEXT,
  template_lembrete_cliente TEXT,
  template_lembrete_proprietario TEXT,
  template_comprovacao_proprietario TEXT,
  template_pos_visita_cliente TEXT,
  imobiliaria TEXT DEFAULT 'Lagom Imóveis',
  imobiliaria_id TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.configuracoes_whatsapp ADD COLUMN IF NOT EXISTS gravar_logs_cliente BOOLEAN DEFAULT TRUE;
ALTER TABLE public.configuracoes_whatsapp ADD COLUMN IF NOT EXISTS gravar_logs_proprietario BOOLEAN DEFAULT TRUE;
ALTER TABLE public.configuracoes_whatsapp ADD COLUMN IF NOT EXISTS template_comprovacao_proprietario TEXT;
ALTER TABLE public.configuracoes_whatsapp ADD COLUMN IF NOT EXISTS template_compartilhar_imovel TEXT;
ALTER TABLE public.configuracoes_whatsapp ADD COLUMN IF NOT EXISTS template_imovel_compativel TEXT;

ALTER TABLE public.configuracoes_whatsapp ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total configuracoes_whatsapp" ON public.configuracoes_whatsapp;
CREATE POLICY "Acesso total configuracoes_whatsapp" ON public.configuracoes_whatsapp FOR ALL USING (true) WITH CHECK (true);

-- 8. AJUSTES NA TABELA: WHATSAPP_LOGS
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES public.visitas(id) ON DELETE CASCADE,
  tipo_mensagem VARCHAR(50) NOT NULL,
  destinatario_nome VARCHAR(255) NOT NULL,
  destinatario_telefone VARCHAR(30) NOT NULL,
  tipo_destinatario VARCHAR(50) NOT NULL,
  conteudo_mensagem TEXT NOT NULL,
  status_envio VARCHAR(50) NOT NULL,
  resposta_api JSONB,
  erro_detalhes TEXT,
  imobiliaria TEXT DEFAULT 'Lagom Imóveis',
  imobiliaria_id TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total whatsapp_logs" ON public.whatsapp_logs;
CREATE POLICY "Acesso total whatsapp_logs" ON public.whatsapp_logs FOR ALL USING (true) WITH CHECK (true);

-- 9. TABELA: LOGS_MENSAGENS (Histórico de Atendimento e Gravação de Conversas com Criptografia AES-256)
CREATE TABLE IF NOT EXISTS public.logs_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES public.visitas(id) ON DELETE CASCADE,
  message_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  remetente_tipo VARCHAR(50) NOT NULL, -- 'CLIENTE' | 'CORRETOR' | 'PROPRIETARIO' | 'SISTEMA'
  remetente_nome VARCHAR(255),
  remetente_telefone VARCHAR(30),
  conteudo_texto TEXT NOT NULL, -- Criptografado com AES-256
  tipo_midia VARCHAR(50) DEFAULT 'texto', -- 'texto' | 'imagem' | 'audio' | 'documento'
  midia_url TEXT,
  imobiliaria TEXT DEFAULT 'Lagom Imóveis',
  imobiliaria_id TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.logs_mensagens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total logs_mensagens" ON public.logs_mensagens;
CREATE POLICY "Acesso total logs_mensagens" ON public.logs_mensagens FOR ALL USING (true) WITH CHECK (true);

-- 10. CONFIGURAÇÃO DE BUCKETS DE STORAGE PÚBLICOS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('imoveis-fotos', 'imoveis-fotos', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('imobiliarias-logos', 'imobiliarias-logos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('logos', 'logos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('imoveis-media', 'imoveis-media', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de Storage para todos os Buckets
DROP POLICY IF EXISTS "Visualização pública de mídias" ON storage.objects;
CREATE POLICY "Visualização pública de mídias"
ON storage.objects FOR SELECT
USING (bucket_id IN ('imoveis-fotos', 'imobiliarias-logos', 'logos', 'imoveis-media'));

DROP POLICY IF EXISTS "Upload público de mídias" ON storage.objects;
CREATE POLICY "Upload público de mídias"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('imoveis-fotos', 'imobiliarias-logos', 'logos', 'imoveis-media'));

DROP POLICY IF EXISTS "Atualização pública de mídias" ON storage.objects;
CREATE POLICY "Atualização pública de mídias"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('imoveis-fotos', 'imobiliarias-logos', 'logos', 'imoveis-media'));

-- 11. RECARREGAMENTO DO CACHE DO SCHEMA DO POSTGREST
NOTIFY pgrst, 'reload schema';
