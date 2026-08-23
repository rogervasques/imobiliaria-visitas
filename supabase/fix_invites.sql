-- =======================================================
-- CORREÇÃO DEFINITIVA DA TABELA DE CONVITES (SUPABASE)
-- =======================================================

-- 1. Permite acesso total para leitura, criação e validação de convites
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso aos convites" ON public.invites;
DROP POLICY IF EXISTS "Permitir acesso total a convites" ON public.invites;
DROP POLICY IF EXISTS "Permitir leitura e escrita em invites" ON public.invites;

-- Cria política com USING e WITH CHECK para permitir inserção/atualização por token
CREATE POLICY "Permitir acesso total a convites" ON public.invites 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 2. Garante compatibilidade de tipos para o token (TEXT ou UUID)
ALTER TABLE public.invites ALTER COLUMN token TYPE TEXT;

-- 3. Adiciona colunas complementares caso não existam
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'corretor';
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS created_by_user_id TEXT;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS imobiliaria TEXT DEFAULT 'EasyMob Imóveis';
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours');
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT FALSE;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Notifica o PostgREST para recarregar o schema cache
NOTIFY pgrst, 'reload schema';
