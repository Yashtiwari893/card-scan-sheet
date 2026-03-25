import { google } from 'googleapis';

/**
 * Creates a Google Calendar event.
 */
export async function createCalendarEvent(
  accessToken: string, 
  refreshToken: string, 
  contact: any, 
  meetingTime: Date
) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

  const calendar = google.calendar({ version: 'v3', auth });

  // Event starts at the picked time, lasts 30 mins by default
  const startTime = new Date(meetingTime);
  const endTime = new Date(startTime.getTime() + 30 * 60000);

  const event = {
    summary: `Meeting: ${contact.name || 'Client'}`,
    description: `Discussion regarding business card scan.
Contact: ${contact.name || 'N/A'}
Company: ${contact.company || 'N/A'}
Job Title: ${contact.jobTitle || 'N/A'}
Email: ${contact.email || 'N/A'}
Phone: ${contact.phone || 'N/A'}
Remark: ${contact.remark || 'N/A'}
Scheduled via BizSync AI`,
    start: {
      dateTime: startTime.toISOString(),
    },
    end: {
      dateTime: endTime.toISOString(),
    },
    attendees: contact.email && contact.email !== 'N/A' && contact.email.includes('@') 
      ? [{ email: contact.email }] 
      : [],
    reminders: {
      useDefault: true
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return response.data;
}
