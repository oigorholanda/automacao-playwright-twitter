import { chromium } from 'playwright';
import fs from 'fs/promises';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://twitter.com/login');
  console.log('Realize o login manualmente. Feche a aba quando terminar.');

  page.once('close', async () => {
    const storage = await context.storageState();
    await fs.writeFile('twitter-auth.json', JSON.stringify(storage));
    console.log('✅ Sessão salva em twitter-auth.json');
    await browser.close();
  });
})();
