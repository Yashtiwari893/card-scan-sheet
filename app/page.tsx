import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-extrabold text-2xl tracking-tighter flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">11za</span>
            <span className="text-gray-900">AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 font-medium hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 font-medium hover:text-blue-600 transition-colors">How it Works</a>
            <Link href="/privacy-policy" className="text-gray-600 font-medium hover:text-blue-600 transition-colors">Privacy</Link>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-50/50 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-8 border border-blue-100 animate-fade-in">
             ✨ WhatsApp-Powered AI OCR
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tight mb-8">
            Turn Business Cards Into <br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">Leads Instantly.</span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-xl text-gray-500 mb-12 font-medium leading-relaxed">
            Snap a photo of any business card on WhatsApp. Our AI extracts every detail and syncs it directly to your Google Sheets. No apps, no typing, no hassle.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button className="w-full md:w-auto bg-gray-900 text-white text-lg font-bold px-10 py-5 rounded-2xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3">
              Connect to WhatsApp
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </button>
            <button className="w-full md:w-auto bg-white text-gray-900 text-lg font-bold px-10 py-5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all">
              Watch Demo
            </button>
          </div>

          <div className="mt-20 pt-10 border-t border-gray-50 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale contrast-125">
             <div className="font-bold text-xl">TRUSTED BY SALES TEAMS</div>
             <div className="font-bold text-xl">AI-POWERED OCR</div>
             <div className="font-bold text-xl">GOOGLE VERIFIED</div>
             <div className="font-bold text-xl">PRIVACY FIRST</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Built for Speed. Optimized for CRM.</h2>
            <p className="text-xl text-gray-500 font-medium">Everything you need to digitize your networking workflow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="⚡"
              title="Instant Extraction"
              desc="Our Gemini-powered AI captures name, email, phone, and LinkedIn within seconds of receiving your photo."
            />
            <FeatureCard 
              icon="📊"
              title="Google Sheets Sync"
              desc="Automatic spreadsheet updates ensure your pipeline is always fresh and organized for follow-ups."
            />
            <FeatureCard 
              icon="🔒"
              title="Enterprise Security"
              desc="Data is synced directly to your own Google Workspace. We only request permission to append your sheets."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl font-black mb-10">How 11za AI Works</h2>
              <div className="space-y-12">
                <Step num="01" title="Snap & Send" desc="Take a clear photo of any business card and send it to our WhatsApp bot." />
                <Step num="02" title="AI Magic" desc="Our 11za AI OCR engine extracts contact details with 99.9% accuracy." />
                <Step num="03" title="Auto-Sync" desc="The contact is appended to your 'Card Scans' Google Sheet automatically." />
              </div>
            </div>
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[3rem] p-12 text-white shadow-3xl relative">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
               <div className="font-mono text-blue-200 mb-4 tracking-widest uppercase">Incoming Message</div>
               <div className="text-2xl font-bold mb-8">"New Business Card Detected! Extracting Details..."</div>
               <div className="space-y-4 bg-white/10 p-6 rounded-2xl border border-white/20">
                  <div className="flex justify-between"><span>Name:</span> <span className="font-bold text-white">Yash Tiwari</span></div>
                  <div className="flex justify-between"><span>Company:</span> <span className="font-bold text-white">11za Solutions</span></div>
                  <div className="flex justify-between"><span>Email:</span> <span className="font-bold text-white">yash@11za.in</span></div>
                  <div className="flex justify-between"><span>Status:</span> <span className="bg-green-400/20 text-green-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-widest">Synced to Sheet ✅</span></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
            <div className="max-w-sm">
               <div className="font-extrabold text-2xl tracking-tighter mb-6 flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">11za</span>
                <span className="text-gray-900">AI</span>
              </div>
              <p className="text-gray-500 font-medium leading-relaxed">
                Empowering professionals to digitize networking instantly using WhatsApp and advanced AI OCR technology.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-20">
              <div>
                <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-gray-400">Legal</h4>
                <ul className="space-y-4 font-bold text-gray-600">
                  <li><Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms-of-service" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-gray-400">Support</h4>
                <ul className="space-y-4 font-bold text-gray-600">
                  <li><a href="mailto:support@11za.in" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-gray-50 text-center text-gray-400 font-medium">
             &copy; 2026 11za AI. All rights reserved. Google Workspace is a trademark of Google LLC.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-50 transition-all duration-300">
      <div className="w-14 h-14 bg-blue-50 text-3xl flex items-center justify-center rounded-2xl mb-8">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4">{title}</h3>
      <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex gap-8 group">
      <div className="text-5xl font-black text-gray-100 group-hover:text-blue-100 transition-colors leading-none">{num}</div>
      <div>
        <h4 className="text-2xl font-black mb-2">{title}</h4>
        <p className="text-gray-500 font-medium">{desc}</p>
      </div>
    </div>
  );
}
