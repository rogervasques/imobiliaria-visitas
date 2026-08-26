import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

const userUploadedDir = 'C:\\Users\\roger.berchembrock\\.gemini\\antigravity-ide\\brain\\376bfa65-3b9f-4548-8742-265d3f781ff7\\.user_uploaded';

function getBase64Image(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const bitmap = fs.readFileSync(filePath);
      return `data:image/png;base64,${bitmap.toString('base64')}`;
    }
  } catch (err) {
    console.warn(`Could not load image at ${filePath}:`, err.message);
  }
  return null;
}

const logoPath = path.resolve(process.cwd(), 'public', 'easymob-logo.png');
const imgImovelPublico = path.join(userUploadedDir, 'media_1787602135627.png');
const imgQrCode = path.join(userUploadedDir, 'media_1787432881407.png');
const imgUsuarios = path.join(userUploadedDir, 'media_1787582310199.png');
const imgRegua = path.join(userUploadedDir, 'media_1787771310158.png');
const imgResumo = path.join(userUploadedDir, 'media_1787665964172.png');

const b64Logo = getBase64Image(logoPath);
const b64Imovel = getBase64Image(imgImovelPublico);
const b64QrCode = getBase64Image(imgQrCode);
const b64Usuarios = getBase64Image(imgUsuarios);
const b64Regua = getBase64Image(imgRegua);
const b64Resumo = getBase64Image(imgResumo);

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

const pageWidth = doc.internal.pageSize.getWidth(); // 210
const pageHeight = doc.internal.pageSize.getHeight(); // 297

// Helper: Cores do Design System
const colors = {
  emeraldDark: [5, 150, 105],      // #059669
  emeraldLight: [209, 250, 229],   // #D1FAE5
  emeraldPrimary: [16, 185, 129],  // #10B981
  slate900: [15, 23, 42],          // #0F172A
  slate800: [30, 41, 59],          // #1E293B
  slate700: [51, 65, 85],          // #334155
  slate500: [100, 116, 139],       // #64748B
  slate100: [241, 245, 249],       // #F1F5F9
  slate50: [248, 250, 252],        // #F8FAFC
  white: [255, 255, 255],
  amber: [217, 119, 6],            // #D97706
  amberLight: [254, 243, 199],     // #FEF3C7
};

function addHeader(pageNum, totalPages = 7) {
  // Barra de topo elegante
  doc.setFillColor(...colors.slate900);
  doc.rect(0, 0, pageWidth, 14, 'F');
  
  doc.setFillColor(...colors.emeraldPrimary);
  doc.rect(0, 14, pageWidth, 1.2, 'F');

  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('EASYMOB — APRESENTAÇÃO COMERCIAL & FUNCIONAL', 15, 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 200, 200);
  doc.text('Solução Completa em Gestão de Visitas & WhatsApp', pageWidth - 15, 9, { align: 'right' });

  // Rodapé padrão
  doc.setFillColor(...colors.slate100);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

  doc.setDrawColor(...colors.slate500);
  doc.setLineWidth(0.1);
  doc.line(15, pageHeight - 12, pageWidth - 15, pageHeight - 12);

  doc.setTextColor(...colors.slate500);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('EasyMob • Plataforma de Gestão Imobiliária & Automações', 15, pageHeight - 5);
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 15, pageHeight - 5, { align: 'right' });
}

// ═════════════════════════════════════════════════════════════════════
// PÁGINA 1: CAPA EXECUTIVA
// ═════════════════════════════════════════════════════════════════════

// Fundo escuro premium na capa
doc.setFillColor(15, 23, 42); // slate-900
doc.rect(0, 0, pageWidth, pageHeight, 'F');

// Faixas decorativas modernas
doc.setFillColor(5, 150, 105); // emerald-600
doc.rect(0, 0, 8, pageHeight, 'F');

doc.setFillColor(16, 185, 129); // emerald-500
doc.rect(8, 0, 2, pageHeight, 'F');

// Logo ou Banner
if (b64Logo) {
  doc.addImage(b64Logo, 'PNG', 25, 30, 48, 48);
} else {
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('EasyMob', 25, 50);
}

// Tag Badge
doc.setFillColor(16, 185, 129);
doc.roundedRect(25, 90, 85, 7.5, 2, 2, 'F');
doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.text('APRESENTAÇÃO COMERCIAL & TÉCNICA', 28, 95);

