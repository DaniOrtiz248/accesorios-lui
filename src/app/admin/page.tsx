'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPackage, FiTag, FiLogOut, FiHome } from 'react-icons/fi';

export default function AdminDashboard() {
  const { usuario, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Panel de Administración</h1>
              <p className="text-sm text-gray-600">Bienvenida, {usuario?.nombre}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-primary-600 transition"
                title="Ver sitio público"
              >
                <FiHome className="text-2xl" />
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition"
              >
                <FiLogOut />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Productos Card */}
          <Link
            href="/admin/productos"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <FiPackage className="text-3xl text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
            </div>
            <p className="text-gray-600">
              Gestiona tu catálogo de productos. Agrega, edita o elimina artículos.
            </p>
          </Link>

          {/* Categorías Card */}
          <Link
            href="/admin/categorias"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <FiTag className="text-3xl text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Categorías</h2>
            </div>
            <p className="text-gray-600">
              Administra las categorías de tus productos para mejor organización.
            </p>
          </Link>
        </div>

        {/* Quick Stats (opcional para futuro) */}
        <div className="mt-12 text-center text-gray-500">
          <p>Sistema de gestión para Accesorios LUI</p>
        </div>
      </main>
    </div>
  );
}
