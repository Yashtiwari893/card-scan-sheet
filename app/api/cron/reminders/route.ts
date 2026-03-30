import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Contact from '@/lib/db/models/Contact';
import User from '@/lib/db/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Basic Security (Optional but recommended)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your_default_secret_here';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    const ELEVENZA_API_KEY = process.env.ELEVENZA_API_KEY;

    if (!ELEVENZA_API_KEY) {
      throw new Error('ELEVENZA_API_KEY is not configured');
    }

    // Window logic: We calculate different time windows to see who needs a message.
    // For 15-minute cron interval, we look for meetings starting in specific ranges.
    
    // --- QUERY 1: 24-HOUR REMINDERS ---
    const dayAhead = new Date(now.getTime() + 24 * 60 * 60000);
    const dayAheadLimit = new Date(dayAhead.getTime() + 20 * 60000); // 20m window to ensure we catch everyone
    
    const contacts24h = await Contact.find({
      meetingScheduled: true,
      sent24hReminder: false,
      meetingTime: { $gte: dayAhead, $lte: dayAheadLimit }
    });

    for (const contact of contacts24h) {
      const user = await User.findById(contact.userId);
      await sendWhatsApp(contact.phone, `Reminder: You have a meeting with ${user?.name || 'our team'} in 24 hours! 📅\n\n⏰ Time: ${contact.meetingTime?.toLocaleTimeString('en-IN', { timeZone: user?.timezone || 'Asia/Kolkata', timeStyle: 'short' })}`, ELEVENZA_API_KEY);
      contact.sent24hReminder = true;
      await contact.save();
    }

    // --- QUERY 2: 1-HOUR REMINDERS ---
    const hourAhead = new Date(now.getTime() + 1 * 60 * 60000);
    const hourAheadLimit = new Date(hourAhead.getTime() + 20 * 60000);

    const contacts1h = await Contact.find({
      meetingScheduled: true,
      sent1hReminder: false,
      meetingTime: { $gte: hourAhead, $lte: hourAheadLimit }
    });

    for (const contact of contacts1h) {
      const user = await User.findById(contact.userId);
      await sendWhatsApp(contact.phone, `Heads up! Your meeting with ${user?.name || 'our team'} starts in 1 hour. Get ready! ⏰🤝`, ELEVENZA_API_KEY);
      contact.sent1hReminder = true;
      await contact.save();
    }

    // --- QUERY 3: START REMINDERS (Right Now) ---
    const contactsStart = await Contact.find({
      meetingScheduled: true,
      sentStartMessage: false,
      meetingTime: { $lte: now }
    });

    for (const contact of contactsStart) {
      const user = await User.findById(contact.userId);
      await sendWhatsApp(contact.phone, `The meeting with ${user?.name || 'our team'} is starting NOW! Join in. 🚀`, ELEVENZA_API_KEY);
      contact.sentStartMessage = true;
      await contact.save();
    }

    // --- QUERY 4: END MESSAGES (30 mins after start) ---
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60000);
    const contactsEnd = await Contact.find({
      meetingScheduled: true,
      sentEndMessage: false,
      meetingTime: { $lte: thirtyMinsAgo }
    });

    for (const contact of contactsEnd) {
      const user = await User.findById(contact.userId);
      await sendWhatsApp(contact.phone, `The meeting has ended. Hope it was productive! Thank you for connecting with ${user?.name || 'us'}. 🙏🤝`, ELEVENZA_API_KEY);
      contact.sentEndMessage = true;
      await contact.save();
    }

    return NextResponse.json({ 
      success: true, 
      processed: {
        reminders24h: contacts24h.length,
        reminders1h: contacts1h.length,
        startingNow: contactsStart.length,
        ended: contactsEnd.length
      }
    });

  } catch (error: any) {
    console.error('CRON Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function sendWhatsApp(phone: string | undefined, message: string, apiKey: string) {
  if (!phone) return;
  try {
    await fetch('https://app.11za.in/apis/messages/sendTemplateMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        phoneNumber: phone.replace(/\D/g, ''),
        message: message
      })
    });
  } catch (e: any) {
    console.error('Error sending WhatsApp in CRON:', e.message);
  }
}
