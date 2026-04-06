import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Contact from '@/lib/db/models/Contact';
import User from '@/lib/db/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Basic Security (Optional but recommended)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'cronjobocr';

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
      const meetingTimeString = contact.meetingTime?.toLocaleString('en-IN', { timeZone: user?.timezone || 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) || '';
      
      const variables = [
        contact.name || 'Client', 
        user?.name || 'Our Team', 
        meetingTimeString
      ];

      await sendTemplate(contact.phone, 'meeting_reminder', variables, ELEVENZA_API_KEY, contact.name);
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
      const meetingTimeString = contact.meetingTime?.toLocaleTimeString('en-IN', { timeZone: user?.timezone || 'Asia/Kolkata', timeStyle: 'short' }) || '';

      const variables = [
        contact.name || 'Client', 
        user?.name || 'Our Team', 
        meetingTimeString
      ];

      await sendTemplate(contact.phone, 'meeting_reminder_1', variables, ELEVENZA_API_KEY, contact.name);
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
      const variables = [
        contact.name || 'Client', 
        user?.name || 'Our Team'
      ];

      await sendTemplate(contact.phone, 'meeting_start_reminder', variables, ELEVENZA_API_KEY, contact.name);
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

    for (const contact of contactsEnd) {
      // Logic for end message (simple flag update for now)
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

/**
 * Sends a generic template via 11za API
 */
async function sendTemplate(phone: string | undefined, templateName: string, variables: string[], apiKey: string, contactName?: string) {
  if (!phone) {
    console.warn(`[CRON] No phone for contact, skipping ${templateName}`);
    return;
  }
  try {
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 10) formattedPhone = '91' + formattedPhone;

    console.log(`[CRON] Sending ${templateName} to ${formattedPhone}`);
    
    const resp = await fetch('https://api.11za.in/apis/template/sendTemplate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        authToken: apiKey,
        sendto: formattedPhone,
        name: contactName || 'Customer',
        originWebsite: 'www.displ.in',
        templateName: templateName,
        language: 'en',
        data: variables
      })
    });
    
    const data = await resp.json();
    console.log(`[11za Response] ${templateName}:`, JSON.stringify(data));
  } catch (e: any) {
    console.error(`[CRON] Error sending ${templateName}:`, e.message);
  }
}
