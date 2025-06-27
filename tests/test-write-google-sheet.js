// test-write-google-sheet.mjs
import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;


async function authorizeGoogle() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return await auth.getClient();
}

async function markAsResponded(auth, rowIndex) {
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Controle!C${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['Respondido via Playwright']] },
  });
  console.log(`✅ Linha ${rowIndex} atualizada com sucesso`);
}

const rowToTest = 342; // 🧪 Altere conforme necessário

authorizeGoogle()
  .then(auth => markAsResponded(auth, rowToTest))
  .catch(err => console.error('❌ Erro ao atualizar planilha:', err.message));
