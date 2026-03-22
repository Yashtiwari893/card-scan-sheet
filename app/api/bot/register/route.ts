import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export async function POST(req: NextRequest) {
  try {
    const { phone, email, name } = await req.json();

    if (!phone || !email) {
      return NextResponse.json({ error: 'Phone and Email are required' }, { status: 400 });
    }

    await dbConnect();
    const existingUser = await User.findOne({ waPhone: phone });

    if (existingUser) {
      existingUser.email = email;
      existingUser.name = name || existingUser.name;
      await existingUser.save();
      return NextResponse.json({ success: true, name: existingUser.name });
    }

    const newUser = await User.create({
      waPhone: phone,
      email: email,
      name: name || 'User'
    });

    return NextResponse.json({ success: true, name: newUser.name });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
