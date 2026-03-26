import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { google } from 'googleapis';

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
      process.env.GOOGLE_REDIRECT_URI_CALENDAR || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/calendar-callback`
    );
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
       throw new Error("Failed to get tokens from Google");
    }

    await User.findOneAndUpdate(
      { waPhone: phone },
      {
        googleCalendar: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
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
            message: `✅ *Google Calendar Connected Successfully!*\n\nAb se aap meetings schedule kar paoge and wo automatically aapke calendar mein add ho jaayengi 📅\n\nHappy Networking! 🤝\n\n_Reply *hi* to return to main menu_`
          })
        });
      } catch (waError: any) {
        console.error("WhatsApp notification error:", waError.message);
      }
    }

    return new NextResponse("✅ Google Calendar connected! You can close this tab.", { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

  } catch (error: any) {
    console.error("Calendar Callback Error:", error.message);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
