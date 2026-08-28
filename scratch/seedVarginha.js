const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mzkanjhapnqzdltqmitj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Y61rQMjnZGTnrV7ucTggSg_bm8ELw5E';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_EMAIL = 'rogervasques@gmail.com';
const ADMIN_NAME = 'Roger Vasques Berchembrock';
const ADMIN_PHONE = '35999999999';

const TELEFONE_PROPRIETARIOS = '35999999999';
const TELEFONE_CLIENTES = '35988888888';

// Lista de 30 nomes de proprietários
const PROPRIETARIOS_NOMES = [
  'Carlos Eduardo Silveira', 'Mariana Alvarenga Bueno', 'Roberto Mendes Rezende',
  'Juliana Figueiredo Nogueira', 'Fernando Henrique Paiva', 'Beatriz Vasconcelos Prado',
  'Lucas Gabriel Antunes', 'Camila Cristina Ferreira', 'Marcelo Augusto Faria',
  'Patrícia Helena Tavares', 'Thiago Henrique Oliveira', 'Vanessa Cristina Gomes',
  'Rodrigo Ramos Esteves', 'Larissa Danielle Barbosa', 'Guilherme Castro Vilela',
  'Aline Moreira Magalhães', 'Renato Prado Albuquerque', 'Fernanda Lima Pimenta',
  'Eduardo Salgado Junqueira', 'Priscila Helena Ramos', 'Gustavo Henrique Toledo',
  'Daniela Cristina Ribeiro', 'Fábio Luciano Naves', 'Renata Valéria Silveira',
  'Henrique Duarte Sampaio', 'Luciana Maria Pimentel', 'Vinícius Rocha Esteves',
  'Sabrina Costa Guimarães', 'Alexandre Magno Chaves', 'Tatiane Cristina Vianna'
];

// Bairros de Varginha / MG
const BAIRROS_VARGINHA = [
  'Vila Pinto', 'Jardim Eliana', 'Residencial Alameda', 'Santa Luiza',
  'Centro', 'Park Real', 'Vale dos Ipês', 'Vila Paiva', 'Jardim Andere',
  'Bom Pastor', 'Pinheiros', 'Sion', 'Santana', 'Rezende', 'Damasco',
  'Bela Vista', 'Industrial', 'Jardim Petrópolis', 'Santa Terezinha',
  'Sagrado Coração', 'Cidade Nova', 'Jardim Canaã', 'Imaculada Conceição',
  'Treviso', 'Flamboyant', 'Residencial Portinari', 'Jardim Ribeiro',
  'Jardim das Oliveiras', 'Alto da Vila Paiva', 'Parque Boa Vista'
];

// URLs reais de arquitetura/interiores do Unsplash
const FOTOS_POOL = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1502005229762-ee1b2b93e007?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200&auto=format&fit=crop&q=80'
];

// Nomes de 50 Clientes / Leads
const CLIENTES_NOMES = [
  'Gabriel Silveira Miranda', 'Ana Paula Mendonça', 'Matheus Costa Rezende',
  'Juliana Alvarenga Paiva', 'Felipe Augusto Toledo', 'Carolina Nogueira Prado',
  'Lucas Eduardo Salgado', 'Mariana Esteves Faria', 'Rafael Henrique Junqueira',
  'Camila Vilela Esteves', 'Rodrigo Barbosa Naves', 'Beatriz Pimenta Ramos',
  'Vinícius Magalhães Chaves', 'Larissa Duarte Guimarães', 'Eduardo Sampaio Ribeiro',
  'Fernanda Gomes Albuquerque', 'Thiago Lima Pimentel', 'Patrícia Castro Vianna',
  'Gustavo Prado Rocha', 'Vanessa Valéria Silveira', 'Alexandre Henrique Tavares',
  'Sabrina Helena Ferreira', 'Renato Luciano Gomes', 'Daniela Maria Esteves',
  'Fábio Augusto Barbosa', 'Aline Cristina Nogueira', 'Marcelo Henrique Prado',
  'Priscila Danielle Salgado', 'Henrique Magno Faria', 'Luciana Helena Junqueira',
  'Guilherme Salgado Toledo', 'Tatiane Lima Esteves', 'Bruno César Albuquerque',
  'Jéssica Mara Paiva', 'Diego Armando Rezende', 'Natália Freitas Silveira',
  'Leonardo Gomes Prado', 'Isabela Cristina Vilela', 'Renan Augusto Sampaio',
  'Taís Maria Naves', 'Caio Henrique Ramos', 'Bárbara Cristina Pimenta',
  'Danilo Esteves Chaves', 'Letícia Danielle Guimarães', 'Vitor Hugo Ribeiro',
  'Débora Cristina Pimentel', 'Otávio Augusto Rocha', 'Monique Helena Vianna',
  'Murilo Silveira Tavares', 'Lorena Cristina Ferreira'
];

