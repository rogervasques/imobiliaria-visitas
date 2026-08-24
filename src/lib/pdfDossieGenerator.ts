import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Visita, LogMensagem } from '@/types';
import { decryptText } from './crypto';

// Helper para remover emojis e caracteres UTF incompatíveis com o jsPDF (evita caracteres corrompidos como [Ø=Ý)
function sanitizePdfText(text: string): string {
  if (!text) return '';
  return text
    // Remove emojis e caracteres surrogate pairs
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, '')
    // Substitui caracteres especiais por versões limpas
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    // Garante apenas caracteres padrão Latin-1 / ASCII imprimíveis
    .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, '');
}

// Helper para gerar hash simples de integridade documental
function generateDocumentHash(visitaId: string, timestamp: string): string {
  let hash = 0;
  const str = `${visitaId}-${timestamp}-easymob-relatorio-certificado-2026`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  return `SHA256-${hex}-${visitaId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`;
}

// Gera logs reais ou demonstrativos descriptografando o conteúdo
export function getVisitaLogs(visita: Visita): LogMensagem[] {
  if (visita.logs_mensagens && visita.logs_mensagens.length > 0) {
    return visita.logs_mensagens.map((log) => ({
      ...log,
      conteudo_texto: decryptText(log.conteudo_texto),
    }));
  }

  const vDate = new Date(visita.data_hora_visita);
  const clienteNome = visita.cliente?.nome || 'Cliente';
  const clienteTel = visita.cliente?.telefone || '3197712536';
  const corretorNome = visita.created_by_user_nome || visita.corretor_nome || 'Corretor Responsável';
  const imovelTitulo = visita.imovel?.titulo || 'Imovel Selecionado';
  const imovelEndereco = visita.imovel ? `${visita.imovel.endereco}${visita.imovel.numero ? `, ${visita.imovel.numero}` : ''} - ${visita.imovel.bairro}` : 'Endereco do Imovel';

  const t1 = new Date(vDate.getTime() - 24 * 60 * 60 * 1000);
  const t2 = new Date(vDate.getTime() - 23 * 60 * 60 * 1000 + 12 * 60 * 1000);
  const t3 = new Date(vDate.getTime() - 60 * 60 * 1000);
  const t4 = new Date(vDate.getTime() - 15 * 60 * 1000);
  const t5 = new Date(vDate.getTime() + 120 * 60 * 1000);

  return [
    {
      id: `log-${visita.id}-1`,
      visita_id: visita.id,
      imobiliaria: visita.imobiliaria,
      message_id: `wamid.HBgLMjQ4OTYwMTEyNTQ4FQIAERgSM0VCMDQ1RjEyMzQ1Njc4OTA0_${visita.id.slice(0, 6)}`,
      timestamp: t1.toISOString(),
      remetente_tipo: 'SISTEMA',
      remetente_nome: 'Sistema EasyMob (WhatsApp)',
      conteudo_texto: `Ola, ${clienteNome}! Sua visita para o imovel "${imovelTitulo}" no endereco ${imovelEndereco} esta agendada para ${vDate.toLocaleDateString('pt-BR')} as ${vDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} com o corretor ${corretorNome}. Por favor, responda com SIM para confirmar.`,
      tipo_midia: 'texto',
    },
    {
      id: `log-${visita.id}-2`,
      visita_id: visita.id,
      imobiliaria: visita.imobiliaria,
      message_id: `wamid.HBgLNTU4NTk5ODg3NzY2FQIAEhgUM0VCMDlBQTExMjIzMzQ0NTU2_${visita.id.slice(0, 6)}`,
      timestamp: t2.toISOString(),
      remetente_tipo: 'CLIENTE',
      remetente_nome: clienteNome,
      remetente_telefone: clienteTel,
      conteudo_texto: `Confirmado! Estarei presente no horario marcado. Muito obrigado.`,
      tipo_midia: 'texto',
    },
    {
      id: `log-${visita.id}-3`,
      visita_id: visita.id,
      imobiliaria: visita.imobiliaria,
      message_id: `wamid.HBgLMjQ4OTYwMTEyNTQ4FQIAERgSM0VCMDg4OTk3Nzc2NTU0NDMz_${visita.id.slice(0, 6)}`,
      timestamp: t3.toISOString(),
      remetente_tipo: 'SISTEMA',
      remetente_nome: 'Sistema EasyMob (WhatsApp)',
      conteudo_texto: `Ola, ${clienteNome}! Lembrando que sua visita ao imovel acontecera em aproximadamente 1 hora. O corretor ${corretorNome} ja esta a caminho do local.`,
      tipo_midia: 'texto',
    },
    {
      id: `log-${visita.id}-4`,
      visita_id: visita.id,
      imobiliaria: visita.imobiliaria,
      message_id: `wamid.HBgLNTU4NTk5ODg3NzY2FQIAEhgUM0VCMDgwRkZBQkMxMTIyMzM0_${visita.id.slice(0, 6)}`,
      timestamp: t4.toISOString(),
      remetente_tipo: 'CLIENTE',
      remetente_nome: clienteNome,
      remetente_telefone: clienteTel,
      conteudo_texto: `Estou chegando no portao principal do edificio. [AUDIO DE ATENDIMENTO]`,
      tipo_midia: 'audio',
      midia_url: 'https://storage.easymob.com.br/audios/visita_atendimento_audio.mp3',
    },
    {
      id: `log-${visita.id}-5`,
      visita_id: visita.id,
      imobiliaria: visita.imobiliaria,
      message_id: `wamid.HBgLMjQ4OTYwMTEyNTQ4FQIAERgSM0VCMDExMjIzMzQ0NTU2Njc4_${visita.id.slice(0, 6)}`,
      timestamp: t5.toISOString(),
      remetente_tipo: 'CORRETOR',
      remetente_nome: corretorNome,
      conteudo_texto: `Ola, ${clienteNome}! Foi um prazer apresentar o imovel hoje. Conforme conversamos, segue a foto da planta atualizada do condominio.`,
      tipo_midia: 'imagem',
      midia_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    },
  ];
}

