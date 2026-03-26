import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Contact from '@/lib/db/models/Contact';
import { createCalendarEvent } from '@/lib/google/calendar';
import { updateCardMeetingInSheet } from '@/lib/google/sheets';

export async function POST(req: NextRequest) {
  try {
    const { contactId, dateTime } = await req.json();

    if (!contactId || !dateTime) {
      return NextResponse.json({ error: 'contactId and dateTime are required' }, { status: 400 });
    }

    await dbConnect();
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const user = await User.findById(contact.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const meetingDate = new Date(dateTime);

    // 1. Create Google Calendar Event
    let calendarEventUrl = '';
    let calendarError = null;
    
    if (user.googleCalendar?.connected && user.googleCalendar.accessToken && user.googleCalendar.refreshToken) {
      try {
        const event = await createCalendarEvent(
          user.googleCalendar.accessToken,
          user.googleCalendar.refreshToken,
          contact,
          meetingDate
        );
        calendarEventUrl = event.htmlLink || '';
      } catch (calError: any) {
        console.error("Calendar sync error detail:", calError.response?.data || calError.message);
        calendarError = calError.response?.data?.error?.message || calError.message;
      }
    } else {
      calendarError = "Google Calendar not connected or tokens missing.";
    }

    // 2. Sync to Google Sheet (Column K) if possible
    if (user.googleSheets?.connected && user.googleSheets.sheetId && user.googleSheets.accessToken) {
       try {
         await updateCardMeetingInSheet(
           user.googleSheets.sheetId,
           user.googleSheets.accessToken,
           user.googleSheets.refreshToken || '',
           meetingDate.toLocaleString('en-IN')
         );
       } catch (sheetsError: any) {
         console.error("Sheet sync error:", sheetsError.message);
       }
    }

    if (calendarError && !calendarEventUrl) {
        return NextResponse.json({ 
            success: false, 
            error: `Calendar Error: ${calendarError}. Please try reconnecting your Google account.` 
        }, { status: 500 });
    }

    // 3. Update Database
    contact.meetingTime = meetingDate;
    contact.meetingScheduled = true;
    await contact.save();

    // 4. Send WhatsApp Confirmation
    const ELEVENZA_API_KEY = process.env.ELEVENZA_API_KEY;
    if (ELEVENZA_API_KEY && user.waPhone) {
      try {
        await fetch(`https://app.11za.in/apis/messages/sendTemplateMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ELEVENZA_API_KEY}`
          },
          body: JSON.stringify({
            phoneNumber: user.waPhone,
            message: `🗓️ *Meeting Scheduled!*\n\n🤝 *Client:* ${contact.name || 'N/A'}\n🏢 *Company:* ${contact.company || 'N/A'}\n📅 *Date:* ${meetingDate.toLocaleDateString('en-IN')}\n⏰ *Time:* ${meetingDate.toLocaleTimeString('en-IN')}\n\n✅ Google Calendar event created successfully.`
          })
        });
      } catch (waError: any) {
        console.error("WhatsApp notification error:", waError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Meeting scheduled successfully',
      calendarEventUrl
    });

  } catch (error: any) {
    console.error("Schedule Meeting API Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
