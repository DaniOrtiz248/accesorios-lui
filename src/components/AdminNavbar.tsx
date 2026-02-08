'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiLogOut, FiPackage, FiTag, FiLayers, FiHome } from 'react-icons/fi';

export default function AdminNavbar() {
  const { logout, usuario } = useAuth();

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo Admin */}
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="bg-primary-600 p-2 rounded-lg">
              <FiHome className="text-xl" />
            </div>
            <span className="text-xl font-bold">Panel Admin</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/admin/productos"
              className="flex items-center space-x-2 hover:text-primary-400 transition"
            >
              <FiPackage />
              <span>Productos</span>
            </Link>
            <Link
              href="/admin/categorias"
              className="flex items-center space-x-2 hover:text-primary-400 transition"
            >
              <FiTag />
              <span>Categorías</span>
            </Link>
            <Link
              href="/admin/materiales"
              className="flex items-center space-x-2 hover:text-primary-400 transition"
            >
              <FiLayers />
              <span>Materiales</span>
            </Link>

            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-600">
              <span className="text-sm text-gray-300">{usuario?.nombre}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
              >
                <FiLogOut />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* Mobile: Solo logout button */}
          <div className="md:hidden flex items-center space-x-2">
            <span className="text-xs text-gray-300">{usuario?.nombre}</span>
            <button
              onClick={logout}
              className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition text-sm"
            >
              <FiLogOut />
              <span>Salir</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Links principales */}
        <div className="md:hidden pb-4 flex space-x-4">
          <Link
            href="/admin/productos"
            className="flex items-center space-x-1 text-sm hover:text-primary-400 transition"
          >
            <FiPackage />
            <span>Productos</span>
          </Link>
          <Link
            href="/admin/categorias"
            className="flex items-center space-x-1 text-sm hover:text-primary-400 transition"
          >
            <FiTag />
            <span>Categorías</span>
          </Link>
          <Link
            href="/admin/materiales"
            className="flex items-center space-x-1 text-sm hover:text-primary-400 transition"
          >
            <FiLayers />
            <span>Materiales</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
