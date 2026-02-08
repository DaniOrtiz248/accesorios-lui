'use client';

import { useState, useEffect, Suspense } from 'react';
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

function ProductosContent() {
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

  // Fetch productos cuando cambien page o filters
  useEffect(() => {
    fetchProductos();
  }, [page, filters]);

  const fetchProductos = async () => {
    console.log('🔄 [CLIENTE] Iniciando fetchProductos...');
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...filters,
      });

      console.log('📡 [CLIENTE] Haciendo fetch a:', `/api/productos?${params}`);
      const res = await fetch(`/api/productos?${params}`);
      
      console.log('📥 [CLIENTE] Respuesta recibida:', { status: res.status, ok: res.ok });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ [CLIENTE] Error HTTP:', errorText);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('📦 [CLIENTE] Datos parseados:', {
        success: data.success,
        productosCount: data.data?.productos?.length,
        pagination: data.data?.pagination
      });

      if (data.success && data.data) {
        const productosArray = data.data.productos || [];
        console.log('✅ [CLIENTE] Seteando productos:', productosArray.length);
        setProductos(productosArray);
        setTotalPages(data.data.pagination?.pages || 1);
      } else {
        console.error('⚠️ [CLIENTE] Respuesta sin datos:', data);
        setProductos([]);
      }
    } catch (error) {
      console.error('❌ [CLIENTE] Error al cargar productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
      console.log('✅ [CLIENTE] Loading finalizado');
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

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8"><Loading /></div>}>
      <ProductosContent />
    </Suspense>
  );
}
