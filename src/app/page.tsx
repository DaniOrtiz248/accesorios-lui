'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingBag, FiTrendingUp, FiHeart } from 'react-icons/fi';

interface Categoria {
  _id: string;
  nombre: string;
  slug: string;
  activo: boolean;
}

// Paleta de colores pastel para las tarjetas de categorías
const CARD_PALETTES = [
  { bg: 'bg-pink-50',   border: 'border-pink-200',   text: 'text-pink-700',   circle: 'bg-pink-100'   },
  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  circle: 'bg-amber-100'  },
  { bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-700',circle: 'bg-emerald-100'},
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', circle: 'bg-violet-100' },
  { bg: 'bg-sky-50',    border: 'border-sky-200',    text: 'text-sky-700',    circle: 'bg-sky-100'    },
  { bg: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700',   circle: 'bg-rose-100'   },
  { bg: 'bg-lime-50',   border: 'border-lime-200',   text: 'text-lime-700',   circle: 'bg-lime-100'   },
  { bg: 'bg-cyan-50',   border: 'border-cyan-200',   text: 'text-cyan-700',   circle: 'bg-cyan-100'   },
];

export default function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Obtener iniciales para mostrar en la tarjeta
  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
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
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-primary-900">Nuestras Categorías</h2>
              <Link
                href="/productos"
                className="text-sm font-medium text-primary-600 hover:text-primary-800 transition border border-primary-200 px-4 py-1.5 rounded-full hover:border-primary-400"
              >
                Ver todo
              </Link>
            </div>

            {/* Scroll horizontal en móvil, grid en desktop */}
            <div className="flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:overflow-visible sm:pb-0 scrollbar-hide">
              {categorias.map((cat, i) => {
                const palette = CARD_PALETTES[i % CARD_PALETTES.length];
                const initials = getInitials(cat.nombre);
                return (
                  <Link
                    key={cat._id}
                    href={`/productos?categoria=${cat._id}`}
                    className={`group flex-shrink-0 w-36 sm:w-auto flex flex-col items-center p-5 rounded-2xl border ${
                      palette.bg
                    } ${
                      palette.border
                    } hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}
                  >
                    {/* Círculo con iniciales */}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                        palette.circle
                      } group-hover:scale-110 transition-transform duration-200`}
                    >
                      <span className={`text-2xl font-bold ${palette.text}`}>
                        {initials}
                      </span>
                    </div>
                    <h3 className={`text-sm font-semibold text-center leading-tight ${palette.text}`}>
                      {cat.nombre}
                    </h3>
                  </Link>
                );
              })}
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
