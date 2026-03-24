import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Contact from '@/lib/db/models/Contact';
import { transcribeAudio } from '@/lib/ai/aiRouter';
import { updateCardRemarkInSheet } from '@/lib/google/sheets';

export async function POST(req: NextRequest) {
  try {
    const { phone, remarkText, audioUrl } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ waPhone: phone });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let finalRemark = remarkText || '';

    // 1. Handle Audio Transcription if needed
    if (audioUrl) {
      console.log('Transcribing remark audio...');
      const transcribedText = await transcribeAudio(audioUrl);
      finalRemark = transcribedText || finalRemark;
    }

    if (!finalRemark) {
      return NextResponse.json({ error: 'Remark text or audio is required' }, { status: 400 });
    }

    // 2. Find the latest contact for this user
    const latestContact = await Contact.findOne({ userId: user._id }).sort({ scannedAt: -1 });

    if (!latestContact) {
      return NextResponse.json({ error: 'No scans found to add remark to' }, { status: 404 });
    }

    // 3. Update MongoDB
    latestContact.remark = finalRemark;
    await latestContact.save();

    console.log('Remark saved to DB:', finalRemark);

    // 4. Sync to Google Sheet
    if (user.google?.connected && user.google.sheetId && user.google.accessToken && user.google.refreshToken) {
      try {
        await updateCardRemarkInSheet(
          user.google.sheetId,
          user.google.accessToken,
          user.google.refreshToken,
          finalRemark
        );
        console.log('Remark synced to Google Sheet');
      } catch (sheetsError: any) {
        console.error("Sheet sync error:", sheetsError.message);
      }
    }

    return NextResponse.json({
      success: true,
      remark: finalRemark,
      contactId: latestContact._id
    });

  } catch (error: any) {
    console.error("Add Remark API Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
