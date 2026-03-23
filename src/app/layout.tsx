import type { Metadata } from 'next';
import './globals.css';
import { Web3Provider } from '@/context/Web3Context';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'IEC VoteSecQA - Secure Blockchain Voting',
  description: 'A transparent, immutable, and secure voting system built on Polygon.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-500/30">
        <Web3Provider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="border-t border-slate-700 mt-auto py-6 text-center text-slate-400 text-sm">
              <p>&copy; {new Date().getFullYear()} IEC VoteSecQA. All rights reserved.</p>
            </footer>
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
