import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Contact from '@/lib/db/models/Contact';
import { extractBusinessCardDetails } from '@/lib/ai/gemini';
import { appendCardToSheet } from '@/lib/google/sheets';

export async function POST(req: NextRequest) {
  try {
    const { phone, imageUrl } = await req.json();

    if (!phone || !imageUrl) {
      return NextResponse.json({ error: 'Phone and imageUrl are required' }, { status: 400 });
    }

    await dbConnect();
    let user = await User.findOne({ waPhone: phone });

    // Ensure user exists
    if (!user) {
      user = await User.create({ waPhone: phone });
    }

    // Download image from URL as binary
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);
    const mimeType = response.headers['content-type'] || 'image/jpeg';

    // Extract details via Gemini Vision API
    const contactData = await extractBusinessCardDetails(imageBuffer, mimeType);

    // Save contact to DB
    const contact = await Contact.create({
      userId: user._id,
      imageUrl,
      ...contactData,
      scannedAt: new Date()
    });

    // Auto-sync to Google Sheet if connected
    if (user.google?.connected && user.google.sheetId && user.google.accessToken && user.google.refreshToken) {
      try {
        await appendCardToSheet(
          user.google.sheetId,
          user.google.accessToken,
          user.google.refreshToken,
          contact
        );
      } catch (sheetsError: any) {
        console.error("Auto-sync background error:", sheetsError.message);
      }
    }

    return NextResponse.json({
      success: true,
      contactId: contact._id,
      name: contactData.name || '',
      company: contactData.company || '',
      jobTitle: contactData.jobTitle || '',
      email: contactData.email || '',
      phone: contactData.phone || '',
      website: contactData.website || '',
      address: contactData.address || '',
      linkedin: contactData.linkedin || ''
    });

  } catch (error: any) {
    console.error("Scan API Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
