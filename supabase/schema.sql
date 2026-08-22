-- ==============================================================================
-- SISTEMA DE GERENCIAMENTO DE VISITAS IMOBILIÁRIAS COM AUTOMAÇÃO WHATSAPP
-- DDL - Schema PostgreSQL / Supabase
-- ==============================================================================

-- Habilita extensão UUID se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA: IMOVEIS
CREATE TABLE IF NOT EXISTS imoveis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'apartamento', -- apartamento, casa, terreno, comercial, cobertura
    finalidade VARCHAR(50) NOT NULL DEFAULT 'venda', -- venda, locacao, ambos
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
    proprietario_nome VARCHAR(255) NOT NULL,
    proprietario_telefone VARCHAR(30) NOT NULL,
    proprietario_email VARCHAR(255),
    observacoes_chaves TEXT, -- ex: "Chave na portaria", "Proprietário no local"
    status VARCHAR(50) NOT NULL DEFAULT 'disponivel', -- disponivel, reservado, vendido, alugado, inativo
    imagem_url TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA: CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    perfil_interesse VARCHAR(100), -- ex: "Apto 3 quartos Zona Sul até 800k"
    faixa_orcamento VARCHAR(100),
    origem_lead VARCHAR(50) DEFAULT 'site', -- site, portal, indicacao, instagram, whatsapp, placa
    status VARCHAR(50) DEFAULT 'ativo', -- ativo, negociando, fechado, inativo
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA: VISITAS (COM SUPORTE A ROTEIRO DE MÚLTIPLOS IMÓVEIS E RÉGUA WHATSAPP)
CREATE TABLE IF NOT EXISTS visitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    imovel_id UUID NOT NULL REFERENCES imoveis(id) ON DELETE CASCADE,
    imoveis_ids UUID[] DEFAULT '{}', -- Array de IDs de imóveis para roteiro
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    corretor_nome VARCHAR(255) NOT NULL DEFAULT 'Corretor Principal',
    corretor_telefone VARCHAR(30),
    data_hora_visita TIMESTAMPTZ NOT NULL,
    -- Colunas de agendamento automático da régua
    lembrete_agendado_para TIMESTAMPTZ NOT NULL, -- 1h antes
    pos_visita_agendado_para TIMESTAMPTZ,       -- 2h após
    status VARCHAR(50) NOT NULL DEFAULT 'agendada', -- agendada, confirmada, realizada, cancelada, reagendada
    
    -- Preferências de Notificação (Checkboxes)
    notificar_confirmacao BOOLEAN DEFAULT true,
    notificar_lembrete BOOLEAN DEFAULT true,
    notificar_pos_visita BOOLEAN DEFAULT true,

    -- Status de disparo da confirmação inicial
    whatsapp_confirmacao_cliente VARCHAR(50) DEFAULT 'pendente', -- pendente, enviado, falha, ignorado
    whatsapp_confirmacao_proprietario VARCHAR(50) DEFAULT 'pendente',
    
    -- Status de disparo do lembrete de 1 hora
    whatsapp_lembrete_cliente VARCHAR(50) DEFAULT 'pendente', -- pendente, enviado, falha, cancelado, ignorado
    whatsapp_lembrete_proprietario VARCHAR(50) DEFAULT 'pendente',

    -- Status de disparo pós-visita (2 horas após)
    whatsapp_pos_visita_cliente VARCHAR(50) DEFAULT 'pendente',
    
    feedback_cliente TEXT,
    feedback_proprietario TEXT,
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA: CONFIGURAÇÕES WHATSAPP
CREATE TABLE IF NOT EXISTS configuracoes_whatsapp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provedor VARCHAR(50) NOT NULL DEFAULT 'evolution_api', -- evolution_api, zapi, meta_cloud, custom_webhook
    api_url TEXT,
    api_key TEXT,
    instancia_nome VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    
    -- Templates personalizáveis com tags dinâmicas ({cliente_nome}, {proprietario_nome}, {roteiro_imoveis}, {total_imoveis}, {imovel_titulo}, {endereco}, {data_hora}, {corretor_nome})
    template_confirmacao_cliente TEXT DEFAULT 'Olá, {cliente_nome}! 👋 Confirmando nossa visita para *{data_hora}*.\n\n📍 *Roteiro de Imóveis:*\n{roteiro_imoveis}\n\n👤 *Corretor:* {corretor_nome} ({corretor_telefone})\n\nQualquer dúvida, conte com a *EasyMob*!',
    
    template_confirmacao_proprietario TEXT DEFAULT 'Olá, {proprietario_nome}! Informamos que a equipe *EasyMob* agendou uma visita ao seu imóvel *{imovel_titulo}* ({endereco}) para *{data_hora}* com o cliente {cliente_nome}.\n\n👤 *Corretor:* {corretor_nome}\n*EasyMob - Gestão Imobiliária Inteligente*',
    
    template_lembrete_cliente TEXT DEFAULT '⏰ *Lembrete de Visita (em 1 hora)*\n\nOlá, {cliente_nome}! Lembramos que sua visita aos imóveis acontecerá hoje às *{horario}*.\n\n📍 *Roteiro:*\n{roteiro_imoveis}\n\n👤 *Corretor:* {corretor_nome} ({corretor_telefone})\n\nNos vemos em breve!\n*EasyMob*',
    
    template_lembrete_proprietario TEXT DEFAULT '⏰ *Lembrete de Visita (em 1 hora)*\n\nOlá, {proprietario_nome}! A *EasyMob* lembra que a visita ao seu imóvel *{imovel_titulo}* com o cliente {cliente_nome} acontecerá às *{horario}*.\n\n👤 *Corretor:* {corretor_nome}\n*EasyMob*',

    template_pos_visita_cliente TEXT DEFAULT '✨ *Olá, {cliente_nome}! Tudo bem?*\n\nEsperamos que a visita de hoje tenha sido ótima!\n\n🏠 *Imóveis visitados:*\n{roteiro_imoveis}\n\nGostaríamos de saber: o que você achou dos imóveis? Algum deles chamou sua atenção ou despertou interesse para iniciarmos uma proposta?\n\nQualquer dúvida, estamos à sua inteira disposição!\n*EasyMob - Gestão Imobiliária Inteligente*',
    
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA: LOGS DE DISPARO WHATSAPP
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visita_id UUID REFERENCES visitas(id) ON DELETE SET NULL,
    tipo_mensagem VARCHAR(50) NOT NULL, -- confirmacao_cliente, confirmacao_proprietario, lembrete_cliente, lembrete_proprietario, pos_visita_cliente, avulsa
    destinatario_nome VARCHAR(255),
    destinatario_telefone VARCHAR(30) NOT NULL,
    tipo_destinatario VARCHAR(50) NOT NULL, -- cliente, proprietario, corretor
    conteudo_mensagem TEXT NOT NULL,
    status_envio VARCHAR(50) NOT NULL, -- sucesso, erro, pendente
    resposta_api JSONB,
    erro_detalhes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TRIGGERS E FUNÇÕES AUTOMÁTICAS
