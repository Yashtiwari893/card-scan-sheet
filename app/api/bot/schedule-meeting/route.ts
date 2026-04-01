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

    const userTimezone = user.timezone || 'Asia/Kolkata';

    if (user.googleCalendar?.connected && user.googleCalendar.accessToken && user.googleCalendar.refreshToken) {
      try {
        const event = await createCalendarEvent(
          user.googleCalendar.accessToken,
          user.googleCalendar.refreshToken,
          contact,
          meetingDate,
          userTimezone  // User ka local timezone pass kar rahe hain
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
    // Reset flags in case user re-schedules
    contact.sentConfirmation = false;
    contact.sent24hReminder = false;
    contact.sent1hReminder = false;
    contact.sentStartMessage = false;
    contact.sentEndMessage = false;
    await contact.save();

    const ELEVENZA_API_KEY = process.env.ELEVENZA_API_KEY;

    // 4. Send WhatsApp Confirmation to Owner (User)
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
            message: `🗓️ *Meeting Scheduled!*\n\n🤝 *Client:* ${contact.name || 'N/A'}\n🏢 *Company:* ${contact.company || 'N/A'}\n📅 *Date:* ${meetingDate.toLocaleDateString('en-IN', { timeZone: userTimezone, dateStyle: 'full' })}\n⏰ *Time:* ${meetingDate.toLocaleTimeString('en-IN', { timeZone: userTimezone, timeStyle: 'short' })}\n\n✅ Google Calendar event created successfully.`
          })
        });
      } catch (waError: any) {
        console.error("WhatsApp notification error (Owner):", waError.message);
      }
    }

    // 5. Send WhatsApp Template Message to Client (The Person meeting is with)
    if (ELEVENZA_API_KEY && contact.phone) {
      try {
        const clientPhone = contact.phone;
        const userTimezone = user.timezone || 'Asia/Kolkata';

        // Formatting meeting time for the template
        const formattedDate = meetingDate.toLocaleDateString('en-IN', { timeZone: userTimezone, dateStyle: 'medium' });
        const formattedTime = meetingDate.toLocaleTimeString('en-IN', { timeZone: userTimezone, timeStyle: 'short' });
        const meetingTimeString = `${formattedDate} at ${formattedTime}`;

        console.log(`[SCHEDULE] Sending 'ocr_meeting' template via sendTemplate API to: ${clientPhone}`);

        // Using FormData for multipart/form-data as per the CURL example
        const formData = new FormData();
        formData.append('authToken', ELEVENZA_API_KEY); // AUTH_TOKEN as parameter
        formData.append('sendto', clientPhone);
        formData.append('originWebsite', 'https://www.displ.in/');
        formData.append('templateName', 'ocr_meeting');
        formData.append('language', 'en');

        // Dynamic variables (comma-separated string for 'data' field)
        const variableData = [
          contact.name || 'Client',      // {{name}}
          user.name || 'Our Team',       // {{your_name}}
          meetingTimeString,             // {{meeting_time}}
          user.waPhone || 'N/A',         // {{your_phone}}
          user.email || 'N/A'            // {{your_email}}
        ].join(',');

        formData.append('data', variableData);

        const response = await fetch(`https://app.11za.in/apis/template/sendTemplate`, {
          method: 'POST',
          // Note: Browser/Native fetch handles 'Content-Type' automatically for FormData
          body: formData
        });

        const responseText = await response.text();
        console.log(`[11za Raw Response]:`, responseText);

        if (response.ok) {
          contact.sentConfirmation = true;
          await contact.save();
        }
      } catch (waError: any) {
        console.error("WhatsApp notification error (11za Template):", waError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Meeting scheduled successfully with professional 11za template',
      calendarEventUrl
    });

  } catch (error: any) {
    console.error("Schedule Meeting API Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
