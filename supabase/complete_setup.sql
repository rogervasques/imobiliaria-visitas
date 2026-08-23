-- ==============================================================================
-- EASYMOB: SETUP COMPLETO DO BANCO DE DADOS (SUPABASE POSTGRESQL)
-- Execute este script no SQL Editor do seu Dashboard Supabase
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABELA DE USUÁRIOS & RBAC
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  senha_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'corretor' CHECK (role IN ('admin', 'corretor')),
  imobiliaria TEXT NOT NULL DEFAULT 'EasyMob Imóveis',
  instance_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS instance_name TEXT;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total users" ON public.users;
CREATE POLICY "Acesso total users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- 2. TABELA DE CONVITES POR TOKEN
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  imobiliaria TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total invites" ON public.invites;
CREATE POLICY "Acesso total invites" ON public.invites FOR ALL USING (true) WITH CHECK (true);

-- 3. TABELA DE PROPRIETÁRIOS
CREATE TABLE IF NOT EXISTS public.proprietarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.proprietarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total proprietarios" ON public.proprietarios;
CREATE POLICY "Acesso total proprietarios" ON public.proprietarios FOR ALL USING (true) WITH CHECK (true);

-- 4. TABELA DE IMÓVEIS
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
  proprietario_id UUID REFERENCES public.proprietarios(id) ON DELETE SET NULL,
  proprietario_nome VARCHAR(255) NOT NULL,
  proprietario_telefone VARCHAR(30) NOT NULL,
  proprietario_email VARCHAR(255),
  observacoes_chaves TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'disponivel',
  imagem_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS proprietario_id UUID;
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total imoveis" ON public.imoveis;
CREATE POLICY "Acesso total imoveis" ON public.imoveis FOR ALL USING (true) WITH CHECK (true);

-- 5. TABELA DE CLIENTES
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

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total clientes" ON public.clientes;
CREATE POLICY "Acesso total clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);

-- 6. TABELA DE VISITAS & AUTOMAÇÕES
CREATE TABLE IF NOT EXISTS public.visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID NOT NULL REFERENCES public.imoveis(id) ON DELETE CASCADE,
  imoveis_ids UUID[] DEFAULT '{}',
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  corretor_nome VARCHAR(255) NOT NULL DEFAULT 'Roger Vasques Berchembrock',
  corretor_telefone VARCHAR(30),
  data_hora_visita TIMESTAMPTZ NOT NULL,
  lembrete_agendado_para TIMESTAMPTZ NOT NULL,
  pos_visita_agendado_para TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'agendada',
  notificar_confirmacao BOOLEAN DEFAULT true,
  notificar_lembrete BOOLEAN DEFAULT true,
  notificar_pos_visita BOOLEAN DEFAULT true,
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

-- Migrações/Colunas da tabela visitas
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS imoveis_ids UUID[] DEFAULT '{}';
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS pos_visita_agendado_para TIMESTAMPTZ;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS notificar_confirmacao BOOLEAN DEFAULT true;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS notificar_lembrete BOOLEAN DEFAULT true;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS notificar_pos_visita BOOLEAN DEFAULT true;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS whatsapp_pos_visita_cliente VARCHAR(50) DEFAULT 'pendente';
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS created_by_user_id TEXT;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS created_by_user_nome TEXT;

-- Migrações da tabela configuracoes_whatsapp
ALTER TABLE public.configuracoes_whatsapp ADD COLUMN IF NOT EXISTS template_pos_visita_cliente TEXT;

ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total visitas" ON public.visitas;
CREATE POLICY "Acesso total visitas" ON public.visitas FOR ALL USING (true) WITH CHECK (true);

-- 7. TABELA DE CONFIGURAÇÕES WHATSAPP
CREATE TABLE IF NOT EXISTS public.configuracoes_whatsapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provedor VARCHAR(50) NOT NULL DEFAULT 'evolution_api',
  api_url TEXT DEFAULT 'http://147.93.9.74:8080',
  api_key TEXT DEFAULT 'easymob_secret_token_2026',
  instancia_nome VARCHAR(100) DEFAULT 'easymob',
  ativo BOOLEAN DEFAULT true,
  template_confirmacao_cliente TEXT,
  template_confirmacao_proprietario TEXT,
  template_lembrete_cliente TEXT,
  template_lembrete_proprietario TEXT,
  template_pos_visita_cliente TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.configuracoes_whatsapp ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total configuracoes_whatsapp" ON public.configuracoes_whatsapp;
CREATE POLICY "Acesso total configuracoes_whatsapp" ON public.configuracoes_whatsapp FOR ALL USING (true) WITH CHECK (true);

-- 8. TABELA DE LOGS WHATSAPP
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
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total whatsapp_logs" ON public.whatsapp_logs;
CREATE POLICY "Acesso total whatsapp_logs" ON public.whatsapp_logs FOR ALL USING (true) WITH CHECK (true);

-- 9. SEED DO ADMINISTRADOR (Senha: @Asenha12)
-- Hash Bcrypt oficial gerado com 10 rounds para "@Asenha12"
INSERT INTO public.users (nome, email, telefone, senha_hash, role, imobiliaria, instance_name)
VALUES (
  'Roger Vasques Berchembrock',
  'rogervasques@gmail.com',
  '11999999999',
  '$2a$10$f3F8i9B0rLhI6zM.gqLz.eU9/gS7eE1H1uK5Y.uXy0z7bT8vJ5sCe',
  'admin',
  'Administração',
  'easymob_user_admin_master'
)
ON CONFLICT (email) DO UPDATE 
SET 
  role = 'admin',
  nome = EXCLUDED.nome,
  senha_hash = EXCLUDED.senha_hash;
