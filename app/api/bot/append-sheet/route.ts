import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Contact from '@/lib/db/models/Contact';
import { appendCardToSheet } from '@/lib/google/sheets';

export async function POST(req: NextRequest) {
  try {
    const { phone, contactId } = await req.json();

    if (!phone || !contactId) {
      return NextResponse.json({ error: 'Phone and contactId are required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ waPhone: phone });

    if (!user || !user.googleSheets?.connected || !user.googleSheets.sheetId) {
      return NextResponse.json({ success: false, error: 'Sheet not connected for this user' }, { status: 400 });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    // Append to sheet using stored tokens
    await appendCardToSheet(
      user.googleSheets.sheetId,
      user.googleSheets.accessToken!,
      user.googleSheets.refreshToken!,
      contact,
      user.timezone || 'Asia/Kolkata'
    );

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Manual Sync Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
