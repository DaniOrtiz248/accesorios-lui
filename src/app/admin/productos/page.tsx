'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiArrowLeft,
  FiSearch,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';

interface Producto {
  _id: string;
  nombre: string;
  precio: number;
  material: string;
  imagenes: string[];
  activo: boolean;
  categoria: {
    nombre: string;
  };
}

export default function AdminProductosPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    } else {
      fetchProductos();
    }
  }, [isAuthenticated]);

  const fetchProductos = async () => {
    try {
      const res = await fetch('/api/productos?limit=100');
      const data = await res.json();
      if (data.success) {
        setProductos(data.data.productos);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás segura de eliminar este producto?')) return;

    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        fetchProductos();
      } else {
        alert(data.message || 'Error al eliminar producto');
      }
    } catch (error) {
      alert('Error al eliminar producto');
    }
  };

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activo: !activo }),
      });

      const data = await res.json();

      if (data.success) {
        fetchProductos();
      }
    } catch (error) {
      alert('Error al actualizar producto');
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-600 hover:text-primary-600">
                <FiArrowLeft className="text-2xl" />
              </Link>
              <h1 className="text-xl font-bold text-gray-800">Gestión de Productos</h1>
            </div>
            <Link
              href="/admin/productos/nuevo"
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              <FiPlus />
              <span>Nuevo Producto</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="text-center py-20">Cargando...</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">No hay productos</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio (COP)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {productosFiltrados.map((producto) => (
                    <tr key={producto._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="relative w-16 h-16 bg-gray-100 rounded">
                          {producto.imagenes?.[0] ? (
                            <Image
                              src={producto.imagenes[0]}
                              alt={producto.nombre}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                              Sin imagen
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {producto.nombre}
                        </div>
                        <div className="text-sm text-gray-500">{producto.material}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${producto.precio.toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {producto.categoria?.nombre}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActivo(producto._id, producto.activo)}
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                            producto.activo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {producto.activo ? <FiEye /> : <FiEyeOff />}
                          <span>{producto.activo ? 'Activo' : 'Inactivo'}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/admin/productos/${producto._id}`}
                          className="inline-block text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <FiEdit className="text-xl" />
                        </Link>
                        <button
                          onClick={() => handleDelete(producto._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <FiTrash2 className="text-xl" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
