'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface Categoria {
  _id: string;
  nombre: string;
  slug: string;
}

interface Subcategoria {
  _id: string;
  nombre: string;
}

interface FiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
}

export default function Filters({ onFilterChange, initialFilters = {} }: FiltersProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subcategoriasSeleccionadas, setSubcategoriasSeleccionadas] = useState<string[]>([]);
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');

  useEffect(() => {
    fetchCategorias();
    if (initialFilters.categoria) setCategoria(initialFilters.categoria);
    if (initialFilters.busqueda) setBusqueda(initialFilters.busqueda);
  }, []);

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias');
      const data = await res.json();
      if (data.success) setCategorias(data.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const fetchSubcategorias = async (categoriaId: string) => {
    if (!categoriaId) {
      setSubcategorias([]);
      return;
    }
    try {
      const res = await fetch(`/api/subcategorias?categoria=${categoriaId}`);
      const data = await res.json();
      if (data.success) setSubcategorias(data.data);
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
    }
  };

  const toggleSubcategoria = (id: string) => {
    setSubcategoriasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters: any = {};
      if (busqueda) filters.busqueda = busqueda;
      if (categoria) filters.categoria = categoria;
      if (subcategoriasSeleccionadas.length > 0) filters.subcategoria = subcategoriasSeleccionadas;
      if (precioMin) filters.precioMin = precioMin;
      if (precioMax) filters.precioMax = precioMax;
      onFilterChange(filters);
    }, (busqueda || precioMin || precioMax) ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [busqueda, categoria, subcategoriasSeleccionadas, precioMin, precioMax]);

  const handleClearFilters = () => {
    setBusqueda('');
    setCategoria('');
    setSubcategoriasSeleccionadas([]);
    setSubcategorias([]);
    setPrecioMin('');
    setPrecioMax('');
  };

  const hayFiltrosActivos = busqueda || categoria || subcategoriasSeleccionadas.length > 0 || precioMin || precioMax;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Búsqueda */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Buscar</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => {
              const nuevaCat = e.target.value;
              setCategoria(nuevaCat);
              setSubcategoriasSeleccionadas([]);
              fetchSubcategorias(nuevaCat);
            }}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm"
          >
            <option value="">Todas</option>
            {categorias.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        {/* Precio Mín */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Precio mínimo</label>
          <input
            type="number"
            value={precioMin}
            min="0"
            max="1000000"
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || (Number(v) >= 0 && Number(v) <= 10000000)) setPrecioMin(v);
            }}
            onKeyDown={(e) => ['e', 'E', '-', '+'].includes(e.key) && e.preventDefault()}
            placeholder="$0"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm"
          />
        </div>

        {/* Precio Máx */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Precio máximo</label>
          <input
            type="number"
            value={precioMax}
            min="0"
            max="10000000"
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || (Number(v) >= 0 && Number(v) <= 10000000)) setPrecioMax(v);
            }}
            onKeyDown={(e) => ['e', 'E', '-', '+'].includes(e.key) && e.preventDefault()}
            placeholder="Sin límite"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Subcategorías como pills multiselect */}
      {subcategorias.length > 0 && (
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Subcategorías
            {subcategoriasSeleccionadas.length > 0 && (
              <span className="ml-2 text-primary-600 normal-case font-normal">
                ({subcategoriasSeleccionadas.length} seleccionada{subcategoriasSeleccionadas.length > 1 ? 's' : ''})
              </span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {subcategorias.map((sub) => {
              const seleccionada = subcategoriasSeleccionadas.includes(sub._id);
              return (
                <button
                  key={sub._id}
                  onClick={() => toggleSubcategoria(sub._id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    seleccionada
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400 hover:text-primary-600'
                  }`}
                >
                  {seleccionada && <span className="mr-1">✓</span>}
                  {sub.nombre}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer: limpiar */}
      {hayFiltrosActivos && (
        <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition"
          >
            <FiX className="text-base" />
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