// Título Principal
doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(26);
doc.text('Gestão Inteligente de', 25, 110);
doc.setTextColor(16, 185, 129);
doc.text('Visitas, WhatsApp', 25, 121);
doc.setTextColor(255, 255, 255);
doc.text('& Comprovante de Atendimento', 25, 132);

// Subtítulo
doc.setFont('helvetica', 'normal');
doc.setFontSize(11.5);
doc.setTextColor(203, 213, 225); // slate-300
const subText = 'A plataforma definitiva para imobiliárias e corretores eliminarem faltas em visitas, automatizarem a comunicação com clientes e proprietários e assegurarem total validade jurídica e comprovação de atendimento.';
const splitSub = doc.splitTextToSize(subText, pageWidth - 50);
doc.text(splitSub, 25, 147);

// Destaques / Cards na Capa
const cards = [
  { title: 'Régua de Notificações WhatsApp', desc: 'Disparos automáticos e individuais pelo número do próprio corretor.' },
  { title: 'Comprovante com Validade Jurídica', desc: 'Histórico auditável (48h) com criptografia AES-256 e PDF certificado.' },
  { title: 'Roteiros Multi-Imóveis & Logística', desc: 'Agendamento de múltiplos imóveis, chaves, portarias e rotas no Google Maps.' },
  { title: 'Multi-Tenant & 100% Mobile (PWA)', desc: 'Instalável no iOS/Android sem App Store e isolamento por imobiliária.' }
];

