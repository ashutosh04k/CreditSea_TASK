import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { MessageCircle } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CredFlow LMS | Digital Lending & Lifecycle Management',
  description: 'Powering MSME & Borrower Growth Through Digital Lending Infrastructure & Technology',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f8fafc] text-slate-900 min-h-screen flex flex-col antialiased selection:bg-[#234fe6] selection:text-white`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full flex flex-col">{children}</main>
          
          {/* Floating WhatsApp Contact Widget */}
          <a
            href="https://wa.me/918521975695"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat with our lending advisors"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm shadow-xl shadow-[#25D366]/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-white text-white" />
            <span>Chat with us</span>
          </a>

          {/* CredFlow Modern Footer */}
          <footer className="bg-white border-t border-slate-200/80 py-8 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight">Cred<span className="text-[#234fe6]">Flow</span></span>
                <span className="text-slate-400">|</span>
                <span>RBI Compliant Lending & Technology Infrastructure</span>
              </div>
              <div className="text-slate-500">
                CredFlow LMS &copy; {new Date().getFullYear()} • Powered by Next.js, Express, TypeScript & MongoDB
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
