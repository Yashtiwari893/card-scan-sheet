export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 font-sans text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy — 11za AI</h1>
      <p className="text-gray-500 mb-8 italic">Last updated: March 22, 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
        <p>
          11za AI collects your WhatsApp phone number and email address when you register. 
          When you scan a business card, we collect the extracted contact information 
          (name, company, email, phone, address, website, LinkedIn).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>To identify your account using your WhatsApp number</li>
          <li>To extract and save business card data on your behalf</li>
          <li>To sync your scanned contacts to your connected Google Sheet</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Google Account Access</h2>
        <p>
          When you connect Google Sheets, we request access only to your Google Spreadsheets. 
          We do not access your Gmail, Google Drive files, or any other Google services. 
          You can revoke access anytime from your Google Account settings at{' '}
          <a href="https://myaccount.google.com/permissions" className="text-blue-600 hover:underline">
            myaccount.google.com/permissions
          </a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Data Storage</h2>
        <p>
          Your data is stored securely in our database. We do not sell, share, or disclose 
          your personal information to any third party.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Data Deletion</h2>
        <p>
          To delete your data, contact us at{' '}
          <a href="mailto:support@11za.in" className="text-blue-600 hover:underline">
            support@11za.in
          </a>. We will remove all your data within 7 business days.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Contact</h2>
        <p>
          For any privacy-related questions, email us at{' '}
          <a href="mailto:support@11za.in" className="text-blue-600 hover:underline">
            support@11za.in
          </a>
        </p>
      </section>

      <footer className="mt-12 pt-8 border-t border-gray-100 text-center">
        <a href="/" className="text-blue-600 hover:underline">Back to Home</a>
      </footer>
    </div>
  );
}
