import { chromium } from 'playwright';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const COOKIE_FILE = 'twitter-auth.json';

const DELAY = (min, max) =>
  new Promise(res => setTimeout(res, Math.floor(Math.random() * (max - min) + min)));

// Autenticação Google
async function authorizeGoogle() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return await auth.getClient();
}

// Lê os links válidos da planilha
async function readLinks(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Controle!A2:AA',
  });

  return res.data.values
    .map((row, i) => ({
      rowIndex: i + 2,
      link: row[26],     // Coluna AA
      check: row[2],    // Coluna C
    }))
    .filter(r =>
      r.rowIndex >= 417 && // filtro de linhas
      r.link &&
      r.check &&
      r.check.toUpperCase() === 'NAO'
    )
    .slice(0, 100); // limite de resultados
}

function formatarDataHora() {
  const now = new Date();
  return now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// Marca como respondido nas colunas C e D
async function markAsResponded(auth, rowIndex) {
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Controle!C${rowIndex}:D${rowIndex}`, // C e D na mesma linha
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        'Respondido via Playwright',
        formatarDataHora()
      ]]
    },
  });
}

// Envia o tweet via botão ou fallback
async function sendTweet(page) {
  await DELAY(2000, 5000);

  try {
    await page.click('button[data-testid="tweetButton"]');
    console.log('✅ Tweet enviado via botão');
  } catch {
    console.warn('⚠️ Botão não encontrado, usando fallback Ctrl+Enter');
    await page.keyboard.press('Control+Enter');
  }

  await DELAY(3000, 5000);
}

// Verifica se foi carregado o modal de resposta corretamente
async function isReplyLoaded(page) {
  try {
    await page.waitForSelector('div[aria-labelledby="modal-header"]', {
      timeout: 10000,
    });
    return true;
  } catch {
    return false;
  }
}


// Ação principal de resposta
async function replyTweet(context, link) {
  const page = await context.newPage();
  try {
    await page.goto(link.link, { timeout: 30000, waitUntil: 'load' });

    // Aguarda renderização total dos componentes por segurança
    await DELAY(2000, 4000);

    // Verifica o componente de resposta da sessão
    const loaded = await isReplyLoaded(page);
    if (!loaded) {
      console.error('🔒 Resposta inválida! Por algum motivo o modal de reply não carregou corretamente');
      await page.close();
      return false;
    }


    await sendTweet(page);
    await page.close();
    return true;
  } catch (err) {
    console.error(`❌ Erro ao responder: ${link.link}`, err);
    await page.close();
    return false;
  }
}

// Rodar o processo completo
(async () => {
  const auth = await authorizeGoogle();
  const links = await readLinks(auth);
  const browser = await chromium.launch({ headless: false });
  let context;

  try {
    const storage = await fs.readFile(COOKIE_FILE, 'utf-8');
    context = await browser.newContext({ storageState: JSON.parse(storage) });
    console.log('🔓 Sessão carregada de twitter-auth.json');
  } catch {
    console.error('❌ Nenhum login detectado! Execute primeiro: node bot/save-cookies.js');
    await browser.close();
    process.exit(1);
  }

  for (const link of links) {
    console.log(`🔁 Processando linha ${link.rowIndex}`);
    const ok = await replyTweet(context, link);
    if (ok) {
      await markAsResponded(auth, link.rowIndex);
      console.log(`✅ Respondido (linha ${link.rowIndex})`);
    } else {
      console.log(`⚠️ Falha ao responder (linha ${link.rowIndex}`);
    }
    await DELAY(3000, 8000);
  }

  await browser.close();
})();
