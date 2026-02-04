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
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenido a Accesorios LUI
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Los mejores accesorios para complementar tu estilo. Calidad y elegancia al mejor precio.
          </p>
          <Link
            href="/productos"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            Ver Productos
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-block p-4 bg-primary-100 rounded-full mb-4">
                <FiShoppingBag className="text-4xl text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Variedad de Productos</h3>
              <p className="text-gray-600">
                Anillos, collares, pulseras, bolsos y mucho más
              </p>
            </div>
            <div className="text-center">
              <div className="inline-block p-4 bg-primary-100 rounded-full mb-4">
                <FiTrendingUp className="text-4xl text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mejores Precios</h3>
              <p className="text-gray-600">
                Calidad excepcional a precios accesibles
              </p>
            </div>
            <div className="text-center">
              <div className="inline-block p-4 bg-primary-100 rounded-full mb-4">
                <FiHeart className="text-4xl text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Hecho con Amor</h3>
              <p className="text-gray-600">
                Cada pieza seleccionada con dedicación
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      {!loading && categorias.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nuestras Categorías</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {categorias.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/productos?categoria=${cat._id}`}
                  className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition w-40"
                >
                  <h3 className="text-xl font-bold text-gray-800">{cat.nombre}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Lista para encontrar el accesorio perfecto?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Explora nuestro catálogo completo y encuentra lo que buscas
          </p>
          <Link
            href="/productos"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            Explorar Ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
