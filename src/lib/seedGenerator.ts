import { Cliente, Imovel, Proprietario, Visita, TipoImovel, FinalidadeImovel, StatusImovel, StatusCliente, OrigemLead, StatusVisita, EtapaCRM } from '@/types';

// Telefone seguro de teste para todos os proprietários e clientes
export const TELEFONE_PROPRIETARIOS_PADRAO = '35999999999';
export const TELEFONE_CLIENTES_PADRAO = '35988888888';

// Lista de 30 Proprietários com nomes brasileiros completos
export const PROPRIETARIOS_VARGINHA = [
  { nome: 'Carlos Eduardo Silveira', email: 'proprietario1@teste.com' },
  { nome: 'Mariana Alvarenga Bueno', email: 'proprietario2@teste.com' },
  { nome: 'Roberto Mendes Rezende', email: 'proprietario3@teste.com' },
  { nome: 'Juliana Figueiredo Nogueira', email: 'proprietario4@teste.com' },
  { nome: 'Fernando Henrique Paiva', email: 'proprietario5@teste.com' },
  { nome: 'Beatriz Vasconcelos Prado', email: 'proprietario6@teste.com' },
  { nome: 'Lucas Gabriel Antunes', email: 'proprietario7@teste.com' },
  { nome: 'Camila Cristina Ferreira', email: 'proprietario8@teste.com' },
  { nome: 'Marcelo Augusto Faria', email: 'proprietario9@teste.com' },
  { nome: 'Patrícia Helena Tavares', email: 'proprietario10@teste.com' },
  { nome: 'Thiago Henrique Oliveira', email: 'proprietario11@teste.com' },
  { nome: 'Vanessa Cristina Gomes', email: 'proprietario12@teste.com' },
  { nome: 'Rodrigo Ramos Esteves', email: 'proprietario13@teste.com' },
  { nome: 'Larissa Danielle Barbosa', email: 'proprietario14@teste.com' },
  { nome: 'Guilherme Castro Vilela', email: 'proprietario15@teste.com' },
  { nome: 'Aline Moreira Magalhães', email: 'proprietario16@teste.com' },
  { nome: 'Renato Prado Albuquerque', email: 'proprietario17@teste.com' },
  { nome: 'Fernanda Lima Pimenta', email: 'proprietario18@teste.com' },
  { nome: 'Eduardo Salgado Junqueira', email: 'proprietario19@teste.com' },
  { nome: 'Priscila Helena Ramos', email: 'proprietario20@teste.com' },
  { nome: 'Gustavo Henrique Toledo', email: 'proprietario21@teste.com' },
  { nome: 'Daniela Cristina Ribeiro', email: 'proprietario22@teste.com' },
  { nome: 'Fábio Luciano Naves', email: 'proprietario23@teste.com' },
  { nome: 'Renata Valéria Silveira', email: 'proprietario24@teste.com' },
  { nome: 'Henrique Duarte Sampaio', email: 'proprietario25@teste.com' },
  { nome: 'Luciana Maria Pimentel', email: 'proprietario26@teste.com' },
  { nome: 'Vinícius Rocha Esteves', email: 'proprietario27@teste.com' },
  { nome: 'Sabrina Costa Guimarães', email: 'proprietario28@teste.com' },
  { nome: 'Alexandre Magno Chaves', email: 'proprietario29@teste.com' },
  { nome: 'Tatiane Cristina Vianna', email: 'proprietario30@teste.com' },
];

// Bairros valorizados de Varginha / MG
export const BAIRROS_VARGINHA = [
  'Vila Pinto', 'Jardim Eliana', 'Residencial Alameda', 'Santa Luiza',
  'Centro', 'Park Real', 'Vale dos Ipês', 'Vila Paiva', 'Jardim Andere',
  'Bom Pastor', 'Pinheiros', 'Sion', 'Santana', 'Rezende', 'Damasco',
  'Bela Vista', 'Industrial', 'Jardim Petrópolis', 'Santa Terezinha',
  'Sagrado Coração', 'Cidade Nova', 'Jardim Canaã', 'Imaculada Conceição',
  'Treviso', 'Flamboyant', 'Residencial Portinari', 'Jardim Ribeiro',
  'Jardim das Oliveiras', 'Alto da Vila Paiva', 'Parque Boa Vista'
];

