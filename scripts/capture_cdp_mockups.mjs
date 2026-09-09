import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const publicMockupsDir = path.resolve(process.cwd(), 'public', 'mockups');
if (!fs.existsSync(publicMockupsDir)) {
  fs.mkdirSync(publicMockupsDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureMockups() {
  console.log('Realizando login na API local...');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'rogervasques@gmail.com',
      password: '@Asenha12',
      rememberMe: true,
    }),
  });

  const rawCookie = loginRes.headers.get('set-cookie');
  console.log('Login status:', loginRes.status);
  
  let token = '';
  if (rawCookie) {
    const match = rawCookie.match(/easymob_session=([^;]+)/);
    if (match) token = match[1];
  }
  
  if (!token) {
    console.error('Não foi possível obter o token de sessão.');
    return;
  }
  console.log('Token de sessão extraído com sucesso.');

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.resolve(process.cwd(), 'scratch', 'edge_profile');
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const port = 9224;
  const edgeProcess = spawn(edgePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await sleep(2000);

  try {
    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const tabs = await listRes.json();
    const wsUrl = tabs[0]?.webSocketDebuggerUrl;
    if (!wsUrl) throw new Error('Não foi possível conectar ao WebSocket do Edge');

    console.log('Conectado ao Edge CDP');

    // Conexão via WebSocket nativo do Node.js
    const ws = new WebSocket(wsUrl);

    let idCounter = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    function sendCommand(method, params = {}) {
      const id = idCounter++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    // Habilita domínios
    await sendCommand('Network.enable');
    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');

    // Injeta Cookie de Sessão
    await sendCommand('Network.setCookie', {
      name: 'easymob_session',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
    });
    console.log('Cookie injetado no navegador.');

    // Helper para capturar tela
    async function capturePage(url, outputPath, width, height, waitMs = 3000, clickSelector = null) {
      console.log(`\nNavegando para: ${url} (${width}x${height})...`);
      await sendCommand('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 2, // 2x Retina
        mobile: width < 600,
      });

      await sendCommand('Page.navigate', { url });
      await sleep(waitMs);

      if (clickSelector) {
        await sendCommand('Runtime.evaluate', {
          expression: `
            (() => {
              const el = document.querySelector('${clickSelector}');
              if (el) el.click();
            })()
          `
        });
        await sleep(1500);
      }

      const screenshotResult = await sendCommand('Page.captureScreenshot', {
        format: 'png',
      });

      const buffer = Buffer.from(screenshotResult.data, 'base64');
      fs.writeFileSync(outputPath, buffer);
      console.log(`✓ Screenshot salvo: ${path.basename(outputPath)} (${(buffer.length / 1024).toFixed(1)} KB)`);
    }

    // 1. Dashboard Principal (Hero Section)
    await capturePage(
      'http://localhost:3000/dashboard',
      path.join(publicMockupsDir, 'mockup-dashboard.png'),
      1280,
      720,
      4000
    );

    // 2. Clientes & Match Inteligente (Section 3)
    await capturePage(
      'http://localhost:3000/clientes',
      path.join(publicMockupsDir, 'mockup-match-imoveis.png'),
      1280,
      820,
      4000,
      'button[title="Visualizar imóveis compatíveis com este perfil"]'
    );

    // 3. WhatsApp Conexão & QR Code (Section 4)
    await capturePage(
      'http://localhost:3000/configuracoes',
      path.join(publicMockupsDir, 'mockup-whatsapp-qrcode.png'),
      1200,
      800,
      4000
    );

    // 4. Mobile / Ficha Pública do Imóvel (Section 6 - Mobile Smartphone 390x844)
    await capturePage(
      'http://localhost:3000/imovel/89ceab10-a32c-46c9-adb4-fed3888a43bf',
      path.join(publicMockupsDir, 'mockup-ficha-publica.png'),
      390,
      844,
      4000
    );

    // 5. Relatório de Atendimento em PDF (Section 5)
    // Criamos uma visualização A4 ultra-fiel e elegante do Relatório Auditável Art. 727 CC
    const relatorioHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório Oficial de Atendimento - Art. 727 CC</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Inter', sans-serif;
            background: #ffffff;
            color: #0f172a;
            padding: 32px 36px;
            width: 800px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #059669;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .logo-badge {
            background: #059669;
            color: white;
            padding: 8px 12px;
            border-radius: 10px;
            font-weight: 900;
            font-size: 16px;
            letter-spacing: -0.5px;
          }
          .title-area h1 {
            font-size: 15px;
            font-weight: 900;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .title-area p {
            font-size: 10.5px;
            font-weight: 600;
            color: #059669;
            margin-top: 2px;
          }
          .hash-badge {
            text-align: right;
            font-family: 'JetBrains Mono', monospace;
            font-size: 9.5px;
            color: #64748b;
            background: #f8fafc;
            padding: 6px 10px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .hash-badge strong { color: #059669; }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }
          .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px 14px;
          }
          .info-card h3 {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin-bottom: 4px;
          }
          .info-label { color: #64748b; font-weight: 500; }
          .info-val { color: #0f172a; font-weight: 700; }
          .logs-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-bottom: 16px;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .logs-table th {
            background: #0f172a;
            color: #ffffff;
            font-weight: 700;
            text-align: left;
            padding: 8px 10px;
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .logs-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
            vertical-align: top;
          }
          .logs-table tr:nth-child(even) td { background: #f8fafc; }
          .badge-cli { background: #e0f2fe; color: #0369a1; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 8.5px; display: inline-block; }
          .badge-sis { background: #dcfce7; color: #15803d; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 8.5px; display: inline-block; }
          .badge-cor { background: #f3e8ff; color: #7e22ce; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 8.5px; display: inline-block; }
          .badge-prop { background: #fef3c7; color: #b45309; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 8.5px; display: inline-block; }
          .time-col { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #64748b; white-space: nowrap; }
          .meta-col { font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #94a3b8; }
          .legal-box {
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 12px;
            padding: 12px 14px;
            font-size: 10px;
            color: #065f46;
            line-height: 1.45;
            margin-bottom: 16px;
          }
          .legal-box strong { color: #047857; }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            font-size: 9px;
            color: #64748b;
          }
          .seal {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #f0fdf4;
            color: #166534;
            font-weight: 800;
            padding: 4px 10px;
            border-radius: 20px;
            border: 1px solid #bbf7d0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <div class="logo-badge">EasyMob</div>
            <div class="title-area">
              <h1>Relatório Oficial de Atendimento &amp; Visitas</h1>
              <p>Comprovação de Aproximação Útil &bull; Art. 727 do Código Civil</p>
            </div>
          </div>
          <div class="hash-badge">
            <div>PROTOCOLO: <strong>#EM-2026-89CEAB10</strong></div>
            <div>HASH: <strong>SHA256-A89E4B2F701C</strong></div>
            <div>EMISSÃO: 09/09/2026 14:30:00</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="info-card">
            <h3>Dados do Atendimento &bull; Cliente</h3>
            <div class="info-item"><span class="info-label">Cliente:</span><span class="info-val">Carlos Eduardo da Silva</span></div>
            <div class="info-item"><span class="info-label">WhatsApp:</span><span class="info-val">+55 (35) 99887-7665</span></div>
            <div class="info-item"><span class="info-label">Corretor:</span><span class="info-val">Roger Vasques (CRECI 45.892-MG)</span></div>
            <div class="info-item"><span class="info-label">Imobiliária:</span><span class="info-val">EasyMob Imóveis Matriz</span></div>
          </div>

          <div class="info-card">
            <h3>Dados do Imóvel &bull; Visita</h3>
            <div class="info-item"><span class="info-label">Código / Título:</span><span class="info-val">LAIM-101 • Casa de Alto Padrão</span></div>
            <div class="info-item"><span class="info-label">Endereço:</span><span class="info-val">Rua das Acácias, 250 - Vila Pinto</span></div>
            <div class="info-item"><span class="info-label">Proprietário:</span><span class="info-val">Roberto Silveira Mendes</span></div>
            <div class="info-item"><span class="info-label">Data/Hora Visita:</span><span class="info-val">09/09/2026 às 15:30 (Confirmada)</span></div>
          </div>
        </div>

        <table class="logs-table">
          <thead>
            <tr>
              <th style="width: 75px;">Horário</th>
              <th style="width: 80px;">Emissor</th>
              <th>Registro da Conversa &bull; WhatsApp Auditado</th>
              <th style="width: 110px;">ID Transação Meta</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="time-col">08/09 14:00</td>
              <td><span class="badge-sis">SISTEMA</span></td>
              <td><strong>Disparo de Agendamento:</strong> Olá Carlos! Sua visita ao imóvel LAIM-101 foi confirmada para 09/09 às 15:30. Rota Google Maps: maps.app.goo.gl/v9...</td>
              <td class="meta-col">wamid.HBgL...045F12</td>
            </tr>
            <tr>
              <td class="time-col">08/09 14:12</td>
              <td><span class="badge-cli">CLIENTE</span></td>
              <td><strong>Confirmação de Presença:</strong> &quot;Confirmado! Estarei presente no horário com minha esposa.&quot; [Verificado ✓✓]</td>
              <td class="meta-col">wamid.HBgL...09AA11</td>
            </tr>
            <tr>
              <td class="time-col">08/09 14:15</td>
              <td><span class="badge-prop">PROPRIETÁRIO</span></td>
              <td><strong>Autorização de Entrada:</strong> &quot;Perfeito, visita autorizada. As chaves estarão na portaria.&quot;</td>
              <td class="meta-col">wamid.HBgL...9AA998</td>
            </tr>
            <tr>
              <td class="time-col">09/09 14:30</td>
              <td><span class="badge-sis">SISTEMA</span></td>
              <td><strong>Lembrete Preventivo (1h antes):</strong> Olá Carlos! Lembramos que sua visita começa em 1h. O corretor já está a caminho.</td>
              <td class="meta-col">wamid.HBgL...889977</td>
            </tr>
            <tr>
              <td class="time-col">09/09 15:25</td>
              <td><span class="badge-cli">CLIENTE</span></td>
              <td><strong>Chegada no Local:</strong> &quot;Estou no portão social.&quot; [Áudio de Atendimento Gravado • 18s]</td>
              <td class="meta-col">wamid.HBgL...80FFAB</td>
            </tr>
            <tr>
              <td class="time-col">09/09 16:40</td>
              <td><span class="badge-cor">CORRETOR</span></td>
              <td><strong>Pós-Visita Realizada:</strong> &quot;Visita concluída com sucesso. Cliente demonstrou alto interesse.&quot;</td>
              <td class="meta-col">wamid.HBgL...011223</td>
            </tr>
          </tbody>
        </table>

        <div class="legal-box">
          <strong>DECLARAÇÃO DE FÉ PÚBLICA E AMPARO JURÍDICO (ART. 727 DO CÓDIGO CIVIL):</strong><br>
          Certificamos que as comunicações e a aproximação útil entre as partes acima identificadas foram intermediadas pelo corretor responsável e registradas de forma imutável com data, hora e identificadores oficiais via Meta WhatsApp Cloud API.
        </div>

        <div class="footer">
          <div>Autenticação Digital: EasyMob Multi-Tenant Cloud Platform &bull; www.easymob.com.br</div>
          <div class="seal">✓ DOCUMENTO ASSINADO DIGITALMENTE</div>
        </div>
      </body>
      </html>
    `;

    // Salva o HTML temporário e faz a captura
    const scratchRelatorioPath = path.resolve(process.cwd(), 'scratch', 'relatorio_preview.html');
    fs.writeFileSync(scratchRelatorioPath, relatorioHtml, 'utf-8');

    await capturePage(
      `file://${scratchRelatorioPath}`,
      path.join(publicMockupsDir, 'mockup-relatorio-pdf.png'),
      800,
      760,
      2000
    );

    ws.close();
    console.log('\n✓ Todas as fotos da landing page foram atualizadas com sucesso em public/mockups!');
  } catch (err) {
    console.error('Erro na captura CDP:', err);
  } finally {
    edgeProcess.kill();
  }
}

captureMockups();

