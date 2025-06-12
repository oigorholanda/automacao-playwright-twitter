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
    range: 'Envio Plyright - igor!G2:H',
  });

  return res.data.values
    .map((row, i) => ({ url: row[0], status: row[1], index: i + 2 }))
    .filter(r => !r.status || r.status !== true);
}

// Atualiza a planilha com status
async function markAsResponded(auth, row) {
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Envio Plyright - igor!K${row}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['Respondido via Playwright']] },
  });
}

// Ação principal com Playwright
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

    await page.waitForNavigation({ timeout: 15000 });

    await DELAY(2000, 4000);
    await page.goto(link.url, { timeout: 30000, waitUntil: 'load' });

    await DELAY(2000, 5000);
    await page.click('div[aria-label="Tweet"]');
    await DELAY(1000, 3000);
    await page.keyboard.press('Control+Enter');

    await DELAY(3000, 5000);
    await page.close();
    return true;
  } catch (err) {
    console.error(`Erro ao responder ${link.url}`, err);
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
    console.log('Processando:', link.url);
    const ok = await replyTweet(browser, link);
    if (ok) await markAsResponded(auth, link.index);
    await DELAY(3000, 8000);
  }

  await browser.close();
})();
