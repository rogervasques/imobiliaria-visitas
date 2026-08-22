import { Cliente, Imovel, Proprietario, Visita, TipoImovel, FinalidadeImovel, StatusImovel, StatusCliente, OrigemLead, StatusVisita } from '@/types';

// Lista de 30 Proprietários com dados brasileiros realistas
export const PROPRIETARIOS_DATA = [
  { nome: 'Carlos Eduardo Mendonça', telefone: '11987654321', email: 'carlos.mendonca@email.com' },
  { nome: 'Mariana Albuquerque', telefone: '11991234567', email: 'mariana.albuquerque@email.com' },
  { nome: 'Roberto Silveira Lima', telefone: '11977778888', email: 'roberto.lima@email.com' },
  { nome: 'Camila Brandão Fonseca', telefone: '21984561234', email: 'camila.fonseca@email.com' },
  { nome: 'Henrique Siqueira Dias', telefone: '21973219876', email: 'henrique.dias@email.com' },
  { nome: 'Beatriz Monteiro Castro', telefone: '31998765432', email: 'beatriz.castro@email.com' },
  { nome: 'Rodrigo Peixoto Vianna', telefone: '31987651122', email: 'rodrigo.vianna@email.com' },
  { nome: 'Juliana Vasconcelos Ramos', telefone: '41991112233', email: 'juliana.ramos@email.com' },
  { nome: 'Marcelo Queiroz Guimarães', telefone: '41988883344', email: 'marcelo.guimaraes@email.com' },
  { nome: 'Patrícia Borges Nogueira', telefone: '51992224455', email: 'patricia.nogueira@email.com' },
  { nome: 'Fernando Meirelles Toledo', telefone: '51983335566', email: 'fernando.toledo@email.com' },
  { nome: 'Luciana Prado Magalhães', telefone: '61994446677', email: 'luciana.magalhaes@email.com' },
  { nome: 'Gustavo Amaral Couto', telefone: '61985557788', email: 'gustavo.couto@email.com' },
  { nome: 'Vanessa Paiva Bittencourt', telefone: '71996668899', email: 'vanessa.bittencourt@email.com' },
  { nome: 'Eduardo Cavalcanti Farias', telefone: '71987779900', email: 'eduardo.cavalcanti@email.com' },
  { nome: 'Renata Gouveia Lins', telefone: '81998880011', email: 'renata.lins@email.com' },
  { nome: 'André Dantas Medeiros', telefone: '81989991122', email: 'andre.medeiros@email.com' },
  { nome: 'Larissa Chaves Fontes', telefone: '85991233344', email: 'larissa.fontes@email.com' },
  { nome: 'Tiago Rezende Vasques', telefone: '85982344455', email: 'tiago.vasques@email.com' },
  { nome: 'Aline Saraiva Camargo', telefone: '19993455566', email: 'aline.camargo@email.com' },
  { nome: 'Bruno Pacheco Drummond', telefone: '19984566677', email: 'bruno.drummond@email.com' },
  { nome: 'Cláudia Fagundes Xavier', telefone: '27995677788', email: 'claudia.xavier@email.com' },
  { nome: 'Daniel Gomide Arruda', telefone: '27986788899', email: 'daniel.arruda@email.com' },
  { nome: 'Elisa Marcondes Paes', telefone: '48997899900', email: 'elisa.paes@email.com' },
  { nome: 'Flávio Antunes Aguiar', telefone: '48988900011', email: 'flavio.aguiar@email.com' },
  { nome: 'Gabriela Neves Saldanha', telefone: '62999011122', email: 'gabriela.saldanha@email.com' },
  { nome: 'Leonardo Franco Vilela', telefone: '62980122233', email: 'leonardo.vilela@email.com' },
  { nome: 'Priscila Dutra Alencar', telefone: '91991236677', email: 'priscila.alencar@email.com' },
  { nome: 'Vinícius Sampaio Correa', telefone: '92982347788', email: 'vinicius.correa@email.com' },
  { nome: 'Tatiana Holanda Peixoto', telefone: '11994568899', email: 'tatiana.peixoto@email.com' },
];

// Imagens reais em alta resolução de arquitetura e interiores (Unsplash)
const IMAGES_APARTAMENTOS = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502005229762-ee1b2b93e680?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
];

const IMAGES_CASAS = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
];

const IMAGES_COBERTURAS = [
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80',
];

const IMAGES_COMERCIAIS = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
];

