'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';
import Loading from '@/components/Loading';

interface Producto {
  _id: string;
  nombre: string;
  precio: number;
  imagenes: string[];
  tipo: string;
  material: string;
}

export default function ProductosPage() {
  const searchParams = useSearchParams();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<any>({});

  // Leer categoría de la URL al cargar
  useEffect(() => {
    const categoriaFromUrl = searchParams.get('categoria');
    if (categoriaFromUrl) {
      setFilters({ categoria: categoriaFromUrl });
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProductos();
  }, [page, filters]);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...filters,
      });

      const res = await fetch(`/api/productos?${params}`);
      const data = await res.json();

      if (data.success) {
        setProductos(data.data.productos);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Nuestros Productos</h1>

      <Filters onFilterChange={handleFilterChange} initialFilters={filters} />

      {loading ? (
        <Loading />
      ) : productos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">No se encontraron productos</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <ProductCard key={producto._id} producto={producto} />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="px-4 py-2">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
