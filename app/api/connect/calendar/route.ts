import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone');

  if (!phone) {
    return NextResponse.json({ error: 'phone required' }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI_CALENDAR || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/calendar-callback`
  );

  const setupUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: phone,
    prompt: 'consent',
  });

  return NextResponse.redirect(setupUrl);
}
