import * as XLSX from 'xlsx';

/**
 * Gera e dispara o download do arquivo modelo de Clientes em formato .xlsx
 */
export function downloadModeloClientesXLSX() {
  const headers = [
    {
      'Nome': 'Carlos Eduardo Silva',
      'Telefone': '(11) 98765-4321',
      'E-mail': 'carlos.silva@exemplo.com',
      'Perfil de Interesse': 'Apartamento 2 ou 3 dorms até R$ 900.000 no Campo Belo ou Brooklin',
      'Faixa de Orçamento': 'R$ 900.000',
      'Observações': 'Cliente com interesse para compra à vista. Prefere visitas no sábado de manhã.',
    },
    {
      'Nome': 'Mariana Souza Dias',
      'Telefone': '(21) 99123-4567',
      'E-mail': 'mariana.dias@exemplo.com',
      'Perfil de Interesse': 'Casa ou Cobertura para locação com 3 dormitórios',
      'Faixa de Orçamento': 'R$ 6.500/mês',
      'Observações': 'Tem 1 cachorro de pequeno porte. Procura imóvel com quintal ou varanda.',
    },
    {
      'Nome': 'Roberto Alencar',
      'Telefone': '(31) 98877-6655',
      'E-mail': 'roberto.alencar@exemplo.com',
      'Perfil de Interesse': 'Sala Comercial ou Terreno',
      'Faixa de Orçamento': 'R$ 1.500.000',
      'Observações': 'Investidor.',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(headers);
  
  // Ajuste de largura das colunas
  worksheet['!cols'] = [
    { wch: 25 }, // Nome
    { wch: 18 }, // Telefone
    { wch: 28 }, // E-mail
    { wch: 45 }, // Perfil de Interesse
    { wch: 20 }, // Faixa de Orçamento
    { wch: 45 }, // Observações
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo Clientes');
  XLSX.writeFile(workbook, 'modelo_importacao_clientes_easymob.xlsx');
}

/**
 * Gera e dispara o download do arquivo modelo de Proprietários em formato .xlsx
 */
export function downloadModeloProprietariosXLSX() {
  const headers = [
    {
      'Nome': 'Patrícia Prado Nogueira',
      'Telefone': '(31) 9881-1897',
      'E-mail': 'patricia.prado@exemplo.com',
      'Documento': '123.456.789-00',
      'Chave PIX': 'patricia.prado@exemplo.com',
      'Banco': 'Itaú Unibanco (Ag 1234 / CC 56789-0)',
      'Observações': 'Proprietária dos imóveis no Brooklin. Horário de contato preferencial à tarde.',
    },
    {
      'Nome': 'Alexandre Vasconcelos',
      'Telefone': '(21) 9881-1626',
      'E-mail': 'alexandre.vasconcelos@exemplo.com',
      'Documento': '987.654.321-11',
      'Chave PIX': '(21) 9881-1626',
      'Banco': 'Banco do Brasil',
      'Observações': 'Proprietário de 2 apartamentos.',
    },
    {
      'Nome': 'Marcelo Antunes Bittencourt',
      'Telefone': '(31) 9881-2168',
      'E-mail': 'marcelo.bittencourt@exemplo.com',
      'Documento': '456.789.123-22',
      'Chave PIX': 'marcelo.bittencourt@exemplo.com',
      'Banco': 'Nubank',
      'Observações': 'Autorização de visita com 2h de antecedência.',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(headers);
  
  worksheet['!cols'] = [
    { wch: 30 }, // Nome
    { wch: 18 }, // Telefone
    { wch: 30 }, // E-mail
    { wch: 18 }, // Documento
    { wch: 28 }, // Chave PIX
    { wch: 25 }, // Banco
    { wch: 45 }, // Observações
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo Proprietários');
  XLSX.writeFile(workbook, 'modelo_importacao_proprietarios_easymob.xlsx');
}

/**
 * Gera e dispara o download do arquivo modelo de Imóveis em formato .xlsx
 */
export function downloadModeloImoveisXLSX() {
  const headers = [
    {
      'Código': 'AP-1028',
      'Título': 'Apartamento 1 Dorms em Campo Belo',
      'Tipo': 'apartamento', // apartamento, casa, cobertura, terreno, comercial
      'Finalidade': 'venda', // venda, locacao, ambos
      'Endereço': 'Avenida das Nações',
      'Número': '520',
      'Complemento': 'Apto 42',
      'Bairro': 'Campo Belo',
      'Cidade': 'São Paulo',
      'Estado': 'SP',
      'CEP': '04578-000',
      'Valor Venda': 1130000,
      'Valor Locação': 0,
      'Valor Condomínio': 850,
      'Valor IPTU': 120,
      'Quartos': 1,
      'Suítes': 0,
      'Banheiros': 1,
      'Vagas': 1,
      'Área Útil': 48,
      'Área Total': 65,
      'Descrição': 'Lindo apartamento totalmente reformado, varanda integrada e condomínio com lazer completo.',
      'URLs das Fotos': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80, https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'Nome do Proprietário': 'Patrícia Prado Nogueira',
      'Telefone do Proprietário': '(31) 9881-1897',
      'Observações Chaves': 'Chaves na portaria com o zelador Sr. Marcos.',
    },
    {
      'Código': 'CA-2040',
      'Título': 'Casa em Condomínio Fechado',
      'Tipo': 'casa',
      'Finalidade': 'ambos',
      'Endereço': 'Rua das Palmeiras',
      'Número': '150',
      'Complemento': 'Casa 08',
      'Bairro': 'Jardins',
      'Cidade': 'São Paulo',
      'Estado': 'SP',
      'CEP': '01420-001',
      'Valor Venda': 2850000,
      'Valor Locação': 12000,
      'Valor Condomínio': 1400,
      'Valor IPTU': 450,
      'Quartos': 4,
      'Suítes': 2,
      'Banheiros': 4,
      'Vagas': 3,
      'Área Útil': 280,
      'Área Total': 400,
      'Descrição': 'Casa ampla e arejada com piscina privativa, espaço gourmet e energia solar instalada.',
      'URLs das Fotos': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
      'Nome do Proprietário': 'Alexandre Vasconcelos',
      'Telefone do Proprietário': '(21) 9881-1626',
      'Observações Chaves': 'Acesso liberado mediante autorização prévia por WhatsApp.',
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(headers);
  
  worksheet['!cols'] = [
    { wch: 12 }, // Código
    { wch: 35 }, // Título
    { wch: 15 }, // Tipo
    { wch: 14 }, // Finalidade
    { wch: 28 }, // Endereço
    { wch: 10 }, // Número
    { wch: 15 }, // Complemento
    { wch: 20 }, // Bairro
    { wch: 18 }, // Cidade
    { wch: 8 },  // Estado
    { wch: 12 }, // CEP
    { wch: 15 }, // Valor Venda
    { wch: 15 }, // Valor Locação
    { wch: 16 }, // Valor Condomínio
    { wch: 14 }, // Valor IPTU
    { wch: 10 }, // Quartos
    { wch: 10 }, // Suítes
    { wch: 10 }, // Banheiros
    { wch: 10 }, // Vagas
    { wch: 12 }, // Área Útil
    { wch: 12 }, // Área Total
    { wch: 40 }, // Descrição
    { wch: 45 }, // URLs das Fotos
    { wch: 28 }, // Nome do Proprietário
    { wch: 20 }, // Telefone do Proprietário
    { wch: 30 }, // Observações Chaves
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo Imóveis');
  XLSX.writeFile(workbook, 'modelo_importacao_imoveis_easymob.xlsx');
}

/**
 * Converte um arquivo Excel ou CSV enviado pelo usuário para um array de objetos JSON
 */
export async function parseExcelOrCsvFile(file: File): Promise<Record<string, any>[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  if (!worksheet) return [];
  
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  return rawRows;
}
