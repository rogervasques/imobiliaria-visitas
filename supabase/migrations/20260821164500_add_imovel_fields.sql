-- ==============================================================================
-- ADIÇÃO DE NOVOS CAMPOS À TABELA DE IMÓVEIS (DETALHAMENTO FÍSICO, VALORES E CARACTERÍSTICAS)
-- ==============================================================================

ALTER TABLE imoveis
ADD COLUMN IF NOT EXISTS valor_condominio numeric(12,2),
ADD COLUMN IF NOT EXISTS valor_iptu numeric(12,2),
ADD COLUMN IF NOT EXISTS area_construida numeric(10,2),
ADD COLUMN IF NOT EXISTS area_terreno numeric(10,2),
ADD COLUMN IF NOT EXISTS suites integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS aceita_pet boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS descricao_comercial text,
ADD COLUMN IF NOT EXISTS caracteristicas text[] DEFAULT '{}';

-- Preencher area_construida com o valor de area_util para imoveis existentes
UPDATE imoveis 
SET area_construida = area_util 
WHERE area_construida IS NULL AND area_util IS NOT NULL;

-- Preencher suites básico para imóveis com quartos > 1
UPDATE imoveis 
SET suites = CASE 
    WHEN quartos >= 4 THEN 2 
    WHEN quartos >= 2 THEN 1 
    ELSE 0 
END 
WHERE suites IS NULL OR suites = 0;

-- Preencher condomínio e IPTU estimados para imóveis existentes
UPDATE imoveis 
SET valor_condominio = CASE 
    WHEN tipo IN ('apartamento', 'cobertura') AND valor_venda > 2000000 THEN 2200.00
    WHEN tipo IN ('apartamento', 'cobertura') THEN 950.00
    WHEN tipo = 'casa' AND valor_venda > 2000000 THEN 1400.00
    ELSE NULL
END
WHERE valor_condominio IS NULL;

UPDATE imoveis 
SET valor_iptu = CASE 
    WHEN valor_venda > 3000000 THEN 1200.00
    WHEN valor_venda > 1000000 THEN 550.00
    ELSE 280.00
END
WHERE valor_iptu IS NULL;
