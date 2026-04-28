const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

  await page.goto('http://localhost:3002/');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.nav-tab');
      if (tabs.length > 1) tabs[1].click();
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const matrix = btns.find(b => b.textContent.includes('Matrix'));
      if (matrix) matrix.click();
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const interpretar = btns.find(b => b.textContent.includes('INTERPRETAR AGORA'));
      if (interpretar) interpretar.click();
    });
    
    // Check for details element periodically
    let detailsText = null;
    for (let i = 0; i < 40; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      detailsText = await page.evaluate(() => {
        const d = document.querySelector('details');
        return d ? d.innerText : null;
      });
      if (detailsText) break;
    }
    
    console.log("ERROR BOUNDARY DETAILS:", detailsText || "No Error Boundary Appeared");
    
  } catch (e) {
    console.log('Script error:', e.message);
  }

  await browser.close();
})();
