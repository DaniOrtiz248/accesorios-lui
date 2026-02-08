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

// Versión 2.1 - Transformando datos para prevenir objetos en React children
interface Producto {
  _id: string;
  nombre: string;
  precio: number;
  material: string; // Siempre string después de transformación
  imagenes: string[];
  activo: boolean;
  categoria: {
    nombre: string;
  }; // Siempre objeto simple con solo nombre
}

export default function AdminProductosPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    } else if (!isLoading && isAuthenticated) {
      fetchProductos();
    }
  }, [isAuthenticated, isLoading]);

  const fetchProductos = async () => {
    console.log('📋 [ADMIN] Iniciando fetchProductos v2.0...');
    try {
      const res = await fetch('/api/productos?limit=100&includeInactive=true');
      console.log('📥 [ADMIN] Respuesta recibida:', { status: res.status, ok: res.ok });
      
      const data = await res.json();
      console.log('📦 [ADMIN] Datos parseados:', {
        success: data.success,
        productosCount: data.data?.productos?.length
      });
      
      if (data.success) {
        const productosRaw = data.data.productos;
        
        // Transformar productos para asegurar que material y categoria sean seguros
        const productosTransformados = productosRaw.map((p: any) => ({
          _id: p._id,
          nombre: p.nombre,
          precio: p.precio,
          imagenes: p.imagenes || [],
          activo: p.activo,
          // Extraer solo el nombre del material
          material: typeof p.material === 'object' && p.material !== null
            ? p.material.nombre || 'Sin material'
            : typeof p.material === 'string'
            ? p.material
            : 'Sin material',
          // Extraer solo el nombre de la categoría
          categoria: typeof p.categoria === 'object' && p.categoria !== null
            ? { nombre: p.categoria.nombre || 'Sin categoría' }
            : { nombre: 'Sin categoría' }
        }));
        
        console.log('✅ [ADMIN] Seteando productos transformados:', productosTransformados.length);
        setProductos(productosTransformados);
      } else {
        console.error('⚠️ [ADMIN] Success = false:', data);
      }
    } catch (error) {
      console.error('❌ [ADMIN] Error al cargar productos:', error);
    } finally {
      setLoading(false);
      console.log('✅ [ADMIN] Loading finalizado');
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4 md:h-16 gap-3">
            <div className="flex items-center space-x-3 md:space-x-4">
              <Link href="/admin" className="text-gray-600 hover:text-primary-600">
                <FiArrowLeft className="text-2xl" />
              </Link>
              <h1 className="text-lg md:text-xl font-bold text-gray-800">Gestión de Productos</h1>
            </div>
            <Link
              href="/admin/productos/nuevo"
              className="flex items-center space-x-2 bg-primary-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm md:text-base whitespace-nowrap"
            >
              <FiPlus />
              <span className="hidden sm:inline">Nuevo Producto</span>
              <span className="sm:hidden">Nuevo</span>
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productosFiltrados.map((producto) => (
              <div
                key={producto._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {/* Imagen */}
                <div className="relative aspect-video bg-gray-100">
                  {producto.imagenes?.[0] ? (
                    <Image
                      src={producto.imagenes[0]}
                      alt={producto.nombre}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-3 space-y-2">
                  {/* Nombre y Material */}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                      {producto.nombre}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {producto.material}
                    </p>
                  </div>

                  {/* Precio y Categoría */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sm font-bold text-primary-600">
                      ${producto.precio.toLocaleString('es-CO')}
                    </span>
                    <span className="text-gray-600 line-clamp-1">
                      {producto.categoria.nombre}
                    </span>
                  </div>

                  {/* Estado */}
                  <button
                    onClick={() => toggleActivo(producto._id, producto.activo)}
                    className={`w-full inline-flex items-center justify-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-medium transition ${
                      producto.activo
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {producto.activo ? <FiEye /> : <FiEyeOff />}
                    <span>{producto.activo ? 'Activo' : 'Inactivo'}</span>
                  </button>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/productos/${producto._id}`}
                      className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 text-white px-2 py-1.5 rounded-lg hover:bg-blue-700 transition text-xs"
                    >
                      <FiEdit className="text-sm" />
                      <span>Editar</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(producto._id)}
                      className="flex items-center justify-center bg-red-600 text-white px-2 py-1.5 rounded-lg hover:bg-red-700 transition"
                      title="Eliminar"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
