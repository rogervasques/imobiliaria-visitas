-- ==============================================================================
-- MIGRAÇÃO: Estrutura Multi-Instância de WhatsApp por Corretor e Vínculo de Visitas
-- ==============================================================================

-- 1. Adicionar coluna instance_name na tabela users
ALTER TABLE IF EXISTS users 
ADD COLUMN IF NOT EXISTS instance_name TEXT;

-- 2. Atualizar usuários existentes com seus identificadores de instância
UPDATE users 
SET instance_name = 'easymob_' || LOWER(REGEXP_REPLACE(id, '[^a-zA-Z0-9_-]', '_', 'g'))
WHERE instance_name IS NULL;

-- 3. Adicionar coluna created_by_user_id e created_by_user_nome na tabela visitas
ALTER TABLE IF EXISTS visitas 
ADD COLUMN IF NOT EXISTS created_by_user_id TEXT,
ADD COLUMN IF NOT EXISTS created_by_user_nome TEXT;

-- 4. Índice para agilizar buscas por corretor criador
CREATE INDEX IF NOT EXISTS idx_visitas_created_by ON visitas(created_by_user_id);
