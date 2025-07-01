import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

async function authorizeGoogle() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return await auth.getClient();
}

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
      r.rowIndex >= 417 && // ignora linhas antes da digitada
      r.link &&
      r.check &&
      r.check.toUpperCase() === 'NAO'
    )
}

(async () => {
  try {
    const auth = await authorizeGoogle();
    const links = await readLinks(auth);
    console.log('✅ Links válidos encontrados:', links.length);
    console.table(links.slice(0, 10)); // Exibe os primeiros 10 links para validação
  } catch (err) {
    console.error('❌ Erro ao acessar Google Sheets:', err.message);
  }
})();
