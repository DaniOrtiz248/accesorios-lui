'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Loading from '@/components/Loading';
import { FiChevronLeft, FiChevronRight, FiX, FiZoomIn } from 'react-icons/fi';

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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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

  // Generar mensaje de WhatsApp con información del producto
  const whatsappMessage = encodeURIComponent(
    `¡Hola! Me interesa este producto:\n\n` +
    `*${producto.nombre}*\n\n` +
    `${producto.descripcion}\n\n` +
    `💰 Precio: $${producto.precio.toLocaleString('es-CO')} COP\n` +
    `📦 Material: ${producto.material}\n` +
    `🏷️ Categoría: ${producto.categoria?.nombre}\n\n` +
    (producto.imagenes?.[0] ? `🖼️ Imagen: ${producto.imagenes[0]}\n\n` : '') +
    `¿Está disponible?`
  );

  const whatsappUrl = `https://wa.me/573104426397?text=${whatsappMessage}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Galería de Imágenes */}
        <div>
          <div 
            className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 cursor-zoom-in group" 
            style={{ aspectRatio: '1' }}
            onClick={() => setIsImageModalOpen(true)}
          >
            {producto.imagenes && producto.imagenes.length > 0 ? (
              <>
                <Image
                  src={producto.imagenes[currentImageIndex]}
                  alt={producto.nombre}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  priority
                />
                {/* Icono de zoom */}
                <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <FiZoomIn className="text-xl text-gray-700" />
                </div>
                {producto.imagenes.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full z-10"
                      aria-label="Imagen anterior"
                    >
                      <FiChevronLeft className="text-2xl" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full z-10"
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
              ¿Te interesa este producto? Contáctanos por WhatsApp
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-600 text-white text-center px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Modal de imagen ampliada */}
      {isImageModalOpen && producto.imagenes && producto.imagenes.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          {/* Botón cerrar */}
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition z-10"
            aria-label="Cerrar"
          >
            <FiX className="text-3xl" />
          </button>

          {/* Navegación */}
          {producto.imagenes.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition z-10"
                aria-label="Imagen anterior"
              >
                <FiChevronLeft className="text-3xl" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition z-10"
                aria-label="Siguiente imagen"
              >
                <FiChevronRight className="text-3xl" />
              </button>
            </>
          )}

          {/* Imagen ampliada */}
          <div 
            className="relative w-full h-full max-w-6xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={producto.imagenes[currentImageIndex]}
              alt={producto.nombre}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Contador de imágenes */}
          {producto.imagenes.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {producto.imagenes.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
