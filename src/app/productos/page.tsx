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
  const [totalProductos, setTotalProductos] = useState(0);
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
        setTotalProductos(data.data.pagination?.total || 0);
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

  const handlePageChange = (nuevaPagina: number) => {
    setPage(nuevaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Nuestros Productos</h1>

      <Filters onFilterChange={handleFilterChange} initialFilters={filters} />

      {/* Contador de resultados */}
      {!loading && (
        <div className="text-center mb-6">
          <span className="text-lg text-gray-700 font-medium">
            {totalProductos === 0 ? (
              'No se encontraron productos'
            ) : totalProductos === 1 ? (
              '1 producto disponible'
            ) : (
              `${totalProductos} productos disponibles`
            )}
          </span>
        </div>
      )}

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

          {/* Paginación mejorada */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Anterior
              </button>
              
              <div className="flex gap-2">
                {/* Primera página */}
                {page > 3 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition"
                    >
                      1
                    </button>
                    {page > 4 && <span className="px-2 py-2">...</span>}
                  </>
                )}
                
                {/* Páginas cercanas */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    return p === page ||
                           p === page - 1 ||
                           p === page - 2 ||
                           p === page + 1 ||
                           p === page + 2;
                  })
                  .map(p => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`px-4 py-2 rounded-lg border transition ${
                        p === page
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                
                {/* Última página */}
                {page < totalPages - 2 && (
                  <>
                    {page < totalPages - 3 && <span className="px-2 py-2">...</span>}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
