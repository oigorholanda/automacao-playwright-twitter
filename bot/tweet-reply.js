import { chromium } from 'playwright';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const DELAY = (min, max) => new Promise(res => setTimeout(res, Math.floor(Math.random() * (max - min) + min)));

// Google Sheets Auth
async function authorizeGoogle() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return await auth.getClient();
}

// Lê os links da planilha
async function readLinks(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Envio Plyright - igor!A2:K',
  });

  return res.data.values
    .map((row, i) => ({
      link: row[6],        // Coluna G
      check: row[7],       // Coluna H
      rowIndex: i + 2,     // índice da linha real
    }))
    .filter(r => r.link && (!r.check || r.check.toUpperCase() !== 'TRUE'));
}

// Marca como respondido na coluna K
async function markAsResponded(auth, rowIndex) {
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Envio Plyright - igor!K${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['Respondido via Playwright']] },
  });
}

// Ação principal de reply via Playwright
async function replyTweet(browser, link) {
  const page = await browser.newPage();
  try {
    await page.goto('https://twitter.com/login');
    await page.waitForTimeout(2000);
    await page.fill('input[name="text"]', process.env.TWITTER_USER);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    await page.fill('input[name="password"]', process.env.TWITTER_PASS);
    await page.keyboard.press('Enter');

    await page.waitForLoadState('networkidle', { timeout: 15000 });

    await DELAY(2000, 4000);
    await page.goto(link.link, { timeout: 30000, waitUntil: 'load' });

    await DELAY(2000, 5000);
    await page.click('div[aria-label="Tweet"]');
    await DELAY(1000, 3000);
    await page.keyboard.press('Control+Enter');

    await DELAY(3000, 5000);
    await page.close();
    return true;
  } catch (err) {
    console.error(`Erro ao responder ${link.link}`, err);
    await page.close();
    return false;
  }
}

// Roda o processo completo
(async () => {
  const auth = await authorizeGoogle();
  const links = await readLinks(auth);
  const browser = await chromium.launch({ headless: false });

  for (const link of links) {
    console.log(`🔁 Processando linha ${link.rowIndex}:`, link.link);
    const ok = await replyTweet(browser, link);
    if (ok) {
      await markAsResponded(auth, link.rowIndex);
      console.log(`✅ Respondido (linha ${link.rowIndex})`);
    } else {
      console.log(`⚠️ Pulado (erro ao enviar reply)`);
    }
    await DELAY(3000, 8000);
  }

  await browser.close();
})();
