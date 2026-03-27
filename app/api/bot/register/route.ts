import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

// Phone country code se timezone detect karna
function getTimezoneFromPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('91')) return 'Asia/Kolkata';        // India
  if (cleaned.startsWith('1')) return 'America/New_York';     // USA/Canada
  if (cleaned.startsWith('44')) return 'Europe/London';       // UK
  if (cleaned.startsWith('971')) return 'Asia/Dubai';         // UAE
  if (cleaned.startsWith('966')) return 'Asia/Riyadh';        // Saudi Arabia
  if (cleaned.startsWith('61')) return 'Australia/Sydney';    // Australia
  if (cleaned.startsWith('65')) return 'Asia/Singapore';      // Singapore
  if (cleaned.startsWith('60')) return 'Asia/Kuala_Lumpur';   // Malaysia
  if (cleaned.startsWith('92')) return 'Asia/Karachi';        // Pakistan
  if (cleaned.startsWith('880')) return 'Asia/Dhaka';         // Bangladesh
  if (cleaned.startsWith('49')) return 'Europe/Berlin';       // Germany
  if (cleaned.startsWith('33')) return 'Europe/Paris';        // France
  if (cleaned.startsWith('81')) return 'Asia/Tokyo';          // Japan
  if (cleaned.startsWith('86')) return 'Asia/Shanghai';       // China
  return 'Asia/Kolkata'; // Default fallback
}

export async function POST(req: NextRequest) {
  try {
    const { phone, email, name } = await req.json();

    if (!phone || !email) {
      return NextResponse.json({ error: 'Phone and Email are required' }, { status: 400 });
    }

    const timezone = getTimezoneFromPhone(phone);

    await dbConnect();
    const existingUser = await User.findOne({ waPhone: phone });

    if (existingUser) {
      existingUser.email = email;
      existingUser.name = name || existingUser.name;
      if (!existingUser.timezone) {
        existingUser.timezone = timezone; // Sirf tab set karo jab pehle se na ho
      }
      await existingUser.save();
      return NextResponse.json({ success: true, name: existingUser.name });
    }

    const newUser = await User.create({
      waPhone: phone,
      email: email,
      name: name || 'User',
      timezone: timezone,
    });

    return NextResponse.json({ success: true, name: newUser.name });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
