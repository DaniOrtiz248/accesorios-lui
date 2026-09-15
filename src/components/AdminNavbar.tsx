'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiLogOut, FiPackage, FiTag, FiLayers, FiHome, FiSettings, FiExternalLink } from 'react-icons/fi';

export default function AdminNavbar() {
  const { logout, usuario } = useAuth();

  return (
    <nav className="bg-primary-900 text-background-light shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
          {/* Logo Admin */}
          <Link href="/admin" className="flex items-center space-x-2 shrink-0">
            <div className="bg-accent p-2 rounded-lg">
              <FiHome className="text-xl text-white" />
            </div>
            <span className="text-xl font-bold">Panel Admin</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:flex-wrap items-center gap-x-5 gap-y-2 justify-end">
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
              href="/admin/subcategorias"
              className="flex items-center space-x-2 hover:text-accent-light transition"
            >
              <FiLayers />
              <span>Subcategorías</span>
            </Link>
            <Link
              href="/admin/cuenta"
              className="flex items-center space-x-2 hover:text-accent-light transition"
            >
              <FiSettings />
              <span>Cuenta</span>
            </Link>
            <Link
              href="/"
              className="flex items-center space-x-1.5 text-sm text-primary-200 hover:text-accent-light transition"
              title="Ver tienda"
            >
              <FiExternalLink />
              <span>Ver tienda</span>
            </Link>

            <div className="flex items-center gap-x-3 pl-4 border-l border-primary-700">
              <span className="text-sm text-primary-100 truncate max-w-[10rem]">{usuario?.nombre}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-1.5 bg-primary-700 hover:bg-primary-800 text-accent-light px-3 py-1.5 rounded-md transition text-sm font-medium border border-primary-600 shrink-0"
              >
                <FiLogOut className="text-base" />
                <span>Salir</span>
              </button>
            </div>
          </div>

          {/* Mobile: Solo logout button */}
          <div className="md:hidden flex items-center gap-x-2 shrink-0">
            <span className="text-xs text-primary-100 truncate max-w-[6rem]">{usuario?.nombre}</span>
            <button
              onClick={logout}
              className="flex items-center space-x-1 bg-primary-700 hover:bg-primary-800 text-accent-light px-2.5 py-1.5 rounded-md transition text-xs font-medium border border-primary-600 shrink-0"
            >
              <FiLogOut className="text-sm" />
              <span>Salir</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Links principales */}
        <div className="md:hidden pb-4 flex flex-wrap gap-x-4 gap-y-2">
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
            href="/admin/subcategorias"
            className="flex items-center space-x-1 text-sm hover:text-accent-light transition"
          >
            <FiLayers />
            <span>Subcategorías</span>
          </Link>
          <Link
            href="/admin/cuenta"
            className="flex items-center space-x-1 text-sm hover:text-accent-light transition"
          >
            <FiSettings />
            <span>Cuenta</span>
          </Link>
          <Link
            href="/"
            className="flex items-center space-x-1 text-sm text-primary-200 hover:text-accent-light transition"
          >
            <FiExternalLink />
            <span>Ver tienda</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
