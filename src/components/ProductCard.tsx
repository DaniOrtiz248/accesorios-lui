'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Producto {
  _id: string;
  nombre: string;
  precio: number;
  imagenes: string[];
  subcategorias?: { nombre: string }[];
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
              sizes="(min-width: 1536px) 358px, (min-width: 1280px) 294px, (min-width: 1024px) 315px, (min-width: 768px) 356px, (min-width: 640px) 292px, calc(100vw - 32px)"
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
        </div>
      </div>
    </Link>
  );
}