let cardY = 175;
cards.forEach((c, idx) => {
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(25, cardY, pageWidth - 50, 16, 2.5, 2.5, 'F');
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.3);
  doc.roundedRect(25, cardY, pageWidth - 50, 16, 2.5, 2.5, 'D');

  doc.setFillColor(16, 185, 129);
  doc.circle(32, cardY + 8, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(c.title, 38, cardY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(c.desc, 38, cardY + 11.5);

  cardY += 19.5;
});

// Rodapé da capa
doc.setTextColor(100, 116, 139);
doc.setFontSize(8);
doc.setFont('helvetica', 'normal');
doc.text('EasyMob Software • Tecnologia Imobiliária de Alta Performance', 25, pageHeight - 15);
doc.text('Versão 1.0 • 2026', pageWidth - 25, pageHeight - 15, { align: 'right' });


// ═════════════════════════════════════════════════════════════════════
// PÁGINA 2: O DESAFIO DO MERCADO VS A SOLUÇÃO EASYMOB
// ═════════════════════════════════════════════════════════════════════
doc.addPage();
addHeader(2);

doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor(...colors.slate900);
doc.text('1. O Desafio do Mercado vs. A Solução EasyMob', 15, 26);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(...colors.slate700);
doc.text('O processo tradicional de agendamento e realização de visitas no mercado imobiliário enfrenta gargalos críticos que reduzem o faturamento e criam insegurança jurídica para a imobiliária.', 15, 33);

// Tabela Comparativa de Problemas e Soluções
autoTable(doc, {
  startY: 40,
  head: [['Desafio / Dor no Modelo Tradicional', 'Solução Inovadora EasyMob', 'Impacto nos Resultados']],
  body: [
    [
      'Alto índice de faltas (No-Show):\nClientes esquecem do horário marcado e corretores perdem tempo e deslocamento.',
      'Régua Automática no WhatsApp:\nConfirmação imediata + Lembrete 1h antes com endereço, mapas e contato do corretor.',
      'Redução de até 80%\nnas faltas em visitas.'
    ],
    [
      'Proprietários no escuro:\nFalta de aviso ao proprietário gera desencontro nas chaves e quebra de exclusividade.',
      'Aviso e Comprovação ao Proprietário:\nNotificação sincronizada e envio de comprovação formal no momento em que a visita é concluída.',
      '100% de transparência e\nfidelização de proprietários.'
    ],
    [
      'Perda de Honorários e Desvio:\nIncerteza se o cliente visitou com o corretor em caso de proposta direta com proprietário.',
      'Relatório de Atendimento Certificado:\nGravação de mensagens (+48h) com criptografia AES-256, hash SHA-256 e PDF com validade jurídica.',
      'Segurança jurídica total\ne proteção da comissão.'
    ],
    [
      'Logística de visitas confusa:\nVisitar múltiplos imóveis gera erros de rota, atrasos e perda de informações de portaria.',
      'Roteiro de Visitas Inteligente:\nAgrupamento de múltiplos imóveis, integração nativa com Google Maps e dados de portaria/chaves.',
      'Economia de até 40%\nno tempo de deslocamento.'
    ]
  ],
  theme: 'grid',
  headStyles: {
    fillColor: colors.slate900,
    textColor: colors.white,
    fontStyle: 'bold',
    fontSize: 8.5,
    halign: 'left',
  },
  bodyStyles: {
    fontSize: 8,
    textColor: colors.slate800,
    lineColor: [226, 232, 240],
  },
  columnStyles: {
    0: { cellWidth: 60, fontStyle: 'bold', textColor: [185, 28, 28] },
    1: { cellWidth: 75, textColor: colors.slate900 },
    2: { cellWidth: 45, fontStyle: 'bold', textColor: colors.emeraldDark, halign: 'center' }
  },
  margin: { left: 15, right: 15 },
});

const finalYPage2 = doc.lastAutoTable.finalY + 8;

// Bloco de Proposta de Valor
doc.setFillColor(...colors.slate50);
doc.roundedRect(15, finalYPage2, pageWidth - 30, 48, 3, 3, 'F');
doc.setDrawColor(...colors.emeraldPrimary);
doc.setLineWidth(0.4);
doc.roundedRect(15, finalYPage2, pageWidth - 30, 48, 3, 3, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(...colors.emeraldDark);
doc.text('🎯 Proposta de Valor Exclusiva da EasyMob', 22, finalYPage2 + 9);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(...colors.slate700);
const propLines = [
  '• Automação Humanizada: As mensagens saem do número de WhatsApp do próprio corretor, mantendo o vínculo e a proximidade com o lead.',
  '• Fim da Perda de Tempo: Corretores não precisam redigir textos repetitivos; tudo é automatizado com tags inteligentes.',
  '• Blindagem Jurídica: Relatórios detalhados com conformidade à LGPD e ao Marco Civil da Internet (Lei 12.965/2014, Art. 7).',
  '• White-Label & Pronta para Uso: Plataforma completa sob medida para a identidade visual da sua imobiliária.'
];
let propY = finalYPage2 + 16;
propLines.forEach(l => {
  doc.text(l, 22, propY);
  propY += 7;
});


// ═════════════════════════════════════════════════════════════════════
// PÁGINA 3: ROTEIRO DE VISITAS INTELIGENTE (MULTI-IMÓVEIS)
// ═════════════════════════════════════════════════════════════════════
doc.addPage();
addHeader(3);

doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor(...colors.slate900);
doc.text('2. Roteiro de Visitas Inteligente (Multi-Imóveis)', 15, 26);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(...colors.slate700);
doc.text('Projetado para dar máxima produtividade ao corretor antes, durante e após o atendimento.', 15, 33);

// 3 Pilares em Colunas
const pColWidth = 56;
const pCols = [
  {
    title: 'Multi-Imóveis no Roteiro',
    desc: 'Permite selecionar 1, 2, 3 ou mais imóveis para o mesmo cliente, gerando um roteiro sequencial com foto, endereço, valores e dados de chaves.'
  },
  {
    title: 'Navegação Google Maps',
    desc: 'Botão de 1 clique para traçar a melhor rota no Google Maps diretamente no celular do corretor, sem precisar digitar endereços.'
  },
  {
    title: 'Chaves & Portaria',
    desc: 'Instruções claras sobre retirada de chaves, senha do cofre, regras de acesso do condomínio e contato rápido com o proprietário.'
  }
];

let colX = 15;
pCols.forEach(c => {
  doc.setFillColor(...colors.slate100);
  doc.roundedRect(colX, 40, pColWidth, 38, 2.5, 2.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(colX, 40, pColWidth, 38, 2.5, 2.5, 'D');

  doc.setFillColor(...colors.emeraldDark);
  doc.rect(colX, 40, pColWidth, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...colors.slate900);
  doc.text(c.title, colX + 4, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.slate700);
  const spl = doc.splitTextToSize(c.desc, pColWidth - 8);
  doc.text(spl, colX + 4, 55);

  colX += pColWidth + 6;
});

// Imagem ou Demonstração da Ficha Pública
const sectionY3 = 85;
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...colors.slate900);
doc.text('Visualização Prática: Ficha do Imóvel & Roteiro Integrado', 15, sectionY3);

if (b64Imovel) {
  doc.addImage(b64Imovel, 'PNG', 15, sectionY3 + 4, 180, 85);
}

// Caixa de Destaque no Rodapé da Página 3
const boxY3 = sectionY3 + 93;
doc.setFillColor(...colors.slate900);
doc.roundedRect(15, boxY3, pageWidth - 30, 42, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(16, 185, 129);
doc.text('⚡ Modal de Conclusão Rápida com 2 Cliques', 22, boxY3 + 9);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(226, 232, 240);
const txtConc = [
  'Ao finalizar a visita, o corretor clica em "Concluir Visita" e tem acesso a um pop-up ultra enxuto:',
  '  [ X ] Enviar WhatsApp pós-visita ao Cliente (Pedir feedback e proposta)',
  '  [ X ] Enviar WhatsApp de comprovação ao Proprietário (Confirmar visita realizada)',
  'O sistema atualiza o status, dispara as mensagens e inicia a contagem de 48h de gravação para auditoria.'
];
let concY = boxY3 + 16;
txtConc.forEach(t => {
  doc.text(t, 22, concY);
  concY += 5.5;
});


// ═════════════════════════════════════════════════════════════════════
// PÁGINA 4: RÉGUA DE NOTIFICAÇÕES WHATSAPP (MULTI-INSTÂNCIA)
// ═════════════════════════════════════════════════════════════════════
doc.addPage();
addHeader(4);

doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor(...colors.slate900);
doc.text('3. Régua de Notificações WhatsApp Automatizada', 15, 26);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(...colors.slate700);
doc.text('Comunicação pontual e estruturada que mantém todos os envolvidos sincronizados.', 15, 33);

// Tabela de Etapas da Régua
autoTable(doc, {
  startY: 38,
  head: [['Etapa da Régua', 'Momento / Gatilho', 'Destinatário', 'Conteúdo da Mensagem']],
  body: [
    [
      '1. Confirmação',
      'Imediato ao criar a visita',
      'Cliente &\nProprietário',
      'Dados completos do imóvel, endereço, data, horário, nome e telefone do corretor e link de mapa.'
    ],
    [
      '2. Lembrete 1h',
      '1 hora antes do horário agendado',
      'Cliente &\nProprietário',
      'Mensagem amigável de reforço para garantir a pontualidade e alertar o proprietário da chegada.'
    ],
    [
      '3. Pós-Visita\n(Feedback)',
      'Na conclusão da visita',
      'Cliente',
      'Agradecimento pela visita, solicitação de avaliação e questionamento sobre interesse em proposta.'
    ],
    [
      '3. Comprovação\n(Proprietário)',
      'Na conclusão da visita',
      'Proprietário',
      'Notificação formal certificando que o corretor esteve no imóvel com o cliente naquela data e hora.'
    ]
  ],
  theme: 'striped',
  headStyles: {
    fillColor: colors.emeraldDark,
    textColor: colors.white,
    fontStyle: 'bold',
    fontSize: 8.5,
  },
  bodyStyles: {
    fontSize: 8,
    textColor: colors.slate800,
  },
  columnStyles: {
    0: { cellWidth: 35, fontStyle: 'bold' },
    1: { cellWidth: 40 },
    2: { cellWidth: 30, fontStyle: 'bold' },
    3: { cellWidth: 75 }
  },
  margin: { left: 15, right: 15 }
});

const finalYPage4 = doc.lastAutoTable.finalY + 8;

// Imagem da Régua
if (b64Regua) {
  doc.addImage(b64Regua, 'PNG', 15, finalYPage4, 180, 52);
}

// Bloco: Disparo Manual com 1 Clique
const manualBoxY = finalYPage4 + 56;
doc.setFillColor(...colors.emeraldLight);
doc.roundedRect(15, manualBoxY, pageWidth - 30, 36, 3, 3, 'F');
doc.setDrawColor(...colors.emeraldDark);
doc.setLineWidth(0.4);
doc.roundedRect(15, manualBoxY, pageWidth - 30, 36, 3, 3, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(...colors.emeraldDark);
doc.text('💬 Atalho Rápido de Disparo Manual no WhatsApp', 22, manualBoxY + 8);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(...colors.slate800);
const txtMan = [
  '• Cada item da régua possui um botão com o ícone oficial do WhatsApp ao lado do nome (Cliente / Proprietário).',
  '• Ao clicar no botão, o sistema preenche dinamicamente todas as variáveis do template ({cliente_nome}, {imovel_titulo}, etc.).',
  '• Abre instantaneamente no WhatsApp Web (no desktop) ou no App WhatsApp (no mobile) com o texto 100% pronto para envio.',
  '• Flexibilidade total: permite ao corretor revisar, complementar ou reenviar mensagens com apenas 1 clique.'
];
let manY = manualBoxY + 14;
txtMan.forEach(t => {
  doc.text(t, 22, manY);
  manY += 5;
});


// ═════════════════════════════════════════════════════════════════════
// PÁGINA 5: COMPROVANTE DE ATENDIMENTO & AUDITORIA (+48H)
// ═════════════════════════════════════════════════════════════════════
doc.addPage();
addHeader(5);

doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor(...colors.slate900);
doc.text('4. Comprovante de Atendimento & Auditoria (48h)', 15, 26);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(...colors.slate700);
doc.text('Segurança jurídica inquestionável: proteja a comissão e os honorários da sua equipe.', 15, 33);

// 2 Colunas de Destaque
const colW5 = 87;
// Coluna 1: Como Funciona
doc.setFillColor(...colors.slate50);
doc.roundedRect(15, 40, colW5, 62, 2.5, 2.5, 'F');
doc.setDrawColor(...colors.slate500);
doc.setLineWidth(0.2);
doc.roundedRect(15, 40, colW5, 62, 2.5, 2.5, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(...colors.slate900);
doc.text('🔒 Gravação Contínua Criptografada', 20, 48);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(...colors.slate700);
const txtGrav = [
  '• Início Automático: A gravação de interações no WhatsApp se inicia no momento do agendamento.',
  '• Janela Estendida (+48h): Continua gravando até 48 horas após a conclusão ou cancelamento da visita para capturar propostas e negociações posteriores.',
  '• Gravação Separada: Checkboxes independentes para gravar conversas com o Cliente e com o Proprietário.',
  '• Suporte a Mídias: Armazena com segurança textos, notas de voz (áudios) e fotos enviadas.'
];
let gravY = 55;
txtGrav.forEach(g => {
  const sp = doc.splitTextToSize(g, colW5 - 10);
  doc.text(sp, 20, gravY);
  gravY += sp.length * 4.5 + 1;
});

// Coluna 2: Relatório Certificado em PDF
doc.setFillColor(...colors.slate50);
doc.roundedRect(108, 40, colW5, 62, 2.5, 2.5, 'F');
doc.setDrawColor(...colors.slate500);
doc.setLineWidth(0.2);
doc.roundedRect(108, 40, colW5, 62, 2.5, 2.5, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(...colors.slate900);
doc.text('📄 Exportação em PDF com Hash SHA-256', 113, 48);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(...colors.slate700);
const txtPdf = [
  '• Relatório Individualizado: Botão de download em PDF dedicado para o Cliente e para o Proprietário.',
  '• Hash Criptográfico: Cada relatório recebe uma chave SHA-256 exclusiva comprovando que não houve adulteração.',
  '• Identificadores Meta: IDs de mensagem oficiais da Meta que comprovam entrega e leitura.',
  '• Termo de Conformidade: Base legal nos termos da LGPD e do Marco Civil da Internet (Lei 12.965/14).'
];
let pdfY = 55;
txtPdf.forEach(p => {
  const sp = doc.splitTextToSize(p, colW5 - 10);
  doc.text(sp, 113, pdfY);
  pdfY += sp.length * 4.5 + 1;
});

// Accordions Explicados
const accY = 110;
doc.setFillColor(...colors.slate900);
doc.roundedRect(15, accY, pageWidth - 30, 48, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(16, 185, 129);
doc.text('👥 Visualização em Accordions Duais (Cliente vs. Proprietário)', 22, accY + 10);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(241, 245, 249);
const accLines = [
  'Para manter a ficha de roteiro limpa e organizada, os históricos ficam ocultos por padrão em sanfonas expansíveis:',
  '  1. [ 👤 Histórico WhatsApp — Cliente ]: Exibe as mensagens trocadas com o comprador/locatário + Botão [ Exportar PDF ].',
  '  2. [ 🏠 Histórico WhatsApp — Proprietário ]: Exibe as mensagens trocadas com o proprietário + Botão [ Exportar PDF ].',
  'Cada bloco possui badge dinâmico indicando se a gravação está ATIVA ou DESATIVADA para aquele destinatário.'
];
let accLineY = accY + 18;
accLines.forEach(al => {
  doc.text(al, 22, accLineY);
  accLineY += 6.5;
});

// Termo Legal Box
const legalY = accY + 54;
doc.setFillColor(...colors.amberLight);
doc.roundedRect(15, legalY, pageWidth - 30, 24, 2, 2, 'F');
doc.setDrawColor(...colors.amber);
doc.setLineWidth(0.3);
doc.roundedRect(15, legalY, pageWidth - 30, 24, 2, 2, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...colors.amber);
doc.text('⚖️ Validade Probatória em Ações de Cobrança e Arbitragem', 22, legalY + 7);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(120, 53, 15);
doc.text('O Comprovante de Atendimento da EasyMob serve como elemento probatório robusto em disputas de comissão imobiliária (Art. 725 do Código Civil), comprovando de forma incontestável a intermediação útil e a aproximação das partes.', 22, legalY + 13, { maxWidth: pageWidth - 44 });


// ═════════════════════════════════════════════════════════════════════
// PÁGINA 6: GESTÃO DE IMÓVEIS, PROPRIETÁRIOS & PWA MOBILE
// ═════════════════════════════════════════════════════════════════════
doc.addPage();
addHeader(6);

doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor(...colors.slate900);
doc.text('5. Gestão de Imóveis, Equipe & PWA Mobile', 15, 26);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(...colors.slate700);
doc.text('Infraestrutura moderna e adaptada para corretores em campo e gestores no escritório.', 15, 33);

// 3 Blocos de Módulos
const modW = 56;
const modBlocks = [
  {
    title: 'Cadastro de Imóveis',
    desc: 'Controle de fotos em alta resolução, valores de venda e locação, condomínio, IPTU, endereço e detalhes de retirada de chaves.'
  },
  {
    title: 'Gestão de Proprietários',
    desc: 'Base centralizada com dados de contato, chave PIX, dados bancários e contagem de imóveis vinculados a cada proprietário.'
  },
  {
    title: 'Multi-Tenant & Equipe',
    desc: 'Controle de acesso por perfis (Administrador, Gerente, Corretor) e geração de convites com link seguro e validade de 24h.'
  }
];

let mX = 15;
modBlocks.forEach(m => {
  doc.setFillColor(...colors.slate50);
  doc.roundedRect(mX, 40, modW, 36, 2.5, 2.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(mX, 40, modW, 36, 2.5, 2.5, 'D');

  doc.setFillColor(...colors.emeraldDark);
  doc.rect(mX, 40, modW, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...colors.slate900);
  doc.text(m.title, mX + 4, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.slate700);
  const spl = doc.splitTextToSize(m.desc, modW - 8);
  doc.text(spl, mX + 4, 55);

  mX += modW + 6;
});

// Imagens: Gestão de Usuários e Conexão QR Code
const imgY6 = 82;
if (b64Usuarios && b64QrCode) {
  doc.addImage(b64Usuarios, 'PNG', 15, imgY6, 120, 68);
  doc.addImage(b64QrCode, 'PNG', 140, imgY6, 55, 68);
} else if (b64Usuarios) {
  doc.addImage(b64Usuarios, 'PNG', 15, imgY6, 180, 68);
}

// Bloco: PWA Mobile
const pwaY = 156;
doc.setFillColor(...colors.slate900);
doc.roundedRect(15, pwaY, pageWidth - 30, 42, 3, 3, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(16, 185, 129);
doc.text('📱 Progressive Web App (PWA) — Instalável no iOS e Android', 22, pwaY + 9);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(226, 232, 240);
const pwaLines = [
  '• Experiência de Aplicativo Nativo: Adicione o ícone da EasyMob na tela de início do seu iPhone ou Android diretamente pelo Safari/Chrome.',
  '• Sem Necessidade de App Store: Sem burocracia de download ou atualizações manuais; a equipe sempre acessa a versão mais recente.',
  '• Acesso Ágil em Campo: Corretores consultam roteiros, acionam o mapa e enviam WhatsApps mesmo durante o deslocamento entre imóveis.'
];
let pwaLineY = pwaY + 16;
pwaLines.forEach(pl => {
  doc.text(pl, 22, pwaLineY);
  pwaLineY += 6.5;
});


// ═════════════════════════════════════════════════════════════════════
// PÁGINA 7: RETORNO SOBRE O INVESTIMENTO (ROI) & PRÓXIMOS PASSOS
// ═════════════════════════════════════════════════════════════════════
doc.addPage();
addHeader(7);

doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor(...colors.slate900);
doc.text('6. Retorno sobre o Investimento & Conclusão', 15, 26);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(...colors.slate700);
doc.text('Como a EasyMob gera economia direta e potencializa o faturamento da sua imobiliária.', 15, 33);

// 3 Métricas de Impacto
const metricW = 56;
const metrics = [
  { val: '-80%', label: 'Absenteísmo em Visitas', sub: 'Lembretes sincronizados no WhatsApp eliminam o esquecimento de clientes.' },
  { val: '+35%', label: 'Aumento na Conversão', sub: 'Follow-up no momento exato da visita acelera o envio de propostas.' },
  { val: '100%', label: 'Segurança de Honorários', sub: 'Comprovantes de atendimento com hash auditável e validade jurídica.' }
];

let metX = 15;
metrics.forEach(m => {
  doc.setFillColor(...colors.emeraldLight);
  doc.roundedRect(metX, 42, metricW, 36, 3, 3, 'F');
  doc.setDrawColor(...colors.emeraldPrimary);
  doc.setLineWidth(0.4);
  doc.roundedRect(metX, 42, metricW, 36, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...colors.emeraldDark);
  doc.text(m.val, metX + metricW / 2, 53, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...colors.slate900);
  doc.text(m.label, metX + metricW / 2, 60, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...colors.slate700);
  const spl = doc.splitTextToSize(m.sub, metricW - 8);
  doc.text(spl, metX + metricW / 2, 66, { align: 'center' });

  metX += metricW + 6;
});

// Bloco: Como Começar / Implantação
const startY = 86;
doc.setFillColor(...colors.slate50);
doc.roundedRect(15, startY, pageWidth - 30, 52, 3, 3, 'F');
doc.setDrawColor(203, 213, 225);
doc.setLineWidth(0.3);
doc.roundedRect(15, startY, pageWidth - 30, 52, 3, 3, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...colors.slate900);
doc.text('🚀 Implantação Rápida em 4 Passos Simples', 22, startY + 10);

const steps = [
  '1. Configuração do Tenant: Criamos a conta da sua imobiliária com sua logomarca e identidade visual.',
  '2. Cadastro da Equipe: Envio de convites seguros para os corretores criarem suas credenciais de acesso.',
  '3. Conexão do WhatsApp: Cada corretor escaneia o QR Code no seu perfil e conecta seu número individual.',
  '4. Roteiros e Visitas: Comece a agendar visitas imediatamente com automações e relatórios ativados!'
];

let stepY = startY + 18;
steps.forEach(s => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...colors.slate800);
  doc.text(s, 22, stepY);
  stepY += 7.5;
});

// Bloco de Chamada para Ação (CTA)
const ctaY = startY + 60;
doc.setFillColor(...colors.slate900);
doc.roundedRect(15, ctaY, pageWidth - 30, 48, 3, 3, 'F');
doc.setDrawColor(...colors.emeraldPrimary);
doc.setLineWidth(0.5);
doc.roundedRect(15, ctaY, pageWidth - 30, 48, 3, 3, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(255, 255, 255);
doc.text('Transforme a Gestão de Visitas da sua Imobiliária', pageWidth / 2, ctaY + 14, { align: 'center' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(203, 213, 225);
doc.text('Fale conosco e agende uma demonstração ao vivo para a sua equipe.', pageWidth / 2, ctaY + 22, { align: 'center' });

doc.setFillColor(...colors.emeraldPrimary);
doc.roundedRect(pageWidth / 2 - 45, ctaY + 28, 90, 11, 2.5, 2.5, 'F');
doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.text('EASYMOB — TECNOLOGIA IMOBILIÁRIA', pageWidth / 2, ctaY + 35, { align: 'center' });


// ═════════════════════════════════════════════════════════════════════
// SALVAMENTO DO ARQUIVO PDF
// ═════════════════════════════════════════════════════════════════════
const outputRoot = path.resolve(process.cwd(), 'Apresentacao_EasyMob_Plataforma.pdf');
const outputPublic = path.resolve(process.cwd(), 'public', 'Apresentacao_EasyMob_Plataforma.pdf');

const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync(outputRoot, pdfBuffer);
fs.writeFileSync(outputPublic, pdfBuffer);

console.log('PDF gerado com sucesso!');
console.log('Arquivo salvo em:', outputRoot);
console.log('Arquivo salvo em:', outputPublic);