// Modelos de imóveis para Varginha
const MODELOS_IMOVEIS = [
  { tipo: 'casa', finalidade: 'venda', prefixo: 'Casa de Alto Padrão com Espaço Gourmet', quartos: 4, suites: 2, vagas: 3, area: 280, valMin: 750000, valMax: 1450000 },
  { tipo: 'casa', finalidade: 'venda', prefixo: 'Excelente Sobrado Residencial', quartos: 3, suites: 1, vagas: 2, area: 195, valMin: 480000, valMax: 720000 },
  { tipo: 'casa', finalidade: 'locacao', prefixo: 'Casa Térrea Espaçosa com Quintal', quartos: 3, suites: 1, vagas: 2, area: 160, locMin: 2200, locMax: 3800 },
  { tipo: 'casa', finalidade: 'venda_locacao', prefixo: 'Belíssima Residência com Piscina Aquecida', quartos: 4, suites: 3, vagas: 4, area: 360, valMin: 1200000, valMax: 2100000, locMin: 5500, locMax: 8500 },
  { tipo: 'apartamento', finalidade: 'venda', prefixo: 'Apartamento Moderno com Varanda Gourmet', quartos: 3, suites: 1, vagas: 2, area: 110, valMin: 420000, valMax: 680000 },
  { tipo: 'apartamento', finalidade: 'venda', prefixo: 'Apartamento Alto Padrão e Vista Panorâmica', quartos: 3, suites: 2, vagas: 2, area: 145, valMin: 650000, valMax: 980000 },
  { tipo: 'apartamento', finalidade: 'locacao', prefixo: 'Apartamento Mobiliado e Decorado', quartos: 2, suites: 1, vagas: 1, area: 78, locMin: 1800, locMax: 2900 },
  { tipo: 'apartamento', finalidade: 'venda_locacao', prefixo: 'Apartamento Garden com Área Externa Privativa', quartos: 3, suites: 1, vagas: 2, area: 135, valMin: 550000, valMax: 850000, locMin: 2800, locMax: 4200 },
  { tipo: 'cobertura', finalidade: 'venda', prefixo: 'Cobertura Duplex Cinematográfica com Hidro', quartos: 4, suites: 3, vagas: 3, area: 290, valMin: 1350000, valMax: 2600000 },
  { tipo: 'cobertura', finalidade: 'venda_locacao', prefixo: 'Cobertura Exclusiva com Solarium e Churrasqueira', quartos: 3, suites: 2, vagas: 3, area: 240, valMin: 1100000, valMax: 1950000, locMin: 4800, locMax: 7800 },
  { tipo: 'casa', finalidade: 'venda', prefixo: 'Casa em Condomínio Fechado com Segurança 24h', quartos: 4, suites: 4, vagas: 4, area: 420, valMin: 1800000, valMax: 3500000 },
  { tipo: 'comercial', finalidade: 'locacao', prefixo: 'Conjunto Comercial Pronto para Consultório/Escritório', quartos: 0, suites: 0, vagas: 2, area: 85, locMin: 2500, locMax: 5200 },
  { tipo: 'comercial', finalidade: 'venda', prefixo: 'Prédio Comercial em Ponto Nobre e Estratégico', quartos: 0, suites: 0, vagas: 6, area: 480, valMin: 1900000, valMax: 3800000 },
  { tipo: 'comercial', finalidade: 'locacao', prefixo: 'Galpão Industrial com Docas e Escritórios', quartos: 0, suites: 0, vagas: 8, area: 650, locMin: 7500, locMax: 14500 },
];

