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
    range: 'Envio Plyright - igor!A2:K',
  });

  return res.data.values
    .map((row, i) => ({
      rowIndex: i + 2,
      link: row[6],     // Coluna G
      check: row[7],    // Coluna H
    }))
    .filter(r => r.link && (!r.check || r.check.toUpperCase() !== 'TRUE'));
}

(async () => {
  try {
    const auth = await authorizeGoogle();
    const links = await readLinks(auth);
    console.log('✅ Links válidos encontrados:', links.length);
    console.table(links);
  } catch (err) {
    console.error('❌ Erro ao acessar Google Sheets:', err.message);
  }
})();
