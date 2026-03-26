import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'phone required' }, { status: 400 });
    }

    // Return a clean, professional redirect URL for calendar setup
    const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://card-scan-sheet-w8yl.vercel.app'}/api/connect/calendar?phone=${phone}`;

    return NextResponse.json({ setupUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
