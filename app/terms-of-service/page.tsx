export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 font-sans text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Terms of Service — 11za AI</h1>
      <p className="text-gray-500 mb-8 italic">Last updated: March 22, 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Acceptance</h2>
        <p>
          By using 11za AI, you agree to these terms. If you do not agree, please do not use the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
        <p>
          11za AI is a WhatsApp-based business card scanning tool that extracts contact information 
          from business card images and optionally syncs the data to your Google Sheet.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>You are responsible for the accuracy of cards you scan</li>
          <li>You must not scan cards without the consent of the card owner</li>
          <li>You must not use this service for any unlawful purpose</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Google Sheets Integration</h2>
        <p>
          When you connect your Google account, you authorize 11za AI to append contact data to your 
          selected Google Sheet. You can disconnect this at any time.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
        <p>
          11za AI is provided "as is." We are not responsible for any inaccuracies in extracted 
          card data or any loss of data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Changes to Terms</h2>
        <p>
          We may update these terms at any time. Continued use of the service means you accept the updated terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
        <p>
          For any questions, email us at{' '}
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
