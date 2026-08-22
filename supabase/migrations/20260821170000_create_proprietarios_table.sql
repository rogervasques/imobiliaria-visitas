-- ==============================================================================
-- CRIAÇÃO DA TABELA DE PROPRIETÁRIOS E VÍNCULO COM IMÓVEIS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS proprietarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text NOT NULL,
  email text,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now()
);

-- Adicionar coluna proprietario_id na tabela imoveis
ALTER TABLE imoveis
ADD COLUMN IF NOT EXISTS proprietario_id uuid REFERENCES proprietarios(id) ON DELETE SET NULL;

-- Migrar proprietários existentes na tabela imoveis para a tabela proprietarios (sem duplicatas por telefone/nome)
INSERT INTO proprietarios (nome, telefone, email)
SELECT DISTINCT ON (TRIM(LOWER(proprietario_telefone))) 
  proprietario_nome, 
  proprietario_telefone, 
  proprietario_email
FROM imoveis
WHERE proprietario_nome IS NOT NULL AND proprietario_telefone IS NOT NULL
ON CONFLICT DO NOTHING;

-- Vincular proprietario_id nos imoveis existentes
UPDATE imoveis i
SET proprietario_id = p.id
FROM proprietarios p
WHERE TRIM(LOWER(i.proprietario_telefone)) = TRIM(LOWER(p.telefone))
  AND i.proprietario_id IS NULL;
