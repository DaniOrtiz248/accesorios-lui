'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPackage, FiTag, FiLogOut, FiHome, FiBox } from 'react-icons/fi';

export default function AdminDashboard() {
  const { usuario, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3 md:h-16 gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-base md:text-xl font-bold text-gray-800 truncate">Panel de Administración</h1>
              <p className="text-xs md:text-sm text-gray-600 truncate">Bienvenida, {usuario?.nombre}</p>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              <Link
                href="/"
                className="text-gray-600 hover:text-primary-600 transition"
                title="Ver sitio público"
              >
                <FiHome className="text-xl md:text-2xl" />
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-red-600 transition text-sm md:text-base"
              >
                <FiLogOut />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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

          {/* Materiales Card */}
          <Link
            href="/admin/materiales"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <FiBox className="text-3xl text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Materiales</h2>
            </div>
            <p className="text-gray-600">
              Gestiona los materiales disponibles para tus productos.
            </p>
          </Link>
        </div>

        {/* Quick Stats (opcional para futuro) */}
        <div className="mt-12 text-center text-gray-500">
          <p>Sistema de gestión para <span className="font-medium text-primary-700">Luisa Ramirez Accesorios</span></p>
        </div>
      </main>
    </div>
  );
}
