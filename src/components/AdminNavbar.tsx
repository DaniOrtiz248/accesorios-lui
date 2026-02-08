'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiLogOut, FiPackage, FiTag, FiLayers, FiHome } from 'react-icons/fi';

export default function AdminNavbar() {
  const { logout, usuario } = useAuth();

  return (
    <nav className="bg-primary-900 text-background-light shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo Admin */}
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="bg-accent p-2 rounded-lg">
              <FiHome className="text-xl text-white" />
            </div>
            <span className="text-xl font-bold">Panel Admin</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/admin/productos"
              className="flex items-center space-x-2 hover:text-accent-light transition"
            >
              <FiPackage />
              <span>Productos</span>
            </Link>
            <Link
              href="/admin/categorias"
              className="flex items-center space-x-2 hover:text-accent-light transition"
            >
              <FiTag />
              <span>Categorías</span>
            </Link>
            <Link
              href="/admin/materiales"
              className="flex items-center space-x-2 hover:text-accent-light transition"
            >
              <FiLayers />
              <span>Materiales</span>
            </Link>

            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-primary-700">
              <span className="text-sm text-primary-100">{usuario?.nombre}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-1.5 bg-primary-700 hover:bg-primary-800 text-accent-light px-3 py-1.5 rounded-md transition text-sm font-medium border border-primary-600"
              >
                <FiLogOut className="text-base" />
                <span>Salir</span>
              </button>
            </div>
          </div>

          {/* Mobile: Solo logout button */}
          <div className="md:hidden flex items-center space-x-2">
            <span className="text-xs text-primary-100">{usuario?.nombre}</span>
            <button
              onClick={logout}
              className="flex items-center space-x-1 bg-primary-700 hover:bg-primary-800 text-accent-light px-2.5 py-1.5 rounded-md transition text-xs font-medium border border-primary-600"
            >
              <FiLogOut className="text-sm" />
              <span>Salir</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Links principales */}
        <div className="md:hidden pb-4 flex space-x-4">
          <Link
            href="/admin/productos"
            className="flex items-center space-x-1 text-sm hover:text-accent-light transition"
          >
            <FiPackage />
            <span>Productos</span>
          </Link>
          <Link
            href="/admin/categorias"
            className="flex items-center space-x-1 text-sm hover:text-accent-light transition"
          >
            <FiTag />
            <span>Categorías</span>
          </Link>
          <Link
            href="/admin/materiales"
            className="flex items-center space-x-1 text-sm hover:text-accent-light transition"
          >
            <FiLayers />
            <span>Materiales</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
