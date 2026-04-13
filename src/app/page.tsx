'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingBag, FiTrendingUp, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Categoria {
  _id: string;
  nombre: string;
  slug: string;
  imagen?: string;
  activo: boolean;
}

export default function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias');
      const data = await res.json();
      if (data.success) {
        setCategorias(data.data.filter((cat: Categoria) => cat.activo));
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (nombre: string) =>
    nombre.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

  const scrollCarousel = (dir: 'prev' | 'next') => {
    if (!carouselRef.current) return;
    const amount = carouselRef.current.offsetWidth * 0.75;
    carouselRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-400 via-accent to-primary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-3 drop-shadow-lg tracking-wide">
            Luisa Ramirez
          </h1>
          <p className="text-2xl md:text-3xl mb-6 font-light italic drop-shadow-md">
            Accesorios
          </p>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow">
            Elegancia y estilo que complementan tu personalidad. Cada pieza cuenta una historia de calidad y sofisticación.
          </p>
          <Link
            href="/productos"
            className="inline-block bg-white text-primary-800 px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-50 transition shadow-lg hover:shadow-xl"
          >
            Ver Productos
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background-light">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-block p-4 bg-accent-light rounded-full mb-4">
                <FiShoppingBag className="text-4xl text-primary-800" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-900">Variedad de Productos</h3>
              <p className="text-primary-700">
                Anillos, collares, pulseras, bolsos y mucho más
              </p>
            </div>
            <div className="text-center">
              <div className="inline-block p-4 bg-accent-light rounded-full mb-4">
                <FiTrendingUp className="text-4xl text-primary-800" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-900">Mejores Precios</h3>
              <p className="text-primary-700">
                Calidad excepcional a precios accesibles
              </p>
            </div>
            <div className="text-center">
              <div className="inline-block p-4 bg-accent-light rounded-full mb-4">
                <FiHeart className="text-4xl text-primary-800" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-900">Hecho con Amor</h3>
              <p className="text-primary-700">
                Cada pieza seleccionada con dedicación
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      {!loading && categorias.length > 0 && (
        <section className="py-16 bg-background-light">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-3 mb-10 sm:flex-row sm:justify-between">
              <h2 className="text-3xl font-bold text-primary-900 text-center sm:text-left">Nuestras Categorías</h2>
              <Link
                href="/productos"
                className="text-sm font-medium text-primary-600 hover:text-primary-800 transition border border-primary-200 px-5 py-2 rounded-full hover:border-primary-400"
              >
                Ver todo
              </Link>
            </div>

            {/* Carrusel de categorías */}
            <div className="relative">
              {/* Botón anterior */}
              <button
                onClick={() => scrollCarousel('prev')}
                className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-md rounded-full items-center justify-center text-primary-700 hover:bg-primary-50 transition"
                aria-label="Anterior"
              >
                <FiChevronLeft className="text-xl" />
              </button>

              {/* Track del carrusel */}
              <div
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto scroll-smooth pt-3 pb-3 scrollbar-hide"
              >
                {categorias.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/productos?categoria=${cat._id}`}
                    className="group flex-shrink-0 flex flex-col items-center gap-3 w-32"
                  >
                    {/* Círculo */}
                    <div className="relative w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-accent-light shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-200 ring-2 ring-primary-100 group-hover:ring-primary-300">
                      {cat.imagen ? (
                        <Image
                          src={cat.imagen}
                          alt={cat.nombre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full">
                          <span className="text-3xl font-bold text-primary-400">
                            {getInitials(cat.nombre)}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Nombre debajo */}
                    <h3 className="text-xs font-semibold text-center text-primary-800 leading-tight line-clamp-2">
                      {cat.nombre}
                    </h3>
                  </Link>
                ))}
              </div>

              {/* Botón siguiente */}
              <button
                onClick={() => scrollCarousel('next')}
                className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-md rounded-full items-center justify-center text-primary-700 hover:bg-primary-50 transition"
                aria-label="Siguiente"
              >
                <FiChevronRight className="text-xl" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-accent-dark to-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
            ¿Lista para encontrar el accesorio perfecto?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto drop-shadow">
            Explora nuestro catálogo completo y encuentra lo que buscas
          </p>
          <Link
            href="/productos"
            className="inline-block bg-white text-primary-800 px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-50 transition shadow-lg hover:shadow-xl"
          >
            Explorar Ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
