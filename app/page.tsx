export default function HomePage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>11za - Only G-Sheet Backend</h1>
      <p>The backend APIs for WhatsApp Business Card Scanning are ready.</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>✅ Check User Status: <code>/api/bot/check-user</code></li>
        <li>✅ User Registration: <code>/api/bot/register</code></li>
        <li>✅ Card Scanning: <code>/api/bot/scan-card</code></li>
        <li>✅ Sheet Setup: <code>/api/bot/setup/sheets</code></li>
      </ul>
    </div>
  );
}
