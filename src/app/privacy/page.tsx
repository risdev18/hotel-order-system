export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-300 p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-6">Privacy Policy</h1>
      <div className="space-y-4">
        <p>Effective Date: {new Date().toLocaleDateString()}</p>
        <p>This Privacy Policy describes how we collect, use, and handle your data when you use our restaurant ordering system.</p>
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
        <p>We may collect information about your order history, device information, and interaction with the menu.</p>
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
        <p>Your information is used solely to process your orders, improve the restaurant's services, and provide a seamless dining experience.</p>
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Data Security</h2>
        <p>We implement appropriate technical measures to protect the security of your personal information.</p>
      </div>
    </main>
  );
}
