'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Producto {
  _id: string;
  nombre: string;
  precio: number;
  imagenes: string[];
  material: string;
}

interface ProductCardProps {
  producto: Producto;
}

export default function ProductCard({ producto }: ProductCardProps) {
  return (
    <Link href={`/productos/${producto._id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
        <div className="relative h-64 bg-gray-100">
          {producto.imagenes && producto.imagenes.length > 0 ? (
            <Image
              src={producto.imagenes[0]}
              alt={producto.nombre}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Sin imagen
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {producto.nombre}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary-600">
              ${producto.precio.toLocaleString('es-CO')}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">{producto.material}</p>
        </div>
      </div>
    </Link>
  );
}
