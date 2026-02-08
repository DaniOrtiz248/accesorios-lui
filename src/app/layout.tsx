import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Luisa Ramirez Accesorios - Elegancia y Estilo',
  description: 'Descubre una colección exclusiva de anillos, collares, pulseras, bolsos y más. Elegancia, calidad y estilo en cada pieza.',
  keywords: 'luisa ramirez, accesorios, anillos, collares, pulseras, bolsos, billeteras, relojes, elegancia, moda',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col min-h-screen bg-background-light`}>
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
