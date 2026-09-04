-- ==============================================================================
-- CORREÇÃO DEFINITIVA DE PERSISTÊNCIA, TABELAS, COLUNAS E SUPABASE STORAGE
-- Execute este script no SQL Editor do seu Supabase Dashboard
-- (https://supabase.com/dashboard/project/mzkanjhapnqzdltqmitj/sql)
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
  perfil_interesse VARCHAR(100),
  faixa_orcamento VARCHAR(100),
  origem_lead VARCHAR(50) DEFAULT 'site',
  status VARCHAR(50) DEFAULT 'ativo',
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS orcamento_min NUMERIC(15,2);
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS orcamento_max NUMERIC(15,2);
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS preferencia_tipo TEXT DEFAULT 'todos';
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS preferencia_quartos INTEGER DEFAULT 0;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS preferencia_finalidade TEXT DEFAULT 'ambos';
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS tipo_cliente TEXT DEFAULT 'comprador_inquilino';
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS etapa_crm TEXT DEFAULT 'novos_leads';
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS imovel_interesse_id UUID;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS imovel_interesse_titulo TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS imovel_interesse_foto TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS corretor_responsavel_nome TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS corretor_responsavel_id TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'media';
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS tempo_parada_texto TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'Lagom Imóveis';
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS imobiliaria_id TEXT;

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total clientes" ON public.clientes;
CREATE POLICY "Acesso total clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);

-- 5. AJUSTES NA TABELA: PROPRIETÁRIOS
CREATE TABLE IF NOT EXISTS public.proprietarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.proprietarios ADD COLUMN IF NOT EXISTS documento TEXT;
ALTER TABLE public.proprietarios ADD COLUMN IF NOT EXISTS chave_pix TEXT;
ALTER TABLE public.proprietarios ADD COLUMN IF NOT EXISTS banco_nome TEXT;
ALTER TABLE public.proprietarios ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE public.proprietarios ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'Lagom Imóveis';
ALTER TABLE public.proprietarios ADD COLUMN IF NOT EXISTS imobiliaria_id TEXT;

ALTER TABLE public.proprietarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total proprietarios" ON public.proprietarios;
CREATE POLICY "Acesso total proprietarios" ON public.proprietarios FOR ALL USING (true) WITH CHECK (true);

-- 6. AJUSTES NA TABELA: VISITAS
CREATE TABLE IF NOT EXISTS public.visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID NOT NULL REFERENCES public.imoveis(id) ON DELETE CASCADE,
  imoveis_ids UUID[] DEFAULT '{}',
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  corretor_nome VARCHAR(255) NOT NULL DEFAULT 'Corretor Principal',
  corretor_telefone VARCHAR(30),
  data_hora_visita TIMESTAMPTZ NOT NULL,
  lembrete_agendado_para TIMESTAMPTZ NOT NULL,
  pos_visita_agendado_para TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'agendada',
  notificar_confirmacao BOOLEAN DEFAULT TRUE,
  notificar_lembrete BOOLEAN DEFAULT TRUE,
  notificar_pos_visita BOOLEAN DEFAULT TRUE,
  whatsapp_confirmacao_cliente VARCHAR(50) DEFAULT 'pendente',
  whatsapp_confirmacao_proprietario VARCHAR(50) DEFAULT 'pendente',
  whatsapp_lembrete_cliente VARCHAR(50) DEFAULT 'pendente',
  whatsapp_lembrete_proprietario VARCHAR(50) DEFAULT 'pendente',
  whatsapp_pos_visita_cliente VARCHAR(50) DEFAULT 'pendente',
  created_by_user_id TEXT,
  created_by_user_nome TEXT,
  feedback_cliente TEXT,
  feedback_proprietario TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS imoveis_ids UUID[] DEFAULT '{}';
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS pos_visita_agendado_para TIMESTAMPTZ;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS notificar_confirmacao BOOLEAN DEFAULT TRUE;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS notificar_lembrete BOOLEAN DEFAULT TRUE;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS notificar_pos_visita BOOLEAN DEFAULT TRUE;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS whatsapp_pos_visita_cliente VARCHAR(50) DEFAULT 'pendente';
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS whatsapp_comprovacao_proprietario VARCHAR(50) DEFAULT 'pendente';
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS gravar_logs BOOLEAN DEFAULT TRUE;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS gravar_logs_cliente BOOLEAN DEFAULT TRUE;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS gravar_logs_proprietario BOOLEAN DEFAULT TRUE;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS fim_gravacao_logs_em TIMESTAMPTZ;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS created_by_user_id TEXT;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS created_by_user_nome TEXT;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'Lagom Imóveis';
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS imobiliaria_id TEXT;

ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total visitas" ON public.visitas;
CREATE POLICY "Acesso total visitas" ON public.visitas FOR ALL USING (true) WITH CHECK (true);

-- 7. TABELA: CONFIGURACOES_WHATSAPP
CREATE TABLE IF NOT EXISTS public.configuracoes_whatsapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provedor VARCHAR(50) NOT NULL DEFAULT 'evolution_api',
  api_url TEXT DEFAULT 'http://147.93.9.74:8080',
  api_key TEXT DEFAULT 'easymob_secret_token_2026',
  instancia_nome VARCHAR(100) DEFAULT 'easymob',
  ativo BOOLEAN DEFAULT TRUE,
  template_confirmacao_cliente TEXT,
  template_confirmacao_proprietario TEXT,
  template_lembrete_cliente TEXT,
  template_lembrete_proprietario TEXT,
  template_pos_visita_cliente TEXT,
  imobiliaria TEXT DEFAULT 'Lagom Imóveis',
  imobiliaria_id TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.configuracoes_whatsapp ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'Lagom Imóveis';
ALTER TABLE public.configuracoes_whatsapp ADD COLUMN IF NOT EXISTS imobiliaria_id TEXT;

ALTER TABLE public.configuracoes_whatsapp ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total configuracoes_whatsapp" ON public.configuracoes_whatsapp;
CREATE POLICY "Acesso total configuracoes_whatsapp" ON public.configuracoes_whatsapp FOR ALL USING (true) WITH CHECK (true);

-- 8. TABELA: WHATSAPP_LOGS
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES public.visitas(id) ON DELETE SET NULL,
  tipo_mensagem VARCHAR(50) NOT NULL,
  destinatario_nome VARCHAR(255),
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

ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'Lagom Imóveis';
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS imobiliaria_id TEXT;

ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total whatsapp_logs" ON public.whatsapp_logs;
CREATE POLICY "Acesso total whatsapp_logs" ON public.whatsapp_logs FOR ALL USING (true) WITH CHECK (true);

-- 9. CONFIGURAÇÃO DE BUCKETS DE STORAGE PÚBLICOS
-- Criação de buckets oficiais para Fotos e Logos
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

DROP POLICY IF EXISTS "Exclusão pública de mídias" ON storage.objects;
CREATE POLICY "Exclusão pública de mídias"
ON storage.objects FOR DELETE
USING (bucket_id IN ('imoveis-fotos', 'imobiliarias-logos', 'logos', 'imoveis-media'));

-- 10. RECARREGAMENTO DO CACHE DO SCHEMA DO POSTGREST
NOTIFY pgrst, 'reload schema';
