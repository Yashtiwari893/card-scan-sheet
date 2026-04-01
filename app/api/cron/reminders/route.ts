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
    console.log(`[CRON] Run started at: ${now.toISOString()}`);
    
    const ELEVENZA_API_KEY = process.env.ELEVENZA_API_KEY;
    if (!ELEVENZA_API_KEY) {
      console.error('[CRON] ELEVENZA_API_KEY is missing in env');
      throw new Error('ELEVENZA_API_KEY is not configured');
    }

    // Window logic: 30-minute grace window for 15-min cron tasks
    const bufferRange = 30 * 60000; 

    // --- QUERY 1: 24-HOUR REMINDERS ---
    const dayAhead = new Date(now.getTime() + 24 * 60 * 60000);
    const dayAheadStart = new Date(dayAhead.getTime() - bufferRange);
    const dayAheadEnd = new Date(dayAhead.getTime() + bufferRange);
    
    const contacts24h = await Contact.find({
      meetingScheduled: true,
      sent24hReminder: false,
      meetingTime: { $gte: dayAheadStart, $lte: dayAheadEnd }
    });
    console.log(`[CRON] 24h Reminders found: ${contacts24h.length}`);

    for (const contact of contacts24h) {
      const user = await User.findById(contact.userId);
      const msg = `Reminder: You have a meeting with ${user?.name || 'our team'} in 24 hours! 📅\n\n⏰ Time: ${contact.meetingTime?.toLocaleTimeString('en-IN', { timeZone: user?.timezone || 'Asia/Kolkata', timeStyle: 'short' })}`;
      await sendWhatsApp(contact.phone, msg, ELEVENZA_API_KEY, '24h');
      contact.sent24hReminder = true;
      await contact.save();
    }

    // --- QUERY 2: 1-HOUR REMINDERS ---
    const hourAhead = new Date(now.getTime() + 1 * 60 * 60000);
    const hourAheadStart = new Date(hourAhead.getTime() - bufferRange);
    const hourAheadEnd = new Date(hourAhead.getTime() + bufferRange);

    const contacts1h = await Contact.find({
      meetingScheduled: true,
      sent1hReminder: false,
      meetingTime: { $gte: hourAheadStart, $lte: hourAheadEnd }
    });
    console.log(`[CRON] 1h Reminders found: ${contacts1h.length}`);

    for (const contact of contacts1h) {
      const user = await User.findById(contact.userId);
      const msg = `Heads up! Your meeting with ${user?.name || 'our team'} starts in 1 hour. Get ready! ⏰🤝`;
      await sendWhatsApp(contact.phone, msg, ELEVENZA_API_KEY, '1h');
      contact.sent1hReminder = true;
      await contact.save();
    }

    // --- QUERY 3: START REMINDERS ---
    const contactsStart = await Contact.find({
      meetingScheduled: true,
      sentStartMessage: false,
      meetingTime: { $lte: now, $gte: new Date(now.getTime() - bufferRange) }
    });
    console.log(`[CRON] Start Reminders found: ${contactsStart.length}`);

    for (const contact of contactsStart) {
      const user = await User.findById(contact.userId);
      const msg = `The meeting with ${user?.name || 'our team'} is starting NOW! Join in. 🚀`;
      await sendWhatsApp(contact.phone, msg, ELEVENZA_API_KEY, 'Start');
      contact.sentStartMessage = true;
      await contact.save();
    }

    // --- QUERY 4: END MESSAGES (30 mins after start) ---
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60000);
    const contactsEnd = await Contact.find({
      meetingScheduled: true,
      sentEndMessage: false,
      meetingTime: { $lte: thirtyMinsAgo, $gte: new Date(thirtyMinsAgo.getTime() - bufferRange) }
    });
    console.log(`[CRON] End Reminders found: ${contactsEnd.length}`);

    for (const contact of contactsEnd) {
      const user = await User.findById(contact.userId);
      const msg = `The meeting has ended. Hope it was productive! Thank you for connecting with ${user?.name || 'us'}. 🙏🤝`;
      await sendWhatsApp(contact.phone, msg, ELEVENZA_API_KEY, 'End');
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
    console.error('[CRON] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function sendWhatsApp(phone: string | undefined, message: string, apiKey: string, type: string) {
  if (!phone) {
    console.warn(`[CRON] No phone for contact, skipping ${type} message`);
    return;
  }
  try {
    const formattedPhone = phone.replace(/\D/g, '');
    console.log(`[CRON] Sending ${type} message to ${formattedPhone}`);
    
    const resp = await fetch('https://app.11za.in/apis/messages/sendTemplateMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        message: message
      })
    });
    
    const data = await resp.json();
    console.log(`[11za Response] ${type}:`, JSON.stringify(data));
  } catch (e: any) {
    console.error(`[CRON] Error sending WhatsApp (${type}):`, e.message);
  }
}

