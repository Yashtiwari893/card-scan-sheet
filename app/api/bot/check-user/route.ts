import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ waPhone: phone });

    if (!user) {
      console.log(`[Check User] NOT FOUND: ${phone}`);
      return NextResponse.json({ exists: "false" });
    }

    console.log(`[Check User] FOUND: ${phone}, Name: ${user.name}`);

    return NextResponse.json({
      exists: "true",
      name: user.name || 'User',
      sheetsConnected: user.googleSheets?.connected ? "true" : "false",
      calendarConnected: user.googleCalendar?.connected ? "true" : "false"
    });
  } catch (error: any) {
    console.error("[Check User Error]", error.message);
    return NextResponse.json({ exists: "false", error: error.message }, { status: 500 });
  }
}
