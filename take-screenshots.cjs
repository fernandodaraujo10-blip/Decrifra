const puppeteer = require('puppeteer');
const path = require('path');
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2.77 };
const OUT = path.join(__dirname, 'public');
const BASE = 'http://localhost:3000';

async function shot(page, name, setup) {
  if (setup) await setup(page);
  await new Promise(r => setTimeout(r, 1800));
  await page.screenshot({ path: path.join(OUT, name), fullPage: false });
  console.log('✓ ' + name);
}
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=pt-BR']
  });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'pt-BR,pt;q=0.9' });
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 15000 });
  await shot(page, 'screenshot-mobile.png');
  await shot(page, 'screenshot-mobile-2.png', p =>
    p.evaluate(() => { const b = document.querySelectorAll('.nav-tab'); if(b[1]) b[1].click(); }));
  await shot(page, 'screenshot-mobile-3.png', p =>
    p.evaluate(() => { const b = document.querySelectorAll('.nav-tab'); if(b[4]) b[4].click(); }));
  await shot(page, 'screenshot-mobile-4.png', p =>
    p.evaluate(() => { const b = document.querySelectorAll('.nav-tab'); if(b[3]) b[3].click(); }));
  await browser.close();
  console.log('\n✅ 4 screenshots em public/');
})();
