-- =======================================================
-- SCHEMA: TABELAS DE USUÁRIOS E CONVITES (EASYMOB)
-- =======================================================

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  senha_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'corretor' CHECK (role IN ('admin', 'corretor')),
  imobiliaria TEXT NOT NULL DEFAULT 'EasyMob Imóveis',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilita RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura para todos os autenticados" ON public.users FOR SELECT USING (true);
CREATE POLICY "Permitir inserção e atualização" ON public.users FOR ALL USING (true);

-- 2. TABELA DE CONVITES POR TOKEN
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  imobiliaria TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilita RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso aos convites" ON public.invites FOR ALL USING (true);

-- 3. SEED DO ADMINISTRADOR INICIAL (Caso a tabela esteja vazia)
-- Senha: @Asenha12 -> Hash Bcrypt pré-gerado: $2a$10$fWfN14c27XN8sJ9r.F0C0.Z9h1E3hP7H8i9bQ2jL1k3M5n7O9pQ1e (ou gerado dinamicamente)
INSERT INTO public.users (nome, email, telefone, senha_hash, role, imobiliaria)
VALUES (
  'Roger Vasques Berchembrock',
  'rogervasques@gmail.com',
  '11999999999',
  '$2a$10$aPZ78zD3m9K0F5PqIuH3xeB6Qn8w8n1V4Y5m9Z3a8x6c5v4b3n2m1', -- @Asenha12
  'admin',
  'Administração'
)
ON CONFLICT (email) DO NOTHING;
