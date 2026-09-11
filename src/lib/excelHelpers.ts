import ExcelJS from 'exceljs';

/**
 * Utilitário interno para salvar e disparar o download de um modelo XLSX no navegador
 */
async function downloadTemplate(
  filename: string,
  sheetName: string,
  headers: Record<string, any>[],
  columnWidths?: number[],
  headerColor = '10B981'
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'EasyMob';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);
  const headerKeys = Object.keys(headers[0]);

  worksheet.columns = headerKeys.map((key, idx) => ({
    header: key,
    key,
    width: columnWidths && columnWidths[idx] ? columnWidths[idx] : 20,
  }));

  headers.forEach((h) => {
    worksheet.addRow(h);
  });

  // Estilização do cabeçalho
  const headerRow = worksheet.getRow(1);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Segoe UI' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: `FF${headerColor}` },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.font = { size: 10, name: 'Segoe UI' };
      row.alignment = { vertical: 'middle' };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Gera e dispara o download do arquivo modelo de Clientes em formato .xlsx
 */
export async function downloadModeloClientesXLSX() {
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

  const columnWidths = [25, 18, 28, 45, 20, 45];
  await downloadTemplate('modelo_importacao_clientes_easymob.xlsx', 'Modelo Clientes', headers, columnWidths, '0284C7');
}

/**
 * Gera e dispara o download do arquivo modelo de Proprietários em formato .xlsx
 */
export async function downloadModeloProprietariosXLSX() {
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

  const columnWidths = [30, 18, 30, 18, 28, 25, 45];
  await downloadTemplate('modelo_importacao_proprietarios_easymob.xlsx', 'Modelo Proprietários', headers, columnWidths, 'D97706');
}

/**
 * Gera e dispara o download do arquivo modelo de Imóveis em formato .xlsx
 */
export async function downloadModeloImoveisXLSX() {
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

  const columnWidths = [
    12, 35, 15, 14, 28, 10, 15, 20, 18, 8, 12, 15, 15, 16, 14, 10, 10, 10, 10, 12, 12, 40, 45, 28, 20, 30
  ];
  await downloadTemplate('modelo_importacao_imoveis_easymob.xlsx', 'Modelo Imóveis', headers, columnWidths, '10B981');
}

/**
 * Converte um arquivo Excel (.xlsx, .xls) ou CSV enviado pelo usuário para um array de objetos JSON
 */
export async function parseExcelOrCsvFile(file: File): Promise<Record<string, any>[]> {
  const fileName = file.name.toLowerCase();

  // Tratamento específico para CSV
  if (fileName.endsWith('.csv')) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    const delimiter = lines[0].includes(';') ? ';' : ',';
    const parseCsvLine = (line: string) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCsvLine(lines[0]);
    const rows: Record<string, any>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const rowData: Record<string, any> = {};
      let hasData = false;
      headers.forEach((header, idx) => {
        const val = values[idx] !== undefined ? values[idx] : '';
        rowData[header] = val;
        if (val !== '') hasData = true;
      });
      if (hasData) rows.push(rowData);
    }
    return rows;
  }

  // Leitura de planilhas Excel (.xlsx) com ExcelJS
  const data = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(data);
  const worksheet = workbook.worksheets[0];

  if (!worksheet) return [];

  const rows: Record<string, any>[] = [];
  const headerRow = worksheet.getRow(1);
  const headers: string[] = [];

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = cell.text ? cell.text.trim() : `Coluna_${colNumber}`;
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Pula a linha do cabeçalho
    const rowData: Record<string, any> = {};
    let hasData = false;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (header) {
        let val: any = cell.value;
        if (val !== null && typeof val === 'object') {
          if ('result' in val) {
            val = val.result;
          } else if ('text' in val) {
            val = val.text;
          } else if ('richText' in val && Array.isArray(val.richText)) {
            val = val.richText.map((t: any) => t.text).join('');
          }
        }
        const strVal = val !== null && val !== undefined ? String(val).trim() : '';
        rowData[header] = strVal;
        if (strVal !== '') hasData = true;
      }
    });

    if (hasData) {
      rows.push(rowData);
    }
  });

  return rows;
}

