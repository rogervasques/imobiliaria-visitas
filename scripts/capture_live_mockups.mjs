import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const publicMockupsDir = path.resolve(process.cwd(), 'public', 'mockups');
if (!fs.existsSync(publicMockupsDir)) {
  fs.mkdirSync(publicMockupsDir, { recursive: true });
}

// Helper para executar comandos do Edge headless
function takeScreenshot(url, outputPath, width = 1440, height = 900) {
  return new Promise((resolve, reject) => {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const args = [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      `--window-size=${width},${height}`,
      `--screenshot=${outputPath}`,
      url
    ];

    const child = spawn(edgePath, args);
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✓ Screenshot salvo: ${path.basename(outputPath)} (${width}x${height})`);
        resolve(outputPath);
      } else {
        reject(new Error(`Edge exited with code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

async function run() {
  console.log('Iniciando captura das telas ao vivo da plataforma...');

  try {
    // 1. Dashboard Principal (Hero)
    const dashboardOut = path.join(publicMockupsDir, 'mockup-dashboard.png');
    await takeScreenshot('http://localhost:3000/dashboard', dashboardOut, 1440, 800);

    // 2. Ficha Pública do Imóvel (Mobile 390x844)
    const mobileOut = path.join(publicMockupsDir, 'mockup-ficha-publica.png');
    await takeScreenshot('http://localhost:3000/p/imovel-1', mobileOut, 390, 844);

    // 3. Agenda / Visitas
    const agendaOut = path.join(publicMockupsDir, 'mockup-regua-visitas.png');
    await takeScreenshot('http://localhost:3000/agenda', agendaOut, 1440, 900);

    // 4. Clientes / CRM Match
    const clientesOut = path.join(publicMockupsDir, 'mockup-match-imoveis.png');
    await takeScreenshot('http://localhost:3000/clientes', clientesOut, 1440, 900);

    console.log('Todas as capturas foram concluídas e salvas em public/mockups!');
  } catch (err) {
    console.error('Erro na captura:', err.message);
  }
}

run();
