import Link from "next/link";
import { UtensilsCrossed, ArrowRight, ChefHat, QrCode } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white selection:bg-orange-500/30 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-orange-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-red-600 rounded-full blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <UtensilsCrossed size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-wide">The Royal Dhaba</span>
          </div>
          <Link 
            href="/admin" 
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-semibold"
          >
            <ChefHat size={16} />
            Staff & Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium text-sm mb-8">
          <SparklesIcon className="w-4 h-4" /> Smart Restaurant System
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
          Next-Gen Dining <br/>
          <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
            Experience.
          </span>
        </h1>
        
        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          The complete digital ecosystem for your restaurant. Just scan the QR code on your table to view the beautiful interactive menu and place orders instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/admin"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(249,115,22,0.3)]"
          >
            Access Admin Dashboard <ArrowRight size={20} />
          </Link>
          <Link 
            href="/order/T01"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <QrCode size={20} /> Preview Customer UI
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
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
            title="AI Menu Upload" 
            description="Take a photo of your physical menu card and our AI instantly digitizes it into the database."
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string, description: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/[0.07] transition-colors">
      <h3 className="text-xl font-bold mb-3 text-orange-400">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{description}</p>
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