const IMAGES_TERRENOS = [
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
];

// 50 Clientes com preferências realistas
export const CLIENTES_DATA = [
  { nome: 'Lucas Ferraz Souza', telefone: '11998887766', email: 'lucas.ferraz@techcorp.com', perfil: 'Busca apto 3 dormitórios perto do metrô para família', orcamento: 'R$ 1.2M a 1.6M', origem: 'portal', status: 'ativo' },
  { nome: 'Fernanda Vasconcelos', telefone: '11985554433', email: 'fernanda.vasconcelos@advocacia.com', perfil: 'Casa em condomínio com espaço para home office e quintal amplo', orcamento: 'R$ 2.5M a 3.2M', origem: 'indicacao', status: 'ativo' },
  { nome: 'Guilherme Antunes', telefone: '11971112233', email: 'guilherme.antunes@invest.com', perfil: 'Studio ou 1 dormitório para investimento em locação', orcamento: 'R$ 500k a 700k', origem: 'instagram', status: 'ativo' },
  { nome: 'Isabela Fontenelle Rocha', telefone: '11982223344', email: 'isabela.rocha@hospital.com.br', perfil: 'Apartamento de 2 ou 3 dorms em Moema ou Pinheiros', orcamento: 'R$ 800k a 1.1M', origem: 'site', status: 'negociando' },
  { nome: 'Thiago Meireles Prado', telefone: '11993334455', email: 'thiago.prado@fintech.com', perfil: 'Cobertura duplex com vista livre e churrasqueira', orcamento: 'R$ 2.8M a 3.8M', origem: 'whatsapp', status: 'ativo' },
  { nome: 'Mariana Drummond Silveira', telefone: '11984445566', email: 'mariana.drummond@design.com', perfil: 'Apartamento reformado com iluminação natural', orcamento: 'R$ 950k a 1.3M', origem: 'instagram', status: 'ativo' },
  { nome: 'Felipe Albuquerque Castro', telefone: '21985556677', email: 'felipe.albuquerque@energia.com', perfil: 'Apartamento 3 quartos no Leblon ou Ipanema', orcamento: 'R$ 2.2M a 3.0M', origem: 'portal', status: 'negociando' },
  { nome: 'Juliana Paes Marcondes', telefone: '21976667788', email: 'juliana.marcondes@globo.com', perfil: 'Casa contemporânea com piscina e segurança 24h', orcamento: 'R$ 3.5M a 4.5M', origem: 'indicacao', status: 'ativo' },
  { nome: 'Renato Siqueira Gomide', telefone: '31997778899', email: 'renato.gomide@mineracao.com.br', perfil: 'Apartamento 4 suítes na Savassi ou Lourdes', orcamento: 'R$ 1.8M a 2.4M', origem: 'site', status: 'ativo' },
  { nome: 'Camila Nogueira Borges', telefone: '31988889900', email: 'camila.borges@medicina.ufmg.br', perfil: 'Apartamento 2 quartos com varanda gourmet', orcamento: 'R$ 650k a 850k', origem: 'whatsapp', status: 'ativo' },
  { nome: 'Bruno Toledo Meirelles', telefone: '41999990011', email: 'bruno.meirelles@logistica.com', perfil: 'Apartamento no Batel ou Ecoville com 3 vagas', orcamento: 'R$ 1.4M a 1.9M', origem: 'portal', status: 'negociando' },
  { nome: 'Natália Amaral Coutinho', telefone: '41981110022', email: 'natalia.coutinho@arquitetura.com', perfil: 'Terreno em condomínio fechado para construir', orcamento: 'R$ 450k a 600k', origem: 'site', status: 'ativo' },
  { nome: 'Diego Cavalcanti Farias', telefone: '51992221133', email: 'diego.cavalcanti@agro.com.br', perfil: 'Apartamento no Moinhos de Vento alto padrão', orcamento: 'R$ 1.5M a 2.2M', origem: 'indicacao', status: 'ativo' },
  { nome: 'Amanda Lins Medeiros', telefone: '51983332244', email: 'amanda.medeiros@psicologia.com', perfil: 'Apartamento garden ou casa de vila aconchegante', orcamento: 'R$ 750k a 950k', origem: 'instagram', status: 'ativo' },
  { nome: 'Rodrigo Fontes Rezende', telefone: '61994443355', email: 'rodrigo.rezende@ministerio.gov.br', perfil: 'Apartamento na Asa Sul ou Asa Norte 3 quartos', orcamento: 'R$ 1.3M a 1.7M', origem: 'portal', status: 'ativo' },
  { nome: 'Beatriz Saraiva Camargo', telefone: '61985554466', email: 'beatriz.camargo@senado.leg.br', perfil: 'Casa no Lago Sul com área de lazer completa', orcamento: 'R$ 3.8M a 5.0M', origem: 'whatsapp', status: 'negociando' },
  { nome: 'Gabriel Dantas Pacheco', telefone: '71996665577', email: 'gabriel.pacheco@advocacia.ba', perfil: 'Apartamento vista mar na Vitória ou Barra', orcamento: 'R$ 1.6M a 2.3M', origem: 'portal', status: 'ativo' },
  { nome: 'Carolina Fagundes Arruda', telefone: '71987776688', email: 'carolina.arruda@hospital.ba', perfil: 'Casa em condomínio em Busca Vida ou Vilas do Atlântico', orcamento: 'R$ 1.8M a 2.5M', origem: 'indicacao', status: 'ativo' },
  { nome: 'Mateus Marcondes Paes', telefone: '81998887799', email: 'mateus.paes@porto.digital.br', perfil: 'Flat ou studio em Boa Viagem para investimento', orcamento: 'R$ 380k a 550k', origem: 'instagram', status: 'fechado' },
  { nome: 'Vanessa Antunes Aguiar', telefone: '81989998800', email: 'vanessa.aguiar@consultoria.com', perfil: 'Apartamento 4 quartos em Boa Viagem beira-mar', orcamento: 'R$ 2.4M a 3.2M', origem: 'site', status: 'ativo' },
  { nome: 'Leandro Neves Saldanha', telefone: '85991119911', email: 'leandro.saldanha@comex.ce', perfil: 'Apartamento Meireles ou Aldeota com varanda', orcamento: 'R$ 900k a 1.4M', origem: 'portal', status: 'ativo' },
  { nome: 'Priscila Franco Vilela', telefone: '85982220022', email: 'priscila.vilela@moda.com.br', perfil: 'Casa duplex em condomínio no Eusébio', orcamento: 'R$ 1.1M a 1.6M', origem: 'whatsapp', status: 'negociando' },
  { nome: 'Alexandre Dutra Alencar', telefone: '19993331133', email: 'alexandre.alencar@techcampinas.com', perfil: 'Casa em condomínio em Paulínia ou Barão Geraldo', orcamento: 'R$ 1.3M a 1.8M', origem: 'indicacao', status: 'ativo' },
  { nome: 'Clara Sampaio Correa', telefone: '19984442244', email: 'clara.correa@biotech.com', perfil: 'Apartamento Cambuí 3 suítes', orcamento: 'R$ 1.5M a 2.0M', origem: 'site', status: 'ativo' },
  { nome: 'Eduardo Holanda Peixoto', telefone: '27995553355', email: 'eduardo.peixoto@vitoria.ind.br', perfil: 'Apartamento Praia do Canto 4 quartos', orcamento: 'R$ 1.7M a 2.5M', origem: 'portal', status: 'ativo' },
  { nome: 'Tatiane Ribeiro Brandão', telefone: '27986664466', email: 'tatiane.brandao@clinica.com', perfil: 'Cobertura em Itapuã / Praia da Costa', orcamento: 'R$ 2.1M a 2.9M', origem: 'instagram', status: 'negociando' },
  { nome: 'Vinícius Dias Monteiro', telefone: '48997775577', email: 'vinicius.monteiro@floripa.tech', perfil: 'Casa em Jurerê Internacional ou Cacupé', orcamento: 'R$ 3.5M a 4.8M', origem: 'portal', status: 'ativo' },
  { nome: 'Helena Vianna Ramos', telefone: '48988886688', email: 'helena.ramos@arquitetura.sc', perfil: 'Apartamento na Beira-Mar Norte com vista mar', orcamento: 'R$ 2.0M a 2.8M', origem: 'indicacao', status: 'ativo' },
  { nome: 'Arthur Queiroz Guimarães', telefone: '62999997799', email: 'arthur.guimaraes@agronegocio.go', perfil: 'Apartamento Bueno ou Marista com varanda gourmet', orcamento: 'R$ 1.2M a 1.7M', origem: 'whatsapp', status: 'ativo' },
  { nome: 'Lívia Borges Toledo', telefone: '62981118800', email: 'livia.toledo@clinica.go', perfil: 'Casa em condomínio fechado Alphaville Flamboyant', orcamento: 'R$ 2.6M a 3.6M', origem: 'site', status: 'negociando' },
  { nome: 'Marcelo Prado Amaral', telefone: '91992229911', email: 'marcelo.amaral@belem.com', perfil: 'Apartamento Umarizal alto padrão', orcamento: 'R$ 1.4M a 2.0M', origem: 'portal', status: 'ativo' },
  { nome: 'Jéssica Couto Bittencourt', telefone: '92983330022', email: 'jessica.bittencourt@manaus.ind', perfil: 'Apartamento Ponta Negra com vista para o Rio Negro', orcamento: 'R$ 1.1M a 1.6M', origem: 'indicacao', status: 'ativo' },
  { nome: 'Danilo Farias Lins', telefone: '11994441133', email: 'danilo.lins@banco.com.br', perfil: 'Apartamento Brooklin ou Vila Olímpia perto de escritórios', orcamento: 'R$ 900k a 1.3M', origem: 'site', status: 'ativo' },
  { nome: 'Sabrina Medeiros Fontes', telefone: '11985552244', email: 'sabrina.fontes@startup.com', perfil: 'Studio em Perdizes ou Higienópolis para morar sozinha', orcamento: 'R$ 480k a 620k', origem: 'instagram', status: 'ativo' },
  { nome: 'Caio Rezende Saraiva', telefone: '11976663355', email: 'caio.saraiva@consulting.com', perfil: 'Apartamento 3 dormitórios em Santana / Zona Norte', orcamento: 'R$ 750k a 980k', origem: 'portal', status: 'ativo' },
  { nome: 'Monique Camargo Pacheco', telefone: '11987774466', email: 'monique.pacheco@marketing.com', perfil: 'Casa charmosa na Granja Viana ou Cotia', orcamento: 'R$ 1.6M a 2.2M', origem: 'indicacao', status: 'negociando' },
  { nome: 'Otávio Drummond Xavier', telefone: '21998885577', email: 'otavio.xavier@cinema.art.br', perfil: 'Apartamento Botafogo ou Flamengo com vista Cristo/Pão de Açúcar', orcamento: 'R$ 1.1M a 1.5M', origem: 'portal', status: 'ativo' },
  { nome: 'Bárbara Arruda Marcondes', telefone: '21989996688', email: 'barbara.marcondes@juridico.rj', perfil: 'Apartamento Barra da Tijuca na Península', orcamento: 'R$ 1.8M a 2.6M', origem: 'whatsapp', status: 'ativo' },
  { nome: 'Igor Paes Antunes', telefone: '31991117799', email: 'igor.antunes@engenhariabh.com', perfil: 'Apartamento Vila da Serra 3 suítes', orcamento: 'R$ 1.3M a 1.8M', origem: 'site', status: 'ativo' },
  { nome: 'Carla Aguiar Neves', telefone: '31982228800', email: 'carla.neves@educacao.mg.gov.br', perfil: 'Apartamento Santo Agostinho ou Gutierrez', orcamento: 'R$ 850k a 1.1M', origem: 'portal', status: 'fechado' },
  { nome: 'Samuel Saldanha Franco', telefone: '41993339911', email: 'samuel.franco@curitiba.ind', perfil: 'Sobrado moderno no Cabral ou Juvevê', orcamento: 'R$ 890k a 1.2M', origem: 'instagram', status: 'ativo' },
  { nome: 'Débora Vilela Dutra', telefone: '41984440022', email: 'debora.dutra@comunicacao.pr', perfil: 'Apartamento no Centro Cívico para locação', orcamento: 'R$ 2.500 a 3.800/mês', origem: 'portal', status: 'ativo' },
  { nome: 'Vitor Alencar Sampaio', telefone: '51995551133', email: 'vitor.sampaio@ufrgs.br', perfil: 'Apartamento Petrópolis ou Menino Deus 2 quartos', orcamento: 'R$ 580k a 780k', origem: 'site', status: 'ativo' },
  { nome: 'Julio Cesar Peixoto', telefone: '51986662244', email: 'julio.peixoto@poa.com.br', perfil: 'Casa em condomínio Zona Sul de Porto Alegre', orcamento: 'R$ 1.4M a 1.9M', origem: 'indicacao', status: 'negociando' },
  { nome: 'Lorena Brandão Dias', telefone: '61997773355', email: 'lorena.dias@diplomacia.gov.br', perfil: 'Casa no Lago Norte com pier ou vista lago', orcamento: 'R$ 2.8M a 4.0M', origem: 'portal', status: 'ativo' },
  { nome: 'Raquel Monteiro Vianna', telefone: '71988884466', email: 'raquel.vianna@bahia.tur.br', perfil: 'Village em Guarajuba ou Praia do Forte', orcamento: 'R$ 850k a 1.3M', origem: 'whatsapp', status: 'ativo' },
  { nome: 'Mauro Ramos Queiroz', telefone: '81999995577', email: 'mauro.queiroz@recife.com.br', perfil: 'Apartamento Jaqueira ou Casa Forte tradicional', orcamento: 'R$ 1.2M a 1.7M', origem: 'portal', status: 'ativo' },
  { nome: 'Érica Guimarães Borges', telefone: '85981116688', email: 'erica.borges@fortaleza.ce', perfil: 'Apartamento Beira Mar Fortaleza vista panorâmica', orcamento: 'R$ 1.9M a 2.7M', origem: 'site', status: 'ativo' },
  { nome: 'Pedro Henrique Toledo', telefone: '19992227799', email: 'pedro.toledo@unicamp.br', perfil: 'Apartamento Taquaral próximo ao parque', orcamento: 'R$ 700k a 950k', origem: 'portal', status: 'ativo' },
  { nome: 'Sofia Amaral Couto', telefone: '11983338800', email: 'sofia.couto@investimentos.sp', perfil: 'Apartamento Itaim Bibi com lazer completo e concierge', orcamento: 'R$ 2.4M a 3.4M', origem: 'indicacao', status: 'ativo' },
];

