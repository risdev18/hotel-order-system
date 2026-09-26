import Link from "next/link";
import { UtensilsCrossed, ArrowRight, ChefHat, QrCode } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#cda661]/30 font-sans relative overflow-hidden">
      {/* Background Image from first photo */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />
      {/* Gradient overlay to make text readable and blend into dark background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-[#0a0a0a]/80 to-[#0a0a0a] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#cda661] rounded-xl flex items-center justify-center shadow-lg shadow-[#cda661]/20">
              <UtensilsCrossed size={20} className="text-black" />
            </div>
            <span className="text-xl font-serif tracking-wide text-[#f5f5f5]">The Royal Dhaba</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/superadmin" 
              className="text-sm font-semibold text-[#a8a8a8] hover:text-[#cda661] transition-colors"
            >
              App Owner Login
            </Link>
            <Link 
              href="/admin" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#cda661]/10 border border-[#cda661]/20 hover:bg-[#cda661]/20 hover:border-[#cda661]/40 transition-all text-sm font-semibold text-[#cda661]"
            >
              <ChefHat size={16} />
              Restaurant Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#cda661]/10 border border-[#cda661]/20 text-[#cda661] font-medium text-sm mb-8">
          <SparklesIcon className="w-4 h-4" /> Smart Restaurant System
        </div>
        
        <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight tracking-tight text-white">
          Your next great <br/>
          <span className="text-[#cda661]">
            meal starts here.
          </span>
        </h1>
        
        <p className="text-[#a8a8a8] text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          The complete digital ecosystem for your restaurant. Just scan the QR code on your table to view the beautiful interactive menu and place orders instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
          <Link 
            href="/admin"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#cda661] text-black font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#ebd59b] active:scale-95 transition-all shadow-[0_0_30px_rgba(205,166,97,0.3)]"
          >
            Access Admin Dashboard <ArrowRight size={20} />
          </Link>
          <Link 
            href="/superadmin"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all"
          >
            Master Control
          </Link>
          <Link 
            href="/order/T01"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[#cda661] font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <QrCode size={20} /> Preview Customer UI
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            title="Scan & Order" 
            description="Customers scan the table QR code and order directly from their phones without waiting for a waiter."
          />
          <FeatureCard 
            title="Live Kitchen Feed" 
            description="Chefs get a real-time updating dashboard of incoming orders color-coded by urgency."
          />
          <FeatureCard 
            title="Menu Digitization" 
            description="Take a photo of your physical menu card and our system instantly digitizes it into the database."
          />
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/5 py-8 mt-12 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[#888888]">
          <p>&copy; {new Date().getFullYear()} The Royal Dhaba. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#cda661] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#cda661] transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string, description: string }) {
  return (
    <div className="bg-[#121212] border border-[#2a2a2a] p-8 rounded-3xl hover:border-[#cda661]/50 transition-colors group">
      <h3 className="text-xl font-serif mb-3 text-[#cda661]">{title}</h3>
      <p className="text-[#888888] leading-relaxed group-hover:text-[#a8a8a8] transition-colors">{description}</p>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
