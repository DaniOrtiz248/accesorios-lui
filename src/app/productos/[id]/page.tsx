'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Loading from '@/components/Loading';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Producto {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  material: string;
  imagenes: string[];
  categoria: {
    nombre: string;
  };
}

export default function ProductoDetallePage() {
  const params = useParams();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchProducto();
    }
  }, [params.id]);

  const fetchProducto = async () => {
    try {
      const res = await fetch(`/api/productos/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setProducto(data.data);
      }
    } catch (error) {
      console.error('Error al cargar producto:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (producto?.imagenes) {
      setCurrentImageIndex((prev) => (prev + 1) % producto.imagenes.length);
    }
  };

  const prevImage = () => {
    if (producto?.imagenes) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? producto.imagenes.length - 1 : prev - 1
      );
    }
  };

  if (loading) return <Loading />;
  if (!producto) return <div className="text-center py-20">Producto no encontrado</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Galería de Imágenes */}
        <div>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '1' }}>
            {producto.imagenes && producto.imagenes.length > 0 ? (
              <>
                <Image
                  src={producto.imagenes[currentImageIndex]}
                  alt={producto.nombre}
                  fill
                  className="object-cover"
                  priority
                />
                {producto.imagenes.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                      aria-label="Imagen anterior"
                    >
                      <FiChevronLeft className="text-2xl" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                      aria-label="Siguiente imagen"
                    >
                      <FiChevronRight className="text-2xl" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Sin imagen
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {producto.imagenes && producto.imagenes.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {producto.imagenes.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <Image src={img} alt={`${producto.nombre} ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del Producto */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{producto.nombre}</h1>
          <div className="text-4xl font-bold text-primary-600 mb-6">
            ${producto.precio.toLocaleString('es-CO')} COP
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <span className="font-semibold">Categoría:</span> {producto.categoria?.nombre}
            </div>
            <div>
              <span className="font-semibold">Material:</span> {producto.material}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">Descripción</h2>
            <p className="text-gray-700 leading-relaxed">{producto.descripcion}</p>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <p className="text-center text-gray-700 mb-4">
              ¿Te interesa este producto? Contáctanos
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/573104426397"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 text-white text-center px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
              >
                Consultar por WhatsApp
              </a>
              <a
                href="https://www.instagram.com/accesorioslui07/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-pink-600 text-white text-center px-6 py-3 rounded-lg hover:bg-pink-700 transition font-medium"
              >
                Ver en Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
