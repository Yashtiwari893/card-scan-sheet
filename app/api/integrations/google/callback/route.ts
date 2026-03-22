import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { google } from 'googleapis';
import { createScanSheet } from '@/lib/google/sheets';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const phone = searchParams.get('state');

  if (!code || !phone) {
    return new NextResponse("Invalid callback parameters", { status: 400 });
  }

  try {
    await dbConnect();
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const { tokens } = await oauth2Client.getToken(code);


    if (!tokens.access_token || !tokens.refresh_token) {
       throw new Error("Failed to get tokens from Google");
    }

    const spreadsheetId = await createScanSheet(tokens.access_token, tokens.refresh_token);

    await User.findOneAndUpdate(
      { waPhone: phone },
      {
        google: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          sheetId: spreadsheetId,
          connected: true,
        },
      },
      { upsert: true }
    );

    // Send WhatsApp Confirmation using 11za API
    const ELEVENZA_API_KEY = process.env.ELEVENZA_API_KEY;
    if (ELEVENZA_API_KEY) {
      try {
        await fetch(`https://app.11za.in/apis/messages/sendTemplateMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ELEVENZA_API_KEY}`
          },
          body: JSON.stringify({
            phoneNumber: phone,
            message: `✅ *Google Sheet Connected Successfully!*\n\nAb se jo bhi business card scan karoge, uska data automatically tumhari Google Sheet mein save hota rahega 🎉\n\nHappy Networking! 🤝\n\n_Reply *hi* to scan a card_`
          })
        });
      } catch (waError: any) {
        console.error("WhatsApp notification error:", waError.message);
      }
    }


    return new NextResponse("✅ Google Sheet connected! You can close this tab.", { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

  } catch (error: any) {
    console.error("Callback Error:", error.message);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
