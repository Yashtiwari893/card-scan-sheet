import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Contact from '@/lib/db/models/Contact';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await dbConnect();
    const contact = await Contact.findById(id);

    if (!contact) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      contact: {
        name: contact.name,
        company: contact.company,
        email: contact.email,
        phone: contact.phone,
        jobTitle: contact.jobTitle,
        remark: contact.remark
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
