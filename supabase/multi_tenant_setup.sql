-- ==============================================================================
-- SCHEMA & MIGRAÇÃO: ARQUITETURA MULTI-TENANT POR IMOBILIÁRIA (EASYMOB)
-- ==============================================================================

-- 1. TABELA DE IMOBILIÁRIAS (TENANTS)
CREATE TABLE IF NOT EXISTS public.imobiliarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE,
  logo_url TEXT,
  telefone VARCHAR(30),
  email VARCHAR(255),
  endereco TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.imobiliarias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total imobiliarias" ON public.imobiliarias;
CREATE POLICY "Acesso total imobiliarias" ON public.imobiliarias FOR ALL USING (true) WITH CHECK (true);

-- 2. SEED DE IMOBILIÁRIAS PADRÃO
INSERT INTO public.imobiliarias (nome, slug, email, telefone)
VALUES
  ('EasyMob Imóveis', 'easymob', 'contato@easymob.com.br', '11999999999'),
  ('Imobiliária Prime', 'prime', 'contato@primeimoveis.com.br', '11988887777'),
  ('Nova Era Imóveis', 'nova-era', 'atendimento@novaera.com.br', '11977776666')
ON CONFLICT (nome) DO NOTHING;

-- 3. ADICIONA AS COLUNAS DE MULTI-TENANCY NAS TABELAS PRINCIPAIS

-- TABELA: USERS
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS imobiliaria_id UUID;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'EasyMob Imóveis';

-- TABELA: CONVITES
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS imobiliaria_id UUID;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'EasyMob Imóveis';

-- TABELA: PROPRIETÁRIOS
ALTER TABLE public.proprietarios ADD COLUMN IF NOT EXISTS imobiliaria_id UUID;
ALTER TABLE public.proprietarios ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'EasyMob Imóveis';

-- TABELA: IMÓVEIS
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS imobiliaria_id UUID;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'EasyMob Imóveis';

-- TABELA: CLIENTES
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS imobiliaria_id UUID;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'EasyMob Imóveis';

-- TABELA: VISITAS
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS imobiliaria_id UUID;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'EasyMob Imóveis';

-- TABELA: CONFIGURAÇÕES WHATSAPP
ALTER TABLE public.configuracoes_whatsapp ADD COLUMN IF NOT EXISTS imobiliaria_id UUID;
ALTER TABLE public.configuracoes_whatsapp ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'EasyMob Imóveis';

-- TABELA: LOGS WHATSAPP
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS imobiliaria_id UUID;
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'EasyMob Imóveis';

-- 4. BACKFILL: GARANTE QUE REGISTROS EXISTENTES FIQUEM VINCULADOS À IMOBILIÁRIA PADRÃO
UPDATE public.imoveis SET imobiliaria = 'EasyMob Imóveis' WHERE imobiliaria IS NULL OR imobiliaria = '';
UPDATE public.proprietarios SET imobiliaria = 'EasyMob Imóveis' WHERE imobiliaria IS NULL OR imobiliaria = '';
UPDATE public.clientes SET imobiliaria = 'EasyMob Imóveis' WHERE imobiliaria IS NULL OR imobiliaria = '';
UPDATE public.visitas SET imobiliaria = 'EasyMob Imóveis' WHERE imobiliaria IS NULL OR imobiliaria = '';
UPDATE public.users SET imobiliaria = 'EasyMob Imóveis' WHERE (imobiliaria IS NULL OR imobiliaria = '') AND role != 'admin';

-- 5. RECARREGA O SCHEMA POSTGREST NO SUPABASE
NOTIFY pgrst, 'reload schema';
