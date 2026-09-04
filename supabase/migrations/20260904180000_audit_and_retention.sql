-- ==============================================================================
-- MIGRATION: 20260904180000_audit_and_retention.sql
-- IMPLEMENTAÇÃO DE AUDIT LOGS, SOFT DELETE E LIXEIRA COM RETENÇÃO DE 60 DIAS
-- ==============================================================================

-- 1. TABELA: LOGS_SISTEMA (Audit Trail de Operações Críticas)
CREATE TABLE IF NOT EXISTS public.logs_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  usuario_email TEXT,
  usuario_nome TEXT,
  acao VARCHAR(100) NOT NULL,
  tabela VARCHAR(100) NOT NULL,
  registro_id TEXT,
  detalhes JSONB DEFAULT '{}'::jsonb,
  imobiliaria_id TEXT,
  imobiliaria TEXT DEFAULT 'Lagom Imóveis',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de alta performance para relatórios e busca paginada
CREATE INDEX IF NOT EXISTS idx_logs_sistema_criado_em ON public.logs_sistema(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_tabela ON public.logs_sistema(tabela);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_acao ON public.logs_sistema(acao);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_usuario_email ON public.logs_sistema(usuario_email);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_imobiliaria ON public.logs_sistema(imobiliaria);

-- RLS para logs_sistema
ALTER TABLE public.logs_sistema ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total logs_sistema" ON public.logs_sistema;
CREATE POLICY "Acesso total logs_sistema" ON public.logs_sistema FOR ALL USING (true) WITH CHECK (true);

-- 2. ADIÇÃO DE COLUNA deletado_em PARA SOFT DELETE (Lixeira)
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS deletado_em TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS deletado_em TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS deletado_em TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.proprietarios ADD COLUMN IF NOT EXISTS deletado_em TIMESTAMPTZ DEFAULT NULL;

-- Índices parciais para consultas padrão (WHERE deletado_em IS NULL)
CREATE INDEX IF NOT EXISTS idx_imoveis_deletado_em ON public.imoveis(deletado_em) WHERE deletado_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_clientes_deletado_em ON public.clientes(deletado_em) WHERE deletado_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_visitas_deletado_em ON public.visitas(deletado_em) WHERE deletado_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_proprietarios_deletado_em ON public.proprietarios(deletado_em) WHERE deletado_em IS NULL;

-- 3. FUNÇÃO SQL: PURGA DEFINITIVA AUTOMÁTICA (> 60 DIAS DE RETENÇÃO)
CREATE OR REPLACE FUNCTION public.purgar_lixeira_60_dias()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count_visitas INT := 0;
  count_imoveis INT := 0;
  count_clientes INT := 0;
  count_proprietarios INT := 0;
BEGIN
  -- 3.1. Purga Visitas deletadas há mais de 60 dias
  WITH del_visitas AS (
    DELETE FROM public.visitas
    WHERE deletado_em IS NOT NULL AND deletado_em < NOW() - INTERVAL '60 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO count_visitas FROM del_visitas;

  -- 3.2. Purga Imóveis deletados há mais de 60 dias
  WITH del_imoveis AS (
    DELETE FROM public.imoveis
    WHERE deletado_em IS NOT NULL AND deletado_em < NOW() - INTERVAL '60 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO count_imoveis FROM del_imoveis;

  -- 3.3. Purga Clientes deletados há mais de 60 dias
  WITH del_clientes AS (
    DELETE FROM public.clientes
    WHERE deletado_em IS NOT NULL AND deletado_em < NOW() - INTERVAL '60 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO count_clientes FROM del_clientes;

  -- 3.4. Purga Proprietários deletados há mais de 60 dias
  WITH del_proprietarios AS (
    DELETE FROM public.proprietarios
    WHERE deletado_em IS NOT NULL AND deletado_em < NOW() - INTERVAL '60 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO count_proprietarios FROM del_proprietarios;

  -- Grava log do sistema sobre a purga executada
  INSERT INTO public.logs_sistema (
    usuario_email,
    usuario_nome,
    acao,
    tabela,
    detalhes
  ) VALUES (
    'sistema@easymob.com.br',
    'Sistema Automático (Rotina de Retenção)',
    'PURGAR_LIXEIRA_60_DIAS',
    'sistema',
    jsonb_build_object(
      'visitas_purgadas', count_visitas,
      'imoveis_purgados', count_imoveis,
      'clientes_purgados', count_clientes,
      'proprietarios_purgados', count_proprietarios,
      'executado_em', NOW()
    )
  );

  RETURN jsonb_build_object(
    'sucesso', true,
    'visitas_purgadas', count_visitas,
    'imoveis_purgados', count_imoveis,
    'clientes_purgados', count_clientes,
    'proprietarios_purgados', count_proprietarios,
    'executado_em', NOW()
  );
END;
$$;
