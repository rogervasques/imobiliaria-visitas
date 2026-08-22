-- ==============================================================================
-- DADOS DE SEED INICIAL (EXEMPLOS PARA TESTES RÁPIDOS)
-- ==============================================================================

-- 1. Inserir Configuração Padrão do WhatsApp
INSERT INTO configuracoes_whatsapp (
    provedor,
    api_url,
    api_key,
    instancia_nome,
    ativo
) VALUES (
    'evolution_api',
    'https://api.exemplo-evolution.com',
    'MINHA_CHAVE_API_SECURE_123',
    'easymob_principal',
    true
) ON CONFLICT DO NOTHING;

-- 2. Inserir Imóveis de Exemplo
INSERT INTO imoveis (
    id, codigo, titulo, tipo, finalidade, endereco, numero, complemento, bairro, cidade, estado, cep,
    valor_venda, valor_locacao, quartos, banheiros, vagas, area_util,
    proprietario_nome, proprietario_telefone, proprietario_email, observacoes_chaves, status
) VALUES 
(
    'a1111111-1111-1111-1111-111111111111',
    'AP-1024',
    'Apartamento Alto Padrão com Vista Panorâmica',
    'apartamento',
    'venda',
    'Avenida Paulista',
    '1500',
    'Apto 182',
    'Bela Vista',
    'São Paulo',
    'SP',
    '01310-200',
    1450000.00,
    NULL,
    3,
    3,
    2,
    128.50,
    'Carlos Eduardo Mendonça',
    '11987654321',
    'carlos.mendonca@email.com',
    'Chaves na portaria com o zelador Sr. Francisco',
    'disponivel'
),
(
    'a2222222-2222-2222-2222-222222222222',
    'CS-3088',
    'Casa Contemporânea em Condomínio Fechado',
    'casa',
    'venda',
    'Rua das Palmeiras',
    '45',
    'Cond. Quinta da Baronesa',
    'Granja Viana',
    'Cotia',
    'SP',
    '06700-000',
    2890000.00,
    NULL,
    4,
    5,
    4,
    380.00,
    'Mariana Albuquerque',
    '11991234567',
    'mariana.albuquerque@email.com',
    'Proprietária reside no local, avisar 15min antes pelo interfone',
    'disponivel'
),
(
    'a3333333-3333-3333-3333-333333333333',
    'ST-5011',
    'Studio Moderno Mobiliado Próximo ao Metrô',
    'apartamento',
    'ambos',
    'Rua dos Pinheiros',
    '720',
    'Studio 410',
    'Pinheiros',
    'São Paulo',
    'SP',
    '05422-001',
    590000.00,
    3600.00,
    1,
    1,
    1,
    42.00,
    'Roberto Silveira Lima',
    '11977778888',
    'roberto.lima@email.com',
    'Fechadura eletrônica com senha (solicitar com corretor)',
    'disponivel'
) ON CONFLICT (id) DO NOTHING;

-- 3. Inserir Clientes de Exemplo
INSERT INTO clientes (
    id, nome, telefone, email, perfil_interesse, faixa_orcamento, origem_lead, status, observacoes
) VALUES 
(
    'b1111111-1111-1111-1111-111111111111',
    'Lucas Ferraz Souza',
    '11998887766',
    'lucas.ferraz@techcorp.com',
    'Busca apto 3 dormitórios perto do metrô para família',
    'R$ 1.2M a 1.6M',
    'portal',
    'ativo',
    'Interesse em fechar proposta rápida com financiamento pré-aprovado.'
),
(
    'b2222222-2222-2222-2222-222222222222',
    'Fernanda Vasconcelos',
    '11985554433',
    'fernanda.vasconcelos@advocacia.com',
    'Casa em condomínio com espaço para home office e quintal amplo',
    'R$ 2.5M a 3.2M',
    'indicacao',
    'ativo',
    'Visita acompanhada do marido e arquiteta.'
),
(
    'b3333333-3333-3333-3333-333333333333',
    'Guilherme Antunes',
    '11971112233',
    'guilherme.antunes@invest.com',
    'Studio ou 1 dormitório para investimento em locação',
    'R$ 500k a 700k',
    'instagram',
    'ativo',
    'Investidor, procura rentabilidade rápida.'
) ON CONFLICT (id) DO NOTHING;

-- 4. Inserir Visitas (Hoje e Próximos Dias)
INSERT INTO visitas (
    id, imovel_id, cliente_id, corretor_nome, corretor_telefone,
    data_hora_visita, lembrete_agendado_para, status,
    whatsapp_confirmacao_cliente, whatsapp_confirmacao_proprietario,
    whatsapp_lembrete_cliente, whatsapp_lembrete_proprietario,
    observacoes
) VALUES 
(
    'c1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Rogério Silva',
    '11989990000',
    NOW() + INTERVAL '2 hours',
    (NOW() + INTERVAL '2 hours') - INTERVAL '30 minutes',
    'confirmada',
    'enviado',
    'enviado',
    'pendente',
    'pendente',
    'Cliente pontual, levar ficha de proposta impressa.'
),
(
    'c2222222-2222-2222-2222-222222222222',
    'a2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'Rogério Silva',
    '11989990000',
    NOW() + INTERVAL '4 hours',
    (NOW() + INTERVAL '4 hours') - INTERVAL '30 minutes',
    'agendada',
    'enviado',
    'enviado',
    'pendente',
    'pendente',
    'Avisar na portaria que o casal entrará no carro do corretor.'
),
(
    'c3333333-3333-3333-3333-333333333333',
    'a3333333-3333-3333-3333-333333333333',
    'b3333333-3333-3333-3333-333333333333',
    'Rogério Silva',
    '11989990000',
    NOW() + INTERVAL '1 day',
    (NOW() + INTERVAL '1 day') - INTERVAL '30 minutes',
    'agendada',
    'enviado',
    'enviado',
    'pendente',
    'pendente',
    'Apresentar histórico de aluguel por temporada na região.'
) ON CONFLICT (id) DO NOTHING;
