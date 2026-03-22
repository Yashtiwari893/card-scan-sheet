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
        title: 'Card Scans'
      }
    }
  });

  const spreadsheetId = response.data.spreadsheetId;

  // Add Headers
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId!,
    range: 'Sheet1!A1:I1', // Name, Company, Job Title, Email, Phone, Website, Address, LinkedIn, Scanned At
    valueInputOption: 'RAW',
    requestBody: {
      values: [['Name', 'Company', 'Job Title', 'Email', 'Phone', 'Website', 'Address', 'LinkedIn', 'Scanned At']]
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
    contact.scannedAt || new Date().toISOString()
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
