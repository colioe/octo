// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '../context/AppContext'; // 👈 adjust path if needed
import BodyWrapper from '../components/BodyWrapper';  // 👇 we'll make this
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Octo - Your Personalized Search Solution',
  description: 'A customizable search engine solution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      <Script 
        id="ezoic-script"
        strategy="afterInteractive"
        src="https://g.ezoic.net/ezoic/ezoic.js"
      />
      <Script 
        id="monetag-script"
        strategy="afterInteractive"
        src="https://octo.colioe.io/sw.js"
      />
      <Script 
        id="monetag-script"
        strategy="afterInteractive"
        src="https://octo.colioe.io/9261203.min.js"
      />
      </head>
      <AppProvider>
        <BodyWrapper>{children}</BodyWrapper>
      </AppProvider>
    </html>
  );
}