// URLs reais de fotos de arquitetura/interiores de alta resolução (Unsplash)
export const FOTOS_POOL = [
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
  'https://images.unsplash.com/photo-161821195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600566752734-2a0cd660991c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=1200&auto=format&fit=crop&q=80'
];

// Nomes de 50 Clientes / Leads
export const CLIENTES_VARGINHA = [
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

// Modelos de imóveis para Varginha com faixas de valores e características precisas
export const MODELOS_VARGINHA: {
  tipo: TipoImovel;
  finalidade: FinalidadeImovel;
  prefixo: string;
  quartos: number;
  suites: number;
  banheiros: number;
  vagas: number;
  area: number;
  valMin?: number;
  valMax?: number;
  locMin?: number;
  locMax?: number;
}[] = [
  { tipo: 'casa', finalidade: 'venda', prefixo: 'Casa de Alto Padrão com Espaço Gourmet', quartos: 4, suites: 2, banheiros: 3, vagas: 3, area: 280, valMin: 750000, valMax: 1450000 },
  { tipo: 'casa', finalidade: 'venda', prefixo: 'Excelente Sobrado Residencial', quartos: 3, suites: 1, banheiros: 2, vagas: 2, area: 195, valMin: 480000, valMax: 720000 },
  { tipo: 'casa', finalidade: 'locacao', prefixo: 'Casa Térrea Espaçosa com Quintal', quartos: 3, suites: 1, banheiros: 2, vagas: 2, area: 160, locMin: 2200, locMax: 3800 },
  { tipo: 'casa', finalidade: 'ambos', prefixo: 'Belíssima Residência com Piscina Aquecida', quartos: 4, suites: 3, banheiros: 4, vagas: 4, area: 360, valMin: 1200000, valMax: 2100000, locMin: 5500, locMax: 8500 },
  { tipo: 'apartamento', finalidade: 'venda', prefixo: 'Apartamento Moderno com Varanda Gourmet', quartos: 3, suites: 1, banheiros: 2, vagas: 2, area: 110, valMin: 420000, valMax: 680000 },
  { tipo: 'apartamento', finalidade: 'venda', prefixo: 'Apartamento Alto Padrão e Vista Panorâmica', quartos: 3, suites: 2, banheiros: 3, vagas: 2, area: 145, valMin: 650000, valMax: 980000 },
  { tipo: 'apartamento', finalidade: 'locacao', prefixo: 'Apartamento Mobiliado e Decorado', quartos: 2, suites: 1, banheiros: 2, vagas: 1, area: 78, locMin: 1800, locMax: 2900 },
  { tipo: 'apartamento', finalidade: 'ambos', prefixo: 'Apartamento Garden com Área Externa Privativa', quartos: 3, suites: 1, banheiros: 2, vagas: 2, area: 135, valMin: 550000, valMax: 850000, locMin: 2800, locMax: 4200 },
  { tipo: 'cobertura', finalidade: 'venda', prefixo: 'Cobertura Duplex Cinematográfica com Hidro', quartos: 4, suites: 3, banheiros: 4, vagas: 3, area: 290, valMin: 1350000, valMax: 2600000 },
  { tipo: 'cobertura', finalidade: 'ambos', prefixo: 'Cobertura Exclusiva com Solarium e Churrasqueira', quartos: 3, suites: 2, banheiros: 3, vagas: 3, area: 240, valMin: 1100000, valMax: 1950000, locMin: 4800, locMax: 7800 },
  { tipo: 'casa', finalidade: 'venda', prefixo: 'Casa em Condomínio Fechado com Segurança 24h', quartos: 4, suites: 4, banheiros: 5, vagas: 4, area: 420, valMin: 1800000, valMax: 3500000 },
  { tipo: 'apartamento', finalidade: 'venda', prefixo: 'Apartamento 2 Quartos Pronto para Morar', quartos: 2, suites: 1, banheiros: 2, vagas: 1, area: 68, valMin: 290000, valMax: 420000 },
  { tipo: 'comercial', finalidade: 'locacao', prefixo: 'Conjunto Comercial Pronto para Consultório/Escritório', quartos: 0, suites: 0, banheiros: 2, vagas: 2, area: 85, locMin: 2500, locMax: 5200 },
  { tipo: 'comercial', finalidade: 'venda', prefixo: 'Prédio Comercial em Ponto Nobre e Estratégico', quartos: 0, suites: 0, banheiros: 4, vagas: 6, area: 480, valMin: 1900000, valMax: 3800000 },
  { tipo: 'terreno', finalidade: 'venda', prefixo: 'Lote Plano em Condomínio Fechado Exclusivo', quartos: 0, suites: 0, banheiros: 0, vagas: 0, area: 450, valMin: 240000, valMax: 490000 },
  { tipo: 'comercial', finalidade: 'locacao', prefixo: 'Galpão Industrial com Docas e Escritórios', quartos: 0, suites: 0, banheiros: 4, vagas: 8, area: 650, locMin: 7500, locMax: 14500 },
];

/**
 * Gera conjunto completo de dados sintéticos para Varginha/MG com suporte a preferências estruturadas e galeria de fotos
 */
export function generateTestSeedData(
  adminUserId: string = 'user-admin-master',
  adminUserNome: string = 'Roger Vasques Berchembrock',
  imobiliariaNome: string = 'Lagom Imóveis',
  imobiliariaId?: string
) {
  const activeTenant = (imobiliariaNome || 'Lagom Imóveis').trim();

  // 1. Gera 30 Proprietários (focado em contato e tenant)
  const proprietarios: Proprietario[] = PROPRIETARIOS_VARGINHA.map((p, idx) => ({
    id: `prop-${String(idx + 1).padStart(3, '0')}`,
    nome: p.nome,
    telefone: TELEFONE_PROPRIETARIOS_PADRAO,
    email: p.email,
    imobiliaria: activeTenant,
    imobiliaria_id: imobiliariaId,
    criado_em: new Date(Date.now() - (35 - idx) * 86400000).toISOString(),
  }));

  // 2. Gera 70 Imóveis em Varginha/MG com galeria de 5 a 7 fotos
  const imoveis: Imovel[] = [];
  for (let i = 0; i < 70; i++) {
    const id = `imo-vg-${String(101 + i).padStart(3, '0')}`;
    const codigo = `VG-${String(101 + i).padStart(3, '0')}`;
    const modelo = MODELOS_VARGINHA[i % MODELOS_VARGINHA.length];
    const bairro = BAIRROS_VARGINHA[i % BAIRROS_VARGINHA.length];
    const proprietario = proprietarios[i % proprietarios.length];

    // Seleciona 5 a 6 fotos rotacionadas do pool
    const poolSize = FOTOS_POOL.length;
    const startFotoIdx = (i * 4) % (poolSize - 6);
    const fotosGaleria = [
      FOTOS_POOL[startFotoIdx],
      FOTOS_POOL[(startFotoIdx + 1) % poolSize],
      FOTOS_POOL[(startFotoIdx + 2) % poolSize],
      FOTOS_POOL[(startFotoIdx + 3) % poolSize],
      FOTOS_POOL[(startFotoIdx + 4) % poolSize],
      FOTOS_POOL[(startFotoIdx + 5) % poolSize],
    ].filter(Boolean);

    const imagemPrincipal = fotosGaleria[0];
    const titulo = `${modelo.prefixo} no ${bairro}`;
    const endereco = `Rua ${['das Acácias', 'São José', 'Presidente Vargas', 'Rio de Janeiro', 'Belo Horizonte', 'Minas Gerais', 'Tiradentes', 'Sete de Setembro', 'dos Ipês', 'da Saudade'][i % 10]}, ${50 + (i * 15)}`;

    let valorVenda: number | null = null;
    let valorLocacao: number | null = null;

    if (modelo.finalidade === 'venda' || modelo.finalidade === 'ambos') {
      const min = modelo.valMin || 350000;
      const max = modelo.valMax || 950000;
      valorVenda = Math.round((min + ((max - min) * (i % 10)) / 10) / 10000) * 10000;
    }

    if (modelo.finalidade === 'locacao' || modelo.finalidade === 'ambos') {
      const min = modelo.locMin || 1500;
      const max = modelo.locMax || 4500;
      valorLocacao = Math.round((min + ((max - min) * (i % 10)) / 10) / 100) * 100;
    }

    const valorCondominio = modelo.tipo === 'apartamento' || modelo.tipo === 'cobertura' 
      ? 280 + (i % 8) * 75 
      : modelo.tipo === 'casa' && i % 3 === 0 
      ? 390 
      : null;
    const valorIptu = Math.round(55 + (i % 12) * 28);

    const descricao = `Excelente oportunidade no tradicional e valorizado bairro ${bairro} em Varginha/MG. Imóvel espaçoso com acabamento refinado, iluminação natural privilegiada, ambientes integrados, armários planejados e localização nobre com fácil acesso ao comércio, escolas e principais vias da cidade.`;

    const caracteristicas = [
      'Varanda Gourmet', 'Piso Porcelanato', 'Armários Planejados',
      'Portaria / Interfone', 'Esquadrias em Alumínio', 'Garagem Coberta',
      'Excelente Iluminação', 'Localização Privilegiada'
    ];

    if (modelo.tipo === 'casa' || modelo.tipo === 'cobertura') {
      caracteristicas.push('Piscina', 'Churrasqueira', 'Espaço Gourmet');
    }

    imoveis.push({
      id,
      codigo,
      titulo,
      tipo: modelo.tipo,
      finalidade: modelo.finalidade,
      endereco,
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
      banheiros: modelo.banheiros || Math.max(1, modelo.suites + 1),
      vagas: modelo.vagas,
      area_construida: modelo.area,
      area_util: modelo.area,
      area_terreno: Math.round(modelo.area * 1.35),
      aceita_pet: true,
      descricao_comercial: descricao,
      caracteristicas,
      observacoes_chaves: `Chaves na portaria com o zelador ou no cofre eletrônico (Código: 4${String(i).padStart(2, '0')}8). Agendar com 30min de antecedência. [tenant:${activeTenant}]`,
      status: (i % 15 === 0 ? 'reservado' : 'disponivel') as StatusImovel,
      imagem_url: imagemPrincipal,
      fotos_urls: fotosGaleria,
      proprietario_id: proprietario.id,
      proprietario_nome: proprietario.nome,
      proprietario_telefone: TELEFONE_PROPRIETARIOS_PADRAO,
      proprietario_email: proprietario.email,
      imobiliaria: activeTenant,
      imobiliaria_id: imobiliariaId,
      criado_em: new Date(Date.now() - (60 - i) * 86400000).toISOString(),
    });
  }

  // 3. Gera 50 Clientes / Leads com Preferências Estruturadas & Matching Perfeito
  const etapasCRM: EtapaCRM[] = [
    'novos_leads', 'qualificacao', 'agendamento_visita',
    'proposta_negociacao', 'documentacao_credito', 'fechamento_contrato', 'venda_concluida'
  ];

  const origensLead: OrigemLead[] = ['site', 'instagram', 'whatsapp', 'portal', 'indicacao'];
  const tempoParadaOpcoes = ['Hoje', 'Há 1 dia', 'Há 2 dias', 'Há 4 dias', 'Há 1 semana', 'Há 2 semanas'];

  const clientes: Cliente[] = CLIENTES_VARGINHA.map((nome, idx) => {
    const id = `cli-vg-${String(idx + 1).padStart(3, '0')}`;
    const email = `cliente${idx + 1}@teste.com`;
    const etapa = etapasCRM[idx % etapasCRM.length];
    const origem = origensLead[idx % origensLead.length];
    const prioridade: 'alta' | 'media' | 'baixa' = idx % 3 === 0 ? 'alta' : idx % 3 === 1 ? 'media' : 'baixa';
    const tempoParada = tempoParadaOpcoes[idx % tempoParadaOpcoes.length];

    // Escolhe um imóvel alvo real em Varginha para servir como base de preferência e matching
    const imovelAlvo = imoveis[idx % imoveis.length];

    // Define preferência de tipo e finalidade a partir do imóvel de interesse ou padrões diversificados
    const prefTipo = imovelAlvo.tipo;
    const prefFinalidade: 'venda' | 'locacao' | 'ambos' = imovelAlvo.finalidade;
    const prefQuartos = imovelAlvo.quartos > 0 ? imovelAlvo.quartos : 0;

    // Calcula faixa de orçamento estruturada ao redor do imóvel alvo
    let orcMin = 0;
    let orcMax = 0;
    let faixaTexto = '';

    if (prefFinalidade === 'locacao') {
      const locVal = imovelAlvo.valor_locacao || 2500;
      orcMin = Math.max(1000, Math.round((locVal * 0.8) / 100) * 100);
      orcMax = Math.round((locVal * 1.3) / 100) * 100;
      faixaTexto = `R$ ${orcMin.toLocaleString('pt-BR')} a R$ ${orcMax.toLocaleString('pt-BR')} /mês`;
    } else {
      const vendaVal = imovelAlvo.valor_venda || 600000;
      orcMin = Math.max(150000, Math.round((vendaVal * 0.8) / 10000) * 10000);
      orcMax = Math.round((vendaVal * 1.25) / 10000) * 10000;
      faixaTexto = `R$ ${orcMin.toLocaleString('pt-BR')} a R$ ${orcMax.toLocaleString('pt-BR')}`;
    }

    const tipoNome = prefTipo.charAt(0).toUpperCase() + prefTipo.slice(1);
    const quartosTexto = prefQuartos > 0 ? `com ${prefQuartos}+ quartos` : '';
    const perfilInteresse = `${tipoNome} ${quartosTexto} em ${imovelAlvo.bairro} (${prefFinalidade === 'locacao' ? 'Locação' : 'Compra'})`.trim();

    return {
      id,
      nome,
      telefone: TELEFONE_CLIENTES_PADRAO,
      email,
      tipo_cliente: 'comprador_inquilino',
      orcamento_min: orcMin,
      orcamento_max: orcMax,
      preferencia_tipo: prefTipo,
      preferencia_quartos: prefQuartos,
      preferencia_finalidade: prefFinalidade,
      perfil_interesse: perfilInteresse,
      faixa_orcamento: faixaTexto,
      etapa_crm: etapa,
      imovel_interesse_id: imovelAlvo.id,
      imovel_interesse_titulo: imovelAlvo.titulo,
      imovel_interesse_foto: imovelAlvo.imagem_url,
      corretor_responsavel_nome: adminUserNome,
      corretor_responsavel_id: adminUserId,
      origem_lead: origem,
      status: (etapa === 'venda_concluida' ? 'fechado' : etapa === 'proposta_negociacao' ? 'negociando' : 'ativo') as StatusCliente,
      prioridade,
      tempo_parada_texto: tempoParada,
      observacoes: `Cliente qualificado em Varginha. Procura ${tipoNome.toLowerCase()} na região do ${imovelAlvo.bairro}. Orçamento: ${faixaTexto}. [tenant:${activeTenant}]`,
      imobiliaria: activeTenant,
      imobiliaria_id: imobiliariaId,
      criado_em: new Date(Date.now() - (45 - idx) * 86400000).toISOString(),
    };
  });

  // 4. Gera 47 Visitas com roteiros multi-imóveis (15 dias passado e 15 dias futuro)
  const visitas: Visita[] = [];
  const now = new Date();
  const horarios = [
    { h: 9, m: 0 }, { h: 10, m: 30 }, { h: 14, m: 0 }, { h: 15, m: 30 }, { h: 17, m: 0 }
  ];

  let visitaCount = 1;
  for (let diaOffset = -15; diaOffset <= 15; diaOffset++) {
    const visitasNoDia = diaOffset === 0 ? 3 : (Math.abs(diaOffset) % 2 === 0 ? 2 : 1);

    for (let k = 0; k < visitasNoDia; k++) {
      const id = `vis-vg-${String(visitaCount).padStart(4, '0')}`;
      const codigo = `VIS-${String(visitaCount).padStart(4, '0')}`;
      const slot = horarios[(k * 2 + (diaOffset + 15)) % horarios.length];

      const visitDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diaOffset, slot.h, slot.m, 0);
      const reminderDate = new Date(visitDate.getTime() - 60 * 60 * 1000);
      const posDate = new Date(visitDate.getTime() + 2 * 60 * 60 * 1000);

      let status: StatusVisita = 'agendada';
      if (diaOffset < 0) {
        if (visitaCount % 7 === 0) status = 'cancelada';
        else if (visitaCount % 5 === 0) status = 'nao_compareceu';
        else status = 'concluida';
      } else {
        status = 'agendada';
      }

      const qtdImoveisRoteiro = (visitaCount % 3 === 0) ? 3 : (visitaCount % 2 === 0 ? 2 : 1);
      const imoveisRoteiroIds: string[] = [];
      const baseImoIdx = (visitaCount * 2) % imoveis.length;
      for (let r = 0; r < qtdImoveisRoteiro; r++) {
        imoveisRoteiroIds.push(imoveis[(baseImoIdx + r) % imoveis.length].id);
      }
      const primaryImovel = imoveis[baseImoIdx];
      const cliente = clientes[(visitaCount - 1) % clientes.length];

      visitas.push({
        id,
        codigo,
        imovel_id: primaryImovel.id,
        imoveis_ids: imoveisRoteiroIds,
        cliente_id: cliente.id,
        cliente_nome: cliente.nome,
        cliente_telefone: TELEFONE_CLIENTES_PADRAO,
        corretor_nome: adminUserNome,
        corretor_telefone: '35999999999',
        data_hora_visita: visitDate.toISOString(),
        lembrete_agendado_para: reminderDate.toISOString(),
        pos_visita_agendado_para: posDate.toISOString(),
        status,
        notificar_confirmacao: true,
        notificar_confirmacao_cliente: true,
        notificar_confirmacao_proprietario: true,
        notificar_lembrete: true,
        notificar_lembrete_cliente: true,
        notificar_lembrete_proprietario: true,
        notificar_pos_visita: true,
        notificar_pos_visita_cliente: true,
        notificar_comprovacao_proprietario: true,
        whatsapp_confirmacao_cliente: status === 'concluida' ? 'visualizado' : diaOffset <= 0 ? 'entregue' : 'enviado',
        whatsapp_confirmacao_proprietario: status === 'concluida' ? 'visualizado' : diaOffset <= 0 ? 'entregue' : 'enviado',
        whatsapp_lembrete_cliente: diaOffset < 0 ? 'entregue' : (diaOffset === 0 ? 'enviado' : 'pendente'),
        whatsapp_lembrete_proprietario: diaOffset < 0 ? 'entregue' : (diaOffset === 0 ? 'enviado' : 'pendente'),
        whatsapp_pos_visita_cliente: status === 'concluida' ? 'lido' : 'pendente',
        feedback_cliente: status === 'concluida' ? (visitaCount % 2 === 0 ? 'Adorou o acabamento e a localização em Varginha. Ficou de analisar a proposta no fim de semana.' : 'Gostou bastante do espaço interno e da varanda gourmet.') : undefined,
        observacoes: `${qtdImoveisRoteiro > 1 ? `Roteiro composto por ${qtdImoveisRoteiro} imóveis em Varginha (${primaryImovel.bairro}).` : `Visita ao imóvel ${primaryImovel.titulo}.`} [tenant:${activeTenant}]`,
        imobiliaria: activeTenant,
        imobiliaria_id: imobiliariaId,
        created_by_user_id: adminUserId,
        created_by_user_nome: adminUserNome,
        criado_em: new Date(Date.now() - 20 * 86400000).toISOString(),
      });

      visitaCount++;
    }
  }

  return {
    proprietarios,
    imoveis,
    clientes,
    visitas,
  };
}
