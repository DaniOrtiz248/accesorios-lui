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
        <section className="py-16 bg-primary-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary-900">Nuestras Categorías</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {categorias.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/productos?categoria=${cat._id}`}
                  className="bg-white border border-primary-100 rounded-lg shadow-md p-6 text-center hover:shadow-xl hover:border-accent transition w-40"
                >
                  <h3 className="text-xl font-bold text-primary-800">{cat.nombre}</h3>
                </Link>
              ))}
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
