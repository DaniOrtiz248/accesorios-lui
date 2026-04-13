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
  const [subcategoria, setSubcategoria] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');

  useEffect(() => {
    fetchCategorias();
    
    if (initialFilters.categoria) setCategoria(initialFilters.categoria);
    if (initialFilters.subcategoria) setSubcategoria(initialFilters.subcategoria);
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

  // Aplicar filtros automáticamente cuando cambien (con debounce para búsqueda)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters: any = {};
      if (busqueda) filters.busqueda = busqueda;
      if (categoria) filters.categoria = categoria;
      if (subcategoria) filters.subcategoria = subcategoria;
      if (precioMin) filters.precioMin = precioMin;
      if (precioMax) filters.precioMax = precioMax;
      onFilterChange(filters);
    }, busqueda ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [busqueda, categoria, subcategoria, precioMin, precioMax]);

  const handleClearFilters = () => {
    setBusqueda('');
    setCategoria('');
    setSubcategoria('');
    setSubcategorias([]);
    setPrecioMin('');
    setPrecioMax('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => {
              const nuevaCat = e.target.value;
              setCategoria(nuevaCat);
              setSubcategoria('');
              fetchSubcategorias(nuevaCat);
            }}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todas</option>
            {categorias.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        {/* Subcategoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subcategoría</label>
          <select
            value={subcategoria}
            onChange={(e) => setSubcategoria(e.target.value)}
            disabled={!categoria || subcategorias.length === 0}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">{!categoria ? 'Selecciona categoría' : 'Todas'}</option>
            {subcategorias.map((sub) => (
              <option key={sub._id} value={sub._id}>{sub.nombre}</option>
            ))}
          </select>
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Precio (COP)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              placeholder="Mín"
              className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="number"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              placeholder="Máx"
              className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Botón Limpiar */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleClearFilters}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2"
        >
          <FiX />
          <span>Limpiar Filtros</span>
        </button>
      </div>
    </div>
  );
}
