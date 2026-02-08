'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AdminNavbar from '@/components/AdminNavbar';
import { usePathname } from 'next/navigation';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // Si es la página de login, no mostrar el navbar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Si está autenticado, mostrar con navbar
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-primary-50">
        <AdminNavbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    );
  }

  // Si no está autenticado y no es login, mostrar sin navbar (la página se encarga del redirect)
  return (
    <div className="min-h-screen flex flex-col bg-primary-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
