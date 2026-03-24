import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export function getAuthUrl(phone: string) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets'],
    state: phone,
    prompt: 'consent'
  });
}

export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function createScanSheet(accessToken: string, refreshToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: '11za-card-scans'
      }
    }
  });

  const spreadsheetId = response.data.spreadsheetId;

  // Add Headers
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId!,
    range: 'Sheet1!A1:J1', // Name, Company, Job Title, Email, Phone, Website, Address, LinkedIn, Scanned At, Remarks (Column J)
    valueInputOption: 'RAW',
    requestBody: {
      values: [['Name', 'Company', 'Job Title', 'Email', 'Phone', 'Website', 'Address', 'LinkedIn', 'Scanned At', 'Remarks']]
    }
  });

  return spreadsheetId;
}

export async function appendCardToSheet(spreadsheetId: string, accessToken: string, refreshToken: string, contact: any) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

  const sheets = google.sheets({ version: 'v4', auth });

  const values = [[
    contact.name || '',
    contact.company || '',
    contact.jobTitle || '',
    contact.email || '',
    contact.phone || '',
    contact.website || '',
    contact.address || '',
    contact.linkedin || '',
    contact.scannedAt ? new Date(contact.scannedAt).toISOString() : new Date().toISOString(),
    '' // Remarks (Column J) left empty for now
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A2',
    valueInputOption: 'RAW',
    requestBody: {
      values
    }
  });
}

/**
 * Updates the remark for the very last row in the user's Google Sheet.
 */
export async function updateCardRemarkInSheet(spreadsheetId: string, accessToken: string, refreshToken: string, remark: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

  const sheets = google.sheets({ version: 'v4', auth });

  // 1. Get the current sheet data to find the last row
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:A',
  });

  const lastRow = (res.data.values?.length || 0);
  if (lastRow < 2) return; // No data yet (only headers or empty)

  // 2. Update Column J for the last row
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Sheet1!J${lastRow}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[remark]]
    }
  });
}
