const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  const logs = [];
  page.on('console', (m) => logs.push(`[console.${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}\n${e.stack || ''}`));
  page.on('requestfailed', (r) =>
    logs.push(`[requestfailed] ${r.url()} :: ${r.failure()?.errorText}`)
  );
  page.on('response', (r) => {
    if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`);
  });

  try {
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (e) {
    logs.push(`[goto error] ${e.message}`);
  }

  await new Promise((r) => setTimeout(r, 2500));

  const rootHtml = await page.evaluate(() => {
    const el = document.getElementById('root');
    return el ? el.innerHTML.slice(0, 500) : 'NO #root';
  });

  console.log('=== CONSOLE / ERRORS ===');
  console.log(logs.join('\n') || '(none)');
  console.log('\n=== #root innerHTML (first 500 chars) ===');
  console.log(rootHtml);

  await browser.close();
})();
