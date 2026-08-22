-- ==============================================================================
-- CRIAÇÃO DO BUCKET DE IMAGENS E POLÍTICAS DE ACESSO PÚBLICO
-- ==============================================================================

-- 1. Inserir o bucket público 'imoveis-fotos'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'imoveis-fotos',
    'imoveis-fotos',
    true,
    10485760, -- 10MB máximo de segurança
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Política para leitura pública de qualquer imagem do bucket
DROP POLICY IF EXISTS "Fotos públicas para visualização" ON storage.objects;
CREATE POLICY "Fotos públicas para visualização"
ON storage.objects FOR SELECT
USING (bucket_id = 'imoveis-fotos');

-- 3. Política para permitir upload (INSERT)
DROP POLICY IF EXISTS "Upload público de fotos de imóveis" ON storage.objects;
CREATE POLICY "Upload público de fotos de imóveis"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'imoveis-fotos');

-- 4. Política para permitir substituição/atualização (UPDATE)
DROP POLICY IF EXISTS "Atualização pública de fotos de imóveis" ON storage.objects;
CREATE POLICY "Atualização pública de fotos de imóveis"
ON storage.objects FOR UPDATE
USING (bucket_id = 'imoveis-fotos');

-- 5. Política para permitir exclusão (DELETE)
DROP POLICY IF EXISTS "Exclusão de fotos de imóveis" ON storage.objects;
CREATE POLICY "Exclusão de fotos de imóveis"
ON storage.objects FOR DELETE
USING (bucket_id = 'imoveis-fotos');
