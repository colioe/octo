// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '../context/AppContext'; // 👈 adjust path if needed
import BodyWrapper from '../components/BodyWrapper';  // 👇 we'll make this

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
      <AppProvider>
        <BodyWrapper>{children}</BodyWrapper>
      </AppProvider>
    </html>
  );
}
