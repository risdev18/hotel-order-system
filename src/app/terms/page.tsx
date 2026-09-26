export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-300 p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-6">Terms & Conditions</h1>
      <div className="space-y-4">
        <p>Effective Date: {new Date().toLocaleDateString()}</p>
        <p>By using this service, you agree to comply with and be bound by the following terms and conditions.</p>
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Use of Service</h2>
        <p>You agree to use this platform only for viewing menus and placing legitimate orders at the restaurant.</p>
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Pricing and Availability</h2>
        <p>All prices and item availability are subject to change without notice. The restaurant reserves the right to reject or modify orders.</p>
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Limitation of Liability</h2>
        <p>We are not liable for any direct, indirect, incidental, or consequential damages arising from the use of this service.</p>
      </div>
    </main>
  );
}