-- ==============================================================================

-- Função para calcular lembrete_agendado_para (data_hora_visita - 1 hora) e pos_visita_agendado_para (+ 2 horas)
CREATE OR REPLACE FUNCTION calcular_lembrete_visita()
RETURNS TRIGGER AS $$
BEGIN
    NEW.lembrete_agendado_para := NEW.data_hora_visita - INTERVAL '1 hour';
    NEW.pos_visita_agendado_para := NEW.data_hora_visita + INTERVAL '2 hours';
    NEW.atualizado_em := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calcular_lembrete_visita ON visitas;
CREATE TRIGGER trg_calcular_lembrete_visita
BEFORE INSERT OR UPDATE OF data_hora_visita ON visitas
FOR EACH ROW
EXECUTE FUNCTION calcular_lembrete_visita();

-- Índices para alta performance nos filtros de visitas e cron de lembretes
CREATE INDEX IF NOT EXISTS idx_visitas_data_hora ON visitas(data_hora_visita);
CREATE INDEX IF NOT EXISTS idx_visitas_lembrete_cron ON visitas(lembrete_agendado_para, whatsapp_lembrete_cliente, status);
CREATE INDEX IF NOT EXISTS idx_visitas_cliente ON visitas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_visitas_imovel ON visitas(imovel_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_status ON imoveis(status);
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Total (para uso com Chave Anon e Autenticação Simples)
CREATE POLICY "Permitir leitura total imoveis" ON imoveis FOR ALL USING (true);
CREATE POLICY "Permitir leitura total clientes" ON clientes FOR ALL USING (true);
CREATE POLICY "Permitir leitura total visitas" ON visitas FOR ALL USING (true);
CREATE POLICY "Permitir leitura total config" ON configuracoes_whatsapp FOR ALL USING (true);
CREATE POLICY "Permitir leitura total logs" ON whatsapp_logs FOR ALL USING (true);
