'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import AdminNavbar from '@/components/AdminNavbar';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        <AuthProvider>
          <AdminNavbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
