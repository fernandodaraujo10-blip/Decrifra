const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Dimensões Play Store: mínimo 320px, recomendado 1080x1920
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2.77 };
// Resulta em ~1080x2337 na captura — dentro do aceito pela Play Store

const OUT_DIR = path.join(__dirname, 'public');
const BASE_URL = 'http://localhost:3001';

async function shot(page, name, setup) {
  if (setup) await setup(page);
  await new Promise(r => setTimeout(r, 1200));
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`✓ ${name}`);
  return file;
}

(async () => {
  console.log('Iniciando capturas...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=pt-BR']
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'pt-BR,pt;q=0.9' });

  // ── Screenshot 1: Home ────────────────────────────────────────
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 });
  await shot(page, 'screenshot-mobile.png');

  // ── Screenshot 2: Filmes & Séries (aba movies_series) ────────
  await shot(page, 'screenshot-mobile-2.png', async (p) => {
    // Clica na aba Filmes (segundo item do bottom nav)
    await p.evaluate(() => {
      const buttons = document.querySelectorAll('.nav-tab');
      if (buttons[1]) buttons[1].click();
    });
  });

  // ── Screenshot 3: Loja (planos) ──────────────────────────────
  await shot(page, 'screenshot-mobile-3.png', async (p) => {
    await p.evaluate(() => {
      const buttons = document.querySelectorAll('.nav-tab');
      if (buttons[4]) buttons[4].click();
    });
  });

  // ── Screenshot 4: Músicas ────────────────────────────────────
  await shot(page, 'screenshot-mobile-4.png', async (p) => {
    await p.evaluate(() => {
      const buttons = document.querySelectorAll('.nav-tab');
      if (buttons[3]) buttons[3].click();
    });
  });

  await browser.close();

  console.log('\n✅ Screenshots salvas em /public/');
  console.log('   screenshot-mobile.png   → Home');
  console.log('   screenshot-mobile-2.png → Filmes & Séries');
  console.log('   screenshot-mobile-3.png → Loja / Planos');
  console.log('   screenshot-mobile-4.png → Músicas');
})();
