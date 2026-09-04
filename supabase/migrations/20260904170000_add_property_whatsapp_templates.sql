-- Migração para adicionar os novos templates de WhatsApp na tabela configuracoes_whatsapp
-- 1. template_compartilhar_imovel: Compartilhamento de Ficha Pública de Imóvel com Link e Fotos
-- 2. template_imovel_compativel: Recomendação de Imóvel Compatível / Match Inteligente para Leads

ALTER TABLE public.configuracoes_whatsapp 
ADD COLUMN IF NOT EXISTS template_compartilhar_imovel TEXT;

ALTER TABLE public.configuracoes_whatsapp 
ADD COLUMN IF NOT EXISTS template_imovel_compativel TEXT;
