import * as XLSX from 'xlsx';
import { Imovel, Cliente, Proprietario, Visita } from '@/types';
import { formatCurrency, formatDateTime, formatPhone } from './utils';

/**
 * Utilitário para ajustar a largura automática das colunas em uma planilha XLSX
 */
function autoFitColumns(rows: Record<string, any>[]): { wch: number }[] {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  return keys.map((key) => {
    let maxLen = key.length;
    for (const row of rows) {
      const val = row[key];
      if (val !== undefined && val !== null) {
        const strVal = String(val);
        if (strVal.length > maxLen) {
          maxLen = strVal.length;
        }
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
  });
}

/**
 * 1. Exporta a lista de Imóveis para XLSX
 */
export function exportarImoveisExcel(imoveis: Imovel[], filename = 'imoveis_easymob.xlsx') {
  const dados = imoveis.map((im) => {
    const fotos = im.fotos_urls && im.fotos_urls.length > 0 ? im.fotos_urls : im.imagem_url ? [im.imagem_url] : [];

    return {
      'Código': im.codigo || '—',
      'Título': im.titulo,
      'Tipo': im.tipo ? im.tipo.toUpperCase() : '—',
      'Finalidade': im.finalidade ? im.finalidade.toUpperCase() : '—',
      'Status': im.status ? im.status.toUpperCase() : 'DISPONÍVEL',
      'Valor Venda': im.valor_venda ? formatCurrency(im.valor_venda) : '—',
      'Valor Locação': im.valor_locacao ? `${formatCurrency(im.valor_locacao)}/mês` : '—',
      'Condomínio': im.valor_condominio ? formatCurrency(im.valor_condominio) : '—',
      'IPTU': im.valor_iptu ? formatCurrency(im.valor_iptu) : '—',
      'Endereço': im.endereco,
      'Número': im.numero || 'S/N',
      'Complemento': im.complemento || '',
      'Bairro': im.bairro,
      'Cidade': im.cidade,
      'Estado': im.estado,
      'CEP': im.cep || '',
      'Quartos': im.quartos,
      'Suítes': im.suites ?? 0,
      'Banheiros': im.banheiros,
      'Vagas': im.vagas,
      'Área Construída/Útil (m²)': im.area_construida || im.area_util || '—',
      'Área Terreno (m²)': im.area_terreno || '—',
      'Aceita Pet': im.aceita_pet ? 'Sim' : 'Não',
      'Nome do Proprietário': im.proprietario_nome || '—',
      'Telefone do Proprietário': im.proprietario_telefone ? formatPhone(im.proprietario_telefone) : '—',
      'E-mail do Proprietário': im.proprietario_email || '—',
      'Qtd Fotos': fotos.length,
      'Observações Chaves': im.observacoes_chaves || '',
      'Data de Cadastro': im.criado_em ? formatDateTime(im.criado_em) : '—',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dados);
  worksheet['!cols'] = autoFitColumns(dados);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Imóveis');
  XLSX.writeFile(workbook, filename);
}

/**
 * 2. Exporta a lista de Clientes para XLSX
 */
export function exportarClientesExcel(clientes: Cliente[], filename = 'clientes_easymob.xlsx') {
  const dados = clientes.map((c) => ({
    'Nome Completo': c.nome,
    'Telefone / WhatsApp': formatPhone(c.telefone),
    'E-mail': c.email || '—',
    'Faixa de Orçamento': c.faixa_orcamento || '—',
    'Perfil / Bairros de Interesse': c.perfil_interesse || '—',
    'Origem do Lead': c.origem_lead ? c.origem_lead.toUpperCase() : 'SITE',
    'Status': c.status ? c.status.toUpperCase() : 'ATIVO',
    'Observações': c.observacoes || '',
    'Data de Cadastro': c.criado_em ? formatDateTime(c.criado_em) : '—',
  }));

  const worksheet = XLSX.utils.json_to_sheet(dados);
  worksheet['!cols'] = autoFitColumns(dados);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
  XLSX.writeFile(workbook, filename);
}

/**
 * 3. Exporta a lista de Proprietários para XLSX
 */
export function exportarProprietariosExcel(
  proprietarios: Proprietario[],
  imoveis: Imovel[] = [],
  filename = 'proprietarios_easymob.xlsx'
) {
  const dados = proprietarios.map((p) => {
    const imoveisDoProp = imoveis.filter(
      (im) => im.proprietario_id === p.id || im.proprietario_telefone === p.telefone
    );
    const titulosImoveis = imoveisDoProp.map((im) => `[${im.codigo || 'S/C'}] ${im.titulo}`).join('; ');

    return {
      'Nome': p.nome,
      'Telefone / WhatsApp': formatPhone(p.telefone),
      'E-mail': p.email || '—',
      'CPF / CNPJ': p.documento || '—',
      'Chave PIX': p.chave_pix || '—',
      'Banco': p.banco_nome || '—',
      'Qtd de Imóveis': imoveisDoProp.length || p.imoveis_count || 0,
      'Imóveis Cadastrados': titulosImoveis || 'Nenhum imóvel vinculado',
      'Observações': p.observacoes || '',
      'Data de Cadastro': p.criado_em ? formatDateTime(p.criado_em) : '—',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dados);
  worksheet['!cols'] = autoFitColumns(dados);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Proprietários');
  XLSX.writeFile(workbook, filename);
}

/**
 * 4. Exporta a lista de Visitas para XLSX
 */
export function exportarVisitasExcel(visitas: Visita[], filename = 'visitas_agenda_easymob.xlsx') {
  const dados = visitas.map((v) => {
    const imoveis = v.imoveis && v.imoveis.length > 0 ? v.imoveis : v.imovel ? [v.imovel] : [];
    const titulos = imoveis.map((im) => `[${im.codigo || 'S/C'}] ${im.titulo}`).join(' | ');
    const enderecos = imoveis.map((im) => `${im.endereco}, ${im.numero || 'S/N'} - ${im.bairro}`).join(' | ');

    return {
      'Data e Hora': formatDateTime(v.data_hora_visita),
      'Status da Visita': v.status ? v.status.toUpperCase() : 'AGENDADA',
      'Cliente': v.cliente?.nome || '—',
      'Telefone Cliente': v.cliente?.telefone ? formatPhone(v.cliente.telefone) : '—',
      'Corretor Responsável': v.corretor_nome || v.created_by_user_nome || '—',
      'Qtd Imóveis no Roteiro': imoveis.length,
      'Imóvel(is)': titulos || '—',
      'Endereço(s)': enderecos || '—',
      'WhatsApp Confirmação': v.whatsapp_confirmacao_cliente || 'pendente',
      'WhatsApp Lembrete 1h': v.whatsapp_lembrete_cliente || 'pendente',
      'WhatsApp Pós-Visita': v.whatsapp_pos_visita_cliente || 'pendente',
      'Log Gravado (Dossiê)': v.gravar_logs !== false ? 'Sim' : 'Não',
      'Observações': v.observacoes || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dados);
  worksheet['!cols'] = autoFitColumns(dados);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitas');
  XLSX.writeFile(workbook, filename);
}

/**
 * 5. Exporta Relatório Analítico Consolidado (com múltiplas abas)
 */
export function exportarRelatorioAnaliticoExcel({
  periodoLabel,
  resumo,
  desempenhoCorretores,
  atividadeImoveis,
  filename = 'relatorio_gerencial_easymob.xlsx',
}: {
  periodoLabel: string;
  resumo: {
    totalVisitas: number;
    confirmadas: number;
    concluidas: number;
    canceladas: number;
    taxaSucesso: number;
  };
  desempenhoCorretores: {
    nome: string;
    total: number;
    confirmadas: number;
    concluidas: number;
    canceladas: number;
    taxaConversao: number;
  }[];
  atividadeImoveis: {
    codigo: string;
    titulo: string;
    bairro: string;
    totalVisitas: number;
    clientesDistintos: number;
    status: string;
  }[];
  filename?: string;
}) {
  const workbook = XLSX.utils.book_new();

  // 1. Aba Resumo
  const resumoDados = [
    { 'Métrica': 'Período Selecionado', 'Valor': periodoLabel },
    { 'Métrica': 'Total de Visitas Agendadas', 'Valor': resumo.totalVisitas },
    { 'Métrica': 'Visitas Confirmadas', 'Valor': resumo.confirmadas },
    { 'Métrica': 'Visitas Concluídas', 'Valor': resumo.concluidas },
    { 'Métrica': 'Visitas Canceladas', 'Valor': resumo.canceladas },
    { 'Métrica': 'Taxa de Conversão Global', 'Valor': `${resumo.taxaSucesso}%` },
  ];
  const wsResumo = XLSX.utils.json_to_sheet(resumoDados);
  wsResumo['!cols'] = autoFitColumns(resumoDados);
  XLSX.utils.book_append_sheet(workbook, wsResumo, 'Resumo Geral');

  // 2. Aba Desempenho Corretores
  const corretoresDados = desempenhoCorretores.map((c) => ({
    'Corretor': c.nome,
    'Total Visitas': c.total,
    'Confirmadas': c.confirmadas,
    'Concluídas': c.concluidas,
    'Canceladas': c.canceladas,
    'Taxa de Conversão': `${c.taxaConversao}%`,
  }));
  const wsCorretores = XLSX.utils.json_to_sheet(corretoresDados);
  wsCorretores['!cols'] = autoFitColumns(corretoresDados);
  XLSX.utils.book_append_sheet(workbook, wsCorretores, 'Desempenho Corretores');

  // 3. Aba Atividade Imóveis
  const imoveisDados = atividadeImoveis.map((im) => ({
    'Código': im.codigo,
    'Imóvel': im.titulo,
    'Bairro': im.bairro,
    'Total de Visitas': im.totalVisitas,
    'Clientes Distintos': im.clientesDistintos,
    'Status Atual': im.status.toUpperCase(),
  }));
  const wsImoveis = XLSX.utils.json_to_sheet(imoveisDados);
  wsImoveis['!cols'] = autoFitColumns(imoveisDados);
  XLSX.utils.book_append_sheet(workbook, wsImoveis, 'Atividade Imóveis');

  XLSX.writeFile(workbook, filename);
}
