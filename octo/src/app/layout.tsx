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
      <meta name="coinzilla" content="1b45a0d966f2fe52266780a0a6030ced" />
      <Script 
        id="ezoic-script"
        strategy="afterInteractive"
        src="https://g.ezoic.net/ezoic/ezoic.js"
      />
      <Script 
        id="adsense-script"
        async
        crossOrigin='anonymous'
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9978045080089847"
        />
      <Script 
        id="cse-script"
        strategy="afterInteractive"
        src="https://colioe.io/cse.js"
      />
    
      </head>
      <AppProvider>
        <BodyWrapper>{children}</BodyWrapper>
      </AppProvider>
    </html>
  );
}
