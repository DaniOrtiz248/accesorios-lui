import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Accesorios LUI - Los mejores accesorios para ti',
  description: 'Encuentra anillos, collares, pulseras, bolsos y más. Los mejores accesorios al mejor precio.',
  keywords: 'accesorios, anillos, collares, pulseras, bolsos, billeteras, relojes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