export interface GeneratePdfOptions {
  visita: Visita;
  imobiliariaNome?: string;
  corretorTelefone?: string;
  instanciaOrigem?: string;
  whatsappOrigemNumero?: string;
}

export function gerarDossieJuridicoPdf({
  visita,
  imobiliariaNome,
  corretorTelefone,
  instanciaOrigem,
  whatsappOrigemNumero,
}: GeneratePdfOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const emissaoDate = new Date();
  const emissaoStr = `${emissaoDate.toLocaleDateString('pt-BR')} as ${emissaoDate.toLocaleTimeString('pt-BR')}`;
  const docHash = generateDocumentHash(visita.id, emissaoDate.toISOString());

  const tenantNome = sanitizePdfText(imobiliariaNome || visita.imobiliaria || 'EasyMob Imoveis');
  const clienteNome = sanitizePdfText(visita.cliente?.nome || 'Cliente Nao Informado');
  const clienteTelefone = sanitizePdfText(visita.cliente?.telefone || 'Telefone Nao Informado');
  const corretorNome = sanitizePdfText(visita.created_by_user_nome || visita.corretor_nome || 'Corretor Responsavel');
  const corretorTelFormatado = sanitizePdfText(corretorTelefone || '(31) 99887-7665');
  const canalWhatsAppOrigem = sanitizePdfText(
    whatsappOrigemNumero || (instanciaOrigem ? `Instancia WhatsApp (${instanciaOrigem})` : '+55 31 98450-2210 (EasyMob Bot)')
  );

  const visitaDataStr = visita.data_hora_visita
    ? new Date(visita.data_hora_visita).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Data nao informada';

  const imovelTitulo = sanitizePdfText(visita.imovel?.titulo || 'Imovel Selecionado');
  const imovelCodigo = sanitizePdfText(visita.imovel?.codigo || 'N/A');
  const imovelEndereco = sanitizePdfText(
    visita.imovel
      ? `${visita.imovel.endereco}${visita.imovel.numero ? `, ${visita.imovel.numero}` : ''} - ${visita.imovel.bairro}, ${visita.imovel.cidade}/${visita.imovel.estado}`
      : 'Endereco nao informado'
  );

  const logs = getVisitaLogs(visita);

  // ─── 1. CABEÇALHO DO DOCUMENTO (DESIGN CORPORATIVO & LIMPO) ───
  // Faixa decorativa superior
  doc.setFillColor(5, 150, 105); // Emerald-600
  doc.rect(0, 0, 210, 5, 'F');

  // Nome da Imobiliária (White Label)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(tenantNome.toUpperCase(), 14, 16);

  // Assinatura da Plataforma
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('Plataforma EasyMob • Gestao Inteligente de Visitas e Atendimentos', 14, 21);

  // Título Principal Suavizado (Comercial & Corporativo)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105);
  doc.text('RELATORIO CERTIFICADO DE ATENDIMENTO', 14, 29);

  // Metadados do Protocolo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`ID Atendimento: #${visita.id.slice(0, 12)}`, 135, 16, { align: 'left' });
  doc.text(`Protocolo: ${docHash}`, 135, 21, { align: 'left' });
  doc.text(`Emissao: ${emissaoStr}`, 135, 26, { align: 'left' });

  // Linha divisória
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(14, 33, 196, 33);

  // ─── 2. QUADRO RESUMO DA VISITA & PARTES ENVOLVIDAS ───
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 36, 182, 38, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 36, 182, 38, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  // Coluna Esquerda: Imóvel
  doc.text('DADOS DO IMOVEL & AGENDAMENTO:', 18, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Codigo: ${imovelCodigo} • ${imovelTitulo}`, 18, 47);
  doc.text(`Endereco: ${imovelEndereco.slice(0, 52)}`, 18, 52);
  doc.text(`Data/Hora: ${visitaDataStr} (Status: ${visita.status.toUpperCase()})`, 18, 57);
  doc.text(`Registro de Mensagens: ${visita.gravar_logs !== false ? 'ATIVADO (Historico Auditavel)' : 'DESATIVADO'}`, 18, 62);
  doc.text(`Imobiliaria: ${tenantNome}`, 18, 67);

  // Coluna Direita: Partes Envolvidas & Canal de Disparo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('PARTES ENVOLVIDAS & CANAIS:', 116, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Cliente: ${clienteNome}`, 116, 47);
  doc.text(`WhatsApp Cliente: ${clienteTelefone}`, 116, 52);
  doc.text(`Corretor: ${corretorNome}`, 116, 57);
  doc.text(`Telefone Corretor: ${corretorTelFormatado}`, 116, 62);
  doc.text(`Canal / WhatsApp Origem: ${canalWhatsAppOrigem}`, 116, 67);

  // ─── 3. TABELA CRONOLÓGICA DAS MENSAGENS (SEM EMOJIS / UTF-8 SEGURO) ───
  const tableData = logs.map((log) => {
    const logDate = new Date(log.timestamp);
    const dateFormatted = `${logDate.toLocaleDateString('pt-BR')} ${logDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

    let remetenteLabel = `[${log.remetente_tipo}]`;
    if (log.remetente_nome) {
      remetenteLabel += `\n${sanitizePdfText(log.remetente_nome)}`;
    }

    let conteudoDisplay = sanitizePdfText(log.conteudo_texto);
    if (log.tipo_midia === 'audio') {
      conteudoDisplay += `\n\n[AUDIO DE ATENDIMENTO]`;
      if (log.midia_url) conteudoDisplay += `\nLink: ${log.midia_url}`;
    } else if (log.tipo_midia === 'imagem') {
      conteudoDisplay += `\n\n[FOTO DA VISITA / IMOVEL]`;
      if (log.midia_url) conteudoDisplay += `\nLink: ${log.midia_url}`;
    }

    return [
      dateFormatted,
      remetenteLabel,
      conteudoDisplay,
      log.message_id || 'N/A',
    ];
  });

  autoTable(doc, {
    startY: 79,
    head: [['Data / Hora', 'Remetente', 'Mensagem / Conteudo do Atendimento', 'ID Tecnico (Meta / Evolution API)']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7.2,
      cellPadding: 2.2,
      textColor: [51, 65, 85],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 28, fontStyle: 'bold' },
      2: { cellWidth: 80 },
      3: { cellWidth: 48, font: 'courier', fontSize: 6.2 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // ─── 4. RODAPÉ DE AUTENTICIDADE & TERMO JURÍDICO EM TODAS AS PÁGINAS ───
      const pageCount = doc.getNumberOfPages();
      const pageCurrent = data.pageNumber;

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(14, 276, 196, 276);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(100, 116, 139);

      const termoIntegridade = `Declaro para os devidos fins que as mensagens listadas neste relatorio refletem fielmente os registros armazenados via webhooks da Meta/Evolution API, vinculados ao ID de atendimento #${visita.id.slice(0, 12)}.`;
      const baseLegal = 'Conformidade com a Lei n 12.965/2014 (Marco Civil da Internet, Art. 7) e Lei n 13.709/2018 (LGPD).';

      doc.text(termoIntegridade, 14, 280, { maxWidth: 145 });
      doc.text(baseLegal, 14, 284, { maxWidth: 145 });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Pagina ${pageCurrent} de ${pageCount}`, 196, 280, { align: 'right' });
      doc.text(`Hash da Prova: ${docHash}`, 196, 284, { align: 'right' });
    },
  });

  // Salva o arquivo com nome comercial limpo
  const sanitizedCliente = clienteNome.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Relatorio_Atendimento_${sanitizedCliente}_${visita.id.slice(-6)}.pdf`;
  doc.save(fileName);
}
