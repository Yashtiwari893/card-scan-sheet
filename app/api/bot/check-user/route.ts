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
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      name: user.name || '',
      sheetsConnected: user.google?.connected || false
    });
  } catch (error: any) {
    return NextResponse.json({ exists: false, error: error.message }, { status: 500 });
  }
}
