import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AppProvider } from '@/lib/context';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'GenAI Opportunity Explorer | Discover Proven AI Use Cases',
  description: 'Explore 21 real-world GenAI implementations across 11 industries. Find proven opportunities to work faster, better, and at scale.',
  keywords: 'GenAI, AI use cases, AI implementation, business AI, AI transformation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