export interface GeneratedSeedData {
  proprietarios: Proprietario[];
  imoveis: Imovel[];
  clientes: Cliente[];
  visitas: Visita[];
}

/**
 * Gera a base completa de 30 proprietários, 80 imóveis, 50 clientes e ~38 visitas operacionais
 */
export function generateTestSeedData(adminUserId: string = 'user-admin-master', adminUserNome: string = 'Roger Vasques Berchembrock'): GeneratedSeedData {
  const now = new Date();

  // 1. Gera 30 Proprietários
  const proprietarios: Proprietario[] = PROPRIETARIOS_DATA.map((p, idx) => ({
    id: `prop-${String(idx + 1).padStart(3, '0')}`,
    nome: p.nome,
    telefone: p.telefone,
    email: p.email,
    criado_em: new Date(now.getTime() - (30 - idx) * 86400000).toISOString(),
    atualizado_em: new Date().toISOString(),
  }));

  // 2. Gera 80 Imóveis variados distribuídos entre os 30 proprietários
  const bairrosSP = [
    { bairro: 'Moema Pássaros', cidade: 'São Paulo', estado: 'SP', cep: '04524-001' },
    { bairro: 'Pinheiros', cidade: 'São Paulo', estado: 'SP', cep: '05422-001' },
    { bairro: 'Jardins', cidade: 'São Paulo', estado: 'SP', cep: '01420-002' },
    { bairro: 'Itaim Bibi', cidade: 'São Paulo', estado: 'SP', cep: '04531-000' },
    { bairro: 'Vila Mariana', cidade: 'São Paulo', estado: 'SP', cep: '04012-010' },
    { bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP', cep: '01310-200' },
    { bairro: 'Perdizes', cidade: 'São Paulo', estado: 'SP', cep: '05015-000' },
    { bairro: 'Granja Viana', cidade: 'Cotia', estado: 'SP', cep: '06700-000' },
    { bairro: 'Alphaville', cidade: 'Barueri', estado: 'SP', cep: '06454-000' },
    { bairro: 'Cambuí', cidade: 'Campinas', estado: 'SP', cep: '13025-000' },
    { bairro: 'Leblon', cidade: 'Rio de Janeiro', estado: 'RJ', cep: '22430-040' },
    { bairro: 'Ipanema', cidade: 'Rio de Janeiro', estado: 'RJ', cep: '22410-002' },
    { bairro: 'Barra da Tijuca', cidade: 'Rio de Janeiro', estado: 'RJ', cep: '22631-000' },
    { bairro: 'Savassi', cidade: 'Belo Horizonte', estado: 'MG', cep: '30140-060' },
    { bairro: 'Lourdes', cidade: 'Belo Horizonte', estado: 'MG', cep: '30170-010' },
    { bairro: 'Batel', cidade: 'Curitiba', estado: 'PR', cep: '80420-010' },
    { bairro: 'Ecoville', cidade: 'Curitiba', estado: 'PR', cep: '81200-100' },
    { bairro: 'Moinhos de Vento', cidade: 'Porto Alegre', estado: 'RS', cep: '90570-020' },
    { bairro: 'Asa Sul', cidade: 'Brasília', estado: 'DF', cep: '70390-010' },
    { bairro: 'Meireles', cidade: 'Fortaleza', estado: 'CE', cep: '60165-081' },
  ];

  const logradouros = [
    'Avenida Paulista', 'Rua dos Pinheiros', 'Alameda dos Arapanés', 'Rua Oscar Freire',
    'Rua Bela Cintra', 'Avenida Brigadeiro Faria Lima', 'Rua Haddock Lobo', 'Alameda Santos',
    'Rua Harmonia', 'Avenida Horácio Lafer', 'Rua Curitiba', 'Avenida Vieira Souto',
    'Avenida Delfim Moreira', 'Avenida Atlântica', 'Rua Visconde de Pirajá', 'Avenida das Américas',
    'Rua da Bahia', 'Avenida Afonso Pena', 'Avenida Sete de Setembro', 'Avenida Batel',
    'Rua Padre Chagas', 'SQS 308', 'Avenida Beira Mar', 'Alameda Rio Negro',
  ];

  const imoveis: Imovel[] = [];

  for (let i = 1; i <= 80; i++) {
    const prop = proprietarios[(i - 1) % proprietarios.length];
    const loc = bairrosSP[(i - 1) % bairrosSP.length];
    const street = logradouros[(i - 1) % logradouros.length];
    const num = String(100 + ((i * 37) % 2500));

    let tipo: TipoImovel = 'apartamento';
    let codigoPrefix = 'AP';
    let titulo = '';
    let finalidade: FinalidadeImovel = 'venda';
    let valorVenda: number | null = null;
    let valorLocacao: number | null = null;
    let quartos = 2;
    let suites = 1;
    let banheiros = 2;
    let vagas = 1;
    let areaUtil = 75;
    let imagemUrl = IMAGES_APARTAMENTOS[i % IMAGES_APARTAMENTOS.length];

    if (i <= 40) {
      // 40 Apartamentos
      tipo = 'apartamento';
      codigoPrefix = 'AP';
      quartos = 1 + (i % 4);
      suites = Math.max(0, quartos - 1);
      banheiros = suites + 1;
      vagas = Math.min(3, Math.max(1, Math.floor(quartos / 1.5)));
      areaUtil = 40 + quartos * 30 + (i % 15);
      finalidade = i % 4 === 0 ? 'ambos' : i % 3 === 0 ? 'locacao' : 'venda';
      valorVenda = finalidade !== 'locacao' ? 450000 + quartos * 280000 + (i % 10) * 45000 : null;
      valorLocacao = finalidade !== 'venda' ? 2400 + quartos * 1100 + (i % 5) * 200 : null;
      titulo = quartos === 1
        ? `Studio Moderno e Mobiliado em ${loc.bairro}`
        : `Apartamento ${quartos} Dormitórios com Varanda em ${loc.bairro}`;
      imagemUrl = IMAGES_APARTAMENTOS[i % IMAGES_APARTAMENTOS.length];
    } else if (i <= 60) {
      // 20 Casas em Condomínio / Vilas
      tipo = 'casa';
      codigoPrefix = 'CS';
      quartos = 3 + (i % 3);
      suites = quartos - 1;
      banheiros = quartos + 1;
      vagas = 2 + (i % 3);
      areaUtil = 180 + (i % 20) * 15;
      finalidade = i % 5 === 0 ? 'locacao' : 'venda';
      valorVenda = finalidade !== 'locacao' ? 1400000 + (i % 20) * 90000 : null;
      valorLocacao = finalidade !== 'venda' ? 7500 + (i % 10) * 600 : null;
      titulo = `Casa Contemporânea com Espaço Gourmet e Piscina em ${loc.bairro}`;
      imagemUrl = IMAGES_CASAS[i % IMAGES_CASAS.length];
    } else if (i <= 70) {
      // 10 Coberturas
      tipo = 'cobertura';
      codigoPrefix = 'CB';
      quartos = 3 + (i % 3);
      suites = quartos;
      banheiros = quartos + 2;
      vagas = 3 + (i % 2);
      areaUtil = 240 + (i % 10) * 35;
      finalidade = 'venda';
      valorVenda = 2600000 + (i % 10) * 240000;
      valorLocacao = null;
      titulo = `Cobertura Duplex Alto Padrão com Vista Panorâmica em ${loc.bairro}`;
      imagemUrl = IMAGES_COBERTURAS[i % IMAGES_COBERTURAS.length];
    } else if (i <= 75) {
      // 5 Terrenos
      tipo = 'terreno';
      codigoPrefix = 'TR';
      quartos = 0;
      suites = 0;
      banheiros = 0;
      vagas = 0;
      areaUtil = 360 + (i % 5) * 120;
      finalidade = 'venda';
      valorVenda = 450000 + (i % 5) * 150000;
      valorLocacao = null;
      titulo = `Terreno Plano em Condomínio Fechado com Lazer em ${loc.bairro}`;
      imagemUrl = IMAGES_TERRENOS[i % IMAGES_TERRENOS.length];
    } else {
      // 5 Comerciais
      tipo = 'comercial';
      codigoPrefix = 'CM';
      quartos = 0;
      suites = 0;
      banheiros = 2;
      vagas = 2 + (i % 3);
      areaUtil = 65 + (i % 5) * 40;
      finalidade = i % 2 === 0 ? 'locacao' : 'venda';
      valorVenda = finalidade === 'venda' ? 780000 + (i % 5) * 90000 : null;
      valorLocacao = finalidade === 'locacao' ? 4200 + (i % 5) * 800 : null;
      titulo = `Conjunto Comercial Pronto para Escritório / Consultório em ${loc.bairro}`;
      imagemUrl = IMAGES_COMERCIAIS[i % IMAGES_COMERCIAIS.length];
    }

    imoveis.push({
      id: `imo-${String(i).padStart(3, '0')}`,
      codigo: `${codigoPrefix}-${String(1000 + i)}`,
      titulo,
      tipo,
      finalidade,
      endereco: street,
      numero: num,
      complemento: tipo === 'apartamento' ? `Apto ${10 + (i % 18) * 10 + (i % 4)}` : tipo === 'cobertura' ? `Cobertura ${200 + i}` : undefined,
      bairro: loc.bairro,
      cidade: loc.cidade,
      estado: loc.estado,
      cep: loc.cep,
      valor_venda: valorVenda,
      valor_locacao: valorLocacao,
      valor_condominio: tipo !== 'terreno' ? 450 + (i % 15) * 80 : null,
      valor_iptu: 150 + (i % 12) * 45,
      quartos,
      suites,
      banheiros,
      vagas,
      area_util: areaUtil,
      proprietario_id: prop.id,
      proprietario_nome: prop.nome,
      proprietario_telefone: prop.telefone,
      proprietario_email: prop.email,
      observacoes_chaves: i % 2 === 0 ? 'Chaves na portaria com o zelador' : 'Proprietário reside no imóvel, confirmar 30min antes',
      status: 'disponivel',
      imagem_url: imagemUrl,
      criado_em: new Date(now.getTime() - (60 - (i % 50)) * 86400000).toISOString(),
      atualizado_em: new Date().toISOString(),
    });
  }

  // 3. Gera 50 Clientes com preferências completas
  const clientes: Cliente[] = CLIENTES_DATA.map((c, idx) => ({
    id: `cli-${String(idx + 1).padStart(3, '0')}`,
    nome: c.nome,
    telefone: c.telefone,
    email: c.email,
    perfil_interesse: c.perfil,
    faixa_orcamento: c.orcamento,
    origem_lead: c.origem as OrigemLead,
    status: c.status as StatusCliente,
    observacoes: `Lead qualificado via ${c.origem}. Preferência de contato por WhatsApp.`,
    criado_em: new Date(now.getTime() - (45 - idx) * 86400000).toISOString(),
    atualizado_em: new Date().toISOString(),
  }));

  // 4. Gera 38 Visitas espalhadas pelos próximos 30 dias a partir de hoje
  // Horários comerciais: 09:00, 10:30, 14:00, 15:30, 17:00
  const slotsHorarios = [
    { h: 9, m: 0 },
    { h: 10, m: 30 },
    { h: 14, m: 0 },
    { h: 15, m: 30 },
    { h: 17, m: 0 },
  ];

  const visitas: Visita[] = [];

  // Distribuição de dias:
  // Visitas 1-4: HOJE (horários diversos)
  // Visitas 5-8: AMANHÃ
  // Visitas 9-38: Distribuídas ao longo dos próximos 2 a 30 dias
  for (let v = 1; v <= 38; v++) {
    let dayOffset = 0;
    if (v <= 4) {
      dayOffset = 0; // Hoje
    } else if (v <= 8) {
      dayOffset = 1; // Amanhã
    } else {
      dayOffset = 2 + Math.floor(((v - 9) * 28) / 30);
    }

    const slot = slotsHorarios[(v - 1) % slotsHorarios.length];
    const visitDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, slot.h, slot.m, 0);

    const client = clientes[(v - 1) % clientes.length];
    
    // Define se terá roteiro de múltiplos imóveis (18 visitas terão 2 ou 3 imóveis)
    const isMultiRoteiro = v <= 18 || v % 2 === 0;
    const qtdImoveis = isMultiRoteiro ? (v % 3 === 0 ? 3 : 2) : 1;

    const selectedImoveis: Imovel[] = [];
    const baseIdx = (v * 3) % imoveis.length;
    for (let k = 0; k < qtdImoveis; k++) {
      const im = imoveis[(baseIdx + k) % imoveis.length];
      if (im && !selectedImoveis.some((existing) => existing.id === im.id)) {
        selectedImoveis.push(im);
      }
    }
    if (selectedImoveis.length === 0) {
      selectedImoveis.push(imoveis[0]);
    }

    const primaryImovel = selectedImoveis[0];
    const imoveisIds = selectedImoveis.map((im) => im.id);

    const reminderDate = new Date(visitDate.getTime() - 60 * 60 * 1000);
    const posVisitaDate = new Date(visitDate.getTime() + 120 * 60 * 1000);

    let status: StatusVisita = 'agendada';
    if (dayOffset === 0) {
      status = v === 1 ? 'confirmada' : v === 2 ? 'confirmada' : 'agendada';
    } else if (v % 7 === 0) {
      status = 'cancelada';
    } else if (v % 5 === 0) {
      status = 'confirmada';
    } else {
      status = 'agendada';
    }

    visitas.push({
      id: `vis-${String(v).padStart(3, '0')}`,
      imovel_id: primaryImovel.id,
      imoveis_ids: imoveisIds,
      cliente_id: client.id,
      corretor_nome: adminUserNome,
      corretor_telefone: '11999999999',
      data_hora_visita: visitDate.toISOString(),
      lembrete_agendado_para: reminderDate.toISOString(),
      pos_visita_agendado_para: posVisitaDate.toISOString(),
      created_by_user_id: adminUserId,
      created_by_user_nome: adminUserNome,
      notificar_confirmacao: true,
      notificar_lembrete: true,
      notificar_pos_visita: true,
      status,
      whatsapp_confirmacao_cliente: status === 'confirmada' ? 'visualizado' : 'enviado',
      whatsapp_confirmacao_proprietario: status === 'confirmada' ? 'entregue' : 'enviado',
      whatsapp_lembrete_cliente: dayOffset === 0 ? 'enviado' : 'pendente',
      whatsapp_lembrete_proprietario: dayOffset === 0 ? 'enviado' : 'pendente',
      whatsapp_pos_visita_cliente: 'pendente',
      observacoes: qtdImoveis > 1
        ? `Roteiro composto por ${qtdImoveis} imóveis na mesma região. Cliente pontual.`
        : `Visita individual agendada pelo portal. Levar pasta de apresentação.`,
      criado_em: new Date(now.getTime() - (10 - (v % 10)) * 86400000).toISOString(),
      atualizado_em: new Date().toISOString(),
      imovel: primaryImovel,
      imoveis: selectedImoveis,
      cliente: client,
    });
  }

  // Ordenação automática em ordem alfabética
  const sortedProprietarios = [...proprietarios].sort((a, b) =>
    (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' })
  );
  const sortedImoveis = [...imoveis].sort((a, b) =>
    (a.titulo || '').localeCompare(b.titulo || '', 'pt-BR', { sensitivity: 'base' })
  );
  const sortedClientes = [...clientes].sort((a, b) =>
    (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' })
  );

  return {
    proprietarios: sortedProprietarios,
    imoveis: sortedImoveis,
    clientes: sortedClientes,
    visitas,
  };
}