async function seedVarginha() {
  console.log('🚀 Iniciando Povoamento Completo - Varginha/MG...\n');

  // 1. Limpeza de tabelas operacionais
  console.log('🧹 Limpando dados operacionais antigos...');
  try {
    await supabase.from('visitas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('imoveis').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('clientes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('proprietarios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('invites').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Banco de dados limpo com sucesso.');
  } catch (err) {
    console.warn('Aviso na limpeza:', err.message);
  }

  // 2. Criação dos 30 Proprietários
  console.log('\n👥 Inserindo 30 Proprietários (Telefone fixo: 35 99999-9999)...');
  const proprietarios = [];
  for (let i = 0; i < 30; i++) {
    const id = crypto.randomUUID();
    const nome = PROPRIETARIOS_NOMES[i];
    const email = `proprietario${i + 1}@teste.com`;
    proprietarios.push({
      id,
      nome,
      telefone: TELEFONE_PROPRIETARIOS,
      email,
      criado_em: new Date(Date.now() - (30 - i) * 86400000).toISOString(),
    });
  }

  const { data: insertedProprietarios, error: errProp } = await supabase
    .from('proprietarios')
    .insert(proprietarios)
    .select('id, nome, telefone, email');

  if (errProp) {
    throw new Error(`Erro ao inserir proprietários: ${errProp.message}`);
  }
  console.log(`✅ ${insertedProprietarios.length} proprietários inseridos com sucesso.`);

  // 3. Criação dos 70 Imóveis em Varginha/MG (5 fotos por imóvel)
  console.log('\n🏠 Inserindo 70 Imóveis em Varginha - MG...');
  const imoveis = [];
  for (let i = 0; i < 70; i++) {
    const id = crypto.randomUUID();
    const codigo = `VG-${String(101 + i).padStart(3, '0')}`;
    const modelo = MODELOS_IMOVEIS[i % MODELOS_IMOVEIS.length];
    const bairro = BAIRROS_VARGINHA[i % BAIRROS_VARGINHA.length];
    const proprietario = insertedProprietarios[i % insertedProprietarios.length];

    // Seleciona 5 fotos distintas do pool
    const startFotoIdx = (i * 3) % (FOTOS_POOL.length - 5);
    const fotos5 = FOTOS_POOL.slice(startFotoIdx, startFotoIdx + 5);
    const imagemPrincipal = fotos5[0];

    const titulo = `${modelo.prefixo} no ${bairro}`;
    const endereco = `Rua ${['das Acácias', 'São José', 'Presidente Vargas', 'Rio de Janeiro', 'Belo Horizonte', 'Minas Gerais', 'Tiradentes', 'Sete de Setembro', 'dos Ipês', 'da Saudade'][i % 10]}, ${50 + (i * 15)}`;

    let valorVenda = null;
    let valorLocacao = null;

    if (modelo.finalidade === 'venda' || modelo.finalidade === 'venda_locacao') {
      const min = modelo.valMin || 350000;
      const max = modelo.valMax || 950000;
      valorVenda = Math.round((min + ((max - min) * (i % 10)) / 10) / 10000) * 10000;
    }

    if (modelo.finalidade === 'locacao' || modelo.finalidade === 'venda_locacao') {
      const min = modelo.locMin || 1500;
      const max = modelo.locMax || 4500;
      valorLocacao = Math.round((min + ((max - min) * (i % 10)) / 10) / 100) * 100;
    }

    const valorCondominio = modelo.tipo === 'apartamento' || modelo.tipo === 'cobertura' ? 250 + (i % 8) * 80 : modelo.tipo === 'casa' && i % 3 === 0 ? 380 : null;
    const valorIptu = Math.round(45 + (i % 12) * 25);

    const descricao = `Excelente oportunidade no tradicional e valorizado bairro ${bairro} em Varginha/MG. Imóvel espaçoso com acabamento refinado, iluminação natural privilegiada, ambientes integrados, armários planejados e localização nobre com fácil acesso ao comércio, escolas e principais vias da cidade.`;

    const caracteristicas = [
      'Varanda Gourmet', 'Piso Porcelanato', 'Armários Planejados',
      'Portaria / Interfone', 'Esquadrias em Alumínio', 'Garagem Coberta',
      'Excelente Iluminação', 'Localização Privilegiada'
    ];

    imoveis.push({
      id,
      codigo,
      titulo,
      tipo: modelo.tipo,
      finalidade: modelo.finalidade,
      endereco,
      numero: String(50 + (i * 15)),
      bairro,
      cidade: 'Varginha',
      estado: 'MG',
      cep: '37000-000',
      valor_venda: valorVenda,
      valor_locacao: valorLocacao,
      valor_condominio: valorCondominio,
      valor_iptu: valorIptu,
      quartos: modelo.quartos,
      suites: modelo.suites,
      banheiros: Math.max(1, modelo.suites + 1),
      vagas: modelo.vagas,
      area_construida: modelo.area,
      area_util: modelo.area,
      aceita_pet: true,
      descricao_comercial: descricao,
      caracteristicas,
      observacoes_chaves: `Chaves na portaria com o zelador ou no cofre eletrônico (Código: 4${String(i).padStart(2, '0')}8). Agendar com 30min de antecedência.`,
      status: 'disponivel',
      imagem_url: imagemPrincipal,
      proprietario_id: proprietario.id,
      proprietario_nome: proprietario.nome,
      proprietario_telefone: TELEFONE_PROPRIETARIOS,
      proprietario_email: proprietario.email,
      criado_em: new Date(Date.now() - (60 - i) * 86400000).toISOString(),
    });
  }

  // Inserção em lotes de 25
  const insertedImoveis = [];
  const batchSize = 25;
  for (let b = 0; b < imoveis.length; b += batchSize) {
    const slice = imoveis.slice(b, b + batchSize);
    const { data, error } = await supabase.from('imoveis').insert(slice).select('id, codigo, titulo, bairro, valor_venda, valor_locacao');
    if (error) {
      throw new Error(`Erro ao inserir lote de imóveis: ${error.message}`);
    }
    insertedImoveis.push(...data);
  }
  console.log(`✅ ${insertedImoveis.length} imóveis cadastrados em Varginha/MG.`);

  // 4. Criação dos 50 Clientes / Leads com Preferências de Busca
  console.log('\n👤 Inserindo 50 Clientes / Leads (Telefone fixo: 35 98888-8888)...');
  const clientes = [];
  for (let i = 0; i < 50; i++) {
    const id = crypto.randomUUID();
    const nome = CLIENTES_NOMES[i];
    const email = `cliente${i + 1}@teste.com`;

    const bairroInteresse1 = BAIRROS_VARGINHA[i % BAIRROS_VARGINHA.length];
    const bairroInteresse2 = BAIRROS_VARGINHA[(i + 3) % BAIRROS_VARGINHA.length];
    const tipoDesejado = i % 3 === 0 ? 'Apartamento' : i % 3 === 1 ? 'Casa' : 'Cobertura';
    const faixaPreco = i % 2 === 0 ? 'R$ 450k a 850k' : 'R$ 850k a 1.6M';

    // perfil_interesse < 100 caracteres
    const perfilInteresse = `${tipoDesejado} 3Q em ${bairroInteresse1} ou ${bairroInteresse2}`;
    const observacoes = `Cliente qualificado para compra/locação em Varginha. Procura ${tipoDesejado} com 3 quartos nos bairros ${bairroInteresse1} ou ${bairroInteresse2}. Faixa estimada: ${faixaPreco}.`;

    clientes.push({
      id,
      nome,
      telefone: TELEFONE_CLIENTES,
      email,
      perfil_interesse: perfilInteresse.slice(0, 95),
      faixa_orcamento: faixaPreco.slice(0, 50),
      origem_lead: ['site', 'instagram', 'whatsapp', 'portal_zap', 'indicacao'][i % 5],
      status: 'ativo',
      observacoes,
      criado_em: new Date(Date.now() - (45 - i) * 86400000).toISOString(),
    });
  }

  const { data: insertedClientes, error: errCli } = await supabase
    .from('clientes')
    .insert(clientes)
    .select('id, nome, telefone, email');

  if (errCli) {
    throw new Error(`Erro ao inserir clientes: ${errCli.message}`);
  }
  console.log(`✅ ${insertedClientes.length} clientes cadastrados com preferências de busca.`);

  // 5. Criação dos Agendamentos de Visitas (1 Mês: Passado e Futuro, 1 a 3 visitas/dia)
  console.log('\n📅 Gerando ~50 Visitas com Roteiros Multi-Imóveis (15 dias passado e 15 dias futuro)...');
  const visitas = [];
  const now = new Date();

  // Horários típicos de visita
  const horarios = [
    { h: 9, m: 0 }, { h: 10, m: 30 }, { h: 14, m: 0 }, { h: 15, m: 30 }, { h: 17, m: 0 }
  ];

  // Distribuir de -15 dias até +15 dias (31 dias)
  let visitaCount = 1;
  for (let diaOffset = -15; diaOffset <= 15; diaOffset++) {
    // 1 a 3 visitas por dia
    const visitasNoDia = diaOffset === 0 ? 3 : (Math.abs(diaOffset) % 2 === 0 ? 2 : 1);

    for (let k = 0; k < visitasNoDia; k++) {
      const id = crypto.randomUUID();
      const slot = horarios[(k * 2 + (diaOffset + 15)) % horarios.length];

      const visitDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diaOffset, slot.h, slot.m, 0);
      const reminderDate = new Date(visitDate.getTime() - 60 * 60 * 1000); // 1h antes
      const posDate = new Date(visitDate.getTime() + 2 * 60 * 60 * 1000); // 2h depois

      // Status coerente com a linha do tempo
      let status = 'agendada';
      if (diaOffset < 0) {
        // Passado: maioria realizada (concluida), algumas não compareceu ou cancelada
        if (visitaCount % 7 === 0) status = 'cancelada';
        else if (visitaCount % 5 === 0) status = 'nao_compareceu';
        else status = 'concluida';
      } else if (diaOffset === 0) {
        // Hoje
        status = 'agendada';
      } else {
        // Futuro
        status = 'agendada';
      }

      // Vínculo de 1 a 3 imóveis no roteiro
      const qtdImoveisRoteiro = (visitaCount % 3 === 0) ? 3 : (visitaCount % 2 === 0 ? 2 : 1);
      const imoveisRoteiroIds = [];
      const baseImoIdx = (visitaCount * 2) % insertedImoveis.length;
      for (let r = 0; r < qtdImoveisRoteiro; r++) {
        imoveisRoteiroIds.push(insertedImoveis[(baseImoIdx + r) % insertedImoveis.length].id);
      }
      const primaryImovel = insertedImoveis[baseImoIdx];
      const cliente = insertedClientes[(visitaCount - 1) % insertedClientes.length];

      visitas.push({
        id,
        imovel_id: primaryImovel.id,
        cliente_id: cliente.id,
        imoveis_ids: imoveisRoteiroIds,
        corretor_nome: ADMIN_NAME,
        corretor_telefone: ADMIN_PHONE,
        data_hora_visita: visitDate.toISOString(),
        lembrete_agendado_para: reminderDate.toISOString(),
        pos_visita_agendado_para: posDate.toISOString(),
        status,
        notificar_confirmacao: true,
        notificar_lembrete: true,
        notificar_pos_visita: true,
        whatsapp_confirmacao_cliente: status === 'concluida' ? 'visualizado' : diaOffset <= 0 ? 'entregue' : 'enviado',
        whatsapp_confirmacao_proprietario: status === 'concluida' ? 'visualizado' : diaOffset <= 0 ? 'entregue' : 'enviado',
        whatsapp_lembrete_cliente: diaOffset < 0 ? 'entregue' : (diaOffset === 0 ? 'enviado' : 'pendente'),
        whatsapp_lembrete_proprietario: diaOffset < 0 ? 'entregue' : (diaOffset === 0 ? 'enviado' : 'pendente'),
        whatsapp_pos_visita_cliente: status === 'concluida' ? 'lido' : 'pendente',
        feedback_cliente: status === 'concluida' ? (visitaCount % 2 === 0 ? 'Adorou o acabamento e a localização em Varginha. Ficou de analisar a proposta no fim de semana.' : 'Gostou bastante do espaço interno e da varanda gourmet.') : null,
        observacoes: qtdImoveisRoteiro > 1 ? `Roteiro composto por ${qtdImoveisRoteiro} imóveis em Varginha (${primaryImovel.bairro}).` : `Visita ao imóvel ${primaryImovel.titulo}.`,
        criado_em: new Date(Date.now() - 20 * 86400000).toISOString(),
      });

      visitaCount++;
    }
  }

  // Inserção em lotes de 20 visitas
  const insertedVisitas = [];
  for (let b = 0; b < visitas.length; b += 20) {
    const slice = visitas.slice(b, b + 20);
    const { data, error } = await supabase.from('visitas').insert(slice).select('id, data_hora_visita, status');
    if (error) {
      throw new Error(`Erro ao inserir lote de visitas: ${error.message}`);
    }
    insertedVisitas.push(...data);
  }
  console.log(`✅ ${insertedVisitas.length} visitas agendadas distribuídas ao longo de 30 dias.`);

  console.log('\n======================================================');
  console.log('🎉 POVOAMENTO CONCLUÍDO COM SUCESSO!');
  console.log(`• 30 Proprietários cadastrados (Tel: ${TELEFONE_PROPRIETARIOS})`);
  console.log(`• 70 Imóveis em Varginha/MG com fotos e dados realistas`);
  console.log(`• 50 Clientes com preferências de busca (Tel: ${TELEFONE_CLIENTES})`);
  console.log(`• ${insertedVisitas.length} Visitas agendadas (15 dias passado / 15 dias futuro)`);
  console.log('======================================================\n');
}

seedVarginha().catch(err => {
  console.error('❌ Erro fatal durante o povoamento:', err);
  process.exit(1);
});
