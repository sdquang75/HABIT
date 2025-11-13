import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// 1. Import Provider chúng ta vừa tạo
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Habitify Clone',
  description: 'Track your habits',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. Bọc "children" bằng <Providers> */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}